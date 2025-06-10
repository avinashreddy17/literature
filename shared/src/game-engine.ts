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
 * Initializes a new Literature game with 6 or 8 players
 * 6 players: 2 teams of 3, 8 cards each
 * 8 players: 2 teams of 4, 6 cards each
 */
export function initializeGame(playerNames: string[]): GameState {
  const playerCount = playerNames.length;
  
  if (playerCount !== 6 && playerCount !== 8) {
    throw new Error('Literature requires exactly 6 or 8 players');
  }

  // Calculate cards per player: 48 total cards divided by player count
  const cardsPerPlayer = 48 / playerCount; // 8 for 6 players, 6 for 8 players

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

  // Deal cards: cardsPerPlayer per player, dealing one at a time
  let cardIndex = 0;
  for (let round = 0; round < cardsPerPlayer; round++) {
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      players[playerIndex].hand.push(deck[cardIndex]);
      players[playerIndex].cardCount++;
      cardIndex++;
    }
  }

  // Choose random starting player
  const currentPlayerIndex = Math.floor(Math.random() * playerCount);

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