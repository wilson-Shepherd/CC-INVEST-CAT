import BinanceWebSocket from '../services/binanceWebSocket.js';
import BinanceDataScraper from '../services/binanceDataScraper.js';

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

export const fetchHistoricalData = async (req, res) => {
  const { symbol, interval, startTime, endTime } = req.body;
  const scraper = new BinanceDataScraper();
  try {
    const data = await scraper.getHistoricalData(symbol, interval, new Date(startTime).getTime(), new Date(endTime).getTime());
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
};
