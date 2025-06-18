import { Card, Suit, Rank, Player, GameState, AskCardMove, ClaimMove } from './types';

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
    id: name.toLowerCase().replace(/[^a-z0-9]/g, ''), // Consistent with GameManager
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
    phase: 'playing',
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

/**
 * Validates if a move is legal according to Literature rules
 * Returns true if the move is valid, false otherwise
 */
export function validateMove(gameState: GameState, move: AskCardMove | ClaimMove): boolean {
  if (move.type === 'claim') {
    return validateClaimMove(gameState, move);
  }

  if (move.type === 'ask') {
    return validateAskCardMove(gameState, move);
  }

  return false;
}

/**
 * Validates a claim move according to Literature rules
 */
function validateClaimMove(gameState: GameState, move: ClaimMove): boolean {
  // Rule 1: Game must be in playing phase
  if (gameState.phase !== 'playing') {
    return false;
  }

  // Rule 2: Claiming player must exist
  const claimingPlayer = gameState.players.find(p => p.id === move.playerId);
  if (!claimingPlayer) {
    return false;
  }

  // Rule 3: Must be claiming player's turn
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  if (currentPlayer.id !== move.playerId) {
    return false;
  }

  // Rule 4: Half-suit must not already be claimed
  const alreadyClaimed = gameState.claimedSets.some(set => 
    set.suit === move.suit && set.isHigh === move.isHigh
  );
  if (alreadyClaimed) {
    return false;
  }

  // No need to validate card locations - automatic discovery now
  return true;
}

/**
 * Validates an ask-card move according to Literature rules
 */
function validateAskCardMove(gameState: GameState, move: AskCardMove): boolean {
  console.log('\n🔍 ===== VALIDATING ASK CARD MOVE =====');
  console.log('📥 Move to validate:', JSON.stringify(move, null, 2));
  
  // Rule 1: Game must be in playing phase
  console.log('🔍 Rule 1: Checking game phase...');
  console.log('   Current phase:', gameState.phase);
  if (gameState.phase !== 'playing') {
    console.log('❌ VALIDATION FAILED: Game not in playing phase');
    return false;
  }
  console.log('✅ Rule 1 passed: Game is in playing phase');

  // Rule 2: It must be the asking player's turn
  console.log('🔍 Rule 2: Checking if it\'s player\'s turn...');
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  console.log('   Current player:', currentPlayer.name, '(', currentPlayer.id, ')');
  console.log('   Move from player:', move.fromPlayerId);
  if (currentPlayer.id !== move.fromPlayerId) {
    console.log('❌ VALIDATION FAILED: Not player\'s turn');
    return false;
  }
  console.log('✅ Rule 2 passed: It is the player\'s turn');

  // Rule 3: Find the target player
  console.log('🔍 Rule 3: Finding target player...');
  const targetPlayer = gameState.players.find(p => p.id === move.toPlayerId);
  console.log('   Target player ID:', move.toPlayerId);
  console.log('   Target player found:', targetPlayer ? `${targetPlayer.name} (${targetPlayer.id})` : 'NOT FOUND');
  if (!targetPlayer) {
    console.log('❌ VALIDATION FAILED: Target player not found');
    return false;
  }
  console.log('✅ Rule 3 passed: Target player found');

  // Rule 4: Target player must be on the opposite team
  console.log('🔍 Rule 4: Checking team restrictions...');
  console.log('   Current player team:', currentPlayer.team);
  console.log('   Target player team:', targetPlayer.team);
  if (currentPlayer.team === targetPlayer.team) {
    console.log('❌ VALIDATION FAILED: Cannot ask teammates');
    return false;
  }
  console.log('✅ Rule 4 passed: Target is on opposing team');

  // Rule 5: Target player must have at least one card
  console.log('🔍 Rule 5: Checking target has cards...');
  console.log('   Target player card count:', targetPlayer.cardCount);
  if (targetPlayer.cardCount === 0) {
    console.log('❌ VALIDATION FAILED: Target player has no cards');
    return false;
  }
  console.log('✅ Rule 5 passed: Target player has cards');

  // Rule 6: Asking player must not have the requested card
  console.log('🔍 Rule 6: Checking if asking player already has the card...');
  console.log('   Requested card:', move.card);
  console.log('   Current player hand:', currentPlayer.hand);
  const hasRequestedCard = currentPlayer.hand.some(card => 
    card.suit === move.card.suit && card.rank === move.card.rank
  );
  console.log('   Player already has this card:', hasRequestedCard);
  if (hasRequestedCard) {
    console.log('❌ VALIDATION FAILED: Player already has the requested card');
    return false;
  }
  console.log('✅ Rule 6 passed: Player doesn\'t have the requested card');

  // Rule 7: Asking player must have another card in the same half-suit
  console.log('🔍 Rule 7: Checking half-suit possession...');
  const requestedCardIsHigh = isHighCard(move.card.rank);
  console.log('   Requested card is high?', requestedCardIsHigh, '(', move.card.rank, ')');
  console.log('   Looking for cards in same half-suit:', move.card.suit, requestedCardIsHigh ? 'HIGH' : 'LOW');
  
  const matchingCards = currentPlayer.hand.filter(card => 
    card.suit === move.card.suit && isHighCard(card.rank) === requestedCardIsHigh
  );
  console.log('   Player\'s cards in same half-suit:', matchingCards);
  
  const hasCardInSameHalfSuit = matchingCards.length > 0;
  console.log('   Has card in same half-suit:', hasCardInSameHalfSuit);
  if (!hasCardInSameHalfSuit) {
    console.log('❌ VALIDATION FAILED: Player has no cards in the same half-suit');
    return false;
  }
  console.log('✅ Rule 7 passed: Player has cards in the same half-suit');

  console.log('🎉 ALL VALIDATION RULES PASSED!');
  console.log('===== VALIDATION COMPLETE =====\n');
  return true;
}

