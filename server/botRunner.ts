import { BinanceClient } from './binanceClient.js';
import { getSignal, getReversalSignal } from './strategy.js';
import { 
  INITIAL_CAPITAL, 
  MAX_USED_CAPITAL_PCT, 
  calculateRiskMultiplier, 
  checkDrawdownProtection, 
  calculatePositionSize 
} from './size.js';

export const PAIRS = [
  'RAVEUSDT','AIOTUSDT','SKYAIUSDT','BLESSUSDT','ZEREBROUSDT',
  'TACUSDT','AGTUSDT','UBUSDT','ORDIUSDT','BASEDUSDT',
  'MOVRUSDT','BASUSDT','SWARMSUSDT','SIRENUSDT','BSBUSDT',
  'MAGMAUSDT','CYSUSDT','ENJINUSDT','COMPOUNDUSDT','LABUSDT'
];

export class BotRunner {
  isRunning = false;
  binance = new BinanceClient();
  
  sessionStart = Date.now();
  sessionNum = 1;
  capital = INITIAL_CAPITAL;
  reservedCapital = 0;
  totalRealizedPnl = 0;
  allTimeHigh = INITIAL_CAPITAL;
  
  openPositions: Record<string, any> = {};
  closedPositions: any[] = [];
  reversalCooldown: Record<string, number> = {};
  stratWeights = { 'MEAN_REV': 1, 'VOL': 1 };
  
  loopInterval: NodeJS.Timeout | null = null;
  startTimeStr: number = Date.now();

  downloadableLog: string | null = null;
  aiConfig: { baseUrl: string, apiKey: string } = { baseUrl: '', apiKey: '' };
  
  setAiConfig(baseUrl: string, apiKey: string) {
    this.aiConfig = { baseUrl, apiKey };
    console.log(`[AI MANAGER] Configured with Minimax URL: ${baseUrl}`);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.sessionStart = Date.now();
    this.startTimeStr = Date.now();
    this.loop();
  }

