import { createDeck, shuffleDeck, initializeGame, validateMove, applyMove, checkClaim, isGameOver, getGameResults, endGame, processClaimWithGameEnd, processAskMoveWithGameEnd } from './game-engine';
import { Card, GameState, AskCardMove, ClaimMove, Suit, Rank, Player } from './types';

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

export function testValidateMove(): void {
  console.log('Testing validateMove()...');
  
  // Create a test game state
  const gameState = createTestGameState();
  
  // Test 1: Valid ask-card move
  const validMove: AskCardMove = {
    type: 'ask',
    fromPlayerId: 'alice',
    toPlayerId: 'bob',
    card: { suit: 'hearts', rank: '3' } // Alice has heart2, asking for heart3
  };
  
  if (!validateMove(gameState, validMove)) {
    throw new Error('Valid move should be accepted');
  }
  console.log('✓ Accepts valid ask-card move');
  
  // Test 2: Wrong phase - game not started
  const waitingState = { ...gameState, phase: 'waiting' as const };
  if (validateMove(waitingState, validMove)) {
    throw new Error('Should reject move when game is not in playing phase');
  }
  console.log('✓ Rejects moves when game not in playing phase');
  
  // Test 3: Not player's turn
  const wrongTurnMove: AskCardMove = {
    type: 'ask',
    fromPlayerId: 'bob', // Bob's turn is index 1, but current is 0 (Alice)
    toPlayerId: 'alice',
    card: { suit: 'spades', rank: '9' }
  };
  
  if (validateMove(gameState, wrongTurnMove)) {
    throw new Error('Should reject move when it\'s not player\'s turn');
  }
  console.log('✓ Rejects moves when not player\'s turn');
  
  // Test 4: Asking teammate
  const teammateMove: AskCardMove = {
    type: 'ask',
    fromPlayerId: 'alice',
    toPlayerId: 'charlie', // Both Alice and Charlie are on team 0
    card: { suit: 'hearts', rank: '4' }
  };
  
  if (validateMove(gameState, teammateMove)) {
    throw new Error('Should reject move when asking teammate');
  }
  console.log('✓ Rejects asking teammate for cards');
  
  // Test 5: Asking player with no cards
  const noCardsState = { ...gameState };
  noCardsState.players[1].cardCount = 0; // Bob has no cards
  
  if (validateMove(noCardsState, validMove)) {
    throw new Error('Should reject asking player with no cards');
  }
  console.log('✓ Rejects asking player with no cards');
  
  // Test 6: Asking for card you already have
  const hasCardMove: AskCardMove = {
    type: 'ask',
    fromPlayerId: 'alice',
    toPlayerId: 'bob',
    card: { suit: 'hearts', rank: '2' } // Alice already has heart2
  };
  
  if (validateMove(gameState, hasCardMove)) {
    throw new Error('Should reject asking for card you already have');
  }
  console.log('✓ Rejects asking for card you already have');
  
  // Test 7: Asking for card without having same half-suit
  const noHalfSuitMove: AskCardMove = {
    type: 'ask',
    fromPlayerId: 'alice',
    toPlayerId: 'bob',
    card: { suit: 'diamonds', rank: 'K' } // Alice has no diamonds
  };
  
  if (validateMove(gameState, noHalfSuitMove)) {
    throw new Error('Should reject asking for card without having same half-suit');
  }
  console.log('✓ Rejects asking without having same half-suit');
  
  // Test 8: Wrong half-suit (asking for high when you have low)
  const wrongHalfSuitMove: AskCardMove = {
    type: 'ask',
    fromPlayerId: 'alice',
    toPlayerId: 'bob',
    card: { suit: 'hearts', rank: 'K' } // Alice has heart2 (low), asking for heartK (high)
  };
  
  if (validateMove(gameState, wrongHalfSuitMove)) {
    throw new Error('Should reject asking for wrong half-suit');
  }
  console.log('✓ Rejects asking for wrong half-suit');
  
  // Test 9: Nonexistent target player
  const noPlayerMove: AskCardMove = {
    type: 'ask',
    fromPlayerId: 'alice',
    toPlayerId: 'nonexistent',
    card: { suit: 'hearts', rank: '3' }
  };
  
  if (validateMove(gameState, noPlayerMove)) {
    throw new Error('Should reject move with nonexistent target player');
  }
  console.log('✓ Rejects move with nonexistent target player');
  
  // Test 10: Valid claim moves should be accepted
  const validClaimMove: ClaimMove = {
    type: 'claim',
    playerId: 'alice',
    suit: 'hearts',
    isHigh: false
  };
  
  if (!validateMove(gameState, validClaimMove)) {
    throw new Error('Should accept valid claim moves');
  }
  console.log('✓ Accepts valid claim moves');
  
  // Test 11: Already claimed half-suits should be rejected
  const alreadyClaimedGameState = {
    ...gameState,
    claimedSets: [
      {
        team: 0,
        suit: 'hearts' as Suit,
        isHigh: false,
        cards: []
      }
    ]
  };
  
  const invalidClaimMove: ClaimMove = {
    type: 'claim',
    playerId: 'alice',
    suit: 'hearts',
    isHigh: false
  };
  
  if (validateMove(alreadyClaimedGameState, invalidClaimMove)) {
    throw new Error('Should reject claim moves for already claimed half-suits');
  }
  console.log('✓ Rejects already claimed half-suits');
  
  console.log('All validateMove tests passed! ✅');
}

