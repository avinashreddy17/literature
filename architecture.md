# Literature Game – Full Architecture

## 🗂️ Folder Structure

literature/
├── client/ # React frontend
│ ├── public/ # Static assets
│ ├── src/
│ │ ├── components/ # UI components (Card, PlayerList, etc.)
│ │ ├── pages/ # Game pages (Lobby, Game)
│ │ ├── services/ # Socket.io client
│ │ ├── store/ # Zustand or Redux state
│ │ ├── utils/ # Helpers (e.g. formatCard, etc.)
│ │ └── main.tsx # React entry
│ └── index.html
├── server/ # Express + Socket.io backend
│ ├── index.ts # Entry point
│ ├── rooms.ts # Game state manager per room
│ ├── sockets.ts # Socket event handlers
│ └── utils.ts # Logging, validation helpers
├── shared/ # Shared game logic + types
│ ├── types.ts # Card, GameState, Player interfaces
│ └── game-engine.ts # Core logic (deck, validation, apply move)
├── .env # Environment variables
├── package.json # Monorepo root
└── tsconfig.json # TypeScript config


---

## 🧠 Component Responsibilities

### `client/`
- **UI**: All presentation, navigation, and user input
  - **GameTable**: Displays all players around an oval table, with your hand grouped by suit (♥ ♦ ♣ ♠) in a horizontal row at the bottom. The turn indicator is at the top center. Your name and team are shown above your hand. Score and claimed sets are at the top right.
- **State Management**: Handles `gameState`, `playerId`, etc.
- **Socket Service**: Communicates with backend
- **Pages**: `Lobby`, `GameRoom`, etc.

### `server/`
- **Room Management**: Maintains active games via Map
- **Socket Handlers**: Defines `joinRoom`, `askCard`, `makeClaim` events
- **Game Engine Adapter**: Calls shared logic and emits updates

### `shared/`
- **Pure Game Logic**: Stateless functions to:
  - Create + shuffle deck
  - Initialize games
  - Apply moves
  - Validate actions
  - Process claims
- **Types**: Used by both client and server

---

## 📦 State Management

### Server-Side
- Maintains:
  - `Map<roomId, GameState>`
  - Player-to-socket mapping
- Emits updates on:
  - Game start
  - Moves made
  - Claims attempted

### Client-Side
- Local state for:
  - `playerId`
  - `roomId`
  - `gameState` (sync from server)
  - `hand` and UI state

---

## 🔗 How Services Connect

- WebSocket (`socket.io`) bridges client and server.
- Events:
  - `joinRoom`, `startGame`, `askCard`, `makeClaim`
  - Server emits `gameState`, `moveResult`, `claimResult`
- Shared types ensure compile-time sync across layers.
