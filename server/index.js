import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './database.js';
import { router as tickerRoutes, initWebSocketRoutes } from './routes/tickerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import testRoutes from './routes/testRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, Crypto Trading Platform!');
});

app.use('/api', tickerRoutes);
app.use('/api', userRoutes);
app.use('/api', testRoutes);

const server = initWebSocketRoutes(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
