import express from "express";
import { getUserOrderFees } from "../controllers/admin.js";
import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorization.js";

const router = express.Router();

router.use(authenticate);

router.get("/order-fees", authorize, getUserOrderFees);
router.get("/account-balance", async (req, res) => {
  try {
    const balance = await getAccountBalance();
    res.status(200).json(balance);
  } catch (error) {
    console.error("Error fetching account balance:", error);
    res.status(500).json({ message: "Failed to fetch account balance" });
  }
});

export default router;