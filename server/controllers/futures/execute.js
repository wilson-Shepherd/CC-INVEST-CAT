import FuturesContract from "../../models/Futures/Contract.js";
import FuturesAccount from "../../models/Futures/Account.js";
import FuturesOrder from "../../models/Futures/Order.js";
import {
  getCurrentPrice,
  logError,
  TRANSACTION_FEE_RATE,
} from "../../utils/tradeUtils.js";
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
      status: "open",
    }).session(session);
    if (!contract) {
      return res.status(404).json({ message: "Open contract not found" });
    }

    const order = await FuturesOrder.findOne({
      userId,
      symbol: contract.symbol,
      status: "executed",
    }).session(session);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const account = await FuturesAccount.findOne({ userId }).session(session);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const currentPrice = new Decimal(await getCurrentPrice(contract.symbol));
    const entryPrice = new Decimal(contract.entryPrice);
    const positionSize = new Decimal(contract.positionSize);
    const leverage = new Decimal(contract.leverage);
    const margin = new Decimal(contract.margin);

    const notionalValue = positionSize.times(currentPrice);

    const pnl = currentPrice
      .minus(entryPrice)
      .times(positionSize)
      .times(contract.type === "long" ? 1 : -1);

    const closingFee = notionalValue.times(TRANSACTION_FEE_RATE);
    const roe = pnl.dividedBy(margin).times(100);

    let newBalance = new Decimal(account.balance)
      .plus(pnl)
      .plus(margin)
      .minus(closingFee);

    let newTotalMarginBalance = new Decimal(account.totalMarginBalance).minus(
      margin,
    );

    if (newTotalMarginBalance.lessThan(0)) {
      const deficit = newTotalMarginBalance.abs();
      newTotalMarginBalance = new Decimal(0);
      newBalance = newBalance.minus(deficit);
    }

    account.balance = newBalance.toNumber();
    account.totalMarginBalance = newTotalMarginBalance.toNumber();
    account.contracts.pull(contract._id);

    contract.status = "closed";
    contract.pnl = pnl.toNumber();
    contract.roe = roe.toNumber();
    contract.markPrice = currentPrice.toNumber();

    order.status = "closed";
    order.closingPrice = currentPrice.toNumber();
    order.pnl = pnl.toNumber();
    order.closingFee = closingFee.toNumber();

    await Promise.all([
      contract.save({ session }),
      order.save({ session }),
      account.save({ session }),
    ]);

    await FuturesContract.deleteOne({ _id: contract._id }).session(session);

    await session.commitTransaction();
    res.status(200).json({
      message: "Position closed successfully",
      pnl: pnl.toNumber(),
      roe: roe.toNumber(),
      closingFee: closingFee.toNumber(),
      releasedMargin: margin.toNumber(),
      leverage: leverage.toNumber(),
    });
  } catch (error) {
    await session.abortTransaction();
    logError(error, "closeFuturesPosition");
    res
      .status(500)
      .json({ error: "An error occurred while closing the position" });
  } finally {
    session.endSession();
  }
};
