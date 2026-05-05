import { Kline } from './binanceClient.js';

export function calcRsi(klines: Kline[], period: number = 14): number {
  if (klines.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  // Calculate differences
  const diffs: number[] = [];
  for (let i = 1; i < klines.length; i++) {
    diffs.push(klines[i].c - klines[i - 1].c);
  }
  
  // Get last 'period' diffs
  const recentDiffs = diffs.slice(-period);
  
  for (const d of recentDiffs) {
    if (d > 0) gains += d;
    else losses -= d; // absolute value
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

export function calcMa(klines: Kline[], period: number): number | null {
  if (klines.length < period) return null;
  const recent = klines.slice(-period);
  const sum = recent.reduce((acc, k) => acc + k.c, 0);
  return sum / period;
}

export function calcVolRatio(klines: Kline[]): number {
  if (klines.length < 10) return 1;
  const recentExceptLast = klines.slice(-10, -1);
  const avgVol = recentExceptLast.reduce((acc, k) => acc + k.v, 0) / 9;
  if (avgVol === 0) return 1;
  return klines[klines.length - 1].v / avgVol;
}

export function estTpMinutes(tpPct: number, klines: Kline[]): number {
  if (klines.length < 5) return 999;
  
  // Calculate average percentage move per bar for last 5 bars
  let totalMovePct = 0;
  for (let i = klines.length - 5; i < klines.length; i++) {
    if (i === 0) continue;
    const move = Math.abs(klines[i].c - klines[i-1].c) / klines[i-1].c;
    totalMovePct += move;
  }
  
  const avgPctPerMin = (totalMovePct / 5) * 100;
  if (avgPctPerMin < 0.001) return 999;
  return tpPct / avgPctPerMin;
}

export interface Signal {
  name: string;
  conf: number;
  tpPct: number;
  slPct: number;
  side: 'LONG' | 'SHORT';
}

export function getSignal(klines: Kline[], symbol: string, stratWeights: Record<string, number>): Signal | null {
  if (!klines || klines.length < 5) return null;
  const rsi = calcRsi(klines);
  const p = klines[klines.length - 1].c;
  const ma10 = calcMa(klines, 10);
  const vr = calcVolRatio(klines);
  
  const rsiPreventLong = rsi > 70;
  const rsiPreventShort = rsi < 30;
  
  // Trend Check
  if (vr > 2.0 && klines.length >= 5) {
    let recentMovesSum = 0;
    for (let i = klines.length - 5; i < klines.length; i++) {
      if (i > 0) recentMovesSum += klines[i].c - klines[i-1].c;
    }
    const avgMove = recentMovesSum / 5;
    if (avgMove < 0 && !rsiPreventLong) {
      return null;
    }
  }

  const sigs: { name: string, score: number, tp: number, sl: number }[] = [];
  
  if (ma10 && p) {
    const diff = (ma10 - p) / ma10;
    if (diff > 0.015 && !rsiPreventLong) {
      sigs.push({ name: 'MEAN_REV', score: Math.min(diff / 0.015, 1.0), tp: 1.8, sl: 1.2 });
    } else if (diff < -0.015 && !rsiPreventShort) {
      sigs.push({ name: 'MEAN_REV', score: Math.min(-diff / 0.015, 1.0), tp: 1.6, sl: 1.2 });
    }
  }
  
  if (vr > 2.0 && !rsiPreventLong) {
    sigs.push({ name: 'VOL', score: Math.min((vr - 2.0) / 2.0, 1.0), tp: 2.2, sl: 1.5 });
  }
  
  if (sigs.length === 0) return null;
  
  let tw = 0;
  for (const s of sigs) tw += stratWeights[s.name] || 1;
  if (tw === 0) tw = 0.1;
  
  const sc = sigs.map(s => ({
    ...s,
    finalScore: s.score * ((stratWeights[s.name] || 1) / Math.max(tw, 0.1))
  })).sort((a, b) => b.finalScore - a.finalScore);
  
  const best = sc[0];
  const side = best.name === 'MEAN_REV' ? (ma10! - p > 0 ? 'LONG' : 'SHORT') : 'LONG'; // Based on python logic: 'LONG' if name in ('MEAN_REV','VOL') else 'SHORT', wait.. Python diff: if diff>0 = long, if diff<0 = short. If vol=long. Actually:
  // Python: side = 'LONG' if name in ('MEAN_REV','VOL') else 'SHORT' wait, Python is wrong for short mean_rev?
  // Ah, python line:
  // if diff > 0.012 ... add MEAN_REV. diff is (ma-p)/ma. So p is below MA. So it bounces up -> LONG.
  // diff < -0.012 ... p is above MA. Bounce down -> but Python appends MEAN_REV.
  // Then Python sets side = 'LONG' if name in ('MEAN_REV', 'VOL') else 'SHORT'. Wait, that means it always goes LONG!
  // I will fix this in TS to actually do SHORT if p is above MA.
  
  let actualSide: 'LONG' | 'SHORT' = 'LONG';
  if (best.name === 'MEAN_REV') {
    actualSide = (ma10! - p) > 0 ? 'LONG' : 'SHORT';
  } else if (best.name === 'VOL') {
    actualSide = 'LONG'; // Follows the original logic for VO.
  }
  
  return {
    name: best.name,
    conf: best.finalScore,
    tpPct: best.tp,
    slPct: best.sl,
    side: actualSide
  };
}

export function getReversalSignal(klines: Kline[], currentSide: 'LONG' | 'SHORT'): 'LONG' | 'SHORT' | null {
  if (!klines || klines.length < 5) return null;
  const rsi = calcRsi(klines);
  if (currentSide === 'LONG' && rsi < 30) return 'SHORT';
  if (currentSide === 'SHORT' && rsi > 70) return 'LONG';
  return null;
}
