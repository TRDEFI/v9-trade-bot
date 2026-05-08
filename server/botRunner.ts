import { BinanceClient } from './binanceClient.js';
import { getSignal } from './strategy.js';

export const USER_CONFIG = {
    budget:        5000,
    lev:           5,
    stop_pct:      2.0,   
    min_score:     0.75,  
    max_open:      2,     
    cooldown_min:  5,     
    run_minutes:   60,    
    tp_pct:        0.80   
};

export const PAIRS = [
  'XAUUSDT',    'XAGUSDT',  'TSLAUSDT',
  'XPTUSDT',    'XPDUSDT',  'INTCUSDT',
  'HOODUSDT',   'MSTRUSDT', 'AMZNUSDT',
  'CRCLUSDT',   'COINUSDT', 'PLTRUSDT',
  'COPPERUSDT', 'EWYUSDT',  'EWJUSDT',
  'PAYPUSDT',   'METAUSDT', 'NVDAUSDT',
  'GOOGLUSDT',  'CLUSDT',   'BZUSDT',
  'NATGASUSDT', 'QQQUSDT',  'SPYUSDT',
  'AAPLUSDT',   'TSMUSDT',  'MUUSDT',
  'SNDKUSDT',   'MSFTUSDT', 'AVGOUSDT',
  'BABAUSDT',   'AMDUSDT',  'QCOMUSDT',
  'USARUSDT'
];

export class BotRunner {
  isRunning = false;
  binance = new BinanceClient();
  
  sessionStart = Date.now();
  sessionNum = 1;
  capital = USER_CONFIG.budget;
  reservedCapital = 0;
  totalRealizedPnl = 0;
  allTimeHigh = USER_CONFIG.budget;
  
  openPositions: Record<string, any> = {};
  closedPositions: any[] = [];
  reversalCooldown: Record<string, number> = {};
  
  loopInterval: NodeJS.Timeout | null = null;
  startTimeStr: number = Date.now();

  downloadableLog: string | null = null;
  dynamicConfig: any = {};

