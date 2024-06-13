import express from 'express';
import { initializeWebSocket, streamTickerData, getTickerData } from '../controllers/tickerController.js';
import { Server } from 'socket.io';
import http from 'http';

const router = express.Router();

router.get('/tickers', getTickerData);

const initWebSocketRoutes = (app) => {
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  initializeWebSocket();
  streamTickerData(io);

  return server;
};

export { router, initWebSocketRoutes };
