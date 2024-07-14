import FuturesContract from "../models/FuturesContract.js";
import FuturesAccount from "../models/FuturesAccount.js";
import {
  getCurrentPrice,
  logError,
  validateAccount,
} from "../utils/tradeUtils.js";
import mongoose from "mongoose";
import Decimal from "decimal.js";

export const closeFuturesPosition = async (req, res) => {
  const { userId, contractId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const contract = await FuturesContract.findOne({
      _id: contractId,
      userId,
    }).session(session);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const account = await FuturesAccount.findOne({ userId }).session(session);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const currentPrice = new Decimal(await getCurrentPrice(contract.symbol));
    const entryPrice = new Decimal(contract.entryPrice);
    const positionSize = new Decimal(contract.positionSize);
    const pnl = currentPrice
      .minus(entryPrice)
      .times(positionSize)
      .times(contract.type === "long" ? 1 : -1);

    account.balance = new Decimal(account.balance).plus(pnl).toNumber();
    account.totalMarginBalance = new Decimal(account.totalMarginBalance)
      .minus(contract.margin)
      .toNumber();
    account.contracts.pull(contract._id);

    await contract.remove({ session });
    validateAccount(account);
    await account.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ message: "Position closed successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logError(error, "closeFuturesPosition");
    res
      .status(500)
      .json({ error: "An error occurred while closing the position" });
  } finally {
    session.endSession();
  }
};

export const executeFuturesTrade = async (req, res) => {
  try {
    await createFuturesOrder(req, res);
  } catch (error) {
    logError(error, "executeFuturesTrade");
    res
      .status(500)
      .json({ error: "An error occurred while executing the trade" });
  }
};
