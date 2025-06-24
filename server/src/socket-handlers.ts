// Socket.io Event Handlers for Literature Game
import { Socket, Server } from 'socket.io';
import { AskCardMove, ClaimMove } from 'shared';
import { GameManager } from './game-manager';

/**
 * EXPLANATION: Socket.io Event System
 * 
 * Socket.io works with named events that carry data:
 * 
 * Client → Server: socket.emit('eventName', data)
 * Server → Client: socket.emit('eventName', data) 
 * Server → Room: io.to('roomId').emit('eventName', data)
 * 
 * Think of it like a messaging system where each message type
 * has a name and can carry any data you want.
 */

// Define the events our Literature game will use
interface LiteratureEvents {
  // Client → Server events
  'createGame': (data: { playerName: string; maxPlayers?: 6 | 8 }) => void;
  'joinGame': (data: { roomId: string; playerName: string }) => void;
  'startGame': () => void;
  'askCard': (move: AskCardMove) => void;
  'claimSet': (move: ClaimMove) => void;
  'getGameState': () => void;

  // Server → Client events  
  'gameCreated': (data: { roomId: string; room: any }) => void;
  'gameJoined': (data: { room: any; yourPlayerId: string }) => void;
  'gameStarted': (data: { gameState: any }) => void;
  'gameUpdate': (data: { gameState: any; lastMove?: any }) => void;
  'gameEnded': (data: { gameResults: any; finalState: any }) => void;
  'playerJoined': (data: { playerName: string; playerCount: number }) => void;
  'playerLeft': (data: { playerName: string; playerCount: number }) => void;
  'error': (data: { message: string; code?: string }) => void;
}

/**
 * EXPLANATION: Event Handler Setup
 * 
 * This function is called whenever a new player connects.
 * We set up all the event listeners for that specific player.
 * Each player has their own socket with their own event handlers.
 */

