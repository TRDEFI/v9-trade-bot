import axios from 'axios';
import WebSocket from 'ws';

const BASE_URL = 'https://fapi.binance.com';
const WS_URL = 'wss://fstream.binance.com/ws/!ticker@arr';

export interface Kline {
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

export class BinanceClient {
  private ws: WebSocket | null = null;
  private pricesCache: Record<string, number> = {};
  private wsConnected = false;

  constructor() {
    this.connectWs();
  }

  private connectWs() {
    if (this.ws) {
      this.ws.removeAllListeners();
      try { this.ws.close(); } catch (e) {}
    }

    this.ws = new WebSocket(WS_URL);

    this.ws.on('open', () => {
      console.log('[Binance WS] Connected to Futures !ticker@arr stream');
      this.wsConnected = true;
    });

    this.ws.on('message', (data: WebSocket.RawData) => {
      try {
        const payload = JSON.parse(data.toString());
        if (Array.isArray(payload)) {
          for (const item of payload) {
            // "s": symbol, "c": last price
            if (item.s && item.c) {
              this.pricesCache[item.s] = parseFloat(item.c);
            }
          }
        }
      } catch (e) {
        console.error('[Binance WS] Parse error:', e);
      }
    });

    this.ws.on('close', () => {
      console.log('[Binance WS] Disconnected. Reconnecting in 3 seconds...');
      this.wsConnected = false;
      setTimeout(() => this.connectWs(), 3000);
    });

    this.ws.on('error', (err) => {
      console.error('[Binance WS] Error:', err.message);
      this.ws?.close();
    });
  }

  async getPrice(symbol: string): Promise<number | null> {
    if (this.wsConnected && this.pricesCache[symbol]) {
      return this.pricesCache[symbol];
    }
    try {
      const response = await axios.get(`${BASE_URL}/fapi/v1/ticker/price`, {
        params: { symbol },
        timeout: 8000
      });
      return parseFloat(response.data.price);
    } catch (e) {
      return null;
    }
  }

  async getAllPrices(): Promise<Record<string, number>> {
    if (this.wsConnected && Object.keys(this.pricesCache).length > 0) {
      return { ...this.pricesCache }; // Return cached prices from WS
    }
    try {
      const response = await axios.get(`${BASE_URL}/fapi/v1/ticker/price`, {
        timeout: 8000
      });
      if (Array.isArray(response.data)) {
        const prices: Record<string, number> = {};
        for (const item of response.data) {
          prices[item.symbol] = parseFloat(item.price);
        }
        return prices;
      }
      return {};
    } catch (e) {
      return {};
    }
  }

  async getKlines(symbol: string, interval: string = '5m', limit: number = 24): Promise<Kline[]> {
    try {
      const response = await axios.get(`${BASE_URL}/fapi/v1/klines`, {
        params: { symbol, interval, limit },
        timeout: 8000
      });
      if (!Array.isArray(response.data)) return [];
      
      return response.data.map((x: any[]) => ({
        o: parseFloat(x[1]),
        h: parseFloat(x[2]),
        l: parseFloat(x[3]),
        c: parseFloat(x[4]),
        v: parseFloat(x[5])
      }));
    } catch (e) {
      return [];
    }
  }
}
