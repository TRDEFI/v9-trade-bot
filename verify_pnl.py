#!/usr/bin/env python3
"""
V9 Bot P&L Verification Script
Compares bot's reported P&L with Binance historic kline data
"""
import json
import urllib.request
import time

# Dashboard data from API
closed_positions = [
    {"sym":"SKYAIUSDT","side":"SHORT","entry":0.29507,"closed_price":0.29414,"pnl":12.258972447215685,"strat":"MA10_REJECT","reason":"TAKE_PROFIT","opened":1779218101867,"closed":1779218220447},
    {"sym":"SKYAIUSDT","side":"SHORT","entry":0.29381,"closed_price":0.29286,"pnl":12.666910588475652,"strat":"MA10_REJECT","reason":"TAKE_PROFIT","opened":1779218400704,"closed":1779218446867},
    {"sym":"BLUAIUSDT","side":"LONG","entry":0.009271,"closed_price":0.009131,"pnl":-79.00426059756202,"strat":"MA10_BOUNCE","reason":"HARD_STOP_LOSS","opened":1779218101867,"closed":1779219700196},
    {"sym":"BILLUSDT","side":"LONG","entry":0.10675,"closed_price":0.10714,"pnl":14.766978922716696,"strat":"RSI_OVERSOLD","reason":"TAKE_PROFIT","opened":1779219904690,"closed":1779219934531},
    {"sym":"MUUSDT","side":"LONG","entry":698.06,"closed_price":699.66,"pnl":7.960332922671567,"strat":"TREND_LONG","reason":"TAKE_PROFIT_TIME_DECAY","opened":1779219904690,"closed":1779220799054},
    {"sym":"PROMUSDT","side":"LONG","entry":1.0899999999999999,"closed_price":1.093,"pnl":10.261467889908781,"strat":"RSI_OVERSOLD","reason":"TAKE_PROFIT","opened":1779220804461,"closed":1779220867933},
    {"sym":"PENDLEUSDT","side":"LONG","entry":1.7452,"closed_price":1.7501,"pnl":10.538505615401972,"strat":"SQUEEZE_LONG","reason":"TAKE_PROFIT","opened":1779220867923,"closed":1779221099251},
    {"sym":"币安人生USDT","side":"LONG","entry":0.4164,"closed_price":0.41747,"pnl":9.34822286263227,"strat":"SQUEEZE_LONG","reason":"TAKE_PROFIT_TIME_DECAY","opened":1779219904690,"closed":1779221482219},
    {"sym":"APRUSDT","side":"SHORT","entry":0.17497,"closed_price":0.17324,"pnl":45.937046350802476,"strat":"SQUEEZE_SHORT","reason":"TAKE_PROFIT","opened":1779219934524,"closed":1779221620988},
    {"sym":"PROMUSDT","side":"LONG","entry":1.093,"closed_price":1.096,"pnl":10.223696248856877,"strat":"RSI_OVERSOLD","reason":"TAKE_PROFIT","opened":1779221099243,"closed":1779221704353},
    {"sym":"RONINUSDT","side":"LONG","entry":0.1075,"closed_price":0.1067,"pnl":-40.70930232558117,"strat":"MA10_BOUNCE","reason":"TIME_STOP_NO_BOUNCE","opened":1779219904690,"closed":1779221704861},
    {"sym":"BILLUSDT","side":"LONG","entry":0.10323,"closed_price":0.10354,"pnl":11.515015015014571,"strat":"RSI_OVERSOLD","reason":"TAKE_PROFIT","opened":1779222604402,"closed":1779222631561},
    {"sym":"BILLUSDT","side":"LONG","entry":0.10348,"closed_price":0.10378,"pnl":10.995554696559466,"strat":"RSI_OVERSOLD","reason":"TAKE_PROFIT","opened":1779222811832,"closed":1779222859584},
    {"sym":"PYTHUSDT","side":"LONG","entry":0.03835,"closed_price":0.03848,"pnl":13.44915254237264,"strat":"SQUEEZE_LONG","reason":"TAKE_PROFIT","opened":1779222604402,"closed":1779223083771},
]

NOTIONAL = 5000  # 250 margin * 20x leverage
COMMISSION_RATE = 0.0005  # 0.05% taker fee per side

def fetch_klines(symbol, start_time, end_time, interval="1m", limit=50):
    """Fetch klines from Binance Futures API"""
    url = f"https://fapi.binance.com/fapi/v1/klines?symbol={symbol}&interval={interval}&startTime={start_time}&endTime={end_time}&limit={limit}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            return data
    except Exception as e:
        print(f"  ERROR fetching klines for {symbol}: {e}")
        return None

