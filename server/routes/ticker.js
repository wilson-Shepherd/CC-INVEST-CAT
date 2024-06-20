import express from 'express';
import {
  getTickerData,
  fetchHistoricalData,
  runStrategyBacktest,
  fetchKlines,
} from '../controllers/ticker.js';

const router = express.Router();

router.get('/tickers', getTickerData);
router.post('/historical-data', fetchHistoricalData);
router.post('/backtest', runStrategyBacktest);
router.get('/klines', fetchKlines);

export default router;
