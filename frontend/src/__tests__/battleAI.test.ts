import { selectAIAction, selectAICounterCard } from '../utils/battleAI';
import { MOCK_PLAYER_DECK, MOCK_CPU_DECK, EXTREME_ATTACK_CARD, EXTREME_DEFENSE_CARD } from './fixtures/mockCards';
import { RoundRecord } from '../utils/battleEngine';

export function testBattleAISuite() {
  console.log('=== RUNNING BATTLE AI ENGINE SUITE ===');

  // Test 1: Level 1 (Easy AI)
  const easyChoice = selectAIAction(MOCK_CPU_DECK, MOCK_PLAYER_DECK, [], 'easy');
  console.assert(easyChoice.card !== undefined, 'Easy AI must select a card');
  console.assert(['attack', 'defense', 'speed', 'brains'].includes(easyChoice.stat), 'Easy AI must pick a valid stat');
  console.log('✓ Level 1 (Easy AI) Action Choice: Passed');

  // Test 2: Level 2 (Medium AI - Greedy Pick)
  // MOCK_CPU_DECK has card c5 (Kruger Leopard: SPD 96) which is the absolute highest stat across the CPU deck
  const mediumChoice = selectAIAction(MOCK_CPU_DECK, MOCK_PLAYER_DECK, [], 'medium');
  console.assert(mediumChoice.card.id === 'c5', 'Medium AI should select card with highest peak stat (c5 - Kruger Leopard, SPD 96)');
  console.assert(mediumChoice.stat === 'speed', 'Medium AI should select peak stat (speed)');
  console.log('✓ Level 2 (Medium AI) Greedy Pick: Passed');

  // Test 3: Level 3 (Hard AI - Counter-Card Economy Minimal Winner)
  // Player plays Great Hall Pillars (ATK 85).
  // CPU hand has c1 (ATK 80), c2 (ATK 95), c5 (ATK 92).
  // Both c2 (95) and c5 (92) beat 85. Hard AI should pick c5 (92) because it is the minimal winning card!
  const hardCounter = selectAICounterCard(MOCK_CPU_DECK, MOCK_PLAYER_DECK[0], 'attack', [], 'hard');
  console.assert(hardCounter.card.id === 'c5', 'Hard AI should pick c5 (ATK 92) as minimum winner to beat ATK 85');
  console.log('✓ Level 3 (Hard AI) Minimax Minimal Winner Counter: Passed');

  // Test 4: Level 3 (Hard AI - Counter-Card Sacrificial Pick)
  // Player plays card with ATK 100.
  // No CPU card can beat 100. Hard AI should pick card with lowest overall stat total to sacrifice.
  const hardSacrifice = selectAICounterCard(MOCK_CPU_DECK, EXTREME_ATTACK_CARD, 'attack', [], 'hard');
  console.assert(hardSacrifice.card.id === 'c4', 'Hard AI should sacrifice card c4 (Voortrekker) with lowest total stat budget');
  console.log('✓ Level 3 (Hard AI) Sacrificial Economy Pick: Passed');

  // Test 5: Player History Tracking Evaluation
  const history: RoundRecord[] = [
    { roundNumber: 1, playerCard: MOCK_PLAYER_DECK[0], cpuCard: MOCK_CPU_DECK[0], stat: 'brains', playerStatValue: 90, cpuStatValue: 82, outcome: 'win' },
    { roundNumber: 2, playerCard: MOCK_PLAYER_DECK[1], cpuCard: MOCK_CPU_DECK[1], stat: 'brains', playerStatValue: 88, cpuStatValue: 78, outcome: 'win' },
  ];
  const historyChoice = selectAIAction(MOCK_CPU_DECK, MOCK_PLAYER_DECK, history, 'hard');
  console.assert(historyChoice.card !== undefined, 'Hard AI with history should calculate optimal action');
  console.log('✓ Level 3 (Hard AI) History Tracking: Passed');

  console.log('=== BATTLE AI ENGINE SUITE PASSED CLEANLY ===\n');
}
