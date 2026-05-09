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
    if (diff > 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - diff) / period;
    }
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
  let ema = klines[0].c;
  for (let i = 1; i < klines.length; i++) {
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

export interface Signal {
  name: string;
  score: number;
  avg_move: number;
  side: 'LONG' | 'SHORT';
}

// 1H Strategy
export function getSignal(klines: Kline[]): Signal | null {
  if (!klines || klines.length < 20) return null;

  const rsi = calcRsi(klines, 14);
  const ma10 = calcMa(klines, 10);
  const ma20 = calcMa(klines, 20);
  const ema9 = calcEma(klines, 9);
  const ema21 = calcEma(klines, 21);
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

  // Add EMA crossover strategy
  if (ema9 > ema21 && p > ema9 && rsi < 60) {
      sigs.push({ name: 'EMA_CROSS_UP', score: 0.86, side: 'LONG', avg_move: avg });
  }
  if (ema9 < ema21 && p < ema9 && rsi > 40) {
      sigs.push({ name: 'EMA_CROSS_DN', score: 0.86, side: 'SHORT', avg_move: avg });
  }

  // Add Bollinger Bands reversion strategy
  if (bb) {
      if (p <= bb.lower && rsi < 35) {
          sigs.push({ name: 'BB_REVERSION_LONG', score: 0.89, side: 'LONG', avg_move: avg });
      }
      if (p >= bb.upper && rsi > 65) {
          sigs.push({ name: 'BB_REVERSION_SHORT', score: 0.89, side: 'SHORT', avg_move: avg });
      }
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

  if (vr < 0.5) {
    if (rsi < 35) sigs.push({ name: 'SQUEEZE_LONG',  score: 0.80, side: 'LONG', avg_move: avg });
    if (rsi > 65) sigs.push({ name: 'SQUEEZE_SHORT', score: 0.80, side: 'SHORT', avg_move: avg });
  }

  const min_score = 0.80;
  const valid = sigs.filter(s => s.score >= min_score);
  if (valid.length === 0) return null;
  return valid.sort((a, b) => b.score - a.score)[0];
}
