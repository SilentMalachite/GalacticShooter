import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple healthcheck
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'galactic-shooter', time: new Date().toISOString() });
  });

  // Specific route for the Galaga game
  app.get(['/galaga', '/galaga/'], (_req, res) => {
    res.redirect(302, '/galaga-game.html');
  });

  app.get('/galaga-game.html', (req, res) => {
    // HTMLは都度取得（no-cache）
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.resolve(process.cwd(), 'galaga-game.html'));
  });
  
  app.get('/game.js', (req, res) => {
    // JS/CSSはキャッシュ許容（1週間）
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    res.sendFile(path.resolve(process.cwd(), 'game.js'));
  });
  
  app.get('/game.css', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    res.sendFile(path.resolve(process.cwd(), 'game.css'));
  });

  // API routes go here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
