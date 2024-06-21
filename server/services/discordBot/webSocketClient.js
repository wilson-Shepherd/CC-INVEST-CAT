import WebSocket from "ws";
import "dotenv/config";

const symbols = ["btcusdt", "bnbusdt", "ethusdt"];
const streams = symbols.map((symbol) => `${symbol}@ticker`).join("/");
const ws = new WebSocket(
  `wss://stream.binance.com:9443/stream?streams=${streams}`,
);

const latestPrices = {};

ws.on("message", (data) => {
  const message = JSON.parse(data);
  const {
    s: symbol,
    c: lastPrice,
    P: priceChangePercent,
    v: volume,
  } = message.data;
  latestPrices[symbol.toLowerCase()] = {
    lastPrice,
    priceChangePercent,
    volume,
  };
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});

ws.on("close", () => {
  console.warn("WebSocket connection closed");
});

export const getLatestPrices = () => latestPrices;
