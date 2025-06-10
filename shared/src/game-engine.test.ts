import { createDeck, shuffleDeck, initializeGame } from './game-engine';
import { Card } from './types';

// Simple test function - we'll use proper testing framework later
export function testCreateDeck(): void {
  console.log('Testing createDeck()...');
  
  const deck = createDeck();
  
  // Test 1: Should have exactly 48 cards
  if (deck.length !== 48) {
    throw new Error(`Expected 48 cards, got ${deck.length}`);
  }
  console.log('✓ Deck has 48 cards');
  
  // Test 2: Should have no 8s (TypeScript ensures this at compile time)
  // Our Rank type doesn't include '8', so this is guaranteed by the type system
  console.log('✓ Deck contains no 8s (guaranteed by TypeScript)');
  
  // Test 3: Should have 4 suits
  const suits = new Set(deck.map(card => card.suit));
  if (suits.size !== 4) {
    throw new Error(`Expected 4 suits, got ${suits.size}`);
  }
  console.log('✓ Deck has 4 suits');
  
  // Test 4: Should have 12 cards per suit (48/4 = 12)
  const suitCounts = new Map();
  for (const card of deck) {
    suitCounts.set(card.suit, (suitCounts.get(card.suit) || 0) + 1);
  }
  
  for (const [suit, count] of suitCounts) {
    if (count !== 12) {
      throw new Error(`Expected 12 cards for ${suit}, got ${count}`);
    }
  }
  console.log('✓ Each suit has 12 cards');
  
  // Test 5: Should have correct ranks (no duplicates)
  const uniqueCards = new Set(deck.map(card => `${card.rank}-${card.suit}`));
  if (uniqueCards.size !== 48) {
    throw new Error('Deck contains duplicate cards');
  }
  console.log('✓ All cards are unique');
  
  console.log('All tests passed! 🎉');
}

export function testShuffleDeck(): void {
  console.log('Testing shuffleDeck()...');
  
  const originalDeck = createDeck();
  const deckCopy = [...originalDeck]; // Make a copy to compare
  
  // Test 1: Shuffling should return the same deck object
  const shuffledDeck = shuffleDeck(originalDeck);
  if (shuffledDeck !== originalDeck) {
    throw new Error('shuffleDeck should modify and return the same array');
  }
  console.log('✓ Returns the same deck object');
  
  // Test 2: Should still have 48 cards
  if (shuffledDeck.length !== 48) {
    throw new Error(`Expected 48 cards after shuffle, got ${shuffledDeck.length}`);
  }
  console.log('✓ Still has 48 cards after shuffle');
  
  // Test 3: Should have same cards (just different order)
  const originalCardStrings = deckCopy.map(card => `${card.rank}-${card.suit}`).sort();
  const shuffledCardStrings = shuffledDeck.map(card => `${card.rank}-${card.suit}`).sort();
  
  if (originalCardStrings.join(',') !== shuffledCardStrings.join(',')) {
    throw new Error('Shuffled deck has different cards than original');
  }
  console.log('✓ Contains the same cards as original');
  
  // Test 4: Should be in different order (very likely with 48 cards)
  const originalOrder = deckCopy.map(card => `${card.rank}-${card.suit}`).join(',');
  const shuffledOrder = shuffledDeck.map(card => `${card.rank}-${card.suit}`).join(',');
  
  if (originalOrder === shuffledOrder) {
    console.log('⚠️  Warning: Shuffled deck is in same order (very unlikely but possible)');
  } else {
    console.log('✓ Deck order changed after shuffle');
  }
  
  // Test 5: Multiple shuffles should produce different orders
  const firstShuffle = [...shuffledDeck];
  shuffleDeck(shuffledDeck);
  const secondShuffle = [...shuffledDeck];
  
  const firstOrder = firstShuffle.map(card => `${card.rank}-${card.suit}`).join(',');
  const secondOrder = secondShuffle.map(card => `${card.rank}-${card.suit}`).join(',');
  
  if (firstOrder === secondOrder) {
    console.log('⚠️  Warning: Two consecutive shuffles produced same order (unlikely but possible)');
  } else {
    console.log('✓ Multiple shuffles produce different orders');
  }
  
  console.log('All shuffle tests passed! 🃏');
}

