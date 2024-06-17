import { calculateSignal } from '../strategies/simpleMovingAverage.js';
import BinanceDataScraper from './binanceDataScraper.js';
import { format } from 'date-fns';

const initialBalance = 10000;
const scraper = new BinanceDataScraper();

export const runBacktest = async (symbol, interval, startTime, endTime) => {
  console.log('Fetching historical data...');
  const historicalData = await scraper.getHistoricalData(symbol, interval, startTime, endTime);
  console.log('Historical data fetched:', historicalData);

  let balance = initialBalance;
  let position = null;
  let entryTime = null;
  let exitTime = null;
  let entryPrice = null;
  let exitPrice = null;

  const balanceHistory = [];

  for (const dataPoint of historicalData) {
    const signal = calculateSignal(historicalData.slice(0, historicalData.indexOf(dataPoint) + 1));

    if (signal.action === 'buy' && !position) {
      position = { price: dataPoint.close, quantity: balance / dataPoint.close };
      entryPrice = dataPoint.close;
      entryTime = format(new Date(dataPoint.closeTime), 'yyyy-MM-dd HH:mm:ss');
      balance -= position.quantity * dataPoint.close;
    } else if (signal.action === 'sell' && position) {
      balance += position.quantity * dataPoint.close;
      exitPrice = dataPoint.close;
      exitTime = format(new Date(dataPoint.closeTime), 'yyyy-MM-dd HH:mm:ss');
      const profitLoss = (exitPrice - entryPrice) * position.quantity;
      balanceHistory.push({
        entry_time: entryTime,
        exit_time: exitTime,
        entry_price: entryPrice,
        exit_price: exitPrice,
        current_BTCUSDT_price: dataPoint.close,
        balance: balance,
        profit_loss: profitLoss
      });
      position = null;
      entryTime = null;
      exitTime = null;
      entryPrice = null;
      exitPrice = null;
    }
  }

  if (position) {
    balance += position.quantity * historicalData[historicalData.length - 1].close;
    exitPrice = historicalData[historicalData.length - 1].close;
    exitTime = format(new Date(historicalData[historicalData.length - 1].closeTime), 'yyyy-MM-dd HH:mm:ss');
    const profitLoss = (exitPrice - entryPrice) * position.quantity;
    balanceHistory.push({
      entry_time: entryTime,
      exit_time: exitTime,
      entry_price: entryPrice,
      exit_price: exitPrice,
      current_BTCUSDT_price: historicalData[historicalData.length - 1].close,
      balance: balance,
      profit_loss: profitLoss
    });
  }

  return balanceHistory;
};
