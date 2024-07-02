import mongoose from "mongoose";
import Decimal from "decimal.js";
import SpotOrder from "../models/SpotOrder.js";
import SpotAccount from "../models/SpotAccount.js";
import {
  logError,
  getCurrentPrice,
  TRANSACTION_FEE_RATE,
  PRICE_TOLERANCE,
  getAvailableCryptosUtil,
  validateAccount,
} from "../utils/tradeUtils.js";

export const getSpotAccount = async (req, res) => {
  const { userId } = req.params;
  try {
    const account = await SpotAccount.findOne({ userId });
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    validateAccount(account);

    const holdings = Object.fromEntries(account.holdings);

    res.status(200).json({ balance: account.balance, holdings });
  } catch (error) {
    logError(error, "getSpotAccount");
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the account" });
  }
};

export const createSpotOrder = async (req, res) => {
  const { symbol, quantity, orderType, price: limitPrice } = req.body;
  const { userId } = req.params;

  if (!symbol || !quantity || !orderType) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  if (
    quantity === null ||
    quantity === undefined ||
    isNaN(quantity) ||
    new Decimal(quantity).lessThanOrEqualTo(0)
  ) {
    return res.status(400).json({ message: "Invalid quantity" });
  }

  if (orderType.includes("limit")) {
    if (
      limitPrice === null ||
      limitPrice === undefined ||
      isNaN(limitPrice) ||
      new Decimal(limitPrice).lessThanOrEqualTo(0)
    ) {
      return res.status(400).json({ message: "Invalid limit price" });
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await SpotAccount.findOne({ userId }).session(session);
    validateAccount(account);

    const currentPrice = new Decimal(await getCurrentPrice(symbol));

    if (
      orderType.includes("limit") &&
      currentPrice
        .minus(limitPrice)
        .abs()
        .dividedBy(limitPrice)
        .greaterThan(PRICE_TOLERANCE)
    ) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Price is out of allowable range, please try again" });
    }

    const orderData = {
      userId,
      symbol,
      quantity: new Decimal(quantity).toFixed(),
      orderType,
      price: orderType.includes("limit")
        ? new Decimal(limitPrice).toFixed()
        : undefined,
      fee: 0,
      status: "pending",
      createdAt: new Date(),
    };

    const newOrder = await SpotOrder.create([orderData], { session });

    if (orderType.includes("market")) {
      await executeOrder(newOrder[0], account, currentPrice, session);
    }

    await session.commitTransaction();
    res.status(201).json(newOrder[0]);
  } catch (error) {
    await session.abortTransaction();
    logError(error, "createSpotOrder");
    res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};

export const executeOrder = async (order, account, currentPrice, session) => {
  const totalAmount = new Decimal(order.quantity).times(
    new Decimal(currentPrice || order.entryPrice || order.exitPrice),
  );
  const fee = totalAmount.times(TRANSACTION_FEE_RATE);

  try {
    if (order.orderType.startsWith("buy")) {
      if (new Decimal(account.balance).lessThan(totalAmount.plus(fee))) {
        throw new Error("Insufficient funds");
      }
      account.balance = new Decimal(account.balance)
        .minus(totalAmount.plus(fee))
        .toFixed();
      account.holdings.set(
        order.symbol,
        new Decimal(account.holdings.get(order.symbol) || 0)
          .plus(order.quantity)
          .toFixed(),
      );
      order.entryPrice = order.entryPrice || currentPrice;
    } else if (order.orderType.startsWith("sell")) {
      if (
        !account.holdings.has(order.symbol) ||
        new Decimal(account.holdings.get(order.symbol)).lessThan(order.quantity)
      ) {
        throw new Error("Insufficient assets");
      }
      const netRevenue = totalAmount.minus(fee);
      account.balance = new Decimal(account.balance).plus(netRevenue).toFixed();
      account.holdings.set(
        order.symbol,
        new Decimal(account.holdings.get(order.symbol))
          .minus(order.quantity)
          .toFixed(),
      );
      order.exitPrice = order.exitPrice || currentPrice;
      if (new Decimal(account.holdings.get(order.symbol)).equals(0)) {
        account.holdings.delete(order.symbol);
      }
    }

    await account.save({ session });

    order.status = "completed";
    order.fee = fee.toFixed();
    order.executedAt = new Date();
    await order.save({ session });
  } catch (error) {
    logError(error, "executeOrder");
    throw error;
  }
};

export const getSpotOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await SpotOrder.find({ userId }).lean();
    res.status(200).json(orders);
  } catch (error) {
    logError(error, "getOrders");
    res.status(400).json({ error: error.message });
  }
};

export const getSpotOrder = async (req, res) => {
  const { userId, orderId } = req.params;
  try {
    const order = await SpotOrder.findOne({ _id: orderId, userId }).lean();
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    logError(error, "getOrder");
    res.status(400).json({ error: error.message });
  }
};

export const getAvailableCryptos = async (req, res) => {
  try {
    const symbols = await getAvailableCryptosUtil();
    res.status(200).json(symbols);
  } catch (error) {
    logError(error, "getAvailableCryptos");
    res.status(500).json({ message: "Internal server error" });
  }
};
