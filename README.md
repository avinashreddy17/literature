# Literature Card Game

A real-time multiplayer Literature card game built with React, TypeScript, Express, and Socket.io.

## 🚀 Quick Start

### PowerShell (Windows) Users:
```powershell
# Install dependencies
npm install

# Start both server and client (requires concurrently)
npm run start:both

# OR start them separately:
# Terminal 1 - Start server
npm run dev:server

# Terminal 2 - Start client  
npm run dev:client
```

### Bash/Zsh (Mac/Linux) Users:
```bash
# Install dependencies
npm install

# Start server and client together
npm run start:both

# OR start them separately:
# Terminal 1
cd server && npm run dev

# Terminal 2  
cd client && npm run dev
```

## 🛠️ Development Commands

```powershell
# Type check entire project
npm run type-check

# Build all packages
npm run build:all

# Test all packages
npm run test
```

## 🎮 How to Play

1. **Start the servers** using commands above
2. **Open browser** to `http://localhost:5173` (client)
3. **Create or join** a game room
4. **Wait for 6 players** to join
5. **Start the game** and begin playing Literature!

### 🆕 New UI Features
- **All players** are visible around a professional oval table
- **Your hand** is displayed at the bottom, grouped by suit (♥ ♦ ♣ ♠) in a horizontal row
- **Turn indicator** is now at the top center of the screen
- **Your name and team** are shown above your hand
- **Score and claimed sets** are always visible at the top right
- **Opponent hands** show only 1-2 cards for clarity

## 📁 Project Structure

- `client/` - React frontend with Vite
  - `components/` - UI components (GameTable, PlayingCard, etc.)
    - `GameTable.tsx` - Main game UI: oval table, player positions, suit-based hand display, top-center turn indicator
- `server/` - Express + Socket.io backend  
- `shared/` - Shared TypeScript types and game engine

## 🔧 Troubleshooting

### PowerShell Issues
If you see errors like "The token '&&' is not a valid statement separator", use the npm scripts instead:
- ❌ `cd server && npm run dev`
- ✅ `npm run dev:server`

### Port Issues
- Server runs on: `http://localhost:3001`
- Client runs on: `http://localhost:5173`

Make sure these ports are available.