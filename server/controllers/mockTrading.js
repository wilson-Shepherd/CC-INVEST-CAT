import MockOrder from "../models/mockOrder.js";
import MockAccount from "../models/mockAccount.js";
import mongoose from 'mongoose';
import axios from "axios";
import cron from 'node-cron';

const TRANSACTION_FEE_RATE = 0.001;
const PRICE_TOLERANCE = 0.01;
const ORDER_EXPIRY_DAYS = 30;

const logError = (error, context) => {
  console.error(`Error in ${context}:`, error);
};

const validateAmount = (amount) => {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
};

const validateAccount = (account) => {
  if (!account) {
    throw new Error("Account not found");
  }
};

export const getMockAccount = async (req, res) => {
  const { userId } = req.params;
  try {
    const account = await MockAccount.findOne({ userId }).lean();
    validateAccount(account);
    res.status(200).json({ cash: account.cash, holdings: account.holdings });
  } catch (error) {
    logError(error, 'getMockAccount');
    res.status(400).json({ error: error.message });
  }
};

export const depositFunds = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;
  try {
    const account = await MockAccount.findOne({ userId });
    validateAccount(account);
    validateAmount(amount);
    await account.deposit(amount);
    res.status(200).json({ message: "Funds deposited successfully" });
  } catch (error) {
    logError(error, 'depositFunds');
    res.status(400).json({ error: error.message });
  }
};

export const withdrawFunds = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;
  try {
    const account = await MockAccount.findOne({ userId });
    validateAccount(account);
    validateAmount(amount);
    await account.withdraw(amount);
    res.status(200).json({ message: "Funds withdrawn successfully" });
  } catch (error) {
    logError(error, 'withdrawFunds');
    res.status(400).json({ error: error.message });
  }
};

export const createOrder = async (req, res) => {
  const { symbol, quantity, orderType, price: frontEndPrice } = req.body;
  const { userId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await MockAccount.findOne({ userId }).session(session);
    validateAccount(account);

    const existingOrder = await MockOrder.findOne({ userId, symbol, quantity, orderType, status: "pending" }).session(session);
    if (existingOrder) {
      return res.status(400).json({ message: "Duplicate order detected, please try again" });
    }

    const currentPrice = await getCurrentPrice(symbol);

    if (Math.abs(currentPrice - frontEndPrice) / frontEndPrice > PRICE_TOLERANCE) {
      return res.status(400).json({ message: "Price has changed, please try again" });
    }

    if (quantity <= 0 || currentPrice <= 0) {
      throw new Error("Invalid quantity or price");
    }

    const totalCost = quantity * currentPrice;
    const fee = totalCost * TRANSACTION_FEE_RATE;

    let newOrder = await MockOrder.create([{ userId, symbol, quantity, orderType, price: currentPrice, fee, status: "pending", createdAt: new Date() }], { session });

    await executeOrder(newOrder[0], account, session);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(newOrder[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logError(error, 'createOrder');
    res.status(500).json({ message: "Internal server error" });
  }
};

const executeOrder = async (order, account, session) => {
  const totalCost = order.quantity * order.price;
  const fee = totalCost * TRANSACTION_FEE_RATE;

  try {
    if (order.orderType === "buy") {
      if (account.cash < (totalCost + fee)) {
        throw new Error("Insufficient funds");
      }
      account.cash -= (totalCost + fee);
      account.holdings.set(order.symbol, (account.holdings.get(order.symbol) || 0) + order.quantity);
    } else if (order.orderType === "sell") {
      if (!account.holdings.has(order.symbol) || account.holdings.get(order.symbol) < order.quantity) {
        throw new Error("Insufficient assets");
      }
      const totalRevenue = totalCost - fee;
      account.cash += totalRevenue;
      account.holdings.set(order.symbol, account.holdings.get(order.symbol) - order.quantity);

      if (account.holdings.get(order.symbol) === 0) {
        account.holdings.delete(order.symbol);
      }
    }

    await account.save({ session });

    order.status = "completed";
    await order.save({ session });

    console.log(`Order executed: User ${order.userId}, Symbol ${order.symbol}, Quantity ${order.quantity}, Order Type ${order.orderType}, Price ${order.price}, Fee ${order.fee}`);
  } catch (error) {
    logError(error, 'executeOrder');
    throw error;
  }
};

async function getCurrentPrice(symbol) {
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    return parseFloat(response.data.price);
  } catch (error) {
    logError(error, 'getCurrentPrice');
    throw new Error("Failed to fetch current price");
  }
}

export const getOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await MockOrder.find({ userId }).lean();
    res.status(200).json(orders);
  } catch (error) {
    logError(error, 'getOrders');
    res.status(400).json({ error: error.message });
  }
};

export const getOrder = async (req, res) => {
  const { userId, orderId } = req.params;
  try {
    const order = await MockOrder.findOne({ _id: orderId, userId }).lean();
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    logError(error, 'getOrder');
    res.status(400).json({ error: error.message });
  }
};

export const getAvailableCryptos = async (req, res) => {
  try {
    const response = await axios.get("https://api.binance.com/api/v3/exchangeInfo");
    const symbols = response.data.symbols.map((symbol) => symbol.symbol);
    res.status(200).json(symbols);
  } catch (error) {
    logError(error, 'getAvailableCryptos');
    res.status(500).json({ message: "Internal server error" });
  }
};

export const cleanUpExpiredOrders = async () => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() - ORDER_EXPIRY_DAYS);

  try {
    const result = await MockOrder.deleteMany({ createdAt: { $lt: expiryDate } });
    console.log(`Deleted ${result.deletedCount} expired orders.`);
  } catch (error) {
    logError(error, 'cleanUpExpiredOrders');
  }
};

cron.schedule('0 2 * * *', cleanUpExpiredOrders);
