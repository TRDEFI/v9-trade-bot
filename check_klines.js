import https from 'https';

function fetchKlines(symbol, endTime) {
  return new Promise((resolve, reject) => {
    // 1h klines
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=1h&limit=30&endTime=${endTime}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function calcEma(klines, period) {
  if (klines.length < period) return 0;
  const k = 2 / (period + 1);
  let ema = klines[0].close;
  for (let i = 1; i < klines.length; i++) {
    ema = (klines[i].close - ema) * k + ema;
  }
  return ema;
}

function calcRsi(klines, period = 14) {
  if (klines.length <= period) return 50;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = klines[i].close - klines[i - 1].close;
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < klines.length; i++) {
    const diff = klines[i].close - klines[i - 1].close;
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


async function run() {
  const ts = new Date('2026-05-09T18:03:00Z').getTime(); // Just after entry
  const data = await fetchKlines('1000LUNCUSDT', ts);
  if (data.code) {
    console.log("Error:", data);
    return;
  }
  const klines = data.map(k => ({
    time: new Date(k[0]).toISOString(),
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5])
  }));
  
  // Override the last kline close with the exact ENTRY PRICE to simulate the exact tick the bot saw
  klines[klines.length - 1].close = 0.0931;
  
  const last10 = klines.slice(-10);
  console.log("Recent Klines:");
  last10.forEach(k => console.log(`${k.time}: C=${k.close}`));

  const ema9 = calcEma(klines, 9);
  const ema21 = calcEma(klines, 21);
  const rsi = calcRsi(klines, 14);
  const lastClose = klines[klines.length - 1].close;
  
  console.log(`\nMetrics at ${klines[klines.length-1].time}:`);
  console.log(`EMA9: ${ema9}`);
  console.log(`EMA21: ${ema21}`);
  console.log(`RSI: ${rsi}`);
  const bb = ((klines) => {
    const period = 20;
    if (klines.length < period) return null;
    const slice = klines.slice(-period);
    const sma = slice.reduce((s, k) => s + k.close, 0) / period;
    let variance = 0;
    for (const k of slice) variance += (k.close - sma) ** 2;
    variance /= period;
    const stdDev = Math.sqrt(variance);
    return { upper: sma + 2 * stdDev };
  })(klines);
  
  const vr = ((klines) => {
    const period = 20;
    const cur = klines[klines.length - 1].volume;
    const avg = klines.slice(-period - 1, -1).reduce((s, k) => s + k.volume, 0) / period;
    return avg === 0 ? 1 : cur / avg;
  })(klines);
  
  const ma10 = klines.slice(-10).reduce((s, k) => s + k.close, 0) / 10;
  const ma20 = klines.slice(-20).reduce((s, k) => s + k.close, 0) / 20;
  
  const p = lastClose;
  const dev = ((p - ma10) / ma10) * 100;
  
  console.log(`RSI_OVERBOUGHT: ${rsi > 70}`);
  console.log(`MA10_REJECT: ${dev > 2.5 && rsi > 60}`);
  console.log(`EMA_CROSS_DN: ${ema9 < ema21 && p < ema9 && rsi > 40}`);
  console.log(`BB_REVERSION_SHORT: ${bb && p >= bb.upper && rsi > 65}`);
  console.log(`TREND_SHORT: ${ma10 < ma20 && dev > 1.5 && rsi > 50}`);
  console.log(`VOL_BREAKDN: ${vr > 2.5 && p < ma10 && rsi > 40}`);
  console.log(`SQUEEZE_SHORT: ${vr < 0.5 && rsi > 65}`);
}
run();
