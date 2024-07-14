import "dotenv/config";
import axios from "axios";

const API_URL = "https://api.binance.com/api/v3/ticker/24hr";

export async function fetchLatestPrices() {
  try {
    const response = await axios.get(API_URL);
    const data = response.data;
    const latestPrices = {};

    data.forEach((item) => {
      const { symbol, lastPrice, priceChangePercent, volume } = item;

      if (symbol.endsWith("USDT") && parseFloat(priceChangePercent) > 10) {
        latestPrices[symbol.toLowerCase()] = {
          lastPrice,
          priceChangePercent: parseFloat(priceChangePercent),
          volume: parseFloat(volume),
        };
      }
    });
    return latestPrices;
  } catch (error) {
    console.error("Error fetching latest prices:", error);
    throw error;
  }
}
