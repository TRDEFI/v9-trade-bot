#!/usr/bin/env python3
"""
Monitoring agent for Binance Futures trading bot with kline autopsies.
Runs every 15 minutes to fetch dashboard data, analyze trades, and generate self-evolution suggestions.
"""
import json
import requests
import time
import os
import sys
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional, Tuple

# Configuration
DASHBOARD_URL = "http://18.181.221.88:3000/api/data"
BINANCE_KLINES_URL = "https://fapi.binance.com/fapi/v1/klines"
LOG_FILE = "/workspace/self_evolution_log.json"
STATE_FILE = "/workspace/monitor_state.json"

# In-memory state (will be loaded from STATE_FILE)
state = {
    "last_check": None,  # timestamp of last check
    "closed_seen": set(),  # set of closed trade IDs we've already processed
    "consecutive_losses": {},  # strategy -> consecutive loss count
    "slippage_data": {},  # symbol -> list of slippage entries
    "strategy_performance": {},  # strategy -> {trades, wins, losses, total_pnl}
    "session_start": None,  # timestamp when monitoring started
}

def load_state():
    """Load state from file if exists."""
    global state
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r') as f:
                state = json.load(f)
            # Convert closed_seen back to set
            state["closed_seen"] = set(state.get("closed_seen", []))
        except Exception as e:
            print(f"Error loading state: {e}")
    # Initialize session start if not set
    if state["session_start"] is None:
        state["session_start"] = int(time.time() * 1000)

def save_state():
    """Save state to file."""
    # Convert set to list for JSON serialization
    state_to_save = state.copy()
    state_to_save["closed_seen"] = list(state["closed_seen"])
    with open(STATE_FILE, 'w') as f:
        json.dump(state_to_save, f, indent=2)

def fetch_dashboard() -> Optional[Dict]:
    """Fetch data from the bot's dashboard."""
    try:
        resp = requests.get(DASHBOARD_URL, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"Error fetching dashboard: {e}")
        return None

def fetch_klines(symbol: str, interval: str, start_time: int, end_time: int) -> List:
    """Fetch klines from Binance."""
    params = {
        "symbol": symbol,
        "interval": interval,
        "startTime": start_time,
        "endTime": end_time,
        "limit": 20  # max limit
    }
    try:
        resp = requests.get(BINANCE_KLINES_URL, params=params, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"Error fetching klines for {symbol}: {e}")
        return []

def format_timestamp_ms(timestamp_ms: int) -> str:
    """Convert milliseconds timestamp to HH:MM format."""
    dt = datetime.fromtimestamp(timestamp_ms / 1000, tz=timezone.utc)
    return dt.strftime("%H:%M")

def analyze_candle_type(kline: List) -> str:
    """Determine candle type from kline data."""
    open_price = float(kline[1])
    close_price = float(kline[4])
    high_price = float(kline[2])
    low_price = float(kline[3])
    body = abs(close_price - open_price)
    total_range = high_price - low_price
    
    if total_range < 0.001:  # Very small range
        return "doji"
    
    upper_wick = high_price - max(open_price, close_price)
    lower_wick = min(open_price, close_price) - low_price
    wick_ratio = max(upper_wick, lower_wick) / total_range if total_range > 0 else 0
    
    if wick_ratio > 0.5:
        if upper_wick > lower_wick * 2:
            return "long_wick_up"
        elif lower_wick > upper_wick * 2:
            return "long_wick_down"
        else:
            return "high_wave"
    
    if close_price > open_price:
        return "green"
    else:
        return "red"

def calculate_volume_ratio(kline: List, previous_klines: List) -> float:
    """Calculate volume ratio vs average of previous 10 candles."""
    current_volume = float(kline[5])
    if not previous_klines:
        return 1.0
    
    previous_volumes = [float(k[5]) for k in previous_klines[-10:]]
    avg_volume = sum(previous_volumes) / len(previous_volumes)
    
    return current_volume / avg_volume if avg_volume > 0 else 1.0

