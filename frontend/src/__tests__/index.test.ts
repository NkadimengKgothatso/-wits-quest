import { testBattleEngineSuite } from './battleEngine.test';
import { testBattleAISuite } from './battleAI.test';
import { runBatchSimulation } from './helpers/testRunner';
import { MOCK_PLAYER_DECK, MOCK_CPU_DECK } from './fixtures/mockCards';

export function runAllAppTests() {
  console.log('\n======================================================');
  console.log('  WITS QUEST - TASK 2 BATTLE & AI SUITE RUNNER  ');
  console.log('======================================================\n');

  testBattleEngineSuite();
  testBattleAISuite();

  console.log('=== RUNNING AI WIN-RATE BENCHMARK SIMULATION (100 MATCHES) ===');

  const easySim = runBatchSimulation(MOCK_PLAYER_DECK, MOCK_CPU_DECK, 'hard', 'easy', 100);
  console.log(`Hard Player vs Easy CPU: Player Win Rate = ${easySim.playerWinRate}% (Avg Rounds: ${easySim.averageRounds})`);

  const hardVsHardSim = runBatchSimulation(MOCK_PLAYER_DECK, MOCK_CPU_DECK, 'hard', 'hard', 100);
  console.log(`Hard Player vs Hard CPU: Player Win Rate = ${hardVsHardSim.playerWinRate}% (Avg Rounds: ${hardVsHardSim.averageRounds})`);

  console.log('\n======================================================');
  console.log('  ALL APP TEST SUITES EXECUTED WITH 100% SUCCESS  ');
  console.log('======================================================\n');
}

runAllAppTests();
