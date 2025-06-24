import React from 'react'
import { Card } from 'shared'

interface PlayingCardProps {
  card?: Card
  isCardBack?: boolean
  size?: 'small' | 'medium' | 'large'
  selected?: boolean
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

const getSuitColor = (suit: string) => {
  return suit === 'hearts' || suit === 'diamonds' ? '#dc2626' : '#1a1a1a'
}

const getSuitSymbol = (suit: string) => {
  switch(suit) {
    case 'hearts': return '♥'
    case 'diamonds': return '♦'
    case 'clubs': return '♣'
    case 'spades': return '♠'
    default: return '?'
  }
}

const PlayingCard: React.FC<PlayingCardProps> = ({ 
  card, 
  isCardBack = false, 
  size = 'medium',
  selected = false,
  onClick,
  className = '',
  style = {}
}) => {
  const sizeClasses = {
    small: { width: '45px', height: '63px', fontSize: '11px' },
    medium: { width: '65px', height: '91px', fontSize: '14px' },
    large: { width: '85px', height: '119px', fontSize: '18px' }
  }

  const cardSize = sizeClasses[size]

  const cardStyle: React.CSSProperties = {
    width: cardSize.width,
    height: cardSize.height,
    borderRadius: '8px',
    border: selected ? '3px solid #ffd700' : '1px solid #333',
    background: isCardBack 
      ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 95%, #e2e8f0 100%)',
    boxShadow: selected 
      ? '0 8px 25px rgba(255, 215, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
      : '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.15)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '6px',
    position: 'relative',
    transform: selected ? 'translateY(-4px) scale(1.08)' : 'none',
    ...style
  }

  // Card back design
  if (isCardBack) {
    return (
      <div 
        style={cardStyle}
        onClick={onClick}
        className={className}
      >
        {/* Decorative card back pattern */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          borderRadius: '7px',
          background: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px),
            linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)
          `,
          backgroundSize: '20px 20px, 20px 20px, 100% 100%'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: `calc(${cardSize.fontSize} * 1.2)`,
            fontWeight: 'bold',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)'
          }}>
            🂠
          </div>
        </div>
      </div>
    )
  }

  // Empty card slot
  if (!card) {
    return (
      <div 
        style={{
          ...cardStyle,
          background: 'rgba(255,255,255,0.1)',
          border: '2px dashed rgba(255,255,255,0.3)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
        }}
        className={className}
      />
    )
  }

  const suitColor = getSuitColor(card.suit)
  const suitSymbol = getSuitSymbol(card.suit)

  return (
    <div 
      style={cardStyle}
      onClick={onClick}
      className={className}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = selected ? 'translateY(-4px) scale(1.08)' : 'translateY(-2px) scale(1.02)'
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = selected ? 'translateY(-4px) scale(1.08)' : 'none'
        }
      }}
    >
      {/* Top-left rank and suit */}
      <div style={{
        fontSize: cardSize.fontSize,
        fontWeight: '900',
        color: suitColor,
        lineHeight: '0.9',
        alignSelf: 'flex-start',
        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ marginBottom: '1px' }}>{card.rank}</div>
        <div style={{ 
          fontSize: `calc(${cardSize.fontSize} * 0.85)`,
          textAlign: 'center'
        }}>
          {suitSymbol}
        </div>
      </div>

      {/* Center suit symbol */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: `calc(${cardSize.fontSize} * 2.2)`,
        color: suitColor,
        opacity: 0.15,
        fontWeight: 'bold'
      }}>
        {suitSymbol}
      </div>

      {/* Bottom-right rank and suit (upside down) */}
      <div style={{
        fontSize: cardSize.fontSize,
        fontWeight: '900',
        color: suitColor,
        lineHeight: '0.9',
        alignSelf: 'flex-end',
        transform: 'rotate(180deg)',
        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ marginBottom: '1px' }}>{card.rank}</div>
        <div style={{ 
          fontSize: `calc(${cardSize.fontSize} * 0.85)`,
          textAlign: 'center'
        }}>
          {suitSymbol}
        </div>
      </div>

      {/* Subtle inner border for premium look */}
      <div style={{
        position: 'absolute',
        top: '2px',
        left: '2px',
        right: '2px',
        bottom: '2px',
        borderRadius: '6px',
        border: '1px solid rgba(0,0,0,0.05)',
        pointerEvents: 'none'
      }} />
    </div>
  )
}

export default PlayingCard 