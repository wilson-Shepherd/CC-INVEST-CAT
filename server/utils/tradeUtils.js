import axios from "axios";

export const TRANSACTION_FEE_RATE = 0.001;
export const PRICE_TOLERANCE = 0.5;
export const ORDER_EXPIRY_DAYS = 30;
export const INITIAL_MARGIN_RATIOS = {
  1: 1,
  3: 0.3333,
  5: 0.2,
  10: 0.1,
};
export const MAINTENANCE_MARGIN_RATIO = 0.5;
export const FINANCING_RATE = 0.01;
export const MAX_LEVERAGE = 10;
export const RISK_FACTOR = 1.5;
export const LIQUIDATION_THRESHOLD = 0.8;

export const logError = (error, context, details) => {
  console.error(
    `[${new Date().toISOString()}] Error in ${context}:`,
    error,
    details,
  );
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
    if (response.data && response.data.price) {
      return parseFloat(response.data.price);
    } else {
      throw new Error("Invalid price data received");
    }
  } catch (error) {
    logError(error, "getCurrentPrice", { symbol });
    throw new Error("Failed to fetch current price");
  }
};

export const getAvailableCryptosUtil = async () => {
  try {
    const response = await axios.get(
      "https://api.binance.com/api/v3/exchangeInfo",
    );
    if (response.data && response.data.symbols) {
      return response.data.symbols
        .filter((symbol) => symbol.quoteAsset === "USDT")
        .map((symbol) => symbol.symbol);
    } else {
      throw new Error("Invalid exchange info data received");
    }
  } catch (error) {
    logError(error, "getAvailableCryptosUtil");
    throw new Error("Failed to fetch available cryptos");
  }
};

export const calculateInitialMargin = (totalAmount, leverage) => {
  return totalAmount.times(
    INITIAL_MARGIN_RATIOS[leverage] || INITIAL_MARGIN_RATIOS[MAX_LEVERAGE],
  );
};

export const calculateMaintenanceMargin = (initialMargin) => {
  return initialMargin.times(MAINTENANCE_MARGIN_RATIO);
};
