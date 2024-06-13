import Binance from 'binance-api-node';
import { EventEmitter } from 'events';
import dotenv from 'dotenv';

dotenv.config();

class BinanceWebSocket extends EventEmitter {
  constructor() {
    super();
    this.client = Binance();
    this.symbols = [];
    this.connect();
  }

  async fetchSymbols() {
    try {
      const exchangeInfo = await this.client.exchangeInfo();
      const symbols = exchangeInfo.symbols.filter(symbol => symbol.quoteAsset === 'USDT');
      this.symbols = symbols.map(symbol => symbol.symbol.toLowerCase());
    } catch (error) {
      console.error('Error fetching symbols:', error);
    }
  }

  async connect() {
    await this.fetchSymbols();
    const streams = this.symbols.map(symbol => `${symbol}@ticker`).join('/');
    
    this.client.ws.customSubStream(streams, data => {
      this.emit('tickerData', data);
    });

    console.log('Binance WebSocket API connected');
  }
}

export default BinanceWebSocket;
