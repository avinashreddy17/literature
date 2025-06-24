import React from 'react'
import { GameState, Card } from 'shared'

interface GameTableProps {
  gameState: GameState
  yourPlayerId: string
  onPlayerClick?: (playerId: string) => void
  onAskCard?: () => void
  onClaimSet?: () => void
}

const GameTable: React.FC<GameTableProps> = ({ 
  gameState, 
  yourPlayerId, 
  onPlayerClick,
  onAskCard,
  onClaimSet
}) => {
  const currentPlayerIndex = gameState.currentPlayerIndex
  const currentPlayer = gameState.players[currentPlayerIndex]
  const isYourTurn = currentPlayer?.id === yourPlayerId
  const yourPlayer = gameState.players.find(p => p.id === yourPlayerId)
  const yourTeam = yourPlayer?.team

  // Helper function to check if card is high (9-A) or low (2-7)
  const isHighCard = (rank: string) => {
    return ['9', '10', 'J', 'Q', 'K', 'A'].includes(rank)
  }

  // Helper function to get suit symbol
  const getSuitSymbol = (suit: string) => {
    switch(suit) {
      case 'hearts': return '♥'
      case 'diamonds': return '♦'
      case 'clubs': return '♣'
      case 'spades': return '♠'
      default: return '?'
    }
  }

  // Helper function to get card color
  const getCardColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? '#dc2626' : '#000'
  }

  // Group your cards by suit
  const groupYourCardsBySuit = (cards: Card[]) => {
    const suits: { 
      [key in Suit]: { low: Card[], high: Card[] } 
    } = {
      hearts: { low: [], high: [] },
      diamonds: { low: [], high: [] },
      clubs: { low: [], high: [] },
      spades: { low: [], high: [] },
    }
    
    cards.forEach(card => {
      if (isHighCard(card.rank)) {
        suits[card.suit].high.push(card)
      } else {
        suits[card.suit].low.push(card)
      }
    })
    
    // Sort cards within each group
    const rankOrder = ['2', '3', '4', '5', '6', '7', '9', '10', 'J', 'Q', 'K', 'A']
    Object.values(suits).forEach(suitGroup => {
      suitGroup.low.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))
      suitGroup.high.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))
    })
    
    return suits
  }

  // Calculate player positions around the table
  const calculatePlayerPositions = (playerCount: number, yourIndex: number) => {
    const positions = []
    const angleStep = (2 * Math.PI) / playerCount
    
    for (let i = 0; i < playerCount; i++) {
      // Skip yourself - you're not shown as a player around the table
      if (i === yourIndex) continue
      
      // Rotate so you're always at the bottom, others distributed around
      const adjustedIndex = i < yourIndex ? i : i - 1 // Adjust for skipping yourself
      const totalOthers = playerCount - 1
      const angle = (adjustedIndex * (2 * Math.PI)) / totalOthers - Math.PI / 2 // Start from top
      
      // For oval table
      const radiusX = 35 // Percentage of container width
      const radiusY = 25 // Percentage of container height
      const x = 50 + (radiusX * Math.cos(angle))
      const y = 50 + (radiusY * Math.sin(angle))
      
      positions.push({
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(10, Math.min(90, y)),
        angle: angle,
        playerIndex: i
      })
    }
    
    return positions
  }

  const yourIndex = gameState.players.findIndex(p => p.id === yourPlayerId)
  const playerPositions = calculatePlayerPositions(gameState.players.length, yourIndex)
  const yourCards = yourPlayer?.hand || []
  const cardsBySuit = groupYourCardsBySuit(yourCards)

  // Simple card component
  const PlayingCard = ({ card, size = 'small', isBack = false }: { 
    card?: Card, 
    size?: 'small' | 'medium', 
    isBack?: boolean 
  }) => {
    const cardStyle: React.CSSProperties = {
      width: size === 'small' ? '30px' : '60px',
      height: size === 'small' ? '42px' : '84px',
      background: isBack ? 'linear-gradient(145deg, #1e40af, #3b82f6)' : '#fff',
      border: '1px solid #ccc',
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: size === 'small' ? '8px' : '14px',
      color: card ? getCardColor(card.suit) : '#fff',
      fontWeight: 'bold',
      padding: '2px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      position: 'relative' // Needed for pseudo-elements
    }

    if (isBack) {
      return (
        <div style={cardStyle}>
          <div style={{ fontSize: size === 'small' ? '12px' : '20px', color: '#fff' }}>
            🂠
          </div>
        </div>
      )
    }

    return (
      <div style={cardStyle}>
        <div>{card?.rank}</div>
        <div>{card ? getSuitSymbol(card.suit) : ''}</div>
        <div>{card?.rank}</div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(145deg, #0a5d2c, #0f7534, #0a5d2c)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Turn Indicator - Top Center */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20
      }}>
        {isYourTurn ? (
          <div style={{
            background: 'rgba(34, 197, 94, 0.9)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: 'bold',
            animation: 'pulse 2s infinite',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
            textAlign: 'center'
          }}>
            🎯 YOUR TURN
          </div>
        ) : (
          <div style={{
            background: 'rgba(107, 114, 128, 0.9)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {currentPlayer?.name}'s Turn
          </div>
        )}
      </div>

      {/* Oval Table */}
      <div style={{
        position: 'absolute',
        top: '48%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80vw',
        height: '60vh',
        maxWidth: '900px',
        maxHeight: '500px',
        background: 'linear-gradient(145deg, #0f7534, #0a5d2c)',
        borderRadius: '50%',
        border: '6px solid #d4af37',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.4)',
        zIndex: 1
      }}>
        {/* Felt texture */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.02) 1px, transparent 1px),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px, 40px 40px',
          borderRadius: '50%'
        }} />

        {/* Center content - Last Move */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          zIndex: 5
        }}>
          {/* Last Move Display */}
          {gameState.lastMove && (
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div>
                {gameState.lastMove.successful 
                  ? `${gameState.lastMove.fromPlayer} got card from ${gameState.lastMove.toPlayer}`
                  : `${gameState.lastMove.fromPlayer} asked ${gameState.lastMove.toPlayer} (miss)`
                }
              </div>
              <PlayingCard card={gameState.lastMove.card} size="small" />
            </div>
          )}
        </div>
      </div>

      {/* Score Display - Top Right */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '15px',
        fontSize: '16px',
        fontWeight: 'bold',
        zIndex: 20,
        minWidth: '180px'
      }}>
        <div style={{ marginBottom: '8px', fontSize: '18px', textAlign: 'center' }}>
          📊 SCORE
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ color: '#3b82f6' }}>Team Blue:</span>
          <span>{gameState.claimedSets.filter(s => s.team === 0).length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#dc2626' }}>Team Red:</span>
          <span>{gameState.claimedSets.filter(s => s.team === 1).length}</span>
        </div>
        <div style={{ 
          borderTop: '1px solid rgba(255,255,255,0.3)', 
          marginTop: '8px', 
          paddingTop: '8px',
          fontSize: '14px',
          textAlign: 'center',
          opacity: 0.8
        }}>
          {gameState.claimedSets.length}/8 Sets Claimed
        </div>
      </div>

      {/* Claimed Sets Display - Below Score */}
      {gameState.claimedSets.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '140px',
          right: '20px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '15px',
          borderRadius: '15px',
          fontSize: '14px',
          zIndex: 20,
          maxWidth: '200px',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
            🏆 CLAIMED SETS
          </div>
          {gameState.claimedSets.map((set, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '6px',
              padding: '4px',
              borderRadius: '6px',
              background: set.team === 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(220, 38, 38, 0.2)'
            }}>
              <span style={{ fontSize: '16px', color: getCardColor(set.suit) }}>
                {getSuitSymbol(set.suit)}
              </span>
              <span style={{ fontSize: '12px' }}>
                {set.suit.toUpperCase()} {set.isHigh ? 'HIGH' : 'LOW'}
              </span>
              <span style={{ 
                fontSize: '10px', 
                color: set.team === 0 ? '#3b82f6' : '#dc2626',
                fontWeight: 'bold'
              }}>
                T{set.team}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Players around the table */}
      {playerPositions.map((position, index) => {
        const player = gameState.players[position.playerIndex]
        const isCurrentPlayer = player.id === currentPlayer?.id
        const isTeammate = player.team === yourTeam
        const canAsk = player.team !== yourTeam && player.cardCount > 0 && isYourTurn

        return (
          <div
            key={player.id}
            style={{
              position: 'absolute',
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
          >
            {/* Player info */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              {/* Player name and card count */}
              <div style={{
                background: player.team === 0 ? '#1e40af' : '#dc2626',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                border: isCurrentPlayer ? '2px solid #fbbf24' : '2px solid transparent',
                animation: isCurrentPlayer ? 'pulse 2s infinite' : 'none'
              }}>
                <div>{player.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  {player.cardCount} cards
                </div>
              </div>

              {/* Player cards (1-2 cards for others) */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <PlayingCard isBack={true} size="small" />
                {player.cardCount > 1 && <PlayingCard isBack={true} size="small" />}
              </div>

              {/* Ask button for opponents */}
              {canAsk && onPlayerClick && (
                <button
                  onClick={() => onPlayerClick(player.id)}
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  ASK
                </button>
              )}
            </div>
          </div>
        )
      })}

      {/* Your cards organized by suit - Bottom horizontal layout */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        background: 'rgba(0,0,0,0.9)',
        padding: '10px 20px',
        zIndex: 20,
        borderTop: '3px solid #d4af37'
      }}>
        {/* Player name */}
        <div style={{
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '10px',
          background: yourTeam === 0 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(220, 38, 38, 0.3)',
          padding: '5px 15px',
          borderRadius: '20px',
          display: 'inline-block'
        }}>
          {yourPlayer?.name} (You) - Team {yourTeam === 0 ? 'Blue' : 'Red'}
        </div>

        {/* Main container for cards and buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px'
        }}>
          {/* Cards Area - Horizontally scrollable */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexGrow: 1,
            overflowX: 'auto',
            padding: '10px'
          }}>
            {Object.entries(cardsBySuit).map(([suit, suitGroups]) => {
              const suitCardsLow = suitGroups.low;
              const suitCardsHigh = suitGroups.high;
              if (suitCardsLow.length === 0 && suitCardsHigh.length === 0) return null;

              return (
                <React.Fragment key={suit}>
                  {/* Suit Label */}
                  <div style={{
                    color: getCardColor(suit as Suit) === '#000' ? '#000' : '#fff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: getCardColor(suit as Suit) === '#000' ? 'rgba(255,255,255,0.9)' : 'transparent',
                    padding: getCardColor(suit as Suit) === '#000' ? '2px 8px' : '0',
                    borderRadius: '12px',
                    marginLeft: '15px'
                  }}>
                    <span style={{ fontSize: '20px' }}>{getSuitSymbol(suit as Suit)}</span>
                    <span>{suit.toUpperCase()}</span>
                    <span style={{ fontSize: '12px', opacity: 0.8 }}>({suitCardsLow.length + suitCardsHigh.length})</span>
                  </div>

                  {/* Low Cards */}
                  {suitCardsLow.length > 0 && (
                    <>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', marginLeft: '10px' }}>LOW</div>
                      {suitCardsLow.map((card, index) => (
                        <PlayingCard key={`${suit}-low-${index}`} card={card} size="medium" />
                      ))}
                    </>
                  )}

                  {/* High Cards */}
                  {suitCardsHigh.length > 0 && (
                    <>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', marginLeft: '10px' }}>HIGH</div>
                      {suitCardsHigh.map((card, index) => (
                        <PlayingCard key={`${suit}-high-${index}`} card={card} size="medium" />
                      ))}
                    </>
                  )}
                </React.Fragment>
              )
            })}
          </div>

          {/* Action buttons */}
          {isYourTurn && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <button
                onClick={onAskCard}
                style={{
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}
              >
                ⭐ Ask Card
              </button>
              <button
                onClick={onClaimSet}
                style={{
                  background: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}
              >
                🏆 Claim Set
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pulsing animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
    </div>
  )
}

export default GameTable 