/**
 * Helper function to determine if a card rank is in the high half-suit (9-A)
 * Returns true for high cards (9, 10, J, Q, K, A), false for low cards (2-7)
 */
function isHighCard(rank: Rank): boolean {
  const highRanks: Rank[] = ['9', '10', 'J', 'Q', 'K', 'A'];
  return highRanks.includes(rank);
}

/**
 * Applies a validated move to the game state and returns the updated state
 * Assumes the move has already been validated by validateMove()
 */
export function applyMove(gameState: GameState, move: AskCardMove | ClaimMove): GameState {
  if (move.type === 'claim') {
    const claimResult = processClaimWithGameEnd(gameState, move);
    return claimResult.updatedState || gameState;
  }

  if (move.type === 'ask') {
    return applyAskCardMove(gameState, move);
  }

  throw new Error('Unknown move type');
}

/**
 * Applies an ask-card move to the game state
 */
function applyAskCardMove(gameState: GameState, move: AskCardMove): GameState {
  // Create a deep copy of the game state to avoid mutations
  const newGameState: GameState = {
    ...gameState,
    players: gameState.players.map(player => ({
      ...player,
      hand: [...player.hand]
    })),
    claimedSets: [...gameState.claimedSets]
  };

  // Find the asking player and target player
  const askingPlayerIndex = newGameState.players.findIndex(p => p.id === move.fromPlayerId);
  const targetPlayerIndex = newGameState.players.findIndex(p => p.id === move.toPlayerId);

  const askingPlayer = newGameState.players[askingPlayerIndex];
  const targetPlayer = newGameState.players[targetPlayerIndex];

  // Check if target player has the requested card
  const cardIndex = targetPlayer.hand.findIndex(card => 
    card.suit === move.card.suit && card.rank === move.card.rank
  );

  let successful = false;

  if (cardIndex !== -1) {
    // Card found - transfer it from target to asking player
    const transferredCard = targetPlayer.hand[cardIndex];
    
    // Remove card from target player
    targetPlayer.hand.splice(cardIndex, 1);
    targetPlayer.cardCount--;
    
    // Add card to asking player
    askingPlayer.hand.push(transferredCard);
    askingPlayer.cardCount++;
    
    successful = true;
    
    // Asking player keeps the turn (currentPlayerIndex stays the same)
  } else {
    // Card not found - turn passes to target player
    newGameState.currentPlayerIndex = targetPlayerIndex;
  }

  // Check if current player has no cards after this move
  const finalCurrentPlayer = newGameState.players[newGameState.currentPlayerIndex];
  if (finalCurrentPlayer.cardCount === 0) {
    console.log(`🎯 Current player ${finalCurrentPlayer.name} has no cards left, finding next valid player...`);
    
    // Find next valid player on the same team
    const validTeammates = getValidTeammates(newGameState, finalCurrentPlayer.id);
    if (validTeammates.length > 0) {
      // Pass turn to a teammate
      const nextTeammate = validTeammates[0];
      const nextTeammateIndex = newGameState.players.findIndex(p => p.id === nextTeammate.id);
      newGameState.currentPlayerIndex = nextTeammateIndex;
      console.log(`🎯 Turn passed to teammate ${nextTeammate.name}`);
    } else {
      // No valid teammates, find next valid player from any team
      const nextValidPlayer = getNextValidPlayer(newGameState);
      if (nextValidPlayer) {
        const nextPlayerIndex = newGameState.players.findIndex(p => p.id === nextValidPlayer.id);
        newGameState.currentPlayerIndex = nextPlayerIndex;
        console.log(`🎯 Turn passed to ${nextValidPlayer.name} (cross-team)`);
      } else {
        console.log(`❗ No valid players found - this shouldn't happen unless game is over`);
      }
    }
  }

  // Record the move in lastMove
  newGameState.lastMove = {
    fromPlayer: move.fromPlayerId,
    toPlayer: move.toPlayerId,
    card: move.card,
    successful
  };

  // Check if one team has no cards left and auto-award remaining sets
  const finalState = autoAwardRemainingToTeamWithCards(newGameState);

  return finalState;
}

