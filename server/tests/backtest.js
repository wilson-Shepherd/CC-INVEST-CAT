import BinanceDataScraper from "../services/binance/dataScraper.js";
import { gridTrading } from "../strategies/gridTrading.js";

const initialBalance = 0;
const scraper = new BinanceDataScraper();

export const runBacktest = async (
  symbol,
  interval,
  startTime,
  endTime,
  lowerPrice,
  upperPrice,
  gridSize,
) => {
  try {
    console.log("Fetching historical data...");
    const historicalData = await scraper.getHistoricalData(
      symbol,
      interval,
      startTime,
      endTime,
    );
    console.log("Historical data fetched:", historicalData.length, "entries");

    historicalData.slice(0, 5).forEach((data) => {
      console.log("Sample data point:", data);
    });

    const balanceHistory = gridTrading(
      historicalData,
      lowerPrice,
      upperPrice,
      gridSize,
      initialBalance,
    );
    return balanceHistory;
  } catch (error) {
    console.error("Error during backtest:", error);
    throw error;
  }
};