def detect_pattern(kline: List, previous_klines: List, next_klines: List) -> str:
    """Detect trading patterns."""
    current = kline
    prev = previous_klines[-1] if previous_klines else None
    
    if not prev:
        return "none"
    
    current_open = float(current[1])
    current_close = float(current[4])
    current_high = float(current[2])
    current_low = float(current[3])
    prev_open = float(prev[1])
    prev_close = float(prev[4])
    prev_high = float(prev[2])
    prev_low = float(prev[3])
    
    # Check for engulfing pattern
    if current_high > prev_high and current_low < prev_low:
        if current_close > current_open and prev_close < prev_open:
            return "engulfing_bullish"
        elif current_close < current_open and prev_close > prev_open:
            return "engulfing_bearish"
    
    # Check for rejection wick
    current_body = abs(current_close - current_open)
    current_wick = max(current_high - max(current_open, current_close), 
                       min(current_open, current_close) - current_low)
    total_range = current_high - current_low
    if current_wick > current_body * 2:
        return "rejection_wick"
    
    # Check for pin bar
    if current_wick > total_range * 0.7:
        return "pin_bar"
    
    # Check for gap
    if current_open > prev_high or current_close < prev_low:
        return "gap"
    
    # Check for spike (high volume)
    volume_ratio = calculate_volume_ratio(current, previous_klines)
    if volume_ratio > 2.0:
        return "spike"
    
    return "none"

def calculate_trend_direction(klines: List, reference_time: int) -> str:
    """Calculate trend direction based on klines before reference time."""
    if len(klines) < 5:
        return "sideways"
    
    # Filter klines before reference time
    before_klines = [k for k in klines if int(k[0]) < reference_time]
    if len(before_klines) < 3:
        return "sideways"
    
    # Check if trend is up, down, or sideways
    highs = [float(k[2]) for k in before_klines[-5:]]
    lows = [float(k[3]) for k in before_klines[-5:]]
    
    trend_up = 0
    trend_down = 0
    
    for i in range(1, len(highs)):
        if highs[i] > highs[i-1]:
            trend_up += 1
        elif highs[i] < highs[i-1]:
            trend_down += 1
    
    if trend_up > trend_down * 1.5:
        return "up"
    elif trend_down > trend_up * 1.5:
        return "down"
    else:
        return "sideways"

