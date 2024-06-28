import User from '../models/User.js';
import SpotOrder from '../models/SpotOrder.js';
import FuturesOrder from '../models/FuturesOrder.js';
import { logError } from '../utils/tradeUtils.js';
import FuturesAccount from '../models/FuturesAccount.js';
import { calculateUserRiskRate } from './futuresTrading.js';


export const getUserOrderFees = async (req, res) => {
  try {
    const users = await User.find().lean();
    const userFees = await Promise.all(users.map(async (user) => {
      const spotOrderFees = await SpotOrder.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: null, totalFees: { $sum: "$fee" } } },
      ]);

      const futuresOrderFees = await FuturesOrder.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: null, totalFees: { $sum: "$fee" } } },
      ]);

      return {
        username: user.username,
        spotOrderFees: spotOrderFees[0] ? spotOrderFees[0].totalFees : 0,
        futuresOrderFees: futuresOrderFees[0] ? futuresOrderFees[0].totalFees : 0,
      };
    }));

    res.status(200).json(userFees);
  } catch (error) {
    logError(error, "getUserOrderFees");
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFuturesUserRiskRates = async (req, res) => {
  try {
    const futuresAccounts = await FuturesAccount.find().lean();
    const userRiskRates = await Promise.all(futuresAccounts.map(async (account) => {
      const riskRate = await calculateUserRiskRate(account.userId);
      return {
        userId: account.userId,
        riskRate,
      };
    }));

    res.status(200).json(userRiskRates);
  } catch (error) {
    logError(error, "getFuturesUserRiskRates");
    res.status(500).json({ message: "Internal server error" });
  }
};
