import React from 'react'
import PlayingCard from './PlayingCard'
import { Player } from 'shared'

interface PlayerPositionProps {
  player: Player
  isYou: boolean
  isCurrentPlayer: boolean
  isTeammate: boolean
  onClick?: () => void
  position: string
  showCards?: boolean
}

const PlayerPosition: React.FC<PlayerPositionProps> = ({
  player,
  isYou,
  isCurrentPlayer,
  isTeammate,
  onClick,
  position,
  showCards = true
}) => {
  // Generate a consistent avatar color based on player name
  const getAvatarColor = (name: string) => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
      '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  // Get team color
  const getTeamColor = (team: number) => {
    return team === 0 ? '#3b82f6' : '#ef4444'
  }

  const avatarColor = getAvatarColor(player.name)
  const teamColor = getTeamColor(player.team)

  // Determine card fan direction based on position
  const getCardFanStyle = (index: number, total: number) => {
    const maxSpread = 30 // Maximum angle spread
    const baseSpacing = -8 // Pixel overlap
    
    if (position.includes('top')) {
      return {
        transform: `rotate(${(index - (total - 1) / 2) * (maxSpread / Math.max(total - 1, 1))}deg)`,
        marginLeft: index > 0 ? `${baseSpacing}px` : '0',
        zIndex: total - index
      }
    } else if (position.includes('left')) {
      return {
        transform: `rotate(${90 + (index - (total - 1) / 2) * (maxSpread / Math.max(total - 1, 1))}deg)`,
        marginTop: index > 0 ? `${baseSpacing}px` : '0',
        zIndex: total - index
      }
    } else if (position.includes('right')) {
      return {
        transform: `rotate(${-90 + (index - (total - 1) / 2) * (maxSpread / Math.max(total - 1, 1))}deg)`,
        marginTop: index > 0 ? `${baseSpacing}px` : '0',
        zIndex: total - index
      }
    } else {
      // Bottom position
      return {
        transform: `rotate(${(index - (total - 1) / 2) * (maxSpread / Math.max(total - 1, 1))}deg)`,
        marginLeft: index > 0 ? `${baseSpacing}px` : '0',
        zIndex: index
      }
    }
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: position.includes('top') ? 'column-reverse' : 'column',
    alignItems: 'center',
    gap: '8px',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s ease'
  }

  return (
    <div
      style={containerStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1.05)'
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1)'
        }
      }}
    >
      {/* Player Cards */}
      {showCards && !isYou && player.cardCount > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: position.includes('left') || position.includes('right') ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: '8px'
        }}>
          {Array.from({ length: Math.min(player.cardCount, 6) }).map((_, index) => (
            <div
              key={index}
              style={{
                ...getCardFanStyle(index, Math.min(player.cardCount, 6)),
                position: 'relative'
              }}
            >
              <PlayingCard
                isCardBack={true}
                size="small"
              />
            </div>
          ))}
          
          {/* Card count indicator for large hands */}
          {player.cardCount > 6 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0,0,0,0.9)',
              color: 'white',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '3px 8px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.3)',
              zIndex: 100,
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}>
              {player.cardCount}
            </div>
          )}
        </div>
      )}

      {/* Player Avatar and Info */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px'
      }}>
        {/* Avatar */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${avatarColor} 0%, ${avatarColor}dd 100%)`,
          border: `3px solid ${isCurrentPlayer ? '#ffd700' : teamColor}`,
          boxShadow: isCurrentPlayer 
            ? '0 0 20px rgba(255, 215, 0, 0.6), 0 4px 12px rgba(0,0,0,0.3)'
            : '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          position: 'relative',
          animation: isCurrentPlayer ? 'pulse 2s infinite' : 'none'
        }}>
          {player.name.charAt(0).toUpperCase()}
          
          {/* Team indicator */}
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: teamColor,
            border: '2px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            {player.team}
          </div>

          {/* Online indicator */}
          <div style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#22c55e',
            border: '2px solid white',
            boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)'
          }} />
        </div>

        {/* Player Info */}
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '6px 12px',
          border: `1px solid ${isTeammate ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.2)'}`,
          minWidth: '80px',
          textAlign: 'center'
        }}>
          {/* Player name */}
          <div style={{
            color: isYou ? '#ffd700' : 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '2px',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
          }}>
            {isYou ? `${player.name} (You)` : player.name}
          </div>

          {/* Card count */}
          <div style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}>
            <span>🃏</span>
            <span>{player.cardCount}</span>
          </div>
        </div>

        {/* Status indicators */}
        <div style={{
          display: 'flex',
          gap: '4px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {isCurrentPlayer && (
            <div style={{
              background: 'rgba(255, 215, 0, 0.9)',
              color: '#000',
              fontSize: '9px',
              fontWeight: 'bold',
              padding: '2px 6px',
              borderRadius: '8px',
              textShadow: 'none'
            }}>
              TURN
            </div>
          )}
          
          {isTeammate && !isYou && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.9)',
              color: 'white',
              fontSize: '9px',
              fontWeight: 'bold',
              padding: '2px 6px',
              borderRadius: '8px'
            }}>
              TEAM
            </div>
          )}
          
          {onClick && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              fontSize: '9px',
              fontWeight: 'bold',
              padding: '2px 6px',
              borderRadius: '8px'
            }}>
              ASK
            </div>
          )}
        </div>
      </div>

      {/* Pulse animation for current player */}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.6), 0 4px 12px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 0 6px 16px rgba(0,0,0,0.4); }
        }
      `}</style>
    </div>
  )
}

export default PlayerPosition 