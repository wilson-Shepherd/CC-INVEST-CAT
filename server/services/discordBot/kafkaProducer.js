import cron from "node-cron";
import axios from "axios";
import { sendKafkaMessage, initKafkaProducer } from "../kafka/service.js";
import "dotenv/config";

const TOPIC = "discord-notifications";

async function fetchLatestPrices() {
  const binanceAPIUrl = "https://api.binance.com/api/v3/ticker/24hr";
  try {
    const response = await axios.get(binanceAPIUrl);
    const allPrices = response.data || [];
    const usdtPrices = allPrices.filter((price) =>
      price.symbol.endsWith("USDT"),
    );
    return usdtPrices;
  } catch (error) {
    console.error("Error fetching latest prices from Binance:", error);
    return [];
  }
}

export async function initPriceNotificationScheduler() {
  await initKafkaProducer();

  const scheduleNotification = async () => {
    try {
      const prices = await fetchLatestPrices();

      if (prices.length > 0) {
        const message = {
          timestamp: new Date().toISOString(),
          prices: prices,
        };

        await sendKafkaMessage(TOPIC, message);
        console.log("Price notification sent to Kafka");
      }
    } catch (error) {
      console.error("Error fetching prices or sending notifications:", error);
    }
  };

  cron.schedule("0 * * * *", scheduleNotification, {
    scheduled: true,
    timezone: "Asia/Taipei",
  });

  console.log("Price notification scheduler initialized");
}
