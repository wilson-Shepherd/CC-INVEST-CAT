import MockAccount from '../models/mockAccount.js';
import MockTrade from '../models/mockTrade.js';
import { getPrice } from '../services/binance/mockTradingPrice.js';

export const createMockTrade = async (req, res) => {
  const { userId, symbol, amount, type } = req.body;
  try {
    const price = await getPrice(symbol);
    const account = await MockAccount.findOne({ userId });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    let newTrade;
    if (type === 'buy') {
      const cost = price * amount;
      if (account.cash < cost) {
        return res.status(400).json({ error: 'Insufficient funds' });
      }
      account.cash -= cost;
      account.holdings.set(symbol, (account.holdings.get(symbol) || 0) + amount);
      newTrade = new MockTrade({ userId, symbol, amount, price, type });
    } else if (type === 'sell') {
      if ((account.holdings.get(symbol) || 0) < amount) {
        return res.status(400).json({ error: 'Insufficient holdings' });
      }
      account.cash += price * amount;
      account.holdings.set(symbol, (account.holdings.get(symbol) || 0) - amount);
      newTrade = new MockTrade({ userId, symbol, amount, price, type });
    }

    await account.save();
    await newTrade.save();
    res.status(201).json(newTrade);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getMockAccount = async (req, res) => {
  const { userId } = req.params;
  try {
    const account = await MockAccount.findOne({ userId });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    const holdingsValue = await Promise.all([...account.holdings.keys()].map(async (symbol) => {
      const price = await getPrice(symbol);
      return { symbol, value: price * account.holdings.get(symbol) };
    }));

    res.status(200).json({
      cash: account.cash,
      holdings: account.holdings,
      holdingsValue
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
