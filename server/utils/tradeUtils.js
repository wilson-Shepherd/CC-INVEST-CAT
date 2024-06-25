import axios from "axios";

export const TRANSACTION_FEE_RATE = 0.001;
export const PRICE_TOLERANCE = 0.01;
export const ORDER_EXPIRY_DAYS = 30;
export const MARGIN_RATE = 0.1;

export const logError = (error, context, details) => {
  console.error(`Error in ${context}:`, error, details);
};

export const validateAmount = (amount) => {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }
};

export const validateAccount = (account) => {
  if (!account) {
    throw new Error("Account not found");
  }
};

export const getCurrentPrice = async (symbol) => {
  try {
    const response = await axios.get(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`,
    );
    return parseFloat(response.data.price);
  } catch (error) {
    logError(error, "getCurrentPrice");
    throw new Error("Failed to fetch current price");
  }
};

export const getAvailableCryptosUtil = async () => {
  try {
    const response = await axios.get(
      "https://api.binance.com/api/v3/exchangeInfo",
    );
    return response.data.symbols
      .filter((symbol) => symbol.quoteAsset === "USDT")
      .map((symbol) => symbol.symbol);
  } catch (error) {
    logError(error, "getAvailableCryptos");
    throw new Error("Failed to fetch available cryptos");
  }
};