/**
 * Checks and processes a half-suit claim with simplified all-or-nothing logic
 * Claiming team must have ALL 6 cards to win, otherwise opposing team gets the point
 */
export function checkClaim(gameState: GameState, claim: ClaimMove): {
  success: boolean;
  winningTeam: number;
  updatedState: GameState;
  message: string;
} {
  // Get all 6 cards for this half-suit
  const expectedCards = getHalfSuitCards(claim.suit, claim.isHigh);
  
  // Find the claiming player and their team
  const claimingPlayer = gameState.players.find(p => p.id === claim.playerId);
  if (!claimingPlayer) {
    throw new Error('Claiming player not found - this should have been caught in validation');
  }

  const claimingTeam = claimingPlayer.team;
  const opposingTeam = claimingTeam === 0 ? 1 : 0;

  // Check if claiming team has ALL 6 cards
  const teamHasAllCards = verifyTeamPossession(gameState, claimingTeam, expectedCards);
  
  if (teamHasAllCards) {
    // Claiming team has all cards - they win the half-suit
    const updatedState = awardHalfSuit(gameState, claim.suit, claim.isHigh, claimingTeam, expectedCards);
    return {
      success: true,
      winningTeam: claimingTeam,
      updatedState,
      message: `Team ${claimingTeam} successfully claimed ${claim.isHigh ? 'high' : 'low'} ${claim.suit}`
    };
  } else {
    // Claiming team doesn't have all cards - opposing team wins
    const updatedState = awardHalfSuit(gameState, claim.suit, claim.isHigh, opposingTeam, expectedCards);
    return {
      success: false,
      winningTeam: opposingTeam,
      updatedState,
      message: `Team ${opposingTeam} gets the half-suit (claiming team didn't have all cards)`
    };
  }
}

/**
 * Gets all cards for a specific half-suit
 */