export function setupSocketHandlers(
  socket: Socket, 
  io: Server, 
  gameManager: GameManager
): void {
  
  /**
   * EXPLANATION: Create Game Event
   * 
   * When a player wants to start a new Literature game:
   * 1. They send 'createGame' with their name
   * 2. We create a room using GameManager
   * 3. We send back the room ID so they can share it
   */
  
  socket.on('createGame', (data: { playerName: string; maxPlayers?: 6 | 8 }) => {
    try {
      const { playerName, maxPlayers = 6 } = data;
      
      if (!playerName || playerName.trim().length === 0) {
        socket.emit('error', { message: 'Player name is required', code: 'INVALID_NAME' });
        return;
      }

      // Use our GameManager to create the room
      const room = gameManager.createGame(socket.id, playerName.trim(), maxPlayers);
      
      // Join the Socket.io room (for broadcasting)
      socket.join(room.roomId);
      
      // Tell the creator their room is ready
      socket.emit('gameCreated', { 
        roomId: room.roomId, 
        room: {
          roomId: room.roomId,
          players: room.players,
          maxPlayers: room.maxPlayers,
          isStarted: room.isStarted
        }
      });

      console.log(`✅ Game created: ${room.roomId} by ${playerName}`);

    } catch (error) {
      console.error('Error creating game:', error);
      socket.emit('error', { message: 'Failed to create game', code: 'CREATE_FAILED' });
    }
  });

  /**
   * EXPLANATION: Join Game Event
   * 
   * When a player wants to join an existing game:
   * 1. They send 'joinGame' with room ID and their name
   * 2. We validate and add them to the room
   * 3. We broadcast to everyone in the room that they joined
   */

  socket.on('joinGame', (data: { roomId: string; playerName: string }) => {
    try {
      const { roomId, playerName } = data;
      
      if (!roomId || !playerName) {
        socket.emit('error', { message: 'Room ID and player name are required', code: 'INVALID_DATA' });
        return;
      }

      // Use GameManager to join the room
      const room = gameManager.joinGame(roomId.toUpperCase(), socket.id, playerName.trim());
      
      if (!room) {
        // Check if it's a duplicate name issue
        const existingRoom = gameManager.getRoom(roomId.toUpperCase());
        if (existingRoom && existingRoom.players.find(p => p.playerName.toLowerCase() === playerName.toLowerCase())) {
          socket.emit('error', { 
            message: `Name "${playerName}" is already taken in this room. Please choose a different name.`, 
            code: 'DUPLICATE_NAME' 
          });
        } else {
          socket.emit('error', { message: 'Could not join game', code: 'JOIN_FAILED' });
        }
        return;
      }

      // Join the Socket.io room
      socket.join(roomId.toUpperCase());

      // Find this player's info to send back
      const thisPlayer = room.players.find(p => p.socketId === socket.id);
      
      // Tell the joiner they successfully joined
      socket.emit('gameJoined', { 
        room: {
          roomId: room.roomId,
          players: room.players,
          maxPlayers: room.maxPlayers,
          isStarted: room.isStarted
        },
        yourPlayerId: thisPlayer?.playerId || ''
      });

      // Broadcast to everyone else in the room
      socket.to(roomId.toUpperCase()).emit('playerJoined', {
        playerName: playerName,
        playerCount: room.players.length
      });

      console.log(`✅ ${playerName} joined ${roomId} (${room.players.length}/${room.maxPlayers})`);

    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('error', { message: 'Failed to join game', code: 'JOIN_ERROR' });
    }
  });

  /**
   * EXPLANATION: Start Game Event
   * 
   * When enough players have joined and someone clicks "Start Game":
   * 1. We initialize the actual Literature game using our game engine
   * 2. We broadcast the initial game state to all players
   */

  socket.on('startGame', () => {
    try {
      const room = gameManager.getRoomBySocketId(socket.id);
      
      if (!room) {
        socket.emit('error', { message: 'You are not in a game room', code: 'NO_ROOM' });
        return;
      }

      if (room.isStarted) {
        socket.emit('error', { message: 'Game is already started', code: 'ALREADY_STARTED' });
        return;
      }

      // Use GameManager to start the game (calls our initializeGame function)
      const gameState = gameManager.startGame(room.roomId);
      
      if (!gameState) {
        socket.emit('error', { message: 'Could not start game', code: 'START_FAILED' });
        return;
      }

      // Broadcast the game start to everyone in the room
      io.to(room.roomId).emit('gameStarted', { gameState });
      
      console.log(`🚀 Game started in room ${room.roomId}`);

    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', { message: 'Failed to start game', code: 'START_ERROR' });
    }
  });

  /**
   * EXPLANATION: Ask Card Event
   * 
   * When a player asks another player for a card:
   * 1. We validate and process the move using our game engine
   * 2. We broadcast the updated game state to all players
   * 3. This is the core Literature gameplay in real-time!
   */

  socket.on('askCard', (move: AskCardMove) => {
    try {
      console.log('\n🎯 ===== ASK CARD MOVE RECEIVED =====');
      console.log('📥 Socket ID:', socket.id);
      console.log('📥 Move received:', JSON.stringify(move, null, 2));
      
      // Get the room and player info for debugging
      const room = gameManager.getRoomBySocketId(socket.id);
      if (!room) {
        console.log('❌ No room found for socket');
        socket.emit('error', { message: 'You are not in a game room', code: 'NO_ROOM' });
        return;
      }
      
      const player = room.players.find(p => p.socketId === socket.id);
      console.log('👤 Player making move:', player?.playerName, '(', player?.playerId, ')');
      console.log('🎮 Room ID:', room.roomId);
      console.log('🎲 Current game state summary:');
      console.log('   - Current player index:', room.gameState.currentPlayerIndex);
      console.log('   - Current player ID:', room.gameState.players[room.gameState.currentPlayerIndex]?.id);
      console.log('   - Players:', room.gameState.players.map(p => `${p.name}(${p.id})`));

      // Use GameManager to process the move (uses validateMove and applyMove)
      const result = gameManager.processMove(socket.id, move);
      
      console.log('✅ Move processing result:', {
        success: result.success,
        error: result.error,
        gameEnded: result.gameEnded
      });
      
      if (!result.success) {
        console.log('❌ Move validation failed:', result.error);
        socket.emit('error', { message: result.error || 'Invalid move', code: 'INVALID_MOVE' });
        return;
      }

      console.log('🎉 Move successful! Broadcasting to room...');
      
      // Broadcast the updated game state to everyone
      io.to(room.roomId).emit('gameUpdate', { 
        gameState: result.gameState,
        lastMove: result.gameState?.lastMove
      });

      // Check if game ended
      if (result.gameEnded && result.gameResults) {
        console.log('🏆 Game ended! Results:', result.gameResults);
        io.to(room.roomId).emit('gameEnded', {
          gameResults: result.gameResults,
          finalState: result.gameState
        });
      }
      
      console.log('===== ASK CARD MOVE COMPLETE =====\n');

    } catch (error) {
      console.error('💥 Error processing ask card move:', error);
      socket.emit('error', { message: 'Failed to process move', code: 'MOVE_ERROR' });
    }
  });

  /**
   * EXPLANATION: Claim Set Event
   * 
   * When a player claims a half-suit using our simplified system:
   * 1. Process using our simplified checkClaim function
   * 2. Broadcast the result to all players
   * 3. Handle game ending if this was the final claim
   */

  socket.on('claimSet', (move: ClaimMove) => {
    try {
      // Use GameManager to process the claim (uses our simplified checkClaim)
      const result = gameManager.processMove(socket.id, move);
      
      if (!result.success) {
        socket.emit('error', { message: result.error || 'Invalid claim', code: 'INVALID_CLAIM' });
        return;
      }

      // Get the room to broadcast to
      const room = gameManager.getRoomBySocketId(socket.id);
      if (!room) return;

      // Broadcast the updated game state to everyone
      io.to(room.roomId).emit('gameUpdate', { 
        gameState: result.gameState 
      });

      // Check if game ended
      if (result.gameEnded && result.gameResults) {
        io.to(room.roomId).emit('gameEnded', {
          gameResults: result.gameResults,
          finalState: result.gameState
        });
        console.log(`🏆 Game in room ${room.roomId} ended: ${result.gameResults.message}`);
      }

    } catch (error) {
      console.error('Error processing claim:', error);
      socket.emit('error', { message: 'Failed to process claim', code: 'CLAIM_ERROR' });
    }
  });

  /**
   * EXPLANATION: Get Game State Event
   * 
   * When a player reconnects or refreshes, they need the current game state.
   * This is useful for handling browser refreshes during a game.
   */

  socket.on('getGameState', () => {
    try {
      const room = gameManager.getRoomBySocketId(socket.id);
      
      if (!room) {
        socket.emit('error', { message: 'You are not in a game room', code: 'NO_ROOM' });
        return;
      }

      if (!room.isStarted) {
        socket.emit('gameJoined', { 
          room: {
            roomId: room.roomId,
            players: room.players,
            maxPlayers: room.maxPlayers,
            isStarted: room.isStarted
          },
          yourPlayerId: room.players.find(p => p.socketId === socket.id)?.playerId || ''
        });
      } else {
        socket.emit('gameUpdate', { gameState: room.gameState });
      }

    } catch (error) {
      console.error('Error getting game state:', error);
      socket.emit('error', { message: 'Failed to get game state', code: 'STATE_ERROR' });
    }
  });

  /**
   * EXPLANATION: Connection Logging
   * 
   * Log when this specific player connects so we can track activity
   */
  
  console.log(`🔌 Socket handlers set up for ${socket.id}`);
}

/**
 * EXPLANATION: Why This Architecture Works
 * 
 * 1. **Event-Driven**: Each game action is a clear event
 * 2. **Real-Time**: All players see changes instantly
 * 3. **Game Engine Integration**: We use our tested functions
 * 4. **Error Handling**: Clear error messages for debugging
 * 5. **Room Isolation**: Games don't interfere with each other
 * 
 * This transforms our Literature game from a single-computer library
 * into a real multiplayer experience!
 */ 