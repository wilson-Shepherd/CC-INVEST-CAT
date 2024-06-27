import mongoose from "mongoose";
import cron from "node-cron";
import {
  getCurrentPrice,
  logError,
  TRANSACTION_FEE_RATE,
  MARGIN_RATE,
} from "../utils/tradeUtils.js";
import FuturesOrder from "../models/FuturesOrder.js";
import SpotOrder from "../models/SpotOrder.js";
import FuturesAccount from "../models/FuturesAccount.js";
import SpotAccount from "../models/SpotAccount.js";
import FuturesPosition from "../models/FuturesPosition.js";
import { executeOrder as executeSpotOrder} from "../controllers/spotTrading.js";
import { executeOrder as executeFuturesOrder ,calculateUserRiskRate } from "../controllers/futuresTrading.js";

export const executePendingOrders = async (OrderModel, AccountModel, executeOrderFunction) => {
  try {
    const pendingOrders = await OrderModel.find({ status: "pending" });

    for (let order of pendingOrders) {
      const currentPrice = await getCurrentPrice(order.symbol);

      if (
        (order.orderType === "buy-limit" && currentPrice <= order.price) ||
        (order.orderType === "sell-limit" && currentPrice >= order.price)
      ) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          const account = await AccountModel.findOne({ userId: order.userId }).session(session);
          if (!account) {
            throw new Error(`Account not found for user ${order.userId}`);
          }

          if (order.orderType.startsWith("sell")) {
            const holdings = new Decimal(account.holdings.get(order.symbol) || 0);
            if (holdings.lessThan(order.quantity)) {
              await session.abortTransaction();
              logError(new Error("Insufficient assets to sell"), "executePendingOrders", {
                orderId: order._id,
                userId: order.userId,
              });
              continue;
            }
          }

          if (order.orderType.startsWith("buy")) {
            order.entryPrice = currentPrice;
          } else if (order.orderType.startsWith("sell")) {
            order.exitPrice = currentPrice;
          }
          order.executedAt = new Date();

          await executeOrderFunction(order, account, currentPrice, session);

          await account.save({ session });
          await session.commitTransaction();
        } catch (error) {
          await session.abortTransaction();
          logError(error, "executePendingOrders", {
            orderId: order._id,
            userId: order.userId,
          });
        } finally {
          session.endSession();
        }
      }
    }
  } catch (error) {
    logError(error, "executePendingOrders");
  }
};

export const monitorMargin = async () => {
  const users = await FuturesAccount.find().lean();
  for (const user of users) {
    try {
      const positions = await FuturesPosition.find({ userId: user.userId });
      for (const position of positions) {
        const currentPrice = await getCurrentPrice(position.symbol);
        const totalCost =
          (position.quantity * currentPrice) / position.leverage;
        const margin = totalCost * MARGIN_RATE;
        if (user.balance < margin) {
          await forceClosePosition(position, user);
        }
      }
    } catch (error) {
      logError(error, "monitorMargin", { userId: user.userId });
    }
  }
};

const forceClosePosition = async (position, user) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const currentPrice = await getCurrentPrice(position.symbol);
    const totalCost = (position.quantity * currentPrice) / position.leverage;
    const fee = totalCost * TRANSACTION_FEE_RATE;

    let totalRevenue;
    if (position.positionType === "long") {
      totalRevenue = totalCost - fee;
    } else {
      totalRevenue = totalCost + fee;
    }

    user.balance += totalRevenue;

    await FuturesPosition.deleteOne({ _id: position._id }).session(session);
    await FuturesAccount.updateOne(
      { _id: user._id },
      { balance: user.balance },
    ).session(session);

    await session.commitTransaction();
    console.log(
      `Forced close position: User ${position.userId}, Symbol ${position.symbol}, Quantity ${position.quantity}, Position Type ${position.positionType}, Current Price ${currentPrice}, Fee ${fee}`,
    );
  } catch (error) {
    await session.abortTransaction();
    logError(error, "forceClosePosition", { userId: position.userId });
  } finally {
    session.endSession();
  }
};

export const monitorRiskRates = async () => {
  const users = await FuturesAccount.find().lean();
  for (const user of users) {
    try {
      const { riskRate, balance } = await calculateUserRiskRate(user.userId);
      console.log(
        `User ${user.userId} - Risk Rate: ${riskRate}, Balance: ${balance}`,
      );
    } catch (error) {
      logError(error, "monitorRiskRates", { userId: user.userId });
    }
  }
};

cron.schedule("*/5 * * * *", () =>
  executePendingOrders(FuturesOrder, FuturesAccount, executeFuturesOrder),
);
cron.schedule("*/1 * * * *", () =>
  executePendingOrders(SpotOrder, SpotAccount, executeSpotOrder),
);
cron.schedule("0 * * * *", () => monitorMargin());
cron.schedule("0 * * * *", () => monitorRiskRates());