  sessionDurationSec = 0;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.sessionStart = Date.now();
    if (!this.startTimeStr) this.startTimeStr = Date.now();
    this.loop();
  }

  stop() {
    if (this.isRunning) {
      this.sessionDurationSec += Math.floor((Date.now() - this.sessionStart) / 1000);
    }
    this.isRunning = false;
    if (this.loopInterval) {
      clearTimeout(this.loopInterval);
      this.loopInterval = null;
    }
    this.generateLog();
  }

  generateLog() {
    if (this.closedPositions.length === 0) return;
    const headers = ['Kapanis Zamani', 'Aclis Zamani', 'Sembol', 'Yon', 'Giris_Price', 'Cikis_Price', 'Lev', 'Margin', 'P&L_USD', 'Neden', 'Strateji'];
    const rows = this.closedPositions.map(p => {
       return [
         new Date(p.closed).toISOString(),
         new Date(p.opened).toISOString(),
         p.sym,
         p.side,
         p.entry,
         p.closed_price,
         p.lev,
         p.size,
         p.pnl.toFixed(4),
         p.reason,
         p.strat
       ].join(',');
    });
    this.downloadableLog = [headers.join(','), ...rows].join('\n');
  }

  async loop() {
    if (!this.isRunning) return;
    try {
      await this.tick();
    } catch (e) {
      console.error('Error in bot tick', e);
    }
    if (this.isRunning) {
      // "Sürekli (2sn loop)"
      this.loopInterval = setTimeout(() => this.loop(), 2000);
    }
  }

  async closePosition(sym: string, reason: string, currentPrices: any) {
    const pos = this.openPositions[sym];
    if (!pos) return;
    
    const now = Date.now();
    const p = currentPrices[sym];
    if (!p) return;

    const notionalValue = pos.size * pos.lev;
    // TradFi Taker (market) for entry = 0.04%, Maker (limit) for TP = 0%, SL (market) = 0.04%
    const exitFee = reason === 'TP' ? 0 : 0.0004;
    const commissionUsd = notionalValue * (0.0004 + exitFee);
    const rawPnl = pos.side === 'LONG' ? ((p - pos.entry) / pos.entry) : ((pos.entry - p) / pos.entry);
    const grossPnl = notionalValue * rawPnl;
    const netPnlUsd = grossPnl - commissionUsd;

    this.totalRealizedPnl += netPnlUsd;
    this.capital = USER_CONFIG.budget + this.totalRealizedPnl;
    this.reservedCapital -= pos.size;
    
    if (this.capital > this.allTimeHigh) {
      this.allTimeHigh = this.capital;
    }

    this.closedPositions.push({
      sym,
      side: pos.side,
      entry: pos.entry,
      closed_price: p,
      lev: pos.lev,
      size: pos.size,
      pnl: netPnlUsd,
      strat: pos.strat,
      reason,
      opened: pos.opened_at,
      closed: now
    });
    
    delete this.openPositions[sym];
  }

  async tick() {
    const now = Date.now();
    const currentPrices = await this.binance.getAllPrices();
    
    let currentTotalNetPnl = 0;
    let currentTotalUsedMargin = 0;

    for (const sym of Object.keys(this.openPositions)) {
      const pos = this.openPositions[sym];
      const p = currentPrices[sym];
      if (!p) continue;
      
      const notionalValue = pos.size * pos.lev;
      // Unrealized PnL only deducts the entry fee (Taker: 0.04%), Exit fee is unknown yet but varies by TP (0%) or SL (0.04%)
      const commissionUsd = notionalValue * 0.0004;
      const pnlRaw = pos.side === 'LONG' ? ((p - pos.entry) / pos.entry) : ((pos.entry - p) / pos.entry);
      const grossUsd = notionalValue * pnlRaw;
      const netPnlUsd = grossUsd - commissionUsd;
      
      pos.currentPrice = p;
      pos.netPnlUsd = netPnlUsd;
      pos.pnlPct = (netPnlUsd / pos.size) * 100;
      
      currentTotalNetPnl += netPnlUsd;
      currentTotalUsedMargin += pos.size;
    }

    if (this.capital <= USER_CONFIG.budget * 0.5) {
      console.log('DRAWDOWN LIMIT REACHED - PAUSING BOT');
      this.stop();
      return;
    }

    // 1. Check Open positions for TP / SL
    for (const sym of Object.keys(this.openPositions)) {
      const pos = this.openPositions[sym];
      const p = pos.currentPrice;

      let reason = null;
      
      // TP/SL Checks
      if (pos.side === 'LONG') {
        if (p >= pos.tp_price) reason = 'TP';
        if (p <= pos.sl_price) reason = 'SL';
      } else {
        if (p <= pos.tp_price) reason = 'TP';
        if (p >= pos.sl_price) reason = 'SL';
      }

      if (reason) {
        if (reason === 'SL') {
           // cooldown'a 5dk ekle
           this.reversalCooldown[sym] = now + (USER_CONFIG.cooldown_min * 60 * 1000);
        } else if (reason === 'TP') {
           // recently_closed'a 5dk ekle (ayni logic cooldown ile)
           this.reversalCooldown[sym] = now + (USER_CONFIG.cooldown_min * 60 * 1000);
        }
        await this.closePosition(sym, reason, currentPrices);
      }
    }

    // 2. Open new positions
    // Check max_open
    if (Object.keys(this.openPositions).length >= USER_CONFIG.max_open) return;

    await Promise.all(PAIRS.map(async (sym) => {
      if (Object.keys(this.openPositions).length >= USER_CONFIG.max_open) return;
      if (this.openPositions[sym]) return;
      if (this.reversalCooldown[sym] && now < this.reversalCooldown[sym]) return;

      const p = currentPrices[sym];
      if (!p) return;
      
      try {
        const c = await this.binance.getKlines(sym, '5m', 35);
        if (!c || c.length < 30) return;

        const sig = getSignal(c);
        if (!sig) return;
        
        // Skor tabanli secim min_score
        if (sig.score < USER_CONFIG.min_score) return;

        const lev = USER_CONFIG.lev;
        // 1000 USD margin per position (size = notional / leverage = 5000 / 5 = 1000) -> Wait, size is MARGIN
        const size = (USER_CONFIG.budget / USER_CONFIG.max_open); 
        
        if (size > (this.capital - this.reservedCapital)) return;
        
        // Calculate TP and SL Price based on formulas
        // TP Price        = LONG: entry * (1 + avg_move*0.80/entry)
        // SL Price        = LONG: entry - %2 (entry * 0.98)
        let tp_price = 0;
        let sl_price = 0;

        if (sig.side === 'LONG') {
          tp_price = p + (sig.avg_move * USER_CONFIG.tp_pct);
          sl_price = p * (1 - (USER_CONFIG.stop_pct / 100));
        } else {
          tp_price = p - (sig.avg_move * USER_CONFIG.tp_pct);
          sl_price = p * (1 + (USER_CONFIG.stop_pct / 100));
        }

        this.reservedCapital += size;
        this.openPositions[sym] = {
          sym,
          side: sig.side,
          entry: p,
          currentPrice: p,
          tp_price,
          sl_price,
          size,
          lev,
          opened_at: Date.now(),
          strat: sig.name,
          pnlPct: 0,
          netPnlUsd: 0,
          maxPnlUsd: 0
        };
      } catch (err) {
        // fetch fail
      }
    }));
  }

  getDashboardData() {
    let usedCap = 0;
    let unrPnl = 0;
    const opens = Object.values(this.openPositions).map(p => {
      usedCap += p.size;
      const netUsd = typeof p.netPnlUsd !== 'undefined' ? p.netPnlUsd : 0;
      unrPnl += netUsd;
      
      // Convert tp_price/sl_price to percents for UI back compat
      const tp_pct_val = Math.abs((p.tp_price - p.entry) / p.entry) * 100 * p.lev;
      const sl_pct_val = Math.abs((p.sl_price - p.entry) / p.entry) * 100 * p.lev;
      
      return {
        sym: p.sym,
        side: p.side,
        entry: p.entry,
        current_price: p.currentPrice,
        tp_price: p.tp_price,
        sl_price: p.sl_price,
        tp: tp_pct_val,
        sl: sl_pct_val,
        lev: p.lev,
        size: p.size,
        pnl_pct: p.pnlPct || 0,
        pnl_usd: netUsd,
        opened: p.opened_at
      };
    });

    let elapsedTotalSec = this.sessionDurationSec;
    if (this.isRunning) {
      elapsedTotalSec += Math.floor((Date.now() - this.sessionStart)/1000);
    }
    const m = Math.floor(elapsedTotalSec / 60);
    const s = elapsedTotalSec % 60;

    return {
      session_start: this.startTimeStr,
      session_num: this.sessionNum,
      is_active: this.isRunning,
      capital: this.capital,
      total_trades: this.closedPositions.length,
      total_pnl: this.totalRealizedPnl,
      opens,
      closed: [...this.closedPositions].reverse().slice(0, 50),
      server_time: Date.now(),
      elapsed: `${m}m ${s}s`,
      used_capital: usedCap,
      unrealized_pnl: unrPnl,
      has_downloadable_log: !!this.downloadableLog
    };
  }
}

