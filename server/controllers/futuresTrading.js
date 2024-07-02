import mongoose from "mongoose";
import Decimal from "decimal.js";
import FuturesOrder from "../models/FuturesOrder.js";
import FuturesAccount from "../models/FuturesAccount.js";
import FuturesPosition from "../models/FuturesPosition.js";
import {
  logError,
  getCurrentPrice,
  TRANSACTION_FEE_RATE,
  PRICE_TOLERANCE,
  INITIAL_MARGIN_RATIOS,
  FINANCING_RATE,
  LIQUIDATION_THRESHOLD,
  getAvailableCryptosUtil,
  calculateInitialMargin,
  calculateMaintenanceMargin,
} from "../utils/tradeUtils.js";

export const getFuturesAccount = async (req, res) => {
  const { userId } = req.params;
  try {
    const account = await FuturesAccount.findOne({ userId })
      .lean()
      .populate("positions");
    if (!account) throw new Error("Account not found");

    res.status(200).json(account);
  } catch (error) {
    logError(error, "getFuturesAccount", { userId });
    res.status(400).json({ error: error.message });
  }
};

export const createFuturesOrder = async (req, res) => {
  const { symbol, quantity, orderType, price: limitPrice, leverage } = req.body;
  const { userId } = req.params;

  const allowedLeverages = Object.keys(INITIAL_MARGIN_RATIOS).map(Number);

  if (!allowedLeverages.includes(leverage)) {
    return res.status(400).json({
      message: `Invalid leverage. Allowed values are ${allowedLeverages.join(", ")}.`,
    });
  }

  if (
    isNaN(quantity) ||
    new Decimal(quantity).lessThanOrEqualTo(0) ||
    (orderType.includes("limit") &&
      (isNaN(limitPrice) || new Decimal(limitPrice).lessThanOrEqualTo(0)))
  ) {
    return res.status(400).json({ message: "Invalid price or quantity" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await FuturesAccount.findOne({ userId }).session(session);
    if (!account) throw new Error("Account not found");

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

    const totalAmount = new Decimal(quantity).times(currentPrice);
    const initialMargin = calculateInitialMargin(totalAmount, leverage);
    const maintenanceMargin = calculateMaintenanceMargin(initialMargin);

    const orderData = {
      userId,
      symbol,
      quantity: new Decimal(quantity).toFixed(),
      orderType,
      price: orderType.includes("limit")
        ? new Decimal(limitPrice).toFixed()
        : undefined,
      leverage,
      fee: 0,
      status: "pending",
      createdAt: new Date(),
    };

    const newOrder = await FuturesOrder.create([orderData], { session });

    if (orderType.includes("market")) {
      await executeOrder(
        newOrder[0],
        account,
        currentPrice,
        initialMargin,
        maintenanceMargin,
        session,
      );
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

export const executeOrder = async (
  order,
  account,
  currentPrice,
  initialMargin,
  maintenanceMargin,
  session,
) => {
  const totalAmount = new Decimal(order.quantity).times(currentPrice);
  const fee = totalAmount.times(TRANSACTION_FEE_RATE).times(order.leverage);

  try {
    if (!account.positions) {
      account.positions = [];
    }

    if (order.orderType === "buy-market" || order.orderType === "buy-limit") {
      if (new Decimal(account.balance).lessThan(initialMargin.plus(fee))) {
        throw new Error("Insufficient funds");
      }
      account.balance = new Decimal(account.balance)
        .minus(initialMargin.plus(fee))
        .toFixed();
      account.usedMargin = new Decimal(account.usedMargin)
        .plus(initialMargin)
        .toFixed();
      const newPosition = {
        userId: order.userId,
        symbol: order.symbol,
        quantity: order.quantity,
        entryPrice: currentPrice.toFixed(),
        leverage: order.leverage,
        positionType: "long",
        initialMargin: initialMargin.toFixed(),
        maintenanceMargin: maintenanceMargin.toFixed(),
        createdAt: new Date(),
      };
      const position = new FuturesPosition(newPosition);
      account.positions.push(position._id);
      await position.save({ session });
      order.entryPrice = currentPrice.toFixed();
    } else if (
      order.orderType === "sell-market" ||
      order.orderType === "sell-limit"
    ) {
      let position = await FuturesPosition.findOne({
        userId: order.userId,
        symbol: order.symbol,
      }).session(session);
      const isExistingPosition = !!position;

      if (!isExistingPosition) {
        if (new Decimal(account.balance).lessThan(initialMargin.plus(fee))) {
          throw new Error("Insufficient funds to open short position");
        }
        account.balance = new Decimal(account.balance)
          .minus(initialMargin.plus(fee))
          .toFixed();
        account.usedMargin = new Decimal(account.usedMargin)
          .plus(initialMargin)
          .toFixed();
        position = new FuturesPosition({
          userId: order.userId,
          symbol: order.symbol,
          quantity: order.quantity,
          entryPrice: currentPrice.toFixed(),
          leverage: order.leverage,
          positionType: "short",
          initialMargin: initialMargin.toFixed(),
          maintenanceMargin: maintenanceMargin.toFixed(),
          createdAt: new Date(),
        });
        account.positions.push(position._id);
        await position.save({ session });
      } else {
        if (new Decimal(position.quantity).lessThan(order.quantity)) {
          throw new Error("Insufficient assets to close position");
        }
        const netRevenue = totalAmount.minus(fee);
        account.balance = new Decimal(account.balance)
          .plus(netRevenue)
          .toFixed();
        order.exitPrice = currentPrice.toFixed();
        if (new Decimal(position.quantity).equals(order.quantity)) {
          await position.remove({ session });
          account.positions.pull(position._id);
          account.usedMargin = new Decimal(account.usedMargin)
            .minus(position.initialMargin)
            .toFixed();
        } else {
          position.quantity = new Decimal(position.quantity)
            .minus(order.quantity)
            .toFixed();
          await position.save({ session });
        }
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
    if (!order) throw new Error("Order not found");
    res.status(200).json(order);
  } catch (error) {
    logError(error, "getFuturesOrder", { userId, orderId });
    res.status(400).json({ error: error.message });
  }
};

export const getPositions = async (req, res) => {
  const { userId } = req.params;
  try {
    const positions = await FuturesPosition.find({ userId }).lean();

    const positionsWithCurrentPrice = await Promise.all(
      positions.map(async (position) => {
        const currentPrice = new Decimal(
          await getCurrentPrice(position.symbol),
        );
        const unrealizedPnL = calculateUnrealizedPnL(position, currentPrice);
        return {
          ...position,
          currentPrice: currentPrice.toFixed(),
          unrealizedPnL: new Decimal(unrealizedPnL).toFixed(),
        };
      }),
    );

    res.status(200).json(positionsWithCurrentPrice);
  } catch (error) {
    logError(error, "getPositions", { userId });
    res.status(400).json({ error: error.message });
  }
};

const calculateUnrealizedPnL = (position, currentPrice) => {
  const entryFee = new Decimal(position.entryPrice)
    .times(position.quantity)
    .times(position.leverage)
    .times(TRANSACTION_FEE_RATE);

  let unrealizedPnL;
  if (position.positionType === "long") {
    unrealizedPnL = new Decimal(currentPrice)
      .minus(position.entryPrice)
      .times(position.quantity)
      .times(position.leverage)
      .minus(entryFee);
  } else if (position.positionType === "short") {
    unrealizedPnL = new Decimal(position.entryPrice)
      .minus(currentPrice)
      .times(position.quantity)
      .times(position.leverage)
      .minus(entryFee);
  }
  return unrealizedPnL.toFixed();
};

const forceClosePosition = async (position, user) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const currentPrice = new Decimal(await getCurrentPrice(position.symbol));
    const totalCost = new Decimal(position.quantity).times(currentPrice);
    const fee = totalCost.times(TRANSACTION_FEE_RATE);

    let totalRevenue;
    if (position.positionType === "long") {
      totalRevenue = totalCost.minus(fee);
    } else {
      totalRevenue = totalCost.plus(fee);
    }

    user.balance = new Decimal(user.balance).plus(totalRevenue).toFixed();

    await FuturesPosition.deleteOne({ _id: position._id }).session(session);
    await FuturesAccount.updateOne(
      { _id: user._id },
      { balance: user.balance },
    ).session(session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logError(error, "forceClosePosition", { userId: position.userId });
  } finally {
    session.endSession();
  }
};

export const monitorMargin = async () => {
  const users = await FuturesAccount.find().lean();
  for (const user of users) {
    try {
      const positions = await FuturesPosition.find({ userId: user.userId });
      for (const position of positions) {
        const currentPrice = await getCurrentPrice(position.symbol);
        const totalCost = new Decimal(position.quantity).times(currentPrice);
        const initialMargin = calculateInitialMargin(
          totalCost,
          position.leverage,
        );
        const maintenanceMargin = calculateMaintenanceMargin(initialMargin);
        const financingFee = totalCost.times(FINANCING_RATE).dividedBy(365);

        user.balance = new Decimal(user.balance).minus(financingFee).toFixed();

        if (
          new Decimal(user.balance).lessThan(
            maintenanceMargin.times(LIQUIDATION_THRESHOLD),
          )
        ) {
          await forceClosePosition(position, user);
        } else {
          await FuturesAccount.updateOne(
            { _id: user._id },
            { balance: user.balance },
          ).lean();
        }
      }
    } catch (error) {
      logError(error, "monitorMargin", { userId: user.userId });
    }
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

export const adjustLeverage = async (req, res) => {
  const { userId, positionId } = req.params;
  const { newLeverage } = req.body;

  const allowedLeverages = Object.keys(INITIAL_MARGIN_RATIOS).map(Number);

  if (!allowedLeverages.includes(newLeverage)) {
    return res.status(400).json({
      message: `Invalid leverage. Allowed values are ${allowedLeverages.join(", ")}.`,
    });
  }

  try {
    const position = await FuturesPosition.findOne({ _id: positionId, userId });
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    position.leverage = newLeverage;
    await position.save();

    res.status(200).json(position);
  } catch (error) {
    logError(error, "adjustLeverage", { userId, positionId });
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkRiskRate = async (req, res) => {
  const { userId } = req.params;

  try {
    const { riskRate, balance } = await calculateUserRiskRate(userId);
    res.status(200).json({ riskRate, balance });
  } catch (error) {
    logError(error, "checkRiskRate", { userId });
    res.status(500).json({ message: "Internal server error" });
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
      await session.abortTransaction();
      return res.status(404).json({ message: "Position not found" });
    }

    const user = await FuturesAccount.findOne({ userId }).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    const currentPrice = new Decimal(await getCurrentPrice(position.symbol));
    const totalAmount = new Decimal(position.quantity).times(currentPrice);
    const fee = totalAmount
      .times(TRANSACTION_FEE_RATE)
      .times(position.leverage);

    let totalRevenue;
    if (position.positionType === "long") {
      totalRevenue = totalAmount.minus(fee);
      user.balance = new Decimal(user.balance).plus(totalRevenue).toFixed();
    } else if (position.positionType === "short") {
      totalRevenue = totalAmount.plus(fee);
      user.balance = new Decimal(user.balance).plus(totalRevenue).toFixed();
    }

    user.usedMargin = new Decimal(user.usedMargin)
      .minus(position.initialMargin)
      .toFixed();

    await FuturesPosition.deleteOne({ _id: positionId, userId }).session(
      session,
    );
    user.positions.pull(position._id);
    await user.save({ session });

    await session.commitTransaction();
    res.status(200).json({ message: "Position closed successfully" });
  } catch (error) {
    await session.abortTransaction();
    logError(error, "closePosition", { userId, positionId });
    res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};

const calculateUserRiskRate = async (userId) => {
  const positions = await FuturesPosition.find({ userId });
  const account = await FuturesAccount.findOne({ userId });

  let totalInitialMargin = new Decimal(0);
  let totalMaintenanceMargin = new Decimal(0);

  for (const position of positions) {
    const currentPrice = new Decimal(await getCurrentPrice(position.symbol));
    const totalAmount = new Decimal(position.quantity).times(currentPrice);
    const initialMargin = calculateInitialMargin(
      totalAmount,
      position.leverage,
    );
    const maintenanceMargin = calculateMaintenanceMargin(initialMargin);

    totalInitialMargin = totalInitialMargin.plus(initialMargin);
    totalMaintenanceMargin = totalMaintenanceMargin.plus(maintenanceMargin);
  }

  const riskRate = totalMaintenanceMargin.dividedBy(account.balance).toFixed();
  return { riskRate, balance: account.balance };
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

import cron from "node-cron";

cron.schedule("0 * * * *", () => {
  console.log("Running hourly margin monitoring task");
  monitorMargin();
});

cron.schedule("0 0 * * *", () => {
  console.log("Running daily risk rate monitoring task");
  monitorRiskRates();
});
