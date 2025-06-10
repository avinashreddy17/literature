# 🛠️ MVP Build Plan – Literature Game

---

## ✅ Phase 0: Setup & Bootstrapping

### 0.1 – Initialize Monorepo
- **Start:** No codebase
- **End:** Yarn/PNPM workspace with `client`, `server`, `shared` folders scaffolded

---

### 0.2 – Setup TypeScript in all packages
- **Start:** Empty folders
- **End:** Working `tsconfig.json` in each workspace and valid compile in all packages

---

### 0.3 – Setup shared module alias (`shared/types.ts`)
- **Start:** No shared logic
- **End:** Shared folder with `Card`, `Player`, `GameState` interfaces usable across client and server

---

## 🎮 Phase 1: Game Engine (Shared Logic)

### 1.1 – Implement `createDeck()` in `shared/game-engine.ts`
- **Start:** Empty function
- **End:** Returns a 52-card deck + proper test file verifying it

---

### 1.2 – Implement `shuffleDeck(deck)` utility
- **Start:** Ordered deck
- **End:** Same deck shuffled; test ensures output is a permutation

---

### 1.3 – Implement `initializeGame(players)` function
- **Start:** Deck and player list
- **End:** Returns initialized `GameState` with dealt hands; test confirms fair distribution

---

### 1.4 – Implement `validateMove(gameState, move)`
- **Start:** Player + card + target player
- **End:** Returns `true` only if move is legal; tested with fake GameState

---

### 1.5 – Implement `applyMove(gameState, move)`
- **Start:** Valid move
- **End:** Game state updated accordingly; test with before/after snapshots

---

### 1.6 – Implement `checkClaim(gameState, claim)`
- **Start:** Input: player + claim
- **End:** Returns `{ success: boolean, updatedState: GameState }`; tested for both outcomes

---

## 🧠 Phase 2: Backend – Game Logic + WebSocket

### 2.1 – Setup basic Express + Socket.io server in `server/index.ts`
- **Start:** Bare server folder
- **End:** Server starts and accepts WebSocket connections at `/socket.io`

---

### 2.2 – Setup socket event: `joinRoom`
- **Start:** Empty handler
- **End:** Player joins room and is stored in a `Map<roomId, GameState>`; test log output

---

### 2.3 – Setup socket event: `startGame`
- **Start:** Room with players
- **End:** Initializes game using `initializeGame()`, emits `gameState` to all players

---

### 2.4 – Setup socket event: `askCard`
- **Start:** Two players in a game
- **End:** Valid move processed via `applyMove`, emits `cardResult` + `updatedGameState`

---

### 2.5 – Setup socket event: `makeClaim`
- **Start:** Player initiates claim
- **End:** Uses `checkClaim`; emits `claimResult` and updated game state

---

## 🧑‍💻 Phase 3: Frontend – Core Game UI

### 3.1 – Setup Vite + React + Tailwind in `client/`
- **Start:** Empty React folder
- **End:** App renders "Hello World" with Tailwind working

---

### 3.2 – Implement Zustand/Redux store with game state
- **Start:** Empty store
- **End:** `useGameStore()` can read/write `gameState`, `playerId`, `roomId`

---

### 3.3 – Implement socket service wrapper
- **Start:** No socket connection
- **End:** `socket.ts` can `connect`, emit `joinRoom`, and listen for `gameState`

---

### 3.4 – Create Lobby page
- **Start:** Bare UI
- **End:** Users enter name + room, click "Join", socket emits `joinRoom`

---

### 3.5 – Create Game page
- **Start:** Empty screen
- **End:** On `gameState` update, renders cards, player list, turn indicator

---

### 3.6 – Implement Card Click → Ask Card Action
- **Start:** Cards + player list visible
- **End:** Click sends `askCard` via socket; display waiting status

---

### 3.7 – Display `cardResult` + update local state
- **Start:** Waiting for response
- **End:** Show result ("Yes"/"No") and re-render cards

---

### 3.8 – Implement Claim UI
- **Start:** Button + input
- **End:** User selects 6 cards to claim a half-suit; emits `makeClaim`

---

### 3.9 – Display `claimResult`
- **Start:** Await claim result
- **End:** Show "Claim Successful" or "Failed", update game state

---

## 🧪 Phase 4: Testing + Polish

### 4.1 – Add unit tests for game engine logic
- **Start:** Few logic tests
- **End:** 100% coverage of `shared/game-engine.ts`

---

### 4.2 – Add test for joining room + starting game
- **Start:** Socket connection test only
- **End:** Room creation + start game emits verified

---

### 4.3 – Add Cypress test: full 2-player flow
- **Start:** Local game working
- **End:** Script joins room, starts game, makes 1 ask, 1 claim

---

## 🧼 Final Phase: MVP Feature Freeze

### 5.1 – Remove all logs, add error handling
- **Start:** Verbose logs
- **End:** Game handles bad moves, missing cards, invalid claims cleanly

---

### 5.2 – Deploy to Vercel (frontend) and Render/Railway (backend)
- **Start:** Local only
- **End:** Live game link + backend reachable via public WebSocket

---

## 📝 DEVELOPMENT PROTOCOL

### Documentation Rule
- **After each completed phase, update `PROGRESS.md` with detailed documentation**
- Include: goals achieved, files changed, functions implemented, test results, key learnings
- Update statistics: phases completed, functions implemented, lines of code
- Mark completed phases with ✅ in the "NEXT PHASES" section

### Coding Instructions
- Write the absolute minimum code required
- No sweeping changes
- No unrelated edits - focus on just the task you're on
- Make code precise, modular, testable
- Don't break existing functionality
- Test thoroughly before marking phase complete
- If user needs to do anything, tell them clearly
