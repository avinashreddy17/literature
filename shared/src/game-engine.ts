import { Card, Suit, Rank, Player, GameState } from './types';

/**
 * Creates a Literature game deck (48 cards - standard deck minus all 8s)
 * Returns an array of Card objects
 */
export function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '9', '10', 'J', 'Q', 'K', 'A'];
  
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  
  return deck;
}

/**
 * Shuffles a deck of cards using the Fisher-Yates algorithm
 * Modifies the original array and returns it
 */
export function shuffleDeck(deck: Card[]): Card[] {
  // Fisher-Yates shuffle algorithm
  for (let i = deck.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i (inclusive)
    const randomIndex = Math.floor(Math.random() * (i + 1));
    
    // Swap current card with the randomly selected card
    [deck[i], deck[randomIndex]] = [deck[randomIndex], deck[i]];
  }
  
  return deck;
}

/**
 * Initializes a new Literature game with 6 players
 * Players are assigned to alternating teams and dealt 8 cards each
 */
export function initializeGame(playerNames: string[]): GameState {
  if (playerNames.length !== 6) {
    throw new Error('Literature requires exactly 6 players');
  }

  // Create and shuffle a fresh deck
  const deck = shuffleDeck(createDeck());
  
  // Create players with alternating teams
  const players: Player[] = playerNames.map((name, index) => ({
    id: name.toLowerCase().replace(/\s+/g, ''), // Convert to ID
    name: name,
    team: index % 2, // Alternates between 0 and 1
    hand: [],
    cardCount: 0
  }));

  // Deal cards: 8 cards per player, dealing one at a time
  let cardIndex = 0;
  for (let round = 0; round < 8; round++) {
    for (let playerIndex = 0; playerIndex < 6; playerIndex++) {
      players[playerIndex].hand.push(deck[cardIndex]);
      players[playerIndex].cardCount++;
      cardIndex++;
    }
  }

  // Choose random starting player
  const currentPlayerIndex = Math.floor(Math.random() * 6);

  // Create initial game state
  const gameState: GameState = {
    id: generateGameId(),
    players,
    currentPlayerIndex,
    phase: 'waiting',
    claimedSets: [],
    lastMove: undefined
  };

  return gameState;
}

/**
 * Generates a unique game ID
 */
function generateGameId(): string {
  return 'game_' + Math.random().toString(36).substring(2, 15);
} 