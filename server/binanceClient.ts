import axios from 'axios';
import WebSocket from 'ws';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

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
  private klinesLastRestFetch: Record<string, Record<string, number>> = {};
  private globalRestBackoffUntil: number = 0;
  private wsConnected = false;

  constructor() {
    this.connectWs();
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
              // New candle started
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

  async getTop300VolumePairs(): Promise<string[]> {
    try {
      const response = await axios.get(`${BASE_URL}/fapi/v1/ticker/24hr`, { timeout: 8000 });
      if (Array.isArray(response.data)) {
        return response.data
          .filter((t: any) => t.symbol.endsWith('USDT'))
          .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
          .map((t: any) => t.symbol)
          .slice(0, 300);
      }
      return [];
    } catch (e) {
      console.error('[Binance API] Failed to fetch top 300 pairs:', e);
      return [];
    }
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
    if (!this.klinesLastRestFetch[symbol]) this.klinesLastRestFetch[symbol] = {};

    const cache = this.klinesCache[symbol][interval];
    const now = Date.now();
    
    // Global backoff active?
    if (now < this.globalRestBackoffUntil) {
      return cache || [];
    }
    
    // If cache doesn't exist or doesn't have enough candles, fetch via REST once.
    // Afterwards, the WebSocket will keep this cache updated in real time.
    let isStale = false;
    if (cache && cache.length > 0) {
       const lastCandle = cache[cache.length - 1];
       const intervalMinutes = interval === '1h' ? 60 : interval === '15m' ? 15 : 5;
       if (now - lastCandle.t > intervalMinutes * 60 * 1000 * 3) {
           isStale = true;
       }
    }

    if (!cache || cache.length < limit || isStale) {
      // Cooldown for this specific pair+interval to avoid 60req/s spam
      const lastFetch = this.klinesLastRestFetch[symbol][interval] || 0;
      if (now - lastFetch < 60000) { 
          // Wait at least 60 seconds before retrying the same missing REST data
          return cache || [];
      }
      this.klinesLastRestFetch[symbol][interval] = now;

      try {
        const response = await axios.get(`${BASE_URL}/fapi/v1/klines`, {
          params: { symbol, interval, limit: Math.max(limit, 50) }, // Fetch 50 to have enough history
          timeout: 5000
        });
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
      } catch (e: any) {
        if (e.response && (e.response.status === 429 || e.response.status === 418)) {
            console.error(`[Binance API] Rate Limited! Backing off entirely for 1 minute.`);
            this.globalRestBackoffUntil = now + 60000;
        }
        return cache || [];
      }
    }
    
    return this.klinesCache[symbol][interval] || [];
  }

  // --- LIVE TRADING FUNCTIONS ---

  get apiKey() {
    return process.env.BINANCE_API_KEY || '';
  }

  get apiSecret() {
    return process.env.BINANCE_API_SECRET || '';
  }

  private sign(queryString: string): string {
    return crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
  }

  async setupMarginAndLeverage(symbol: string, lev: number): Promise<void> {
    if (!this.apiKey || !this.apiSecret) return;
    try {
      const timestamp = Date.now();
      
      // Set to ISOLATED margin type
      const marginQuery = `symbol=${symbol}&marginType=ISOLATED&timestamp=${timestamp}`;
      const marginSig = this.sign(marginQuery);
      try {
        await axios.post(`${BASE_URL}/fapi/v1/marginType?${marginQuery}&signature=${marginSig}`, null, {
          headers: { 'X-MBX-APIKEY': this.apiKey }
        });
      } catch (e: any) {
        // Code -4046 means 'No need to change margin type' which is totally fine
        if (e.response?.data?.code !== -4046) {
           console.error(`[Binance API] Failed to set Isolated Margin for ${symbol}`);
        }
      }

      // Set Leverage
      const levQuery = `symbol=${symbol}&leverage=${lev}&timestamp=${Date.now()}`;
      const levSig = this.sign(levQuery);
      await axios.post(`${BASE_URL}/fapi/v1/leverage?${levQuery}&signature=${levSig}`, null, {
        headers: { 'X-MBX-APIKEY': this.apiKey }
      });
    } catch (e: any) {
      console.error(`[Binance API] Setup Leverge error for ${symbol}:`, e.response?.data || e.message);
    }
  }

  public exchangeInfoCache: any = null;

  async getExchangeInfo() {
    if (this.exchangeInfoCache) return this.exchangeInfoCache;
    try {
      const resp = await axios.get(`${BASE_URL}/fapi/v1/exchangeInfo`);
      this.exchangeInfoCache = resp.data;
      return this.exchangeInfoCache;
    } catch (e) {
      console.error('[Binance API] Failed to fetch exchange info', e);
      return null;
    }
  }

  async placeMarketOrder(symbol: string, side: 'BUY' | 'SELL', marginUsd: number, lev: number, currentPrice: number): Promise<boolean> {
    if (!this.apiKey || !this.apiSecret) {
      console.log('[Binance SIMULATION] Order simulated due to missing API keys.');
      return true;
    }
    
    try {
      await this.setupMarginAndLeverage(symbol, lev);
      const exInfo = await this.getExchangeInfo();
      
      let quantityStr = '0';
      if (exInfo) {
          const symInfo = exInfo.symbols.find((s: any) => s.symbol === symbol);
          if (symInfo) {
              const lotSizeFilter = symInfo.filters.find((f: any) => f.filterType === 'LOT_SIZE');
              const stepSize = parseFloat(lotSizeFilter?.stepSize || '0.001');
              
              // Calculate notional in base asset
              const notional = marginUsd * lev;
              const rawQuantity = notional / currentPrice;
              
              // Round down to nearest stepSize
              const precision = Math.max(0, -Math.floor(Math.log10(stepSize)));
              const qty = Math.floor(rawQuantity / stepSize) * stepSize;
              quantityStr = qty.toFixed(precision);
          }
      }
      
      if (parseFloat(quantityStr) <= 0) {
          console.error(`[Binance API] Quantity calculated as <= 0 for ${symbol}`);
          return false;
      }

      const timestamp = Date.now();
      const query = `symbol=${symbol}&side=${side}&type=MARKET&quantity=${quantityStr}&timestamp=${timestamp}`;
      const sig = this.sign(query);

      const res = await axios.post(`${BASE_URL}/fapi/v1/order?${query}&signature=${sig}`, null, {
        headers: { 'X-MBX-APIKEY': this.apiKey }
      });
      console.log(`[Binance API] MARKET ${side} ${quantityStr} ${symbol} SUCCESS`, res.data.orderId);
      return true;
    } catch (e: any) {
      console.error(`[Binance API] MARKET ${side} failed for ${symbol}:`, e.response?.data || e.message);
      return false;
    }
  }

  async closeMarketOrder(symbol: string, side: 'BUY' | 'SELL'): Promise<boolean> {
      // Need to fetch current position amount to close it fully
      if (!this.apiKey || !this.apiSecret) return true;
      try {
          const timestamp = Date.now();
          const query = `symbol=${symbol}&timestamp=${timestamp}`;
          const sig = this.sign(query);
          const posRes = await axios.get(`${BASE_URL}/fapi/v2/positionRisk?${query}&signature=${sig}`, {
              headers: { 'X-MBX-APIKEY': this.apiKey }
          });
          
          if (Array.isArray(posRes.data) && posRes.data.length > 0) {
              const pos = posRes.data[0];
              const positionAmt = Math.abs(parseFloat(pos.positionAmt));
              if (positionAmt > 0) {
                  // If position is long, we SELL to close. If position is short, we BUY to close.
                  const closeSide = parseFloat(pos.positionAmt) > 0 ? 'SELL' : 'BUY';

                  const closeQuery = `symbol=${symbol}&side=${closeSide}&type=MARKET&quantity=${positionAmt}&reduceOnly=true&timestamp=${Date.now()}`;
                  const closeSig = this.sign(closeQuery);
                  await axios.post(`${BASE_URL}/fapi/v1/order?${closeQuery}&signature=${closeSig}`, null, {
                      headers: { 'X-MBX-APIKEY': this.apiKey }
                  });
                  console.log(`[Binance API] CLOSED POSITION ${symbol}`);
                  return true;
              }
          }
          return false;
      } catch (e: any) {
          console.error(`[Binance API] Close failed for ${symbol}:`, e.response?.data || e.message);
          return false;
      }
  }
}