export function testApplyMove(): void {
  console.log('Testing applyMove()...');
  
  // Test 1: Successful ask-card move
  const gameState = createTestGameState();
  const validMove: AskCardMove = {
    type: 'ask',
    fromPlayerId: 'alice',
    toPlayerId: 'bob', 
    card: { suit: 'hearts', rank: '3' } // Bob has heart3
  };
  
  const newState = applyMove(gameState, validMove);
  
  // Check that card was transferred
  const alice = newState.players.find(p => p.id === 'alice')!;
  const bob = newState.players.find(p => p.id === 'bob')!;
  
  const aliceHasCard = alice.hand.some(card => 
    card.suit === 'hearts' && card.rank === '3'
  );
  const bobHasCard = bob.hand.some(card => 
    card.suit === 'hearts' && card.rank === '3'
  );
  
  if (!aliceHasCard) {
    throw new Error('Alice should have received the heart3');
  }
  if (bobHasCard) {
    throw new Error('Bob should no longer have the heart3');
  }
  
  // Check card counts updated
  if (alice.cardCount !== 4 || bob.cardCount !== 2) {
    throw new Error(`Expected Alice: 4 cards, Bob: 2 cards. Got Alice: ${alice.cardCount}, Bob: ${bob.cardCount}`);
  }
  
  // Check that Alice keeps the turn (successful ask)
  if (newState.currentPlayerIndex !== 0) {
    throw new Error('Alice should keep the turn after successful ask');
  }
  
  // Check lastMove recorded correctly
  if (!newState.lastMove || newState.lastMove.successful !== true) {
    throw new Error('LastMove should record successful transfer');
  }
  
  console.log('✓ Successful ask-card move works correctly');
  
  // Test 2: Unsuccessful ask-card move  
  const failMove: AskCardMove = {
    type: 'ask',
    fromPlayerId: 'alice',
    toPlayerId: 'bob',
    card: { suit: 'spades', rank: 'K' } // Bob doesn't have spadeK
  };
  
  const failState = applyMove(gameState, failMove);
  
  // Check that no cards were transferred
  const alice2 = failState.players.find(p => p.id === 'alice')!;
  const bob2 = failState.players.find(p => p.id === 'bob')!;
  
  if (alice2.cardCount !== 3 || bob2.cardCount !== 3) {
    throw new Error('Card counts should remain unchanged on failed ask');
  }
  
  // Check that turn passed to Bob (target player)
  const bobIndex = failState.players.findIndex(p => p.id === 'bob');
  if (failState.currentPlayerIndex !== bobIndex) {
    throw new Error('Turn should pass to target player on failed ask');
  }
  
  // Check lastMove recorded correctly
  if (!failState.lastMove || failState.lastMove.successful !== false) {
    throw new Error('LastMove should record failed attempt');
  }
  
  console.log('✓ Unsuccessful ask-card move works correctly');
  
  // Test 3: State immutability - original state unchanged
  if (gameState.players[0].cardCount !== 3) {
    throw new Error('Original game state should not be modified');
  }
  
  console.log('✓ Original game state remains unchanged (immutable)');
  
  // Test 4: Multiple successful asks in a row
  let chainState = createTestGameState();
  
  // Alice asks Bob for heart3 (successful)
  const move1: AskCardMove = {
    type: 'ask',
    fromPlayerId: 'alice',
    toPlayerId: 'bob',
    card: { suit: 'hearts', rank: '3' }
  };
  chainState = applyMove(chainState, move1);
  
  // Alice still has turn, asks Charlie for heart4 (successful)
  const move2: AskCardMove = {
    type: 'ask', 
    fromPlayerId: 'alice',
    toPlayerId: 'charlie',
    card: { suit: 'hearts', rank: '4' }
  };
  chainState = applyMove(chainState, move2);
  
  const aliceAfterChain = chainState.players.find(p => p.id === 'alice')!;
  if (aliceAfterChain.cardCount !== 5) { // Started with 3, got 2 more
    throw new Error('Alice should have 5 cards after successful chain');
  }
  
  // Alice should still have the turn
  if (chainState.currentPlayerIndex !== 0) {
    throw new Error('Alice should still have turn after successful chain');
  }
  
  console.log('✓ Multiple successful asks work correctly');
  
  // Test 5: Claim moves now work through checkClaim
  const claimMove: ClaimMove = {
    type: 'claim',
    playerId: 'alice',
    suit: 'hearts',
    isHigh: false
  };
  
  // This should not throw error, but will fail validation inside checkClaim
  try {
    const claimResult = applyMove(gameState, claimMove);
    // Should return updated state even if claim fails
    if (!claimResult) {
      throw new Error('applyMove should return a state for claim moves');
    }
    console.log('✓ Claim moves now processed through checkClaim');
  } catch (error) {
    throw new Error('Claim moves should not throw errors, should return result');
  }
  
  // Test 6: LastMove details are correct
  const detailState = createTestGameState();
  const detailMove: AskCardMove = {
    type: 'ask',
    fromPlayerId: 'alice',
    toPlayerId: 'bob',
    card: { suit: 'clubs', rank: '5' } // Bob has club5
  };
  
  const detailResult = applyMove(detailState, detailMove);
  const lastMove = detailResult.lastMove!;
  
  if (lastMove.fromPlayer !== 'alice' || 
      lastMove.toPlayer !== 'bob' ||
      lastMove.card.suit !== 'clubs' ||
      lastMove.card.rank !== '5' ||
      lastMove.successful !== true) {
    throw new Error('LastMove details are incorrect');
  }
  
  console.log('✓ LastMove details recorded correctly');
  
  console.log('All applyMove tests passed! 🎯');
}