def perform_kline_autopsy(trade: Dict, klines_1m: List, klines_3m: List) -> Dict:
    """Perform kline autopsy on a single trade."""
    symbol = trade.get("sym")
    side = trade.get("side")
    entry_price = float(trade.get("entry"))
    close_price = float(trade.get("closed_price"))
    pnl = float(trade.get("pnl"))
    strategy = trade.get("strat")
    reason = trade.get("reason")
    opened_ms = int(trade.get("opened"))
    closed_ms = int(trade.get("closed"))
    
    # Combine klines for analysis
    all_klines = klines_1m + klines_3m
    if not all_klines:
        return {
            **trade,
            "kline_error": "no_data",
            "autopsy_summary": "No kline data available for analysis"
        }
    
    # Sort by timestamp
    all_klines.sort(key=lambda x: int(x[0]))
    
    # Find entry and exit candles
    entry_candle = None
    exit_candle = None
    prev_klines = []
    next_klines = []
    
    for i, kline in enumerate(all_klines):
        kline_time = int(kline[0])
        if kline_time >= opened_ms and entry_candle is None:
            entry_candle = kline
            prev_klines = all_klines[:i] if i > 0 else []
            next_klines = all_klines[i+1:] if i < len(all_klines)-1 else []
        if kline_time >= closed_ms and exit_candle is None:
            exit_candle = kline
    
    if not entry_candle:
        return {
            **trade,
            "kline_error": "entry_candle_not_found",
            "autopsy_summary": "Entry candle not found in kline data"
        }
    
    # Calculate metrics
    entry_candle_type = analyze_candle_type(entry_candle)
    entry_volume_ratio = calculate_volume_ratio(entry_candle, prev_klines)
    
    # Calculate max favorable and unfavorable moves
    relevant_klines = [k for k in all_klines if int(k[0]) >= opened_ms and int(k[0]) <= closed_ms]
    max_price = max(float(k[2]) for k in relevant_klines) if relevant_klines else entry_price
    min_price = min(float(k[3]) for k in relevant_klines) if relevant_klines else entry_price
    
    max_favorable_pct = (max_price - entry_price) / entry_price if entry_price != 0 else 0
    max_unfavorable_pct = (min_price - entry_price) / entry_price if entry_price != 0 else 0
    
    # Stop hit candle analysis
    stop_hit_candle_type = "none"
    stop_hit_volume_ratio = 1.0
    
    if reason == "HARD_STOP_LOSS" and exit_candle:
        stop_hit_candle_type = analyze_candle_type(exit_candle)
        stop_hit_volume_ratio = calculate_volume_ratio(exit_candle, prev_klines)
    
    # Pattern detection
    pattern = detect_pattern(entry_candle, prev_klines, next_klines)
    
    # Trend analysis
    trend_15m = calculate_trend_direction(prev_klines, opened_ms)
    entry_against_trend = (trend_15m in ["down", "up"] and 
                          ((side == "LONG" and trend_15m == "down") or 
                           (side == "SHORT" and trend_15m == "up")))
    
    # Slippage calculation (for HARD_STOP_LOSS)
    slippage_usd = 0
    if reason == "HARD_STOP_LOSS":
        # Assuming trigger was at -$25, but actual fill was worse
        slippage_usd = pnl - (-25)  # If actual loss was more than $25
    
    # Runner analysis for winning trades
    runner_pct = 0
    tp_captured_pct_of_runner = 0
    
    if reason in ["TAKE_PROFIT", "TAKE_PROFIT_TIME_DECAY"]:
        runner_pct = max_favorable_pct
        tp_captured_pct_of_runner = (close_price - entry_price) / entry_price if entry_price != 0 else 0
    
    # Generate summary
    summary_parts = []
    summary_parts.append(f"Entry on {entry_candle_type} candle")
    if entry_volume_ratio > 1.5:
        summary_parts.append(f"with {entry_volume_ratio:.1f}x volume")
    if pattern != "none":
        summary_parts.append(f"Pattern: {pattern}")
    if entry_against_trend:
        summary_parts.append("Entry against trend")
    if reason == "HARD_STOP_LOSS":
        summary_parts.append(f"Stop hit on {stop_hit_candle_type} candle")
    
    autopsy_summary = " ".join(summary_parts) + ". " + f"PnL: ${pnl:.2f}"
    
    return {
        "sym": symbol,
        "side": side,
        "entry": entry_price,
        "close": close_price,
        "pnl": pnl,
        "strat": strategy,
        "reason": reason,
        "opened": format_timestamp_ms(opened_ms),
        "closed": format_timestamp_ms(closed_ms),
        "entry_candle_type": entry_candle_type,
        "entry_volume_ratio": entry_volume_ratio,
        "max_favorable_pct": max_favorable_pct,
        "max_unfavorable_pct": max_unfavorable_pct,
        "stop_hit_candle_type": stop_hit_candle_type,
        "stop_hit_volume_ratio": stop_hit_volume_ratio,
        "pattern_detected": pattern,
        "trend_15m": trend_15m,
        "entry_was_against_trend": entry_against_trend,
        "slippage_usd": slippage_usd,
        "runner_pct": runner_pct,
        "tp_captured_pct_of_runner": tp_captured_pct_of_runner,
        "autopsy_summary": autopsy_summary
    }

def update_consecutive_losses(strategy: str, is_win: bool):
    """Update consecutive loss counter for a strategy."""
    if is_win:
        # Reset consecutive losses on a win
        if strategy in state["consecutive_losses"]:
            del state["consecutive_losses"][strategy]
    else:
        # Increment consecutive losses
        state["consecutive_losses"][strategy] = state["consecutive_losses"].get(strategy, 0) + 1

def update_slippage(symbol: str, trigger_usd: float, fill_usd: float):
    """Record slippage for a symbol."""
    slippage_usd = fill_usd - trigger_usd
    if symbol not in state["slippage_data"]:
        state["slippage_data"][symbol] = []
    state["slippage_data"][symbol].append({
        "trigger": trigger_usd,
        "fill": fill_usd,
        "slippage": slippage_usd
    })

def update_strategy_performance(strategy: str, is_win: bool, pnl: float):
    """Update performance metrics for a strategy."""
    if strategy not in state["strategy_performance"]:
        state["strategy_performance"][strategy] = {
            "trades": 0,
            "wins": 0,
            "losses": 0,
            "total_pnl": 0.0
        }
    perf = state["strategy_performance"][strategy]
    perf["trades"] += 1
    if is_win:
        perf["wins"] += 1
    else:
        perf["losses"] += 1
    perf["total_pnl"] += pnl

