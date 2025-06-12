import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from root directory (for the Galaga game)
  app.use(express.static(path.resolve(process.cwd())));
  
  // Specific route for the Galaga game
  app.get('/galaga-game.html', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'galaga-game.html'));
  });
  
  app.get('/game.js', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'game.js'));
  });
  
  app.get('/game.css', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'game.css'));
  });

  // API routes go here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
