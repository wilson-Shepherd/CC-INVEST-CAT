import mongoose from "mongoose";
import cron from "node-cron";
import {
  getCurrentPrice,
  logError,
} from "../utils/tradeUtils.js";
import FuturesOrder from "../models/FuturesOrder.js";
import SpotOrder from "../models/SpotOrder.js";
import FuturesAccount from "../models/FuturesAccount.js";
import SpotAccount from "../models/SpotAccount.js";
import { executeOrder as executeSpotOrder} from "../controllers/spotTrading.js";
import { executeOrder as executeFuturesOrder } from "../controllers/futuresTrading.js";

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

cron.schedule("*/1 * * * *", () =>
  executePendingOrders(FuturesOrder, FuturesAccount, executeFuturesOrder),
);

cron.schedule("*/1 * * * *", () =>
  executePendingOrders(SpotOrder, SpotAccount, executeSpotOrder),
);