def verify_position(pos, idx):
    sym = pos["sym"]
    side = pos["side"]
    bot_entry = pos["entry"]
    bot_close = pos["closed_price"]
    bot_pnl = pos["pnl"]
    reason = pos["reason"]
    opened = pos["opened"]
    closed = pos["closed"]
    
    duration_min = (closed - opened) / 60000
    
    print(f"\n{'='*70}")
    print(f"#{idx+1} {sym} | {side} | {reason}")
    print(f"  Duration: {duration_min:.1f} min")
    print(f"  Bot Entry: {bot_entry}, Close: {bot_close}, PNL: ${bot_pnl:.2f}")
    
    # Fetch klines around open and close times
    # Get klines 5min before open to 5min after close
    start_time = opened - 5 * 60 * 1000
    end_time = closed + 5 * 60 * 1000
    
    klines = fetch_klines(sym, start_time, end_time)
    if not klines:
        print(f"   Could not fetch klines, skipping price verification")
        return None
    
    # Find entry candle (first candle after open time)
    entry_candle = None
    close_candle = None
    
    for k in klines:
        candle_open_time = k[0]
        candle_close = float(k[4])  # close price
        candle_open = float(k[1])   # open price
        candle_high = float(k[2])
        candle_low = float(k[3])
        
        if entry_candle is None and candle_open_time >= opened:
            entry_candle = k
        if candle_open_time >= closed:
            close_candle = k
            break
    
    if entry_candle and close_candle:
        # For market orders, entry price is typically the close of the signal candle
        # or the open of the next candle. Bot uses limit orders at signal close price.
        entry_kline_close = float(entry_candle[4])
        close_kline_close = float(close_candle[4])
        
        print(f"  Binance Entry Candle Close: {entry_kline_close}")
        print(f"  Binance Close Candle Close: {close_kline_close}")
        print(f"  Price Diff Entry: {abs(bot_entry - entry_kline_close):.6f} ({abs(bot_entry - entry_kline_close)/bot_entry*100:.3f}%)")
        print(f"  Price Diff Close: {abs(bot_close - close_kline_close):.6f} ({abs(bot_close - close_kline_close)/bot_close*100:.3f}%)")
        
        # Calculate expected PNL
        direction = 1 if side == "LONG" else -1
        gross_pnl = NOTIONAL * (close_kline_close - entry_kline_close) / entry_kline_close * direction
        commission = NOTIONAL * COMMISSION_RATE * 2  # open + close
        net_pnl = gross_pnl - commission
        
        print(f"  Expected Gross PNL: ${gross_pnl:.2f}")
        print(f"  Expected Commission: ${commission:.2f}")
        print(f"  Expected Net PNL: ${net_pnl:.2f}")
        print(f"  Bot Reported PNL: ${bot_pnl:.2f}")
        
        pnl_diff = abs(net_pnl - bot_pnl)
        pnl_diff_pct = pnl_diff / abs(bot_pnl) * 100 if bot_pnl != 0 else 0
        
        if pnl_diff < 5:
            print(f"  ✅ PNL Match (diff: ${pnl_diff:.2f}, {pnl_diff_pct:.1f}%)")
        elif pnl_diff < 15:
            print(f"  ⚠ PNL Close (diff: ${pnl_diff:.2f}, {pnl_diff_pct:.1f}%) - likely slippage/rounding")
        else:
            print(f"  ❌ PNL Mismatch (diff: ${pnl_diff:.2f}, {pnl_diff_pct:.1f}%)")
        
        return {
            "sym": sym,
            "bot_pnl": bot_pnl,
            "expected_pnl": net_pnl,
            "diff": pnl_diff,
            "match": pnl_diff < 15
        }
    else:
        print(f"  ⚠ Could not find matching candles")
        return None

def verify_time_decay(pos):
    """Verify TIME_DECAY condition"""
    sym = pos["sym"]
    reason = pos["reason"]
    opened = pos["opened"]
    closed = pos["closed"]
    bot_pnl = pos["pnl"]
    
    if reason != "TAKE_PROFIT_TIME_DECAY":
        return None
    
    duration_min = (closed - opened) / 60000
    target_profit = 10.0  # From log: tp=10.00 for both
    threshold = target_profit * 0.6  # $6.00
    
    print(f"\n  TIME_DECAY Verification for {sym}:")
    print(f"  Duration: {duration_min:.1f} min (required: >= 10 min)")
    print(f"  Target Profit: ${target_profit:.2f}")
    print(f"  60% Threshold: ${threshold:.2f}")
    print(f"  Actual PNL: ${bot_pnl:.2f}")
    print(f"  PNL >= Threshold: {bot_pnl >= threshold} ✅" if bot_pnl >= threshold else f"  PNL >= Threshold: {bot_pnl >= threshold} ")
    print(f"  Duration >= 10min: {duration_min >= 10} ✅" if duration_min >= 10 else f"  Duration >= 10min: {duration_min >= 10} ❌")
    
    if duration_min >= 10 and bot_pnl >= threshold:
        print(f"  ✅ TIME_DECAY condition correctly triggered")
    else:
        print(f"  ❌ TIME_DECAY condition NOT met - bug!")
    
    return {
        "sym": sym,
        "duration_min": duration_min,
        "threshold": threshold,
        "actual_pnl": bot_pnl,
        "condition_met": duration_min >= 10 and bot_pnl >= threshold
    }

