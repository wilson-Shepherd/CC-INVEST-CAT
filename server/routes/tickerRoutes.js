import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initializeWebSocket, streamTickerData } from '../controllers/tickerController.js';
import { getTickerData, fetchHistoricalData, runStrategyBacktest, fetchKlines } from '../controllers/tickerController.js';

const router = express.Router();

router.get('/tickers', getTickerData);
router.post('/historical-data', fetchHistoricalData);
router.post('/backtest', runStrategyBacktest);
router.get('/klines', fetchKlines);

export default router;

export const initWebSocketRoutes = (app) => {
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  initializeWebSocket();
  streamTickerData(io);

  return server;
};
