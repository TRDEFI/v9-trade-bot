<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# V9 Trade Bot — Binance Futures Automated Trading

**Son Güncelleme:** 2026-05-20  
**Versiyon:** v9.2  
**Sunucu:** AWS EC2 (18.181.221.88) | **Port:** 3000 | **PM2:** v9-bot

---

## 1. RİSK PARAMETRELERİ (USER_CONFIG)

| Parametre | Değer | Açıklama |
|-----------|-------|----------|
| `budget` | $2,000 | Başlangıç sermayesi |
| `lev` | 20x | Kaldıraç |
| `max_open` | 4 | Max açık pozisyon |
| `margin` | $250 | Pozisyon başı margin |
| `top_pairs` | 150 | Hacim sıralı takip edilen pair |
| `target_profit` | $3 | Varsayılan net TP |
| `strong_target_profit` | $5 | Güçlü TP |
| `cut_loss` | **-$150** | Hard stop-loss (server-side + polling fallback) |
| `cooldown_min` | 5 | Kayıp sonrası cooldown (dk) |
| `min_atr_pct` | 0.15% | Min volatilite |
| `max_atr_pct` | 4.00% | Max volatilite |
| `time_stop_soft_min` | 30 | Soft time-stop süresi (dk) |
| `time_stop_hard_min` | 60 | Hard time-stop süresi (dk) |
| `time_stop_loss_usd` | **-$20** | Time-stop zarar eşiği |
| `max_trades_per_sym` | 3 | Session başı max trade/sembol |

---

## 2. ÇALIŞMA MEKANİZMASI

### 2.1 Başlangıç
1. `server.ts` → `BotRunner` instance → `bot.start()`
2. Top 150 hacimli USDT pair Binance API'den çekilir
3. WebSocket subscription: `!ticker@arr` + kline streams (5m, 15m, 1h)

### 2.2 Ana Döngü (500ms interval)
```
loop() → 500ms bekle → loop()
```

**Her tick'te sırayla:**

| Adım | Frekans | Açıklama |
|------|---------|----------|
| **Balance Sync** | 10sn | Binance'den gerçek bakiye + pozisyon senkronizasyonu |
| **Pozisyon Kontrolü** | 500ms | TP/SL/Time-Stop condition'ları → gerekirse kapat |
| **Drawdown Kontrolü** | 500ms | Toplam PNL < -40% free balance → en zararlıyı kapat (MARGIN_CALL) |
| **Signal Scanning** | 500ms | Round-robin, max 10 pair/tick, 5sn cooldown per pair |

### 2.3 Signal Generation Pipeline
```
1. 15m klines çek (80 candle) → closed15m
2. 5m klines çek (15 candle) → closed5m
3. getSignal(closed15m) → Signal objesi
4. Score >= 0.75? → Hayır → REJECT
5. DISABLED_STRATS kontrolü (VOL_BREAKDN) → VARSA → REJECT
6. TREND_LONG/MA10_REJECT score boost (+0.05) → Uygula
7. ATR% 0.15-4.00 aralığında? → Hayır → REJECT
8. Price slippage < 0.5%? → Hayır → REJECT
9. RSI5m kontrolü (LONG: <80, SHORT: >20) → Hayır → REJECT
10. Active 5m candle direction check → Hayır → REJECT
11. 1h trend filter (STRICT_TREND_STRATS only) → Hayır → REJECT
12. Free margin >= $250? → Hayır → REJECT
13. Max trades per symbol (3)? → Hayır → REJECT
14. ✅ Pozisyon AÇ → Server-side STOP_MARKET emri ver
```

### 2.4 Pozisyon Açma
1. **Limit Order (GTX)** — maker fee 0.02%
2. **Server-side STOP_MARKET** — `cut_loss` (-$150) fiyatına, `MARK_PRICE` trigger
3. Pozisyon objesi kaydedilir, `reservedCapital` güncellenir

### 2.5 Pozisyon Kapatma (Öncelik Sırası)
| Condition | Tetiklenme | Açıklama |
|-----------|------------|----------|
| **TAKE_PROFIT** | `netPnlUsd >= targetProfit` | Hedef kâra ulaşınca |
| **HARD_STOP_LOSS** | `netPnlUsd <= -150` | Server-side STOP_MARKET tetikler, polling fallback |
| **TIME_STOP_NO_BOUNCE** | `age >= 30dk && netPnl <= -20` | 30dk geçti, bounce olmadı |
| **TIME_STOP_HARD** | `age >= 60dk && netPnl < 0` | 60dk geçti, hâlâ zararda |
| **TIME_DECAY** | `age >= 10dk && netPnl >= target * 0.6` | 10dk geçti, %60 TP'ye ulaştı |
| **MARGIN_CALL** | `totalNetPnl < -40% freeBalance` | En zararlı pozisyon kapatılır, 5dk cooldown |

---

## 3. STRATEJİLER

### 3.1 Aktif Stratejiler

