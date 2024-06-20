import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import connectDB from './config/database.js';
import tickerRoutes from './routes/ticker.js';
import userRoutes from './routes/user.js';
import notificationRoutes from './routes/dcNotification.js';
import mockTradingRoutes from './routes/mockTrading.js';
import { initWebSocket } from './config/websocket.js';
import { errorHandler } from './utils/errorHandler.js';
import dcClient from './services/discordBot/app.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

connectDB();
app.use(cors());
app.use(express.json());
app.use(errorHandler);

app.get('/', (req, res) => {
  res.send('Hello, Crypto Trading Platform!');
});

app.use('/api/ticker', tickerRoutes);
app.use('/api/user', userRoutes);
app.use('/api', notificationRoutes);
app.use('/api/mockTrading', mockTradingRoutes);

if (dcClient) {
  console.log('Discord client initialized');
}

initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
