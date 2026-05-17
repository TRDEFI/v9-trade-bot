import { Kline } from './binanceClient.js';

export function calcRsi(klines: Kline[], period: number = 14): number {
  if (klines.length <= period) return 50;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = klines[i].c - klines[i - 1].c;
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < klines.length; i++) {
    const diff = klines[i].c - klines[i - 1].c;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  if (avgLoss === 0) return 100;
  return 100 - (100 / (1 + avgGain / avgLoss));
}

export function calcMa(klines: Kline[], period: number): number {
  if (klines.length < period) return 0;
  return klines.slice(-period).reduce((s, k) => s + k.c, 0) / period;
}

export function calcEma(klines: Kline[], period: number): number {
  if (klines.length < period) return 0;
  const k = 2 / (period + 1);
  // Seed with SMA of first 'period' candles (standard EMA method)
  let ema = klines.slice(0, period).reduce((s, kline) => s + kline.c, 0) / period;
  for (let i = period; i < klines.length; i++) {
    ema = (klines[i].c - ema) * k + ema;
  }
  return ema;
}

export function calcAtr(klines: Kline[], period: number = 14): number {
  if (klines.length < period) return 0;
  let trSum = 0;
  // Sma based initial TR is optional, doing simple average of TR for last `period` candles
  for (let i = klines.length - period; i < klines.length; i++) {
    const high = klines[i].h;
    const low = klines[i].l;
    const prevClose = i > 0 ? klines[i - 1].c : low;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trSum += tr;
  }
  return trSum / period;
}

export function calcBollingerBands(klines: Kline[], period: number = 20, numStdDev: number = 2) {
    if (klines.length < period) return null;
    const slice = klines.slice(-period);
    const sma = slice.reduce((s, k) => s + k.c, 0) / period;
    let variance = 0;
    for (const k of slice) {
        variance += Math.pow(k.c - sma, 2);
    }
    variance /= period;
    const stdDev = Math.sqrt(variance);
    return {
        upper: sma + numStdDev * stdDev,
        lower: sma - numStdDev * stdDev,
        sma
    };
}

export function calcVolumeRatio(klines: Kline[], period: number = 20): number {
  if (klines.length < period + 1) return 1;
  const cur = klines[klines.length - 1].v;
  const avg = klines.slice(-period - 1, -1).reduce((s, k) => s + k.v, 0) / period;
  return avg === 0 ? 1 : cur / avg;
}

export function calcAvgMove(klines: Kline[], period: number = 20): number {
  if (klines.length < period) return 0;
  return klines.slice(-period).reduce((s, k) => s + (k.h - k.l), 0) / period;
}

export function calcSupertrend(klines: Kline[], period: number = 10, multiplier: number = 3) {
  if (klines.length < period + 1) return null;
  const atrVals: number[] = [];
  
  // Calculate ATR manually for each step
  const getTr = (h: number, l: number, pc: number) => Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
  let trSum = 0;
  for (let i = 1; i <= period; i++) {
    trSum += getTr(klines[i].h, klines[i].l, klines[i-1].c);
  }
  let atr = trSum / period;
  atrVals[period] = atr;
  
  for (let i = period + 1; i < klines.length; i++) {
    const tr = getTr(klines[i].h, klines[i].l, klines[i-1].c);
    // Wilder's Smoothing for ATR
    atr = (atr * (period - 1) + tr) / period;
    atrVals[i] = atr;
  }

  const finalUpper: number[] = [];
  const finalLower: number[] = [];
  const supertrend: number[] = [];
  const trendDir: number[] = []; // 1 = UP, -1 = DOWN

  for (let i = period; i < klines.length; i++) {
    const k = klines[i];
    const prevC = klines[i-1].c;
    const a = atrVals[i];
    const hl2 = (k.h + k.l) / 2;
    
    const basicUpper = hl2 + multiplier * a;
    const basicLower = hl2 - multiplier * a;
    
    if (i === period) {
      finalUpper[i] = basicUpper;
      finalLower[i] = basicLower;
      trendDir[i] = 1;
      supertrend[i] = finalLower[i];
      continue;
    }
    
    const prevFinalUpper = finalUpper[i-1];
    const prevFinalLower = finalLower[i-1];
    
    if (basicUpper < prevFinalUpper || prevC > prevFinalUpper) {
      finalUpper[i] = basicUpper;
    } else {
      finalUpper[i] = prevFinalUpper;
    }
    
    if (basicLower > prevFinalLower || prevC < prevFinalLower) {
      finalLower[i] = basicLower;
    } else {
      finalLower[i] = prevFinalLower;
    }
    
    const prevTrend = trendDir[i-1];
    if (prevTrend === 1 && k.c <= finalUpper[i]) {
      trendDir[i] = k.c < finalLower[i] ? -1 : 1; 
    } else if (prevTrend === -1 && k.c >= finalLower[i]) {
      trendDir[i] = k.c > finalUpper[i] ? 1 : -1;
    } else {
      trendDir[i] = prevTrend;
    }
    
    // Exact switch logic
    if (prevTrend === 1 && k.c < finalLower[i]) trendDir[i] = -1;
    if (prevTrend === -1 && k.c > finalUpper[i]) trendDir[i] = 1;
    
    supertrend[i] = trendDir[i] === 1 ? finalLower[i] : finalUpper[i];
  }
  
  return {
    trend: trendDir[klines.length - 1], // 1 for UP, -1 for DOWN
    value: supertrend[klines.length - 1]
  };
}

