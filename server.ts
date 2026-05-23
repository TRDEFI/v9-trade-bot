import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { BotRunner } from './server/botRunner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // Initialize and auto-start the bot
  const bot = new BotRunner();
  bot.start(); // Auto-start the background trading loop when server/PM2 starts

  // API Routes
  app.get('/api/data', (req, res) => {
    res.json(bot.getDashboardData());
  });

  app.post('/api/bot/start', (req, res) => {
    bot.start();
    res.json({ success: true, message: 'Bot started' });
  });

  app.post('/api/bot/stop', (req, res) => {
    bot.stop();
    res.json({ success: true, message: 'Bot stopped' });
  });

  app.post('/api/bot/close/:sym', async (req, res) => {
    const sym = req.params.sym;
    const currentPrices = await bot.binance.getAllPrices();
    await bot.closePosition(sym, 'MANUAL', currentPrices);
    res.json({ success: true, message: `${sym} manually closed` });
  });

  app.get('/api/bot/download-log', (req, res) => {
    const csv = bot.downloadableLog;
    if (!csv) {
      return res.status(404).send('No log available');
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=V9_AutoTrader_Session_Log.csv');
    res.send(csv);
    
    // İndirildikten sonra sil, yer kaplamasın
    bot.downloadableLog = null;
    bot.closedPositions = []; // Veya sadece logu temizle
  });

  // HERMES health endpoint: loop status, crash count, uptime
  app.get('/api/bot/health', (req, res) => {
    const data = bot.getDashboardData();
    res.json({
      is_active: data.is_active,
      loop_running: data.loop_running,
      last_loop_time: data.last_loop_time,
      last_loop_duration_ms: data.last_loop_duration_ms,
      loop_crash_count: data.loop_crash_count,
      pairs_loaded: data.pairs_loaded,
      open_positions: data.opens.length,
      total_trades: data.total_trades,
      capital: data.capital,
      total_pnl: data.total_pnl,
      elapsed: data.elapsed,
      server_time: data.server_time
    });
  });

  // Serve evolution log for HERMES agent
  app.get('/api/evolution', (req, res) => {
    try {
      const data = fs.readFileSync(path.join(__dirname, 'self_evolution_log.json'), 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    } catch {
      res.status(404).json({ error: 'Evolution log not found' });
    }
  });

  app.get('/api/bot/download-system-logs', (req, res) => {
    if (bot.systemLogs.length === 0) {
      return res.status(404).send('No system logs available');
    }
    
    const txt = bot.systemLogs.map(l => `[${l.time}] [${l.level.toUpperCase()}] ${l.msg}`).join('\n');
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=V9_AutoTrader_System_Logs.txt');
    res.send(txt);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Esbuild bundles to dist/server.js — __dirname already points to the dist/ folder
    const distPath = path.resolve(__dirname);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
