export type StatAttribute = 'attack' | 'defense' | 'speed' | 'brains';

export type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface CardStats {
  attack: number;
  defense: number;
  speed: number;
  brains: number;
}

export interface BattleCard {
  id: string | number;
  name: string;
  rarity: CardRarity;
  stats: CardStats;
  category?: string;
  image?: string;
}

export type RoundOutcome = 'win' | 'lose' | 'tie';

export interface RoundRecord {
  roundNumber: number;
  playerCard: BattleCard;
  cpuCard: BattleCard;
  stat: StatAttribute;
  playerStatValue: number;
  cpuStatValue: number;
  outcome: RoundOutcome;
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface BattleState {
  playerDeck: BattleCard[];
  cpuDeck: BattleCard[];
  playerHand: BattleCard[];
  cpuHand: BattleCard[];
  rounds: RoundRecord[];
  currentRound: number;
  maxRounds: number;
  playerWins: number;
  cpuWins: number;
  isGameOver: boolean;
  winner: 'player' | 'cpu' | 'draw' | null;
  difficulty: AIDifficulty;
}

export interface BattleReward {
  xp: number;
  essence: number;
  eloChange: number;
  message: string;
}

/**
 * Initializes a clean battle state between player and CPU decks.
 */
export function createBattleState(
  playerDeck: BattleCard[],
  cpuDeck: BattleCard[],
  difficulty: AIDifficulty = 'medium',
  maxRounds = 5
): BattleState {
  return {
    playerDeck: [...playerDeck],
    cpuDeck: [...cpuDeck],
    playerHand: [...playerDeck],
    cpuHand: [...cpuDeck],
    rounds: [],
    currentRound: 1,
    maxRounds,
    playerWins: 0,
    cpuWins: 0,
    isGameOver: false,
    winner: null,
    difficulty,
  };
}

/**
 * Evaluates a single battle round given chosen cards and attribute.
 */
export function resolveRound(
  state: BattleState,
  playerCard: BattleCard,
  cpuCard: BattleCard,
  stat: StatAttribute
): BattleState {
  if (state.isGameOver) return state;

  const playerStatValue = playerCard.stats[stat];
  const cpuStatValue = cpuCard.stats[stat];

  let outcome: RoundOutcome = 'tie';
  if (playerStatValue > cpuStatValue) {
    outcome = 'win';
  } else if (playerStatValue < cpuStatValue) {
    outcome = 'lose';
  }

  const record: RoundRecord = {
    roundNumber: state.currentRound,
    playerCard,
    cpuCard,
    stat,
    playerStatValue,
    cpuStatValue,
    outcome,
  };

  const newRounds = [...state.rounds, record];
  const playerWins = newRounds.filter((r) => r.outcome === 'win').length;
  const cpuWins = newRounds.filter((r) => r.outcome === 'lose').length;

  const targetWins = Math.ceil(state.maxRounds / 2);
  const isMaxRoundsReached = newRounds.length >= state.maxRounds;
  const isTargetWinsReached = playerWins >= targetWins || cpuWins >= targetWins;
  const isGameOver = isMaxRoundsReached || isTargetWinsReached;

  let winner: 'player' | 'cpu' | 'draw' | null = null;
  if (isGameOver) {
    if (playerWins > cpuWins) winner = 'player';
    else if (cpuWins > playerWins) winner = 'cpu';
    else winner = 'draw';
  }

  return {
    ...state,
    rounds: newRounds,
    currentRound: isGameOver ? state.currentRound : state.currentRound + 1,
    playerWins,
    cpuWins,
    isGameOver,
    winner,
  };
}

/**
 * Calculates end-of-match rewards based on outcome and AI difficulty level.
 */
export function calculateRewards(state: BattleState): BattleReward {
  if (!state.isGameOver || !state.winner) {
    return { xp: 0, essence: 0, eloChange: 0, message: 'Match ongoing' };
  }

  const difficultyMultiplier = state.difficulty === 'hard' ? 1.5 : state.difficulty === 'medium' ? 1.2 : 1.0;

  if (state.winner === 'player') {
    const baseXP = 150;
    const baseEssence = 45;
    const xp = Math.round(baseXP * difficultyMultiplier);
    const essence = Math.round(baseEssence * difficultyMultiplier);
    const eloChange = state.difficulty === 'hard' ? 25 : state.difficulty === 'medium' ? 18 : 12;

    return {
      xp,
      essence,
      eloChange,
      message: `Victory! Earned +${xp} XP and +${essence} Essence (${state.difficulty.toUpperCase()} AI Bonus).`,
    };
  } else if (state.winner === 'cpu') {
    return {
      xp: -20,
      essence: 0,
      eloChange: -15,
      message: 'Defeat. Lost -20 XP and -15 Elo (minimum 0).',
    };
  }

  return {
    xp: 75,
    essence: 20,
    eloChange: 0,
    message: 'Draw match. Earned +75 XP.',
  };
}
