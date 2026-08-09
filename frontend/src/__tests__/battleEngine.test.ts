import {
  createBattleState,
  resolveRound,
  calculateRewards,
} from '../utils/battleEngine';
import { MOCK_PLAYER_DECK, MOCK_CPU_DECK, EXTREME_ATTACK_CARD, EXTREME_DEFENSE_CARD } from './fixtures/mockCards';

export function testBattleEngineSuite() {
  console.log('=== RUNNING BATTLE ENGINE SUITE ===');

  // Test 1: Initialization state
  const state = createBattleState(MOCK_PLAYER_DECK, MOCK_CPU_DECK, 'medium', 5);
  console.assert(state.currentRound === 1, 'Initial round should be 1');
  console.assert(state.playerWins === 0, 'Initial player wins should be 0');
  console.assert(state.cpuWins === 0, 'Initial cpu wins should be 0');
  console.assert(state.isGameOver === false, 'Initial game state should not be game over');
  console.log('✓ Battle Engine Initialization: Passed');

  // Test 2: Win resolution (Player higher stat)
  const winState = resolveRound(state, MOCK_PLAYER_DECK[0], MOCK_CPU_DECK[0], 'defense');
  console.assert(winState.playerWins === 1, 'Player should gain 1 win');
  console.assert(winState.rounds[0].outcome === 'win', 'Outcome should be win');
  console.log('✓ Round Win Resolution: Passed');

  // Test 3: Tie resolution (Equal stats)
  const tieState = resolveRound(state, EXTREME_ATTACK_CARD, EXTREME_ATTACK_CARD, 'attack');
  console.assert(tieState.rounds[0].outcome === 'tie', 'Outcome should be tie');
  console.assert(tieState.playerWins === 0 && tieState.cpuWins === 0, 'Wins should not increment on tie');
  console.log('✓ Round Tie Resolution: Passed');

  // Test 4: Game Over by Target Wins (Best of 5 -> 3 wins)
  let gameOverState = createBattleState(MOCK_PLAYER_DECK, MOCK_CPU_DECK, 'hard');
  for (let i = 0; i < 3; i++) {
    gameOverState = resolveRound(gameOverState, MOCK_PLAYER_DECK[0], MOCK_CPU_DECK[2], 'attack'); // ATK 85 vs 60 (3 wins)
  }
  console.assert(gameOverState.isGameOver === true, 'Game should end after 3 target wins');
  console.assert(gameOverState.winner === 'player', 'Player should be winner');
  console.log('✓ Early Target Win Game Over: Passed');

  // Test 5: Hard difficulty reward multiplier
  const hardRewards = calculateRewards(gameOverState);
  console.assert(hardRewards.xp === 225, 'Hard victory XP should be 150 * 1.5 = 225');
  console.assert(hardRewards.essence === 68, 'Hard victory Essence should be 45 * 1.5 = 68');
  console.assert(hardRewards.eloChange === 25, 'Hard victory Elo should be +25');
  console.log('✓ Hard Difficulty Rewards Multiplier: Passed');

  console.log('=== BATTLE ENGINE SUITE PASSED CLEANLY ===\n');
}
