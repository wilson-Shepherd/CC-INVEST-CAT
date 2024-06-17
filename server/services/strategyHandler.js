import { calculateSignal } from '../strategies/simpleMovingAverage.js';
import binanceClient from './binanceClient.js';

const client = binanceClient();

export const handleStrategy = async (data) => {
  const signal = calculateSignal(data);

  if (signal.action === 'buy') {
    await client.order({
      symbol: signal.symbol,
      side: 'BUY',
      type: 'MARKET',
      quantity: signal.quantity,
    });
  } else if (signal.action === 'sell') {
    await client.order({
      symbol: signal.symbol,
      side: 'SELL',
      type: 'MARKET',
      quantity: signal.quantity,
    });
  }
};
