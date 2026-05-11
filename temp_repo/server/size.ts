export const INITIAL_CAPITAL = 2000.0;
export const BASE_RISK_PCT = 0.015;
export const MAX_POSITION_PCT = 0.15;
export const MAX_DRAWDOWN_PCT = 0.15;
export const MAX_USED_CAPITAL_PCT = 0.50;
export const MAX_LEV = 3;

export function calculateRiskMultiplier(capital: number, recentTrades: any[]): number {
  const pnlRatio = capital / INITIAL_CAPITAL;
  let riskMult = 1.0;
  
  if (pnlRatio > 1.10) riskMult = 1.2;
  else if (pnlRatio > 1.05) riskMult = 1.1;
  else if (pnlRatio < 0.90) riskMult = 0.6;
  else if (pnlRatio < 0.95) riskMult = 0.8;
  
  if (recentTrades.length >= 5) {
    const wins = recentTrades.filter(t => t.pnl > 0).length;
    const winRate = wins / recentTrades.length;
    if (winRate > 0.6) riskMult *= 1.15;
    else if (winRate < 0.4) riskMult *= 0.85;
  }
  
  return Math.max(0.5, Math.min(1.5, riskMult));
}

export function checkDrawdownProtection(capital: number, allTimeHigh: number): { inDD: boolean, ddPct: number, newAth: number } {
  let newAth = Math.max(allTimeHigh, capital);
  const ddPct = (newAth - capital) / newAth;
  return {
    inDD: ddPct >= MAX_DRAWDOWN_PCT,
    ddPct,
    newAth
  };
}

export function calculatePositionSize(capital: number, entryPrice: number, stopLoss: number, riskMult: number, tpPrice: number): { size: number, lev: number } {
  // Target net profit is $3
  const TARGET_PROFIT = 3.0; // USD
  
  const tpDistance = Math.abs(tpPrice - entryPrice);
  const tpPct = tpDistance / entryPrice;
  
  // Total Commission expected = Notional * 0.0004 * 2 = Notional * 0.0008
  // Net Profit = (Notional * tpPct) - (Notional * 0.0008)
  const netTpPct = tpPct - 0.0008;
  
  if (netTpPct <= 0) {
    // If commission eats the whole TP (tp is less than 0.08%), we shouldn't trade
    return { size: 0, lev: 1 };
  }
  
  const notional = TARGET_PROFIT / netTpPct;
  const maxSize = capital * MAX_POSITION_PCT;
  
  let lev = 1;
  while (lev < MAX_LEV && (notional / lev) > maxSize) {
    lev++;
  }
  
  let margin = notional / lev;
  if (margin > maxSize) margin = maxSize;
  
  if (margin < 5) return { size: 0, lev: 1 };
  
  return { size: margin, lev: lev };
}
