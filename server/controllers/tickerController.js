import BinanceWebSocket from '../services/binanceWebSocket.js';
import BinanceDataScraper from '../services/binanceDataScraper.js';
import { runBacktest } from '../services/backtester.js';

// 实例化一次
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
      close: data.map(d => d.close)
    };
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
};

export const runStrategyBacktest = async (req, res) => {
  const { symbol, interval, startTime, endTime } = req.body;
  try {
    const balanceHistory = await runBacktest(symbol, interval, new Date(startTime).getTime(), new Date(endTime).getTime());
    res.json(balanceHistory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to run backtest' });
  }
};

export const fetchKlines = async (req, res) => {
  const { symbol, interval, startTime, endTime, limit, timeZone } = req.query;
  try {
    const cleanTimeZone = timeZone ? timeZone.trim() : undefined;
    console.log(`Fetching Klines with params: symbol=${symbol}, interval=${interval}, startTime=${startTime}, endTime=${endTime}, limit=${limit}, timeZone=${cleanTimeZone}`);
    const data = await scraper.getKlines(symbol, interval, Number(startTime), Number(endTime), Number(limit), cleanTimeZone);
    res.json(data);
  } catch (error) {
    console.error('Error fetching Klines:', error.message); // 仅打印错误消息
    console.error('Full error details:', error); // 打印完整的错误详情
    res.status(500).json({ error: 'Failed to fetch Klines' });
  }
};
