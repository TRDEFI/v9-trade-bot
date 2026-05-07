import { BinanceClient } from './binanceClient.js';
import { getSignal, getReversalSignal } from './strategy.js';
import { 
  INITIAL_CAPITAL, 
  MAX_USED_CAPITAL_PCT, 
  calculateRiskMultiplier, 
  checkDrawdownProtection, 
  calculatePositionSize 
} from './size.js';

export const PAIRS = [
  'RAVEUSDT','AIOTUSDT','SKYAIUSDT','BLESSUSDT','ZEREBROUSDT',
  'TACUSDT','AGTUSDT','UBUSDT','ORDIUSDT','BASEDUSDT',
  'MOVRUSDT','BASUSDT','SWARMSUSDT','SIRENUSDT','BSBUSDT',
  'MAGMAUSDT','CYSUSDT','ENJINUSDT','COMPOUNDUSDT','LABUSDT',
  // Top hacimli coinler
  'BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','XRPUSDT',
  'DOGEUSDT','ADAUSDT','AVAXUSDT','LINKUSDT','MATICUSDT',
  'DOTUSDT','LTCUSDT','SHIBUSDT','TRXUSDT','UNIUSDT',
  'ATOMUSDT','ICPUSDT','FILUSDT','APTUSDT','ARBUSDT',
  'OPUSDT','RNDRUSDT','INJUSDT','SUIUSDT','SEIUSDT'
];

export class BotRunner {
  isRunning = false;
  binance = new BinanceClient();
  
  sessionStart = Date.now();
  sessionNum = 1;
  capital = INITIAL_CAPITAL;
  reservedCapital = 0;
  totalRealizedPnl = 0;
  allTimeHigh = INITIAL_CAPITAL;
  
  openPositions: Record<string, any> = {};
  closedPositions: any[] = [];
  lastAiAnalyzedCount: number = 0;
  reversalCooldown: Record<string, number> = {};
  stratWeights = { 'MEAN_REV': 1, 'VOL': 1 };
  
  loopInterval: NodeJS.Timeout | null = null;
  aiInterval: NodeJS.Timeout | null = null;
  startTimeStr: number = Date.now();
  aiUsedTokens: number = 0;

  downloadableLog: string | null = null;
  aiLogs: Array<{time: number, msg: string, data?: any}> = [];
  aiLearningMemory: any[] = [];
  dynamicConfig: {
    recommended_leverage: number | null,
    recommended_strategy: string | null,
    take_profit_pct: number,
    stop_loss_pct: number
  } = {
    recommended_leverage: null,
    recommended_strategy: null,
    take_profit_pct: 0.5,
    stop_loss_pct: 5.0
  };

  aiConfig: { baseUrl: string, apiKey: string } = { 
    baseUrl: process.env.MINIMAX_BASE_URL || '', 
    apiKey: process.env.MINIMAX_API_KEY || '' 
  };
  
  setAiConfig(baseUrl: string, apiKey: string) {
    this.aiConfig = { baseUrl, apiKey };
    console.log(`[AI MANAGER] Configured with Minimax URL: ${baseUrl}`);
  }

