import User from "../models/User.js";
import SpotOrder from "../models/SpotOrder.js";
import FuturesOrder from "../models/FuturesOrder.js";
import { logError } from "../utils/tradeUtils.js";
import { startTrading, stopTrading } from "../services/trading/bot.js";

export const getUserOrderFees = async (req, res) => {
  try {
    const users = await User.find().lean();
    const userFees = await Promise.all(
      users.map(async (user) => {
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
          email: user.email,
          spotOrderFees: spotOrderFees[0] ? spotOrderFees[0].totalFees : 0,
          futuresOrderFees: futuresOrderFees[0]
            ? futuresOrderFees[0].totalFees
            : 0,
        };
      }),
    );

    res.status(200).json(userFees);
  } catch (error) {
    logError(error, "getUserOrderFees");
    res.status(500).json({ message: "Internal server error" });
  }
};

export const controlTradingBot = (req, res) => {
  const { action } = req.body;

  if (action === "start") {
    startTrading();
    res.status(200).json({ message: "Trading bot started" });
  } else if (action === "stop") {
    stopTrading();
    res.status(200).json({ message: "Trading bot stopped" });
  } else {
    res.status(400).json({ message: "Invalid action" });
  }
};
