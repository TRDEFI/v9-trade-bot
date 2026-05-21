#!/usr/bin/env python3
"""
V9 Bot P&L Verification - Corrected
Uses bot's actual entry/close prices and verifies they existed in market
"""
import json
import urllib.request
import time

closed_positions = [
    {"sym":"SKYAIUSDT","side":"SHORT","entry":0.29507,"closed_price":0.29414,"pnl":12.258972447215685,"strat":"MA10_REJECT","reason":"TAKE_PROFIT","opened":1779218101867,"closed":1779218220447},
    {"sym":"SKYAIUSDT","side":"SHORT","entry":0.29381,"closed_price":0.29286,"pnl":12.666910588475652,"strat":"MA10_REJECT","reason":"TAKE_PROFIT","opened":1779218400704,"closed":1779218446867},
    {"sym":"BLUAIUSDT","side":"LONG","entry":0.009271,"closed_price":0.009131,"pnl":-79.00426059756202,"strat":"MA10_BOUNCE","reason":"HARD_STOP_LOSS","opened":1779218101867,"closed":1779219700196},
    {"sym":"BILLUSDT","side":"LONG","entry":0.10675,"closed_price":0.10714,"pnl":14.766978922716696,"strat":"RSI_OVERSOLD","reason":"TAKE_PROFIT","opened":1779219904690,"closed":1779219934531},
    {"sym":"MUUSDT","side":"LONG","entry":698.06,"closed_price":699.66,"pnl":7.960332922671567,"strat":"TREND_LONG","reason":"TAKE_PROFIT_TIME_DECAY","opened":1779219904690,"closed":1779220799054},
    {"sym":"PROMUSDT","side":"LONG","entry":1.0899999999999999,"closed_price":1.093,"pnl":10.261467889908781,"strat":"RSI_OVERSOLD","reason":"TAKE_PROFIT","opened":1779220804461,"closed":1779220867933},
    {"sym":"PENDLEUSDT","side":"LONG","entry":1.7452,"closed_price":1.7501,"pnl":10.538505615401972,"strat":"SQUEEZE_LONG","reason":"TAKE_PROFIT","opened":1779220867923,"closed":1779221099251},
    {"sym":"BinanceLife","side":"LONG","entry":0.4164,"closed_price":0.41747,"pnl":9.34822286263227,"strat":"SQUEEZE_LONG","reason":"TAKE_PROFIT_TIME_DECAY","opened":1779219904690,"closed":1779221482219, "real_sym":"币安人生USDT"},
    {"sym":"APRUSDT","side":"SHORT","entry":0.17497,"closed_price":0.17324,"pnl":45.937046350802476,"strat":"SQUEEZE_SHORT","reason":"TAKE_PROFIT","opened":1779219934524,"closed":1779221620988},
    {"sym":"PROMUSDT","side":"LONG","entry":1.093,"closed_price":1.096,"pnl":10.223696248856877,"strat":"RSI_OVERSOLD","reason":"TAKE_PROFIT","opened":1779221099243,"closed":1779221704353},
    {"sym":"RONINUSDT","side":"LONG","entry":0.1075,"closed_price":0.1067,"pnl":-40.70930232558117,"strat":"MA10_BOUNCE","reason":"TIME_STOP_NO_BOUNCE","opened":1779219904690,"closed":1779221704861},
    {"sym":"BILLUSDT","side":"LONG","entry":0.10323,"closed_price":0.10354,"pnl":11.515015015014571,"strat":"RSI_OVERSOLD","reason":"TAKE_PROFIT","opened":1779222604402,"closed":1779222631561},
    {"sym":"BILLUSDT","side":"LONG","entry":0.10348,"closed_price":0.10378,"pnl":10.995554696559466,"strat":"RSI_OVERSOLD","reason":"TAKE_PROFIT","opened":1779222811832,"closed":1779222859584},
    {"sym":"PYTHUSDT","side":"LONG","entry":0.03835,"closed_price":0.03848,"pnl":13.44915254237264,"strat":"SQUEEZE_LONG","reason":"TAKE_PROFIT","opened":1779222604402,"closed":1779223083771},
]

NOTIONAL = 5000
COMMISSION_RATE = 0.0005

def fetch_klines(symbol, start_time, end_time, interval="1m", limit=100):
    url = f"https://fapi.binance.com/fapi/v1/klines?symbol={symbol}&interval={interval}&startTime={start_time}&endTime={end_time}&limit={limit}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"  ERROR: {e}")
        return None

