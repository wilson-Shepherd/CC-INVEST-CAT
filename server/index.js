import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { router as tickerRoutes, initWebSocketRoutes } from './routes/tickerRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, Crypto Trading Platform!');
});

app.use('/api', tickerRoutes);

const server = initWebSocketRoutes(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