function createTestGameState(): GameState {
  // Create a controlled test game state for validation testing
  return {
    id: 'test_game',
    phase: 'playing',
    currentPlayerIndex: 0, // Alice's turn
    players: [
      {
        id: 'alice',
        name: 'Alice',
        team: 0,
        cardCount: 3,
        hand: [
          { suit: 'hearts', rank: '2' }, // Low hearts
          { suit: 'clubs', rank: 'K' },  // High clubs
          { suit: 'spades', rank: '7' }  // Low spades
        ]
      },
      {
        id: 'bob',
        name: 'Bob',
        team: 1,
        cardCount: 3,
        hand: [
          { suit: 'hearts', rank: '3' }, // Low hearts
          { suit: 'diamonds', rank: '10' }, // High diamonds
          { suit: 'clubs', rank: '5' }   // Low clubs
        ]
      },
      {
        id: 'charlie',
        name: 'Charlie',
        team: 0, // Same team as Alice
        cardCount: 2,
        hand: [
          { suit: 'hearts', rank: '4' }, // Low hearts
          { suit: 'spades', rank: 'A' }  // High spades
        ]
      }
    ],
    claimedSets: [],
    lastMove: undefined
  };
}

export function testCheckClaim(): void {
  console.log('Testing checkClaim() with simplified all-or-nothing logic...');
  
  // Test 1: Successful claim - claiming team has ALL 6 cards
  const gameState = createClaimTestGameState();
  const successfulClaim: ClaimMove = {
    type: 'claim',
    playerId: 'alice',
    suit: 'hearts',
    isHigh: false // Low hearts: 2,3,4,5,6,7
  };
  
  const result1 = checkClaim(gameState, successfulClaim);
  
  if (!result1.success || result1.winningTeam !== 0) {
    throw new Error('Successful claim should win for claiming team (team 0)');
  }
  
  if (result1.updatedState.claimedSets.length !== 1) {
    throw new Error('Should have one claimed set');
  }
  
  // Check that cards were removed from players
  const aliceAfter = result1.updatedState.players.find((p: any) => p.id === 'alice')!;
  const charlieAfter = result1.updatedState.players.find((p: any) => p.id === 'charlie')!;
  
  if (aliceAfter.cardCount !== 1 || charlieAfter.cardCount !== 1) {
    throw new Error('Cards should be removed after successful claim');
  }
  
  if (!result1.message.includes('Team 0 successfully claimed')) {
    throw new Error('Success message should be clear');
  }
  
  console.log('✓ Successful claim works correctly (team has all cards)');
  
  // Test 2: Failed claim - claiming team missing cards, opposing team wins
  const failedClaim: ClaimMove = {
    type: 'claim',
    playerId: 'alice',
    suit: 'spades',
    isHigh: false // Low spades: 2,3,4,5,6,7 (team 0 doesn't have all)
  };
  
  const result2 = checkClaim(gameState, failedClaim);
  
  if (result2.success || result2.winningTeam !== 1) {
    throw new Error('Failed claim should award to opposing team (team 1)');
  }
  
  if (!result2.message.includes('Team 1 gets the half-suit')) {
    throw new Error('Should indicate opposing team gets the points');
  }
  
  // Check that cards were still removed (half-suit completed)
  const spadesCards = ['2', '3', '4', '5', '6', '7'].map(rank => ({ suit: 'spades', rank }));
  const updatedPlayers = result2.updatedState.players;
  
  // Verify no player has any of the spades low cards anymore
  for (const player of updatedPlayers) {
    for (const card of player.hand) {
      if (card.suit === 'spades' && spadesCards.some(sc => sc.rank === card.rank)) {
        throw new Error('Spades low cards should be removed from all players');
      }
    }
  }
  
  console.log('✓ Failed claim awards to opposing team correctly');
  
  // Test 3: High half-suit claim (different ranks)
  const highClaim: ClaimMove = {
    type: 'claim',
    playerId: 'alice',
    suit: 'clubs',
    isHigh: true // High clubs: 9,10,J,Q,K,A (team 0 has all these)
  };
  
  const result3 = checkClaim(gameState, highClaim);
  
  if (!result3.success || result3.winningTeam !== 0) {
    throw new Error('High claim should succeed for team 0');
  }
  
  if (!result3.message.includes('high clubs')) {
    throw new Error('Should mention high half-suit in message');
  }
  
  console.log('✓ High half-suit claiming works correctly');
  
  // Test 4: Already claimed half-suit should be blocked by validation
  const alreadyClaimedState = {
    ...gameState,
    claimedSets: [
      {
        team: 0,
        suit: 'hearts' as Suit,
        isHigh: false,
        cards: []
      }
    ]
  };
  
  const alreadyClaimedClaim: ClaimMove = {
    type: 'claim',
    playerId: 'alice',
    suit: 'hearts',
    isHigh: false
  };
  
  // This should be blocked by validateClaimMove
  if (validateMove(alreadyClaimedState, alreadyClaimedClaim)) {
    throw new Error('Should not validate claim for already claimed half-suit');
  }
  
    console.log('✓ Already claimed half-suits blocked by validation');
  console.log('\n🎉 All simplified claim tests passed!');
}

