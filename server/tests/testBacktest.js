import { runBacktest } from './services/backtester.js';

const symbol = 'BTCUSDT';
const interval = '1h';
const startTime = new Date('2023-12-31T16:00:00Z').getTime();
const endTime = new Date('2024-06-09T10:15:00Z').getTime();
const lowerPrice = 30000;  // 設定你需要的最低價
const upperPrice = 40000;  // 設定你需要的最高價
const gridSize = 10;       // 設定你需要的網格數量

runBacktest(symbol, interval, startTime, endTime, lowerPrice, upperPrice, gridSize)
    .then(balanceHistory => {
        console.log('Backtest completed. Balance history:', balanceHistory);
    })
    .catch(error => {
        console.error('Error during backtest:', error);
    });
