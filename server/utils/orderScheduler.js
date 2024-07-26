import mongoose from "mongoose";
import cron from "node-cron";
import Decimal from "decimal.js";
import {
  getCurrentPrice,
  logError,
  validateAccount,
} from "../utils/tradeUtils.js";
import SpotOrder from "../models/Spot/Order.js";
import SpotAccount from "../models/Spot/Account.js";
import { executeOrder as executeSpotOrder } from "../controllers/spot/order.js";
import FuturesContract from "../models/Futures/Contract.js";
import FuturesAccount from "../models/Spot/Account.js";

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
      const leverage = new Decimal(contract.leverage);

      const unrealizedPnl = currentPrice
        .minus(entryPrice)
        .times(positionSize)
        .times(contract.type === "long" ? 1 : -1);

      const initialMargin = positionSize.times(entryPrice).dividedBy(leverage);
      const currentEquity = new Decimal(contract.margin).plus(unrealizedPnl);
      const currentMarginRatio = currentEquity
        .dividedBy(initialMargin)
        .times(100);

      const liquidationThreshold = new Decimal(50);

      if (currentMarginRatio.lessThan(liquidationThreshold)) {
        const closingPrice = currentPrice.toNumber();
        const closingAmount = positionSize.toNumber();

        const pnl = unrealizedPnl.toNumber();

        account.balance = new Decimal(account.balance)
          .plus(pnl)
          .plus(contract.margin)
          .toNumber();

        account.totalMarginBalance = new Decimal(account.totalMarginBalance)
          .minus(contract.margin)
          .toNumber();

        account.contracts.pull(contract._id);

        const closeOrder = new FuturesOrder({
          userId: contract.userId,
          symbol: contract.symbol,
          orderType: "market",
          side: contract.type === "long" ? "sell" : "buy",
          quantity: closingAmount,
          price: closingPrice,
          status: "executed",
          executedAt: new Date(),
        });
        await closeOrder.save({ session });

        await contract.remove({ session });

        validateAccount(account);
        await account.save({ session });
      }
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logError(error, "executeLiquidation");
  } finally {
    session.endSession();
  }
};

cron.schedule("0 * * * *", executeLiquidation);