function createClaimTestGameState(): GameState {
  // Create a controlled test game state for simplified claim testing
  return {
    id: 'test_claim_game',
    phase: 'playing',
    currentPlayerIndex: 0, // Alice's turn
    players: [
      {
        id: 'alice',
        name: 'Alice',
        team: 0,
        cardCount: 3,
        hand: [
          { suit: 'hearts', rank: '2' }, // Low hearts - team 0 has all 6
          { suit: 'hearts', rank: '3' }, // Low hearts
          { suit: 'clubs', rank: '9' }   // High clubs - team 0 has all 6
        ]
      },
      {
        id: 'bob',
        name: 'Bob',
        team: 1,
        cardCount: 3,
        hand: [
          { suit: 'spades', rank: '2' }, // Low spades - team 1 has some
          { suit: 'spades', rank: '3' }, // Low spades
          { suit: 'diamonds', rank: '9' } // High diamonds
        ]
      },
      {
        id: 'charlie',
        name: 'Charlie',
        team: 0, // Same team as Alice
        cardCount: 5,
        hand: [
          { suit: 'hearts', rank: '4' }, // Low hearts - completes team 0's set
          { suit: 'hearts', rank: '5' }, // Low hearts
          { suit: 'hearts', rank: '6' }, // Low hearts
          { suit: 'hearts', rank: '7' }, // Low hearts
          { suit: 'clubs', rank: '10' }  // High clubs - completes team 0's set
        ]
      },
      {
        id: 'diana',
        name: 'Diana',
        team: 0, // Same team as Alice and Charlie
        cardCount: 4,
        hand: [
          { suit: 'clubs', rank: 'J' },  // High clubs
          { suit: 'clubs', rank: 'Q' },  // High clubs
          { suit: 'clubs', rank: 'K' },  // High clubs
          { suit: 'clubs', rank: 'A' }   // High clubs - completes team 0's set
        ]
      }
    ],
    claimedSets: [],
    lastMove: undefined
  };
}

