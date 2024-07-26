import User from "../models/User.js";
import SpotOrder from "../models/Spot/Order.js";
import FuturesOrder from "../models/Futures/Order.js";
import { logError } from "../utils/tradeUtils.js";

export const getUserOrderFees = async (req, res) => {
  try {
    const users = await User.find({}, "username email");
    const userFees = await Promise.all(
      users.map(async (user) => {
        const [spotOrderFees] = await SpotOrder.aggregate([
          { $match: { userId: user._id } },
          { $group: { _id: null, totalFees: { $sum: "$fee" } } },
        ]);

        const [futuresOrderFees] = await FuturesOrder.aggregate([
          { $match: { userId: user._id } },
          { $group: { _id: null, totalFees: { $sum: "$fee" } } },
        ]);

        return {
          username: user.username,
          email: user.email,
          spotOrderFees: spotOrderFees ? spotOrderFees.totalFees : 0,
          futuresOrderFees: futuresOrderFees ? futuresOrderFees.totalFees : 0,
        };
      }),
    );

    res.status(200).json(userFees);
  } catch (error) {
    logError(error, "getUserOrderFees");
    res.status(500).json({ message: "Internal server error" });
  }
};