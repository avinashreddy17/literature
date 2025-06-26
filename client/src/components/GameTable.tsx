import React, { useState, useEffect } from 'react'
import { GameState, Card, Suit } from 'shared'
import './CardAnimations.css'
import './MobileOptimizations.css'

interface GameTableProps {
  gameState: GameState
  yourPlayerId: string
  onPlayerClick?: (playerId: string) => void
  onAskCard?: () => void
  onClaimSet?: () => void
}

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return isMobile
}

const GameTable: React.FC<GameTableProps> = ({ 
  gameState, 
  yourPlayerId, 
  onPlayerClick,
  onAskCard,
  onClaimSet
}) => {
  const isMobile = useIsMobile()
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

  // Calculate player positions - different for mobile vs desktop
  const calculatePlayerPositions = (playerCount: number, yourIndex: number) => {
    const positions = []
    
    if (isMobile) {
      // Mobile: Linear arrangement with you at bottom
      for (let i = 0; i < playerCount; i++) {
        if (i === yourIndex) continue // Skip yourself
        
        const adjustedIndex = i < yourIndex ? i : i - 1
        const totalOthers = playerCount - 1
        
        // Arrange others in a vertical stack on the left side
        const y = 15 + (adjustedIndex * (70 / totalOthers))
        
        positions.push({
          x: 5, // Left side for mobile
          y: Math.max(10, Math.min(85, y)),
          angle: 0,
          playerIndex: i
        })
      }
    } else {
      // Desktop: Oval arrangement
      const angleStep = (2 * Math.PI) / playerCount
      
      for (let i = 0; i < playerCount; i++) {
        if (i === yourIndex) continue
        
        const adjustedIndex = i < yourIndex ? i : i - 1
        const totalOthers = playerCount - 1
        const angle = (adjustedIndex * (2 * Math.PI)) / totalOthers - Math.PI / 2
        
        const radiusX = 35
        const radiusY = 25
        const x = 50 + (radiusX * Math.cos(angle))
        const y = 50 + (radiusY * Math.sin(angle))
        
        positions.push({
          x: Math.max(5, Math.min(95, x)),
          y: Math.max(10, Math.min(90, y)),
          angle: angle,
          playerIndex: i
        })
      }
    }
    
    return positions
  }

  const yourIndex = gameState.players.findIndex(p => p.id === yourPlayerId)
  const playerPositions = calculatePlayerPositions(gameState.players.length, yourIndex)
  const yourCards = yourPlayer?.hand || []
  const cardsBySuit = groupYourCardsBySuit(yourCards)

  // Enhanced card component with mobile-optimized sizing
  const PlayingCard = ({ card, size = 'small', isBack = false, glowEffect = false, pulsing = false }: { 
    card?: Card, 
    size?: 'small' | 'medium' | 'large', 
    isBack?: boolean,
    glowEffect?: boolean,
    pulsing?: boolean
  }) => {
    const getAnimationCSS = () => {
      let animations = []
      if (pulsing) animations.push('cardPulse 2s infinite')
      if (glowEffect) animations.push('cardGlow 1.5s ease-in-out infinite alternate')
      return animations.join(', ')
    }

    // Mobile-responsive card sizes
    const getCardSize = () => {
      if (isMobile) {
        return {
          small: { width: '25px', height: '35px', fontSize: '8px' },
          medium: { width: '50px', height: '70px', fontSize: '12px' },
          large: { width: '65px', height: '91px', fontSize: '14px' }
        }[size]
      } else {
        return {
          small: { width: '30px', height: '42px', fontSize: '8px' },
          medium: { width: '60px', height: '84px', fontSize: '14px' },
          large: { width: '80px', height: '112px', fontSize: '16px' }
        }[size]
      }
    }

    const cardSize = getCardSize()

    const cardStyle: React.CSSProperties = {
      ...cardSize,
      background: isBack ? 'linear-gradient(145deg, #1e40af, #3b82f6)' : '#fff',
      border: glowEffect ? '2px solid #06d6a0' : '1px solid #ccc',
      borderRadius: isMobile ? '3px' : '4px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'space-between',
      color: card ? getCardColor(card.suit) : '#fff',
      fontWeight: 'bold',
      padding: isMobile ? '1px' : '2px',
      boxShadow: glowEffect 
        ? '0 6px 20px rgba(6, 214, 160, 0.4), 0 3px 10px rgba(0, 0, 0, 0.2)'
        : '0 2px 4px rgba(0,0,0,0.2)',
      position: 'relative',
      animation: getAnimationCSS(),
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }

    if (isBack) {
      return (
        <div style={cardStyle}>
          <div style={{ fontSize: cardSize.fontSize, color: '#fff' }}>
            🂠
          </div>
        </div>
      )
    }

    return (
      <div style={cardStyle}>
        <div style={{ fontSize: cardSize.fontSize }}>{card?.rank}</div>
        <div style={{ fontSize: cardSize.fontSize }}>{card ? getSuitSymbol(card.suit) : ''}</div>
        <div style={{ fontSize: cardSize.fontSize }}>{card?.rank}</div>
      </div>
    )
  }

  // Mobile-specific layout
  if (isMobile) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(145deg, #0a5d2c, #0f7534, #0a5d2c)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Mobile Header - Game Info */}
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 30
        }}>
          <div>
            <strong>Team {yourTeam === 0 ? 'Blue' : 'Red'}</strong>
          </div>
          <div style={{
            background: isYourTurn ? '#22c55e' : 'rgba(255,255,255,0.2)',
            padding: '5px 12px',
            borderRadius: '15px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {isYourTurn ? '🎯 YOUR TURN' : `${currentPlayer?.name}'s Turn`}
          </div>
          <div>
            Score: {gameState.claimedSets.filter(set => set.team === yourTeam).length}/8
          </div>
        </div>

        {/* Mobile Game Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          position: 'relative'
        }}>
          {/* Left Side - Other Players */}
          <div style={{
            width: '35%',
            padding: '10px 5px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: 'rgba(0,0,0,0.1)'
          }}>
            {playerPositions.map((pos, index) => {
              const player = gameState.players[pos.playerIndex]
              const isCurrentPlayer = player.id === currentPlayer?.id
              const canAsk = player.team !== yourTeam && player.cardCount > 0 && isYourTurn

              return (
                <div key={player.id} style={{
                  background: player.team === 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(220, 38, 38, 0.8)',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: isCurrentPlayer ? '2px solid #fbbf24' : '2px solid transparent',
                  cursor: canAsk ? 'pointer' : 'default',
                  opacity: canAsk ? 1 : 0.7
                }} onClick={() => canAsk && onPlayerClick && onPlayerClick(player.id)}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {player.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{player.cardCount} cards</span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <PlayingCard isBack={true} size="small" pulsing={isCurrentPlayer} />
                      {player.cardCount > 1 && (
                        <PlayingCard isBack={true} size="small" />
                      )}
                    </div>
                  </div>
                  {canAsk && (
                    <div style={{
                      marginTop: '4px',
                      background: '#dc2626',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      TAP TO ASK
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right Side - Game Center */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10px',
            textAlign: 'center'
          }}>
            {/* Game Stats */}
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px',
              minWidth: '150px'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>🎮 Literature</h3>
              <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                Team Blue: {gameState.claimedSets.filter(set => set.team === 0).length}
              </div>
              <div style={{ fontSize: '14px', marginBottom: '10px' }}>
                Team Red: {gameState.claimedSets.filter(set => set.team === 1).length}
              </div>
            </div>

            {/* Mobile Last Move Display - Prominent */}
            {gameState.lastMove && (
              <div style={{
                background: gameState.lastMove.successful 
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(34, 197, 94, 0.15))' 
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(239, 68, 68, 0.15))',
                color: 'white',
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '15px',
                border: gameState.lastMove.successful 
                  ? '2px solid rgba(34, 197, 94, 0.4)'
                  : '2px solid rgba(239, 68, 68, 0.4)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '6px',
                  fontSize: '14px',
                  color: gameState.lastMove.successful ? '#22c55e' : '#ef4444'
                }}>
                  {gameState.lastMove.successful ? '✅ SUCCESS' : '❌ FAILED'}
                </div>
                <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                  <strong>{gameState.lastMove.fromPlayer}</strong> asked{' '}
                  <strong>{gameState.lastMove.toPlayer}</strong> for:
                </div>
                <div style={{ 
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: getCardColor(gameState.lastMove.card.suit),
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}>
                  {gameState.lastMove.card.rank}{getSuitSymbol(gameState.lastMove.card.suit)}
                </div>
                {gameState.lastMove.successful && (
                  <div style={{ 
                    fontSize: '10px', 
                    marginTop: '4px',
                    opacity: 0.8,
                    fontStyle: 'italic'
                  }}>
                    Card transferred!
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons - Mobile optimized */}
            {isYourTurn && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                width: '100%',
                maxWidth: '200px'
              }}>
                <button
                  onClick={onAskCard}
                  style={{
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    padding: '15px 20px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    minHeight: '48px' // Touch-friendly
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
                    padding: '15px 20px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    minHeight: '48px' // Touch-friendly
                  }}
                >
                  🏆 Claim Set
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom - Your Cards */}
        <div style={{
          background: 'rgba(0,0,0,0.9)',
          padding: '10px',
          maxHeight: '40vh',
          overflowY: 'auto',
          borderTop: '3px solid #d4af37'
        }}>
          <div style={{
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '8px',
            background: yourTeam === 0 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(220, 38, 38, 0.3)',
            padding: '5px 15px',
            borderRadius: '15px',
            display: 'inline-block',
            width: '100%'
          }}>
            {yourPlayer?.name} (You) - {yourCards.length} cards
          </div>

          {/* Mobile cards layout - more compact */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {Object.entries(cardsBySuit).map(([suit, suitGroups]) => {
              const suitCardsLow = suitGroups.low;
              const suitCardsHigh = suitGroups.high;
              if (suitCardsLow.length === 0 && suitCardsHigh.length === 0) return null;

              return (
                <div key={suit} style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '8px',
                  borderRadius: '8px'
                }}>
                  {/* Suit header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '5px',
                    color: getCardColor(suit as Suit) === '#000' ? '#fff' : getCardColor(suit as Suit),
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    <span style={{ fontSize: '16px', marginRight: '5px' }}>
                      {getSuitSymbol(suit as Suit)}
                    </span>
                    <span>{suit.toUpperCase()}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '12px', opacity: 0.8 }}>
                      ({suitCardsLow.length + suitCardsHigh.length})
                    </span>
                  </div>

                  {/* Cards in rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {suitCardsLow.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', minWidth: '30px' }}>
                          LOW
                        </span>
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                          {suitCardsLow.map((card, index) => (
                            <PlayingCard key={`${suit}-low-${index}`} card={card} size="medium" />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {suitCardsHigh.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', minWidth: '30px' }}>
                          HIGH
                        </span>
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                          {suitCardsHigh.map((card, index) => (
                            <PlayingCard key={`${suit}-high-${index}`} card={card} size="medium" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Desktop layout (existing code continues...)
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
            animation: 'turnPulse 2s infinite',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
            textAlign: 'center'
          }}>
            🎯 YOUR TURN
          </div>
        ) : (
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
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
              background: gameState.lastMove.successful 
                ? 'rgba(34, 197, 94, 0.15)' 
                : 'rgba(239, 68, 68, 0.15)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '16px',
              fontSize: '14px',
              textAlign: 'center',
              border: gameState.lastMove.successful 
                ? '2px solid rgba(34, 197, 94, 0.4)'
                : '2px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '16px',
                color: gameState.lastMove.successful ? '#22c55e' : '#ef4444'
              }}>
                {gameState.lastMove.successful ? '✅ SUCCESS' : '❌ FAILED'}
              </div>
              <div style={{ fontSize: '14px' }}>
                <strong>{gameState.lastMove.fromPlayer}</strong> asked{' '}
                <strong>{gameState.lastMove.toPlayer}</strong> for:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlayingCard card={gameState.lastMove.card} size="small" />
                <span style={{ 
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: getCardColor(gameState.lastMove.card.suit)
                }}>
                  {gameState.lastMove.card.rank}{getSuitSymbol(gameState.lastMove.card.suit)}
                </span>
              </div>
              {gameState.lastMove.successful && (
                <div style={{ 
                  fontSize: '12px', 
                  opacity: 0.8,
                  fontStyle: 'italic'
                }}>
                  Card transferred successfully!
                </div>
              )}
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
                animation: isCurrentPlayer ? 'playerTurnHighlight 2s infinite' : 'none'
              }}>
                <div>{player.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  {player.cardCount} cards
                </div>
              </div>

              {/* Player cards (1-2 cards for others) */}
              <div style={{ display: 'flex', gap: '4px' }}>
                <PlayingCard 
                  isBack={true} 
                  size="small" 
                  pulsing={isCurrentPlayer} 
                  glowEffect={isCurrentPlayer}
                />
                {player.cardCount > 1 && (
                  <PlayingCard 
                    isBack={true} 
                    size="small" 
                    pulsing={isCurrentPlayer}
                    glowEffect={isCurrentPlayer}
                  />
                )}
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