  stop() {
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
      this.loopInterval = setTimeout(() => this.loop(), 1500); // 1.5s interval
    }
  }

  async closePosition(sym: string, customReason: string = 'MANUAL', currentPricesOpt?: Record<string, number>) {
    const pos = this.openPositions[sym];
    if (!pos) return;
    
    const currentPrices = currentPricesOpt || await this.binance.getAllPrices();
    const p = currentPrices[sym] || pos.currentPrice;
    const now = Date.now();
    
    const notional = pos.size * pos.lev;
    const priceChange = pos.side === 'LONG' ? (p - pos.entry) : (pos.entry - p);
    let pnl = notional * (priceChange / pos.entry);
    const commission = notional * 0.0004 * 2;
    pnl -= commission;
    
    this.totalRealizedPnl += pnl;
    this.capital = INITIAL_CAPITAL + this.totalRealizedPnl;
    this.reservedCapital -= pos.size;
    
    this.closedPositions.push({
      sym,
      side: pos.side,
      entry: pos.entry,
      closed_price: p,
      tp: pos.tp,
      sl: pos.sl,
      lev: pos.lev,
      size: pos.size,
      pnl,
      strat: pos.strat,
      reason: customReason,
      opened: pos.opened_at,
      closed: now
    });
    
    delete this.openPositions[sym];
    console.log(`CLOSED ${customReason} ${sym} PNL=${pnl.toFixed(2)}`);
  }

  async tick() {
    const now = Date.now();
    
    // Toplu fiyat çekimi ile gecikmeyi önlüyoruz
    const currentPrices = await this.binance.getAllPrices();
    
    // Açık pozisyonları değerlendir ve pnl güncelle
    let currentTotalNetPnl = 0;
    let currentTotalUsedMargin = 0;

    for (const sym of Object.keys(this.openPositions)) {
      const pos = this.openPositions[sym];
      const p = currentPrices[sym];
      if (!p) continue;
      
      const { entry, tp, sl, side } = pos;
      
      // Track unrealized for dashboard
      pos.currentPrice = p;
      const notional = pos.size * pos.lev;
      const priceChangeRaw = side === 'LONG' ? (p - entry) : (entry - p);
      const grossPnlUsd = notional * (priceChangeRaw / entry);
      const commissionUsd = notional * 0.0004 * 2;
      pos.netPnlUsd = grossPnlUsd - commissionUsd;
      pos.pnlPct = (pos.netPnlUsd / pos.size) * 100; // Net % on equity
      
      currentTotalNetPnl += pos.netPnlUsd;
      currentTotalUsedMargin += pos.size;
    }

    // Normal Stop/TP/Reversal kontrolleri ve Sabit P&L (+$3 / -$3) Kesici
    for (const sym of Object.keys(this.openPositions)) {
      const pos = this.openPositions[sym];
      const p = currentPrices[sym];
      if (!p) continue;

      const { entry, tp, sl, side, netPnlUsd } = pos;
      
      let reason = null;
      if (netPnlUsd !== undefined) {
        if (netPnlUsd >= 3) reason = 'PROFIT_CUT_3USD';
        else if (netPnlUsd <= -3) reason = 'LOSS_CUT_3USD';
      }

      if (!reason) {
        if (side === 'LONG') {
          if (p >= tp) reason = 'TP';
          else if (p <= sl) reason = 'SL';
        } else {
          if (p <= tp) reason = 'TP';
          else if (p >= sl) reason = 'SL';
        }
      }

      if (!reason) {
        // RSI Kapatma koşulu kontrolü (Sadece anlık stop/tp vurmadıysa klines sor)
        const c = await this.binance.getKlines(sym, '5m', 24);
        if (c.length > 5) {
          const rev = getReversalSignal(c, side);
          if (rev) {
            reason = 'REVERSAL';
            this.reversalCooldown[sym] = now + 30000; // 30s
          }
        }
      }

      if (reason) {
        await this.closePosition(sym, reason, currentPrices);
      }
    }

    // Yeni pozisyon açmayı dene (Parçalı paralel sorgular)
    await Promise.all(PAIRS.map(async (sym) => {
      if (this.openPositions[sym]) return;
      if (this.reversalCooldown[sym] && now < this.reversalCooldown[sym]) return;

      const p = currentPrices[sym];
      if (!p) return;
      
      const c = await this.binance.getKlines(sym, '5m', 24);
      const sig = getSignal(c, sym, this.stratWeights);
      if (!sig) return;

      const riskMult = calculateRiskMultiplier(this.capital, this.closedPositions.slice(-10));
      const ddData = checkDrawdownProtection(this.capital, this.allTimeHigh);
      this.allTimeHigh = ddData.newAth;
      
      if (ddData.inDD) return;

      const tpPrice = sig.side === 'LONG' ? p * (1 + sig.tpPct/100) : p * (1 - sig.tpPct/100);
      const slPrice = sig.side === 'LONG' ? p * (1 - sig.slPct/100) : p * (1 + sig.slPct/100);
      
      const { size, lev } = calculatePositionSize(this.capital, p, slPrice, riskMult);
      if (size < 5) return;

      let totalUsed = 0;
      for (const k in this.openPositions) totalUsed += this.openPositions[k].size;
      
      if (totalUsed + size > INITIAL_CAPITAL * MAX_USED_CAPITAL_PCT) return;
      if (size > (this.capital - this.reservedCapital)) return;

      this.reservedCapital += size;
      this.openPositions[sym] = {
        sym,
        entry: p,
        currentPrice: p,
        tp: tpPrice,
        sl: slPrice,
        side: sig.side,
        size,
        lev,
        opened_at: Date.now(),
        strat: sig.name,
        conf: sig.conf,
        risk_mult: riskMult,
        pnlPct: 0
      };
      
      console.log(`OPENED ${sig.side} ${sym} @ ${p} SZ=${size.toFixed(2)}`);
    }));
  }

  getDashboardData() {
    let usedCap = 0;
    let unrPnl = 0;
    const opens = Object.values(this.openPositions).map(p => {
      usedCap += p.size;
      const netUsd = typeof p.netPnlUsd !== 'undefined' ? p.netPnlUsd : 0;
      unrPnl += netUsd;
      return {
        sym: p.sym,
        side: p.side,
        entry: p.entry,
        current_price: p.currentPrice,
        tp: p.tp,
        sl: p.sl,
        lev: p.lev,
        size: p.size,
        pnl_pct: p.pnlPct || 0,
        pnl_usd: netUsd,
        opened: p.opened_at
      };
    });

    const elapsedTotalSec = Math.floor((Date.now() - this.sessionStart)/1000);
    const m = Math.floor(elapsedTotalSec / 60);
    const s = elapsedTotalSec % 60;

    return {
      session_start: this.startTimeStr,
      session_num: this.sessionNum,
      is_active: this.isRunning,
      ai_active: !!(this.aiConfig.baseUrl && this.aiConfig.apiKey),
      capital: this.capital,
      total_trades: this.closedPositions.length,
      total_pnl: this.totalRealizedPnl,
      opens,
      closed: [...this.closedPositions].reverse().slice(0, 50), // Send last 50
      server_time: Date.now(),
      elapsed: `${m}m ${s}s`,
      used_capital: usedCap,
      unrealized_pnl: unrPnl,
      has_downloadable_log: !!this.downloadableLog
    };
  }
}
