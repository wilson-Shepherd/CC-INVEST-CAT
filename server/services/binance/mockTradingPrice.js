import binanceClient from './client.js';

export const getPrice = async (symbol) => {
  try {
    const client = binanceClient();
    const prices = await client.prices();
    const price = prices[symbol.toUpperCase()];
    if (!price) {
      throw new Error(`Price for ${symbol} is not available`);
    }
    return parseFloat(price);
  } catch (error) {
    console.error('Error fetching price:', error.message);
    throw new Error(`Price for ${symbol} is not available`);
  }
};
