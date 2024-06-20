import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import tickerRoutes, { initWebSocketRoutes } from './routes/ticker.js';
import userRoutes from './routes/user.js';
import notificationRoutes from './routes/dcNotification.js';
import mockTradingRoutes from './routes/mockTrading.js';
import { errorHandler } from './utils/errorHandler.js';
import dcClient from './services/discordBot/app.js';

const app = express();
const PORT = process.env.PORT || 3000;
const server = initWebSocketRoutes(app);

connectDB();
app.use(cors());
app.use(express.json());
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('Hello, Crypto Trading Platform!');
});

app.use('/api/tickers', tickerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mockTrading', mockTradingRoutes);

if (dcClient) {
  console.log('Discord client initialized');
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
