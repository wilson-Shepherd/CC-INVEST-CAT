import FuturesOrder from "../models/FuturesOrder.js";
import FuturesContract from "../models/FuturesContract.js";
import FuturesAccount from "../models/FuturesAccount.js";
import mongoose from "mongoose";
import Decimal from "decimal.js";
import {
  logError,
  validateAccount,
  getCurrentPrice,
  getAvailableCryptosUtil,
} from "../utils/tradeUtils.js";

export const createFuturesOrder = async (req, res) => {
  const { userId } = req.params;
  const { symbol, orderType, side, leverage, quantity } = req.body;

  if (!symbol || typeof symbol !== "string") {
    return res.status(400).json({ message: "Invalid symbol" });
  }
  if (orderType !== "market") {
    return res.status(400).json({ message: "Invalid order type" });
  }
  if (side !== "buy" && side !== "sell") {
    return res.status(400).json({ message: "Invalid order side" });
  }
  if (
    leverage === null ||
    leverage === undefined ||
    isNaN(leverage) ||
    new Decimal(leverage).lessThanOrEqualTo(0)
  ) {
    return res.status(400).json({ message: "Invalid leverage" });
  }
  if (
    quantity === null ||
    quantity === undefined ||
    isNaN(quantity) ||
    new Decimal(quantity).lessThanOrEqualTo(0)
  ) {
    return res.status(400).json({ message: "Invalid quantity" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const price = new Decimal(await getCurrentPrice(symbol));

    const order = new FuturesOrder({
      userId,
      symbol,
      orderType,
      side,
      leverage: new Decimal(leverage).toNumber(),
      quantity: new Decimal(quantity).toNumber(),
      price: price.toNumber(),
    });
    await order.save({ session });

    const contractData = {
      userId,
      symbol: order.symbol,
      leverage: new Decimal(order.leverage).toNumber(),
      entryPrice: new Decimal(order.price).toNumber(),
      positionSize: new Decimal(order.quantity).toNumber(),
      margin: calculateMargin(
        new Decimal(order.quantity),
        price,
        new Decimal(order.leverage),
      ).toNumber(),
      type: order.side === "buy" ? "long" : "short",
      markPrice: new Decimal(order.price).toNumber(),
    };

    const contract = new FuturesContract(contractData);
    await contract.save({ session });

    const account = await FuturesAccount.findOne({ userId }).session(session);
    if (account) {
      account.contracts.push(contract._id);
      account.totalMarginBalance = new Decimal(account.totalMarginBalance || 0)
        .plus(contract.margin)
        .toNumber();
      validateAccount(account);
      await account.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ order, contract });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logError(error, "createFuturesOrder");
    res
      .status(500)
      .json({ error: "An error occurred while creating the order" });
  } finally {
    session.endSession();
  }
};

const calculateMargin = (quantity, price, leverage) => {
  return quantity.times(price).dividedBy(leverage);
};

export const getFuturesAccount = async (req, res) => {
  const { userId } = req.params;
  try {
    const account = await FuturesAccount.findOne({ userId }).populate(
      "contracts",
    );
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    validateAccount(account);
    res.status(200).json(account);
  } catch (error) {
    logError(error, "getFuturesAccount");
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the account" });
  }
};

export const getFuturesOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await FuturesOrder.find({ userId }).lean();
    res.status(200).json(orders);
  } catch (error) {
    logError(error, "getOrders");
    res.status(400).json({ error: error.message });
  }
};

export const getFuturesOrder = async (req, res) => {
  const { userId, orderId } = req.params;
  try {
    const order = await FuturesOrder.findOne({ _id: orderId, userId }).lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    logError(error, "getOrder");
    res.status(400).json({ error: error.message });
  }
};

export const updateFuturesOrder = async (req, res) => {
  const { userId, orderId } = req.params;
  const updateData = req.body;
  try {
    const order = await FuturesOrder.findOneAndUpdate(
      { _id: orderId, userId },
      updateData,
      { new: true },
    ).lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    logError(error, "updateFuturesOrder");
    res
      .status(500)
      .json({ error: "An error occurred while updating the order" });
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
