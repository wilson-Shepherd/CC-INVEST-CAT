import crypto from "crypto";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const config = {
  apiKey: process.env.TESTNET_BINANCE_API_KEY,
  apiSecret: process.env.TESTNET_BINANCE_API_SECRET,
  baseURL: "https://testnet.binance.vision/api",
};

const fetchData = async (url, method = "GET", headers = {}) => {
  const response = await fetch(url, { method, headers });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
};

const createSignature = (queryString) =>
  crypto
    .createHmac("sha256", config.apiSecret)
    .update(queryString)
    .digest("hex");

const generateUrl = (endpoint, queryString) =>
  `${config.baseURL}${endpoint}?${queryString}&signature=${createSignature(queryString)}`;

export const getAccountBalance = async () => {
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const url = generateUrl("/v3/account", queryString);

  try {
    const accountInfo = await fetchData(url, "GET", {
      "X-MBX-APIKEY": config.apiKey,
    });

    const getBalance = (asset) => {
      const balance = accountInfo.balances.find((b) => b.asset === asset);
      return balance ? parseFloat(balance.free) : 0;
    };

    const btcBalance = getBalance("BTC");
    const usdtBalance = getBalance("USDT");

    return { BTC: btcBalance, USDT: usdtBalance };
  } catch (error) {
    console.error("Error fetching account balance:", error);
    throw error;
  }
};

export const getMyTrades = async (symbol) => {
  const timestamp = Date.now();
  const queryString = `symbol=${symbol}&timestamp=${timestamp}`;
  const url = generateUrl("/v3/myTrades", queryString);

  try {
    const trades = await fetchData(url, "GET", {
      "X-MBX-APIKEY": config.apiKey,
    });
    return trades.map(({ id, symbol, price, qty, isBuyer, time }) => ({
      id,
      symbol,
      price,
      qty,
      side: isBuyer ? "BUY" : "SELL",
      time,
    }));
  } catch (error) {
    console.error("Error fetching trade history:", error);
    throw error;
  }
};

export const getBTCUSDPrice = async () => {
  const url = "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT";

  try {
    const { price } = await fetchData(url);
    return parseFloat(price);
  } catch (error) {
    console.error("Error fetching BTC/USD price:", error);
    throw error;
  }
};

export const createGrid = (lowerPrice, upperPrice, gridSize) => {
  const step = (upperPrice - lowerPrice) / gridSize;
  return Array.from({ length: gridSize + 1 }, (_, i) => lowerPrice + i * step);
};

export const executeTrade = async (side, quantity, price) => {
  const timestamp = Date.now();
  const queryString = `symbol=BTCUSDT&side=${side}&type=LIMIT&quantity=${quantity}&price=${price}&timeInForce=GTC&timestamp=${timestamp}`;
  const url = generateUrl("/v3/order", queryString);

  try {
    return await fetchData(url, "POST", { "X-MBX-APIKEY": config.apiKey });
  } catch (error) {
    console.error("Error executing trade:", error);
    throw error;
  }
};