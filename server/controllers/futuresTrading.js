import FuturesOrder from "../models/FuturesOrder.js";
import FuturesAccount from "../models/FuturesAccount.js";
import FuturesPosition from "../models/FuturesPosition.js";
import mongoose from "mongoose";
import {
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
  const { symbol, quantity, orderType, price: limitPrice, leverage } = req.body;
  const { userId } = req.params;

  if (isNaN(quantity) || new Decimal(quantity).lessThanOrEqualTo(0) || 
      (orderType.includes("limit") && (isNaN(limitPrice) || new Decimal(limitPrice).lessThanOrEqualTo(0)))) {
    return res.status(400).json({ message: "Invalid price or quantity" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await FuturesAccount.findOne({ userId }).session(session);
    validateAccount(account);

    const currentPrice = new Decimal(await getCurrentPrice(symbol));

    if (orderType.includes("limit") && currentPrice.minus(limitPrice).abs().dividedBy(limitPrice).greaterThan(PRICE_TOLERANCE)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Price is out of allowable range, please try again" });
    }

    const orderData = {
      userId,
      symbol,
      quantity: new Decimal(quantity).toFixed(),
      orderType,
      price: orderType.includes("limit") ? new Decimal(limitPrice).toFixed() : undefined,
      leverage,
      fee: 0,
      status: "pending",
      createdAt: new Date(),
    };

    let newOrder = await FuturesOrder.create([orderData], { session });

    if (orderType.includes("market")) {
      await executeOrder(newOrder[0], account, currentPrice, session);
    }

    await session.commitTransaction();
    res.status(201).json(newOrder[0]);
  } catch (error) {
    await session.abortTransaction();
    logError(error, "createFuturesOrder");
    res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};

export const executeOrder = async (order, account, currentPrice, session) => {
  const totalAmount = new Decimal(order.quantity).times(currentPrice || order.entryPrice || order.exitPrice);
  const fee = totalAmount.times(TRANSACTION_FEE_RATE);

  try {
    if (order.orderType.startsWith("buy")) {
      if (new Decimal(account.balance).lessThan(totalAmount.plus(fee))) {
        throw new Error("Insufficient funds");
      }
      account.balance = new Decimal(account.balance).minus(totalAmount.plus(fee)).toFixed();
      account.holdings.set(order.symbol, new Decimal(account.holdings.get(order.symbol) || 0).plus(order.quantity).toFixed());
      order.entryPrice = order.entryPrice || currentPrice || totalAmount.dividedBy(order.quantity).toFixed();
    } else if (order.orderType.startsWith("sell")) {
      if (!account.holdings.has(order.symbol) || new Decimal(account.holdings.get(order.symbol)).lessThan(order.quantity)) {
        throw new Error("Insufficient assets");
      }
      const netRevenue = totalAmount.minus(fee);
      account.balance = new Decimal(account.balance).plus(netRevenue).toFixed();
      account.holdings.set(order.symbol, new Decimal(account.holdings.get(order.symbol)).minus(order.quantity).toFixed());
      order.exitPrice = order.exitPrice || currentPrice || totalAmount.dividedBy(order.quantity).toFixed();
      if (new Decimal(account.holdings.get(order.symbol)).equals(0)) {
        account.holdings.delete(order.symbol);
      }
    }

    await account.save({ session });

    order.status = "completed";
    order.fee = fee.toFixed();
    order.executedAt = new Date();
    await order.save({ session });

    console.log(`Order executed: User ${order.userId}, Symbol ${order.symbol}, Quantity ${order.quantity}, Order Type ${order.orderType}, Entry Price ${order.entryPrice}, Exit Price ${order.exitPrice}, Fee ${order.fee}, Executed At ${order.executedAt}`);
  } catch (error) {
    logError(error, "executeOrder");
    throw error;
  }
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
        const currentPrice = new Decimal(await getCurrentPrice(position.symbol));
        const unrealizedPnL = currentPrice.minus(position.entryPrice)
                                          .times(position.quantity)
                                          .times(position.leverage)
                                          .toFixed();
        return {
          ...position,
          currentPrice: currentPrice.toFixed(),
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

    const currentPrice = new Decimal(await getCurrentPrice(position.symbol));
    const totalRevenue = currentPrice.times(position.quantity).dividedBy(position.leverage);
    const fee = totalRevenue.times(TRANSACTION_FEE_RATE);

    account.balance = new Decimal(account.balance).plus(totalRevenue).minus(fee).toFixed();

    await FuturesPosition.deleteOne({ _id: positionId, userId }).session(session);

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

    position.leverage = new Decimal(leverage).toFixed();
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
