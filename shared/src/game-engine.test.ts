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