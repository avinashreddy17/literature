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

  // Rule 5: Must specify card locations
  if (!move.cardLocations || move.cardLocations.length === 0) {
    return false;
  }

  // Basic validation passed - detailed validation happens in checkClaim
  return true;
}

/**
 * Validates an ask-card move according to Literature rules
 */
function validateAskCardMove(gameState: GameState, move: AskCardMove): boolean {
  // Rule 1: Game must be in playing phase
  if (gameState.phase !== 'playing') {
    return false;
  }

  // Rule 2: It must be the asking player's turn
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  if (currentPlayer.id !== move.fromPlayerId) {
    return false;
  }

  // Rule 3: Find the target player
  const targetPlayer = gameState.players.find(p => p.id === move.toPlayerId);
  if (!targetPlayer) {
    return false;
  }

  // Rule 4: Target player must be on the opposite team
  if (currentPlayer.team === targetPlayer.team) {
    return false;
  }

  // Rule 5: Target player must have at least one card
  if (targetPlayer.cardCount === 0) {
    return false;
  }

  // Rule 6: Asking player must not have the requested card
  const hasRequestedCard = currentPlayer.hand.some(card => 
    card.suit === move.card.suit && card.rank === move.card.rank
  );
  if (hasRequestedCard) {
    return false;
  }

  // Rule 7: Asking player must have another card in the same half-suit
  const requestedCardIsHigh = isHighCard(move.card.rank);
  const hasCardInSameHalfSuit = currentPlayer.hand.some(card => 
    card.suit === move.card.suit && isHighCard(card.rank) === requestedCardIsHigh
  );
  if (!hasCardInSameHalfSuit) {
    return false;
  }

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
    const claimResult = checkClaim(gameState, move);
    return claimResult.updatedState;
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

  // Record the move in lastMove
  newGameState.lastMove = {
    fromPlayer: move.fromPlayerId,
    toPlayer: move.toPlayerId,
    card: move.card,
    successful
  };

  return newGameState;
}

/**
 * Checks and processes a half-suit claim according to Literature rules
 * Returns the result of the claim and updated game state
 */
export function checkClaim(gameState: GameState, claim: ClaimMove): {
  success: boolean;
  winningTeam: number | null; // null if cancelled
  updatedState: GameState;
  message: string;
} {
  // Validate basic claim structure
  if (claim.cardLocations.length === 0) {
    return {
      success: false,
      winningTeam: null,
      updatedState: gameState,
      message: 'Claim must specify card locations'
    };
  }

  // Get all cards for this half-suit
  const expectedCards = getHalfSuitCards(claim.suit, claim.isHigh);
  
  // Validate that exactly 6 cards are claimed
  const claimedCards: Card[] = [];
  for (const location of claim.cardLocations) {
    claimedCards.push(...location.cards);
  }
  
  if (claimedCards.length !== 6) {
    return {
      success: false,
      winningTeam: null,
      updatedState: gameState,
      message: `Half-suit must have exactly 6 cards, got ${claimedCards.length}`
    };
  }

  // Validate that claimed cards match the expected half-suit
  const claimedCardStrings = claimedCards.map(card => `${card.rank}-${card.suit}`).sort();
  const expectedCardStrings = expectedCards.map(card => `${card.rank}-${card.suit}`).sort();
  
  if (claimedCardStrings.join(',') !== expectedCardStrings.join(',')) {
    return {
      success: false,
      winningTeam: null,
      updatedState: gameState,
      message: 'Claimed cards do not match the specified half-suit'
    };
  }

  // Find the claiming player and their team
  const claimingPlayer = gameState.players.find(p => p.id === claim.playerId);
  if (!claimingPlayer) {
    return {
      success: false,
      winningTeam: null,
      updatedState: gameState,
      message: 'Claiming player not found'
    };
  }

  const claimingTeam = claimingPlayer.team;
  const opposingTeam = claimingTeam === 0 ? 1 : 0;

  // Check if any opponent has cards from this half-suit
  const opponentCards = findOpponentCards(gameState, claimingTeam, expectedCards);
  if (opponentCards.length > 0) {
    // Opponent has cards - opposing team wins the half-suit
    const updatedState = awardHalfSuit(gameState, claim.suit, claim.isHigh, opposingTeam, expectedCards);
    return {
      success: false,
      winningTeam: opposingTeam,
      updatedState,
      message: `Opposing team gets the half-suit (they have ${opponentCards.length} cards)`
    };
  }

  // Check if claiming team actually has all the cards
  const teamHasAllCards = verifyTeamPossession(gameState, claimingTeam, expectedCards);
  if (!teamHasAllCards) {
    return {
      success: false,
      winningTeam: null,
      updatedState: gameState,
      message: 'Claiming team does not possess all cards in the half-suit'
    };
  }

  // Check if stated locations are correct
  const locationsCorrect = verifyCardLocations(gameState, claim.cardLocations);
  if (!locationsCorrect) {
    // Team has cards but locations are wrong - half-suit is cancelled
    const updatedState = cancelHalfSuit(gameState, claim.suit, claim.isHigh, expectedCards);
    return {
      success: false,
      winningTeam: null,
      updatedState,
      message: `Card locations incorrect - ${claim.isHigh ? 'high' : 'low'} ${claim.suit} cancelled`
    };
  }

  // Perfect claim - award half-suit to claiming team
  const updatedState = awardHalfSuit(gameState, claim.suit, claim.isHigh, claimingTeam, expectedCards);
  return {
    success: true,
    winningTeam: claimingTeam,
    updatedState,
    message: `Team ${claimingTeam} successfully claimed ${claim.isHigh ? 'high' : 'low'} ${claim.suit}`
  };
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
 * Finds cards from a half-suit that are held by the opposing team
 */
function findOpponentCards(gameState: GameState, claimingTeam: number, expectedCards: Card[]): Card[] {
  const opponentCards: Card[] = [];
  
  for (const player of gameState.players) {
    if (player.team !== claimingTeam) {
      for (const card of player.hand) {
        const hasExpectedCard = expectedCards.some(expected => 
          expected.suit === card.suit && expected.rank === card.rank
        );
        if (hasExpectedCard) {
          opponentCards.push(card);
        }
      }
    }
  }
  
  return opponentCards;
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
 * Verifies that the stated card locations in the claim are correct
 */
function verifyCardLocations(gameState: GameState, cardLocations: ClaimMove['cardLocations']): boolean {
  for (const location of cardLocations) {
    const player = gameState.players.find(p => p.id === location.playerId);
    if (!player) {
      return false;
    }
    
    for (const claimedCard of location.cards) {
      const hasCard = player.hand.some(card => 
        card.suit === claimedCard.suit && card.rank === claimedCard.rank
      );
      if (!hasCard) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Awards a half-suit to a team and removes cards from all players
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
  
  return updatedState;
}

/**
 * Cancels a half-suit (removes cards but awards to no team)
 * Records the cancellation in game state for history tracking
 */
function cancelHalfSuit(gameState: GameState, suit: Suit, isHigh: boolean, cards: Card[]): GameState {
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
        team: null, // null indicates cancelled set
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
  
  return updatedState;
}

/**
 * Helper function to get all successfully claimed sets (team !== null)
 */
export function getClaimedSets(gameState: GameState) {
  return gameState.claimedSets.filter(set => set.team !== null);
}

/**
 * Helper function to get all cancelled sets (team === null)
 */
export function getCancelledSets(gameState: GameState) {
  return gameState.claimedSets.filter(set => set.team === null);
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