export function testInitializeGame(): void {
  console.log('Testing initializeGame()...');
  
  // Test both 6-player and 8-player games
  testGameSetup(6, 8);
  testGameSetup(8, 6);
  
  // Test error handling
  try {
    initializeGame(['Too', 'Few']);
    throw new Error('Should have thrown error for too few players');
  } catch (error) {
    if (error instanceof Error && error.message === 'Literature requires exactly 6 or 8 players') {
      console.log('✓ Correctly rejects wrong number of players');
    } else {
      throw error;
    }
  }
  
  try {
    initializeGame(['1', '2', '3', '4', '5', '6', '7']); // 7 players
    throw new Error('Should have thrown error for 7 players');
  } catch (error) {
    if (error instanceof Error && error.message === 'Literature requires exactly 6 or 8 players') {
      console.log('✓ Correctly rejects 7 players');
    } else {
      throw error;
    }
  }
  
  console.log('All game initialization tests passed! 🎮');
}

function testGameSetup(playerCount: number, expectedCardsPerPlayer: number): void {
  console.log(`\nTesting ${playerCount}-player game...`);
  
  const playerNames = Array.from({ length: playerCount }, (_, i) => `Player${i + 1}`);
  const gameState = initializeGame(playerNames);
  
  // Test 1: Should have correct number of players
  if (gameState.players.length !== playerCount) {
    throw new Error(`Expected ${playerCount} players, got ${gameState.players.length}`);
  }
  console.log(`✓ Game has ${playerCount} players`);
  
  // Test 2: Each player should have correct number of cards
  for (const player of gameState.players) {
    if (player.hand.length !== expectedCardsPerPlayer) {
      throw new Error(`Player ${player.name} has ${player.hand.length} cards, expected ${expectedCardsPerPlayer}`);
    }
    if (player.cardCount !== expectedCardsPerPlayer) {
      throw new Error(`Player ${player.name} cardCount is ${player.cardCount}, expected ${expectedCardsPerPlayer}`);
    }
  }
  console.log(`✓ Each player has exactly ${expectedCardsPerPlayer} cards`);
  
  // Test 3: Teams should alternate (0, 1, 0, 1, ...)
  for (let i = 0; i < playerCount; i++) {
    const expectedTeam = i % 2;
    if (gameState.players[i].team !== expectedTeam) {
      throw new Error(`Player ${i} should be on team ${expectedTeam}, got ${gameState.players[i].team}`);
    }
  }
  console.log('✓ Teams alternate correctly');
  
  // Test 4: Teams should be balanced
  const team0Count = gameState.players.filter(p => p.team === 0).length;
  const team1Count = gameState.players.filter(p => p.team === 1).length;
  const expectedTeamSize = playerCount / 2;
  
  if (team0Count !== expectedTeamSize || team1Count !== expectedTeamSize) {
    throw new Error(`Teams should have ${expectedTeamSize} players each, got ${team0Count} and ${team1Count}`);
  }
  console.log(`✓ Teams balanced (${expectedTeamSize} players each)`);
  
  // Test 5: All 48 cards should be distributed
  const allCards: Card[] = [];
  for (const player of gameState.players) {
    allCards.push(...player.hand);
  }
  if (allCards.length !== 48) {
    throw new Error(`Expected 48 total cards, got ${allCards.length}`);
  }
  console.log('✓ All 48 cards distributed to players');
  
  // Test 6: No duplicate cards
  const cardStrings = allCards.map(card => `${card.rank}-${card.suit}`);
  const uniqueCards = new Set(cardStrings);
  if (uniqueCards.size !== 48) {
    throw new Error('Found duplicate cards in dealt hands');
  }
  console.log('✓ No duplicate cards in any player hand');
  
  // Test 7: Player IDs should be generated correctly
  for (let i = 0; i < playerCount; i++) {
    const expectedId = `player${i + 1}`;
    if (gameState.players[i].id !== expectedId) {
      throw new Error(`Expected player ID '${expectedId}', got '${gameState.players[i].id}'`);
    }
  }
  console.log('✓ Player IDs generated correctly');
  
  // Test 8: Game state properties
  if (gameState.phase !== 'waiting') {
    throw new Error(`Expected phase 'waiting', got '${gameState.phase}'`);
  }
  if (gameState.claimedSets.length !== 0) {
    throw new Error(`Expected 0 claimed sets, got ${gameState.claimedSets.length}`);
  }
  if (gameState.lastMove !== undefined) {
    throw new Error('Expected lastMove to be undefined');
  }
  if (typeof gameState.id !== 'string' || !gameState.id.startsWith('game_')) {
    throw new Error(`Expected game ID to start with 'game_', got '${gameState.id}'`);
  }
  if (gameState.currentPlayerIndex < 0 || gameState.currentPlayerIndex >= playerCount) {
    throw new Error(`Current player index should be 0-${playerCount - 1}, got ${gameState.currentPlayerIndex}`);
  }
  console.log('✓ Game state properties set correctly');
}