def verify_position(pos, idx):
    sym = pos.get("real_sym", pos["sym"])
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
    
    # Fetch klines around open and close times (wider range)
    start_time = opened - 10 * 60 * 1000
    end_time = closed + 10 * 60 * 1000
    
    klines = fetch_klines(sym, start_time, end_time)
    if not klines:
        print(f"   Could not fetch klines")
        return None
    
    # Find candle containing the open time (for entry price verification)
    # and candle containing the close time (for close price verification)
    entry_candle = None
    close_candle = None
    
    for k in klines:
        candle_open_time = k[0]
        candle_close_time = candle_open_time + 60000  # 1m candle
        high = float(k[2])
        low = float(k[3])
        open_price = float(k[1])
        close_price = float(k[4])
        
        # Entry candle: the candle that was open when position was opened
        if entry_candle is None and candle_open_time <= opened < candle_close_time:
            entry_candle = k
        # Close candle: the candle that was open when position was closed
        if candle_open_time <= closed < candle_close_time:
            close_candle = k
    
    if entry_candle and close_candle:
        entry_high = float(entry_candle[2])
        entry_low = float(entry_candle[3])
        entry_open = float(entry_candle[1])
        entry_close = float(entry_candle[4])
        
        close_high = float(close_candle[2])
        close_low = float(close_candle[3])
        close_open = float(close_candle[1])
        close_close = float(close_candle[4])
        
        print(f"  Entry Candle: O={entry_open} H={entry_high} L={entry_low} C={entry_close}")
        print(f"  Close Candle: O={close_open} H={close_high} L={close_low} C={close_close}")
        
        # Verify bot's entry price was within candle range
        entry_valid = entry_low <= bot_entry <= entry_high
        print(f"  Entry Price Valid: {entry_low} <= {bot_entry} <= {entry_high} = {entry_valid}")
        
        # Verify bot's close price was within candle range
        close_valid = close_low <= bot_close <= close_high
        print(f"  Close Price Valid: {close_low} <= {bot_close} <= {close_high} = {close_valid}")
        
        if not entry_valid:
            print(f"  ⚠ Entry price outside candle range! Checking nearby candles...")
            # Check if entry price matches previous candle's close (signal candle)
            entry_idx = klines.index(entry_candle)
            if entry_idx > 0:
                prev_candle = klines[entry_idx - 1]
                prev_close = float(prev_candle[4])
                prev_high = float(prev_candle[2])
                prev_low = float(prev_candle[3])
                print(f"  Previous Candle Close: {prev_close} (range: {prev_low}-{prev_high})")
                if prev_low <= bot_entry <= prev_high:
                    print(f"  ✅ Entry price matches previous candle (signal candle)")
                    entry_valid = True
        
        # Calculate expected PNL using bot's actual prices
        direction = 1 if side == "LONG" else -1
        gross_pnl = NOTIONAL * (bot_close - bot_entry) / bot_entry * direction
        commission = NOTIONAL * COMMISSION_RATE * 2
        net_pnl = gross_pnl - commission
        
        print(f"  Calculated Gross PNL: ${gross_pnl:.2f}")
        print(f"  Calculated Commission: ${commission:.2f}")
        print(f"  Calculated Net PNL: ${net_pnl:.2f}")
        print(f"  Bot Reported PNL: ${bot_pnl:.2f}")
        
        pnl_diff = abs(net_pnl - bot_pnl)
        pnl_diff_pct = pnl_diff / abs(bot_pnl) * 100 if bot_pnl != 0 else 0
        
        if pnl_diff < 3:
            print(f"  ✅ PNL Match (diff: ${pnl_diff:.2f}, {pnl_diff_pct:.1f}%)")
        elif pnl_diff < 10:
            print(f"   PNL Close (diff: ${pnl_diff:.2f}, {pnl_diff_pct:.1f}%)")
        else:
            print(f"  ❌ PNL Mismatch (diff: ${pnl_diff:.2f}, {pnl_diff_pct:.1f}%)")
        
        return {
            "sym": sym,
            "bot_pnl": bot_pnl,
            "calculated_pnl": net_pnl,
            "diff": pnl_diff,
            "entry_valid": entry_valid,
            "close_valid": close_valid,
            "match": pnl_diff < 10
        }
    else:
        print(f"  ⚠ Could not find matching candles")
        if not entry_candle:
            print(f"  Entry candle not found (opened={opened})")
        if not close_candle:
            print(f"  Close candle not found (closed={closed})")
        return None