// Add tests for game ending logic
testGameEnding();

function testGameEnding() {
  console.log('\n=== Testing Game Ending Logic ===');
  
  // Test 1: isGameOver function
  console.log('\n--- Test 1: isGameOver function ---');
  const gameState = initializeGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
  
  if (isGameOver(gameState)) {
    throw new Error('New game should not be over');
  }
  console.log('✓ New game correctly identified as not over');
  
  // Simulate a game with 7 claimed sets (not over)
  const gameWith7Sets = {
    ...gameState,
    claimedSets: Array(7).fill(null).map((_, i) => ({
      team: i % 2, // Alternate teams
      suit: 'hearts' as Suit,
      isHigh: i % 2 === 0, 
      cards: []
    }))
  };
  
  if (isGameOver(gameWith7Sets)) {
    throw new Error('Game with 7 sets should not be over');
  }
  console.log('✓ Game with 7 claimed sets correctly identified as not over');
  
  // Simulate a complete game with all 8 sets claimed
  const completeGame = {
    ...gameState,
    claimedSets: Array(8).fill(null).map((_, i) => ({
      team: i % 2, // Alternate teams  
      suit: 'hearts' as Suit,
      isHigh: i % 2 === 0,
      cards: []
    }))
  };
  
  if (!isGameOver(completeGame)) {
    throw new Error('Game with 8 sets should be over');
  }
  console.log('✓ Game with 8 claimed sets correctly identified as over');
  
  // Test 2: getGameResults function
  console.log('\n--- Test 2: getGameResults function ---');
  
  // Test Team 0 wins (5-3 score)
  const team0WinsGame = {
    ...gameState,
    claimedSets: [
      // Team 0 gets 5 sets
      { team: 0, suit: 'hearts' as Suit, isHigh: true, cards: [] },
      { team: 0, suit: 'hearts' as Suit, isHigh: false, cards: [] },
      { team: 0, suit: 'diamonds' as Suit, isHigh: true, cards: [] },
      { team: 0, suit: 'diamonds' as Suit, isHigh: false, cards: [] },
      { team: 0, suit: 'clubs' as Suit, isHigh: true, cards: [] },
      // Team 1 gets 3 sets
      { team: 1, suit: 'clubs' as Suit, isHigh: false, cards: [] },
      { team: 1, suit: 'spades' as Suit, isHigh: true, cards: [] },
      { team: 1, suit: 'spades' as Suit, isHigh: false, cards: [] }
    ]
  };
  
  const results1 = getGameResults(team0WinsGame);
  if (!results1.isGameOver || results1.winner !== 0 || results1.team0Score !== 5 || results1.team1Score !== 3) {
    throw new Error('Team 0 win scenario failed');
  }
  console.log('✓ Team 0 win scenario works correctly (5-3)');
  
  // Test tied game (4-4 with 0 cancelled)
  const tiedGame = {
    ...gameState,
    claimedSets: [
      // Team 0 gets 4 sets
      { team: 0, suit: 'hearts' as Suit, isHigh: true, cards: [] },
      { team: 0, suit: 'hearts' as Suit, isHigh: false, cards: [] },
      { team: 0, suit: 'diamonds' as Suit, isHigh: true, cards: [] },
      { team: 0, suit: 'diamonds' as Suit, isHigh: false, cards: [] },
      // Team 1 gets 4 sets
      { team: 1, suit: 'clubs' as Suit, isHigh: true, cards: [] },
      { team: 1, suit: 'clubs' as Suit, isHigh: false, cards: [] },
      { team: 1, suit: 'spades' as Suit, isHigh: true, cards: [] },
      { team: 1, suit: 'spades' as Suit, isHigh: false, cards: [] }
    ]
  };
  
  const results2 = getGameResults(tiedGame);
  if (!results2.isGameOver || results2.winner !== null || results2.team0Score !== 4 || results2.team1Score !== 4) {
    throw new Error('Tied game scenario failed');
  }
  console.log('✓ Tied game scenario works correctly (4-4)');
  
  // Test game with Team 1 win (3-5 score) - no cancelled sets in simplified system
  const team1WinGame = {
    ...gameState,
    claimedSets: [
      // Team 0 gets 3 sets
      { team: 0, suit: 'hearts' as Suit, isHigh: true, cards: [] },
      { team: 0, suit: 'hearts' as Suit, isHigh: false, cards: [] },
      { team: 0, suit: 'diamonds' as Suit, isHigh: true, cards: [] },
      // Team 1 gets 5 sets
      { team: 1, suit: 'diamonds' as Suit, isHigh: false, cards: [] },
      { team: 1, suit: 'clubs' as Suit, isHigh: true, cards: [] },
      { team: 1, suit: 'clubs' as Suit, isHigh: false, cards: [] },
      { team: 1, suit: 'spades' as Suit, isHigh: true, cards: [] },
      { team: 1, suit: 'spades' as Suit, isHigh: false, cards: [] }
    ]
  };
  
  const results3 = getGameResults(team1WinGame);
  if (!results3.isGameOver || results3.winner !== 1 || results3.team0Score !== 3 || results3.team1Score !== 5 || results3.cancelledSets !== 0) {
    throw new Error('Team 1 win scenario failed');
  }
  console.log('✓ Team 1 win scenario works correctly (3-5, no cancelled sets)');
  
  // Test 3: endGame function
  console.log('\n--- Test 3: endGame function ---');
  
  const finishedGame = endGame(completeGame);
  if (finishedGame.phase !== 'finished') {
    throw new Error('endGame should set phase to finished');
  }
  console.log('✓ endGame sets phase to finished');
  
  // Test error when trying to end unfinished game
  try {
    endGame(gameWith7Sets);
    throw new Error('Should have thrown error for unfinished game');
  } catch (error: any) {
    if (!error.message.includes('Cannot end game')) {
      throw new Error('Wrong error message for unfinished game');
    }
  }
  console.log('✓ endGame throws error for unfinished games');
  
  // Test 4: processClaimWithGameEnd function
  console.log('\n--- Test 4: processClaimWithGameEnd function ---');
  
  // Create a game that's almost over (7 sets claimed)
  const almostOverGame = {
    ...gameState,
    phase: 'playing' as const,
    claimedSets: Array(7).fill(null).map((_, i) => ({
      team: i % 2,
      suit: 'hearts' as Suit,
      isHigh: i % 2 === 0,
      cards: []
    }))
  };
  
  // Set up a scenario where the final claim will end the game
  const alice = almostOverGame.players[0];
  const finalHalfSuit = [
    { suit: 'spades' as Suit, rank: '2' as Rank },
    { suit: 'spades' as Suit, rank: '3' as Rank },
    { suit: 'spades' as Suit, rank: '4' as Rank },
    { suit: 'spades' as Suit, rank: '5' as Rank },
    { suit: 'spades' as Suit, rank: '6' as Rank },
    { suit: 'spades' as Suit, rank: '7' as Rank }
  ];
  
  alice.hand = finalHalfSuit;
  alice.cardCount = 6;
  
  const finalClaim = {
    type: 'claim' as const,
    playerId: alice.id,
    suit: 'spades' as Suit,
    isHigh: false,
    cardLocations: [
      { playerId: alice.id, cards: finalHalfSuit }
    ]
  };
  
  const finalResult = processClaimWithGameEnd(almostOverGame, finalClaim);
  
  if (!finalResult.success || !finalResult.gameEnded || !finalResult.gameResults) {
    throw new Error('Final claim should end the game successfully');
  }
  
  if (finalResult.updatedState.phase !== 'finished') {
    throw new Error('Final game state should be finished');
  }
  
  console.log('✓ processClaimWithGameEnd correctly ends game on final claim');
  console.log(`✓ Final result: ${finalResult.gameResults.message}`);
  
  console.log('\n🎉 All game ending tests passed!');
}

