import express from "express";
import {
  getFuturesAccount,
  createFuturesOrder,
  getFuturesOrders,
  getFuturesOrder,
  updateFuturesOrder,
  getAvailableCryptos,
} from "../controllers/futuresOrder.js";
import {
  getFuturesContracts,
  getFuturesContract,
  updateFuturesContract,
} from "../controllers/futuresContract.js";
import {
  executeFuturesTrade,
  closeFuturesPosition,
} from "../controllers/futuresExecute.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/users/:userId/account", authenticate, getFuturesAccount)
router.post("/users/:userId/orders", authenticate, createFuturesOrder);
router.get("/users/:userId/orders", authenticate, getFuturesOrders);
router.get("/users/:userId/orders/:orderId", authenticate, getFuturesOrder);
router.put("/users/:userId/orders/:orderId", authenticate, updateFuturesOrder);

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
router.post("/users/:userId/trade", authenticate, executeFuturesTrade);

export default router;
