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

export function calculatePositionSize(capital: number, entryPrice: number, stopLoss: number, riskMult: number): { size: number, lev: number } {
  const riskAmount = capital * BASE_RISK_PCT * riskMult;
  const priceDistance = Math.abs(entryPrice - stopLoss);
  
  if (priceDistance === 0) return { size: 0, lev: 1 };
  
  let size = riskAmount / priceDistance; // Note: if priceDistance is nominal price diff, size is in coins.
  // Wait, in Python:
  // risk_amount = capital * BASE_RISK_PCT * risk_mult
  // price_distance = abs(entry_price - stop_loss)
  // size = risk_amount / price_distance ... wait
  // If price is 100, SL is 90. Distance is 10. Risk 30$. size = 3. 3 * 100 = 300$ position.
  // Actually python size seems to be notional USD!
  // Python: sz, lev = calculate_position_size...
  // Notional = pos['size'] * pos['lev'] OR pos['size']?
  // Let's make size represent margin allocated in USD.
  
  // So size calculated here is in base currency (COINS)?
  // Python code used this `sz` directly as margin because it checks total used capital: `sum(pos['size'] for ...)`
  // Risk amount = margin * (priceDistance/entryPrice) ? No. By python logic this was returning coins or something.
  // Let's refine it correctly:
  // We want to risk "riskAmount" (USD).
  // Percentage move to SL = priceDistance / entryPrice
  // Total notional needed = riskAmount / (priceDistance / entryPrice)
  // Margin required = notional / leverage.
  let lev = 1;
  if (riskMult > 0.8) lev = 2;
  if (riskMult > 1.0) lev = 3;
  lev = Math.min(lev, MAX_LEV);
  
  const movePct = priceDistance / entryPrice;
  const notional = riskAmount / movePct;
  let margin = notional / lev;

  if (margin < 5) return { size: 0, lev: 1 };
  
  const maxSize = capital * MAX_POSITION_PCT;
  if (margin > maxSize) margin = maxSize;
  
  return { size: margin, lev: lev };
}
