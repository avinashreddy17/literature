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
  // Enhanced animation props
  animationType?: 'none' | 'deal' | 'transfer' | 'claim' | 'hover'
  dealDelay?: number
  glowEffect?: boolean
  pulsing?: boolean
  isAnimating?: boolean
}

const getSuitColor = (suit: string) => {
  return suit === 'hearts' || suit === 'diamonds' ? '#dc2626' : '#000000'
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

const getDisplayRank = (rank: string) => {
  switch(rank) {
    case 'J': return 'J'
    case 'Q': return 'Q' 
    case 'K': return 'K'
    case 'A': return 'A'
    default: return rank
  }
}

const isFaceCard = (rank: string) => {
  return ['J', 'Q', 'K'].includes(rank)
}

const PlayingCard: React.FC<PlayingCardProps> = ({ 
  card, 
  isCardBack = false, 
  size = 'medium',
  selected = false,
  onClick,
  className = '',
  style = {},
  animationType = 'none',
  dealDelay = 0,
  glowEffect = false,
  pulsing = false,
  isAnimating = false
}) => {
  const sizeClasses = {
    small: { width: '45px', height: '63px', fontSize: '11px' },
    medium: { width: '65px', height: '91px', fontSize: '14px' },
    large: { width: '85px', height: '119px', fontSize: '18px' }
  }

  const cardSize = sizeClasses[size]

  // Enhanced animation styles
  const getAnimationCSS = () => {
    let animations = []
    if (pulsing) animations.push('cardPulse 2s infinite')
    if (glowEffect) animations.push('cardGlow 1.5s ease-in-out infinite alternate')
    if (animationType === 'deal' && isAnimating) animations.push('cardDeal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)')
    return animations.join(', ')
  }

  const cardStyle: React.CSSProperties = {
    width: cardSize.width,
    height: cardSize.height,
    borderRadius: '8px',
    border: selected ? '3px solid #ffd700' : glowEffect ? '2px solid #06d6a0' : '1px solid #333',
    background: isCardBack 
      ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
    boxShadow: selected 
      ? '0 12px 30px rgba(255, 215, 0, 0.5), 0 6px 15px rgba(0, 0, 0, 0.3)'
      : glowEffect
      ? '0 8px 25px rgba(6, 214, 160, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)'
      : '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.15)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '6px',
    position: 'relative',
    transform: selected ? 'translateY(-8px) scale(1.1)' : 'none',
    animation: getAnimationCSS(),
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
  const displayRank = getDisplayRank(card.rank)
  const isCardFace = isFaceCard(card.rank)

  // Get suit symbols pattern for number cards
  const getSuitPattern = (rank: string, suit: string) => {
    const num = parseInt(rank)
    if (isNaN(num) || num < 2 || num > 10) return null

    const symbolSize = size === 'small' ? '12px' : size === 'medium' ? '16px' : '20px'
    const positions = []
    
    // Traditional card patterns
    switch(num) {
      case 2:
        positions.push({ top: '20%', left: '50%' })
        positions.push({ bottom: '20%', left: '50%', rotate: true })
        break
      case 3:
        positions.push({ top: '20%', left: '50%' })
        positions.push({ top: '50%', left: '50%' })
        positions.push({ bottom: '20%', left: '50%', rotate: true })
        break
      case 4:
        positions.push({ top: '25%', left: '30%' })
        positions.push({ top: '25%', right: '30%' })
        positions.push({ bottom: '25%', left: '30%', rotate: true })
        positions.push({ bottom: '25%', right: '30%', rotate: true })
        break
      case 5:
        positions.push({ top: '20%', left: '30%' })
        positions.push({ top: '20%', right: '30%' })
        positions.push({ top: '50%', left: '50%' })
        positions.push({ bottom: '20%', left: '30%', rotate: true })
        positions.push({ bottom: '20%', right: '30%', rotate: true })
        break
      case 6:
        positions.push({ top: '20%', left: '30%' })
        positions.push({ top: '20%', right: '30%' })
        positions.push({ top: '50%', left: '30%' })
        positions.push({ top: '50%', right: '30%' })
        positions.push({ bottom: '20%', left: '30%', rotate: true })
        positions.push({ bottom: '20%', right: '30%', rotate: true })
        break
      case 7:
        positions.push({ top: '20%', left: '30%' })
        positions.push({ top: '20%', right: '30%' })
        positions.push({ top: '35%', left: '50%' })
        positions.push({ top: '50%', left: '30%' })
        positions.push({ top: '50%', right: '30%' })
        positions.push({ bottom: '20%', left: '30%', rotate: true })
        positions.push({ bottom: '20%', right: '30%', rotate: true })
        break
      case 8:
        positions.push({ top: '18%', left: '30%' })
        positions.push({ top: '18%', right: '30%' })
        positions.push({ top: '35%', left: '30%' })
        positions.push({ top: '35%', right: '30%' })
        positions.push({ bottom: '35%', left: '30%', rotate: true })
        positions.push({ bottom: '35%', right: '30%', rotate: true })
        positions.push({ bottom: '18%', left: '30%', rotate: true })
        positions.push({ bottom: '18%', right: '30%', rotate: true })
        break
      case 9:
        positions.push({ top: '15%', left: '30%' })
        positions.push({ top: '15%', right: '30%' })
        positions.push({ top: '35%', left: '30%' })
        positions.push({ top: '35%', right: '30%' })
        positions.push({ top: '50%', left: '50%' })
        positions.push({ bottom: '35%', left: '30%', rotate: true })
        positions.push({ bottom: '35%', right: '30%', rotate: true })
        positions.push({ bottom: '15%', left: '30%', rotate: true })
        positions.push({ bottom: '15%', right: '30%', rotate: true })
        break
      case 10:
        positions.push({ top: '15%', left: '30%' })
        positions.push({ top: '15%', right: '30%' })
        positions.push({ top: '27%', left: '50%' })
        positions.push({ top: '35%', left: '30%' })
        positions.push({ top: '35%', right: '30%' })
        positions.push({ bottom: '35%', left: '30%', rotate: true })
        positions.push({ bottom: '35%', right: '30%', rotate: true })
        positions.push({ bottom: '27%', left: '50%', rotate: true })
        positions.push({ bottom: '15%', left: '30%', rotate: true })
        positions.push({ bottom: '15%', right: '30%', rotate: true })
        break
    }
    
    return positions.map((pos, i) => {
      const { rotate, ...cssProps } = pos as any
      return (
        <div key={i} style={{
          position: 'absolute',
          fontSize: symbolSize,
          color: suitColor,
          transform: rotate ? 'rotate(180deg)' : 'none',
          ...cssProps
        }}>
          {suitSymbol}
        </div>
      )
    })
  }

  // Face card designs with better styling
  const getFaceCardContent = (rank: string, suit: string) => {
    const faceSize = size === 'small' ? '16px' : size === 'medium' ? '24px' : '32px'
    
    let faceEmoji = ''
    let faceChar = ''
    
    switch(rank) {
      case 'J':
        faceEmoji = '🤴'
        faceChar = 'J'
        break
      case 'Q':
        faceEmoji = '👸'
        faceChar = 'Q'
        break
      case 'K':
        faceEmoji = '👑'
        faceChar = 'K'
        break
    }

    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        height: '70%',
        backgroundColor: '#fff',
        border: `3px solid ${suitColor}`,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          fontSize: faceSize,
          marginBottom: '2px'
        }}>
          {faceEmoji}
        </div>
        <div style={{
          fontSize: `calc(${faceSize} * 1.2)`,
          fontWeight: 'bold',
          color: suitColor,
          fontFamily: 'Georgia, serif',
          marginBottom: '2px'
        }}>
          {faceChar}
        </div>
        <div style={{
          fontSize: `calc(${faceSize} * 0.8)`,
          color: suitColor
        }}>
          {suitSymbol}
        </div>
      </div>
    )
  }

  return (
    <div 
      style={cardStyle}
      onClick={onClick}
      className={className}
      onMouseEnter={(e) => {
        if (onClick && !isAnimating) {
          e.currentTarget.style.transform = selected ? 'translateY(-8px) scale(1.1)' : 'translateY(-4px) scale(1.05)'
          e.currentTarget.style.boxShadow = selected 
            ? '0 16px 40px rgba(255, 215, 0, 0.6), 0 8px 20px rgba(0, 0, 0, 0.4)'
            : '0 8px 20px rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.2)'
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && !isAnimating) {
          e.currentTarget.style.transform = selected ? 'translateY(-8px) scale(1.1)' : 'none'
          e.currentTarget.style.boxShadow = selected 
            ? '0 12px 30px rgba(255, 215, 0, 0.5), 0 6px 15px rgba(0, 0, 0, 0.3)'
            : '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      {/* Card border */}
      <div style={{
        position: 'absolute',
        top: '2px',
        left: '2px',
        right: '2px',
        bottom: '2px',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: '6px',
        pointerEvents: 'none'
      }} />

      {/* Top-left corner */}
      <div style={{
        position: 'absolute',
        top: '4px',
        left: '4px',
        fontSize: cardSize.fontSize,
        fontWeight: 'bold',
        color: suitColor,
        lineHeight: '0.85',
        fontFamily: 'Georgia, serif',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '1px' }}>{displayRank}</div>
        <div style={{ 
          fontSize: `calc(${cardSize.fontSize} * 0.9)`
        }}>
          {suitSymbol}
        </div>
      </div>

      {/* Bottom-right corner (rotated) */}
      <div style={{
        position: 'absolute',
        bottom: '4px',
        right: '4px',
        fontSize: cardSize.fontSize,
        fontWeight: 'bold',
        color: suitColor,
        lineHeight: '0.85',
        fontFamily: 'Georgia, serif',
        textAlign: 'center',
        transform: 'rotate(180deg)'
      }}>
        <div style={{ marginBottom: '1px' }}>{displayRank}</div>
        <div style={{ 
          fontSize: `calc(${cardSize.fontSize} * 0.9)`
        }}>
          {suitSymbol}
        </div>
      </div>

      {/* Card center content */}
      <div style={{
        position: 'absolute',
        top: `calc(${cardSize.fontSize} + 8px)`,
        left: '6px',
        right: '6px',
        bottom: `calc(${cardSize.fontSize} + 8px)`
      }}>
        {isCardFace ? (
          getFaceCardContent(card.rank, card.suit)
        ) : card.rank === 'A' ? (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: `calc(${cardSize.fontSize} * 3)`,
            color: suitColor,
            fontWeight: 'bold'
          }}>
            {suitSymbol}
          </div>
        ) : (
          getSuitPattern(card.rank, card.suit)
        )}
      </div>

      {/* Special effect overlay for enhanced animations */}
      {glowEffect && (
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'radial-gradient(circle, rgba(6,214,160,0.1) 0%, transparent 70%)',
          borderRadius: '8px',
          pointerEvents: 'none'
        }} />
      )}
    </div>
  )
}

export default PlayingCard 