def verify_hard_stop(pos):
    """Verify HARD_STOP_LOSS condition"""
    sym = pos["sym"]
    reason = pos["reason"]
    bot_pnl = pos["pnl"]
    cut_loss = -75
    
    if reason != "HARD_STOP_LOSS":
        return None
    
    print(f"\n  HARD_STOP_LOSS Verification for {sym}:")
    print(f"  cut_loss threshold: ${cut_loss}")
    print(f"  Actual PNL: ${bot_pnl:.2f}")
    print(f"  PNL <= cut_loss: {bot_pnl <= cut_loss} ✅" if bot_pnl <= cut_loss else f"  PNL <= cut_loss: {bot_pnl <= cut_loss} ❌")
    
    return {
        "sym": sym,
        "cut_loss": cut_loss,
        "actual_pnl": bot_pnl,
        "condition_met": bot_pnl <= cut_loss
    }

def verify_time_stop(pos):
    """Verify TIME_STOP_NO_BOUNCE condition"""
    sym = pos["sym"]
    reason = pos["reason"]
    bot_pnl = pos["pnl"]
    opened = pos["opened"]
    closed = pos["closed"]
    
    if reason != "TIME_STOP_NO_BOUNCE":
        return None
    
    duration_min = (closed - opened) / 60000
    time_stop_loss = -30
    time_stop_soft_min = 30
    
    print(f"\n  TIME_STOP_NO_BOUNCE Verification for {sym}:")
    print(f"  Duration: {duration_min:.1f} min (required: >= {time_stop_soft_min} min)")
    print(f"  time_stop_loss threshold: ${time_stop_loss}")
    print(f"  Actual PNL: ${bot_pnl:.2f}")
    print(f"  Duration >= 30min: {duration_min >= time_stop_soft_min} ✅" if duration_min >= time_stop_soft_min else f"  Duration >= 30min: {duration_min >= time_stop_soft_min} ❌")
    print(f"  PNL <= -30: {bot_pnl <= time_stop_loss} ✅" if bot_pnl <= time_stop_loss else f"  PNL <= -30: {bot_pnl <= time_stop_loss} ❌")
    
    return {
        "sym": sym,
        "duration_min": duration_min,
        "actual_pnl": bot_pnl,
        "condition_met": duration_min >= time_stop_soft_min and bot_pnl <= time_stop_loss
    }

# Main execution
print("="*70)
print("V9 BOT P&L VERIFICATION REPORT")
print("="*70)

results = []
time_decay_results = []
hard_stop_results = []
time_stop_results = []

for idx, pos in enumerate(closed_positions):
    result = verify_position(pos, idx)
    if result:
        results.append(result)
    
    # Special condition verifications
    if pos["reason"] == "TAKE_PROFIT_TIME_DECAY":
        td = verify_time_decay(pos)
        if td:
            time_decay_results.append(td)
    elif pos["reason"] == "HARD_STOP_LOSS":
        hs = verify_hard_stop(pos)
        if hs:
            hard_stop_results.append(hs)
    elif pos["reason"] == "TIME_STOP_NO_BOUNCE":
        ts = verify_time_stop(pos)
        if ts:
            time_stop_results.append(ts)
    
    time.sleep(0.5)  # Rate limiting

# Summary
print(f"\n{'='*70}")
print("SUMMARY")
print(f"{'='*70}")

matched = [r for r in results if r["match"]]
mismatched = [r for r in results if not r["match"]]

print(f"\nPNL Verification:")
print(f"  Total positions: {len(results)}")
print(f"  Matched: {len(matched)}")
print(f"  Mismatched: {len(mismatched)}")

if mismatched:
    print(f"\n  Mismatched positions:")
    for r in mismatched:
        print(f"    {r['sym']}: Bot=${r['bot_pnl']:.2f}, Expected=${r['expected_pnl']:.2f}, Diff=${r['diff']:.2f}")

print(f"\nTIME_DECAY Verification:")
for td in time_decay_results:
    status = "✅" if td["condition_met"] else "❌"
    print(f"  {td['sym']}: Duration={td['duration_min']:.1f}min, PNL=${td['actual_pnl']:.2f}, Threshold=${td['threshold']:.2f} {status}")

print(f"\nHARD_STOP_LOSS Verification:")
for hs in hard_stop_results:
    status = "✅" if hs["condition_met"] else "❌"
    print(f"  {hs['sym']}: PNL=${hs['actual_pnl']:.2f}, Threshold=${hs['cut_loss']} {status}")

print(f"\nTIME_STOP_NO_BOUNCE Verification:")
for ts in time_stop_results:
    status = "✅" if ts["condition_met"] else "❌"
    print(f"  {ts['sym']}: Duration={ts['duration_min']:.1f}min, PNL=${ts['actual_pnl']:.2f} {status}")

print(f"\n{'='*70}")
print("VERIFICATION COMPLETE")
print(f"{'='*70}")
