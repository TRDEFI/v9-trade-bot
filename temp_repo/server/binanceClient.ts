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
  t: number; // open time
}

export class BinanceClient {
  private ws: WebSocket | null = null;
  private klineWsConnections: WebSocket[] = [];
  public pricesCache: Record<string, number> = {};
  public klinesCache: Record<string, Record<string, Kline[]>> = {};
  private wsConnected = false;
  
  public onCandleClose: ((sym: string, interval: string) => void) | null = null;

  private restQueue: Promise<void> = Promise.resolve();
  private lastRestCall = 0;

  constructor() {
    this.connectWs();
  }

  private async throttledRest<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.restQueue = this.restQueue.then(async () => {
        const elapsed = Date.now() - this.lastRestCall;
        if (elapsed < 100) await new Promise(r => setTimeout(r, 100 - elapsed));
        this.lastRestCall = Date.now();
        try { resolve(await fn()); } catch(e) { reject(e); }
      });
    });
  }

  public subscribeKlines(symbols: string[], intervals: string[]) {
    // Collect all streams we need
    const streams: string[] = [];
    for (const sym of symbols) {
      for (const inv of intervals) {
        streams.push(`${sym.toLowerCase()}@kline_${inv}`);
      }
    }

    // A single WS connection to Binance can listen to max 200 streams.
    // We break them into chunks of 150 to be safe.
    const CHUNK_SIZE = 150;
    for (let i = 0; i < streams.length; i += CHUNK_SIZE) {
        const chunk = streams.slice(i, i + CHUNK_SIZE);
        this.createKlineWsConnection(chunk);
    }
  }

  private createKlineWsConnection(streams: string[]) {
    const streamNames = streams.join('/');
    const ws = new WebSocket(`wss://fstream.binance.com/stream?streams=${streamNames}`);
    
    ws.on('open', () => {
      console.log(`[Binance WS] Connected to Kline streams (${streams.length} streams)`);
    });

    ws.on('message', (data: WebSocket.RawData) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.stream && payload.data && payload.data.k) {
          const k = payload.data.k;
          const symbol = payload.data.s; // e.g. "BTCUSDT"
          const interval = k.i;

          if (!this.klinesCache[symbol]) this.klinesCache[symbol] = {};
          if (!this.klinesCache[symbol][interval]) this.klinesCache[symbol][interval] = [];

          let list = this.klinesCache[symbol][interval];
          
          if (list.length > 0) {
            const lastCandle = list[list.length - 1];
            if (lastCandle.t === k.t) {
              // Update existing candle
              lastCandle.o = parseFloat(k.o);
              lastCandle.h = parseFloat(k.h);
              lastCandle.l = parseFloat(k.l);
              lastCandle.c = parseFloat(k.c);
              lastCandle.v = parseFloat(k.v);
            } else if (k.t > lastCandle.t) {
              // New candle started (old candle closed)
              if (this.onCandleClose) {
                this.onCandleClose(symbol, interval);
              }
              list.push({
                t: k.t,
                o: parseFloat(k.o),
                h: parseFloat(k.h),
                l: parseFloat(k.l),
                c: parseFloat(k.c),
                v: parseFloat(k.v)
              });
              // Keep only last 100 to save memory
              if (list.length > 100) {
                list.shift();
              }
            }
          } else {
             // If REST API hasn't loaded history yet, we can safely ignore the push
             // until history is loaded, otherwise we have a list of length 1.
          }
        }
      } catch (e) {
         // ignore parse errors
      }
    });

    ws.on('close', () => {
      console.log(`[Binance WS] Kline WS Disconnected. Reconnecting in 3 seconds...`);
      setTimeout(() => this.createKlineWsConnection(streams), 3000);
    });

    ws.on('error', (err) => {
      console.error('[Binance WS] Kline Error:', err.message);
      ws.close();
    });

    this.klineWsConnections.push(ws);
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
    if (!this.klinesCache[symbol]) this.klinesCache[symbol] = {};
    const cache = this.klinesCache[symbol][interval];
    
    // If cache doesn't exist or doesn't have enough candles, fetch via REST once.
    // Afterwards, the WebSocket will keep this cache updated in real time.
    if (!cache || cache.length < limit) {
      try {
        const response = await this.throttledRest(() => axios.get(`${BASE_URL}/fapi/v1/klines`, {
          params: { symbol, interval, limit: Math.max(limit, 50) }, // Fetch 50 to have enough history
          timeout: 5000
        }));
        if (Array.isArray(response.data)) {
          this.klinesCache[symbol][interval] = response.data.map((x: any[]) => ({
            t: parseInt(x[0]),
            o: parseFloat(x[1]),
            h: parseFloat(x[2]),
            l: parseFloat(x[3]),
            c: parseFloat(x[4]),
            v: parseFloat(x[5])
          }));
        }
      } catch (e) {
        // Fallback or ignore
        return [];
      }
    }
    
    return this.klinesCache[symbol][interval] || [];
  }
}
