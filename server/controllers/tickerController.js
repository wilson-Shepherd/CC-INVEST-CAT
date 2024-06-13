import BinanceWebSocket from '../services/binanceWebSocket.js';

let binanceWebSocket;

export const initializeWebSocket = () => {
  binanceWebSocket = new BinanceWebSocket();
};

export const streamTickerData = (io) => {
  binanceWebSocket.on('tickerData', (data) => {
    io.emit('tickerData', data);
  });
};

export const getTickerData = (req, res) => {
  res.send('Ticker data endpoint');
};