| Strateji | Score | Side | Koşullar |
|----------|-------|------|----------|
| **RSI_OVERSOLD** | 0.90 | LONG | RSI < 30 |
| **RSI_OVERBOUGHT** | 0.90 | SHORT | RSI > 70 |
| **MA10_BOUNCE** | 0.88 | LONG | Deviation < -2.5%, RSI < 40 |
| **MA10_REJECT** | 0.88 → **0.93** | SHORT | Deviation > 2.5%, RSI > 60 |
| **EMA_CROSS_UP** | 0.86 | LONG | EMA9 > EMA21 crossover, VR > 1.3, RSI < 65 |
| **EMA_CROSS_DN** | 0.86 | SHORT | EMA9 < EMA21 crossover, VR > 1.3, RSI > 35 |
| **BB_REVERSION_LONG** | 0.87 | LONG | Price < BB_lower, RSI < 35, VR > 1.3, **price > EMA50*0.995** |
| **BB_REVERSION_SHORT** | 0.87 | SHORT | Price > BB_upper, RSI > 65, VR > 1.3, **price < EMA50*1.005** |
| **TREND_LONG** | 0.85 → **0.90** | LONG | MA10 > MA20, Deviation < -1.5%, RSI < 50 |
| **TREND_SHORT** | 0.85 | SHORT | MA10 < MA20, Deviation > 1.5%, RSI > 50 |
| **VOL_BREAKUP** | 0.82 | LONG | VR > 2.5, Price > MA10, RSI < 60 |
| **MOMENTUM_LONG** | 0.84 | LONG | 3 bullish candles, VR > 2.0, Price > EMA50, RSI < 60 |
| **MOMENTUM_SHORT** | 0.84 | SHORT | 3 bearish candles, VR > 2.0, Price < EMA50, RSI > 40 |
| **SQUEEZE_LONG** | 0.80 | LONG | VR < 0.5, RSI < 35 |
| **SQUEEZE_SHORT** | 0.80 | SHORT | VR < 0.5, RSI > 65 |

### 3.2 Devre Dışı Stratejiler
| Strateji | Neden |
|----------|-------|
| **VOL_BREAKDN** | Sürekli zarar eden strateji |

### 3.3 Strateji Grupları
- **MEAN_REVERSION_STRATS:** RSI_OVERSOLD/OVERBOUGHT, BB_REVERSION, SQUEEZE, MA10_BOUNCE/REJECT
- **STRICT_TREND_STRATS:** EMA_CROSS_UP, RSI_OVERBOUGHT (1h trend filtresi uygulanır)
- **DISABLED_STRATS:** VOL_BREAKDN

---

## 4. RİSK YÖNETİMİ

### 4.1 Server-Side Stop-Loss
- Pozisyon açıldığında Binance'e `STOP_MARKET` emri gönderilir
- Trigger: **MARK_PRICE** (fitil tetiklemesini önler)
- Fiyat: `entry ± (|cut_loss| / notionalValue)`
- Pozisyon kapanırken emir otomatik iptal edilir
- **Fallback:** Server-side emir çalışmazsa polling-based `cut_loss` devreye girer

### 4.2 Drawdown Koruması
```
freeBalance = capital - reservedCapital
maxDrawdownUsd = freeBalance * 0.40

if (totalNetPnl < 0 && abs(totalNetPnl) >= maxDrawdownUsd) {
    en_zararli_pozisyonu_kapat();
    5dk_cooldown_baslat();
}
```

### 4.3 Komisyon
| İşlem | Tip | Fee | Hesaplama |
|-------|-----|-----|-----------|
| Açılış | Limit (GTX) | 0.02% | $5,000 × 0.0002 = $1.00 |
| Kapanış | Market | 0.05% | $5,000 × 0.0005 = $2.50 |
| **Toplam** | | | **$3.50** |

---

## 5. DEPLOYMENT

### 5.1 Lokal Geliştirme
```bash
npm install
npm run dev
```

### 5.2 AWS Deployment
```bash
# 1. Push
git add server/botRunner.ts server/strategy.ts server/binanceClient.ts
git commit -m "description"
git push

# 2. AWS
ssh -i "v9-key.pem" ubuntu@18.181.221.88
cd ~/v9-trade-bot
pm2 stop v9-bot
git pull
npm run build
pm2 restart v9-bot --update-env
truncate -s 0 bot_scan.log
```

### 5.3 Dashboard
- **URL:** `http://18.181.221.88:3000`
- **API:** `http://18.181.221.88:3000/api/data`

---

## 6. DEĞİŞİKLİK GEÇMİŞİ

### v9.2 (2026-05-20)
- **Server-side STOP_MARKET** emri eklendi (MARK_PRICE trigger)
- `cut_loss`: -$75 → **-$150** (server-side koruma ile güvenli)
- `bestSeen < $3` koşulu time_stop'tan **kaldırıldı** (erken çıkış garantisi)
- **BB_REVERSION 15m trend filtresi** eklendi (EMA50 yönüne uygun entry)
- `time_stop_loss_usd`: -$30 → **-$20**

### v9.1 (2026-05-20)
- `VOL_BREAKDN` devre dışı bırakıldı
- `TREND_LONG` ve `MA10_REJECT` score boost (+0.05)
- `MA10_BOUNCE` aktif bırakıldı

### v9.0 (2026-05-19)
- `cut_loss`: -$200 → -$75
- 1h trend filter sadece STRICT_TREND_STRATS için aktif
- TIME_DECAY TP eklendi (10dk, %60 target)
- Dynamic TP (strategy tp_target veya ATR-based)

---

## 7. KOD YAPISI

| Dosya | Satır | Sorumluluk |
|-------|-------|------------|
| `server/botRunner.ts` | 732 | Ana bot mantığı, pozisyon yönetimi, risk kontrolleri |
| `server/strategy.ts` | 295 | Teknik indikatörler, sinyal üretimi |
| `server/binanceClient.ts` | 680 | Binance API, WebSocket, order execution, stop-loss |
| `server.ts` | 93 | Express API sunucusu |
