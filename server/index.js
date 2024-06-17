import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './database.js';
import tickerRoutes, { initWebSocketRoutes } from './routes/tickerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/dcNotificationRoutes.js';
import { errorHandler } from './utils/errorHandler.js';
import dcClient from './services/discord-bot/dcApp.js';

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, Crypto Trading Platform!');
});

app.use('/api/ticker', tickerRoutes);
app.use('/api/user', userRoutes);
app.use('/api', notificationRoutes);

app.use(errorHandler);

const server = initWebSocketRoutes(app);

if (dcClient) {
  console.log('Discord client initialized');
}

// 啟動服務器和 Discord 機器人
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
