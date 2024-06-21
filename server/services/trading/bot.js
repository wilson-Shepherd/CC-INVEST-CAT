import WebSocket from "ws";
import binanceClient from "../binance/client.js";
import {
  createGrid,
  executeTrade,
  getAccountBalance,
  getBTCUSDPrice,
} from "../../utils/tradingUtils.js";

const client = binanceClient(true);

const symbol = "BTCUSDT";
const interval = "1m";
const lowerPrice = 60000;
const upperPrice = 70000;
const gridSize = 100;

let totalProfitLoss = 0;
const balanceHistory = [];
const tradeCooldown = 60000;

const lastTradePrices = new Map();

function openWebSocket() {
  const ws = new WebSocket(
    `wss://testnet.binance.vision/ws/${symbol.toLowerCase()}@kline_${interval}`,
  );

  ws.on("open", () => {
    console.log("WebSocket connection opened.");
  });

  ws.on("message", async (data) => {
    const parsedData = JSON.parse(data);
    if (parsedData.k && parsedData.k.x) {
      const closePrice = parseFloat(parsedData.k.c);
      await handleNewPrice(closePrice, parsedData.k.T);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("close", () => {
    console.log("WebSocket closed, reconnecting...");
    setTimeout(openWebSocket, 1000);
  });
}

async function handleNewPrice(price, closeTime) {
  const grid = createGrid(lowerPrice, upperPrice, gridSize);

  try {
    const { BTC, USDT } = await getAccountBalance();
    const btcPriceInUSD = await getBTCUSDPrice();

    const totalBTCInUSD = BTC * btcPriceInUSD;
    const totalUSDTInUSD = USDT;
    const totalAssetsInUSD = totalBTCInUSD + totalUSDTInUSD;

    console.log(`BTC in USD: ${totalBTCInUSD}`);
    console.log(`USDT: ${totalUSDTInUSD}`);
    console.log(`Total Assets in USD: ${totalAssetsInUSD}`);

    if (totalAssetsInUSD < 50) {
      // 假設最小交易單位需要至少 50 美元
      console.log("Insufficient total assets to continue trading.");
      return;
    }

    const currentTime = Date.now();

    for (let i = 0; i < grid.length - 1; i++) {
      const gridLower = grid[i];
      const gridUpper = grid[i + 1];

      if (
        price <= gridLower &&
        USDT >= price * (1 / gridSize) &&
        (!lastTradePrices.has(gridLower) ||
          currentTime - lastTradePrices.get(gridLower) > tradeCooldown)
      ) {
        const quantity = (1 / gridSize).toFixed(8);
        const cost = quantity * price;

        if (USDT < cost) {
          console.log(`Insufficient funds to buy at price ${price}`);
          return;
        }

        console.log(`Buy price: ${price}`);
        const result = await executeTrade("BUY", quantity, price);
        if (
          result.status === "FILLED" ||
          result.status === "PARTIALLY_FILLED"
        ) {
          lastTradePrices.set(gridLower, currentTime);
          balanceHistory.push({
            time: closeTime,
            action: "buy",
            price: price,
            cost: cost,
            BTC: BTC + parseFloat(quantity),
            USDT: USDT - cost,
            totalProfitLoss: totalProfitLoss,
          });
        }
      } else if (
        price >= gridUpper &&
        BTC >= 1 / gridSize &&
        (!lastTradePrices.has(gridUpper) ||
          currentTime - lastTradePrices.get(gridUpper) > tradeCooldown)
      ) {
        const quantity = (1 / gridSize).toFixed(8);
        const profitLoss = quantity * (price - gridLower);
        totalProfitLoss += profitLoss;
        const proceeds = quantity * price;

        if (BTC < quantity) {
          console.log(`Insufficient position to sell at price ${price}`);
          return;
        }

        console.log(`Sell price: ${price}`);
        const result = await executeTrade("SELL", quantity, price);
        if (
          result.status === "FILLED" ||
          result.status === "PARTIALLY_FILLED"
        ) {
          lastTradePrices.set(gridUpper, currentTime);
          balanceHistory.push({
            time: closeTime,
            action: "sell",
            price: price,
            proceeds: proceeds,
            BTC: BTC - parseFloat(quantity),
            USDT: USDT + proceeds,
            profitLoss: profitLoss,
            totalProfitLoss: totalProfitLoss,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error occurred while handling new price:", error);
  }
}

openWebSocket();
