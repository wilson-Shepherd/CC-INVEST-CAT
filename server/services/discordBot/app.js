import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config";
import cron from "node-cron";
import { getLatestPrices } from "./webSocketClient.js";
import { sendNotification } from "./bot.js";

const dcClient = new Client({ intents: [GatewayIntentBits.Guilds] });

dcClient.on("ready", () => {
  console.log(`Logged in as ${dcClient.user.tag}!`);

  const scheduleNotification = async () => {
    try {
      const prices = getLatestPrices();
      const filteredPrices = Object.entries(prices).filter(
        ([symbol, data]) =>
          data.volume > 1_000_000_000 && data.priceChangePercent > 10,
      );

      if (filteredPrices.length > 0) {
        let message = "現在市場上的熱門貨幣:\n";
        for (const [symbol, data] of filteredPrices) {
          message += `
            ${symbol.toUpperCase()} 市場資訊:
            最後價格: ${data.lastPrice}
            24h 變動百分比: ${data.priceChangePercent}%
            成交量: ${data.volume}
          `;
        }
        const channelId = process.env.DISCORD_CHANNEL_ID;
        await sendNotification(channelId, message);
      } else {
        console.log("No hot cryptocurrencies found at this time.");
      }
    } catch (error) {
      console.error("Error fetching prices or sending notifications:", error);
    }
  };

  cron.schedule("0 6,12,18,0 * * *", scheduleNotification);
});

dcClient.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

dcClient.login(process.env.TOKEN);

export default dcClient;
