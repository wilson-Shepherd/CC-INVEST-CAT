import User from "../models/User.js";

const authorize = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user) {
      if (user.role === "admin") {
        next();
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export default authorize;
