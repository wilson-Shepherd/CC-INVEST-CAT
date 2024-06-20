import { getPrice } from './server/services/binance/mockTradingPrice.js';

const testGetPrice = async () => {
  try {
    const btcPrice = await getPrice('btc');
    console.log('BTC Price:', btcPrice);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testGetPrice();
