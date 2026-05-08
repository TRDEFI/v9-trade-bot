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
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

export function calcMa(klines: Kline[], period: number): number {
  if (klines.length < period) return 0;
  const slice = klines.slice(klines.length - period);
  return slice.reduce((sum, row) => sum + row.c, 0) / period;
}

export function calcVolumeRatio(klines: Kline[], period: number = 20): number {
  if (klines.length < period + 1) return 1;
  const currentV = klines[klines.length - 1].v;
  const avgV = klines.slice(klines.length - period - 1, klines.length - 1).reduce((s, k) => s + k.v, 0) / period;
  return avgV === 0 ? 1 : currentV / avgV;
}

export function calcAvgMove(klines: Kline[], period: number = 20): number {
  if (klines.length < period) return 0;
  const slice = klines.slice(klines.length - period);
  const totalMove = slice.reduce((sum, k) => sum + (k.h - k.l), 0);
  return totalMove / period;
}

export interface Signal {
  name: string;
  score: number;
  avg_move: number;
  side: 'LONG' | 'SHORT';
}

export function getSignal(klines: Kline[]): Signal | null {
  if (!klines || klines.length < 30) return null;

  const rsi = calcRsi(klines, 14);
  const ma10 = calcMa(klines, 10);
  const vr = calcVolumeRatio(klines, 20);
  const avgMove = calcAvgMove(klines, 20);
  const p = klines[klines.length - 1].c;

  const min_score = 0.75;
  const sigs: Signal[] = [];

  if (rsi < 30) sigs.push({ name: 'RSI_OVERSOLD', score: 0.90, side: 'LONG', avg_move: avgMove });
  if (rsi > 70) sigs.push({ name: 'RSI_OVERBOUGHT', score: 0.90, side: 'SHORT', avg_move: avgMove });
  
  if (p < ma10 * 0.99 && rsi < 45) sigs.push({ name: 'MA10_BOUNCE', score: 0.85, side: 'LONG', avg_move: avgMove });
  if (p > ma10 * 1.01 && rsi > 55) sigs.push({ name: 'MA10_REJECT', score: 0.85, side: 'SHORT', avg_move: avgMove });
  
  if (vr > 1.5 && p > ma10 && rsi < 65) sigs.push({ name: 'VOL_BREAKUP', score: 0.80, side: 'LONG', avg_move: avgMove });
  if (vr > 1.5 && p < ma10 && rsi > 35) sigs.push({ name: 'VOL_BREAKDN', score: 0.80, side: 'SHORT', avg_move: avgMove });

  if (vr < 0.7) {
    if (p < ma10) sigs.push({ name: 'RANGE_BOUNCE', score: 0.78, side: 'LONG', avg_move: avgMove });
    else if (p > ma10) sigs.push({ name: 'RANGE_BOUNCE', score: 0.78, side: 'SHORT', avg_move: avgMove });
  }

  const validSigs = sigs.filter(s => s.score >= min_score);
  if (validSigs.length === 0) return null;
  validSigs.sort((a, b) => b.score - a.score);
  
  return validSigs[0];
}
