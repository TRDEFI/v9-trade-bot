import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Note: Use __dirname fallback for production (cjs) vs dev (esm)
    // Esbuild will bundle path logic, CJS has __dirname, ESM requires the fallback above
    const distPath = path.join(path.resolve(__dirname), 'dist');
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