def generate_slippage_heatmap() -> List[Dict]:
    """Generate slippage heatmap from recorded data."""
    heatmap = []
    for symbol, data in state["slippage_data"].items():
        if data:
            latest = data[-1]  # Use latest entry
            heatmap.append({
                "sym": symbol,
                "trigger_usd": latest["trigger"],
                "fill_usd": latest["fill"],
                "slippage_usd": latest["slippage"]
            })
    return heatmap

def generate_strategy_performance() -> List[Dict]:
    """Generate strategy performance metrics."""
    perf_list = []
    for strategy, data in state["strategy_performance"].items():
        wins = data["wins"]
        losses = data["losses"]
        trades = data["trades"]
        win_pct = (wins / trades * 100) if trades > 0 else 0
        
        perf_list.append({
            "strat": strategy,
            "trades": trades,
            "wins": wins,
            "losses": losses,
            "win_pct": round(win_pct, 1),
            "total_pnl": round(data["total_pnl"], 2)
        })
    return perf_list

def check_anomalies(dashboard_data: Dict, kline_autopsies: List) -> List[str]:
    """Check for anomalies in the data."""
    anomalies = []
    
    # Check if bot is active
    if not dashboard_data.get("is_active", False):
        anomalies.append("BOT NOT ACTIVE")
    
    # Check for large single losses
    for autopsy in kline_autopsies:
        if autopsy.get("pnl", 0) < -40:
            anomalies.append(f"Large loss: {autopsy['sym']} ${autopsy['pnl']:.2f}")
    
    # Check for excessive stop losses
    stop_count = sum(1 for a in kline_autopsies if a.get("reason") == "HARD_STOP_LOSS")
    if stop_count > 3:
        anomalies.append(f"High stop loss count: {stop_count}")
    
    # Check for capital drawdown
    capital = dashboard_data.get("capital", 0)
    session_start_capital = dashboard_data.get("session_start", 0)
    if session_start_capital > 0:
        drawdown = (capital - session_start_capital) / session_start_capital
        if drawdown < -0.05:  # >5% drawdown
            anomalies.append(f"Capital drawdown: {drawdown:.1%}")
    
    return anomalies

def generate_suggestions(kline_autopsies: List, consecutive_losses: Dict, anomalies: List) -> List[str]:
    """Generate exactly one concrete self-evolution suggestion per cycle."""
    suggestions = []
    
    # Check for consecutive losses
    for strategy, count in consecutive_losses.items():
        if count >= 3:
            suggestions.append(f"Disable {strategy} (consecutive {count} losses)")
            break  # Only one suggestion needed
    
    # Check for high slippage
    for autopsy in kline_autopsies:
        if abs(autopsy.get("slippage_usd", 0)) > 5:
            suggestions.append(f"Reduce margin for {autopsy['sym']} (slippage ${autopsy['slippage_usd']:.2f})")
            break  # Only one suggestion needed
    
    # Check for entry rejection patterns
    rejection_count = sum(1 for a in kline_autopsies 
                         if a.get("pattern_detected") == "rejection_wick" and a.get("pnl", 0) < 0)
    if rejection_count >= 2:
        suggestions.append("Add 1-candle confirmation delay for entries")
    
    # Default suggestion if none found
    if not suggestions:
        suggestions.append("Monitor for pattern emergence and optimize entry timing")
    
    return suggestions[:1]  # Ensure exactly one suggestion

