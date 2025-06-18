// Main Express server with Socket.io for Literature game
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// Import our game manager (we'll create this next)
import { GameManager } from './game-manager';
import { setupSocketHandlers } from './socket-handlers';

/**
 * EXPLANATION: Express + Socket.io Setup
 * 
 * 1. Express creates the web server foundation
 * 2. HTTP server wraps Express (needed for Socket.io)
 * 3. Socket.io attaches to the HTTP server for real-time communication
 */

// Create Express application
const app = express();

// Create HTTP server (Socket.io needs this, not just Express)
const httpServer = createServer(app);

// Create Socket.io server attached to HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite React dev server (we'll use this later)
    methods: ["GET", "POST"],
    credentials: true
  }
});

/**
 * EXPLANATION: Middleware Setup
 * 
 * Middleware functions run before your route handlers.
 * They can modify the request/response or add functionality.
 */

// Enable CORS for all routes (allows React app to call our API)
app.use(cors({
  origin: "http://localhost:5173", // React dev server
  credentials: true
}));

// Parse JSON request bodies (when we add REST APIs later)
app.use(express.json());

/**
 * EXPLANATION: Route Handlers
 * 
 * These handle HTTP requests (GET, POST, etc.)
 * For now, just basic health check and info routes.
 */

// Health check endpoint - useful for monitoring
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Server info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Literature Game Server',
    version: '1.0.0',
    gameEngine: 'Literature Rules Engine v1.8',
    activeGames: gameManager.getActiveGameCount()
  });
});

/**
 * EXPLANATION: Game Manager
 * 
 * This will be our central coordinator for all game rooms.
 * It keeps track of active games, manages players, etc.
 */

// Create the game manager instance
const gameManager = new GameManager();

/**
 * EXPLANATION: Socket.io Connection Handling
 * 
 * This is where the real-time magic happens.
 * When a client connects, we set up event handlers for them.
 */

io.on('connection', (socket) => {
  console.log(`🎮 Player connected: ${socket.id}`);
  
  // Set up all the Literature game event handlers
  setupSocketHandlers(socket, io, gameManager);
  
  // Handle player disconnect
  socket.on('disconnect', (reason) => {
    console.log(`👋 Player disconnected: ${socket.id}, reason: ${reason}`);
    // GameManager will handle cleanup
    gameManager.handlePlayerDisconnect(socket.id);
  });
});

/**
 * EXPLANATION: Server Startup
 * 
 * Start the server listening on a specific port.
 * The server handles both HTTP requests AND Socket.io connections.
 */

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Literature Game Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for real-time connections`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`ℹ️  Server info: http://localhost:${PORT}/api/info`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
}); 