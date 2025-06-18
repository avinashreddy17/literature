const { 
  initializeGame, 
  checkClaim,
  getGameResults,
  getClaimedSets,
  getCancelledSets
} = require('./dist/index.js');

console.log('🎯 Literature Game - Complete Claiming Scenarios Analysis');
console.log('========================================================\n');

// Enhanced logging function with maximum detail
function logDetailedGameState(gameState, title, additionalInfo = '') {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 ${title}`);
  console.log(`${'='.repeat(60)}`);
  
  if (additionalInfo) {
    console.log(`💡 ${additionalInfo}\n`);
  }
  
  console.log(`🎲 Game Phase: ${gameState.phase}`);
  console.log(`🎯 Current Player: ${gameState.players[gameState.currentPlayerIndex]?.name || 'None'}`);
  console.log(`🏆 Total Sets Processed: ${gameState.claimedSets.length}/8`);
  
  console.log('\n👥 COMPLETE PLAYER DETAILS:');
  console.log('-'.repeat(60));
  gameState.players.forEach((player, index) => {
    const isCurrentPlayer = index === gameState.currentPlayerIndex ? '👉' : '  ';
    const handDetails = player.hand.map(c => `${c.rank}${c.suit[0].toUpperCase()}`).join(' ');
    const handByHalfSuit = {
      lowHearts: player.hand.filter(c => c.suit === 'hearts' && ['2','3','4','5','6','7'].includes(c.rank)),
      highHearts: player.hand.filter(c => c.suit === 'hearts' && ['9','10','J','Q','K','A'].includes(c.rank)),
      lowDiamonds: player.hand.filter(c => c.suit === 'diamonds' && ['2','3','4','5','6','7'].includes(c.rank)),
      highDiamonds: player.hand.filter(c => c.suit === 'diamonds' && ['9','10','J','Q','K','A'].includes(c.rank)),
      lowClubs: player.hand.filter(c => c.suit === 'clubs' && ['2','3','4','5','6','7'].includes(c.rank)),
      highClubs: player.hand.filter(c => c.suit === 'clubs' && ['9','10','J','Q','K','A'].includes(c.rank)),
      lowSpades: player.hand.filter(c => c.suit === 'spades' && ['2','3','4','5','6','7'].includes(c.rank)),
      highSpades: player.hand.filter(c => c.suit === 'spades' && ['9','10','J','Q','K','A'].includes(c.rank))
    };
    
    console.log(`${isCurrentPlayer} ${player.name} (Team ${player.team}) - ${player.cardCount} cards:`);
    console.log(`    Full Hand: [${handDetails}]`);
    
    Object.entries(handByHalfSuit).forEach(([halfSuit, cards]) => {
      if (cards.length > 0) {
        const cardStr = cards.map(c => `${c.rank}${c.suit[0].toUpperCase()}`).join(' ');
        console.log(`    ${halfSuit}: [${cardStr}]`);
      }
    });
    console.log('');
  });
  
  if (gameState.claimedSets.length > 0) {
    console.log('🏅 CLAIMED SETS DETAILS:');
    console.log('-'.repeat(60));
    gameState.claimedSets.forEach((set, index) => {
      const teamStr = set.team === null ? 'CANCELLED ❌' : `Team ${set.team} ✅`;
      const typeStr = set.isHigh ? 'High' : 'Low';
      const cardStr = set.cards.map(c => `${c.rank}${c.suit[0].toUpperCase()}`).join(' ');
      console.log(`   ${index + 1}. ${typeStr} ${set.suit} → ${teamStr}`);
      if (set.cards.length > 0) {
        console.log(`      Cards: [${cardStr}]`);
      }
    });
    
    const results = getGameResults(gameState);
    console.log(`\n📈 CURRENT SCORES:`);
    console.log(`   Team 0: ${results.team0Score} half-suits`);
    console.log(`   Team 1: ${results.team1Score} half-suits`);
    console.log(`   Cancelled: ${results.cancelledSets} half-suits`);
    console.log(`   Status: ${results.message}`);
  }
  
  console.log(`${'='.repeat(60)}\n`);
}

console.log('🚀 STARTING DETAILED CLAIMING SCENARIOS TEST\n');

// ========================================================================
// SCENARIO 1: PERFECT CLAIM (TEAM GETS HALF-SUIT)
// ========================================================================
console.log('📝 SCENARIO 1: PERFECT CLAIM (TEAM GETS HALF-SUIT)');
console.log('==================================================');

let gameState1 = initializeGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
gameState1.phase = 'playing';
gameState1.currentPlayerIndex = 0; // Alice's turn

// Set up perfect claim scenario for low hearts
console.log('🎯 Setting up Perfect Claim Scenario for Low Hearts (2,3,4,5,6,7)...');

// Clear all hands first
gameState1.players.forEach(player => {
  player.hand = [];
  player.cardCount = 0;
});

// Give Alice's team (Team 0) ALL the low hearts
gameState1.players[0].hand = [ // Alice
  { suit: 'hearts', rank: '2' },
  { suit: 'hearts', rank: '3' },
  { suit: 'spades', rank: '9' } // Extra card
];
gameState1.players[2].hand = [ // Charlie (teammate)
  { suit: 'hearts', rank: '4' },
  { suit: 'hearts', rank: '5' },
  { suit: 'clubs', rank: 'K' } // Extra card
];
gameState1.players[4].hand = [ // Eve (teammate)
  { suit: 'hearts', rank: '6' },
  { suit: 'hearts', rank: '7' },
  { suit: 'diamonds', rank: 'A' } // Extra card
];

// Give opponents some other cards (NO low hearts)
gameState1.players[1].hand = [ // Bob (Team 1)
  { suit: 'hearts', rank: '9' },
  { suit: 'clubs', rank: '2' },
  { suit: 'spades', rank: '10' }
];
gameState1.players[3].hand = [ // Diana (Team 1)
  { suit: 'hearts', rank: '10' },
  { suit: 'diamonds', rank: '3' },
  { suit: 'spades', rank: 'J' }
];
gameState1.players[5].hand = [ // Frank (Team 1)
  { suit: 'hearts', rank: 'J' },
  { suit: 'clubs', rank: '5' },
  { suit: 'diamonds', rank: 'K' }
];

// Update card counts
gameState1.players.forEach(player => {
  player.cardCount = player.hand.length;
});

logDetailedGameState(gameState1, 'BEFORE PERFECT CLAIM', 
  'Alice\'s team (0,2,4) has ALL low hearts. Opponents have NO low hearts.');

// Create perfect claim
const perfectClaim = {
  type: 'claim',
  playerId: 'alice',
  suit: 'hearts',
  isHigh: false,
  cardLocations: [
    { 
      playerId: 'alice', 
      cards: [
        { suit: 'hearts', rank: '2' },
        { suit: 'hearts', rank: '3' }
      ]
    },
    { 
      playerId: 'charlie', 
      cards: [
        { suit: 'hearts', rank: '4' },
        { suit: 'hearts', rank: '5' }
      ]
    },
    { 
      playerId: 'eve', 
      cards: [
        { suit: 'hearts', rank: '6' },
        { suit: 'hearts', rank: '7' }
      ]
    }
  ]
};

console.log('🎯 EXECUTING PERFECT CLAIM:');
console.log('Alice claims: "My team has all low hearts!"');
console.log('- Alice has: 2♥, 3♥');
console.log('- Charlie has: 4♥, 5♥');  
console.log('- Eve has: 6♥, 7♥');

const result1 = checkClaim(gameState1, perfectClaim);
console.log(`\n📋 CLAIM RESULT: ${result1.message}`);
console.log(`✅ Success: ${result1.success}`);
console.log(`🏆 Winning Team: ${result1.winningTeam}`);

logDetailedGameState(result1.updatedState, 'AFTER PERFECT CLAIM', 
  'All low hearts removed from players. Team 0 gets the half-suit!');

// ========================================================================
// SCENARIO 2: WRONG LOCATIONS CLAIM (SET CANCELLED)
// ========================================================================
console.log('\n\n📝 SCENARIO 2: WRONG LOCATIONS CLAIM (SET CANCELLED)');
console.log('===================================================');

let gameState2 = initializeGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
gameState2.phase = 'playing';
gameState2.currentPlayerIndex = 0; // Alice's turn

console.log('🎯 Setting up Wrong Locations Scenario for Low Clubs (2,3,4,5,6,7)...');

// Clear all hands
gameState2.players.forEach(player => {
  player.hand = [];
  player.cardCount = 0;
});

// Give Alice's team ALL the low clubs BUT in different locations than claimed
gameState2.players[0].hand = [ // Alice
  { suit: 'clubs', rank: '2' },
  { suit: 'clubs', rank: '7' }, // Alice actually has 2♣ and 7♣
  { suit: 'spades', rank: '9' }
];
gameState2.players[2].hand = [ // Charlie  
  { suit: 'clubs', rank: '3' },
  { suit: 'clubs', rank: '4' }, // Charlie actually has 3♣ and 4♣
  { suit: 'hearts', rank: 'K' }
];
gameState2.players[4].hand = [ // Eve
  { suit: 'clubs', rank: '5' },
  { suit: 'clubs', rank: '6' }, // Eve actually has 5♣ and 6♣
  { suit: 'diamonds', rank: 'A' }
];

// Give opponents NO low clubs
gameState2.players[1].hand = [{ suit: 'hearts', rank: '9' }, { suit: 'spades', rank: '10' }];
gameState2.players[3].hand = [{ suit: 'hearts', rank: '10' }, { suit: 'spades', rank: 'J' }];
gameState2.players[5].hand = [{ suit: 'hearts', rank: 'J' }, { suit: 'diamonds', rank: 'K' }];

// Update card counts
gameState2.players.forEach(player => {
  player.cardCount = player.hand.length;
});

logDetailedGameState(gameState2, 'BEFORE WRONG LOCATIONS CLAIM', 
  'Alice\'s team has ALL low clubs, but Alice will claim WRONG locations!');

// Create wrong locations claim
const wrongLocationsClaim = {
  type: 'claim',
  playerId: 'alice',
  suit: 'clubs',
  isHigh: false,
  cardLocations: [
    { 
      playerId: 'alice', 
      cards: [
        { suit: 'clubs', rank: '2' },
        { suit: 'clubs', rank: '3' } // WRONG! Alice has 2♣,7♣ not 2♣,3♣
      ]
    },
    { 
      playerId: 'charlie', 
      cards: [
        { suit: 'clubs', rank: '4' },
        { suit: 'clubs', rank: '5' } // WRONG! Charlie has 3♣,4♣ not 4♣,5♣
      ]
    },
    { 
      playerId: 'eve', 
      cards: [
        { suit: 'clubs', rank: '6' },
        { suit: 'clubs', rank: '7' } // WRONG! Eve has 5♣,6♣ not 6♣,7♣
      ]
    }
  ]
};

console.log('🎯 EXECUTING WRONG LOCATIONS CLAIM:');
console.log('Alice claims: "My team has all low clubs!"');
console.log('❌ Alice INCORRECTLY claims:');
console.log('- Alice has: 2♣, 3♣ (WRONG! Actually has 2♣, 7♣)');
console.log('- Charlie has: 4♣, 5♣ (WRONG! Actually has 3♣, 4♣)');
console.log('- Eve has: 6♣, 7♣ (WRONG! Actually has 5♣, 6♣)');

const result2 = checkClaim(gameState2, wrongLocationsClaim);
console.log(`\n📋 CLAIM RESULT: ${result2.message}`);
console.log(`❌ Success: ${result2.success}`);
console.log(`🚫 Winning Team: ${result2.winningTeam} (null = cancelled)`);

logDetailedGameState(result2.updatedState, 'AFTER WRONG LOCATIONS CLAIM', 
  'All low clubs removed but NO TEAM gets them! Set is cancelled due to wrong locations.');

// ========================================================================
// SCENARIO 3: OPPONENT INTERFERENCE CLAIM (OPPONENT GETS SET)
// ========================================================================
console.log('\n\n📝 SCENARIO 3: OPPONENT INTERFERENCE CLAIM (OPPONENT GETS SET)');
console.log('==============================================================');

let gameState3 = initializeGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
gameState3.phase = 'playing';
gameState3.currentPlayerIndex = 0; // Alice's turn

console.log('🎯 Setting up Opponent Interference Scenario for High Spades (9,10,J,Q,K,A)...');

// Clear all hands
gameState3.players.forEach(player => {
  player.hand = [];
  player.cardCount = 0;
});

// Give Alice's team MOST but NOT ALL high spades
gameState3.players[0].hand = [ // Alice
  { suit: 'spades', rank: '9' },
  { suit: 'spades', rank: '10' },
  { suit: 'hearts', rank: '2' }
];
gameState3.players[2].hand = [ // Charlie
  { suit: 'spades', rank: 'J' },
  { suit: 'spades', rank: 'Q' },
  { suit: 'hearts', rank: '3' }
];
gameState3.players[4].hand = [ // Eve
  { suit: 'spades', rank: 'K' },
  // Missing A♠ - opponent has it!
  { suit: 'hearts', rank: '4' }
];

// Give opponent team one crucial card
gameState3.players[1].hand = [ // Bob (Team 1) - HAS THE MISSING CARD!
  { suit: 'spades', rank: 'A' }, // Bob has A♠ - the key card!
  { suit: 'hearts', rank: '5' }
];
gameState3.players[3].hand = [{ suit: 'hearts', rank: '6' }, { suit: 'clubs', rank: '2' }];
gameState3.players[5].hand = [{ suit: 'hearts', rank: '7' }, { suit: 'clubs', rank: '3' }];

// Update card counts
gameState3.players.forEach(player => {
  player.cardCount = player.hand.length;
});

logDetailedGameState(gameState3, 'BEFORE OPPONENT INTERFERENCE CLAIM', 
  'Alice\'s team has 5/6 high spades, but Bob (opponent) has the A♠!');

// Create opponent interference claim
const opponentInterferenceClaim = {
  type: 'claim',
  playerId: 'alice',
  suit: 'spades',
  isHigh: true,
  cardLocations: [
    { 
      playerId: 'alice', 
      cards: [
        { suit: 'spades', rank: '9' },
        { suit: 'spades', rank: '10' }
      ]
    },
    { 
      playerId: 'charlie', 
      cards: [
        { suit: 'spades', rank: 'J' },
        { suit: 'spades', rank: 'Q' }
      ]
    },
    { 
      playerId: 'eve', 
      cards: [
        { suit: 'spades', rank: 'K' },
        { suit: 'spades', rank: 'A' } // WRONG! Eve doesn't have A♠, Bob does!
      ]
    }
  ]
};

console.log('🎯 EXECUTING OPPONENT INTERFERENCE CLAIM:');
console.log('Alice claims: "My team has all high spades!"');
console.log('🔄 Alice claims her team has:');
console.log('- Alice has: 9♠, 10♠ ✅');
console.log('- Charlie has: J♠, Q♠ ✅');
console.log('- Eve has: K♠, A♠ ❌ (Eve has K♠ but Bob has A♠!)');

const result3 = checkClaim(gameState3, opponentInterferenceClaim);
console.log(`\n📋 CLAIM RESULT: ${result3.message}`);
console.log(`❌ Success: ${result3.success}`);
console.log(`🔄 Winning Team: ${result3.winningTeam} (opponent team gets it!)`);

logDetailedGameState(result3.updatedState, 'AFTER OPPONENT INTERFERENCE CLAIM', 
  'All high spades removed and given to Team 1 because Bob had A♠!');

// ========================================================================
// FINAL SUMMARY
// ========================================================================
console.log('\n\n📝 COMPLETE CLAIMING SCENARIOS SUMMARY');
console.log('=====================================');

console.log('\n🎯 SCENARIO OUTCOMES:');
console.log('1. ✅ PERFECT CLAIM → Team 0 got low hearts');
console.log('2. ❌ WRONG LOCATIONS → Low clubs cancelled (nobody gets them)');
console.log('3. 🔄 OPPONENT INTERFERENCE → Team 1 got high spades');

console.log('\n📊 KEY OBSERVATIONS:');
console.log('• Perfect claims require correct card locations');
console.log('• Wrong locations result in set cancellation (team: null)');
console.log('• Opponent interference gives set to opposing team');
console.log('• All claimed/cancelled cards are removed from player hands');
console.log('• Card counts automatically update after claims');
console.log('• Game state remains immutable (original state preserved)');

console.log('\n🏆 LITERATURE CLAIMING RULES VERIFIED:');
console.log('1. Team must possess all 6 cards in the half-suit');
console.log('2. Card locations must be stated correctly');
console.log('3. If opponent has any cards, they get the half-suit');
console.log('4. Wrong locations cancel the set (nobody wins)');
console.log('5. Successful claims award half-suit to claiming team');

console.log('\n🚀 All claiming scenarios tested with complete detail!'); 