function getHalfSuitCards(suit: Suit, isHigh: boolean): Card[] {
  const ranks: Rank[] = isHigh 
    ? ['9', '10', 'J', 'Q', 'K', 'A'] 
    : ['2', '3', '4', '5', '6', '7'];
  
  return ranks.map(rank => ({ suit, rank }));
}

/**
 * Verifies that a team possesses all cards in a half-suit
 */
function verifyTeamPossession(gameState: GameState, team: number, expectedCards: Card[]): boolean {
  const teamCards: Card[] = [];
  
  for (const player of gameState.players) {
    if (player.team === team) {
      teamCards.push(...player.hand);
    }
  }
  
  for (const expectedCard of expectedCards) {
    const hasCard = teamCards.some(card => 
      card.suit === expectedCard.suit && card.rank === expectedCard.rank
    );
    if (!hasCard) {
      return false;
    }
  }
  
  return true;
}

/**
 * Auto-awards all remaining unclaimed sets to the team that has all the cards
 * Triggers when one team is completely eliminated (has no cards left)
 */
function autoAwardRemainingToTeamWithCards(gameState: GameState): GameState {
  const teamWithAllCards = getTeamWithAllCards(gameState);
  if (teamWithAllCards !== null) {
    console.log(`🏆 Team ${teamWithAllCards} has all remaining cards! Auto-awarding remaining sets...`);
    
    const updatedState = { ...gameState, claimedSets: [...gameState.claimedSets] };
    const unclaimedSets = getUnclaimedSets(updatedState);
    
    for (const unclaimedSet of unclaimedSets) {
      const setCards = getHalfSuitCards(unclaimedSet.suit, unclaimedSet.isHigh);
      updatedState.claimedSets.push({
        team: teamWithAllCards,
        suit: unclaimedSet.suit,
        isHigh: unclaimedSet.isHigh,
        cards: setCards
      });
    }
    
    console.log(`✅ Auto-awarded ${unclaimedSets.length} remaining sets to Team ${teamWithAllCards}`);
    return updatedState;
  }
  
  return gameState; // No team elimination, return unchanged
}

/**
 * Awards a half-suit to a team and removes cards from all players
 * Also handles advanced turn passing and team-with-no-cards scenarios
 */
function awardHalfSuit(gameState: GameState, suit: Suit, isHigh: boolean, winningTeam: number, cards: Card[]): GameState {
  const updatedState: GameState = {
    ...gameState,
    players: gameState.players.map(player => ({
      ...player,
      hand: player.hand.filter(card => 
        !cards.some(halfSuitCard => 
          halfSuitCard.suit === card.suit && halfSuitCard.rank === card.rank
        )
      )
    })),
    claimedSets: [
      ...gameState.claimedSets,
      {
        team: winningTeam,
        suit,
        isHigh,
        cards: [...cards]
      }
    ]
  };
  
  // Update card counts
  for (const player of updatedState.players) {
    player.cardCount = player.hand.length;
  }
  
  // Check if current player has no cards after this claim
  const currentPlayer = updatedState.players[updatedState.currentPlayerIndex];
  if (currentPlayer.cardCount === 0) {
    console.log(`🎯 Current player ${currentPlayer.name} has no cards left, finding next valid player...`);
    
    // Find next valid player on the same team
    const validTeammates = getValidTeammates(updatedState, currentPlayer.id);
    if (validTeammates.length > 0) {
      // Pass turn to a teammate
      const nextTeammate = validTeammates[0];
      const nextTeammateIndex = updatedState.players.findIndex(p => p.id === nextTeammate.id);
      updatedState.currentPlayerIndex = nextTeammateIndex;
      console.log(`🎯 Turn passed to teammate ${nextTeammate.name}`);
    } else {
      // No valid teammates, find next valid player from any team
      const nextValidPlayer = getNextValidPlayer(updatedState);
      if (nextValidPlayer) {
        const nextPlayerIndex = updatedState.players.findIndex(p => p.id === nextValidPlayer.id);
        updatedState.currentPlayerIndex = nextPlayerIndex;
        console.log(`🎯 Turn passed to ${nextValidPlayer.name} (cross-team)`);
      } else {
        console.log(`❗ No valid players found - this shouldn't happen unless game is over`);
      }
    }
  }
  
  // Check if one team has no cards left and auto-award remaining sets
  const finalState = autoAwardRemainingToTeamWithCards(updatedState);
  
  return finalState;
}

