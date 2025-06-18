// Core game types for Literature game

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: string;
  name: string;
  team: number; // 0 or 1
  hand: Card[];
  cardCount: number; // Public info - how many cards they have
}

export interface GameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  phase: 'waiting' | 'playing' | 'finished';
  claimedSets: {
    team: number; // Always 0 or 1 in simplified system (no cancelled sets)
    suit: Suit;
    isHigh: boolean; // true for 9-A, false for 2-7
    cards: Card[];
  }[];
  lastMove?: {
    fromPlayer: string;
    toPlayer: string;
    card: Card;
    successful: boolean;
  };
}

// Move types for game actions
export interface AskCardMove {
  type: 'ask';
  fromPlayerId: string;
  toPlayerId: string;
  card: Card;
}

export interface ClaimMove {
  type: 'claim';
  playerId: string;
  suit: Suit;
  isHigh: boolean;
  // Removed cardLocations - automatic card discovery now
} 