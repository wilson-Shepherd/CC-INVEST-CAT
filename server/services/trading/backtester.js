// backtester.js
import BinanceDataScraper from './binanceDataScraper.js';
import { gridTrading } from '../strategies/gridTradingStrategy.js';

const initialBalance = 10000;
const scraper = new BinanceDataScraper();

export const runBacktest = async (symbol, interval, startTime, endTime, lowerPrice, upperPrice, gridSize) => {
    console.log('Fetching historical data...');
    const historicalData = await scraper.getHistoricalData(symbol, interval, startTime, endTime);
    console.log('Historical data fetched:', historicalData);

    const balanceHistory = gridTrading(historicalData, lowerPrice, upperPrice, gridSize, initialBalance);
    return balanceHistory;
};