/**
 * Helper function to get all claimed sets (all sets are always claimed in simplified system)
 */
export function getClaimedSets(gameState: GameState) {
  return gameState.claimedSets; // All sets are always claimed (no cancelled sets)
}

/**
 * Helper function to get cancelled sets - always empty in simplified system
 * Kept for backwards compatibility with existing code
 */
export function getCancelledSets(gameState: GameState) {
  return []; // No cancelled sets in simplified claiming system
}

/**
 * Helper function to get team score (number of claimed sets)
 */
export function getTeamScore(gameState: GameState, team: number): number {
  return gameState.claimedSets.filter(set => set.team === team).length;
}

/**
 * Checks if the game is over (all 8 half-suits are claimed or cancelled)
 * Literature has 8 half-suits: 4 suits × 2 halves (high/low) = 8 total
 */
export function isGameOver(gameState: GameState): boolean {
  return gameState.claimedSets.length === 8;
}

/**
 * Calculates final game results and determines the winner
 * Returns the final game state with phase set to 'finished'
 */
export function endGame(gameState: GameState): GameState {
  if (!isGameOver(gameState)) {
    throw new Error('Cannot end game - not all half-suits are claimed');
  }

  const team0Score = getTeamScore(gameState, 0);
  const team1Score = getTeamScore(gameState, 1);
  const cancelledSets = getCancelledSets(gameState).length;

  const updatedState: GameState = {
    ...gameState,
    phase: 'finished'
  };

  return updatedState;
}

/**
 * Gets the final game results including scores and winner
 */
export function getGameResults(gameState: GameState) {
  const team0Score = getTeamScore(gameState, 0);
  const team1Score = getTeamScore(gameState, 1);
  const cancelledSets = getCancelledSets(gameState).length;
  
  let winner: number | null = null;
  let message = '';

  if (team0Score > team1Score) {
    winner = 0;
    message = `Team 0 wins with ${team0Score} half-suits!`;
  } else if (team1Score > team0Score) {
    winner = 1;
    message = `Team 1 wins with ${team1Score} half-suits!`;
  } else {
    message = `Game tied! Both teams have ${team0Score} half-suits each.`;
  }

  return {
    isGameOver: isGameOver(gameState),
    team0Score,
    team1Score,
    cancelledSets,
    winner,
    message,
    totalSets: gameState.claimedSets.length
  };
}

/**
 * Processes a claim and automatically ends the game if all half-suits are claimed
 * This is a convenience function that combines checkClaim with game ending logic
 */
export function processClaimWithGameEnd(gameState: GameState, claim: ClaimMove) {
  const claimResult = checkClaim(gameState, claim);
  
  // If the claim resulted in a new game state, check if game is over
  if (claimResult.updatedState && isGameOver(claimResult.updatedState)) {
    const finalState = endGame(claimResult.updatedState);
    const gameResults = getGameResults(finalState);
    
    return {
      ...claimResult,
      updatedState: finalState,
      gameEnded: true,
      gameResults
    };
  }

  return {
    ...claimResult,
    gameEnded: false,
    gameResults: null
  };
}

/**
 * Processes an ask-card move and automatically ends the game if all half-suits are claimed
 * This is a convenience function that combines applyAskCardMove with game ending logic
 */
