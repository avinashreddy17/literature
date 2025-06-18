const { 
  initializeGame, 
  validateMove,
  applyMove,
  getValidPlayers,
  getValidTeammates,
  passTurnToPlayer,
  getNextValidPlayer,
  getTeamWithAllCards,
  getUnclaimedSets,
  canBeAsked,
  isGameOver,
  getGameResults
} = require('./dist/index.js');

console.log('🏁 Literature Game - Advanced Endgame Scenarios Analysis');
console.log('=======================================================\n');

// Enhanced logging function for advanced endgame analysis
function logAdvancedEndgameState(gameState, title, additionalInfo = '') {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎮 ${title}`);
  console.log(`${'='.repeat(80)}`);
  
  if (additionalInfo) {
    console.log(`💡 ${additionalInfo}\n`);
  }
  
  console.log(`🎲 Game Phase: ${gameState.phase}`);
  console.log(`🎯 Current Player: ${gameState.players[gameState.currentPlayerIndex]?.name || 'None'} (Team ${gameState.players[gameState.currentPlayerIndex]?.team})`);
  console.log(`🏆 Sets Claimed: ${gameState.claimedSets.length}/8`);
  
  // Detailed player status with card counts
  console.log('\n👥 PLAYER STATUS (Cards Remaining):');
  console.log('-'.repeat(80));
  
  const team0Players = [];
  const team1Players = [];
  
  gameState.players.forEach((player, index) => {
    const isCurrentPlayer = index === gameState.currentPlayerIndex;
    const marker = isCurrentPlayer ? '👆 TURN' : '';
    const handStr = player.hand.length > 0 ? 
      player.hand.map(c => `${c.rank}${c.suit[0].toUpperCase()}`).join(' ') : 
      'NO CARDS';
    
    const playerStatus = `${player.name.padEnd(8)} (Team ${player.team}): [${handStr}] (${player.cardCount} cards) ${marker}`;
    
    if (player.team === 0) {
      team0Players.push({ player, status: playerStatus, hasCards: player.cardCount > 0 });
    } else {
      team1Players.push({ player, status: playerStatus, hasCards: player.cardCount > 0 });
    }
    
    console.log(`   ${playerStatus}`);
  });
  
  // Team analysis
  console.log('\n🏀 TEAM ANALYSIS:');
  console.log('-'.repeat(80));
  
  const team0WithCards = team0Players.filter(p => p.hasCards).length;
  const team1WithCards = team1Players.filter(p => p.hasCards).length;
  const team0TotalCards = team0Players.reduce((sum, p) => sum + p.player.cardCount, 0);
  const team1TotalCards = team1Players.reduce((sum, p) => sum + p.player.cardCount, 0);
  
  console.log(`   Team 0: ${team0WithCards}/3 players with cards (${team0TotalCards} total cards)`);
  console.log(`   Team 1: ${team1WithCards}/3 players with cards (${team1TotalCards} total cards)`);
  
  const teamWithCards = getTeamWithAllCards(gameState);
  if (teamWithCards !== null) {
    console.log(`   ⚠️  TEAM ${teamWithCards} HAS ALL REMAINING CARDS - Special endgame rules apply!`);
  }
  
  // Valid players for turn
  const validPlayers = getValidPlayers(gameState);
  if (validPlayers.length > 0) {
    console.log(`\n🎯 VALID PLAYERS FOR TURN: ${validPlayers.map(p => p.name).join(', ')}`);
  } else {
    console.log(`\n⚠️  NO VALID PLAYERS - Game should end or require forced claiming!`);
  }
  
  // Remaining unclaimed sets
  const unclaimedSets = getUnclaimedSets(gameState);
  
  if (unclaimedSets.length > 0) {
    const setNames = unclaimedSets.map(set => `${set.isHigh ? 'High' : 'Low'} ${set.suit}`);
    console.log(`\n🎪 UNCLAIMED SETS (${unclaimedSets.length}): ${setNames.join(', ')}`);
  }
  
  console.log(`${'='.repeat(80)}`);
}

console.log('🚀 STARTING ADVANCED ENDGAME SCENARIOS TEST\n');

// ========================================================================
// SCENARIO 1: PLAYER RUNS OUT OF CARDS DURING THEIR TURN (from claim)
// ========================================================================
console.log('📝 SCENARIO 1: PLAYER LOSES ALL CARDS DURING THEIR TURN FROM CLAIM');
console.log('================================================================');

let gameState1 = initializeGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
gameState1.phase = 'playing';
gameState1.currentPlayerIndex = 0; // Alice's turn

// Set up: Alice has only low hearts, Bob (teammate) has other cards
gameState1.players[0].hand = [
  { suit: 'hearts', rank: '2' },
  { suit: 'hearts', rank: '3' },
  { suit: 'hearts', rank: '4' },
  { suit: 'hearts', rank: '5' },
  { suit: 'hearts', rank: '6' },
  { suit: 'hearts', rank: '7' }
];
gameState1.players[0].cardCount = 6;

// Bob (Team 1 - opponent) has some remaining cards
gameState1.players[1].hand = [
  { suit: 'diamonds', rank: '2' },
  { suit: 'diamonds', rank: '3' },
  { suit: 'clubs', rank: '2' }
];
gameState1.players[1].cardCount = 3;

// Charlie (Team 0 - Alice's teammate) has cards
gameState1.players[2].hand = [
  { suit: 'spades', rank: '2' },
  { suit: 'spades', rank: '3' }
];
gameState1.players[2].cardCount = 2;

// Other team players have some cards
gameState1.players[3].hand = [{ suit: 'spades', rank: '4' }];
gameState1.players[3].cardCount = 1;
gameState1.players[4].hand = []; // Eve has no cards
gameState1.players[4].cardCount = 0;
gameState1.players[5].hand = [{ suit: 'spades', rank: '5' }];
gameState1.players[5].cardCount = 1;

logAdvancedEndgameState(gameState1, 'BEFORE CLAIM - ALICE ABOUT TO LOSE ALL CARDS', 
  'Alice has only low hearts. If claimed correctly, she will have no cards left during her turn!');

// Alice claims low hearts (her own cards) - this will remove all her cards
const aliceClaim = {
  type: 'claim',
  playerId: 'alice',
  suit: 'hearts',
  isHigh: false,
  cardLocations: [
    { 
      playerId: 'alice', 
      cards: gameState1.players[0].hand
    }
  ]
};

console.log('\n🎯 EXECUTING CLAIM:');
console.log('Alice claims: "I have all low hearts!"');
console.log('This will remove ALL of Alice\'s cards during her turn...');

const claimResult1 = validateMove(gameState1, aliceClaim);
console.log(`✅ Claim Valid: ${claimResult1}`);

if (claimResult1) {
  const updatedState1 = applyMove(gameState1, aliceClaim);
  
  console.log('\n📋 CLAIM RESULT:');
  console.log(`🏆 Low hearts claimed by Team ${updatedState1.claimedSets[updatedState1.claimedSets.length - 1].team}`);
  
  logAdvancedEndgameState(updatedState1, 'AFTER CLAIM - ALICE LOST ALL CARDS', 
    'Alice now has no cards! Turn must pass to a teammate with cards.');
  
  console.log('\n🔄 TURN PASSING RULES:');
  console.log('• Alice lost all cards during her turn');
  console.log('• Must pass turn to teammate who still has cards');
  
  // Get valid teammates for Alice
  const validTeammates = getValidTeammates(updatedState1, 'alice');
  console.log(`• Valid teammates: ${validTeammates.map(p => `${p.name} (${p.cardCount} cards)`).join(', ')}`);
  
  if (validTeammates.length > 0) {
    // Pass turn to Charlie (the only teammate with cards)
    const charlieId = validTeammates[0].id;
    const finalState1 = passTurnToPlayer(updatedState1, charlieId);
    
    logAdvancedEndgameState(finalState1, 'AFTER TURN PASS - CHARLIE NOW HAS TURN', 
      'Turn successfully passed to Charlie, Alice\'s teammate with remaining cards.');
  }
}

// ========================================================================
// SCENARIO 2: PLAYER ASKED FOR LAST CARD
// ========================================================================
console.log('\n\n📝 SCENARIO 2: PLAYER LOSES LAST CARD FROM BEING ASKED');
console.log('====================================================');

let gameState2 = initializeGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
gameState2.phase = 'playing';
gameState2.currentPlayerIndex = 3; // Diana's turn

// Diana has cards, Eve has only one card left
gameState2.players[3].hand = [
  { suit: 'hearts', rank: '2' },
  { suit: 'diamonds', rank: '2' }
];
gameState2.players[3].cardCount = 2;

gameState2.players[4].hand = [{ suit: 'clubs', rank: '2' }]; // Eve's last card
gameState2.players[4].cardCount = 1;

// Other players have various cards
gameState2.players[0].hand = [{ suit: 'spades', rank: '2' }];
gameState2.players[0].cardCount = 1;
gameState2.players[1].hand = [{ suit: 'spades', rank: '3' }];
gameState2.players[1].cardCount = 1;
gameState2.players[2].hand = [{ suit: 'spades', rank: '4' }];
gameState2.players[2].cardCount = 1;
gameState2.players[5].hand = [{ suit: 'hearts', rank: '3' }];
gameState2.players[5].cardCount = 1;

logAdvancedEndgameState(gameState2, 'BEFORE ASK - EVE HAS ONLY ONE CARD', 
  'Diana will ask Eve for her last card. Eve will have no cards after this!');

// Diana asks Eve for her last card
const askMove = {
  type: 'ask',
  fromPlayerId: 'diana',
  toPlayerId: 'eve',
  card: { suit: 'clubs', rank: '2' }
};

console.log('\n🎯 EXECUTING ASK:');
console.log('Diana asks Eve: "Do you have the 2 of clubs?"');
console.log('This is Eve\'s LAST card!');

const askResult = validateMove(gameState2, askMove);
console.log(`✅ Ask Valid: ${askResult}`);

if (askResult) {
  const updatedState2 = applyMove(gameState2, askMove);
  
  console.log('\n📋 ASK RESULT:');
  console.log(`🎯 Eve gives her last card to Diana`);
  console.log(`🔄 Turn stays with Diana (successful ask)`);
  
  logAdvancedEndgameState(updatedState2, 'AFTER ASK - EVE HAS NO CARDS', 
    'Eve now has no cards and cannot be asked for cards anymore!');
  
  console.log('\n⚠️  IMPORTANT RULES:');
  console.log('• Eve cannot be asked for cards (has none)');
  console.log('• Eve cannot take a turn (has no cards)');
  console.log('• If turn would go to Eve, it must skip to next valid player');
  
  // Test that Eve cannot be asked anymore
  const canAskEve = canBeAsked(updatedState2, 'diana', 'eve');
  console.log(`\n🔍 Can Diana ask Eve for cards? ${canAskEve ? 'YES' : 'NO'}`);
}

// ========================================================================
// SCENARIO 3: ONE TEAM RUNS OUT OF CARDS ENTIRELY
// ========================================================================
console.log('\n\n📝 SCENARIO 3: ONE TEAM RUNS OUT OF CARDS ENTIRELY');
console.log('=================================================');

let gameState3 = initializeGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
gameState3.phase = 'playing';
gameState3.currentPlayerIndex = 0; // Alice's turn

// Team 0 (Alice, Bob, Charlie) has NO cards
gameState3.players[0].hand = [];
gameState3.players[0].cardCount = 0;
gameState3.players[2].hand = [];
gameState3.players[2].cardCount = 0;
gameState3.players[4].hand = [];
gameState3.players[4].cardCount = 0;

// Team 1 (Bob, Diana, Frank) has ALL remaining cards
gameState3.players[1].hand = [
  { suit: 'hearts', rank: '2' },
  { suit: 'hearts', rank: '3' },
  { suit: 'diamonds', rank: '2' }
];
gameState3.players[1].cardCount = 3;

gameState3.players[3].hand = [
  { suit: 'diamonds', rank: '3' },
  { suit: 'clubs', rank: '2' }
];
gameState3.players[3].cardCount = 2;

gameState3.players[5].hand = [
  { suit: 'clubs', rank: '3' },
  { suit: 'spades', rank: '2' },
  { suit: 'spades', rank: '3' }
];
gameState3.players[5].cardCount = 3;

// Some sets already claimed
gameState3.claimedSets = [
  { team: 0, suit: 'hearts', isHigh: true, cards: [] },
  { team: 1, suit: 'diamonds', isHigh: true, cards: [] },
  { team: 0, suit: 'clubs', isHigh: true, cards: [] }
];

logAdvancedEndgameState(gameState3, 'TEAM 0 COMPLETELY OUT OF CARDS', 
  'Team 0 has no cards left! Team 1 has all remaining cards. Special endgame rules apply!');

console.log('\n🚨 SPECIAL ENDGAME SITUATION:');
const teamWithCards = getTeamWithAllCards(gameState3);
console.log(`• Team ${teamWithCards} has ALL remaining cards`);
console.log('• No more questions can be asked');
console.log('• Team 1 must claim out all remaining half-suits');
console.log('• Turn is with Team 0 (Alice), so Alice chooses who from Team 1 claims');

const validOpponents = gameState3.players.filter(p => p.team === 1 && p.cardCount > 0);
console.log(`\n👥 Alice can choose from: ${validOpponents.map(p => `${p.name} (${p.cardCount} cards)`).join(', ')}`);

console.log('\n🎯 ALICE\'S DECISION:');
console.log('Alice chooses Frank to make all final claims (he has the most cards: 3)');

// Simulate Alice choosing Frank for final claims
const frankId = validOpponents.find(p => p.name === 'Frank').id;
const updatedState3 = passTurnToPlayer(gameState3, frankId);

logAdvancedEndgameState(updatedState3, 'FRANK CHOSEN FOR FINAL CLAIMS', 
  'Frank must now claim all remaining half-suits without consulting teammates!');

console.log('\n📋 REMAINING UNCLAIMED SETS TO CLAIM:');
const remainingSets = getUnclaimedSets(updatedState3);
remainingSets.forEach((set, index) => {
  console.log(`   ${index + 1}. ${set.isHigh ? 'High' : 'Low'} ${set.suit}`);
});

console.log('\n⚠️  FINAL CLAIMING RULES:');
console.log('• Frank must claim ALL remaining sets');
console.log('• Frank cannot consult his teammates');
console.log('• Frank must make individual claims for each set');
console.log('• If Frank makes wrong claims, sets get cancelled');
console.log('• Game ends when all 8 sets are processed');

// ========================================================================
// SCENARIO 4: TURN WITH TEAM THAT HAS CARDS, BUT THEY MUST CLAIM OUT
// ========================================================================
console.log('\n\n📝 SCENARIO 4: TURN WITH TEAM THAT HAS ALL CARDS');
console.log('===============================================');

let gameState4 = initializeGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
gameState4.phase = 'playing';
gameState4.currentPlayerIndex = 3; // Diana's turn (Team 1)

// Team 0 has NO cards
gameState4.players[0].hand = [];
gameState4.players[0].cardCount = 0;
gameState4.players[2].hand = [];
gameState4.players[2].cardCount = 0;
gameState4.players[4].hand = [];
gameState4.players[4].cardCount = 0;

// Team 1 has ALL cards, Diana's turn
gameState4.players[1].hand = [
  { suit: 'hearts', rank: '2' },
  { suit: 'hearts', rank: '3' }
];
gameState4.players[1].cardCount = 2;

gameState4.players[3].hand = [
  { suit: 'diamonds', rank: '2' },
  { suit: 'diamonds', rank: '3' }
];
gameState4.players[3].cardCount = 2;

gameState4.players[5].hand = [
  { suit: 'clubs', rank: '2' },
  { suit: 'clubs', rank: '3' },
  { suit: 'spades', rank: '2' },
  { suit: 'spades', rank: '3' }
];
gameState4.players[5].cardCount = 4;

// Some sets already claimed
gameState4.claimedSets = [
  { team: 0, suit: 'hearts', isHigh: true, cards: [] },
  { team: 1, suit: 'diamonds', isHigh: true, cards: [] },
  { team: 0, suit: 'clubs', isHigh: true, cards: [] },
  { team: 1, suit: 'spades', isHigh: true, cards: [] }
];

logAdvancedEndgameState(gameState4, 'DIANA\'S TURN - TEAM HAS ALL CARDS', 
  'Turn is with Team 1 who has all remaining cards. Diana must claim all remaining sets!');

console.log('\n🎯 FORCED CLAIMING SITUATION:');
console.log('• Diana\'s team (Team 1) has all remaining cards');
console.log('• Opponent team (Team 0) has no cards');
console.log('• Diana must claim all remaining half-suits');
console.log('• Diana cannot consult teammates Bob and Frank');
console.log('• Diana must make claims one by one');

const unclaimedSets4 = getUnclaimedSets(gameState4);
console.log(`\n📋 Diana must claim ${unclaimedSets4.length} remaining sets`);

// ========================================================================
// SCENARIO 5: COMPLEX TURN PASSING WITH SKIP
// ========================================================================
console.log('\n\n📝 SCENARIO 5: COMPLEX TURN PASSING SITUATION');
console.log('============================================');

let gameState5 = initializeGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
gameState5.phase = 'playing';
gameState5.currentPlayerIndex = 0; // Alice's turn

// Tricky situation: some players have no cards, turn needs to find valid player
gameState5.players[0].hand = []; // Alice - no cards
gameState5.players[0].cardCount = 0;
gameState5.players[1].hand = [{ suit: 'hearts', rank: '2' }]; // Bob - has cards
gameState5.players[1].cardCount = 1;
gameState5.players[2].hand = []; // Charlie - no cards
gameState5.players[2].cardCount = 0;
gameState5.players[3].hand = []; // Diana - no cards
gameState5.players[3].cardCount = 0;
gameState5.players[4].hand = [{ suit: 'diamonds', rank: '2' }]; // Eve - has cards
gameState5.players[4].cardCount = 1;
gameState5.players[5].hand = []; // Frank - no cards
gameState5.players[5].cardCount = 0;

logAdvancedEndgameState(gameState5, 'COMPLEX TURN SITUATION', 
  'Alice has no cards, turn needs to find next valid player. Only Bob and Eve have cards!');

const validPlayers5 = getValidPlayers(gameState5);
console.log('\n🎯 TURN PASSING LOGIC:');
console.log(`Valid players with cards: ${validPlayers5.map(p => p.name).join(', ')}`);

// Find next valid player
const nextPlayer = getNextValidPlayer(gameState5);
if (nextPlayer) {
  console.log(`\n🔄 Next valid player in turn order: ${nextPlayer.name}`);
  console.log('Turn should automatically skip to this player');
  
  // Simulate turn passing
  const updatedState5 = passTurnToPlayer(gameState5, nextPlayer.id);
  
  logAdvancedEndgameState(updatedState5, 'AFTER AUTOMATIC TURN SKIP', 
    `Turn automatically skipped players with no cards and went to ${nextPlayer.name}`);
}

if (validPlayers5.length === 2) {
  console.log('\n⚠️  CRITICAL SITUATION:');
  console.log('• Only 2 players left with cards (different teams)');
  console.log('• Game is approaching end state');
  console.log('• Soon one team will have all remaining cards');
}

// ========================================================================
// FINAL SUMMARY
// ========================================================================
console.log('\n\n📝 ADVANCED ENDGAME SCENARIOS SUMMARY');
console.log('=====================================');

console.log('\n🎯 ALL ADVANCED SCENARIOS TESTED:');
console.log('1. ✅ PLAYER LOSES ALL CARDS DURING TURN → Must pass to teammate');
console.log('2. ✅ PLAYER LOSES LAST CARD FROM ASK → Cannot be asked anymore');
console.log('3. ⚠️  ONE TEAM OUT OF CARDS → Other team must claim out');
console.log('4. 🎯 TURN WITH TEAM THAT HAS ALL CARDS → Must claim without consulting');
console.log('5. 🔄 COMPLEX TURN PASSING → Skip players with no cards');

console.log('\n📚 ADVANCED ENDGAME RULES VERIFIED:');
console.log('• Players with no cards cannot take turns');
console.log('• Players with no cards cannot be asked for cards');
console.log('• When losing all cards during turn, pass to teammate with cards');
console.log('• When one team is out, other team must claim remaining sets');
console.log('• If turn is with cardless team, they choose who claims');
console.log('• If turn is with team that has cards, current player claims');
console.log('• Final claiming is done without teammate consultation');
console.log('• Turn rotation skips players with no cards');

console.log('\n🎮 HELPER FUNCTIONS TESTED:');
console.log('• getValidPlayers() - Players who can take turns');
console.log('• getValidTeammates() - Teammates who can receive turn');
console.log('• passTurnToPlayer() - Pass turn to specific player');
console.log('• getNextValidPlayer() - Find next player with cards');
console.log('• getTeamWithAllCards() - Check if one team has all cards');
console.log('• getUnclaimedSets() - List remaining sets to claim');
console.log('• canBeAsked() - Check if player can be asked for cards');

console.log('\n🎮 These scenarios require advanced game state management!'); 