def verify_time_decay(pos):
    sym = pos.get("real_sym", pos["sym"])
    reason = pos["reason"]
    opened = pos["opened"]
    closed = pos["closed"]
    bot_pnl = pos["pnl"]
    
    if reason != "TAKE_PROFIT_TIME_DECAY":
        return None
    
    duration_min = (closed - opened) / 60000
    target_profit = 10.0
    threshold = target_profit * 0.6
    
    print(f"\n  TIME_DECAY Verification for {sym}:")
    print(f"  Duration: {duration_min:.1f} min (required: >= 10 min)")
    print(f"  Target Profit: ${target_profit:.2f}")
    print(f"  60% Threshold: ${threshold:.2f}")
    print(f"  Actual PNL: ${bot_pnl:.2f}")
    
    duration_ok = duration_min >= 10
    pnl_ok = bot_pnl >= threshold
    
    print(f"  Duration >= 10min: {'✅' if duration_ok else '❌'}")
    print(f"  PNL >= Threshold: {'✅' if pnl_ok else '❌'}")
    
    if duration_ok and pnl_ok:
        print(f"  ✅ TIME_DECAY condition correctly triggered")
    else:
        print(f"  ❌ TIME_DECAY condition NOT met!")
    
    return {"sym": sym, "condition_met": duration_ok and pnl_ok}

def verify_hard_stop(pos):
    sym = pos.get("real_sym", pos["sym"])
    reason = pos["reason"]
    bot_pnl = pos["pnl"]
    
    if reason != "HARD_STOP_LOSS":
        return None
    
    cut_loss = -75
    print(f"\n  HARD_STOP_LOSS Verification for {sym}:")
    print(f"  cut_loss threshold: ${cut_loss}")
    print(f"  Actual PNL: ${bot_pnl:.2f}")
    
    condition_met = bot_pnl <= cut_loss
    print(f"  PNL <= cut_loss: {'✅' if condition_met else ''}")
    
    return {"sym": sym, "condition_met": condition_met}

def verify_time_stop(pos):
    sym = pos.get("real_sym", pos["sym"])
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
    
    duration_ok = duration_min >= time_stop_soft_min
    pnl_ok = bot_pnl <= time_stop_loss
    
    print(f"  Duration >= 30min: {'✅' if duration_ok else '❌'}")
    print(f"  PNL <= -30: {'✅' if pnl_ok else '❌'}")
    
    return {"sym": sym, "condition_met": duration_ok and pnl_ok}

# Main execution
print("="*70)
print("V9 BOT P&L VERIFICATION REPORT (CORRECTED)")
print("="*70)

results = []
time_decay_results = []
hard_stop_results = []
time_stop_results = []

for idx, pos in enumerate(closed_positions):
    result = verify_position(pos, idx)
    if result:
        results.append(result)
    
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
    
    time.sleep(0.3)

# Summary
print(f"\n{'='*70}")
print("SUMMARY")
print(f"{'='*70}")

matched = [r for r in results if r["match"]]
mismatched = [r for r in results if not r["match"]]
invalid_prices = [r for r in results if not r["entry_valid"] or not r["close_valid"]]

print(f"\nPNL Verification:")
print(f"  Total positions: {len(results)}")
print(f"  PNL Matched: {len(matched)}")
print(f"  PNL Mismatched: {len(mismatched)}")
print(f"  Invalid Prices: {len(invalid_prices)}")

if mismatched:
    print(f"\n  PNL Mismatched positions:")
    for r in mismatched:
        print(f"    {r['sym']}: Bot=${r['bot_pnl']:.2f}, Calc=${r['calculated_pnl']:.2f}, Diff=${r['diff']:.2f}")

if invalid_prices:
    print(f"\n  Invalid Price positions:")
    for r in invalid_prices:
        print(f"    {r['sym']}: entry_valid={r['entry_valid']}, close_valid={r['close_valid']}")

print(f"\nTIME_DECAY Verification:")
for td in time_decay_results:
    status = "✅" if td["condition_met"] else "❌"
    print(f"  {td['sym']}: {status}")

print(f"\nHARD_STOP_LOSS Verification:")
for hs in hard_stop_results:
    status = "✅" if hs["condition_met"] else "❌"
    print(f"  {hs['sym']}: {status}")

print(f"\nTIME_STOP_NO_BOUNCE Verification:")
for ts in time_stop_results:
    status = "✅" if ts["condition_met"] else "❌"
    print(f"  {ts['sym']}: {status}")

print(f"\n{'='*70}")
print("VERIFICATION COMPLETE")
print(f"{'='*70}")
