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

// ─── 1H Strategy: Daha az ama daha güvenilir sinyaller ───
export function getSignal(klines: Kline[]): Signal | null {
  if (!klines || klines.length < 20) return null;

  const rsi = calcRsi(klines, 14);
  const ma10 = calcMa(klines, 10);   // 1H'de MA10 = 10 saatlik hareketli ortalama
  const ma20 = calcMa(klines, 20);  // 20 saatlik trend referansı
  const vr   = calcVolumeRatio(klines, 20);
  const avg  = calcAvgMove(klines, 20);
  const p    = klines[klines.length - 1].c;
  const dev  = ((p - ma10) / ma10) * 100;  // % sapma

  const sigs: Signal[] = [];

  // ── RSI aşırı bölgeler ──
  if (rsi < 30) sigs.push({ name: 'RSI_OVERSOLD', score: 0.90, side: 'LONG', avg_move: avg });
  if (rsi > 70) sigs.push({ name: 'RSI_OVERBOUGHT', score: 0.90, side: 'SHORT', avg_move: avg });

  // ── Mean Reversion (1H'de %2.5'ten fazla sapma) ──
  if (dev < -2.5 && rsi < 40) sigs.push({ name: 'MA10_BOUNCE', score: 0.88, side: 'LONG', avg_move: avg });
  if (dev > 2.5  && rsi > 60) sigs.push({ name: 'MA10_REJECT',  score: 0.88, side: 'SHORT', avg_move: avg });

  // ── Trend takibi (ma10 > ma20 = uptrend) ──
  if (ma10 > ma20 && dev < -1.5 && rsi < 50) {
    sigs.push({ name: 'TREND_LONG',  score: 0.85, side: 'LONG', avg_move: avg });
  }
  if (ma10 < ma20 && dev > 1.5  && rsi > 50) {
    sigs.push({ name: 'TREND_SHORT', score: 0.85, side: 'SHORT', avg_move: avg });
  }

  // ── Hacim patlaması (%2.5 üzeri hacim) ──
  if (vr > 2.5 && p > ma10 && rsi < 60) {
    sigs.push({ name: 'VOL_BREAKUP', score: 0.82, side: 'LONG', avg_move: avg });
  }
  if (vr > 2.5 && p < ma10 && rsi > 40) {
    sigs.push({ name: 'VOL_BREAKDN', score: 0.82, side: 'SHORT', avg_move: avg });
  }

  // ── Düşük hacim / sıkışma (RSI ile) ──
  if (vr < 0.5) {
    if (rsi < 35) sigs.push({ name: 'SQUEEZE_LONG',  score: 0.80, side: 'LONG', avg_move: avg });
    if (rsi > 65) sigs.push({ name: 'SQUEEZE_SHORT', score: 0.80, side: 'SHORT', avg_move: avg });
  }

  // Sadece yüksek skorlu sinyaller — daha seçici
  const min_score = 0.80;  // 0.75 → 0.80 (daha az ama daha güvenilir)
  const valid = sigs.filter(s => s.score >= min_score);
  if (valid.length === 0) return null;
  return valid.sort((a, b) => b.score - a.score)[0];
}