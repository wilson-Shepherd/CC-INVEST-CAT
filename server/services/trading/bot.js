/*
import {
  createGrid,
  executeTrade,
  getAccountBalance,
  getBTCUSDPrice,
} from "../../utils/botUtils.js";

const interval = 15 * 60 * 1000;
const lowerPrice = 60000;
const upperPrice = 70000;
const gridSize = 100;

let totalProfitLoss = 0;
const balanceHistory = [];
const tradeCooldown = 15 * 60 * 1000;

const lastTradePrices = new Map();

let isTradingActive = false;

async function checkPriceAndTrade() {
  if (!isTradingActive) return;

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
      console.log("Insufficient total assets to continue trading.");
      return;
    }

    const currentTime = Date.now();

    for (let i = 0; i < grid.length - 1; i++) {
      const gridLower = grid[i];
      const gridUpper = grid[i + 1];

      if (
        btcPriceInUSD <= gridLower &&
        USDT >= btcPriceInUSD * (1 / gridSize) &&
        (!lastTradePrices.has(gridLower) ||
          currentTime - lastTradePrices.get(gridLower) > tradeCooldown)
      ) {
        const quantity = (1 / gridSize).toFixed(8);
        const cost = quantity * btcPriceInUSD;

        if (USDT < cost) {
          console.log(`Insufficient funds to buy at price ${btcPriceInUSD}`);
          return;
        }

        console.log(`Buy price: ${btcPriceInUSD}`);
        const result = await executeTrade("BUY", quantity, btcPriceInUSD);
        if (
          result.status === "FILLED" ||
          result.status === "PARTIALLY_FILLED"
        ) {
          lastTradePrices.set(gridLower, currentTime);
          balanceHistory.push({
            time: currentTime,
            action: "buy",
            price: btcPriceInUSD,
            cost: cost,
            BTC: BTC + parseFloat(quantity),
            USDT: USDT - cost,
            totalProfitLoss: totalProfitLoss,
          });
        }
      } else if (
        btcPriceInUSD >= gridUpper &&
        BTC >= 1 / gridSize &&
        (!lastTradePrices.has(gridUpper) ||
          currentTime - lastTradePrices.get(gridUpper) > tradeCooldown)
      ) {
        const quantity = (1 / gridSize).toFixed(8);
        const profitLoss = quantity * (btcPriceInUSD - gridLower);
        totalProfitLoss += profitLoss;
        const proceeds = quantity * btcPriceInUSD;

        if (BTC < quantity) {
          console.log(
            `Insufficient position to sell at price ${btcPriceInUSD}`,
          );
          return;
        }

        console.log(`Sell price: ${btcPriceInUSD}`);
        const result = await executeTrade("SELL", quantity, btcPriceInUSD);
        if (
          result.status === "FILLED" ||
          result.status === "PARTIALLY_FILLED"
        ) {
          lastTradePrices.set(gridUpper, currentTime);
          balanceHistory.push({
            time: currentTime,
            action: "sell",
            price: btcPriceInUSD,
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

let intervalId;

export const startTrading = () => {
  if (!isTradingActive) {
    isTradingActive = true;
    intervalId = setInterval(checkPriceAndTrade, interval);
    checkPriceAndTrade();
  }
};

export const stopTrading = () => {
  if (isTradingActive) {
    isTradingActive = false;
    clearInterval(intervalId);
  }
};
*/