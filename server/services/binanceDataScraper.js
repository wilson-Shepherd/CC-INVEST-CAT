import axios from 'axios';
import binanceClient from './binanceClient.js';

class BinanceDataScraper {
  constructor() {
    this.client = binanceClient();
  }

  async getHistoricalData(symbol, interval, startTime, endTime) {
    let allCandles = [];
    let fetchStartTime = startTime;

    try {
      while (fetchStartTime < endTime) {
        const candles = await this.client.candles({
          symbol,
          interval,
          startTime: fetchStartTime,
          endTime,
        });

        if (candles.length === 0) {
          break;
        }

        allCandles = allCandles.concat(candles);

        fetchStartTime = candles[candles.length - 1].closeTime + 1;
      }

      return allCandles.map(c => ({
        openTime: c.openTime,
        open: parseFloat(c.open),
        high: parseFloat(c.high),
        low: parseFloat(c.low),
        close: parseFloat(c.close),
        volume: parseFloat(c.volume),
        closeTime: c.closeTime,
      }));
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  async getKlines(symbol, interval, startTime, endTime, limit, timeZone) {
    const params = {
      symbol,
      interval,
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      ...(timeZone && { timeZone }),
    };

    try {
      const response = await axios.get('https://api.binance.com/api/v3/klines', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching Klines from Binance:', error.message);
      throw error;
    }
  }
}

export default BinanceDataScraper;
