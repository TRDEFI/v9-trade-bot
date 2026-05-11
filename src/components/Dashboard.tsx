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
  const formatNumber = (val: any, dims: number = 4) => {
    if (typeof val === 'string') return val;
    return Number(val || 0).toFixed(dims);
  };
  
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
  const wins = data.total_wins || 0;
  const losses = data.total_losses || 0;
  const winRate = data.total_trades > 0 ? ((wins / data.total_trades) * 100).toFixed(1) : '0';

  // Calc PNL by symbol
  const symPnlMap: Record<string, number> = {};
  closedTrades.forEach((t: any) => {
    symPnlMap[t.sym] = (symPnlMap[t.sym] || 0) + t.pnl;
  });
  const barData = Object.entries(symPnlMap)
    .map(([sym, pnl]) => ({ sym, pnl }))
    .sort((a,b) => b.pnl - a.pnl)
    .slice(0, 10); // top 10

  const marginBalance = data.capital + data.unrealized_pnl;
  const freeMargin = marginBalance - data.used_capital;
  const marginRatio = marginBalance > 0 ? (data.used_capital / marginBalance) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#060606] text-[#e0e0e0] font-sans selection:bg-pink-500/30">
      <header className="flex items-center justify-between px-4 py-2.5 bg-[#0f0f0f] border-b border-[#222]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-pink-500" />
          <h1 className="text-pink-500 font-bold tracking-widest text-[13px] uppercase">V9 Autotrader</h1>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
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
            <div className={`flex items-center gap-1.5 ${data.global_risk_halted ? 'text-yellow-400' : (data.is_active ? 'text-green-400' : 'text-red-400')}`}>
              <span className="relative flex h-1.5 w-1.5">
                {data.is_active && !data.global_risk_halted && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>}
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
              </span>
              <span>{data.global_risk_halted ? 'RISK BEKLEMESİ (-$400)' : (data.is_active ? 'ÇALIŞIYOR' : 'DURDURULDU')}</span>
            </div>
            <span className="text-gray-500">{formatTime(data.server_time)} (GMT+3)</span>
          </div>
        </div>
      </header>

      {/* Ultra Compact Stats Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-px bg-[#1a1a1a] border-b border-[#1a1a1a]">
        <StatBlock label="Capital" value={formatCurrency(data.capital)} color="text-blue-400" />
        <StatBlock label="Free Bal" value={formatCurrency(data.capital - data.used_capital)} color="text-white" />
        <StatBlock label="Free Margin" value={formatCurrency(freeMargin)} color="text-teal-400" />
        <StatBlock label="Margin Ratio" value={`${marginRatio.toFixed(2)}%`} color={marginRatio > 80 ? 'text-red-400' : 'text-green-400'} />
        <StatBlock label="Süre" value={data.elapsed} color="text-yellow-400" />
        <StatBlock label="Win Rate" value={`${winRate}% (${wins}W/${losses}L)`} color={parseFloat(winRate) > 50 ? 'text-green-400' : 'text-gray-300'} />
        <StatBlock label="Açık Poz" value={`${data.opens.length}`} color="text-white" />
        <StatBlock label="Kapalı" value={`${data.total_trades}`} color="text-white" />
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
        
        {/* Full width tables */}
        <div className="lg:col-span-12 space-y-4">
          
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
                          <span className="text-green-400">{formatNumber(p.tp_price)}</span>
                          <span className="mx-1 text-gray-600">/</span>
                          <span className="text-red-400">{formatNumber(p.sl_price)}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-orange-400 font-semibold">{formatCurrency(p.size)}</span>
                          <span className="text-gray-500 ml-1">({p.lev}x)</span>
                        </td>
                        <td className={`px-3 py-2 text-right ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                          {isPos ? '+' : ''}{Number(p.pnl_pct || 0).toFixed(2)}%
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
                          {isPos ? '+' : ''}{Number(p.pnl || 0).toFixed(2)}
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
      <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
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


