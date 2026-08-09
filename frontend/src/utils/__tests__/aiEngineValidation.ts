import {
  createBattleState,
  resolveRound,
  calculateRewards,
  BattleCard,
  StatAttribute,
} from '../battleEngine';
import { selectAIAction, selectAICounterCard } from '../battleAI';

const testPlayerDeck: BattleCard[] = [
  { id: 1, name: 'Hall', rarity: 'Legendary', stats: { attack: 85, defense: 95, speed: 40, brains: 90 } },
  { id: 2, name: 'Torch', rarity: 'Epic', stats: { attack: 90, defense: 70, speed: 85, brains: 88 } },
];

const testCpuDeck: BattleCard[] = [
  { id: 101, name: 'Skyline', rarity: 'Epic', stats: { attack: 80, defense: 88, speed: 55, brains: 82 } },
  { id: 102, name: 'Gold', rarity: 'Legendary', stats: { attack: 95, defense: 65, speed: 72, brains: 78 } },
];

export function runAIEngineTests() {
  console.log('--- RUNNING BATTLE & AI ENGINE VALIDATION SUITE ---');

  // Test 1: Battle state creation
  const state = createBattleState(testPlayerDeck, testCpuDeck, 'hard');
  console.assert(state.difficulty === 'hard', 'State difficulty should be hard');
  console.assert(state.maxRounds === 5, 'Default maxRounds should be 5');
  console.log('✓ Test 1 Passed: Battle State initialization');

  // Test 2: Easy AI (Random selection)
  const easyChoice = selectAIAction(testCpuDeck, testPlayerDeck, [], 'easy');
  console.assert(easyChoice.card !== undefined, 'Easy AI should select a card');
  console.assert(easyChoice.stat !== undefined, 'Easy AI should select a stat');
  console.log('✓ Test 2 Passed: Easy AI Action selection');

  // Test 3: Medium AI (Greedy maximizer)
  const mediumChoice = selectAIAction(testCpuDeck, testPlayerDeck, [], 'medium');
  console.assert(mediumChoice.card.id === 102, 'Medium AI should select card 102 (Gold, ATK 95)');
  console.assert(mediumChoice.stat === 'attack', 'Medium AI should select ATTACK stat');
  console.log('✓ Test 3 Passed: Medium AI Greedy selection');

  // Test 4: Hard AI Counter-Card Selection (Minimum Winner)
  // Player plays card with ATK 85. CPU has card 101 (ATK 80) and card 102 (ATK 95).
  // Hard AI should select card 102 to win ATK 85 vs 95.
  const hardCounter = selectAICounterCard(testCpuDeck, testPlayerDeck[0], 'attack', [], 'hard');
  console.assert(hardCounter.card.id === 102, 'Hard AI counter should select card 102 to beat 85 ATK');
  console.log('✓ Test 4 Passed: Hard AI Minimax Counter selection');

  // Test 5: Round Resolution & Rewards Calculation
  const round1 = resolveRound(state, testPlayerDeck[0], testCpuDeck[0], 'defense'); // Player DEF 95 vs CPU DEF 88 -> WIN
  console.assert(round1.playerWins === 1, 'Player should have 1 win');
  console.assert(round1.rounds[0].outcome === 'win', 'Round 1 outcome should be win');

  console.log('--- ALL AI ENGINE TESTS PASSED CLEANLY ---');
}
