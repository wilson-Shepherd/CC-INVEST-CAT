import express from "express";
import { initializeWebSocket } from "../controllers/ticker.js";

const router = express.Router();

export default router;

export const initWebSocketRoutes = () => {
  initializeWebSocket();
};

/*
import {
  runStrategyBacktest,
} from "../controllers/ticker.js";
router.post("/backtest", runStrategyBacktest);
*/
