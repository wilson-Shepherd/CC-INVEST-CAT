import WebSocket from "ws";
import "dotenv/config";

const ws = new WebSocket(`wss://stream.binance.com:9443/ws/!ticker@arr`);

const latestPrices = {};

ws.on("message", (data) => {
  const messages = JSON.parse(data);

  messages.forEach((message) => {
    const {
      s: symbol,
      c: lastPrice,
      P: priceChangePercent,
      v: volume,
    } = message;

    latestPrices[symbol.toLowerCase()] = {
      lastPrice,
      priceChangePercent: parseFloat(priceChangePercent),
      volume: parseFloat(volume),
    };
  });
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});

ws.on("close", () => {
  console.warn("WebSocket connection closed");
});

export const getLatestPrices = () => latestPrices;