  sessionDurationSec = 0;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.sessionStart = Date.now();
    if (!this.startTimeStr) this.startTimeStr = Date.now();
    this.loop();
    this.startAiLoop();
  }

  stop() {
    if (this.isRunning) {
      this.sessionDurationSec += Math.floor((Date.now() - this.sessionStart) / 1000);
    }
    this.isRunning = false;
    if (this.loopInterval) {
      clearTimeout(this.loopInterval);
      this.loopInterval = null;
    }
    if (this.aiInterval) {
      clearTimeout(this.aiInterval);
      this.aiInterval = null;
    }
    this.generateLog();
  }

  addAiLog(msg: string, data?: any) {
    console.log(`[AI LOG] ${msg}`, data ? JSON.stringify(data) : '');
    this.aiLogs.unshift({ time: Date.now(), msg, data });
    if (this.aiLogs.length > 20) this.aiLogs.pop();
  }

  startAiLoop() {
    if (!this.isRunning) return;
    
    // First, clear any existing interval to prevent overlap
    if (this.aiInterval) {
      clearTimeout(this.aiInterval);
    }

    if (this.aiConfig.baseUrl && this.aiConfig.apiKey) {
      this.aiTick().catch(e => console.error('[AI ERR]', e));
    } else {
      console.log(`[AI MANAGER] Skipped. Config baseUrl: ${this.aiConfig.baseUrl ? 'OK' : 'MISSING'}, apiKey: ${this.aiConfig.apiKey ? 'OK' : 'MISSING'}`);
    }

    // Polling every 30 seconds for AI to reduce token consumption and act as an asynchronous overseer.
    if (this.isRunning) {
      this.aiInterval = setTimeout(() => this.startAiLoop(), 30000);
    }
  }

  async aiTick() {
    console.log(`[AI MANAGER] Running tick... Config URL: ${this.aiConfig.baseUrl ? "OK" : "MISSING"}, Key: ${this.aiConfig.apiKey ? "OK" : "MISSING"}`);

    if (!this.aiConfig.baseUrl || !this.aiConfig.apiKey) {
      console.log("[AI MANAGER] Skipped due to missing config.");
      return;
    }

    const runTime = Date.now() - this.sessionStart;
    if (runTime < 60000) {
      console.log("[AI MANAGER] Skipping until 1 minute passed to gather real data.");
      return;
    }

    if (this.closedPositions.length === 0) {
      console.log("[AI MANAGER] No closed positions to analyze yet.");
      return;
    }
    
    if (this.closedPositions.length <= this.lastAiAnalyzedCount) {
       console.log("[AI MANAGER] No new closed positions since last analysis.");
       return;
    }

    const newClosed = this.closedPositions.slice(this.lastAiAnalyzedCount);
    this.lastAiAnalyzedCount = this.closedPositions.length;

    this.addAiLog(`İşlem Sonrası (Post-Trade) Analiz başlıyor... (Son ${newClosed.length} kapanan işlem)`);

    const isAnthropic = this.aiConfig.baseUrl.toLowerCase().includes('anthropic');
    const systemPrompt = `Sen bir Kantitatif Stratejist ve Meta-Öğrenme modelisin. 
Sana yeni kapanan pozisyonların (trade history) detayları gönderilecek.

BOT ANAYASASI (BUNU KESİNLİKLE İHLAL ETME):
1. Bot özel bir Ultra-Kısa Scalping stratejisi kullanmaktadır. Kar hedefi çok küçüktür (Örn: +$1 USD net kar gördüğünde PROFIT_CUT_1USD ile pozisyonu hemen kapatır veya dinamik TP ile kar alır). Ancak pozisyon hacmi +$3 hedefine göre hesaplanıp kaldıraç yükseltilerek açılır. Zararı da çok kısa sürede kesmek üzere (-$3 LOSS_CUT) tasarlanmıştır.
2. Ayrıca, trendin tersine döndüğünü düşündüğünde 'REVERSAL' ile pozisyonu kapatır. Bu yüzden işlemlerin çok küçük kâr/zararlar (0.1$, -0.5$ vb) ile veya erken bir şekilde 'REVERSAL' / 'PROFIT_CUT_1USD' olarak kapanması BİR STRATEJİ HATASI DEĞİLDİR, tam tersine stratejinin çekirdek mekaniğidir.
3. BU TÜR ERKEN KAPANMALARI (Reversal veya 1 USD Cut) gerekçe göstererek BOTU DURDURMA (PAUSE_BOT GÖNDERME).
4. Sadece makro olarak piyasa çok terse gidiyorsa ve sürekli SL patlıyorsa TP ve SL yüzdelerini optimize edebilirsin (TP: 0.5 ile 2.0 arası, SL: 2.0 ile 5.0 arası). Sabit usd sınırlarına sen dokunmazsın.
5. Piyasada botu tamamen patlatacak bir anormallik veya API hatası yoksa 'action' DAİMA 'KEEP_RUNNING' olmalıdır. 'PAUSE_BOT' kullanımı yasaklanmıştır (acil durum haricinde).

Görevlerin: 
1. Bu işlemlerin başarımını değerlendirmek (Yenilenmiş Anayasa'ya uygun olacak şekilde).
2. Sadece momentum veya yatay piyasaya göre TP/SL/Kaldıraç iyileştirmesi (önerisi) sunmak.

Çıktı Formatı Kesinlikle JSON Olmalı:
{
  "analysis_of_past_trades": "Kapanan işlemler üzerine detaylı Türkçe analiz. Anayasaya dikkat ederek değerlendir ve nedenlerini mantıklı bir şekilde açıkla.",
  "strategy_flaw_detected": true/false, // Sadece cüzdanı gerçekten tehlikeye atacak bir açık varsa true. (Erken reversal veya 3 USD kar kesici bir hata değildir)
  "new_recommended_logic": {
     "recommended_leverage": 2, // Sadece sayı (örn 2 veya 3)
     "recommended_strategy": "MEAN_REV" | "MOMENTUM",
     "take_profit_pct": 0.5,
     "stop_loss_pct": 5.0
  },
  "action": "KEEP_RUNNING" | "PAUSE_BOT" 
}`;

    const totalRealized = this.totalRealizedPnl;
    
    const userPrompt = JSON.stringify({
      portfolio: {
        capital_usd: this.capital,
        total_realized_pnl: totalRealized
      },
      current_bot_config: this.dynamicConfig,
      past_ai_adjustments_memory: this.aiLearningMemory.slice(-3), // Only keep last 3 memories so we don't blow up context
      recently_closed_positions: newClosed.map(p => ({
        sym: p.sym,
        side: p.side,
        entry_price: p.entry,
        close_price: p.closePrice,
        pnl_usd: p.pnl,
        pnl_pct: p.pnlPct,
        duration_ms: p.closeTime - p.openTime,
        reason: p.reason,
        strategy: p.strategy
      }))
    });

    let payload: any = {};
    let url = this.aiConfig.baseUrl;

    if (isAnthropic) {
      if (!url.endsWith('/v1/messages') && !url.endsWith('/messages')) {
        url = url.endsWith('/') ? `${url}v1/messages` : `${url}/v1/messages`;
      }
      payload = {
        model: "MiniMax-M2.7",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
        // Note: Anthropic format doesn't use response_format: { type: "json_object" } directly this way for minimax yet,
        // so we just rely on the strong prompt instructions.
      };
    } else {
      payload = {
        model: "MiniMax-M2.7",
        max_tokens: 4096,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      };
      if (!url.endsWith('/chat/completions') && !url.includes('/text/chatcompletion')) {
        url = url.endsWith('/') ? `${url}chat/completions` : `${url}/chat/completions`;
      }
    }

    try {
      let res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.aiConfig.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      // Fallback if user configured a wrong URL that gets 404 (only try fallback for generic minimax)
      if (res.status === 404 && !isAnthropic) {
        console.log(`[AI MANAGER TICK FAILED HTTP 404] on ${url}. Attempting fallback to standard Minimax URL...`);
        url = 'https://api.minimax.chat/v1/chat/completions';
        res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.aiConfig.apiKey}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const out = await res.json();
        
        // Minimax can return HTTP 200 but include a base_resp field with errors
        if (out.base_resp && out.base_resp.status_code !== 0 && out.base_resp.status_code !== 1000) {
          const errMsg = out.base_resp.status_msg || 'Bilinmeyen Hata';
          this.addAiLog(`[API HATASI] ${errMsg} (Kod: ${out.base_resp.status_code})`);
          console.error(`[AI MANAGER API ERROR]`, out.base_resp);
          return;
        }

        // Track API consumption
        if (out.usage) {
          const tokens = out.usage.total_tokens || ((out.usage.input_tokens || 0) + (out.usage.output_tokens || 0));
          this.aiUsedTokens += tokens;
        }

        // Extract content based on different possible API response structures
        let content = '';
        if (out.content && Array.isArray(out.content)) {
          const textBlock = out.content.find((c: any) => c.type === 'text');
          if (textBlock && textBlock.text) {
            content = textBlock.text;
          } else if (out.content[0] && out.content[0].text) {
            content = out.content[0].text;
          }
        } else if (out.choices && out.choices[0]) {
          content = out.choices[0].message?.content || out.choices[0].messages?.[0]?.text;
        } else if (out.reply) {
          content = out.reply;
        }

        if (content) {
          try {
            // Remove markdown formatting if present
            const sanitizedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const decision = JSON.parse(sanitizedContent);
            
            const logMsg = decision.strategy_flaw_detected 
               ? `[DİKKAT] Strateji Mantık Hatası Tespit Edildi! (Önerilen: ${decision.new_recommended_logic?.recommended_strategy || '?'})`
               : `[BAŞARILI] Mevcut strateji stabil. Yeniden optimizasyona gerek yok.`;
            
            if (decision.strategy_flaw_detected && decision.new_recommended_logic) {
               // Update AI dynamic logic
               this.dynamicConfig = {
                  ...this.dynamicConfig,
                  ...decision.new_recommended_logic
               };
               
               if (decision.new_recommended_logic.recommended_strategy) {
                  for (const key in this.stratWeights) this.stratWeights[key] = 0;
                  this.stratWeights[decision.new_recommended_logic.recommended_strategy] = 1;
               }
               
               // Add to AI's permanent memory (recent 3 blocks) to create a self-evolving loop
               this.aiLearningMemory.push({
                   timestamp: Date.now(),
                   rationale: decision.analysis_of_past_trades,
                   applied_config: decision.new_recommended_logic
               });
            }

            this.addAiLog(logMsg, decision);
            
            if (decision.action === 'PAUSE_BOT') {
               this.addAiLog(`[!!!] AI EMRİ: Yapısal hata nedeniyle Bot Durduruluyor... Güncel parametrelerle yeniden başlatılabilir.`);
               this.stop();
            }
          } catch(e) {
             this.addAiLog("[AI MANAGER Parse Error] Response is not valid JSON", { received_content: content });
             console.error("[AI MANAGER Parse Error] content:", content);
          }
        } else {
             // We didn't find any content, log the payload so we know what happened
             this.addAiLog(`[Format Error] Yanıt parse edilemedi. (Model yapısı uyumsuz olabilir)`, out);
             console.error(`[AI MANAGER Format Error] output:`, out);
        }
      } else {
        const errText = await res.text();
        this.addAiLog(`[HTTP ERROR ${res.status}] ${errText}`);
        console.error(`[AI MANAGER TICK FAILED HTTP ${res.status}] ${errText}`);
        
        // Disable AI polling if the API key is unauthorized to avoid spam
        if (res.status === 401) {
          console.error("[AI MANAGER TICK] 401 Unauthorized. Invalid API key or endpoint. Disabling AI features.");
          this.aiConfig.apiKey = ""; // Clear config memory so it doesn't try again
        }
      }
    } catch (e: any) {
      this.addAiLog(`[FATAL ERROR] API connection failed: ${e.message}`);
      console.error("[AI MANAGER TICK FAILED THREAD EXCEPTION]", e);
    }
  }

  
  generateLog() {
    if (this.closedPositions.length === 0) return;
    
    const headers = ['Kapanis Zamani', 'Aclis Zamani', 'Sembol', 'Yon', 'Giris_Price', 'Cikis_Price', 'Lev', 'Margin', 'P&L_USD', 'Neden', 'Strateji'];
    const rows = this.closedPositions.map(p => {
       return [
         new Date(p.closed).toISOString(),
         new Date(p.opened).toISOString(),
         p.sym,
         p.side,
         p.entry,
         p.closed_price,
         p.lev,
         p.size,
         p.pnl.toFixed(4),
         p.reason,
         p.strat
       ].join(',');
    });
    this.downloadableLog = [headers.join(','), ...rows].join('\n');
  }

  async loop() {
    if (!this.isRunning) return;
    try {
      await this.tick();
    } catch (e) {
      console.error('Error in bot tick', e);
    }
    
    if (this.isRunning) {
      this.loopInterval = setTimeout(() => this.loop(), 1500); // 1.5s interval
    }
  }

  async closePosition(sym: string, customReason: string = 'MANUAL', currentPricesOpt?: Record<string, number>) {
    const pos = this.openPositions[sym];
    if (!pos) return;
    
    const currentPrices = currentPricesOpt || await this.binance.getAllPrices();
    const p = currentPrices[sym] || pos.currentPrice;
    const now = Date.now();
    
    const notional = pos.size * pos.lev;
    const priceChange = pos.side === 'LONG' ? (p - pos.entry) : (pos.entry - p);
    let pnl = notional * (priceChange / pos.entry);
    const commission = notional * 0.0004 * 2;
    pnl -= commission;
    
    this.totalRealizedPnl += pnl;
    this.capital = INITIAL_CAPITAL + this.totalRealizedPnl;
    this.reservedCapital -= pos.size;
    
    this.closedPositions.push({
      sym,
      side: pos.side,
      entry: pos.entry,
      closed_price: p,
      tp: pos.tp,
      sl: pos.sl,
      lev: pos.lev,
      size: pos.size,
      pnl,
      strat: pos.strat,
      reason: customReason,
      opened: pos.opened_at,
      closed: now
    });
    
    delete this.openPositions[sym];
    console.log(`CLOSED ${customReason} ${sym} PNL=${pnl.toFixed(2)}`);
  }

  async tick() {
    const now = Date.now();
    
    // Toplu fiyat çekimi ile gecikmeyi önlüyoruz
    const currentPrices = await this.binance.getAllPrices();
    
    // Açık pozisyonları değerlendir ve pnl güncelle
    let currentTotalNetPnl = 0;
    let currentTotalUsedMargin = 0;

    for (const sym of Object.keys(this.openPositions)) {
      const pos = this.openPositions[sym];
      const p = currentPrices[sym];
      if (!p) continue;
      
      const { entry, tp, sl, side } = pos;
      
      // Track unrealized for dashboard
      pos.currentPrice = p;
      const notional = pos.size * pos.lev;
      const priceChangeRaw = side === 'LONG' ? (p - entry) : (entry - p);
      const grossPnlUsd = notional * (priceChangeRaw / entry);
      const commissionUsd = notional * 0.0004 * 2;
      pos.netPnlUsd = grossPnlUsd - commissionUsd;
      pos.pnlPct = (pos.netPnlUsd / pos.size) * 100; // Net % on equity
      
      currentTotalNetPnl += pos.netPnlUsd;
      currentTotalUsedMargin += pos.size;
    }

    // Normal Stop/TP/Reversal kontrolleri ve Sabit P&L (+$3 / -$3) Kesici
    for (const sym of Object.keys(this.openPositions)) {
      const pos = this.openPositions[sym];
      const p = currentPrices[sym];
      if (!p) continue;

      const { entry, tp, sl, side, netPnlUsd } = pos;
      
      let reason = null;
      
      if (netPnlUsd !== undefined) {
        if (netPnlUsd >= 1) reason = 'PROFIT_CUT_1USD';
        else if (netPnlUsd <= -3) reason = 'LOSS_CUT_3USD';
      }
      
      const tp_pct = this.dynamicConfig?.take_profit_pct || 0.5; // Kisa TP
      const sl_pct = this.dynamicConfig?.stop_loss_pct || 5.0;   // Ileri SL

      if (!reason) {
        if (side === 'LONG') {
          if (p >= entry * (1 + tp_pct / 100)) reason = `AI_TP_${tp_pct}%`;
          else if (p <= entry * (1 - sl_pct / 100)) reason = `AI_SL_${sl_pct}%`;
          else if (p >= tp) reason = 'TP';
          else if (p <= sl) reason = 'SL';
        } else {
          if (p <= entry * (1 - tp_pct / 100)) reason = `AI_TP_${tp_pct}%`;
          else if (p >= entry * (1 + sl_pct / 100)) reason = `AI_SL_${sl_pct}%`;
          else if (p <= tp) reason = 'TP';
          else if (p >= sl) reason = 'SL';
        }
      }

      if (!reason) {
        // RSI Kapatma koşulu kontrolü (Sadece anlık stop/tp vurmadıysa klines sor)
        const c = await this.binance.getKlines(sym, '5m', 24);
        if (c.length > 5) {
          const rev = getReversalSignal(c, side);
          if (rev) {
            reason = 'REVERSAL';
            this.reversalCooldown[sym] = now + 30000; // 30s
          }
        }
      }

      if (reason) {
        await this.closePosition(sym, reason, currentPrices);
      }
    }

    // Yeni pozisyon açmayı dene (Parçalı paralel sorgular)
    await Promise.all(PAIRS.map(async (sym) => {
      if (this.openPositions[sym]) return;
      if (this.reversalCooldown[sym] && now < this.reversalCooldown[sym]) return;

      const p = currentPrices[sym];
      if (!p) return;
      
      const c = await this.binance.getKlines(sym, '5m', 24);
      const sig = getSignal(c, sym, this.stratWeights);
      if (!sig) return;

      const riskMult = calculateRiskMultiplier(this.capital, this.closedPositions.slice(-10));
      const ddData = checkDrawdownProtection(this.capital, this.allTimeHigh);
      this.allTimeHigh = ddData.newAth;
      
      if (ddData.inDD) return;

      const ai_tp_pct = this.dynamicConfig?.take_profit_pct || 0.5;
      const ai_sl_pct = this.dynamicConfig?.stop_loss_pct || 5.0;

      const tpPrice = sig.side === 'LONG' ? p * (1 + ai_tp_pct/100) : p * (1 - ai_tp_pct/100);
      const slPrice = sig.side === 'LONG' ? p * (1 - ai_sl_pct/100) : p * (1 + ai_sl_pct/100);
      
      let { size, lev } = calculatePositionSize(this.capital, p, slPrice, riskMult, tpPrice);
      if (this.dynamicConfig?.recommended_leverage) lev = Number(this.dynamicConfig.recommended_leverage);

      if (size < 5) return;

      let totalUsed = 0;
      for (const k in this.openPositions) totalUsed += this.openPositions[k].size;
      
      if (totalUsed + size > INITIAL_CAPITAL * MAX_USED_CAPITAL_PCT) return;
      if (size > (this.capital - this.reservedCapital)) return;

      this.reservedCapital += size;
      this.openPositions[sym] = {
        sym,
        entry: p,
        currentPrice: p,
        tp: tpPrice,
        sl: slPrice,
        side: sig.side,
        size,
        lev,
        opened_at: Date.now(),
        strat: sig.name,
        conf: sig.conf,
        risk_mult: riskMult,
        pnlPct: 0
      };
      
      console.log(`OPENED ${sig.side} ${sym} @ ${p} SZ=${size.toFixed(2)}`);
    }));
  }

  getDashboardData() {
    let usedCap = 0;
    let unrPnl = 0;
    const opens = Object.values(this.openPositions).map(p => {
      usedCap += p.size;
      const netUsd = typeof p.netPnlUsd !== 'undefined' ? p.netPnlUsd : 0;
      unrPnl += netUsd;
      return {
        sym: p.sym,
        side: p.side,
        entry: p.entry,
        current_price: p.currentPrice,
        tp: p.tp,
        sl: p.sl,
        lev: p.lev,
        size: p.size,
        pnl_pct: p.pnlPct || 0,
        pnl_usd: netUsd,
        opened: p.opened_at
      };
    });

    let elapsedTotalSec = this.sessionDurationSec;
    if (this.isRunning) {
      elapsedTotalSec += Math.floor((Date.now() - this.sessionStart)/1000);
    }
    const m = Math.floor(elapsedTotalSec / 60);
    const s = elapsedTotalSec % 60;

    return {
      session_start: this.startTimeStr,
      session_num: this.sessionNum,
      is_active: this.isRunning,
      ai_active: !!(this.aiConfig.baseUrl && this.aiConfig.apiKey),
      ai_used_tokens: this.aiUsedTokens,
      capital: this.capital,
      total_trades: this.closedPositions.length,
      total_pnl: this.totalRealizedPnl,
      opens,
      closed: [...this.closedPositions].reverse().slice(0, 50), // Send last 50
      server_time: Date.now(),
      elapsed: `${m}m ${s}s`,
      used_capital: usedCap,
      unrealized_pnl: unrPnl,
      ai_logs: this.aiLogs,
      has_downloadable_log: !!this.downloadableLog
    };
  }
}
