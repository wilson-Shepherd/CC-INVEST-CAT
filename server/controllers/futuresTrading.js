import FuturesOrder from "../models/FuturesOrder.js";
import FuturesAccount from "../models/FuturesAccount.js";
import FuturesPosition from "../models/FuturesPosition.js";
import mongoose from "mongoose";
import {
  validateAmount,
  validateAccount,
  logError,
  getCurrentPrice,
  TRANSACTION_FEE_RATE,
  getAvailableCryptosUtil,
} from "../utils/tradeUtils.js";

export const getFuturesAccount = async (req, res) => {
  const { userId } = req.params;
  try {
    const account = await FuturesAccount.findOne({ userId })
      .populate("positions")
      .lean();
    validateAccount(account);
    res
      .status(200)
      .json({ balance: account.balance, positions: account.positions });
  } catch (error) {
    logError(error, "getFuturesAccount", { userId });
    res.status(400).json({ error: error.message });
  }
};

export const createFuturesOrder = async (req, res) => {
  const { symbol, quantity, orderType, price, leverage } = req.body;
  const { userId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await FuturesAccount.findOne({ userId }).session(session);
    if (!account) {
      throw new Error("Account not found");
    }

    const currentPrice = await getCurrentPrice(symbol);
    if (orderType.includes("limit") && (price <= 0 || isNaN(price))) {
      throw new Error("Invalid price for limit order");
    }

    const orderPrice = orderType.includes("limit") ? price : currentPrice;
    const totalCost = (quantity * orderPrice) / leverage;
    const fee = totalCost * TRANSACTION_FEE_RATE;

    if (orderType.startsWith("buy")) {
      if (account.balance < totalCost + fee) {
        throw new Error("Insufficient funds");
      }
    }

    const order = new FuturesOrder({
      userId,
      symbol,
      quantity,
      orderType,
      price: orderPrice,
      leverage,
      fee,
      status: orderType.includes("limit") ? "pending" : "completed",
    });
    await order.save({ session });

    if (!orderType.includes("limit")) {
      await executeOrder(order, account, session);
    }

    await account.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logError(error, "createFuturesOrder");
    res.status(400).json({ message: error.message });
  }
};

const executeOrder = async (order, account, session) => {
  const totalCost = (order.quantity * order.price) / order.leverage;
  const fee = totalCost * TRANSACTION_FEE_RATE;
  const positionType = order.orderType.startsWith("buy") ? "long" : "short";

  let position = await FuturesPosition.findOne({
    userId: order.userId,
    symbol: order.symbol,
  });

  if (order.orderType === "buy-market" || order.orderType === "buy-limit") {
    if (account.balance < totalCost + fee) {
      throw new Error("Insufficient funds");
    }
    account.balance -= totalCost + fee;

    if (!position) {
      position = new FuturesPosition({
        userId: order.userId,
        symbol: order.symbol,
        quantity: order.quantity,
        leverage: order.leverage,
        entryPrice: order.price,
        positionType,
      });
    } else {
      position.entryPrice =
        (position.entryPrice * position.quantity +
          order.price * order.quantity) /
        (position.quantity + order.quantity);
      position.quantity += order.quantity;
    }
  } else if (
    order.orderType === "sell-market" ||
    order.orderType === "sell-limit"
  ) {
    if (!position) {
      position = new FuturesPosition({
        userId: order.userId,
        symbol: order.symbol,
        quantity: order.quantity,
        leverage: order.leverage,
        entryPrice: order.price,
        positionType,
      });
    } else if (position.positionType === "short") {
      position.entryPrice =
        (position.entryPrice * position.quantity +
          order.price * order.quantity) /
        (position.quantity + order.quantity);
      position.quantity += order.quantity;
    } else if (position.positionType === "long") {
      if (position.quantity < order.quantity) {
        throw new Error("Insufficient assets to sell");
      }
      const totalRevenue = totalCost - fee;
      account.balance += totalRevenue;
      position.quantity -= order.quantity;
      if (position.quantity === 0) {
        await FuturesPosition.deleteOne({
          userId: order.userId,
          symbol: order.symbol,
        }).session(session);
      } else {
        position.entryPrice =
          (position.entryPrice * position.quantity -
            order.price * order.quantity) /
          position.quantity;
      }
    }
  }

  await position.save({ session });

  order.status = "completed";
  await order.save({ session });

  console.log(
    `Order executed: User ${order.userId}, Symbol ${order.symbol}, Quantity ${order.quantity}, Order Type ${order.orderType}, Price ${order.price}, Fee ${order.fee}`,
  );
};

