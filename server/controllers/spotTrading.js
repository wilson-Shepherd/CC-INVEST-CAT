import SpotOrder from "../models/SpotOrder.js";
import SpotAccount from "../models/SpotAccount.js";
import {
  logError,
  getCurrentPrice,
  TRANSACTION_FEE_RATE,
  PRICE_TOLERANCE,
  getAvailableCryptosUtil,
  validateAccount,
  validateAmount,
} from "../utils/tradeUtils.js";
import mongoose from "mongoose";

export const getSpotAccount = async (req, res) => {
  const { userId } = req.params;
  try {
    const account = await SpotAccount.findOne({ userId }).lean();
    validateAccount(account);
    res
      .status(200)
      .json({ balance: account.balance, holdings: account.holdings });
  } catch (error) {
    logError(error, "getSpotAccount");
    res.status(400).json({ error: error.message });
  }
};

export const createSpotOrder = async (req, res) => {
  const { symbol, quantity, orderType, price: frontEndPrice } = req.body;
  const { userId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await SpotAccount.findOne({ userId }).session(session);
    validateAccount(account);

    const existingOrder = await SpotOrder.findOne({
      userId,
      symbol,
      quantity,
      orderType,
      status: "pending",
    }).session(session);
    if (existingOrder) {
      return res
        .status(400)
        .json({ message: "Duplicate order detected, please try again" });
    }

    const currentPrice = await getCurrentPrice(symbol);

    if (
      Math.abs(currentPrice - frontEndPrice) / frontEndPrice >
      PRICE_TOLERANCE
    ) {
      return res
        .status(400)
        .json({ message: "Price has changed, please try again" });
    }

    if (quantity <= 0 || currentPrice <= 0) {
      throw new Error("Invalid quantity or price");
    }

    const totalCost = quantity * currentPrice;
    const fee = totalCost * TRANSACTION_FEE_RATE;

    let newOrder = await SpotOrder.create(
      [
        {
          userId,
          symbol,
          quantity,
          orderType,
          price: currentPrice,
          fee,
          status: "pending",
          createdAt: new Date(),
        },
      ],
      { session },
    );

    await executeOrder(newOrder[0], account, session);

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

const executeOrder = async (order, account, session) => {
  const totalCost = order.quantity * order.price;
  const fee = totalCost * TRANSACTION_FEE_RATE;

  try {
    if (order.orderType === "buy") {
      if (account.balance < totalCost + fee) {
        throw new Error("Insufficient funds");
      }
      account.balance -= totalCost + fee;
      account.holdings.set(
        order.symbol,
        (account.holdings.get(order.symbol) || 0) + order.quantity,
      );
    } else if (order.orderType === "sell") {
      if (
        !account.holdings.has(order.symbol) ||
        account.holdings.get(order.symbol) < order.quantity
      ) {
        throw new Error("Insufficient assets");
      }
      const totalRevenue = totalCost - fee;
      account.balance += totalRevenue;
      account.holdings.set(
        order.symbol,
        account.holdings.get(order.symbol) - order.quantity,
      );

      if (account.holdings.get(order.symbol) === 0) {
        account.holdings.delete(order.symbol);
      }
    }

    await account.save({ session });

    order.status = "completed";
    await order.save({ session });

    console.log(
      `Order executed: User ${order.userId}, Symbol ${order.symbol}, Quantity ${order.quantity}, Order Type ${order.orderType}, Price ${order.price}, Fee ${order.fee}`,
    );
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
