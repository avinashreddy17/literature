import React from 'react'
import PlayingCard from './PlayingCard'
import { Card } from 'shared'

interface PlayerHandProps {
  cards: Card[]
  playerName: string
}

// Helper function to check if card is high (9-A) or low (2-7)
const isHighCard = (rank: string) => {
  return ['9', '10', 'J', 'Q', 'K', 'A'].includes(rank)
}

// Helper function to get suit color
const getSuitColor = (suit: string) => {
  return suit === 'hearts' || suit === 'diamonds' ? '#dc2626' : '#1f2937'
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

// Group cards by suit, then by high/low
const groupCardsForDisplay = (cards: Card[]) => {
  const suits: { [key: string]: { low: Card[], high: Card[] } } = {
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
  
  return suits
}

const PlayerHand: React.FC<PlayerHandProps> = ({ cards, playerName }) => {
  const cardsBySuit = groupCardsForDisplay(cards)

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200,
      width: 'auto',
      maxWidth: '95vw'
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '20px 30px',
        border: '3px solid rgba(255,215,0,0.6)',
        boxShadow: '0 -15px 40px rgba(0,0,0,0.6), 0 0 30px rgba(255,215,0,0.3)'
      }}>
        <div style={{
          color: '#ffd700',
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '15px',
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.8)'
        }}>
          {playerName}'s Hand ({cards.length} cards)
        </div>
        
        {/* Cards grouped by suit */}
        <div style={{
          display: 'flex',
          gap: '25px',
          alignItems: 'flex-start',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {Object.entries(cardsBySuit).map(([suit, suitCards]) => {
            const totalCards = suitCards.low.length + suitCards.high.length
            if (totalCards === 0) return null

            return (
              <div key={suit} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
                padding: '10px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px'
              }}>
                {/* Suit Label */}
                <div style={{
                  color: getSuitColor(suit),
                  fontSize: '14px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ fontSize: '18px' }}>{getSuitSymbol(suit)}</span>
                  <span>{suit.toUpperCase()}</span>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>({totalCards})</span>
                </div>

                {/* Low and High Groups */}
                <div style={{ display: 'flex', gap: '20px' }}>
                  {suitCards.low.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '12px', color: 'white', fontWeight: 'bold' }}>LOW</div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {suitCards.low.map(card => <PlayingCard key={card.rank} card={card} size="medium" />)}
                      </div>
                    </div>
                  )}
                  {suitCards.high.length > 0 && (
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '12px', color: 'white', fontWeight: 'bold' }}>HIGH</div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {suitCards.high.map(card => <PlayingCard key={card.rank} card={card} size="medium" />)}
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

export default PlayerHand 