export function processAskMoveWithGameEnd(gameState: GameState, move: AskCardMove) {
  const updatedState = applyAskCardMove(gameState, move);
  
  // Check if game is over after the move (could be due to auto-award)
  if (isGameOver(updatedState)) {
    const finalState = endGame(updatedState);
    const gameResults = getGameResults(finalState);
    
    return {
      success: true,
      updatedState: finalState,
      gameEnded: true,
      gameResults,
      lastMove: updatedState.lastMove
    };
  }

  return {
    success: true,
    updatedState,
    gameEnded: false,
    gameResults: null,
    lastMove: updatedState.lastMove
  };
}

/**
 * Gets all players who can take a turn (have at least one card)
 * Used for advanced endgame scenarios where some players have no cards
 */
export function getValidPlayers(gameState: GameState): Player[] {
  return gameState.players.filter(player => player.cardCount > 0);
}

/**
 * Gets valid teammates who can receive the turn (have cards and are on same team)
 * Used when a player loses all cards during their turn
 */
export function getValidTeammates(gameState: GameState, playerId: string): Player[] {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return [];
  
  return gameState.players.filter(p => 
    p.team === player.team && 
    p.cardCount > 0 && 
    p.id !== playerId
  );
}

/**
 * Passes turn to a specific player
 * Used in advanced endgame scenarios
 */
export function passTurnToPlayer(gameState: GameState, targetPlayerId: string): GameState {
  const targetPlayerIndex = gameState.players.findIndex(p => p.id === targetPlayerId);
  
  if (targetPlayerIndex === -1) {
    throw new Error(`Player ${targetPlayerId} not found`);
  }
  
  const targetPlayer = gameState.players[targetPlayerIndex];
  if (targetPlayer.cardCount === 0) {
    throw new Error(`Cannot pass turn to ${targetPlayerId} - they have no cards`);
  }
  
  return {
    ...gameState,
    currentPlayerIndex: targetPlayerIndex
  };
}

/**
 * Finds the next valid player in turn order who has cards
 * Skips players with no cards
 */
export function getNextValidPlayer(gameState: GameState): Player | null {
  const playerCount = gameState.players.length;
  let nextIndex = (gameState.currentPlayerIndex + 1) % playerCount;
  let checked = 0;
  
  while (checked < playerCount) {
    const player = gameState.players[nextIndex];
    if (player.cardCount > 0) {
      return player;
    }
    nextIndex = (nextIndex + 1) % playerCount;
    checked++;
  }
  
  return null; // No valid players found
}

/**
 * Checks if one team has all remaining cards
 * Returns the team number if true, null if both teams have cards
 */
export function getTeamWithAllCards(gameState: GameState): number | null {
  const team0HasCards = gameState.players.some(p => p.team === 0 && p.cardCount > 0);
  const team1HasCards = gameState.players.some(p => p.team === 1 && p.cardCount > 0);
  
  if (team0HasCards && !team1HasCards) return 0;
  if (team1HasCards && !team0HasCards) return 1;
  return null;
}

/**
 * Gets all unclaimed half-suits
 * Used for forced claiming scenarios
 */
export function getUnclaimedSets(gameState: GameState): { suit: Suit; isHigh: boolean }[] {
  const allSuits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const unclaimedSets: { suit: Suit; isHigh: boolean }[] = [];
  
  for (const suit of allSuits) {
    for (const isHigh of [false, true]) {
      const isClaimed = gameState.claimedSets.some(set => 
        set.suit === suit && set.isHigh === isHigh
      );
      if (!isClaimed) {
        unclaimedSets.push({ suit, isHigh });
      }
    }
  }
  
  return unclaimedSets;
}

/**
 * Validates if a player can be asked for cards
 * Returns false if player has no cards or is on same team
 */
export function canBeAsked(gameState: GameState, askingPlayerId: string, targetPlayerId: string): boolean {
  const askingPlayer = gameState.players.find(p => p.id === askingPlayerId);
  const targetPlayer = gameState.players.find(p => p.id === targetPlayerId);
  
  if (!askingPlayer || !targetPlayer) return false;
  if (askingPlayer.team === targetPlayer.team) return false;
  if (targetPlayer.cardCount === 0) return false;
  
  return true;
} 