/**
 * Test auto-award functionality during ask-card moves
 * This tests the new feature where teams are eliminated during ask moves
 */
export function testAutoAwardDuringAskMoves(): void {
  console.log('\n=== Testing Auto-Award During Ask-Card Moves ===');
  
  // Create a scenario where Team 1 will be eliminated during an ask-card move
  const testState: GameState = {
    id: 'test-auto-award',
    phase: 'playing',
    currentPlayerIndex: 0, // Alice's turn (Team 0)
    players: [
      {
        id: 'alice',
        name: 'Alice',
        team: 0,
        hand: [{ suit: 'hearts', rank: '2' }, { suit: 'hearts', rank: '3' }], // 2 cards
        cardCount: 2
      },
      {
        id: 'bob',
        name: 'Bob',
        team: 1,
        hand: [{ suit: 'hearts', rank: '4' }], // Bob's last card - will be taken
        cardCount: 1
      },
      {
        id: 'charlie',
        name: 'Charlie',
        team: 0,
        hand: [{ suit: 'clubs', rank: '9' }, { suit: 'clubs', rank: '10' }], // 2 cards
        cardCount: 2
      },
      {
        id: 'diana',
        name: 'Diana',
        team: 1,
        hand: [], // Already has no cards
        cardCount: 0
      }
    ],
    claimedSets: [
      // Only 3 sets claimed so far, 5 remaining
      { team: 0, suit: 'spades', isHigh: true, cards: [] },
      { team: 1, suit: 'spades', isHigh: false, cards: [] },
      { team: 0, suit: 'diamonds', isHigh: true, cards: [] }
    ],
    lastMove: undefined
  };

  console.log('📊 Initial state:');
  console.log('   - Team 0 cards: Alice(2) + Charlie(2) = 4 cards');
  console.log('   - Team 1 cards: Bob(1) + Diana(0) = 1 card');
  console.log('   - Sets claimed: 3/8');
  console.log('   - Unclaimed sets: 5');

  // Alice asks Bob for his last card (the 4 of hearts)
  const askMove: AskCardMove = {
    type: 'ask',
    fromPlayerId: 'alice',
    toPlayerId: 'bob',
    card: { suit: 'hearts', rank: '4' }
  };

  console.log('🎯 Alice asks Bob for 4 of Hearts (Bob\'s last card)...');

  // Process the move with auto-ending logic
  const moveResult = processAskMoveWithGameEnd(testState, askMove);

  console.log('✅ Move result:');
  console.log('   - Success:', moveResult.success);
  console.log('   - Game ended:', moveResult.gameEnded);
  console.log('   - Sets after move:', moveResult.updatedState.claimedSets.length);

  // Verify the move was successful
  if (!moveResult.success) {
    throw new Error('Ask move should be successful');
  }

  // Verify the card was transferred
  const aliceAfter = moveResult.updatedState.players.find((p: Player) => p.id === 'alice');
  const bobAfter = moveResult.updatedState.players.find((p: Player) => p.id === 'bob');

  if (!aliceAfter || aliceAfter.cardCount !== 3) {
    throw new Error('Alice should have 3 cards after getting Bob\'s card');
  }

  if (!bobAfter || bobAfter.cardCount !== 0) {
    throw new Error('Bob should have 0 cards after losing his last card');
  }

  console.log('✓ Card transfer successful: Bob(0) + Diana(0) = Team 1 eliminated');

  // Verify game ended due to auto-award
  if (!moveResult.gameEnded) {
    throw new Error('Game should have ended due to team elimination');
  }

  // Verify all 8 sets are now claimed
  if (moveResult.updatedState.claimedSets.length !== 8) {
    throw new Error(`Expected 8 claimed sets, got ${moveResult.updatedState.claimedSets.length}`);
  }

  // Verify Team 0 got the auto-awarded sets
  const team0Score = moveResult.gameResults!.team0Score;
  const team1Score = moveResult.gameResults!.team1Score;

  console.log(`📊 Final scores: Team 0: ${team0Score}, Team 1: ${team1Score}`);

  if (team0Score !== 6) { // Original 2 + 4 auto-awarded
    throw new Error(`Team 0 should have 6 sets (2 original + 4 auto-awarded), got ${team0Score}`);
  }

  if (team1Score !== 2) { // Original 1 + 1 from original claims
    throw new Error(`Team 1 should have 2 sets, got ${team1Score}`);
  }

  // Verify Team 0 wins
  if (moveResult.gameResults!.winner !== 0) {
    throw new Error('Team 0 should win');
  }

  // Verify phase is finished
  if (moveResult.updatedState.phase !== 'finished') {
    throw new Error('Game phase should be finished');
  }

  console.log('✓ Auto-award triggered correctly during ask-card move');
  console.log('✓ All remaining sets awarded to Team 0');
  console.log('✓ Game ended automatically');
  console.log('✓ Final scores calculated correctly');

  console.log('\n🎉 All auto-award during ask-moves tests passed!');
}

// Run the new test
testAutoAwardDuringAskMoves();