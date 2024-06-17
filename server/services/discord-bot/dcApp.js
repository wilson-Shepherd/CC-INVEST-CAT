import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import { getLatestPrices } from './dcWebsocketClient.js';
import { sendNotification } from './bot.js';

const dcClient = new Client({ intents: [GatewayIntentBits.Guilds] });

dcClient.on('ready', () => {
  console.log(`Logged in as ${dcClient.user.tag}!`);

  setInterval(async () => {
    const prices = getLatestPrices();
    const messages = [
      {
        symbol: 'BTCUSDT',
        data: prices['btcusdt']
      },
      {
        symbol: 'BNBUSDT',
        data: prices['bnbusdt']
      },
      {
        symbol: 'ETHUSDT',
        data: prices['ethusdt']
      }
    ];

    for (const { symbol, data } of messages) {
      if (data) {
        const message = `
          ${symbol} 資訊:
          最後價格: ${data.lastPrice}
          24h 變動百分比: ${data.priceChangePercent}%
          成交量: ${data.volume}
        `;
        const channelId = process.env.DISCORD_CHANNEL_ID;
        await sendNotification(channelId, message);
      }
    }
  }, 60 * 60 * 1000);
});

dcClient.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

dcClient.login(process.env.TOKEN);

export default dcClient;
