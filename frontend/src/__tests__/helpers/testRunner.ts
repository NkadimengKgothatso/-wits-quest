import {
  BattleCard,
  StatAttribute,
  AIDifficulty,
  createBattleState,
  resolveRound,
  BattleState,
} from '../../utils/battleEngine';
import { selectAIAction, selectAICounterCard } from '../../utils/battleAI';

export interface SimulationResult {
  totalMatches: number;
  playerWins: number;
  cpuWins: number;
  draws: number;
  playerWinRate: number;
  averageRounds: number;
}

/**
 * Simulates a full automated match between Player AI strategy and CPU AI strategy.
 */
export function simulateFullMatch(
  playerDeck: BattleCard[],
  cpuDeck: BattleCard[],
  playerDifficulty: AIDifficulty,
  cpuDifficulty: AIDifficulty,
  maxRounds = 5
): BattleState {
  let state = createBattleState(playerDeck, cpuDeck, cpuDifficulty, maxRounds);

  const attributes: StatAttribute[] = ['attack', 'defense', 'speed', 'brains'];

  while (!state.isGameOver) {
    const roundIdx = state.currentRound - 1;
    const playerCard = state.playerHand[roundIdx % state.playerHand.length];

    // Player selects stat
    const playerAction = selectAIAction(
      state.playerHand,
      state.cpuHand,
      state.rounds,
      playerDifficulty
    );

    // CPU reacts with counter-card
    const cpuCounter = selectAICounterCard(
      state.cpuHand,
      playerCard,
      playerAction.stat,
      state.rounds,
      cpuDifficulty
    );

    state = resolveRound(state, playerCard, cpuCounter.card, playerAction.stat);
  }

  return state;
}

/**
 * Runs batch simulations to measure win rates across different AI difficulty matchups.
 */
export function runBatchSimulation(
  playerDeck: BattleCard[],
  cpuDeck: BattleCard[],
  playerDifficulty: AIDifficulty,
  cpuDifficulty: AIDifficulty,
  matchCount = 100
): SimulationResult {
  let playerWins = 0;
  let cpuWins = 0;
  let draws = 0;
  let totalRounds = 0;

  for (let i = 0; i < matchCount; i++) {
    const finalState = simulateFullMatch(
      playerDeck,
      cpuDeck,
      playerDifficulty,
      cpuDifficulty
    );

    totalRounds += finalState.rounds.length;

    if (finalState.winner === 'player') playerWins++;
    else if (finalState.winner === 'cpu') cpuWins++;
    else draws++;
  }

  return {
    totalMatches: matchCount,
    playerWins,
    cpuWins,
    draws,
    playerWinRate: (playerWins / matchCount) * 100,
    averageRounds: totalRounds / matchCount,
  };
}
