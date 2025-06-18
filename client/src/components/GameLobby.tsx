// Game Lobby - Waiting room before Literature game starts
import { useState } from 'react'

/**
 * EXPLANATION: Game Lobby Component
 * 
 * This screen shows after players create or join a game room.
 * Players can see who's in the room, share the room ID, and start the game
 * when enough players have joined.
 * 
 * For now, this is a placeholder - we'll build the full UI later.
 */

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

interface GameLobbyProps {
  roomInfo: RoomInfo
  playerName: string
  onStartGame: () => void
  onLeaveGame: () => void
  isLoading: boolean
  error: string
}

function GameLobby({ 
  roomInfo, 
  playerName, 
  onStartGame, 
  onLeaveGame, 
  isLoading, 
  error 
}: GameLobbyProps) {
  const [showRoomId, setShowRoomId] = useState(false)

  const canStartGame = roomInfo.players.length >= 6

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '1rem', color: '#374151' }}>
          🎮 Game Lobby
        </h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            Room ID: <strong>{roomInfo.roomId}</strong>
          </p>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(roomInfo.roomId)
              setShowRoomId(true)
              setTimeout(() => setShowRoomId(false), 2000)
            }}
            style={{
              padding: '0.5rem 1rem',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            📋 Copy Room ID
          </button>
          {showRoomId && (
            <p style={{ color: '#10b981', marginTop: '0.5rem' }}>
              ✅ Room ID copied to clipboard!
            </p>
          )}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>
            Players ({roomInfo.players.length}/{roomInfo.maxPlayers})
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.5rem'
          }}>
            {roomInfo.players.map((player, index) => (
              <div 
                key={player.socketId}
                style={{
                  padding: '0.75rem',
                  background: player.playerName === playerName ? '#dbeafe' : '#f3f4f6',
                  borderRadius: '8px',
                  border: player.playerName === playerName ? '2px solid #6366f1' : 'none'
                }}
              >
                {player.isConnected ? '🟢' : '🔴'} {player.playerName}
                {player.playerName === playerName && <div style={{fontSize: '0.8rem', color: '#6366f1'}}>You</div>}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '1rem'
          }}>
            ❌ {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={onLeaveGame}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🚪 Leave Game
          </button>
          
          <button
            onClick={onStartGame}
            disabled={!canStartGame || isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              background: canStartGame ? '#10b981' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: canStartGame ? 'pointer' : 'not-allowed',
              fontWeight: '600'
            }}
          >
            {isLoading ? '🔄 Starting...' : '🚀 Start Game'}
          </button>
        </div>

        {!canStartGame && (
          <p style={{ 
            marginTop: '1rem', 
            color: '#6b7280',
            fontSize: '0.9rem'
          }}>
            💡 Need at least 6 players to start the game
          </p>
        )}
      </div>
    </div>
  )
}

export default GameLobby 