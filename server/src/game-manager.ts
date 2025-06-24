// Game Manager - Coordinates multiple Literature game rooms
import { GameState, Player, AskCardMove, ClaimMove } from 'shared';
import { 
  initializeGame, 
  validateMove, 
  applyMove, 
  checkClaim,
  isGameOver,
  getGameResults,
  endGame,
  processClaimWithGameEnd,
  processAskMoveWithGameEnd
} from 'shared';

/**
 * EXPLANATION: Server-Side Types
 * 
 * These are additional types we need on the server that aren't part of 
 * the core game engine. They handle real-time multiplayer concerns.
 */

// Represents a connected player (extends the game Player with socket info)
export interface ConnectedPlayer {
  socketId: string;      // Socket.io connection ID
  playerId: string;      // Game player ID (used in GameState)
  playerName: string;    // Display name
  isConnected: boolean;  // Are they currently connected?
  joinedAt: Date;       // When they joined
}

// Represents an active game room
export interface GameRoom {
  roomId: string;           // Unique room identifier
  gameState: GameState;     // Our game engine state
  players: ConnectedPlayer[]; // Players in this room
  createdAt: Date;         // When room was created
  lastActivity: Date;      // For cleanup of inactive rooms
  maxPlayers: number;      // 6 or 8 players
  isStarted: boolean;      // Has the game begun?
}

// Events that can happen in a game room
export interface GameEvent {
  type: 'playerJoined' | 'playerLeft' | 'gameStarted' | 'moveCompleted' | 'gameEnded';
  playerId?: string;
  data?: any;
  timestamp: Date;
}

/**
 * EXPLANATION: GameManager Class
 * 
 * This is the "central command" for all our Literature games.
 * It uses a Map to store multiple game rooms by their IDs.
 * Maps are like objects but better for this use case.
 */

export class GameManager {
  private gameRooms: Map<string, GameRoom> = new Map();
  private playerToRoom: Map<string, string> = new Map(); // socketId -> roomId mapping

  /**
   * EXPLANATION: Room Creation
   * 
   * When someone wants to start a new game, we:
   * 1. Generate a unique room ID
   * 2. Create the room data structure
   * 3. Store it in our Map
   */
  
  createGame(creatorSocketId: string, creatorName: string, maxPlayers: 6 | 8 = 6): GameRoom {
    const roomId = this.generateRoomId();
    
    // Create the room but don't initialize the game yet (need all players first)
    const gameRoom: GameRoom = {
      roomId,
      gameState: null as any, // Will be set when game starts
      players: [{
        socketId: creatorSocketId,
        playerId: this.generatePlayerId(creatorName),
        playerName: creatorName,
        isConnected: true,
        joinedAt: new Date()
      }],
      createdAt: new Date(),
      lastActivity: new Date(),
      maxPlayers,
      isStarted: false
    };

    this.gameRooms.set(roomId, gameRoom);
    this.playerToRoom.set(creatorSocketId, roomId);

    console.log(`🎮 New game room created: ${roomId} by ${creatorName}`);
    return gameRoom;
  }

  /**
   * EXPLANATION: Joining Games
   * 
   * When someone wants to join an existing game:
   * 1. Find the room
   * 2. Check if there's space
   * 3. Add them to the room
   * 4. Update our mapping
   */

