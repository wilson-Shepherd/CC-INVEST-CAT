import BinanceWebSocket from "../services/binance/webSocket.js";

let binanceWebSocket;

export const initializeWebSocket = () => {
  binanceWebSocket = new BinanceWebSocket();
};

export const streamTickerData = (io) => {
  binanceWebSocket.on("tickerData", (data) => {
    io.emit("tickerData", data);
  });
};

/*
import { runBacktest } from "../tests/backtest.js";

export const runStrategyBacktest = async (req, res) => {
  const {
    symbol,
    interval,
    startTime,
    endTime,
    lowerPrice,
    upperPrice,
    gridSize,
  } = req.body;
  try {
    const balanceHistory = await runBacktest(
      symbol,
      interval,
      new Date(startTime).getTime(),
      new Date(endTime).getTime(),
      lowerPrice,
      upperPrice,
      gridSize,
    );
    res.json(balanceHistory);
  } catch (error) {
    console.error("Error running backtest:", error);
    res.status(500).json({ error: "Failed to run backtest" });
  }
};
*/
