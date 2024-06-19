import BinanceWebSocket from './webSocket.js';

const priceCache = new Map();
const binanceWebSocket = new BinanceWebSocket();

binanceWebSocket.on('tickerData', (data) => {
  const symbol = data.s.toLowerCase();
  const price = parseFloat(data.c);
  priceCache.set(symbol, price);
});

export const getPrice = async (symbol) => {
  const cachedPrice = priceCache.get(symbol.toLowerCase());
  if (cachedPrice) {
    return cachedPrice;
  } else {
    throw new Error(`Price for ${symbol} is not available`);
  }
};
