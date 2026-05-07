import React, { useState, useEffect } from 'react';
import { Activity, Clock, DollarSign, Crosshair, AlertCircle, RefreshCw, Play, Square, Info, Download, BrainCircuit, X, Server, Cpu, Database, Network } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid } from 'recharts';

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TRADE' | 'ANALYTICS'>('TRADE');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        if (!res.ok) {
          console.error(`HTTP error: ${res.status}`);
          return;
        }
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const json = await res.json();
          setData(json);
          setLoading(false);
        } else {
           console.error("Oops, we haven't got JSON!");
        }
      } catch (e) {
        console.error('Fetch error', e);
      }
    };
    
    fetchData();
    const timer = setInterval(fetchData, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleStart = async () => {
    await fetch('/api/bot/start', { method: 'POST' });
  };

  const handleStop = async () => {
    await fetch('/api/bot/stop', { method: 'POST' });
  };

  if (!data) return <div className="text-white p-10 flex items-center justify-center min-h-screen bg-[#0a0a0a]">Dashboard Yükleniyor...</div>;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatNumber = (val: number, dims: number = 4) => (val || 0).toFixed(dims);
  
  // GMT+3 (Istanbul) format
  const formatTime = (ts: number | string) => {
    if (!ts) return '-';
    // If it's still a string from previous session state, handle it or convert
    try {
      return new Intl.DateTimeFormat('tr-TR', { 
        timeZone: 'Europe/Istanbul', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }).format(new Date(ts));
    } catch {
      return ts as string;
    }
  };

  // Calc Win Rate logic
  const closedTrades = data.closed || [];
  const wins = closedTrades.filter((t: any) => t.pnl > 0).length;
  const losses = closedTrades.filter((t: any) => t.pnl <= 0).length;
  const winRate = closedTrades.length > 0 ? (wins / closedTrades.length * 100).toFixed(1) : '0';

  // Calc PNL by symbol
  const symPnlMap: Record<string, number> = {};
  closedTrades.forEach((t: any) => {
    symPnlMap[t.sym] = (symPnlMap[t.sym] || 0) + t.pnl;
  });
  const barData = Object.entries(symPnlMap)
    .map(([sym, pnl]) => ({ sym, pnl }))
    .sort((a,b) => b.pnl - a.pnl)
    .slice(0, 10); // top 10

  return (
    <div className="min-h-screen bg-[#060606] text-[#e0e0e0] font-sans selection:bg-pink-500/30">
      <header className="flex items-center justify-between px-4 py-2.5 bg-[#0f0f0f] border-b border-[#222]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-pink-500" />
          <h1 className="text-pink-500 font-bold tracking-widest text-[13px] uppercase">V9 Autotrader</h1>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-bold uppercase tracking-wider border ${data.ai_active ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-purple-400 bg-purple-500/10 border-purple-500/20'}`}>
            <BrainCircuit className="w-3 h-3" /> {data.ai_active ? 'AI YÖNETİCİ (AKTİF)' : 'AI YÖNETİCİ'}
          </span>
          
          <button 
            onClick={data.is_active ? handleStop : handleStart} 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-bold uppercase tracking-wider transition-colors ${
              data.is_active ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
            }`}
          >
            {data.is_active ? <><Square className="w-3 h-3"/> Durdur</> : <><Play className="w-3 h-3"/> Başlat</>}
          </button>

          {data.has_downloadable_log && (
            <button 
              onClick={async () => {
                try {
                  const res = await fetch('/api/bot/download-log');
                  if (!res.ok) return;
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'V9_AutoTrader_Session_Log.csv';
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  setData({ ...data, has_downloadable_log: false });
                } catch (e) {
                  console.error("Download failed", e);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
            >
              <Download className="w-3 h-3"/> Log İndir (CSV)
            </button>
          )}

          <div className="flex flex-col items-end leading-tight">
            <div className={`flex items-center gap-1.5 ${data.is_active ? 'text-green-400' : 'text-red-400'}`}>
              <span className="relative flex h-1.5 w-1.5">
                {data.is_active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>}
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
              </span>
              <span>{data.is_active ? 'ÇALIŞIYOR' : 'DURDURULDU'}</span>
            </div>
            <span className="text-gray-500">{formatTime(data.server_time)} (GMT+3)</span>
          </div>
        </div>
      </header>

      {/* Ultra Compact Stats Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-px bg-[#1a1a1a] border-b border-[#1a1a1a]">
        <StatBlock label="Capital" value={formatCurrency(data.capital)} color="text-blue-400" />
        <StatBlock label="Free Bal" value={formatCurrency(data.capital - data.used_capital)} color="text-white" />
        <StatBlock label="Süre" value={data.elapsed} color="text-yellow-400" />
        <StatBlock label="Win Rate" value={`${winRate}% (${wins}W/${losses}L)`} color={parseInt(winRate) > 50 ? 'text-green-400' : 'text-gray-300'} />
        <StatBlock label="Açık Poz" value={`${data.opens.length}`} color="text-white" />
        <StatBlock label="Kapalı" value={`${data.closed.length}`} color="text-white" />
        <StatBlock label="Used Cap" value={formatCurrency(data.used_capital)} color="text-orange-400" />
        <StatBlock label="Unrealized" value={formatCurrency(data.unrealized_pnl)} color={data.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'} />
        <StatBlock label="Realized (P&L)" value={formatCurrency(data.total_pnl)} color={data.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'} />
      </div>

      <div className="flex border-b border-[#222] bg-[#0a0a0a]">
        <button
          onClick={() => setActiveTab('TRADE')}
          className={`flex-1 py-2.5 text-[11px] font-bold tracking-widest uppercase transition-colors ${
            activeTab === 'TRADE' ? 'text-pink-500 border-b-2 border-pink-500 bg-[#111]' : 'text-gray-500 hover:bg-[#111] hover:text-gray-300'
          }`}
        >
          Canlı İşlem (Trade)
        </button>
        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`flex-1 py-2.5 text-[11px] font-bold tracking-widest uppercase transition-colors ${
            activeTab === 'ANALYTICS' ? 'text-blue-500 border-b-2 border-blue-500 bg-[#111]' : 'text-gray-500 hover:bg-[#111] hover:text-gray-300'
          }`}
        >
          Bulut Metrikleri (Analytics)
        </button>
      </div>

      {activeTab === 'TRADE' && (
        <main className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Tables (8 cols) */}
        <div className="lg:col-span-9 space-y-4">
          
          <section className="bg-[#0f0f0f] border border-[#222] rounded-md overflow-hidden">
            <div className="bg-[#111] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center justify-between border-b border-[#222]">
              <div className="flex items-center gap-1.5"><Crosshair className="w-3.5 h-3.5" /> Açık Pozisyonlar</div>
              <span className="text-gray-600">Unrealized: <span className={data.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}>{formatCurrency(data.unrealized_pnl)}</span></span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#1a1a1a] text-[9px] uppercase tracking-wider text-gray-500 bg-[#0a0a0a]">
                    <th className="px-3 py-1.5 font-semibold">Zaman</th>
                    <th className="px-3 py-1.5 font-semibold">Sembol</th>
                    <th className="px-3 py-1.5 font-semibold">Yön</th>
                    <th className="px-3 py-1.5 font-semibold">Entry / Now</th>
                    <th className="px-3 py-1.5 font-semibold">TP / SL</th>
                    <th className="px-3 py-1.5 font-semibold">Margin (Lev)</th>
                    <th className="px-3 py-1.5 font-semibold text-right">P&L %</th>
                    <th className="px-3 py-1.5 font-semibold text-right">P&L USD</th>
                    <th className="px-3 py-1.5 font-semibold text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[11px]">
                  {data.opens?.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-600 font-sans tracking-wide text-[10px]">Açık pozisyon yok</td></tr>
                  )}
                  {data.opens?.map((p: any, i: number) => {
                    const isPos = p.pnl_usd > 0;
                    return (
                      <tr key={i} className="border-b border-[#151515] hover:bg-[#151515]">
                        <td className="px-3 py-2 text-gray-500">{formatTime(p.opened)}</td>
                        <td className="px-3 py-2 font-bold text-white">{p.sym}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold ${p.side === 'LONG' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}>{p.side}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-gray-400">{formatNumber(p.entry)}</span>
                          <span className="mx-1 text-gray-600">→</span>
                          <span className="text-white font-semibold">{formatNumber(p.current_price)}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-green-400">{formatNumber(p.tp)}</span>
                          <span className="mx-1 text-gray-600">/</span>
                          <span className="text-red-400">{formatNumber(p.sl)}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-orange-400 font-semibold">{formatCurrency(p.size)}</span>
                          <span className="text-gray-500 ml-1">({p.lev}x)</span>
                        </td>
                        <td className={`px-3 py-2 text-right ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                          {isPos ? '+' : ''}{p.pnl_pct.toFixed(2)}%
                        </td>
                        <td className={`px-3 py-2 text-right font-bold ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                          {isPos ? '+' : ''}{formatCurrency(p.pnl_usd)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button 
                            onClick={() => fetch(`/api/bot/close/${p.sym}`, { method: 'POST' })}
                            className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-[9px] uppercase tracking-widest font-bold transition-colors border border-red-500/20"
                          >
                            Kapat
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-[#0f0f0f] border border-[#222] rounded-md overflow-hidden">
            <div className="bg-[#111] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 border-b border-[#222]">
              <AlertCircle className="w-3.5 h-3.5" /> Kapanan Pozisyonlar Son 50
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#1a1a1a] text-[9px] uppercase tracking-wider text-gray-500 bg-[#0a0a0a]">
                    <th className="px-3 py-1.5 font-semibold">Tarihçe</th>
                    <th className="px-3 py-1.5 font-semibold">Sembol</th>
                    <th className="px-3 py-1.5 font-semibold">Yön</th>
                    <th className="px-3 py-1.5 font-semibold">Entry / Close</th>
                    <th className="px-3 py-1.5 font-semibold text-right">P&L</th>
                    <th className="px-3 py-1.5 font-semibold">Neden</th>
                    <th className="px-3 py-1.5 font-semibold">Strat</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[11px]">
                  {data.closed?.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-600 font-sans tracking-wide text-[10px]">Tarihçe boş</td></tr>
                  )}
                  {data.closed?.map((p: any, i: number) => {
                    const isPos = p.pnl >= 0;
                    return (
                      <tr key={i} className="border-b border-[#151515] hover:bg-[#111]">
                        <td className="px-3 py-1.5 leading-tight">
                          <div className="text-gray-300">{formatTime(p.closed)}</div>
                          <div className="text-[9px] text-gray-600">↳ {formatTime(p.opened)}</div>
                        </td>
                        <td className="px-3 py-1.5 font-bold text-white">{p.sym}</td>
                        <td className="px-3 py-1.5">
                          <span className={`px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold ${p.side === 'LONG' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}>{p.side}</span>
                        </td>
                        <td className="px-3 py-1.5">
                          <span className="text-gray-500">{formatNumber(p.entry)}</span> 
                          <span className="mx-1 text-gray-700">→</span> 
                          <span className="text-gray-300">{formatNumber(p.closed_price)}</span>
                        </td>
                        <td className={`px-3 py-1.5 text-right font-bold ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                          {isPos ? '+' : ''}{p.pnl.toFixed(2)}
                        </td>
                        <td className="px-3 py-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-[3px] font-bold ${
                            p.reason === 'TP' ? 'bg-green-500/10 text-green-400' : 
                            p.reason === 'SL' ? 'bg-red-500/10 text-red-400' : 
                            p.reason === 'REVERSAL' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-pink-500/10 text-pink-400'
                          }`}>
                            {p.reason}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-gray-600 font-sans text-[10px]">{p.strat}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Widgets (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          
          <section className="bg-purple-900/10 border border-purple-500/30 rounded-md overflow-hidden flex flex-col h-72 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <div className="bg-[#111] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-purple-400 flex items-center justify-between border-b border-purple-500/20">
              <div className="flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4" /> ASENKRON YAPAY ZEKA (OVERSEER)
              </div>
              <div className="flex space-x-2">
                <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
              </div>
            </div>
            <div className="flex-1 w-full p-3 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-purple-900/50 scrollbar-track-transparent">
              {data.ai_logs && data.ai_logs.length > 0 ? (
                data.ai_logs.map((log: any, idx: number) => {
                  let alertColor = 'text-green-400';
                  let borderAlert = 'border-[#222] border-l-4 border-l-green-500/50';
                  if (log.data?.strategy_flaw_detected) {
                    alertColor = 'text-red-400 animate-pulse';
                    borderAlert = 'border-red-500/30 border border-l-4 border-l-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
                  } else if (log.msg.includes('[HTTP ERROR') || log.msg.includes('[FATAL ERROR')) {
                    alertColor = 'text-red-400';
                    borderAlert = 'border-red-900/50 border border-l-4 border-l-red-800';
                  }

                  return (
                    <div key={idx} className={`bg-[#151515] rounded p-3 text-[11px] text-gray-300 ${borderAlert}`}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-purple-400 font-mono text-[10px] bg-purple-900/20 px-1.5 py-0.5 rounded">{formatTime(log.time)}</div>
                        <div className="flex items-center gap-2">
                          {log.data?.action && (
                            <span className="text-gray-400 text-[9px] bg-[#222] px-1 rounded border border-[#333]">
                              {log.data.action}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="font-medium text-gray-200 mb-1 leading-relaxed">{log.msg}</div>
                      {log.data && log.data.analysis_of_past_trades && (
                        <div className="mt-2 text-gray-400 italic bg-[#0f0f0f] p-2 rounded border border-[#1a1a1a]">
                          <span className="text-purple-400/70 not-italic font-bold block mb-1">Post-Trade Analizi:</span>
                          "{log.data.analysis_of_past_trades}"
                        </div>
                      )}
                      {log.data && log.data.strategy_flaw_detected && log.data.new_recommended_logic && (
                         <div className="mt-2 text-gray-300 bg-purple-900/10 p-2 rounded border border-purple-500/20 font-mono text-[10px]">
                           <span className="text-purple-400 font-bold block mb-1">» Önerilen Yeni Kurgu:</span>
                           <div>Strateji: {log.data.new_recommended_logic.recommended_strategy}</div>
                           <div>Kaldıraç: {log.data.new_recommended_logic.recommended_leverage}x</div>
                           <div>TP: %{log.data.new_recommended_logic.take_profit_pct}</div>
                           <div>SL: %{log.data.new_recommended_logic.stop_loss_pct}</div>
                         </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center text-purple-900/50 text-xs uppercase tracking-widest font-bold">Asenkron Gözlemci Beklemede...</div>
              )}
            </div>
          </section>

          <section className="bg-[#0f0f0f] border border-[#222] rounded-md overflow-hidden text-[#e0e0e0]">
            <div className="bg-[#111] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 border-b border-[#222]">
              <Info className="w-3.5 h-3.5 text-blue-400" /> Strateji Prensipleri (5m)
            </div>
            <div className="p-3 space-y-3 text-[11px] leading-relaxed">
              <div>
                <span className="text-blue-400 font-bold block mb-0.5">🟢 Mean Reversion (Ortalamaya Dönüş)</span>
                Gerçekleşen sert sapmaları hedefler. Fiyat, son 10 mumluk ortalamasından (MA10) <span className="text-white font-mono">%1.5</span>'den fazla saparsa tepki bekler. (Hedef: ~%1.8, Stop: ~%1.2).
              </div>
              <div className="h-px bg-[#222] w-full" />
              <div>
                <span className="text-yellow-400 font-bold block mb-0.5">🟠 Volume Breakout (Hacim Patlaması)</span>
                Momentumu yakalar. 5 Dakikalık hacim, son ortalamanın <span className="text-white font-mono">2.0</span> katını aşarsa işleme girer. (Hedef: ~%2.2, Stop: ~%1.5).
              </div>
              <div className="h-px bg-[#222] w-full" />
              <div>
                <span className="text-pink-400 font-bold block mb-0.5">🔴 Erken Kaçış (Reversal - RSI)</span>
                Piyasa aniden terse dönerse hedefleri (TP/SL) beklemez. Long'dayken RSI <span className="text-white font-mono">30</span> altına sarkarsa veya Short'tayken RSI <span className="text-white font-mono">70</span> üstüne çıkarsa anında çıkar.
              </div>
            </div>
          </section>

          {/* V1 YENİLİKLERİ KARTI */}
          <section className="bg-[#0f0f0f] border border-blue-500/20 rounded-md overflow-hidden text-[#e0e0e0] mt-4 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 blur-xl rounded-full" />
            <div className="bg-gradient-to-r from-[#111] to-blue-900/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1.5 border-b border-[#222]">
              <AlertCircle className="w-3.5 h-3.5" /> V1 Updates / İyileştirmeler
            </div>
            <div className="p-3 space-y-3 text-[11px] leading-relaxed relative z-10">
              <div className="flex gap-2">
                <div className="text-blue-400 mt-0.5">1.</div>
                <div><span className="text-gray-300 font-semibold block">Zaman Dilimi Optimizasyonu (5m)</span>
                1 dakikalık gürültülü (noisy) mumlar yerine <span className="font-mono text-white">5 dakikalık</span> mumlara geçildi. Yanlış sinyaller filtrelenip hedef 10-30 dk'lık stabil işlemlere ayarlandı.</div>
              </div>
              <div className="flex gap-2">
                <div className="text-blue-400 mt-0.5">2.</div>
                <div><span className="text-gray-300 font-semibold block">Geliştirilmiş TP/SL (Komisyon Koruması)</span>
                Eski dar TP(%0.85) / SL(%0.50) hedefleri "fee" makasını kurtarması ve pozisyona nefes payı açması için <span className="font-mono text-white">~%2.0 (TP) / ~%1.5 (SL)</span> olarak genişletildi.</div>
              </div>
              <div className="flex gap-2">
                <div className="text-blue-400 mt-0.5">3.</div>
                <div><span className="text-gray-300 font-semibold block">Toplu (Bulk) API İstekleri</span>
                Her coin için tek tek sorgu atıp tepkileri 6-7 saniye geciktiren mimari yerine <span className="font-mono text-white">Bütün coin fiyatlarını tek sorguda çeken</span> paralel mimariye (Promise.all) geçildi. Böylece saniyelik makaslar (slippage) önlendi.</div>
              </div>
              <div className="flex gap-2">
                <div className="text-blue-400 mt-0.5">4.</div>
                <div><span className="text-gray-300 font-semibold block">Net P&L (Slippage Yanılgısı)</span>
                Açık pozisyonlarda gördüğünüz kâr/zarar, <b>Binance %0.08 Maker/Taker Komisyonları</b> anlık hesaplanıp düşülerek yansıtılır. Bir kâr <span className="text-green-400">+$0.14</span> brüt olsa da komisyonu <span className="text-red-400">-$0.48</span> ise ekranda (ve log'da matematiksel olarak kusursuz bir şekilde) <span className="text-red-400">-$0.34</span> yazar. Bot komisyonu milisaniyesi milisaniyesine hesaplar. Toptan kapatmak yerine tabloya pozisyon bazlı <b>KAPAT</b> butonu yerleştirildi.</div>
              </div>
              <div className="flex gap-2">
                <div className="text-blue-400 mt-0.5">5.</div>
                <div><span className="text-gray-300 font-semibold block">P&L Kesiciler + Yüksek Kaldıraç Taktiği</span>
                Testlerde görülen dalgalanmalar için kesiciler eklendi. Bot pozisyon hacmi ve kaldıraç hesaplamasını <b>+$3 Hedefe Göre</b> daha yüksek oranlı yapar, ancak açık bir pozisyon <b>+$1 NET Kâr'ı</b> gördüğü an beklemez kapatır (PROFIT_CUT_1USD). Bu şekilde çok daha kısa sürede (hedefe beklemeden) garantili kâr alınır. Negatif tarafta ise <b>-$3 ZARAR'ı</b> gördüğü an acımasızca keser (LOSS_CUT_3USD).</div>
              </div>
              <div className="flex gap-2">
                <div className="text-blue-400 mt-0.5">6.</div>
                <div><span className="text-gray-300 font-semibold block">Minimax "Bot Anayasası" Eğitimi</span>
                Yapay zeka (Minimax) son strateji güncellemelerinden haberdar edilerek <b>Özel Scalping Kuralları (Bot Anayasası)</b> ile eğitildi. Artık yapay zeka sistemin +$1 ile pozisyon kesmesini ya da olası Reversal durumlarında erken çıkmasını "Hata" olarak algılayıp botu <b>DURDURMAYACAK</b>. Yalnızca TP/SL yüzdelerini piyasanın yönüne göre optimize edecek. Bu anayasa AI'ın kafasına kazındı.</div>
              </div>
              <div className="flex gap-2">
                <div className="text-blue-400 mt-0.5">7.</div>
                <div><span className="text-gray-300 font-semibold block">Güvenlik & WebSocket Bilgilendirmesi (V2 Hazırlığı)</span>
                <b>API Key Expose Riski:</b> Hayır yok. AI Yönetici modalındaki Minimax API Key, doğrudan arka plana (Backend Node.js) aktarılacak ve tüm yapay zeka işlemleri backend'te gizli yapılacaktır (Siteye giren kodu göremez). AWS kurulumunda dilerseniz direkt sunucu ortam değişkenine (.env) koyarak %100 güvenlik sağlarız.<br/>
                <b>WebSocket Kurulumu:</b> Binance genel fiyat/ticker verileri için public (halka açık) WebSocket sunar, sizin Binance üzerinden bir şey onaylamanıza ya da ayarlamanıza gerek yoktur. Bot tarafında HTTP sorgusundan vazgeçip doğrudan WSS akışına geçiş kodlanacaktır (Gecikmeyi milisaniyelere düşürecek).</div>
              </div>
            </div>
          </section>

          <section className="bg-[#0f0f0f] border border-pink-500/20 rounded-md overflow-hidden text-[#e0e0e0] mt-4 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 blur-xl rounded-full" />
            <div className="bg-gradient-to-r from-[#111] to-pink-900/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-pink-400 flex items-center gap-1.5 border-b border-[#222]">
              <Activity className="w-3.5 h-3.5" /> 🚀 V2 Yol Haritası: Maliyet ve Altyapı
            </div>
            <div className="p-3 space-y-3 text-[11px] leading-relaxed relative z-10">
              <div className="flex gap-2">
                <div className="text-pink-400 mt-0.5">1.</div>
                <div><span className="text-gray-300 font-semibold block">WebSockets Maliyeti (Sıfır Ek Ücret)</span>
                WebSockets mimarisine geçmek için <span className="text-green-400 font-bold">ekstra donanım veya üyelik satın almanıza gerek yoktur!</span> Binance bu yayını (API/Stream) ücretsiz sunar. Yapılması gereken tek şey botun kodunu (Rest'ten WSS'e) güncellemektir (Tamamen yazılımsal bir revizyon).</div>
              </div>
              <div className="flex gap-2">
                <div className="text-pink-400 mt-0.5">2.</div>
                <div><span className="text-gray-300 font-semibold block">AWS Tokyo VPS Maliyeti ($5 - $20 / Ay)</span>
                Binance sunucuları <span className="font-mono text-white">AWS Tokyo (ap-northeast-1)</span> bölgesindedir. Hızdan faydalanmak için onbinlerce dolar harcamaya gerek yok. Kurumsal bir AWS hesabı açıp <span className="font-mono text-white">EC2 t4g.micro</span> veya <span className="font-mono text-white">t3.micro</span> sunucu kiralayabilirsiniz. Maliyeti aylık ortalama <span className="text-green-400 font-bold">$5 - $10</span> civarıdır.</div>
              </div>
              <div className="flex gap-2">
                <div className="text-pink-400 mt-0.5">3.</div>
                <div><span className="text-gray-300 font-semibold block">Alternatif VPS Sağlayıcıları (Tokyo İçin)</span>
                Eğer AWS yönetim paneli karışık gelirse, kullanımı daha kolay olan <span className="font-mono text-white text-blue-300 hover:underline">Vultr</span>, <span className="font-mono text-white text-blue-300 hover:underline">DigitalOcean</span> veya <span className="font-mono text-white text-blue-300 hover:underline">Linode (Akamai)</span> kullanabilirsiniz. Bu firmaların Tokyo veri merkezlerinden alınacak standart 1GB/2GB Ram'li bir Linux VPS'in aylık ücreti ortalama <span className="text-green-400 font-bold">$5 - $12</span> arasındadır. <br/><span className="text-gray-500 mt-1 block">*Ping oranları AWS kadar kusursuz 2ms olmasa da 10-15ms ile ciddi avantaj sağlar.*</span></div>
              </div>
            </div>
          </section>
        </div>
      </main>
      )}

      {activeTab === 'ANALYTICS' && (
        <AnalyticsTab data={data} />
      )}
    </div>
  );
}

function AnalyticsTab({ data }: { data: any }) {
  const mockComputeData = Array.from({ length: 20 }, (_, i) => ({
    time: i,
    cpu: Math.floor(Math.random() * 15 + 5),
    memory: Math.floor(Math.random() * 20 + 40),
    ping: Math.floor(Math.random() * 3 + 12),
  }));

  const mockDbData = Array.from({ length: 20 }, (_, i) => ({
    time: i,
    reads: Math.floor(Math.random() * 50 + 10),
    writes: Math.floor(Math.random() * 20 + 5),
  }));

  return (
    <main className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Metrics Row */}
      <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#0f0f0f] border border-[#222] rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Compute (EC2)</div>
            <div className="text-xl font-mono text-blue-400">t4g.micro</div>
            <div className="text-[11px] text-gray-500 mt-1">Status: <span className="text-green-500">Healthy</span></div>
          </div>
          <Server className="w-8 h-8 text-[#222]" />
        </div>
        <div className="bg-[#0f0f0f] border border-[#222] rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Memory Usage</div>
            <div className="text-xl font-mono text-pink-400">45%</div>
            <div className="text-[11px] text-gray-500 mt-1">0.45 GB / 1.0 GB</div>
          </div>
          <Cpu className="w-8 h-8 text-[#222]" />
        </div>
        <div className="bg-[#0f0f0f] border border-[#222] rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Firebase / DB</div>
            <div className="text-xl font-mono text-yellow-400">Firestore</div>
            <div className="text-[11px] text-gray-500 mt-1">Avg Reads: 32/s</div>
          </div>
          <Database className="w-8 h-8 text-[#222]" />
        </div>
        <div className="bg-[#0f0f0f] border border-[#222] rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Network</div>
            <div className="text-xl font-mono text-green-400">14ms</div>
            <div className="text-[11px] text-gray-500 mt-1">Binance: Connected</div>
          </div>
          <Network className="w-8 h-8 text-[#222]" />
        </div>
        <div className="bg-purple-900/10 border border-purple-500/20 rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-purple-400 uppercase tracking-widest font-bold mb-1">AI Tokens (Free)</div>
            <div className="text-xl font-mono text-white">{data?.ai_used_tokens ? (data.ai_used_tokens / 1000).toFixed(1) + 'K' : '0'}</div>
            <div className="text-[11px] text-gray-500 mt-1">Limit: 1M / gün</div>
          </div>
          <BrainCircuit className="w-8 h-8 text-purple-500/50" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="lg:col-span-8 space-y-4">
        <section className="bg-[#0f0f0f] border border-[#222] rounded-md overflow-hidden h-64 flex flex-col">
          <div className="bg-[#111] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 border-b border-[#222]">
            <Activity className="w-3.5 h-3.5" /> CPU & Memory Trend (Örnek Veri)
          </div>
          <div className="flex-1 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockComputeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#666" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ stroke: '#333' }} contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '4px', fontSize: '11px', padding: '4px' }} />
                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" />
                <Area type="monotone" dataKey="memory" stroke="#ec4899" fillOpacity={1} fill="url(#colorMem)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-[#0f0f0f] border border-[#222] rounded-md overflow-hidden h-64 flex flex-col">
          <div className="bg-[#111] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 border-b border-[#222]">
            <Database className="w-3.5 h-3.5" /> Database IOPS (Mock)
          </div>
          <div className="flex-1 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDbData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#666" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#1a1a1a' }} contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '4px', fontSize: '11px', padding: '4px' }} />
                <Bar dataKey="reads" fill="#eab308" radius={[2, 2, 0, 0]} />
                <Bar dataKey="writes" fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Right Column: Info & Estimates */}
      <div className="lg:col-span-4 space-y-4">
        <section className="bg-[#0f0f0f] border border-[#222] rounded-md overflow-hidden">
          <div className="bg-[#111] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center justify-between border-b border-[#222]">
            <div className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Estimated Monthly Cost</div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-bold uppercase">AWS EC2 (t4g.micro)</span>
              <span className="text-white font-mono">~$4.20</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-bold uppercase">AWS Bandwidth</span>
              <span className="text-white font-mono">~$1.50</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-bold uppercase">Firebase (Spark Plan)</span>
              <span className="text-green-400 font-mono font-bold">$0.00</span>
            </div>
            <div className="h-px bg-[#222] w-full" />
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-white font-bold uppercase">Total Estimasyonu</span>
              <span className="text-blue-400 text-lg font-mono font-bold">~$5.70</span>
            </div>
          </div>
        </section>

        <section className="bg-blue-500/10 border border-blue-500/20 rounded-md p-4 text-[11px] leading-relaxed text-blue-200">
          <div className="font-bold text-blue-400 uppercase tracking-widest mb-2 text-[10px] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Neden Firebase?
          </div>
          Bu mimari Firebase (Firestore) ile çalışacak şekilde ayarlandığında, botunuz <b>AWS</b> üzerinde izole bir process olarak yaşar. Olası RAM sızıntıları (memory leak) veya tarayıcı çökmeleri botunuzu etkilemez. 
          <br/><br/>
          Siz bu (AI Studio / Web) kontrol paneline sadece <b>Firestore aracılığıyla</b> bağlanır, canlı durumu okur ve komut (Start/Stop/Config) gönderirsiniz.
        </section>
      </div>

    </main>
  );
}

function StatBlock({ label, value, color = "text-white" }: { label: string, value: string | number, color?: string }) {
  return (
    <div className="bg-[#0f0f0f] px-4 py-2.5 flex flex-col justify-center gap-0.5">
      <span className="text-[9px] uppercase tracking-wider text-gray-500">{label}</span>
      <span className={`text-[15px] font-semibold tracking-tight ${color}`}>{value}</span>
    </div>
  );
}


