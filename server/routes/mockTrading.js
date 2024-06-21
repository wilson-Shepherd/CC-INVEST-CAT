import express from "express";
import {
  getMockAccount,
  createOrder,
  getOrders,
  getOrder,
  getAvailableCryptos,
} from "../controllers/mockTrading.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/users/:userId/mockAccount", authenticate, getMockAccount);
router.post("/users/:userId/mockOrders", authenticate, createOrder);
router.get("/users/:userId/mockOrders", authenticate, getOrders);
router.get("/users/:userId/mockOrders/:orderId", authenticate, getOrder);
router.get("/availableCryptos", authenticate, getAvailableCryptos);

export default router;
