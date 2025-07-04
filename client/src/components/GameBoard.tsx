// Game Board - Main Literature gameplay screen with table layout
import { useState, useEffect } from 'react'
import { GameState, Card, AskCardMove, ClaimMove, Suit, Rank } from 'shared'
import GameTable from './GameTable'
import CardAnimationManager from './CardAnimationManager'
import './CardAnimations.css'

/**
 * EXPLANATION: Clean Modern Literature Game Board
 * 
 * Redesigned for a cleaner, more professional interface:
 * - Full-screen oval table with players positioned around it
 * - Simple 1-2 card display for opponents 
 * - Clear HIGH/LOW card organization for your hand
 * - Large, professional modals for asking and claiming
 * - Clean visual hierarchy with better colors and typography
 */

interface GameBoardProps {
  gameState: GameState
  yourPlayerId: string
  playerName: string
  onMakeMove: (move: AskCardMove | ClaimMove) => void
  error: string
}

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

function GameBoard({ 
  gameState, 
  yourPlayerId, 
  playerName, 
  onMakeMove, 
  error 
}: GameBoardProps) {
  const [showAskModal, setShowAskModal] = useState(false)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<string>('')
  const [selectedSuit, setSelectedSuit] = useState<string>('')
  const [selectedIsHigh, setSelectedIsHigh] = useState<boolean | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [selectedClaimSuit, setSelectedClaimSuit] = useState<string>('')
  const [selectedClaimIsHigh, setSelectedClaimIsHigh] = useState<boolean>(true)
  
  // Animation state
  const [triggerTransferAnimation, setTriggerTransferAnimation] = useState<{
    card: Card
    fromPlayerId: string
    toPlayerId: string
  } | null>(null)
  const [triggerClaimAnimation, setTriggerClaimAnimation] = useState<{
    cards: Card[]
    winningTeam: number
  } | null>(null)
  const [lastMoveState, setLastMoveState] = useState<any>(null)
  // Track previous number of claimed sets to detect NEW claims
  const [previousClaimedSetsCount, setPreviousClaimedSetsCount] = useState(0)

  const currentPlayer = gameState.players.find(p => p.id === yourPlayerId)
  const isYourTurn = gameState.players[gameState.currentPlayerIndex]?.id === yourPlayerId
  const yourTeam = currentPlayer?.team

  // Initialize the claimed sets count when component first loads
  useEffect(() => {
    setPreviousClaimedSetsCount(gameState.claimedSets.length)
  }, []) // Only run once when component mounts

  // Detect when to trigger animations based on game state changes
  useEffect(() => {
    // Detect card transfers from last move
    if (gameState.lastMove && gameState.lastMove !== lastMoveState) {
      if (gameState.lastMove.successful) {
        setTriggerTransferAnimation({
          card: gameState.lastMove.card,
          fromPlayerId: gameState.lastMove.toPlayer,
          toPlayerId: gameState.lastMove.fromPlayer
        })
        // Clear transfer animation after delay
        setTimeout(() => setTriggerTransferAnimation(null), 2000)
      }
      setLastMoveState(gameState.lastMove)
    }
  }, [gameState, lastMoveState])

  // Detect claim animations - ONLY when NEW claims are made
  useEffect(() => {
    if (gameState.claimedSets.length > previousClaimedSetsCount) {
      // A new claim was just made!
      const lastClaim = gameState.claimedSets[gameState.claimedSets.length - 1]
      if (lastClaim) {
        console.log('🏆 New claim detected! Triggering animation for:', lastClaim)
        // Get cards for this half-suit (use the actual cards from the claim)
        const claimCards = lastClaim.cards
        
        setTriggerClaimAnimation({
          cards: claimCards,
          winningTeam: lastClaim.team
        })
        // Clear claim animation after delay
        setTimeout(() => setTriggerClaimAnimation(null), 3000)
      }
      // Update the count to prevent triggering again
      setPreviousClaimedSetsCount(gameState.claimedSets.length)
    } else if (gameState.claimedSets.length < previousClaimedSetsCount) {
      // Game was reset or restarted, reset our counter
      setPreviousClaimedSetsCount(gameState.claimedSets.length)
    }
  }, [gameState.claimedSets, previousClaimedSetsCount])

  const handleAnimationComplete = (animationType: string) => {
    // Handle animation completion if needed
  }

  // Get players you can ask (not teammates, have cards)
  const getValidTargets = () => {
    return gameState.players.filter(player => 
      player.id !== yourPlayerId && 
      player.team !== yourTeam && 
      player.cardCount > 0
    )
  }

  // Get suits you have cards in
  const getAvailableSuits = () => {
    if (!currentPlayer) return []
    const suits = new Set(currentPlayer.hand.map(c => c.suit))
    return Array.from(suits)
  }

  // Get available high/low options for selected suit
  const getAvailableHighLow = (suit: string) => {
    if (!currentPlayer || !suit) return []
    
    const suitCards = currentPlayer.hand.filter(c => c.suit === suit)
    const hasHigh = suitCards.some(c => isHighCard(c.rank))
    const hasLow = suitCards.some(c => !isHighCard(c.rank))
    
    const options = []
    if (hasHigh) options.push({ label: 'HIGH (9, 10, J, Q, K, A)', value: true })
    if (hasLow) options.push({ label: 'LOW (2, 3, 4, 5, 6, 7)', value: false })
    
    return options
  }

  // Get cards you can ask for in selected suit and high/low
  const getAvailableCards = (suit: string, isHigh: boolean) => {
    if (!currentPlayer || !suit || isHigh === null) return []
    
    const allRanks: Rank[] = isHigh ? ['9', '10', 'J', 'Q', 'K', 'A'] : ['2', '3', '4', '5', '6', '7']
    const yourCardRanks = new Set(
      currentPlayer.hand
        .filter(c => c.suit === suit && isHighCard(c.rank) === isHigh)
        .map(c => c.rank)
    )
    
         // You can ask for cards in the same half-suit that you don't already have
     return allRanks
       .filter(rank => !yourCardRanks.has(rank))
       .map(rank => ({ suit: suit as Suit, rank: rank as Rank }))
  }

  // Get half-suits you can claim
  const getValidClaims = () => {
    if (!currentPlayer) return []
    
    const validClaims: { suit: string; isHigh: boolean }[] = []
    const yourSuits = new Set(currentPlayer.hand.map(c => c.suit))
    
    yourSuits.forEach(suit => {
      // Check if you have any high cards in this suit
      const hasHighCards = currentPlayer.hand.some(c => c.suit === suit && isHighCard(c.rank))
      // Check if you have any low cards in this suit
      const hasLowCards = currentPlayer.hand.some(c => c.suit === suit && !isHighCard(c.rank))
      
      // Check if half-suits are already claimed
      const highClaimed = gameState.claimedSets.some(s => s.suit === suit && s.isHigh)
      const lowClaimed = gameState.claimedSets.some(s => s.suit === suit && !s.isHigh)
      
      if (hasHighCards && !highClaimed) {
        validClaims.push({ suit, isHigh: true })
      }
      if (hasLowCards && !lowClaimed) {
        validClaims.push({ suit, isHigh: false })
      }
    })
    
    return validClaims
  }

  const handlePlayerClick = (playerId: string) => {
    setSelectedPlayer(playerId)
    setShowAskModal(true)
  }

  const handleAskCard = () => {
    if (!selectedPlayer || !selectedCard) return

    const move: AskCardMove = {
      type: 'ask',
      fromPlayerId: yourPlayerId,
      toPlayerId: selectedPlayer,
      card: selectedCard
    }

    onMakeMove(move)
    setShowAskModal(false)
    setSelectedPlayer('')
    setSelectedCard(null)
    setSelectedSuit('')
    setSelectedIsHigh(null)
  }

  const handleClaimSet = () => {
    if (!selectedClaimSuit) return

    const move: ClaimMove = {
      type: 'claim',
      playerId: yourPlayerId,
      suit: selectedClaimSuit as any,
      isHigh: selectedClaimIsHigh
    }

    onMakeMove(move)
    setShowClaimModal(false)
    setSelectedClaimSuit('')
  }

  // Reset modal state when closing
  const handleCloseAskModal = () => {
    setShowAskModal(false)
    setSelectedPlayer('')
    setSelectedCard(null)
    setSelectedSuit('')
    setSelectedIsHigh(null)
  }

  const validTargets = getValidTargets()
  const availableSuits = getAvailableSuits()
  const availableHighLow = getAvailableHighLow(selectedSuit)
  const availableCards = selectedSuit && selectedIsHigh !== null ? getAvailableCards(selectedSuit, selectedIsHigh) : []
  const validClaims = getValidClaims()

  // Large Card Component for modals
  const LargeCard = ({ card, selected, onClick }: { card: Card, selected: boolean, onClick: () => void }) => (
    <div
      onClick={onClick}
      style={{
        width: '80px',
        height: '112px',
        background: selected ? '#fef3c7' : '#fff',
        border: selected ? '3px solid #f59e0b' : '2px solid #d1d5db',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '16px',
        color: getCardColor(card.suit),
        fontWeight: 'bold',
        padding: '8px',
        cursor: 'pointer',
        boxShadow: selected ? '0 4px 12px rgba(245, 158, 11, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.2s'
      }}
    >
      <div>{card.rank}</div>
      <div style={{ fontSize: '24px' }}>{getSuitSymbol(card.suit)}</div>
      <div>{card.rank}</div>
    </div>
  )

  return (
    <div>
      {/* Error display */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          padding: '12px 20px',
          background: 'rgba(239, 68, 68, 0.95)',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Main Game Table */}
      <GameTable
        gameState={gameState}
        yourPlayerId={yourPlayerId}
        onPlayerClick={handlePlayerClick}
        onAskCard={() => setShowAskModal(true)}
        onClaimSet={() => setShowClaimModal(true)}
      />

      {/* Card Animation Manager - Handles all card animations */}
      <CardAnimationManager
        gameState={gameState}
        yourPlayerId={yourPlayerId}
        onAnimationComplete={handleAnimationComplete}
        triggerTransferAnimation={triggerTransferAnimation}
        triggerClaimAnimation={triggerClaimAnimation}
      />

      {/* Ask Card Modal */}
      {showAskModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '700px',
            width: '95vw',
            maxHeight: '85vh',
            overflow: 'auto'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              marginBottom: '20px', 
              textAlign: 'center',
              color: '#374151'
            }}>
              ⭐ Ask for a Card
            </h2>

            {/* Player Selection */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                1. Select Player:
              </h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {validTargets.map(player => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayer(player.id)}
                    style={{
                      padding: '12px 16px',
                      border: selectedPlayer === player.id ? '3px solid #3b82f6' : '2px solid #d1d5db',
                      borderRadius: '12px',
                      background: selectedPlayer === player.id ? '#dbeafe' : 'white',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                                     >
                     <div>{player.name}</div>
                     <div style={{ fontSize: '12px', opacity: 0.7 }}>
                       {player.cardCount} cards • Team {player.team === 0 ? 'Blue' : 'Red'}
                     </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Suit Selection */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                2. Select Suit (you have cards in):
              </h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {availableSuits.map(suit => (
                  <button
                    key={suit}
                    onClick={() => {
                      setSelectedSuit(suit)
                      setSelectedIsHigh(null)
                      setSelectedCard(null)
                    }}
                    style={{
                      padding: '15px 20px',
                      border: selectedSuit === suit ? '3px solid #059669' : '2px solid #d1d5db',
                      borderRadius: '12px',
                      background: selectedSuit === suit ? '#ecfdf5' : 'white',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: getCardColor(suit)
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{getSuitSymbol(suit)}</span>
                    <span>{suit.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* High/Low Selection */}
            {selectedSuit && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                  3. Select High or Low:
                </h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {availableHighLow.map(option => (
                    <button
                      key={option.value.toString()}
                      onClick={() => {
                        setSelectedIsHigh(option.value)
                        setSelectedCard(null)
                      }}
                      style={{
                        padding: '15px 20px',
                        border: selectedIsHigh === option.value ? '3px solid #7c3aed' : '2px solid #d1d5db',
                        borderRadius: '12px',
                        background: selectedIsHigh === option.value ? '#f3e8ff' : 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        textAlign: 'left'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Card Selection */}
            {selectedSuit && selectedIsHigh !== null && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                  4. Select Specific Card:
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                  gap: '10px',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                  {availableCards.map((card, index) => (
                    <LargeCard
                      key={index}
                      card={card}
                      selected={selectedCard?.suit === card.suit && selectedCard?.rank === card.rank}
                      onClick={() => setSelectedCard(card)}
                    />
                  ))}
                </div>
                {availableCards.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                    You already have all cards in this half-suit!
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={handleCloseAskModal}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #d1d5db',
                  borderRadius: '10px',
                  background: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAskCard}
                disabled={!selectedPlayer || !selectedCard}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '10px',
                  background: selectedPlayer && selectedCard ? '#059669' : '#d1d5db',
                  color: 'white',
                  cursor: selectedPlayer && selectedCard ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
              >
                Ask for Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claim Set Modal */}
      {showClaimModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '90vw'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              marginBottom: '20px', 
              textAlign: 'center',
              color: '#374151'
            }}>
              🏆 Claim a Half-Suit
            </h2>

            {/* Half-Suit Selection */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                Select Half-Suit to Claim:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {validClaims.map((claim, index) => {
                  const isSelected = selectedClaimSuit === claim.suit && selectedClaimIsHigh === claim.isHigh
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedClaimSuit(claim.suit)
                        setSelectedClaimIsHigh(claim.isHigh)
                      }}
                      style={{
                        padding: '15px',
                        border: isSelected ? '3px solid #7c3aed' : '2px solid #d1d5db',
                        borderRadius: '10px',
                        background: isSelected ? '#f3e8ff' : 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontSize: '18px', color: getCardColor(claim.suit) }}>
                        {getSuitSymbol(claim.suit)} {claim.suit.toUpperCase()} - {claim.isHigh ? 'HIGH' : 'LOW'}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                        {claim.isHigh ? '9, 10, J, Q, K, A' : '2, 3, 4, 5, 6, 7'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowClaimModal(false)}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #d1d5db',
                  borderRadius: '10px',
                  background: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClaimSet}
                disabled={!selectedClaimSuit}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '10px',
                  background: selectedClaimSuit ? '#7c3aed' : '#d1d5db',
                  color: 'white',
                  cursor: selectedClaimSuit ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
              >
                Claim Half-Suit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameBoard 