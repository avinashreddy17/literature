// Welcome Screen - Entry point for Literature Game
import { useState } from 'react'
import './WelcomeScreen.css'

/**
 * EXPLANATION: Welcome Screen Component
 * 
 * This is the first screen players see. They can:
 * 1. Enter their player name
 * 2. Create a new game room (and get a shareable room ID)
 * 3. Join an existing game room using a room ID
 * 
 * The design is clean and modern with a Literature theme.
 */

interface WelcomeScreenProps {
  onCreateGame: (playerName: string, maxPlayers: 6 | 8) => void
  onJoinGame: (roomId: string, playerName: string) => void
  isLoading: boolean
  error: string
  isConnected: boolean
}

function WelcomeScreen({ 
  onCreateGame, 
  onJoinGame, 
  isLoading, 
  error, 
  isConnected 
}: WelcomeScreenProps) {
  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [maxPlayers, setMaxPlayers] = useState<6 | 8>(6)
  const [mode, setMode] = useState<'create' | 'join'>('create')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!playerName.trim()) {
      return
    }

    if (mode === 'create') {
      onCreateGame(playerName.trim(), maxPlayers)
    } else {
      if (!roomId.trim()) {
        return
      }
      onJoinGame(roomId.trim(), playerName.trim())
    }
  }

  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        {/* Header */}
        <div className="welcome-header">
          <h1 className="game-title">🎮 Literature</h1>
          <p className="game-subtitle">Real-time multiplayer card game</p>
          <div className="connection-status">
            {isConnected ? (
              <span className="status-connected">🟢 Connected to server</span>
            ) : (
              <span className="status-disconnected">🔴 Not connected</span>
            )}
          </div>
        </div>

        {/* Main Form */}
        <div className="welcome-form-container">
          <form onSubmit={handleSubmit} className="welcome-form">
            {/* Player Name Input */}
            <div className="form-group">
              <label htmlFor="playerName">Your Name</label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your player name"
                maxLength={20}
                disabled={isLoading || !isConnected}
                required
              />
            </div>

            {/* Mode Selection */}
            <div className="form-group">
              <div className="mode-tabs">
                <button
                  type="button"
                  className={`mode-tab ${mode === 'create' ? 'active' : ''}`}
                  onClick={() => setMode('create')}
                  disabled={isLoading}
                >
                  🆕 Create Game
                </button>
                <button
                  type="button"
                  className={`mode-tab ${mode === 'join' ? 'active' : ''}`}
                  onClick={() => setMode('join')}
                  disabled={isLoading}
                >
                  🚪 Join Game
                </button>
              </div>
            </div>

            {/* Create Game Options */}
            {mode === 'create' && (
              <div className="form-group">
                <label>Number of Players</label>
                <div className="player-count-options">
                  <button
                    type="button"
                    className={`player-count-btn ${maxPlayers === 6 ? 'active' : ''}`}
                    onClick={() => setMaxPlayers(6)}
                    disabled={isLoading}
                  >
                    6 Players
                  </button>
                  <button
                    type="button"
                    className={`player-count-btn ${maxPlayers === 8 ? 'active' : ''}`}
                    onClick={() => setMaxPlayers(8)}
                    disabled={isLoading}
                  >
                    8 Players
                  </button>
                </div>
              </div>
            )}

            {/* Join Game Room ID */}
            {mode === 'join' && (
              <div className="form-group">
                <label htmlFor="roomId">Room ID</label>
                <input
                  id="roomId"
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="Enter room ID (e.g. ABC123)"
                  maxLength={6}
                  disabled={isLoading || !isConnected}
                  required
                />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading || !isConnected || !playerName.trim() || (mode === 'join' && !roomId.trim())}
            >
              {isLoading ? (
                <>🔄 {mode === 'create' ? 'Creating...' : 'Joining...'}</>
              ) : (
                <>{mode === 'create' ? '🎮 Create Game' : '🚪 Join Game'}</>
              )}
            </button>
          </form>
        </div>

        {/* Game Rules Summary */}
        <div className="game-rules">
          <h3>📋 Quick Rules</h3>
          <ul>
            <li>🎯 <strong>Goal:</strong> Claim half-suits by having all 6 cards</li>
            <li>❓ <strong>Ask:</strong> Request specific cards from opponents</li>
            <li>🏆 <strong>Claim:</strong> When your team has all cards in a half-suit</li>
            <li>⚡ <strong>Fast-paced:</strong> Wrong claims give points to opponents!</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="welcome-footer">
          <p>🚀 Powered by Literature Game Engine v1.8</p>
          <p>💡 Need 6-8 players to start a game</p>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen 