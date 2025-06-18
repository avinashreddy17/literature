// Game Board - Main Literature gameplay screen
import { useState } from 'react'
import { GameState, Card, AskCardMove, ClaimMove } from 'shared'

/**
 * EXPLANATION: Enhanced Game Board Component
 * 
 * This is the complete Literature gameplay interface with:
 * - Enhanced card display grouped by half-suits
 * - Ask card modal with Literature rule validation
 * - Claim half-suit modal with strategic information
 * - Move history for context
 * - Real-time game state updates
 */

interface GameBoardProps {
  gameState: GameState
  yourPlayerId: string
  playerName: string
  onMakeMove: (move: AskCardMove | ClaimMove) => void
  error: string
}

// Helper function to get card color
const getCardColor = (suit: string) => {
  return suit === 'hearts' || suit === 'diamonds' ? '#dc2626' : '#374151'
}

// Helper function to get suit symbol
const getSuitSymbol = (suit: string) => {
  switch(suit) {
    case 'hearts': return '♥️'
    case 'diamonds': return '♦️'
    case 'clubs': return '♣️'
    case 'spades': return '♠️'
    default: return '?'
  }
}

// Helper function to check if card is high (9-A) or low (2-7)
const isHighCard = (rank: string) => {
  return ['9', '10', 'J', 'Q', 'K', 'A'].includes(rank)
}

// Helper function to get all cards in a half-suit
const getHalfSuitCards = (suit: string, isHigh: boolean) => {
  const lowRanks = ['2', '3', '4', '5', '6', '7']
  const highRanks = ['9', '10', 'J', 'Q', 'K', 'A']
  const ranks = isHigh ? highRanks : lowRanks
  return ranks.map(rank => ({ suit, rank }))
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
  const [selectedSuit, setSelectedSuit] = useState<string>('')
  const [selectedRank, setSelectedRank] = useState<string>('')
  const [selectedPlayer, setSelectedPlayer] = useState<string>('')
  const [selectedClaimSuit, setSelectedClaimSuit] = useState<string>('')
  const [selectedClaimIsHigh, setSelectedClaimIsHigh] = useState<boolean>(true)

  const currentPlayer = gameState.players.find(p => p.id === yourPlayerId)
  const isYourTurn = gameState.players[gameState.currentPlayerIndex]?.id === yourPlayerId
  const yourTeam = currentPlayer?.team

  // Group your cards by half-suits for better display
  const groupCardsByHalfSuit = (cards: Card[]) => {
    const groups: { [key: string]: Card[] } = {}
    cards.forEach(card => {
      const isHigh = isHighCard(card.rank)
      const key = `${card.suit}-${isHigh ? 'high' : 'low'}`
      if (!groups[key]) groups[key] = []
      groups[key].push(card)
    })
    return groups
  }

  const cardGroups = currentPlayer ? groupCardsByHalfSuit(currentPlayer.hand) : {}

  // Get players you can ask (not teammates, have cards)
  const getValidTargets = () => {
    return gameState.players.filter(player => 
      player.id !== yourPlayerId && 
      player.team !== yourTeam && 
      player.cardCount > 0
    )
  }

  // Get half-suits you can validly ask for
  const getValidHalfSuits = () => {
    if (!currentPlayer) return []
    const validSuits: { suit: string; isHigh: boolean }[] = []
    
    console.log('🔍 ===== CALCULATING VALID HALF-SUITS =====');
    console.log('👤 Current player hand:', currentPlayer.hand);
    
    currentPlayer.hand.forEach(card => {
      const isHigh = isHighCard(card.rank)
      const key = `${card.suit}-${isHigh ? 'high' : 'low'}`
      console.log(`   Card: ${card.rank} of ${card.suit} -> isHigh: ${isHigh} -> key: ${key}`);
      
      if (!validSuits.some(s => `${s.suit}-${s.isHigh ? 'high' : 'low'}` === key)) {
        validSuits.push({ suit: card.suit, isHigh })
        console.log(`   ✅ Added half-suit: ${card.suit} ${isHigh ? 'HIGH' : 'LOW'}`);
      } else {
        console.log(`   ⏩ Half-suit already exists: ${card.suit} ${isHigh ? 'HIGH' : 'LOW'}`);
      }
    })
    
    console.log('📊 Final valid half-suits:', validSuits);
    console.log('===== VALID HALF-SUITS COMPLETE =====\n');
    
    return validSuits
  }

  // Check if a half-suit is already claimed
  const isHalfSuitClaimed = (suit: string, isHigh: boolean) => {
    return gameState.claimedSets.some(set => 
      set.suit === suit && set.isHigh === isHigh
    )
  }

  // Handle ask card submission
  const handleAskCard = () => {
    if (!selectedPlayer || !selectedSuit || !selectedRank) return

    console.log('\n🎯 ===== CLIENT: CREATING ASK CARD MOVE =====');
    console.log('📤 Selected player:', selectedPlayer);
    console.log('📤 Selected suit (raw):', selectedSuit);
    console.log('📤 Selected rank:', selectedRank);
    console.log('👤 Your player ID:', yourPlayerId);

    const [suit, level] = selectedSuit.split('-')
    console.log('📤 Parsed suit:', suit);
    console.log('📤 Parsed level:', level);

    const move: AskCardMove = {
      type: 'ask',
      fromPlayerId: yourPlayerId,
      toPlayerId: selectedPlayer,
      card: { suit: suit as any, rank: selectedRank as any }
    }

    console.log('📤 Final move being sent:', JSON.stringify(move, null, 2));
    console.log('🎮 Current game state summary:');
    console.log('   - Your turn?', isYourTurn);
    console.log('   - Current player index:', gameState.currentPlayerIndex);
    console.log('   - Current player ID:', gameState.players[gameState.currentPlayerIndex]?.id);
    console.log('   - Your player in game:', gameState.players.find(p => p.id === yourPlayerId));

    onMakeMove(move)
    
    console.log('===== ASK CARD MOVE SENT =====\n');
    
    setShowAskModal(false)
    setSelectedPlayer('')
    setSelectedSuit('')
    setSelectedRank('')
  }

  // Handle claim half-suit submission
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

  const validTargets = getValidTargets()
  const validHalfSuits = getValidHalfSuits()

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#374151', marginBottom: '0.5rem' }}>
            🎮 Literature Game
          </h1>
          <p style={{ color: '#6b7280' }}>
            {isYourTurn ? "🎯 It's your turn!" : `⏳ Waiting for ${gameState.players[gameState.currentPlayerIndex]?.name}'s turn`}
          </p>
          {gameState.lastMove && (
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Last move: {gameState.lastMove.successful 
                ? `${gameState.lastMove.fromPlayer} successfully got ${gameState.lastMove.card.rank} of ${gameState.lastMove.card.suit} from ${gameState.lastMove.toPlayer}`
                : `${gameState.lastMove.fromPlayer} asked ${gameState.lastMove.toPlayer} for ${gameState.lastMove.card.rank} of ${gameState.lastMove.card.suit} (not found)`
              }
            </p>
          )}
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Game State Info */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {/* Your Hand - Grouped by Half-Suits */}
          <div style={{
            background: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#374151' }}>
              🃏 Your Hand ({currentPlayer?.hand.length || 0} cards)
            </h3>
            {Object.keys(cardGroups).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.entries(cardGroups).map(([groupKey, cards]) => {
                  const [suit, level] = groupKey.split('-')
                  const isHigh = level === 'high'
                  return (
                    <div key={groupKey} style={{
                      background: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '1rem'
                    }}>
                      <div style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 'bold', 
                        marginBottom: '0.5rem',
                        color: getCardColor(suit)
                      }}>
                        {getSuitSymbol(suit)} {suit.charAt(0).toUpperCase() + suit.slice(1)} {isHigh ? 'High' : 'Low'} ({cards.length}/6)
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        gap: '0.25rem'
                      }}>
                        {cards.map(card => (
                          <div 
                            key={`${card.suit}-${card.rank}`}
                            style={{
                              background: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.8rem',
                              color: getCardColor(card.suit)
                            }}
                          >
                            {card.rank}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p style={{ color: '#6b7280' }}>No cards</p>
            )}
          </div>

          {/* Game Score */}
          <div style={{
            background: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#374151' }}>
              🏆 Score
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: yourTeam === 0 ? '#2563eb' : '#6b7280' 
                }}>
                  {gameState.claimedSets.filter(set => set.team === 0).length}
                </div>
                <div style={{ color: yourTeam === 0 ? '#2563eb' : '#6b7280' }}>
                  Team 0 {yourTeam === 0 ? '(You)' : ''}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: yourTeam === 1 ? '#dc2626' : '#6b7280' 
                }}>
                  {gameState.claimedSets.filter(set => set.team === 1).length}
                </div>
                <div style={{ color: yourTeam === 1 ? '#dc2626' : '#6b7280' }}>
                  Team 1 {yourTeam === 1 ? '(You)' : ''}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280', textAlign: 'center' }}>
              {gameState.claimedSets.length}/8 sets claimed
            </div>
          </div>
        </div>

        {/* Players */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>👥 Players</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '0.5rem'
          }}>
            {gameState.players.map((player, index) => (
              <div 
                key={player.id}
                style={{
                  padding: '1rem',
                  background: player.id === yourPlayerId ? '#dbeafe' : 
                           player.team === yourTeam ? '#ecfdf5' : '#f3f4f6',
                  border: index === gameState.currentPlayerIndex ? '2px solid #10b981' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{player.name}</div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: player.team === yourTeam ? '#059669' : '#6b7280' 
                }}>
                  Team {player.team} • {player.cardCount} cards
                </div>
                {index === gameState.currentPlayerIndex && (
                  <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.25rem' }}>
                    🎯 Current Turn
                  </div>
                )}
                {player.id === yourPlayerId && (
                  <div style={{ fontSize: '0.7rem', color: '#2563eb', marginTop: '0.25rem' }}>
                    You
                  </div>
                )}
                {player.team === yourTeam && player.id !== yourPlayerId && (
                  <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '0.25rem' }}>
                    Teammate
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Claimed Sets */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>
            🏆 Claimed Sets ({gameState.claimedSets.length}/8)
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.5rem'
          }}>
            {gameState.claimedSets.map((set, index) => (
              <div 
                key={`${set.suit}-${set.isHigh}`}
                style={{
                  padding: '1rem',
                  background: set.team === 0 ? '#dbeafe' : '#fecaca',
                  border: `2px solid ${set.team === 0 ? '#2563eb' : '#dc2626'}`,
                  borderRadius: '8px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>
                  {getSuitSymbol(set.suit)} {set.suit.charAt(0).toUpperCase() + set.suit.slice(1)} {set.isHigh ? 'High' : 'Low'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  Team {set.team}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {isYourTurn && (
          <div style={{ 
            marginTop: '2rem', 
            textAlign: 'center',
            padding: '1.5rem',
            background: '#f0fdf4',
            border: '2px solid #bbf7d0',
            borderRadius: '12px'
          }}>
            <p style={{ marginBottom: '1rem', color: '#16a34a', fontWeight: 'bold' }}>
              🎯 It's your turn! Choose an action:
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowAskModal(true)}
                disabled={validTargets.length === 0}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: validTargets.length > 0 ? '#2563eb' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: validTargets.length > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: '600'
                }}
              >
                ❓ Ask for Card
              </button>
              
              <button
                onClick={() => setShowClaimModal(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🏆 Claim Set
              </button>
            </div>
            {validTargets.length === 0 && (
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
                No valid opponents to ask (teammates or players with no cards)
              </p>
            )}
          </div>
        )}

        {/* Ask Card Modal */}
        {showAskModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>❓ Ask for Card</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Ask which player?
                </label>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                >
                  <option value="">Select player...</option>
                  {validTargets.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} (Team {player.team}, {player.cardCount} cards)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Which half-suit? (You can only ask for cards in half-suits you have)
                </label>
                <select
                  value={selectedSuit}
                  onChange={(e) => {
                    setSelectedSuit(e.target.value)
                    setSelectedRank('')
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                >
                  <option value="">Select half-suit...</option>
                  {validHalfSuits.map(({ suit, isHigh }) => (
                    <option key={`${suit}-${isHigh}`} value={`${suit}-${isHigh ? 'high' : 'low'}`}>
                      {getSuitSymbol(suit)} {suit.charAt(0).toUpperCase() + suit.slice(1)} {isHigh ? 'High' : 'Low'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSuit && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Which specific card?
                  </label>
                  <select
                    value={selectedRank}
                    onChange={(e) => setSelectedRank(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="">Select card...</option>
                    {(() => {
                      const [suit, level] = selectedSuit.split('-')
                      const isHigh = level === 'high'
                      const allCards = getHalfSuitCards(suit, isHigh)
                      const yourCards = currentPlayer?.hand || []
                      
                      console.log('🔍 DROPDOWN DEBUG:');
                      console.log('   - Selected suit/level:', suit, level, isHigh);
                      console.log('   - All cards in half-suit:', allCards);
                      console.log('   - Your current cards:', yourCards);
                      
                      const availableCards = allCards
                        .filter(card => !yourCards.some(c => c.suit === card.suit && c.rank === card.rank))
                      
                      console.log('   - Available cards to ask for:', availableCards);
                      
                      return availableCards.map(card => (
                          <option key={`${card.suit}-${card.rank}`} value={card.rank}>
                            {card.rank} of {card.suit}
                          </option>
                        ))
                    })()}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowAskModal(false)
                    setSelectedPlayer('')
                    setSelectedSuit('')
                    setSelectedRank('')
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAskCard}
                  disabled={!selectedPlayer || !selectedSuit || !selectedRank}
                  style={{
                    padding: '0.5rem 1rem',
                    background: selectedPlayer && selectedSuit && selectedRank ? '#2563eb' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: selectedPlayer && selectedSuit && selectedRank ? 'pointer' : 'not-allowed'
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
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>🏆 Claim Half-Suit</h3>
              <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                ⚠️ <strong>Warning:</strong> If you don't have all 6 cards, the opposing team gets the point!
              </p>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Which suit?
                </label>
                <select
                  value={selectedClaimSuit}
                  onChange={(e) => setSelectedClaimSuit(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                >
                  <option value="">Select suit...</option>
                  {['hearts', 'diamonds', 'clubs', 'spades'].map(suit => (
                    <option key={suit} value={suit}>
                      {getSuitSymbol(suit)} {suit.charAt(0).toUpperCase() + suit.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  High or Low?
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setSelectedClaimIsHigh(false)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: !selectedClaimIsHigh ? '#2563eb' : '#f3f4f6',
                      color: !selectedClaimIsHigh ? 'white' : '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Low (2,3,4,5,6,7)
                  </button>
                  <button
                    onClick={() => setSelectedClaimIsHigh(true)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: selectedClaimIsHigh ? '#2563eb' : '#f3f4f6',
                      color: selectedClaimIsHigh ? 'white' : '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    High (9,10,J,Q,K,A)
                  </button>
                </div>
              </div>

              {selectedClaimSuit && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '6px', 
                    padding: '1rem' 
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {getSuitSymbol(selectedClaimSuit)} {selectedClaimSuit.charAt(0).toUpperCase() + selectedClaimSuit.slice(1)} {selectedClaimIsHigh ? 'High' : 'Low'} Half-Suit:
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                      {getHalfSuitCards(selectedClaimSuit, selectedClaimIsHigh)
                        .map(card => `${card.rank} of ${card.suit}`)
                        .join(', ')}
                    </div>
                    {isHalfSuitClaimed(selectedClaimSuit, selectedClaimIsHigh) && (
                      <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        ⚠️ This half-suit has already been claimed!
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowClaimModal(false)
                    setSelectedClaimSuit('')
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClaimSet}
                  disabled={!selectedClaimSuit || isHalfSuitClaimed(selectedClaimSuit, selectedClaimIsHigh)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: selectedClaimSuit && !isHalfSuitClaimed(selectedClaimSuit, selectedClaimIsHigh) ? '#dc2626' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: selectedClaimSuit && !isHalfSuitClaimed(selectedClaimSuit, selectedClaimIsHigh) ? 'pointer' : 'not-allowed'
                  }}
                >
                  Claim Set
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameBoard 