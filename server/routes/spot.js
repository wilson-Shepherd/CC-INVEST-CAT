import express from "express";
import {
  getSpotAccount,
  createSpotOrder,
  getSpotOrders,
  getSpotOrder,
  getAvailableCryptos,
} from "../controllers/spot/order.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/users/:userId/account", authenticate, getSpotAccount);
router.post("/users/:userId/orders", authenticate, createSpotOrder);
router.get("/users/:userId/orders", authenticate, getSpotOrders);
router.get("/users/:userId/orders/:orderId", authenticate, getSpotOrder);
router.get("/availableCryptos", getAvailableCryptos);

export default router;
