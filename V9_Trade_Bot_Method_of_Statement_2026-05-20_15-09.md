# V9 Trade Bot - Method of Statement

**Proje:** Binance Futures Automated Trading Bot  
**Versiyon:** v9.1  
**Sunucu:** AWS EC2 (18.181.221.88)  
**Port:** 3000  
**PM2 Process:** v9-bot  
**Son Güncelleme:** 2026-05-20 15:09

---

## 1. SCANNING PROCESS

### 1.1 Başlangıç
- Bot `server.ts` tarafından başlatılır
- `BotRunner` class instance oluşturulur
- `bot.start()` çağrılır
- Top 150 hacimli USDT pair'leri Binance API'den çekilir
- WebSocket bağlantıları kurulur:
  - `!ticker@arr` stream (tüm pair'lerin anlık fiyatları)
  - 150 stream chunk'ları halinde kline subscription (5m, 15m, 1h)

### 1.2 Ana Döngü (500ms interval)
```
loop() → 500ms bekle → loop()
```

Her tick'te:

1. **Balance Sync** (her 10 saniyede):
   - Binance'den gerçek bakiye çekilir
   - Aktif pozisyonlar senkronize edilir
   - `reservedCapital` güncellenir

2. **Açık Pozisyon Kontrolü**:
   - Her pozisyon için net PNL hesaplanır
   - TP/SL/Time-Stop condition'ları kontrol edilir
   - Gerekirse pozisyon kapatılır

3. **Drawdown Kontrolü**:
   - Toplam PNL < -40% free balance ise
   - En çok zarar eden pozisyon kapatılır (MARGIN_CALL)
   - 5dk cooldown başlar

4. **Signal Scanning** (Round-Robin):
   - `max_open: 4` pozisyon limitine kadar
   - Her tick'te max 10 pair kontrol edilir
   - Pair index'i her tick'te 1 artar (round-robin)
   - 5 saniye cooldown per pair (API spam engelleme)

### 1.3 Signal Generation Pipeline
```
1. 15m klines çek (80 candle) → closed15m (son hariç)
2. 5m klines çek (15 candle) → closed5m
3. getSignal(closed15m) → Signal objesi
4. Score >= 0.75 mi? → Hayır → REJECT
5. DISABLED_STRATS kontrolü (VOL_BREAKDN) → VARSA → REJECT
6. TREND_LONG/MA10_REJECT score boost (+0.05) → Uygula
7. ATR% 0.15-4.00 aralığında mı? → Hayır → REJECT
8. Price slippage < 0.5% mi? → Hayır → REJECT
9. RSI5m kontrolü (LONG: <80, SHORT: >20) → Hayır → REJECT
10. Active 5m candle direction check → Hayır → REJECT
11. 1h trend filter (sadece STRICT_TREND_STRATS) → Hayır → REJECT
12. Free margin yeterli mi? → Hayır → REJECT
13. Max trades per symbol (3) → Hayır → REJECT
14. Pozisyon AÇ
```

---

## 2. İNDİKATÖRLER

### 2.1 Teknik İndikatörler (`server/strategy.ts`)

| İndikatör | Period | Kullanım |
|-----------|--------|----------|
| **RSI** | 14 | Aşırı alım/satım tespiti |
| **EMA** | 9, 21, 50 | Trend yönü, crossover tespiti |
| **MA** | 10, 20 | Basit trend, deviation hesaplama |
| **Bollinger Bands** | 20, 2σ | Mean-reversion hedef fiyat |
| **ATR** | 14 | Volatilite, dinamik TP hesaplama |
| **Volume Ratio** | 20 | Hacim teyidi (sinyal gücü) |
| **Supertrend** | 10, 3 | Trend yönü (kullanılmıyor) |
| **Avg Move** | 20 | Ortalama fiyat hareketi |

### 2.2 İndikatör Hesaplama Detayları

**RSI (14 period):**
```typescript
// İlk period için basit ortalama
// Sonraki periodlar için Wilder's smoothing
avgGain = (avgGain * 13 + gain) / 14
avgLoss = (avgLoss * 13 + loss) / 14
RSI = 100 - (100 / (1 + avgGain / avgLoss))
```

**EMA (n period):**
```typescript
k = 2 / (period + 1)
ema = SMA(first period candles) // Seed
for each candle: ema = (close - ema) * k + ema
```

**ATR (14 period):**
```typescript
TR = max(high-low, |high-prevClose|, |low-prevClose|)
ATR = sum(TR last 14) / 14
```

**Bollinger Bands (20, 2):**
```typescript
SMA = sum(close last 20) / 20
stdDev = sqrt(sum((close-SMA)^2) / 20)
Upper = SMA + 2*stdDev
Lower = SMA - 2*stdDev
```

---

## 3. STRATEJİLER VE SİNYALLER

### 3.1 Strateji Listesi (`server/strategy.ts:172-293`)

| Strateji | Score | Side | Koşullar |
|----------|-------|------|----------|
| **RSI_OVERSOLD** | 0.90 | LONG | RSI < 30 |
| **RSI_OVERBOUGHT** | 0.90 | SHORT | RSI > 70 |
| **MA10_BOUNCE** | 0.88 | LONG | Deviation < -2.5%, RSI < 40 |
| **MA10_REJECT** | 0.88 → **0.93** | SHORT | Deviation > 2.5%, RSI > 60 |
| **EMA_CROSS_UP** | 0.86 | LONG | EMA9 > EMA21 crossover, VR > 1.3, RSI < 65 |
| **EMA_CROSS_DN** | 0.86 | SHORT | EMA9 < EMA21 crossover, VR > 1.3, RSI > 35 |
| **BB_REVERSION_LONG** | 0.87 | LONG | Price < BB_lower*1.002, RSI < 35, VR > 1.3 |
| **BB_REVERSION_SHORT** | 0.87 | SHORT | Price > BB_upper*0.998, RSI > 65, VR > 1.3 |
| **TREND_LONG** | 0.85 → **0.90** | LONG | MA10 > MA20, Deviation < -1.5%, RSI < 50 |
| **TREND_SHORT** | 0.85 | SHORT | MA10 < MA20, Deviation > 1.5%, RSI > 50 |
| **VOL_BREAKUP** | 0.82 | LONG | VR > 2.5, Price > MA10, RSI < 60 |
| **VOL_BREAKDN** | ~~0.82~~ | SHORT | **DEVRE DIŞI** |
| **MOMENTUM_LONG** | 0.84 | LONG | 3 consecutive bullish candles, VR > 2.0, Price > EMA50, RSI < 60 |
| **MOMENTUM_SHORT** | 0.84 | SHORT | 3 consecutive bearish candles, VR > 2.0, Price < EMA50, RSI > 40 |
| **SQUEEZE_LONG** | 0.80 | LONG | VR < 0.5, RSI < 35 |
| **SQUEEZE_SHORT** | 0.80 | SHORT | VR < 0.5, RSI > 65 |

### 3.2 Strateji Grupları

**MEAN_REVERSION_STRATS** (`botRunner.ts:25-34`):
- RSI_OVERSOLD, RSI_OVERBOUGHT
- BB_REVERSION_LONG, BB_REVERSION_SHORT
- SQUEEZE_LONG, SQUEEZE_SHORT
- MA10_BOUNCE, MA10_REJECT

**STRICT_TREND_STRATS** (`botRunner.ts:36-39`):
- EMA_CROSS_UP
- RSI_OVERBOUGHT

**DISABLED_STRATS** (`botRunner.ts:36-39`):
- VOL_BREAKDN

### 3.3 Sinyal Seçimi
- Tüm geçerli sinyaller filtrelenir (score >= 0.80)
- DISABLED_STRATS kontrolü yapılır (VOL_BREAKDN reddedilir)
- TREND_LONG ve MA10_REJECT'e +0.05 score boost uygulanır
- En yüksek score'lu sinyal seçilir
- `tp_target` ve `sl_target` stratejiye göre set edilir (BB, Momentum)

---

## 4. CONDITION'LAR

### 4.1 Pozisyon Açma Condition'ları (`botRunner.ts:341-598`)

| Condition | Değer | Açıklama |
|-----------|-------|----------|
| **Signal Score** | >= 0.75 | Minimum sinyal kalitesi |
| **ATR%** | 0.15% - 4.00% | Volatilite aralığı (scalping için) |
| **Price Slippage** | < 0.5% | Signal fiyatı ile market fiyatı farkı |
| **RSI5m (LONG)** | < 80 | 5dk RSI aşırı alımda değil |
| **RSI5m (SHORT)** | > 20 | 5dk RSI aşırı satımda değil |
| **Active 5m Candle (LONG)** | Close > Open * 0.99 | Son 5dk mumu %1'den fazla düşmüyor |
| **Active 5m Candle (SHORT)** | Close < Open * 1.01 | Son 5dk mumu %1'den fazla yükselmiyor |
| **1h Trend Filter** | STRICT_TREND_STRATS only | EMA_CROSS_UP ve RSI_OVERBOUGHT için 1h trend yönü kontrolü |
| **Free Margin** | >= $250 | Yeterli serbest margin |
| **Max Open Positions** | 4 | Aynı anda max 4 pozisyon |
| **Max Trades per Symbol** | 3 | Session başına aynı sembole max 3 trade |
| **Cooldown per Pair** | 5 saniye | Aynı pair'i 5sn'den sık kontrol etme |
| **Margin Call Cooldown** | 5 dakika | Margin call sonrası 5dk yeni trade yok |

### 4.2 Pozisyon Kapatma Condition'ları (`botRunner.ts:243-300`)

| Condition | Tetiklenme | Açıklama |
|-----------|------------|----------|
| **TAKE_PROFIT** | `netPnlUsd >= targetProfit` | Hedef kâra ulaşınca |
| **HARD_STOP_LOSS** | `netPnlUsd <= -75` | Mutlak zarar limiti |
| **TIME_STOP_NO_BOUNCE** | `age >= 30dk && netPnl <= -20 && bestSeen < 3` | 30dk geçti, bounce olmadı, zarar > $20 |
| **TIME_STOP_HARD** | `age >= 60dk && netPnl < 0` | 60dk geçti, hâlâ zararda |
| **TIME_DECAY** | `age >= 10dk && netPnl >= targetProfit * 0.6` | 10dk geçti, %60 TP'ye ulaştı |
| **MARGIN_CALL** | `totalNetPnl < -40% freeBalance` | Toplam zarar serbest bakiyenin %40'ı |

### 4.3 Target Profit Hesaplama (`botRunner.ts:545-558`)

```
1. Strategy TP varsa (BB, Momentum):
   tpDistance = |tp_target - entryPrice|
   targetProfit = notionalValue * (tpDistance / entryPrice)

2. Yoksa ATR-based:
   atrTarget = (ATR% / 100) * notionalValue * 0.5
   targetProfit = max($3, min($10, atrTarget))

3. Fallback: $3
```

---

## 5. P&L STRATEGY

### 5.1 Komisyon Yapısı

| İşlem | Tip | Fee | Hesaplama |
|-------|-----|-----|-----------|
| **Açılış** | Limit Order (GTX) | 0.02% (maker) | $5,000 × 0.0002 = $1.00 |
| **Kapanış** | Market Order | 0.05% (taker) | $5,000 × 0.0005 = $2.50 |
| **Toplam** | | | **$3.50** |

### 5.2 P&L Hesaplama Formülü

```
direction = LONG ? 1 : -1
grossPnl = notionalValue * (closePrice - entryPrice) / entryPrice * direction
totalCommission = openCommission + closeCommission
netPnl = grossPnl - totalCommission
```

### 5.3 Risk Parametreleri (`botRunner.ts:5-23`)

| Parametre | Değer | Açıklama |
|-----------|-------|----------|
| `budget` | $2,000 | Başlangıç sermayesi |
| `lev` | 20x | Kaldıraç |
| `max_open` | 4 | Max açık pozisyon |
| `margin` | $250 | Pozisyon başı margin |
| `target_profit` | $3 | Varsayılan TP |
| `strong_target_profit` | $5 | Güçlü TP |
| `cut_loss` | -$75 | Hard stop-loss |
| `cooldown_min` | 5 | Kayıp sonrası cooldown (dk) |
| `min_atr_pct` | 0.15% | Min volatilite |
| `max_atr_pct` | 4.00% | Max volatilite |
| `time_stop_soft_min` | 30 | Soft time-stop süresi (dk) |
| `time_stop_hard_min` | 60 | Hard time-stop süresi (dk) |
| `time_stop_min_favorable` | 3 | Min görülen kâr ($) |
| `time_stop_loss_usd` | **-$20** | Time-stop zarar eşiği |
| `max_trades_per_sym` | 3 | Session başı max trade/sembol |

### 5.4 Drawdown Koruması

```
freeBalance = capital - reservedCapital
maxDrawdownUsd = freeBalance * 0.40

if (currentTotalNetPnl < 0 && abs(currentTotalNetPnl) >= maxDrawdownUsd) {
    // En çok zarar eden pozisyonu kapat
    // 5dk cooldown başlat
}
```

---

## 6. KOD DOSYA YAPISI

### 6.1 `server/botRunner.ts` (716 satır)

**Sorumluluk:** Ana bot mantığı, pozisyon yönetimi, risk kontrolleri

| Bölüm | Satır | Açıklama |
|-------|-------|----------|
| `USER_CONFIG` | 5-23 | Tüm konfigürasyon parametreleri |
| `MEAN_REVERSION_STRATS` | 25-34 | Mean-reversion strateji listesi |
| `DISABLED_STRATS` | 36-38 | Devre dışı stratejiler (VOL_BREAKDN) |
| `STRICT_TREND_STRATS` | 40-43 | Strict trend strateji listesi |
| `BotRunner` class | 46-715 | Ana class |
| `constructor()` | 71-74 | Loop başlatma |
| `start()` | 109-128 | Pair listesi yükleme, WS subscription |
| `stop()` | 130-136 | Scanning durdurma |
| `loop()` | 152-604 | Ana döngü (500ms) |
| `closePosition()` | 606-662 | Pozisyon kapatma |
| `getDashboardData()` | 664-713 | Dashboard API verisi |

**Önemli Fonksiyonlar:**
- `loop()`: Balance sync, pozisyon kontrolü, signal scanning
- `closePosition()`: API ile pozisyon kapatma, PNL hesaplama, cooldown
- `addLog()`: System log ekleme
- `logToFile()`: Dosya loglama + rotation

### 6.2 `server/strategy.ts` (294 satır)

**Sorumluluk:** Teknik indikatörler ve sinyal üretimi

| Fonksiyon | Satır | Açıklama |
|-----------|-------|----------|
| `calcRsi()` | 3-22 | RSI hesaplama (Wilder's smoothing) |
| `calcMa()` | 24-27 | Basit hareketli ortalama |
| `calcEma()` | 29-38 | Üstel hareketli ortalama |
| `calcAtr()` | 40-52 | Average True Range |
| `calcBollingerBands()` | 54-69 | Bollinger Bands |
| `calcVolumeRatio()` | 71-76 | Hacim oranı |
| `calcAvgMove()` | 78-81 | Ortalama fiyat hareketi |
| `calcSupertrend()` | 83-160 | Supertrend indikatörü |
| `getSignal()` | 172-294 | Ana sinyal üretme fonksiyonu |

**Signal Interface:**
```typescript
interface Signal {
    name: string;       // Strateji adı
    score: number;      // 0-1 arası güven skoru
    avg_move: number;   // Ortalama fiyat hareketi (ATR)
    side: 'LONG' | 'SHORT';
    tp_target?: number; // Take profit fiyat hedefi
    sl_target?: number; // Stop loss fiyat hedefi
}
```

### 6.3 `server/binanceClient.ts` (645 satır)

**Sorumluluk:** Binance API entegrasyonu, WebSocket, order execution

| Bölüm | Satır | Açıklama |
|-------|-------|----------|
| WebSocket Connection | 119-158 | Ticker stream bağlantısı |
| Kline WS | 49-117 | Kline stream subscription |
| `getTop300VolumePairs()` | 160-175 | Hacim sıralı pair listesi |
| `getAllPrices()` | 192-211 | Tüm pair fiyatları (WS cache) |
| `getKlines()` | 213-270 | Kline verisi (REST + WS cache) |
| `placeLimitOrder()` | 490-578 | Limit order (GTX, maker fee) |
| `placeMarketOrder()` | 413-488 | Market order (taker fee) |
| `closeMarketOrder()` | 581-644 | Pozisyon kapatma (reduceOnly) |
| `getFuturesBalance()` | 354-370 | Futures bakiye |
| `getActivePositions()` | 372-390 | Aktif pozisyonlar |
| `getMaxLeverage()` | 297-312 | Max kaldıraç bilgisi |
| `setupMarginAndLeverage()` | 314-347 | Margin type ve kaldıraç ayarı |

**Önemli Detaylar:**
- Simulation mode: API key yoksa simülasyon çalışır
- Rate limit protection: 429/418 hatalarında 1dk backoff
- Kline cache: REST + WebSocket hybrid
- Order execution: Lot size precision, tick size formatting

### 6.4 `server.ts` (93 satır)

**Sorumluluk:** Express API sunucusu

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/data` | GET | Dashboard verisi |
| `/api/bot/start` | POST | Bot başlatma |
| `/api/bot/stop` | POST | Bot durdurma |
| `/api/bot/close/:sym` | POST | Manuel pozisyon kapatma |
| `/api/bot/download-log` | GET | CSV log indirme |
| `/api/bot/download-system-logs` | GET | System log indirme |

### 6.5 Frontend (`src/`)

| Dosya | Açıklama |
|-------|----------|
| `src/App.tsx` | Ana React component |
| `src/components/` | Dashboard UI bileşenleri |
| `src/hooks/` | Custom hooks (API polling, vb.) |

---

## 7. GITHUB PUSH / AWS PULL PROCESS

### 7.1 Lokal Geliştirme

```bash
# 1. Değişiklikleri yap
# server/botRunner.ts, server/strategy.ts, vb.

# 2. Değişiklikleri kontrol et
git diff

# 3. Stage ve commit
git add server/botRunner.ts
git commit -m "description of changes"

# 4. GitHub'a push
git push
```

### 7.2 AWS Deployment

```bash
# 1. SSH ile AWS'ye bağlan
ssh -i "path/to/v9-key.pem" ubuntu@18.181.221.88

# 2. Bot'u durdur
cd ~/v9-trade-bot
pm2 stop v9-bot

# 3. Kodu güncelle
git pull

# 4. Build et
npm run build
# Çıktı: dist/server.js (53kb)

# 5. Bot'u başlat
pm2 start v9-bot --update-env

# 6. Log kontrol
pm2 logs v9-bot --lines 20
# veya
tail -20 ~/.pm2/logs/v9-bot-out.log

# 7. Config doğrula
grep 'Config' ~/.pm2/logs/v9-bot-out.log | tail -1
```

### 7.3 Deployment Checklist

- [ ] `git push` başarılı
- [ ] `pm2 stop v9-bot` → status: stopped
- [ ] `git pull` → Fast-forward
- [ ] `npm run build` → dist/server.js oluştu
- [ ] `pm2 start v9-bot --update-env` → status: online
- [ ] Config log'da doğru görünüyor
- [ ] Dashboard API çalışıyor (`curl http://localhost:3000/api/data`)
- [ ] WebSocket bağlantıları kuruldu
- [ ] İlk pozisyon açıldı/kapanan log'da görünüyor

### 7.4 Sorun Giderme

| Sorun | Çözüm |
|-------|-------|
| Bot başlamıyor | `pm2 logs v9-bot` ile hata kontrol et |
| Config eski | `pm2 restart v9-bot --update-env` |
| Build hatası | `npm run build` çıktısını kontrol et |
| WebSocket bağlantı yok | `.env` dosyasını kontrol et |
| API rate limit | 1dk bekle, bot otomatik backoff yapar |
| Pozisyon açılmıyor | `bot_scan.log` REJECT reason'larını kontrol et |

---

## 8. SESSION LOG FORMAT

### 8.1 bot_scan.log

```
[2026-05-20T12:00:00.000Z] [SYMBOLUSDT] OPENED: side=LONG price=1.2345 strat=TREND_LONG
[2026-05-20T12:00:00.000Z] [SYMBOLUSDT] TP: ATR-based $10.00 (ATR%: 1.96%)
[2026-05-20T12:30:00.000Z] [SYMBOLUSDT] CLOSED: side=LONG entry=1.2345 close=1.2400 pnl=+15.50 reason=TAKE_PROFIT
```

### 8.2 Log Rotation

- Max 50,000 satır
- Aşıldığında `bot_scan.log.{timestamp}.bak` olarak yedeklenir
- Yeni `bot_scan.log` oluşturulur

---

## 9. GÜVENLİK

### 9.1 API Key Yönetimi

- `.env` dosyasında saklanır
- `SANDBOX_API_KEY` / `LIVE_API_KEY` desteği
- Simulation mode: API key yoksa çalışır
- Git'e `.env` commit edilmez (`.gitignore`)

### 9.2 Erişim

- AWS SSH: PEM key ile
- Dashboard: Port 3000 (public IP)
- Firewall: Security group ile kısıtlı

---

## 10. PERFORMANS METRİKLERİ

### 10.1 Session Bazlı (Örnek)

| Metrik | Değer |
|--------|-------|
| Toplam Trade | 87 |
| Kazanç | 59 |
| Kayıp | 28 |
| Win Rate | %67.8 |
| Toplam PNL | -$6.03 |
| Avg Win | +$12 |
| Avg Loss | -$45 |
| Best Trade | +$120.79 (KITEUSDT) |
| Worst Trade | -$103.19 (GUAUSDT) |

### 10.2 Strateji Performansı (Örnek)

| Strateji | Trade | Win Rate | Avg PNL |
|----------|-------|----------|---------|
| TREND_LONG | 10 | %90 | +$15 |
| MA10_REJECT | 8 | %87 | +$13 |
| RSI_OVERSOLD | 12 | %75 | +$11 |
| BB_REVERSION | 8 | %75 | +$10 |
| MA10_BOUNCE | 4 | %25 | -$25 |
| VOL_BREAKDN | 6 | %17 | -$40 |

---

## 11. DEĞİŞİKLİK GEÇMİŞİ

### v9.1 (2026-05-20)
- `time_stop_loss_usd`: -$30 → **-$20** (daha sıkı time-stop)
- `VOL_BREAKDN` stratejisi **devre dışı** bırakıldı (sürekli zarar eden)
- `TREND_LONG` ve `MA10_REJECT` stratejilerine **+0.05 score boost** eklendi
- `MA10_BOUNCE` stratejisi aktif bırakıldı

### v9.0 (2026-05-19)
- `cut_loss`: -$200 → **-$75**
- `time_stop_loss_usd`: -$50 → **-$30**
- `time_stop_min_favorable`: 1 → **3**
- 1h trend filter sadece STRICT_TREND_STRATS için aktif
- TIME_DECAY TP eklendi (10dk, %60 target)
- Dynamic TP (strategy tp_target veya ATR-based)

---

**Doküman Versiyon:** 1.1  
**Son Güncelleme:** 2026-05-20 15:09  
**Hazırlayan:** AI Assistant  
**Onay:** Tamamlandı
