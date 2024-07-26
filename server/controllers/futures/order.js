import FuturesOrder from "../../models/Futures/Order.js";
import FuturesContract from "../../models/Futures/Contract.js";
import FuturesAccount from "../../models/Futures/Account.js";
import mongoose from "mongoose";
import Decimal from "decimal.js";
import {
  logError,
  validateAccount,
  getCurrentPrice,
  TRANSACTION_FEE_RATE,
  getAvailableCryptosUtil,
} from "../../utils/tradeUtils.js";

export const createFuturesOrder = async (req, res) => {
  const { userId } = req.params;
  const { symbol, orderType, side, leverage, quantity, stopLoss, takeProfit } =
    req.body;

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
    const notionalValue = new Decimal(quantity).times(price);

    const margin = calculateMargin(notionalValue, new Decimal(leverage));

    const openingFee = notionalValue.times(TRANSACTION_FEE_RATE);
    const estimatedClosingFee = notionalValue.times(TRANSACTION_FEE_RATE);
    const totalFee = openingFee.plus(estimatedClosingFee);

    const order = new FuturesOrder({
      userId,
      symbol,
      orderType,
      side,
      leverage: new Decimal(leverage).toNumber(),
      quantity: new Decimal(quantity).toNumber(),
      price: price.toNumber(),
      margin: margin.toNumber(),
      fee: totalFee.toNumber(),
      stopLoss: stopLoss ? new Decimal(stopLoss).toNumber() : null,
      takeProfit: takeProfit ? new Decimal(takeProfit).toNumber() : null,
    });
    await order.save({ session });

    const maintenanceMargin = calculateMaintenanceMargin(margin);

    const contractData = {
      userId,
      symbol: order.symbol,
      leverage: new Decimal(order.leverage).toNumber(),
      entryPrice: new Decimal(order.price).toNumber(),
      positionSize: new Decimal(order.quantity).toNumber(),
      margin: margin.toNumber(),
      type: order.side === "buy" ? "long" : "short",
      markPrice: new Decimal(order.price).toNumber(),
      maintenanceMargin: maintenanceMargin.toNumber(),
      stopLoss: stopLoss ? new Decimal(stopLoss).toNumber() : null,
      takeProfit: takeProfit ? new Decimal(takeProfit).toNumber() : null,
      openingFee: openingFee.toNumber(),
      estimatedClosingFee: estimatedClosingFee.toNumber(),
    };

    const contract = new FuturesContract(contractData);
    await contract.save({ session });

    const account = await FuturesAccount.findOne({ userId }).session(session);
    if (account) {
      account.contracts.push(contract._id);
      account.totalMarginBalance = new Decimal(account.totalMarginBalance || 0)
        .plus(margin)
        .toNumber();
      account.balance = new Decimal(account.balance)
        .minus(margin)
        .minus(openingFee)
        .toNumber();
      validateAccount(account);
      await account.save({ session });
    } else {
      const newAccount = new FuturesAccount({
        userId,
        balance: new Decimal(10000).minus(margin).minus(openingFee).toNumber(),
        totalMarginBalance: margin.toNumber(),
        contracts: [contract._id],
      });
      validateAccount(newAccount);
      await newAccount.save({ session });
    }

    order.status = "executed";
    await order.save({ session });

    await session.commitTransaction();
    res.status(201).json({ order, contract });
  } catch (error) {
    await session.abortTransaction();
    logError(error, "createFuturesOrder");
    res
      .status(500)
      .json({ error: "An error occurred while creating the order" });
  } finally {
    session.endSession();
  }
};

const calculateMargin = (notionalValue, leverage) => {
  return notionalValue.dividedBy(leverage);
};

const calculateMaintenanceMargin = (margin) => {
  return margin.times(new Decimal(0.5));
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
    await updateAccountMetrics(account);

    res.status(200).json(account);
  } catch (error) {
    logError(error, "getFuturesAccount");
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the account" });
  }
};

const updateAccountMetrics = async (account) => {
  let totalUnrealizedPnl = new Decimal(0);
  for (const contract of account.contracts) {
    const currentPrice = new Decimal(await getCurrentPrice(contract.symbol));
    const entryPrice = new Decimal(contract.entryPrice);
    const positionSize = new Decimal(contract.positionSize);
    const pnl = currentPrice
      .minus(entryPrice)
      .times(positionSize)
      .times(contract.type === "long" ? 1 : -1);
    totalUnrealizedPnl = totalUnrealizedPnl.plus(pnl);
  }
  account.totalUnrealizedPnl = totalUnrealizedPnl.toNumber();
  account.totalMarginBalance = new Decimal(account.totalMarginBalance)
    .plus(totalUnrealizedPnl)
    .toNumber();

  const maintenanceMargin = calculateMaintenanceMargin(
    new Decimal(account.totalMarginBalance),
  );

  account.maintenanceMargin = maintenanceMargin.toNumber();

  await account.save();
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

export const getAvailableCryptos = async (req, res) => {
  try {
    const symbols = await getAvailableCryptosUtil();
    res.status(200).json(symbols);
  } catch (error) {
    logError(error, "getAvailableCryptos");
    res.status(500).json({ message: "Internal server error" });
  }
};
