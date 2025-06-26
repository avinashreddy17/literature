import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, GameState, Player } from 'shared'
import AnimatedCard from './AnimatedCard'

interface CardAnimationManagerProps {
  gameState: GameState
  yourPlayerId: string
  onAnimationComplete?: (animationType: string) => void
  triggerTransferAnimation?: { 
    card: Card
    fromPlayerId: string
    toPlayerId: string
  } | null
  triggerClaimAnimation?: {
    cards: Card[]
    winningTeam: number
  } | null
}

interface AnimatingCard {
  id: string
  card: Card
  animationType: 'transfer' | 'claim'
  delay: number
  fromPosition?: { x: number; y: number }
  toPosition?: { x: number; y: number }
  targetPlayerId?: string
}

const CardAnimationManager: React.FC<CardAnimationManagerProps> = ({
  gameState,
  yourPlayerId,
  onAnimationComplete,
  triggerTransferAnimation = null,
  triggerClaimAnimation = null
}) => {
  const [animatingCards, setAnimatingCards] = useState<AnimatingCard[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate positions for players around the table
  const getPlayerPosition = useCallback((playerId: string) => {
    const player = gameState.players.find(p => p.id === playerId)
    if (!player) return { x: 0, y: 0 }
    
    const playerIndex = gameState.players.findIndex(p => p.id === playerId)
    const yourIndex = gameState.players.findIndex(p => p.id === yourPlayerId)
    
    if (playerId === yourPlayerId) {
      return { x: 50, y: 85 } // Bottom center for you
    }
    
    // Calculate position around oval table
    const otherPlayerIndex = playerIndex < yourIndex ? playerIndex : playerIndex - 1
    const totalOthers = gameState.players.length - 1
    const angle = (otherPlayerIndex * (2 * Math.PI)) / totalOthers - Math.PI / 2
    
    const radiusX = 35
    const radiusY = 25
    const x = 50 + (radiusX * Math.cos(angle))
    const y = 50 + (radiusY * Math.sin(angle))
    
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(10, Math.min(90, y))
    }
  }, [gameState.players, yourPlayerId])

  // Center table position for dealing
  const getCenterPosition = () => ({ x: 50, y: 50 })

  // Deal animation removed per user request

  // Handle transfer animation
  useEffect(() => {
    if (triggerTransferAnimation) {
      const { card, fromPlayerId, toPlayerId } = triggerTransferAnimation
      const fromPos = getPlayerPosition(fromPlayerId)
      const toPos = getPlayerPosition(toPlayerId)
      
      const transferCard: AnimatingCard = {
        id: `transfer-${Date.now()}`,
        card,
        animationType: 'transfer',
        delay: 0,
        fromPosition: { x: fromPos.x, y: fromPos.y },
        toPosition: { x: toPos.x, y: toPos.y },
        targetPlayerId: toPlayerId
      }
      
      setAnimatingCards([transferCard])
      
      setTimeout(() => {
        setAnimatingCards([])
        onAnimationComplete?.('transfer')
      }, 800)
    }
  }, [triggerTransferAnimation, getPlayerPosition, onAnimationComplete])

  // Handle claim animation
  useEffect(() => {
    if (triggerClaimAnimation) {
      const { cards, winningTeam } = triggerClaimAnimation
      const newAnimatingCards: AnimatingCard[] = cards.map((card, index) => ({
        id: `claim-${index}`,
        card,
        animationType: 'claim',
        delay: index * 50,
        toPosition: getCenterPosition()
      }))
      
      setAnimatingCards(newAnimatingCards)
      
      setTimeout(() => {
        setAnimatingCards([])
        onAnimationComplete?.('claim')
      }, cards.length * 50 + 1200)
    }
  }, [triggerClaimAnimation, onAnimationComplete])

  const convertPercentToPixels = (percent: number, isX: boolean) => {
    if (!containerRef.current) return 0
    const rect = containerRef.current.getBoundingClientRect()
    return (percent / 100) * (isX ? rect.width : rect.height)
  }

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000
      }}
    >
      {/* Center dealing deck removed */}

      {/* Animating cards */}
      {animatingCards.map((animCard) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          zIndex: 1002
        }

        // Position based on animation type
        if (animCard.animationType === 'transfer' && animCard.fromPosition) {
          style.top = `${animCard.fromPosition.y}%`
          style.left = `${animCard.fromPosition.x}%`
          style.transform = 'translate(-50%, -50%)'
        } else if (animCard.animationType === 'claim') {
          // Cards fly to center for claim
          style.top = '50%'
          style.left = '50%'
          style.transform = 'translate(-50%, -50%)'
        }

        return (
          <AnimatedCard
            key={animCard.id}
            card={animCard.card}
            isCardBack={false}
            size="medium"
            animationType={animCard.animationType}
            dealDelay={animCard.delay}
            transferFrom={animCard.fromPosition}
            transferTo={animCard.toPosition}
            glowEffect={animCard.animationType === 'claim'}
            style={style}
          />
        )
      })}

      {/* Success/Failure Animation Overlay */}
      {triggerTransferAnimation && (
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1003,
          animation: 'fadeInOut 2s ease-in-out'
        }}>
          <div style={{
            background: 'rgba(34, 197, 94, 0.9)',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '25px',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)'
          }}>
            ✅ Card Transferred!
          </div>
        </div>
      )}

      {/* Claim Animation Overlay */}
      {triggerClaimAnimation && (
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1003,
          animation: 'claimCelebration 2s ease-in-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
            color: 'white',
            padding: '20px 30px',
            borderRadius: '30px',
            fontSize: '22px',
            fontWeight: 'bold',
            textAlign: 'center',
            boxShadow: '0 12px 35px rgba(255, 215, 0, 0.5)',
            border: '3px solid rgba(255,255,255,0.3)'
          }}>
            🏆 HALF-SUIT CLAIMED! 🏆
            <div style={{ fontSize: '16px', marginTop: '5px', opacity: 0.9 }}>
              Team {triggerClaimAnimation.winningTeam === 0 ? 'Blue' : 'Red'} Wins!
            </div>
          </div>
        </div>
      )}

      {/* Animation Keyframes */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
        }
        
        @keyframes claimCelebration {
          0% { 
            opacity: 0; 
            transform: translateX(-50%) scale(0.5) rotate(-10deg); 
          }
          20% { 
            opacity: 1; 
            transform: translateX(-50%) scale(1.1) rotate(5deg); 
          }
          40% { 
            transform: translateX(-50%) scale(1) rotate(-2deg); 
          }
          60% { 
            transform: translateX(-50%) scale(1.05) rotate(1deg); 
          }
          80% { 
            transform: translateX(-50%) scale(1) rotate(0deg); 
          }
          100% { 
            opacity: 0; 
            transform: translateX(-50%) scale(0.8) rotate(0deg); 
          }
        }
      `}</style>
    </div>
  )
}

export default CardAnimationManager 