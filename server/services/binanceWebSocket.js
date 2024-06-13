import WebSocket from 'ws';
import { EventEmitter } from 'events';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

class BinanceWebSocket extends EventEmitter {
  constructor() {
    super();
    this.symbols = [];
    this.connect();
  }

  async fetchSymbols() {
    try {
      const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
      const symbols = response.data.symbols.filter(symbol => symbol.quoteAsset === 'USDT');
      this.symbols = symbols.map(symbol => symbol.symbol.toLowerCase());
    } catch (error) {
      console.error('Error fetching symbols:', error);
    }
  }

  async connect() {
    await this.fetchSymbols();
    const streams = this.symbols.map(symbol => `${symbol}@ticker`).join('/');
    const socketUrl = `wss://stream.binance.com:9443/ws/${streams}`;
    this.ws = new WebSocket(socketUrl);

    this.ws.on('open', () => {
      console.log(`Binance WebSocket API connected`)
    });

    this.ws.on('message', (data) => {
      const message = data.toString('utf-8');
      const jsonMessage = JSON.parse(message);
      this.emit('tickerData', jsonMessage);
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.ws.on('close', () => {
      console.log('WebSocket connection closed, reconnecting...');
      setTimeout(() => this.connect(), 1000);
    });
  }
}

export default BinanceWebSocket;
