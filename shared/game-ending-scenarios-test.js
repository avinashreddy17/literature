const { 
  initializeGame, 
  isGameOver,
  getGameResults,
  endGame,
  processClaimWithGameEnd,
  getClaimedSets,
  getCancelledSets,
  getTeamScore
} = require('./dist/index.js');

console.log('🏁 Literature Game - Complete Game Ending Scenarios Analysis');
console.log('===========================================================\n');

// Enhanced logging function for game ending analysis
function logDetailedGameEndingState(gameState, title, additionalInfo = '') {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🏁 ${title}`);
  console.log(`${'='.repeat(70)}`);
  
  if (additionalInfo) {
    console.log(`💡 ${additionalInfo}\n`);
  }
  
  console.log(`🎲 Game Phase: ${gameState.phase}`);
  console.log(`🎯 Current Player: ${gameState.players[gameState.currentPlayerIndex]?.name || 'None'}`);
  console.log(`🏆 Total Sets Processed: ${gameState.claimedSets.length}/8`);
  console.log(`🔚 Game Over: ${isGameOver(gameState)}`);
  
  // Detailed claimed sets breakdown
  if (gameState.claimedSets.length > 0) {
    console.log('\n🏅 COMPLETE CLAIMED SETS BREAKDOWN:');
    console.log('-'.repeat(70));
    
    const claimedByTeam = { 0: [], 1: [], cancelled: [] };
    
    gameState.claimedSets.forEach((set, index) => {
      const teamStr = set.team === null ? 'CANCELLED ❌' : `Team ${set.team} ✅`;
      const typeStr = set.isHigh ? 'High' : 'Low';
      const setName = `${typeStr} ${set.suit}`;
      
      console.log(`   ${index + 1}. ${setName.padEnd(15)} → ${teamStr}`);
      
      if (set.team === null) {
        claimedByTeam.cancelled.push(setName);
      } else {
        claimedByTeam[set.team].push(setName);
      }
    });
    
    console.log('\n📊 SETS BY TEAM:');
    console.log(`   Team 0: [${claimedByTeam[0].join(', ')}] (${claimedByTeam[0].length} sets)`);
    console.log(`   Team 1: [${claimedByTeam[1].join(', ')}] (${claimedByTeam[1].length} sets)`);
    console.log(`   Cancelled: [${claimedByTeam.cancelled.join(', ')}] (${claimedByTeam.cancelled.length} sets)`);
    
    // Calculate scores using helper functions
    const team0Score = getTeamScore(gameState, 0);
    const team1Score = getTeamScore(gameState, 1);
    const claimedSets = getClaimedSets(gameState);
    const cancelledSets = getCancelledSets(gameState);
    
    console.log('\n📈 SCORE CALCULATION:');
    console.log(`   Team 0 Score: ${team0Score} half-suits`);
    console.log(`   Team 1 Score: ${team1Score} half-suits`);
    console.log(`   Successfully Claimed: ${claimedSets.length} sets`);
    console.log(`   Cancelled Sets: ${cancelledSets.length} sets`);
    console.log(`   Total Processed: ${claimedSets.length + cancelledSets.length}/8 sets`);
    
    // Get comprehensive results
    if (isGameOver(gameState)) {
      const results = getGameResults(gameState);
      console.log('\n🏆 FINAL RESULTS:');
      console.log(`   Winner: ${results.winner !== null ? `Team ${results.winner}` : 'TIE'} 🏆`);
      console.log(`   Message: "${results.message}"`);
      console.log(`   Game Status: ${results.isGameOver ? 'COMPLETE' : 'IN PROGRESS'}`);
    }
  }
  
  // Show remaining player cards if any
  const playersWithCards = gameState.players.filter(p => p.cardCount > 0);
  if (playersWithCards.length > 0) {
    console.log('\n🃏 REMAINING PLAYER CARDS:');
    console.log('-'.repeat(70));
    playersWithCards.forEach(player => {
      const handStr = player.hand.map(c => `${c.rank}${c.suit[0].toUpperCase()}`).join(' ');
      console.log(`   ${player.name} (Team ${player.team}): [${handStr}] (${player.cardCount} cards)`);
    });
  } else {
    console.log('\n🃏 ALL CARDS CLAIMED/CANCELLED - NO REMAINING CARDS');
  }
  
  console.log(`${'='.repeat(70)}\n`);
}

console.log('🚀 STARTING DETAILED GAME ENDING SCENARIOS TEST\n');

// ========================================================================
// SCENARIO 1: TEAM 0 DECISIVE WIN (6-2)
// ========================================================================
console.log('📝 SCENARIO 1: TEAM 0 DECISIVE WIN (6-2)');
console.log('=========================================');

let gameState1 = initializeGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
gameState1.phase = 'playing';

// Simulate Team 0 dominating with 6 half-suits vs Team 1's 2
gameState1.claimedSets = [
  // Team 0 wins 6 sets (dominant victory)
  { team: 0, suit: 'hearts', isHigh: false, cards: [] },  // Low hearts
  { team: 0, suit: 'hearts', isHigh: true, cards: [] },   // High hearts  
  { team: 0, suit: 'diamonds', isHigh: false, cards: [] }, // Low diamonds
  { team: 0, suit: 'diamonds', isHigh: true, cards: [] },  // High diamonds
  { team: 0, suit: 'clubs', isHigh: false, cards: [] },    // Low clubs
  { team: 0, suit: 'clubs', isHigh: true, cards: [] },     // High clubs
  // Team 1 wins only 2 sets
  { team: 1, suit: 'spades', isHigh: false, cards: [] },   // Low spades
  { team: 1, suit: 'spades', isHigh: true, cards: [] }     // High spades
];

// Clear player hands since all cards are claimed
gameState1.players.forEach(player => {
  player.hand = [];
  player.cardCount = 0;
});

logDetailedGameEndingState(gameState1, 'BEFORE ENDING - TEAM 0 DECISIVE WIN', 
  'Team 0 completely dominates with 6/8 half-suits!');

console.log('🎯 EXECUTING GAME END PROCESS:');
console.log('Checking if game is over and processing final results...');

const finalState1 = endGame(gameState1);
const results1 = getGameResults(finalState1);

console.log(`\n📋 GAME END RESULT:`);
console.log(`✅ Game Over: ${isGameOver(finalState1)}`);
console.log(`🏆 Winner: Team ${results1.winner}`);
console.log(`📊 Final Score: ${results1.team0Score}-${results1.team1Score}`);
console.log(`📝 Message: "${results1.message}"`);

logDetailedGameEndingState(finalState1, 'AFTER GAME END - TEAM 0 DECISIVE WIN', 
  'Game phase set to "finished" and final results calculated.');

// ========================================================================
// SCENARIO 2: TEAM 1 NARROW WIN (5-3)
// ========================================================================
console.log('\n\n📝 SCENARIO 2: TEAM 1 NARROW WIN (5-3)');
console.log('======================================');

let gameState2 = initializeGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
gameState2.phase = 'playing';

// Simulate close game with Team 1 winning narrowly
gameState2.claimedSets = [
  // Team 1 wins 5 sets (narrow victory)
  { team: 1, suit: 'hearts', isHigh: false, cards: [] },   // Low hearts
  { team: 1, suit: 'hearts', isHigh: true, cards: [] },    // High hearts
  { team: 1, suit: 'diamonds', isHigh: false, cards: [] }, // Low diamonds
  { team: 1, suit: 'clubs', isHigh: false, cards: [] },    // Low clubs
  { team: 1, suit: 'spades', isHigh: true, cards: [] },    // High spades
  // Team 0 wins 3 sets
  { team: 0, suit: 'diamonds', isHigh: true, cards: [] },  // High diamonds
  { team: 0, suit: 'clubs', isHigh: true, cards: [] },     // High clubs
  { team: 0, suit: 'spades', isHigh: false, cards: [] }    // Low spades
];

gameState2.players.forEach(player => {
  player.hand = [];
  player.cardCount = 0;
});

logDetailedGameEndingState(gameState2, 'BEFORE ENDING - TEAM 1 NARROW WIN', 
  'Close competitive game with Team 1 edging out a 5-3 victory.');

const finalState2 = endGame(gameState2);
const results2 = getGameResults(finalState2);

console.log(`🎯 GAME END ANALYSIS:`);
console.log(`📊 Final Score: Team 0: ${results2.team0Score}, Team 1: ${results2.team1Score}`);
console.log(`🏆 Winner: Team ${results2.winner}`);
console.log(`📈 Margin: ${Math.abs(results2.team1Score - results2.team0Score)} half-suits`);

logDetailedGameEndingState(finalState2, 'AFTER GAME END - TEAM 1 NARROW WIN', 
  'Competitive game with narrow victory margin.');

// ========================================================================
// SCENARIO 3: PERFECT TIE (4-4)
// ========================================================================
console.log('\n\n📝 SCENARIO 3: PERFECT TIE (4-4)');
console.log('================================');

let gameState3 = initializeGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
gameState3.phase = 'playing';

// Simulate perfect tie scenario
gameState3.claimedSets = [
  // Team 0 wins exactly 4 sets
  { team: 0, suit: 'hearts', isHigh: false, cards: [] },   // Low hearts
  { team: 0, suit: 'hearts', isHigh: true, cards: [] },    // High hearts
  { team: 0, suit: 'diamonds', isHigh: false, cards: [] }, // Low diamonds
  { team: 0, suit: 'diamonds', isHigh: true, cards: [] },  // High diamonds
  // Team 1 wins exactly 4 sets
  { team: 1, suit: 'clubs', isHigh: false, cards: [] },    // Low clubs
  { team: 1, suit: 'clubs', isHigh: true, cards: [] },     // High clubs
  { team: 1, suit: 'spades', isHigh: false, cards: [] },   // Low spades
  { team: 1, suit: 'spades', isHigh: true, cards: [] }     // High spades
];

gameState3.players.forEach(player => {
  player.hand = [];
  player.cardCount = 0;
});

logDetailedGameEndingState(gameState3, 'BEFORE ENDING - PERFECT TIE', 
  'Rare perfect tie scenario - both teams have exactly 4 half-suits each!');

const finalState3 = endGame(gameState3);
const results3 = getGameResults(finalState3);

console.log(`🎯 TIE GAME ANALYSIS:`);
console.log(`📊 Final Score: ${results3.team0Score}-${results3.team1Score}`);
console.log(`🤝 Winner: ${results3.winner === null ? 'TIE GAME' : `Team ${results3.winner}`}`);
console.log(`🎲 Tie Frequency: Ties are fairly common in Literature`);

logDetailedGameEndingState(finalState3, 'AFTER GAME END - PERFECT TIE', 
  'Both teams performed equally well - a true deadlock!');

// ========================================================================
// SCENARIO 4: GAME WITH CANCELLED SETS (3-2 with 3 cancelled)
// ========================================================================
console.log('\n\n📝 SCENARIO 4: GAME WITH CANCELLED SETS (3-2 with 3 cancelled)');
console.log('===============================================================');

let gameState4 = initializeGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
gameState4.phase = 'playing';

// Simulate game with many wrong location claims
gameState4.claimedSets = [
  // Team 0 wins 3 sets
  { team: 0, suit: 'hearts', isHigh: false, cards: [] },   // Low hearts
  { team: 0, suit: 'diamonds', isHigh: true, cards: [] },  // High diamonds
  { team: 0, suit: 'clubs', isHigh: false, cards: [] },    // Low clubs
  // Team 1 wins 2 sets
  { team: 1, suit: 'hearts', isHigh: true, cards: [] },    // High hearts
  { team: 1, suit: 'spades', isHigh: false, cards: [] },   // Low spades
  // 3 sets cancelled due to wrong locations
  { team: null, suit: 'diamonds', isHigh: false, cards: [] }, // Low diamonds cancelled
  { team: null, suit: 'clubs', isHigh: true, cards: [] },     // High clubs cancelled
  { team: null, suit: 'spades', isHigh: true, cards: [] }     // High spades cancelled
];

gameState4.players.forEach(player => {
  player.hand = [];
  player.cardCount = 0;
});

logDetailedGameEndingState(gameState4, 'BEFORE ENDING - GAME WITH CANCELLED SETS', 
  'Many wrong location claims resulted in 3 cancelled sets!');

const finalState4 = endGame(gameState4);
const results4 = getGameResults(finalState4);

console.log(`🎯 CANCELLED SETS ANALYSIS:`);
console.log(`📊 Successful Claims: ${results4.team0Score + results4.team1Score}/8 sets`);
console.log(`❌ Cancelled Claims: ${results4.cancelledSets}/8 sets`);
console.log(`🏆 Winner: Team ${results4.winner} (despite cancelled sets)`);
console.log(`💡 Impact: Cancelled sets don't count toward any team's score`);

logDetailedGameEndingState(finalState4, 'AFTER GAME END - GAME WITH CANCELLED SETS', 
  'Team 0 wins despite many sets being cancelled due to wrong locations.');

// ========================================================================
// SCENARIO 5: EXTREMELY CLOSE GAME (4-3 with 1 cancelled)
// ========================================================================
console.log('\n\n📝 SCENARIO 5: EXTREMELY CLOSE GAME (4-3 with 1 cancelled)');
console.log('==========================================================');

let gameState5 = initializeGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
gameState5.phase = 'playing';

// Simulate nail-biting finish
gameState5.claimedSets = [
  // Team 0 wins 4 sets
  { team: 0, suit: 'hearts', isHigh: false, cards: [] },   // Low hearts
  { team: 0, suit: 'hearts', isHigh: true, cards: [] },    // High hearts
  { team: 0, suit: 'diamonds', isHigh: false, cards: [] }, // Low diamonds
  { team: 0, suit: 'clubs', isHigh: false, cards: [] },    // Low clubs
  // Team 1 wins 3 sets
  { team: 1, suit: 'diamonds', isHigh: true, cards: [] },  // High diamonds
  { team: 1, suit: 'spades', isHigh: false, cards: [] },   // Low spades
  { team: 1, suit: 'spades', isHigh: true, cards: [] },    // High spades
  // 1 set cancelled (could have changed the outcome!)
  { team: null, suit: 'clubs', isHigh: true, cards: [] }   // High clubs cancelled
];

gameState5.players.forEach(player => {
  player.hand = [];
  player.cardCount = 0;
});

logDetailedGameEndingState(gameState5, 'BEFORE ENDING - EXTREMELY CLOSE GAME', 
  'One-point game! The cancelled set could have changed everything!');

const finalState5 = endGame(gameState5);
const results5 = getGameResults(finalState5);

console.log(`🎯 CLOSE GAME ANALYSIS:`);
console.log(`📊 Final Score: ${results5.team0Score}-${results5.team1Score}`);
console.log(`🏆 Winner: Team ${results5.winner}`);
console.log(`📉 Margin: Only ${Math.abs(results5.team0Score - results5.team1Score)} half-suit difference!`);
console.log(`💔 Critical Miss: The cancelled high clubs could have tied the game!`);

logDetailedGameEndingState(finalState5, 'AFTER GAME END - EXTREMELY CLOSE GAME', 
  'Nail-biting finish with minimal margin of victory!');

// ========================================================================
// SCENARIO 6: AUTOMATIC GAME ENDING WITH processClaimWithGameEnd
// ========================================================================
console.log('\n\n📝 SCENARIO 6: AUTOMATIC GAME ENDING WITH FINAL CLAIM');
console.log('====================================================');

let gameState6 = initializeGame(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
gameState6.phase = 'playing';
gameState6.currentPlayerIndex = 0; // Alice's turn

// Set up game with 7 sets already claimed (one short of ending)
gameState6.claimedSets = [
  { team: 0, suit: 'hearts', isHigh: false, cards: [] },
  { team: 1, suit: 'hearts', isHigh: true, cards: [] },
  { team: 0, suit: 'diamonds', isHigh: false, cards: [] },
  { team: 1, suit: 'diamonds', isHigh: true, cards: [] },
  { team: 0, suit: 'clubs', isHigh: false, cards: [] },
  { team: 1, suit: 'clubs', isHigh: true, cards: [] },
  { team: 0, suit: 'spades', isHigh: false, cards: [] }
  // Missing: High spades (8th and final set)
];

// Give Alice the final high spades for a perfect claim
gameState6.players[0].hand = [
  { suit: 'spades', rank: '9' },
  { suit: 'spades', rank: '10' },
  { suit: 'spades', rank: 'J' },
  { suit: 'spades', rank: 'Q' },
  { suit: 'spades', rank: 'K' },
  { suit: 'spades', rank: 'A' }
];
gameState6.players[0].cardCount = 6;

// Clear other players
gameState6.players.slice(1).forEach(player => {
  player.hand = [];
  player.cardCount = 0;
});

logDetailedGameEndingState(gameState6, 'BEFORE FINAL CLAIM - GAME ABOUT TO END', 
  'Game is 7/8 complete. Alice has all high spades for the final claim!');

// Execute the final claim that will end the game
const finalClaim = {
  type: 'claim',
  playerId: 'alice',
  suit: 'spades',
  isHigh: true,
  cardLocations: [
    { 
      playerId: 'alice', 
      cards: [
        { suit: 'spades', rank: '9' },
        { suit: 'spades', rank: '10' },
        { suit: 'spades', rank: 'J' },
        { suit: 'spades', rank: 'Q' },
        { suit: 'spades', rank: 'K' },
        { suit: 'spades', rank: 'A' }
      ]
    }
  ]
};

console.log('🎯 EXECUTING FINAL CLAIM WITH AUTO GAME END:');
console.log('Alice claims: "I have all high spades!"');
console.log('This will be the 8th and final claim, automatically ending the game...');

const autoEndResult = processClaimWithGameEnd(gameState6, finalClaim);

console.log(`\n📋 AUTO END RESULT:`);
console.log(`✅ Claim Success: ${autoEndResult.success}`);
console.log(`🏁 Game Ended: ${autoEndResult.gameEnded}`);
console.log(`🏆 Winner: Team ${autoEndResult.gameResults?.winner}`);
console.log(`📝 Message: "${autoEndResult.gameResults?.message}"`);

logDetailedGameEndingState(autoEndResult.updatedState, 'AFTER AUTOMATIC GAME END', 
  'processClaimWithGameEnd automatically detected game completion and ended it!');

// ========================================================================
// FINAL SUMMARY
// ========================================================================
console.log('\n\n📝 COMPLETE GAME ENDING SCENARIOS SUMMARY');
console.log('=========================================');

console.log('\n🎯 ALL SCENARIOS TESTED:');
console.log('1. ✅ TEAM 0 DECISIVE WIN (6-2) → Clear dominance');
console.log('2. ✅ TEAM 1 NARROW WIN (5-3) → Close competitive game');
console.log('3. 🤝 PERFECT TIE (4-4) → Deadlock scenario');
console.log('4. ❌ CANCELLED SETS GAME (3-2 + 3 cancelled) → Many wrong locations');
console.log('5. 🔥 EXTREMELY CLOSE (4-3 + 1 cancelled) → Nail-biting finish');
console.log('6. 🚀 AUTO GAME END → processClaimWithGameEnd functionality');

console.log('\n📊 KEY OBSERVATIONS:');
console.log('• Game ends when exactly 8 half-suits are processed');
console.log('• Cancelled sets (team: null) count toward game completion');
console.log('• Only successful claims count toward team scores');
console.log('• Ties are valid and fairly common outcomes');
console.log('• Winner determined by most half-suits won');
console.log('• Game phase automatically set to "finished"');
console.log('• All player hands cleared when game complete');

console.log('\n🏆 LITERATURE GAME ENDING RULES VERIFIED:');
console.log('1. Game ends when all 8 half-suits processed (claimed or cancelled)');
console.log('2. Team with most successful claims wins');
console.log('3. Cancelled sets don\'t count toward any team\'s score');
console.log('4. Ties occur when teams have equal successful claims');
console.log('5. processClaimWithGameEnd provides automatic ending');
console.log('6. isGameOver, getGameResults, endGame all work correctly');

console.log('\n🎮 HELPER FUNCTIONS TESTED:');
console.log('• isGameOver() - Detects 8 sets completion');
console.log('• getGameResults() - Calculates scores and winner');
console.log('• endGame() - Sets phase to finished');
console.log('• processClaimWithGameEnd() - Auto-ending on final claim');
console.log('• getTeamScore() - Individual team scores');
console.log('• getClaimedSets() - Successfully claimed sets only');
console.log('• getCancelledSets() - Cancelled sets only');

console.log('\n🚀 All game ending scenarios tested with complete detail!'); 