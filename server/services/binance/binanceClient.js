import Binance from 'binance-api-node';
import dotenv from 'dotenv';

dotenv.config();

const binanceClient = () => {
  return Binance.default ({
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
  });
};

export default binanceClient;
