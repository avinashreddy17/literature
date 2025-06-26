import React, { useState, useEffect, useRef } from 'react'
import { Card } from 'shared'

interface AnimatedCardProps {
  card?: Card
  isCardBack?: boolean
  size?: 'small' | 'medium' | 'large'
  selected?: boolean
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
  // Animation props
  animationType?: 'none' | 'deal' | 'transfer' | 'claim' | 'hover' | 'flip'
  dealDelay?: number
  dealDirection?: 'from-center' | 'from-deck'
  transferFrom?: { x: number; y: number }
  transferTo?: { x: number; y: number }
  onAnimationComplete?: () => void
  isFlipping?: boolean
  glowEffect?: boolean
  pulsing?: boolean
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

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  card, 
  isCardBack = false, 
  size = 'medium',
  selected = false,
  onClick,
  className = '',
  style = {},
  animationType = 'none',
  dealDelay = 0,
  dealDirection = 'from-center',
  transferFrom,
  transferTo,
  onAnimationComplete,
  isFlipping = false,
  glowEffect = false,
  pulsing = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationPhase, setAnimationPhase] = useState('initial')
  const cardRef = useRef<HTMLDivElement>(null)

  const sizeClasses = {
    small: { width: '45px', height: '63px', fontSize: '11px' },
    medium: { width: '65px', height: '91px', fontSize: '14px' },
    large: { width: '85px', height: '119px', fontSize: '18px' }
  }

  const cardSize = sizeClasses[size]

  // Start animation when component mounts with animation type
  useEffect(() => {
    if (animationType !== 'none') {
      setTimeout(() => {
        setIsAnimating(true)
        setTimeout(() => {
          setAnimationPhase('complete')
          onAnimationComplete?.()
        }, getAnimationDuration())
      }, dealDelay)
    }
  }, [animationType, dealDelay])

  const getAnimationDuration = () => {
    switch (animationType) {
      case 'deal': return 800
      case 'transfer': return 600
      case 'claim': return 1000
      case 'flip': return 400
      default: return 300
    }
  }

  const getAnimationTransform = () => {
    if (!isAnimating && animationType === 'deal') {
      return dealDirection === 'from-center' 
        ? 'translate(-50vw, -50vh) scale(0.1) rotate(180deg)'
        : 'translate(0, -100vh) scale(0.1)'
    }
    
    if (!isAnimating && animationType === 'transfer' && transferFrom) {
      return `translate(${transferFrom.x}px, ${transferFrom.y}px) scale(0.8)`
    }

    if (animationType === 'claim' && isAnimating) {
      return 'scale(1.2) translateY(-20px)'
    }

    if (animationType === 'flip' && isFlipping) {
      return 'rotateY(180deg)'
    }

    if (selected) {
      return 'translateY(-8px) scale(1.1)'
    }

    return 'none'
  }

  const getAnimationStyles = (): React.CSSProperties => {
    const baseTransition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    
    let animationCSS = ''
    if (pulsing) {
      animationCSS += 'cardPulse 2s infinite, '
    }
    if (glowEffect) {
      animationCSS += 'cardGlow 1.5s ease-in-out infinite alternate, '
    }
    if (animationType === 'deal' && isAnimating) {
      animationCSS += 'cardDeal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), '
    }
    if (animationType === 'transfer' && isAnimating) {
      animationCSS += 'cardTransfer 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), '
    }

    return {
      transition: baseTransition,
      transform: getAnimationTransform(),
      animation: animationCSS.slice(0, -2), // Remove trailing comma and space
      transformOrigin: 'center',
      willChange: 'transform, opacity'
    }
  }

  const cardStyle: React.CSSProperties = {
    width: cardSize.width,
    height: cardSize.height,
    borderRadius: '8px',
    border: selected ? '3px solid #ffd700' : glowEffect ? '2px solid #06d6a0' : '1px solid #333',
    background: isCardBack 
      ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 95%, #e2e8f0 100%)',
    boxShadow: selected 
      ? '0 12px 30px rgba(255, 215, 0, 0.5), 0 6px 15px rgba(0, 0, 0, 0.3)'
      : glowEffect
      ? '0 8px 25px rgba(6, 214, 160, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)'
      : '0 4px 12px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.15)',
    cursor: onClick ? 'pointer' : 'default',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '6px',
    position: 'relative',
    ...getAnimationStyles(),
    ...style
  }

  // Card back design with animation effects
  if (isCardBack) {
    return (
      <>
        <div 
          ref={cardRef}
          style={cardStyle}
          onClick={onClick}
          className={className}
          onMouseEnter={(e) => {
            if (onClick && !isAnimating) {
              e.currentTarget.style.transform = selected ? 'translateY(-8px) scale(1.1)' : 'translateY(-4px) scale(1.05)'
            }
          }}
          onMouseLeave={(e) => {
            if (onClick && !isAnimating) {
              e.currentTarget.style.transform = selected ? 'translateY(-8px) scale(1.1)' : 'none'
            }
          }}
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
        {/* Animation Styles */}
        <style>{`
          @keyframes cardPulse {
            0%, 100% { 
              opacity: 1; 
              transform: scale(1); 
            }
            50% { 
              opacity: 0.8; 
              transform: scale(1.05); 
            }
          }
          
          @keyframes cardGlow {
            from { 
              box-shadow: 0 8px 25px rgba(6, 214, 160, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2); 
            }
            to { 
              box-shadow: 0 12px 35px rgba(6, 214, 160, 0.6), 0 6px 18px rgba(0, 0, 0, 0.3); 
            }
          }
          
          @keyframes cardDeal {
            0% {
              transform: translate(-50vw, -50vh) scale(0.1) rotate(180deg);
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translate(0, 0) scale(1) rotate(0deg);
              opacity: 1;
            }
          }
          
          @keyframes cardTransfer {
            0% {
              transform: translate(var(--from-x, 0), var(--from-y, 0)) scale(0.8);
            }
            50% {
              transform: translate(calc(var(--to-x, 0) / 2), calc(var(--to-y, 0) / 2)) scale(1.1);
            }
            100% {
              transform: translate(var(--to-x, 0), var(--to-y, 0)) scale(1);
            }
          }
        `}</style>
      </>
    )
  }

  // Empty card slot
  if (!card) {
    return (
      <div 
        ref={cardRef}
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
    <>
      <div 
        ref={cardRef}
        style={cardStyle}
        onClick={onClick}
        className={className}
        onMouseEnter={(e) => {
          if (onClick && !isAnimating) {
            e.currentTarget.style.transform = selected ? 'translateY(-8px) scale(1.1)' : 'translateY(-4px) scale(1.05)'
          }
        }}
        onMouseLeave={(e) => {
          if (onClick && !isAnimating) {
            e.currentTarget.style.transform = selected ? 'translateY(-8px) scale(1.1)' : 'none'
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

        {/* Center suit symbol with animation effects */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: `calc(${cardSize.fontSize} * 2.2)`,
          color: suitColor,
          opacity: glowEffect ? 0.3 : 0.15,
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
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
          border: '1px solid rgba(0,0,0,0.05)',
          borderRadius: '6px',
          pointerEvents: 'none'
        }} />

        {/* Special effect overlay for claims */}
        {animationType === 'claim' && isAnimating && (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)',
            borderRadius: '8px',
            animation: 'sparkle 1s ease-in-out'
          }} />
        )}
      </div>

      {/* Enhanced Animation Styles */}
      <style>{`
        @keyframes cardPulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.05); 
          }
        }
        
        @keyframes cardGlow {
          from { 
            box-shadow: 0 8px 25px rgba(6, 214, 160, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2); 
          }
          to { 
            box-shadow: 0 12px 35px rgba(6, 214, 160, 0.6), 0 6px 18px rgba(0, 0, 0, 0.3); 
          }
        }
        
        @keyframes cardDeal {
          0% {
            transform: translate(-50vw, -50vh) scale(0.1) rotate(180deg);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          80% {
            transform: translate(0, 0) scale(1.1) rotate(10deg);
          }
          100% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        @keyframes cardTransfer {
          0% {
            transform: scale(0.8);
            z-index: 1000;
          }
          50% {
            transform: scale(1.2);
            z-index: 1000;
          }
          100% {
            transform: scale(1);
            z-index: auto;
          }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  )
}

export default AnimatedCard 