def main():
    """Main monitoring loop."""
    print("Starting monitoring agent with kline autopsies...")
    load_state()
    
    # Fetch dashboard data
    dashboard_data = fetch_dashboard()
    if not dashboard_data:
        print("Failed to fetch dashboard data")
        return
    
    # Check if bot is active
    if not dashboard_data.get("is_active", False):
        print("Bot is not active!")
        return
    
    # Update state with latest dashboard data
    state["capital"] = dashboard_data.get("capital", 0)
    state["total_trades"] = dashboard_data.get("total_trades", 0)
    state["total_wins"] = dashboard_data.get("total_wins", 0)
    state["total_losses"] = dashboard_data.get("total_losses", 0)
    state["total_pnl"] = dashboard_data.get("total_pnl", 0)
    
    # Process closed positions since last check
    closed_positions = dashboard_data.get("closed", [])
    last_check = state["last_check"] or 0
    
    kline_autopsies = []
    
    for trade in closed_positions:
        # Create a unique ID for the trade
        trade_id = f"{trade.get('sym', '')}_{trade.get('opened', '')}_{trade.get('closed', '')}"
        if trade_id in state["closed_seen"]:
            continue  # Already processed
        
        state["closed_seen"].add(trade_id)
        
        # Fetch kline data for this trade
        symbol = trade.get("sym", "")
        opened_ms = int(trade.get("opened", 0))
        closed_ms = int(trade.get("closed", 0))
        
        # Define time ranges
        start_time = opened_ms - 120000  # 2 minutes before entry
        end_time = closed_ms + 120000    # 2 minutes after exit
        
        # Fetch klines
        klines_1m = fetch_klines(symbol, "1m", start_time, end_time)
        klines_3m = fetch_klines(symbol, "3m", start_time, end_time)
        
        # Perform autopsy
        autopsy = perform_kline_autopsy(trade, klines_1m, klines_3m)
        kline_autopsies.append(autopsy)
        
        # Update performance metrics
        is_win = trade.get("pnl", 0) > 0
        strategy = trade.get("strat", "UNKNOWN")
        pnl = float(trade.get("pnl", 0))
        
        update_consecutive_losses(strategy, is_win)
        update_strategy_performance(strategy, is_win, pnl)
        
        # For slippage, we would need the trigger price and fill price
        # This is placeholder - in reality, we'd extract from trade data
        if not is_win and pnl < -25:  # Assuming hard stop loss is -25
            trigger_usd = -25.0
            fill_usd = pnl  # Simplified
            update_slippage(symbol, trigger_usd, fill_usd)
    
    # Update last check time
    state["last_check"] = int(time.time() * 1000)
    
    # Generate report components
    slippage_heatmap = generate_slippage_heatmap()
    strategy_performance = generate_strategy_performance()
    anomalies = check_anomalies(dashboard_data, kline_autopsies)
    suggestions = generate_suggestions(kline_autopsies, state["consecutive_losses"], anomalies)
    
    # Capital forecast (simplified)
    current_time = int(time.time() * 1000)
    session_duration = current_time - dashboard_data.get("session_start", current_time)
    hourly_rate = state["total_pnl"] / (session_duration / 3600000) if session_duration > 0 else 0
    forecast_24h = state["capital"] + (hourly_rate * 24)
    
    # Generate final report
    report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "capital": round(state["capital"], 2),
        "total_trades": state["total_trades"],
        "total_wins": state["total_wins"],
        "total_losses": state["total_losses"],
        "total_pnl": round(state["total_pnl"], 2),
        "kline_autopsies": kline_autopsies,
        "slippage_heatmap": slippage_heatmap,
        "consecutive_losses": dict(state["consecutive_losses"]),
        "strategy_performance": strategy_performance,
        "anomalies": anomalies,
        "suggestions": suggestions,
        "capital_forecast_24h": round(forecast_24h, 2)
    }
    
    # Load existing log or create new
    log_data = {"session_start": state["session_start"], "updates": []}
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, 'r') as f:
                log_data = json.load(f)
        except Exception:
            pass  # If corrupt, start fresh
    
    log_data["updates"].append(report)
    
    # Keep only last 100 updates to prevent excessive growth
    if len(log_data["updates"]) > 100:
        log_data["updates"] = log_data["updates"][-100:]
    
    with open(LOG_FILE, 'w') as f:
        json.dump(log_data, f, indent=2)
    
    # Save state
    save_state()
    
    # Print summary for debugging
    print(f"Monitoring check complete at {report['timestamp']}")
    print(f"Capital: ${state['capital']:.2f}")
    print(f"Total P&L: ${state['total_pnl']:.2f}")
    print(f"Trades analyzed: {len(kline_autopsies)}")
    print(f"Kline errors: {sum(1 for a in kline_autopsies if 'kline_error' in a)}")
    if state["consecutive_losses"]:
        print(f"Consecutive losses: {state['consecutive_losses']}")
    if suggestions:
        print(f"Suggestions: {suggestions[0]}")

if __name__ == "__main__":
    main()