import mongoose from "mongoose";
import cron from "node-cron";
import Decimal from "decimal.js";
import {
  getCurrentPrice,
  logError,
  validateAccount,
} from "../utils/tradeUtils.js";
import SpotOrder from "../models/SpotOrder.js";
import SpotAccount from "../models/SpotAccount.js";
import { executeOrder as executeSpotOrder } from "../controllers/spotTrading.js";
import FuturesContract from "../models/FuturesContract.js";
import FuturesAccount from "../models/SpotAccount.js";

export const executePendingOrders = async (
  OrderModel,
  AccountModel,
  executeOrderFunction,
) => {
  try {
    const pendingOrders = await OrderModel.find({ status: "pending" });

    for (const order of pendingOrders) {
      const currentPrice = new Decimal(await getCurrentPrice(order.symbol));

      if (
        (order.orderType === "buy-limit" &&
          currentPrice.lessThanOrEqualTo(order.price)) ||
        (order.orderType === "sell-limit" &&
          currentPrice.greaterThanOrEqualTo(order.price))
      ) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          const account = await AccountModel.findOne({
            userId: order.userId,
          }).session(session);
          if (!account) {
            throw new Error(`Account not found for user ${order.userId}`);
          }

          let canExecuteOrder = true;

          if (order.orderType.startsWith("buy")) {
            const requiredFunds = new Decimal(order.quantity).mul(currentPrice);
            if (new Decimal(account.balance).lessThan(requiredFunds)) {
              canExecuteOrder = false;
            }
          }

          if (order.orderType.startsWith("sell")) {
            const holdings = new Decimal(
              account.holdings.get(order.symbol) || 0,
            );
            if (holdings.lessThan(order.quantity)) {
              canExecuteOrder = false;
            }
          }

          if (canExecuteOrder) {
            if (order.orderType.startsWith("buy")) {
              order.entryPrice = currentPrice.toNumber();
            } else if (order.orderType.startsWith("sell")) {
              order.exitPrice = currentPrice.toNumber();
            }
            order.executedAt = new Date();

            await executeOrderFunction(order, account, currentPrice, session);

            await account.save({ session });
            await session.commitTransaction();
          } else {
            await session.abortTransaction();
          }
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
  executePendingOrders(SpotOrder, SpotAccount, executeSpotOrder),
);

export const executeLiquidation = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const contracts = await FuturesContract.find({}).session(session);

    for (const contract of contracts) {
      const account = await FuturesAccount.findOne({
        userId: contract.userId,
      }).session(session);
      if (!account) {
        continue;
      }

      const currentPrice = new Decimal(await getCurrentPrice(contract.symbol));
      const entryPrice = new Decimal(contract.entryPrice);
      const positionSize = new Decimal(contract.positionSize);
      const pnl = currentPrice
        .minus(entryPrice)
        .times(positionSize)
        .times(contract.type === "long" ? 1 : -1);
      const totalBalance = new Decimal(account.balance).plus(pnl);

      if (totalBalance.lessThan(contract.margin)) {
        account.balance = new Decimal(account.balance)
          .plus(pnl)
          .minus(new Decimal(contract.margin))
          .toNumber();
        account.totalMarginBalance = new Decimal(account.totalMarginBalance)
          .minus(new Decimal(contract.margin))
          .toNumber();
        account.contracts.pull(contract._id);

        await contract.remove({ session });
        validateAccount(account);
        await account.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logError(error, "executeLiquidation");
  } finally {
    session.endSession();
  }
};

cron.schedule("0 * * * *", executeLiquidation);