export const getFuturesOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await FuturesOrder.find({ userId }).lean();
    res.status(200).json(orders);
  } catch (error) {
    logError(error, "getFuturesOrders", { userId });
    res.status(400).json({ error: error.message });
  }
};

export const getFuturesOrder = async (req, res) => {
  const { userId, orderId } = req.params;
  try {
    const order = await FuturesOrder.findOne({ _id: orderId, userId }).lean();
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    logError(error, "getFuturesOrder", { userId, orderId });
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

export const getPositions = async (req, res) => {
  const { userId } = req.params;
  try {
    const positions = await FuturesPosition.find({ userId }).lean();

    const positionsWithCurrentPrice = await Promise.all(
      positions.map(async (position) => {
        const currentPrice = await getCurrentPrice(position.symbol);
        const unrealizedPnL =
          (currentPrice - position.entryPrice) *
          position.quantity *
          position.leverage;
        return {
          ...position,
          currentPrice,
          unrealizedPnL,
        };
      }),
    );

    res.status(200).json(positionsWithCurrentPrice);
  } catch (error) {
    logError(error, "getPositions", { userId });
    res.status(400).json({ error: error.message });
  }
};

export const closePosition = async (req, res) => {
  const { userId, positionId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const position = await FuturesPosition.findOne({
      _id: positionId,
      userId,
    }).session(session);
    if (!position) {
      throw new Error("Position not found");
    }

    const account = await FuturesAccount.findOne({ userId }).session(session);
    if (!account) {
      throw new Error("Account not found");
    }

    const currentPrice = await getCurrentPrice(position.symbol);
    const totalRevenue = (position.quantity * currentPrice) / position.leverage;
    const fee = totalRevenue * TRANSACTION_FEE_RATE;

    account.balance += totalRevenue - fee;

    await FuturesPosition.deleteOne({ _id: positionId, userId }).session(
      session,
    );

    await account.save({ session });

    await session.commitTransaction();
    res.status(200).json({ message: "Position closed successfully" });
  } catch (error) {
    await session.abortTransaction();
    logError(error, "closePosition", { userId, positionId });
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

export const adjustLeverage = async (req, res) => {
  const { userId, positionId } = req.params;
  const { leverage } = req.body;

  try {
    const position = await FuturesPosition.findOne({ _id: positionId, userId });
    validateAccount(position);

    if (leverage < 1 || leverage > 100) {
      throw new Error("Invalid leverage value");
    }

    position.leverage = leverage;
    await position.save();

    res.status(200).json({ message: "Leverage updated successfully" });
  } catch (error) {
    logError(error, "adjustLeverage", { userId, positionId, leverage });
    res.status(400).json({ error: error.message });
  }
};

export const calculateUserRiskRate = async (userId) => {
  const account = await FuturesAccount.findOne({ userId });
  const positions = await FuturesPosition.find({ userId }).lean();
  const currentPrices = await getCurrentPrices(positions.map((p) => p.symbol));

  const riskRate = calculateRiskRate(account, positions, currentPrices);
  return { riskRate, balance: account.balance };
};

export const checkRiskRate = async (req, res) => {
  const { userId } = req.params;

  try {
    const account = await FuturesAccount.findOne({ userId });
    const positions = await FuturesPosition.find({ userId }).lean();
    const currentPrices = await getCurrentPrices(
      positions.map((p) => p.symbol),
    );

    const riskRate = calculateRiskRate(account, positions, currentPrices);

    res.status(200).json({ riskRate, balance: account.balance });
  } catch (error) {
    logError(error, "checkRiskRate", { userId });
    res.status(500).json({ error: error.message });
  }
};

export const calculateRiskRate = (account, positions, currentPrices) => {
  let totalAssets = account.balance;
  let totalLiabilities = 0;

  positions.forEach((position) => {
    const currentPrice = currentPrices[position.symbol];
    const positionValue =
      (position.quantity * currentPrice) / position.leverage;
    totalAssets += positionValue;
    if (position.entryPrice > currentPrice) {
      totalLiabilities +=
        (position.entryPrice - currentPrice) * position.quantity;
    }
  });

  return totalLiabilities / totalAssets;
};

export const getCurrentPrices = async (symbols) => {
  const prices = {};
  for (const symbol of symbols) {
    prices[symbol] = await getCurrentPrice(symbol);
  }
  return prices;
};