  joinGame(roomId: string, playerSocketId: string, playerName: string): GameRoom | null {
    const room = this.gameRooms.get(roomId);
    
    if (!room) {
      console.log(`❌ Room ${roomId} not found`);
      return null;
    }

    if (room.players.length >= room.maxPlayers) {
      console.log(`❌ Room ${roomId} is full`);
      return null;
    }

    if (room.isStarted) {
      console.log(`❌ Room ${roomId} game already started`);
      return null;
    }

    // Check for duplicate player names in this room (case-insensitive)
    const existingPlayer = room.players.find(p => p.playerName.toLowerCase() === playerName.toLowerCase());
    if (existingPlayer) {
      console.log(`❌ Name "${playerName}" already taken in room ${roomId}`);
      return null;
    }

    // Add the new player
    const newPlayer: ConnectedPlayer = {
      socketId: playerSocketId,
      playerId: this.generatePlayerId(playerName),
      playerName: playerName,
      isConnected: true,
      joinedAt: new Date()
    };

    room.players.push(newPlayer);
    room.lastActivity = new Date();
    this.playerToRoom.set(playerSocketId, roomId);

    console.log(`👋 ${playerName} joined room ${roomId} (${room.players.length}/${room.maxPlayers})`);
    return room;
  }

  /**
   * EXPLANATION: Starting Games
   * 
   * When we have enough players, we can start the actual Literature game:
   * 1. Use our game engine's initializeGame() function
   * 2. Map our ConnectedPlayers to the game engine's Player format
   * 3. Update the room state
   */

  startGame(roomId: string): GameState | null {
    const room = this.gameRooms.get(roomId);
    
    if (!room) return null;
    if (room.isStarted) return room.gameState;
    if (room.players.length < 6) {
      console.log(`❌ Need at least 6 players to start, have ${room.players.length}`);
      return null;
    }

    // Convert our ConnectedPlayers to player names for the game engine
    const playerNames = room.players.map(p => p.playerName);
    
    console.log(`🚀 Initializing game with players:`, playerNames);
    
    // Use our game engine to create the initial game state
    const gameState = initializeGame(playerNames);
    
    console.log(`🎮 Game initialized with phase: ${gameState.phase}`);
    console.log(`🎯 Starting player: ${gameState.players[gameState.currentPlayerIndex].name} (index ${gameState.currentPlayerIndex})`);
    console.log(`📊 Player details:`);
    gameState.players.forEach((player, index) => {
      console.log(`   ${index}: ${player.name} (${player.id}) - Team ${player.team} - ${player.cardCount} cards`);
    });
    
    // Update our room
    room.gameState = gameState;
    room.isStarted = true;
    room.lastActivity = new Date();

    console.log(`🚀 Game started in room ${roomId} with ${playerNames.length} players`);
    return gameState;
  }

  /**
   * EXPLANATION: Processing Moves
   * 
   * This is where our game engine integration shines:
   * 1. Find the room and validate the move
   * 2. Use our validateMove() and applyMove() functions
   * 3. Update the room's game state
   * 4. Return the result for broadcasting
   */

