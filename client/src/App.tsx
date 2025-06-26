// Main App component for Literature Game
import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { GameState } from 'shared'

// Import our components (we'll create these next)
import WelcomeScreen from './components/WelcomeScreen'
import GameLobby from './components/GameLobby'
import GameBoard from './components/GameBoard'
import GameEndScreen from './components/GameEndScreen'

/**
 * EXPLANATION: Main App State Management
 * 
 * Our app has several distinct states:
 * 1. WELCOME - Player enters name, creates/joins game
 * 2. LOBBY - Waiting for players, can start game
 * 3. PLAYING - Active Literature game
 * 4. FINISHED - Game over, show results
 * 
 * We'll use React state to manage the current screen and Socket.io
 * to communicate with our Literature game server.
 */

// Define our app's possible states
type AppState = 'welcome' | 'lobby' | 'playing' | 'finished'

// Interface for room information
interface RoomInfo {
  roomId: string
  players: Array<{
    socketId: string
    playerId: string
    playerName: string
    isConnected: boolean
  }>
  maxPlayers: number
  isStarted: boolean
}

// Interface for game results
interface GameResults {
  isGameOver: boolean
  team0Score: number
  team1Score: number
  winner: number | null
  message: string
  totalSets: number
}

function App() {
  // Main app state
  const [appState, setAppState] = useState<AppState>('welcome')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  // Player info
  const [playerName, setPlayerName] = useState('')
  const [yourPlayerId, setYourPlayerId] = useState('')
  
  // Room/Game state
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [gameResults, setGameResults] = useState<GameResults | null>(null)
  
  // UI state
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  /**
   * EXPLANATION: Socket.io Connection Setup
   * 
   * We'll connect to our Literature game server and set up all the
   * event handlers for real-time multiplayer communication.
   */
  
  useEffect(() => {
    // Connect to our Literature game server
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:3001';

    const newSocket = io(serverUrl);
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🎮 Connected to Literature game server!')
      setIsConnected(true)
      setError('')
    })

    newSocket.on('disconnect', (reason) => {
      console.log('👋 Disconnected from server:', reason)
      setIsConnected(false)
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        newSocket.connect()
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error)
      setError('Could not connect to game server. Make sure the server is running.')
      setIsConnected(false)
    })

    // Game event handlers
    setupGameEventHandlers(newSocket)

    // Cleanup on component unmount
    return () => {
      newSocket.close()
    }
  }, [])

  /**
   * EXPLANATION: Game Event Handlers
   * 
   * These handle all the real-time events from our Literature game server:
   * - Room creation and joining
   * - Game start and updates
   * - Player movements and game ending
   */
  
  const setupGameEventHandlers = (socket: Socket) => {
    // Room creation success
    socket.on('gameCreated', (data: { roomId: string; room: RoomInfo }) => {
      console.log('🎮 Game room created:', data.roomId)
      setRoomInfo(data.room)
      setAppState('lobby')
      setIsLoading(false)
      setError('')
    })

    // Successfully joined a room
    socket.on('gameJoined', (data: { room: RoomInfo; yourPlayerId: string }) => {
      console.log('👋 Joined game room:', data.room.roomId)
      setRoomInfo(data.room)
      setYourPlayerId(data.yourPlayerId)
      setAppState('lobby')
      setIsLoading(false)
      setError('')
    })

    // Game started - begin playing!
    socket.on('gameStarted', (data: { gameState: GameState }) => {
      console.log('🚀 Game started!')
      setGameState(data.gameState)
      setAppState('playing')
      setIsLoading(false)
    })

    // Game state update (moves, claims, etc.)
    socket.on('gameUpdate', (data: { gameState: GameState }) => {
      console.log('🔄 Game state updated')
      setGameState(data.gameState)
    })

    // Game ended
    socket.on('gameEnded', (data: { gameResults: GameResults; finalState: GameState }) => {
      console.log('🏆 Game ended!', data.gameResults)
      setGameState(data.finalState)
      setGameResults(data.gameResults)
      setAppState('finished')
    })

    // Another player joined the room
    socket.on('playerJoined', (data: { playerName: string; playerCount: number }) => {
      console.log(`👋 ${data.playerName} joined (${data.playerCount} players)`)
      // Request updated room info
      socket.emit('getGameState')
    })

    // Player left the room
    socket.on('playerLeft', (data: { playerName: string; playerCount: number }) => {
      console.log(`👋 ${data.playerName} left (${data.playerCount} players)`)
      socket.emit('getGameState')
    })

    // Error handling
    socket.on('error', (data: { message: string; code?: string }) => {
      console.error('❌ Game error:', data.message)
      setError(data.message)
      setIsLoading(false)
    })
  }

  /**
   * EXPLANATION: Game Actions
   * 
   * These functions handle player actions and send them to the server:
   * - Creating and joining games
   * - Starting games
   * - Making moves and claims
   */

  const createGame = (playerName: string, maxPlayers: 6 | 8 = 6) => {
    if (!socket || !isConnected) {
      setError('Not connected to server')
      return
    }

    setIsLoading(true)
    setPlayerName(playerName)
    setError('')
    
    socket.emit('createGame', { playerName, maxPlayers })
  }

  const joinGame = (roomId: string, playerName: string) => {
    if (!socket || !isConnected) {
      setError('Not connected to server')
      return
    }

    setIsLoading(true)
    setPlayerName(playerName)
    setError('')
    
    socket.emit('joinGame', { roomId: roomId.toUpperCase(), playerName })
  }

  const startGame = () => {
    if (!socket || !isConnected) {
      setError('Not connected to server')
      return
    }

    setIsLoading(true)
    socket.emit('startGame')
  }

  const makeMove = (move: any) => {
    if (!socket || !isConnected) {
      setError('Not connected to server')
      return
    }

    if (move.type === 'ask') {
      socket.emit('askCard', move)
    } else if (move.type === 'claim') {
      socket.emit('claimSet', move)
    }
  }

  const resetGame = () => {
    setAppState('welcome')
    setRoomInfo(null)
    setGameState(null)
    setGameResults(null)
    setPlayerName('')
    setYourPlayerId('')
    setError('')
  }

  /**
   * EXPLANATION: Render Logic
   * 
   * Based on the current app state, we render different components:
   * - WelcomeScreen: Enter name, create/join game
   * - GameLobby: Wait for players, start game
   * - GameBoard: Active Literature gameplay
   * - GameEndScreen: Show final results
   */

  // Show connection status
  if (!isConnected && !error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: 'white'
      }}>
        🔌 Connecting to Literature game server...
      </div>
    )
  }

  // Render appropriate screen based on app state
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {appState === 'welcome' && (
        <WelcomeScreen
          onCreateGame={createGame}
          onJoinGame={joinGame}
          isLoading={isLoading}
          error={error}
          isConnected={isConnected}
        />
      )}

      {appState === 'lobby' && roomInfo && (
        <GameLobby
          roomInfo={roomInfo}
          playerName={playerName}
          onStartGame={startGame}
          onLeaveGame={resetGame}
          isLoading={isLoading}
          error={error}
        />
      )}

      {appState === 'playing' && gameState && (
        <GameBoard
          gameState={gameState}
          yourPlayerId={yourPlayerId}
          playerName={playerName}
          onMakeMove={makeMove}
          error={error}
        />
      )}

      {appState === 'finished' && gameResults && gameState && (
        <GameEndScreen
          gameResults={gameResults}
          finalGameState={gameState}
          yourPlayerId={yourPlayerId}
          onPlayAgain={resetGame}
        />
      )}
    </div>
  )
}

export default App 