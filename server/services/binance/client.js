import Binance from "binance-api-node";
import dotenv from "dotenv";

dotenv.config();

const binanceClient = (useTestnet = false) => {
  const config = useTestnet
    ? {
        apiKey: process.env.TESTNET_BINANCE_API_KEY,
        apiSecret: process.env.TESTNET_BINANCE_API_SECRET,
        httpBase: "https://testnet.binance.vision/api",
        wsBase: "wss://testnet.binance.vision/ws",
      }
    : {
        apiKey: process.env.MAINNET_BINANCE_API_KEY,
        apiSecret: process.env.MAINNET_BINANCE_API_SECRET,
      };

  return Binance.default(config);
};

export default binanceClient;
