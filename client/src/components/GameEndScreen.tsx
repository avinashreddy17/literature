// Game End Screen - Shows final results
import { GameState } from 'shared'

/**
 * EXPLANATION: Game End Screen Component
 * 
 * This screen shows when a Literature game finishes. It displays:
 * - Final scores and winner
 * - Detailed breakdown of claimed sets
 * - Option to play again
 * 
 * This is a placeholder for now - we'll enhance it later.
 */

interface GameResults {
  isGameOver: boolean
  team0Score: number
  team1Score: number
  winner: number | null
  message: string
  totalSets: number
}

interface GameEndScreenProps {
  gameResults: GameResults
  finalGameState: GameState
  yourPlayerId: string
  onPlayAgain: () => void
}

function GameEndScreen({ 
  gameResults, 
  finalGameState, 
  yourPlayerId, 
  onPlayAgain 
}: GameEndScreenProps) {
  const yourTeam = finalGameState.players.find(p => p.id === yourPlayerId)?.team
  const didYouWin = gameResults.winner === yourTeam

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: didYouWin 
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
          {didYouWin ? '🎉' : '😢'} Game Over!
        </h1>
        <h2 style={{ marginBottom: '2rem', color: didYouWin ? '#10b981' : '#ef4444' }}>
          {gameResults.message}
        </h2>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {gameResults.team0Score}
              </div>
              <div>Team 0</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {gameResults.team1Score}
              </div>
              <div>Team 1</div>
            </div>
          </div>
        </div>

        <button
          onClick={onPlayAgain}
          style={{
            padding: '1rem 2rem',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}
        >
          🎮 Play Again
        </button>
      </div>
    </div>
  )
}

export default GameEndScreen 