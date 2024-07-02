import axios from "axios";
import binanceClient from "./client.js";

class BinanceDataScraper {
  constructor() {
    this.client = binanceClient();
  }

  async getHistoricalData(symbol, interval, startTime, endTime) {
    let allCandles = [];
    let fetchStartTime = new Date(startTime).getTime();

    try {
      while (fetchStartTime < new Date(endTime).getTime()) {
        const params = {
          symbol,
          interval,
          startTime: fetchStartTime,
          endTime: new Date(endTime).getTime(),
          limit: 1000,
        };

        const response = await axios.get(
          "https://api.binance.com/api/v3/klines",
          { params },
        );
        const candles = response.data;

        if (candles.length === 0) {
          break;
        }

        allCandles = allCandles.concat(candles);

        fetchStartTime = candles[candles.length - 1][6] + 1;
      }

      return allCandles.map((c) => ({
        openTime: c[0],
        open: parseFloat(c[1]),
        high: parseFloat(c[2]),
        low: parseFloat(c[3]),
        close: parseFloat(c[4]),
        volume: parseFloat(c[5]),
        closeTime: c[6],
      }));
    } catch (error) {
      console.error("Error fetching historical data:", error);
      throw error;
    }
  }

  async getKlines(symbol, interval, startTime, endTime, limit, timeZone) {
    const params = {
      symbol,
      interval,
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      ...(limit && { limit }),
      ...(timeZone && { timeZone }),
    };

    try {
      const response = await axios.get(
        "https://api.binance.com/api/v3/klines",
        { params },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching Klines from Binance:", error.message);
      throw error;
    }
  }
}

export default BinanceDataScraper;
