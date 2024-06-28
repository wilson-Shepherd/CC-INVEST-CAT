import express from "express";
import {
  getFuturesAccount,
  createFuturesOrder,
  getFuturesOrders,
  getFuturesOrder,
  getAvailableCryptos,
  getPositions,
  closePosition,
  adjustLeverage,
  checkRiskRate
} from "../controllers/futuresTrading.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/users/:userId/account", authenticate, getFuturesAccount);
router.post("/users/:userId/orders", authenticate, createFuturesOrder);
router.get("/users/:userId/orders", authenticate, getFuturesOrders);
router.get("/users/:userId/orders/:orderId", authenticate, getFuturesOrder);
router.get("/availableCryptos", getAvailableCryptos);
router.get("/users/:userId/positions", authenticate, getPositions);
router.post(
  "/users/:userId/positions/:positionId/close",
  authenticate,
  closePosition
);
router.post(
  "/users/:userId/positions/:positionId/leverage",
  authenticate,
  adjustLeverage
);
router.get("/users/:userId/riskRate", authenticate, checkRiskRate);

export default router;