export interface Signal {
  name: string;
  score: number;
  avg_move: number;
  side: 'LONG' | 'SHORT';
  tp_target?: number;  // Take profit price target (optional)
  sl_target?: number;   // Stop loss price target (optional)
}

// 1H Strategy
export function getSignal(klines: Kline[]): Signal | null {
  if (!klines || klines.length < 20) return null;

  const rsi = calcRsi(klines, 14);
  const ma10 = calcMa(klines, 10);
  const ma20 = calcMa(klines, 20);
  const ema9 = calcEma(klines, 9);
  const ema21 = calcEma(klines, 21);
  const ema50 = calcEma(klines, 50);  // 1H trend filter
  const vr   = calcVolumeRatio(klines, 20);
  
  // Replace avg move with ATR for a better volatility metric
  const atr = calcAtr(klines, 14);
  const avg = atr; 
  
  const p    = klines[klines.length - 1].c;
  const dev  = ((p - ma10) / ma10) * 100;
  
  const bb = calcBollingerBands(klines, 20, 2);

  const sigs: Signal[] = [];

  if (rsi < 30) sigs.push({ name: 'RSI_OVERSOLD', score: 0.90, side: 'LONG', avg_move: avg });
  if (rsi > 70) sigs.push({ name: 'RSI_OVERBOUGHT', score: 0.90, side: 'SHORT', avg_move: avg });

  if (dev < -2.5 && rsi < 40) sigs.push({ name: 'MA10_BOUNCE', score: 0.88, side: 'LONG', avg_move: avg });
  if (dev > 2.5  && rsi > 60) sigs.push({ name: 'MA10_REJECT',  score: 0.88, side: 'SHORT', avg_move: avg });

  // Add EMA crossover strategy — only on crossover (not continuous)
  // Use closed klines (excluding current unfinished candle) for accurate crossover detection
  const klinesClosed = klines.slice(0, -1);
  const ema9Curr = calcEma(klines, 9);
  const ema21Curr = calcEma(klines, 21);
  
  let ema9Prev = ema9Curr, ema21Prev = ema21Curr;
  if (klinesClosed.length >= 21) {
    const prevKlines = klinesClosed.slice(0, -1);
    if (prevKlines.length >= 21) {
      ema9Prev = calcEma(prevKlines, 9);
      ema21Prev = calcEma(prevKlines, 21);
    }
  }
  
  // Detect crossover: previous candle EMA9 was below/equal EMA21, now EMA9 is above
  const justCrossedUp = ema9Prev <= ema21Prev && ema9Curr > ema21Curr;
  const justCrossedDn = ema9Prev >= ema21Prev && ema9Curr < ema21Curr;
  
  if (justCrossedUp && vr > 1.3 && rsi < 65) {
      sigs.push({ name: 'EMA_CROSS_UP', score: 0.86, side: 'LONG', avg_move: avg });
  }
  if (justCrossedDn && vr > 1.3 && rsi > 35) {
      sigs.push({ name: 'EMA_CROSS_DN', score: 0.86, side: 'SHORT', avg_move: avg });
  }

  // Mean Reversion - Bollinger Band reversion with dynamic TP/SL
  // LONG: price near lower BB with volume confirmation
  if (bb && p < bb.lower * 1.002 && rsi < 35 && vr > 1.3) {
      sigs.push({ name: 'BB_REVERSION_LONG', score: 0.87, side: 'LONG', avg_move: atr,
                  tp_target: bb.middle, sl_target: bb.lower * 0.997 });
  }
  // SHORT: price near upper BB with volume confirmation  
  if (bb && p > bb.upper * 0.998 && rsi > 65 && vr > 1.3) {
      sigs.push({ name: 'BB_REVERSION_SHORT', score: 0.87, side: 'SHORT', avg_move: atr,
                  tp_target: bb.middle, sl_target: bb.upper * 1.003 });
  }

  if (ma10 > ma20 && dev < -1.5 && rsi < 50) {
    sigs.push({ name: 'TREND_LONG',  score: 0.85, side: 'LONG', avg_move: avg });
  }
  if (ma10 < ma20 && dev > 1.5  && rsi > 50) {
    sigs.push({ name: 'TREND_SHORT', score: 0.85, side: 'SHORT', avg_move: avg });
  }

  if (vr > 2.5 && p > ma10 && rsi < 60) {
    sigs.push({ name: 'VOL_BREAKUP', score: 0.82, side: 'LONG', avg_move: avg });
  }
  if (vr > 2.5 && p < ma10 && rsi > 40) {
    sigs.push({ name: 'VOL_BREAKDN', score: 0.82, side: 'SHORT', avg_move: avg });
  }

  // Momentum + Volume Confirmed Entry
  // Requires: VR > 2.0, 3 consecutive candles same direction, trend aligned with EMA50
  if (vr > 2.0 && klines.length >= 3) {
    const c1 = klines[klines.length - 3];
    const c2 = klines[klines.length - 2];
    const c3 = klines[klines.length - 1];
    
    // Check 3 consecutive candles same direction
    const dir1 = c1.c > c1.o ? 1 : -1; // 1=bullish, -1=bearish
    const dir2 = c2.c > c2.o ? 1 : -1;
    const dir3 = c3.c > c3.o ? 1 : -1;
    const momentumConfirmed = (dir1 === dir2 && dir2 === dir3);
    
    if (momentumConfirmed) {
      const isBullish = dir3 === 1; // current candle direction
      
      // LONG: bullish + price above EMA50
      if (isBullish && p > ema50 && rsi < 60) {
        const tp = p + atr * 1.5;
        const sl = p - atr * 0.7;
        sigs.push({ name: 'MOMENTUM_LONG', score: 0.84, side: 'LONG', avg_move: atr,
                    tp_target: tp, sl_target: sl });
      }
      // SHORT: bearish + price below EMA50
      if (!isBullish && p < ema50 && rsi > 40) {
        const tp = p - atr * 1.5;
        const sl = p + atr * 0.7;
        sigs.push({ name: 'MOMENTUM_SHORT', score: 0.84, side: 'SHORT', avg_move: atr,
                    tp_target: tp, sl_target: sl });
      }
    }
  }

  if (vr < 0.5) {
    if (rsi < 35) sigs.push({ name: 'SQUEEZE_LONG',  score: 0.80, side: 'LONG', avg_move: avg });
    if (rsi > 65) sigs.push({ name: 'SQUEEZE_SHORT', score: 0.80, side: 'SHORT', avg_move: avg });
  }

  const min_score = 0.80;
  const valid = sigs.filter(s => s.score >= min_score);
  if (valid.length === 0) return null;
  return valid.sort((a, b) => b.score - a.score)[0];
}