  processMove(socketId: string, move: AskCardMove | ClaimMove): { 
    success: boolean; 
    gameState?: GameState; 
    error?: string;
    gameEnded?: boolean;
    gameResults?: any;
  } {
    console.log('\n🔧 ===== PROCESSING MOVE IN GAME MANAGER =====');
    
    const roomId = this.playerToRoom.get(socketId);
    if (!roomId) {
      console.log('❌ Player not in any game room');
      return { success: false, error: 'Player not in any game room' };
    }

    const room = this.gameRooms.get(roomId);
    if (!room || !room.isStarted) {
      console.log('❌ Game not started or room not found');
      return { success: false, error: 'Game not started' };
    }

    console.log('🎯 Move details for validation:');
    console.log('   - Type:', move.type);
    console.log('   - Full move:', JSON.stringify(move, null, 2));
    console.log('🎲 Current game state before validation:');
    console.log('   - Current player index:', room.gameState.currentPlayerIndex);
    console.log('   - Phase:', room.gameState.phase);
    console.log('   - Players:', room.gameState.players.map(p => `${p.name}(${p.id}) - ${p.cardCount} cards`));

    // Validate the move using our game engine
    console.log('🔍 Validating move...');
    const isValid = validateMove(room.gameState, move);
    console.log('✅ Validation result:', isValid);
    
    if (!isValid) {
      console.log('❌ Move validation failed');
      return { success: false, error: 'Invalid move' };
    }

    console.log('🎯 Applying move...');
    
    // Use different processing based on move type to handle auto-ending
    let moveResult: any;
    
    if (move.type === 'ask') {
      // Use processAskMoveWithGameEnd for ask-card moves (includes auto-award check)
      moveResult = processAskMoveWithGameEnd(room.gameState, move);
    } else if (move.type === 'claim') {
      // Use processClaimWithGameEnd for claim moves (existing functionality)
      moveResult = processClaimWithGameEnd(room.gameState, move);
    } else {
      console.log('❌ Unknown move type');
      return { success: false, error: 'Unknown move type' };
    }
    
    console.log('✅ Move applied successfully');
    console.log('🎲 Move result summary:');
    console.log('   - Success:', moveResult.success);
    console.log('   - Game ended:', moveResult.gameEnded);
    console.log('   - New current player index:', moveResult.updatedState.currentPlayerIndex);
    console.log('   - Last move:', moveResult.lastMove);
    
    // Update the room state with the result
    room.gameState = moveResult.updatedState;
    room.lastActivity = new Date();

    // Check if game ended (either from auto-award or final claim)
    if (moveResult.gameEnded) {
      console.log('🎮 Game is over!');
      console.log(`🏆 Game ended in room ${roomId}: ${moveResult.gameResults.message}`);
      console.log(`📊 Final scores - Team 0: ${moveResult.gameResults.team0Score}, Team 1: ${moveResult.gameResults.team1Score}`);
      console.log(`🎯 Final phase: ${moveResult.updatedState.phase}`);
      
      return { 
        success: true, 
        gameState: moveResult.updatedState, 
        gameEnded: true,
        gameResults: moveResult.gameResults
      };
    }

    console.log('===== MOVE PROCESSING COMPLETE =====\n');
    return { success: true, gameState: moveResult.updatedState };
  }

  /**
   * EXPLANATION: Player Disconnect Handling
   * 
   * When someone closes their browser or loses connection:
   * 1. Find which room they were in
   * 2. Mark them as disconnected (don't remove immediately)
   * 3. If game hasn't started, we might remove them
   * 4. If game is in progress, they can reconnect
   */

  handlePlayerDisconnect(socketId: string): { roomId?: string; shouldCleanupRoom?: boolean } {
    const roomId = this.playerToRoom.get(socketId);
    if (!roomId) return {};

    const room = this.gameRooms.get(roomId);
    if (!room) return {};

    const player = room.players.find(p => p.socketId === socketId);
    if (player) {
      player.isConnected = false;
      console.log(`👋 ${player.playerName} disconnected from room ${roomId}`);
    }

    // If game hasn't started and player leaves, remove them
    if (!room.isStarted) {
      room.players = room.players.filter(p => p.socketId !== socketId);
      this.playerToRoom.delete(socketId);
      
      // If no players left, cleanup room
      if (room.players.length === 0) {
        this.gameRooms.delete(roomId);
        console.log(`🗑️ Empty room ${roomId} cleaned up`);
        return { roomId, shouldCleanupRoom: true };
      }
    }

    return { roomId };
  }

  /**
   * EXPLANATION: Utility Functions
   * 
   * Helper functions for room management and IDs
   */

  getRoom(roomId: string): GameRoom | undefined {
    return this.gameRooms.get(roomId);
  }

  getRoomBySocketId(socketId: string): GameRoom | undefined {
    const roomId = this.playerToRoom.get(socketId);
    return roomId ? this.gameRooms.get(roomId) : undefined;
  }

  getActiveGameCount(): number {
    return this.gameRooms.size;
  }

  getAllRooms(): GameRoom[] {
    return Array.from(this.gameRooms.values());
  }

  // Generate unique room IDs (simple implementation)
  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Generate player IDs that match our game engine format
  private generatePlayerId(playerName: string): string {
    return playerName.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
} 