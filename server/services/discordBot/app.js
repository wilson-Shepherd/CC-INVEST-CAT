// import { Client, GatewayIntentBits } from 'discord.js';
// import 'dotenv/config';
// import { getLatestPrices } from './webSocketClient.js';
// import { sendNotification } from './bot.js';

// const dcClient = new Client({ intents: [GatewayIntentBits.Guilds] });

// dcClient.on('ready', () => {
//   console.log(`Logged in as ${dcClient.user.tag}!`);

//   setInterval(async () => {
//     try {
//       const prices = await getLatestPrices();
//       const messages = [
//         { symbol: 'BTCUSDT', data: prices['btcusdt'] },
//         { symbol: 'BNBUSDT', data: prices['bnbusdt'] },
//         { symbol: 'ETHUSDT', data: prices['ethusdt'] }
//       ];

//       for (const { symbol, data } of messages) {
//         if (data) {
//           const message = `
//             ${symbol} 資訊:
//             最後價格: ${data.lastPrice}
//             24h 變動百分比: ${data.priceChangePercent}%
//             成交量: ${data.volume}
//           `;
//           const channelId = process.env.DISCORD_CHANNEL_ID;
//           await sendNotification(channelId, message);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching prices or sending notifications:', error);
//     }
//   }, 60 * 60 * 1000);
// });

// dcClient.on('interactionCreate', async interaction => {
//   if (!interaction.isChatInputCommand()) return;

//   if (interaction.commandName === 'ping') {
//     await interaction.reply('Pong!');
//   }
// });

// dcClient.login(process.env.TOKEN);

// export default dcClient;

import { Client, GatewayIntentBits } from "discord.js";
import "dotenv/config";
import { sendNotification } from "./bot.js";

const dcClient = new Client({ intents: [GatewayIntentBits.Guilds] });

dcClient.on("ready", () => {
  console.log(`Logged in as ${dcClient.user.tag}!`);

  setInterval(
    async () => {
      try {
        const userId = "1104039731119013998";
        const testMessage = `<@${userId}> 是不是又沒去上班`;
        const channelId = process.env.DISCORD_CHANNEL_ID;
        await sendNotification(channelId, testMessage);
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    },
    9999 * 9999 * 10,
  );
});

dcClient.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

dcClient.login(process.env.TOKEN);

export default dcClient;
