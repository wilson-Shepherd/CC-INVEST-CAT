import BinanceWebSocket from '../services/binance/webSocket.js';
import BinanceDataScraper from '../services/binance/dataScraper.js';
import { runBacktest } from '../tests/backtest.js';

const scraper = new BinanceDataScraper();

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
  try {
    const data = await scraper.getHistoricalData(symbol, interval, new Date(startTime).getTime(), new Date(endTime).getTime());
    const formattedData = {
      x: data.map(d => new Date(d.closeTime).toISOString()),
      open: data.map(d => d.open),
      high: data.map(d => d.high),
      low: data.map(d => d.low),
      close: data.map(d => d.close),
    };
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
};

export const runStrategyBacktest = async (req, res) => {
  const { symbol, interval, startTime, endTime, lowerPrice, upperPrice, gridSize } = req.body;
  try {
    const balanceHistory = await runBacktest(symbol, interval, new Date(startTime).getTime(), new Date(endTime).getTime(), lowerPrice, upperPrice, gridSize);
    res.json(balanceHistory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to run backtest' });
  }
};

export const fetchKlines = async (req, res) => {
  const { symbol, interval, startTime, endTime, limit, timeZone } = req.query;
  if (!symbol || !interval || !startTime || !endTime) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const cleanTimeZone = timeZone ? timeZone.trim() : undefined;
    const data = await scraper.getKlines(symbol, interval, Number(startTime), Number(endTime), Number(limit), cleanTimeZone);
    res.json(data);
  } catch (error) {
    console.error('Error fetching Klines:', error.message);
    res.status(500).json({ error: 'Failed to fetch Klines' });
  }
};
