import express from "express";
import {
  getFuturesAccount,
  createFuturesOrder,
  getFuturesOrders,
  getFuturesOrder,
  getAvailableCryptos,
} from "../controllers/futures/order.js";
import {
  getFuturesContracts,
  getFuturesContract,
  updateFuturesContract,
} from "../controllers/futures/contract.js";
import { closeFuturesPosition } from "../controllers/futures/execute.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/users/:userId/account", authenticate, getFuturesAccount);
router.post("/users/:userId/orders", authenticate, createFuturesOrder);
router.get("/users/:userId/orders", authenticate, getFuturesOrders);
router.get("/users/:userId/orders/:orderId", authenticate, getFuturesOrder);
router.get("/users/:userId/contracts", authenticate, getFuturesContracts);
router.get(
  "/users/:userId/contracts/:contractId",
  authenticate,
  getFuturesContract,
);
router.put(
  "/users/:userId/contracts/:contractId",
  authenticate,
  updateFuturesContract,
);
router.post(
  "/users/:userId/contracts/:contractId/close",
  authenticate,
  closeFuturesPosition,
);
router.get("/availableCryptos", getAvailableCryptos);

export default router;
