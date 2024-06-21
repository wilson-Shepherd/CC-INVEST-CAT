import MockOrder from "../models/mockOrder.js";
import MockAccount from "../models/mockAccount.js";
import axios from "axios";

export const getMockAccount = async (req, res) => {
  const { userId } = req.params;
  try {
    const account = await MockAccount.findOne({ userId }).lean();
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.status(200).json({
      cash: account.cash,
      holdings: account.holdings,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createOrder = async (req, res) => {
  const { symbol, quantity, orderType } = req.body;
  const { userId } = req.params;

  try {
    const account = await MockAccount.findOne({ userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const price = await getCurrentPrice(symbol);

    if (orderType === "buy") {
      if (account.cash < quantity * price) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      account.cash -= quantity * price;
      account.holdings.set(
        symbol,
        (account.holdings.get(symbol) || 0) + quantity,
      );
    } else if (orderType === "sell") {
      if (
        !account.holdings.has(symbol) ||
        account.holdings.get(symbol) < quantity
      ) {
        return res.status(400).json({ message: "Insufficient assets" });
      }
      account.cash += quantity * price;
      account.holdings.set(symbol, account.holdings.get(symbol) - quantity);

      if (account.holdings.get(symbol) === 0) {
        account.holdings.delete(symbol);
      }
    }

    await account.save();

    const order = await MockOrder.create({
      userId,
      symbol,
      quantity,
      orderType,
      price,
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function getCurrentPrice(symbol) {
  const response = await axios.get(
    `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`,
  );
  return parseFloat(response.data.price);
}

export const getOrders = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await MockOrder.find({ userId }).lean();
    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrder = async (req, res) => {
  const { userId, orderId } = req.params;
  try {
    const order = await MockOrder.findOne({ _id: orderId, userId }).lean();
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAvailableCryptos = async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.binance.com/api/v3/exchangeInfo",
    );
    const symbols = response.data.symbols.map((symbol) => symbol.symbol);
    res.status(200).json(symbols);
  } catch (error) {
    console.error("Error fetching available cryptos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
