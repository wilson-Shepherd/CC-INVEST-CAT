import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config";
import cron from "node-cron";
import { fetchLatestPrices } from "./fetchPrices.js";
import { sendKafkaMessage, ensureTopicExists } from "../kafka/Producer.js";
import kafka from "kafka-node";
import { sendNotification } from "./bot.js";

const dcClient = new Client({ intents: [GatewayIntentBits.Guilds] });

function createConsumerWithRetry(retries = 5, delay = 5000) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const Consumer = kafka.Consumer;
      const client = new kafka.KafkaClient({
        kafkaHost: process.env.KAFKA_HOST,
      });
      const consumer = new Consumer(
        client,
        [{ topic: "discord-notifications", partition: 0 }],
        {
          autoCommit: true,
        },
      );

      consumer.on("error", (err) => {
        console.error("Kafka Consumer error:", err);
        if (retries > 0) {
          console.log(`Retrying in ${delay}ms... (${retries} attempts left)`);
          setTimeout(() => {
            retries--;
            attempt();
          }, delay);
        } else {
          reject(err);
        }
      });

      consumer.on("message", (message) => {
        resolve(consumer);
      });

      client.on("error", (err) => {
        console.error("Kafka Client error:", err);
      });
    };

    attempt();
  });
}

dcClient.on("ready", async () => {
  console.log(`Logged in as ${dcClient.user.tag}!`);

  try {
    await ensureTopicExists("discord-notifications");
    const consumer = await createConsumerWithRetry();
    consumer.on("message", async (message) => {
      try {
        const { channelId, text } = JSON.parse(message.value);
        await sendNotification(channelId, text);
      } catch (error) {
        console.error("Error processing message from Kafka:", error);
      }
    });
  } catch (error) {
    console.error("Failed to setup Kafka consumer:", error);
  }

  const scheduleNotification = async () => {
    try {
      const prices = await fetchLatestPrices();

      if (Object.keys(prices).length > 0) {
        const messages = [];
        let message = "現在市場上的熱門貨幣:\n";

        for (const [symbol, data] of Object.entries(prices)) {
          const newMessagePart = `
            ${symbol.toUpperCase()} 市場資訊:
            最後價格: ${data.lastPrice}
            24h 變動百分比: ${data.priceChangePercent}%
            成交量: ${data.volume}
          `;
          if (message.length + newMessagePart.length > 2000) {
            messages.push(message);
            message = "";
          }
          message += newMessagePart;
        }
        if (message.length > 0) {
          messages.push(message);
        }

        const channelId = process.env.DISCORD_CHANNEL_ID;
        for (const msg of messages) {
          const kafkaMessage = JSON.stringify({ channelId, text: msg });
          await sendKafkaMessage("discord-notifications", kafkaMessage);
          console.log(`Message sent to Kafka: ${kafkaMessage}`);
        }
      }
    } catch (error) {
      console.error("Error fetching prices or sending notifications:", error);
    }
  };

  cron.schedule("0 0,6,12,18 * * *", scheduleNotification, {
    scheduled: true,
    timezone: "Asia/Taipei",
  });
});

dcClient.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

dcClient.login(process.env.DISCORD_TOKEN);

export default dcClient;
