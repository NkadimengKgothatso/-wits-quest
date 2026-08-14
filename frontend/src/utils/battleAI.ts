import { BattleCard, StatAttribute, RoundRecord, AIDifficulty } from './battleEngine';

const ALL_ATTRIBUTES: StatAttribute[] = ['attack', 'defense', 'speed', 'brains'];

export interface AIActionChoice {
  card: BattleCard;
  stat: StatAttribute;
  reasoning?: string;
}

export interface AICounterCardChoice {
  card: BattleCard;
  reasoning?: string;
}

/**
 * Main entry point for selecting AI actions (Card + Stat) based on difficulty level.
 */
export function selectAIAction(
  cpuHand: BattleCard[],
  playerHand: BattleCard[],
  history: RoundRecord[],
  difficulty: AIDifficulty
): AIActionChoice {
  if (cpuHand.length === 0) {
    throw new Error('CPU hand is empty');
  }

  switch (difficulty) {
    case 'easy':
      return selectEasyAction(cpuHand);
    case 'medium':
      return selectMediumAction(cpuHand, playerHand);
    case 'hard':
      return selectHardAction(cpuHand, playerHand, history);
    default:
      return selectMediumAction(cpuHand, playerHand);
  }
}

/**
 * Main entry point for AI choosing a counter card when player has already selected the stat attribute.
 */
export function selectAICounterCard(
  cpuHand: BattleCard[],
  playerCard: BattleCard,
  stat: StatAttribute,
  history: RoundRecord[],
  difficulty: AIDifficulty
): AICounterCardChoice {
  if (cpuHand.length === 0) {
    throw new Error('CPU hand is empty');
  }

  switch (difficulty) {
    case 'easy':
      return selectEasyCounterCard(cpuHand);
    case 'medium':
      return selectMediumCounterCard(cpuHand, stat);
    case 'hard':
      return selectHardCounterCard(cpuHand, playerCard, stat, history);
    default:
      return selectMediumCounterCard(cpuHand, stat);
  }
}

// ---------------------------------------------------------------------------
// LEVEL 1: EASY AI (Randomized Decision Engine)
// ---------------------------------------------------------------------------

function selectEasyAction(cpuHand: BattleCard[]): AIActionChoice {
  const randomCard = cpuHand[Math.floor(Math.random() * cpuHand.length)];
  const randomStat = ALL_ATTRIBUTES[Math.floor(Math.random() * ALL_ATTRIBUTES.length)];
  return {
    card: randomCard,
    stat: randomStat,
    reasoning: 'Level 1 Easy AI: Random selection',
  };
}

function selectEasyCounterCard(cpuHand: BattleCard[]): AICounterCardChoice {
  const randomCard = cpuHand[Math.floor(Math.random() * cpuHand.length)];
  return {
    card: randomCard,
    reasoning: 'Level 1 Easy AI: Random counter card selection',
  };
}

// ---------------------------------------------------------------------------
// LEVEL 2: MEDIUM AI (Greedy Stat Maximizer)
// ---------------------------------------------------------------------------

function selectMediumAction(cpuHand: BattleCard[], playerHand: BattleCard[]): AIActionChoice {
  // Find card with highest peak stat in hand
  let bestCard = cpuHand[0];
  let bestStat: StatAttribute = 'attack';
  let highestVal = -1;

  for (const card of cpuHand) {
    for (const stat of ALL_ATTRIBUTES) {
      if (card.stats[stat] > highestVal) {
        highestVal = card.stats[stat];
        bestCard = card;
        bestStat = stat;
      }
    }
  }

  return {
    card: bestCard,
    stat: bestStat,
    reasoning: `Level 2 Medium AI: Greedy pick (${bestStat.toUpperCase()} = ${highestVal})`,
  };
}

function selectMediumCounterCard(cpuHand: BattleCard[], stat: StatAttribute): AICounterCardChoice {
  // Select card in CPU hand that has the highest value for chosen stat
  let bestCard = cpuHand[0];
  let maxStatVal = -1;

  for (const card of cpuHand) {
    if (card.stats[stat] > maxStatVal) {
      maxStatVal = card.stats[stat];
      bestCard = card;
    }
  }

  return {
    card: bestCard,
    reasoning: `Level 2 Medium AI: Highest ${stat.toUpperCase()} card in hand (${maxStatVal})`,
  };
}

// ---------------------------------------------------------------------------
// LEVEL 3: HARD / GRANDMASTER AI (Minimax & Counter-Strategy Engine)
// ---------------------------------------------------------------------------

/**
 * Minimax evaluation across remaining player hand & round history.
 */
function selectHardAction(
  cpuHand: BattleCard[],
  playerHand: BattleCard[],
  history: RoundRecord[]
): AIActionChoice {
  // Estimate player stat preferences from history
  const playerPreferredStats = getPlayerPreferredStats(history);

  let bestPair: { card: BattleCard; stat: StatAttribute } = {
    card: cpuHand[0],
    stat: 'attack',
  };
  let maxExpectedScore = -Infinity;

  const opponentCards = playerHand.length > 0 ? playerHand : cpuHand;

  for (const cpuCard of cpuHand) {
    for (const stat of ALL_ATTRIBUTES) {
      const cpuStatVal = cpuCard.stats[stat];

      // Calculate expected payoff against player hand
      let wins = 0;
      let ties = 0;
      let losses = 0;

      for (const pCard of opponentCards) {
        const pStatVal = pCard.stats[stat];
        if (cpuStatVal > pStatVal) wins++;
        else if (cpuStatVal === pStatVal) ties++;
        else losses++;
      }

      const total = opponentCards.length || 1;
      const winProbability = (wins + 0.5 * ties) / total;

      // Adjust payoff using historical preference penalty if player frequently beats this stat
      const penalty = playerPreferredStats[stat] > 0.4 ? 0.15 : 0;
      const expectedScore = winProbability - penalty;

      if (expectedScore > maxExpectedScore) {
        maxExpectedScore = expectedScore;
        bestPair = { card: cpuCard, stat };
      }
    }
  }

  return {
    card: bestPair.card,
    stat: bestPair.stat,
    reasoning: `Level 3 Grandmaster AI: Minimax optimal pick (${bestPair.stat.toUpperCase()}, expected score: ${Math.round(maxExpectedScore * 100)}%)`,
  };
}

/**
 * Smart counter-card selection when player initiates the attribute.
 * Evaluates min-winning card vs sacrificial losing card.
 */
function selectHardCounterCard(
  cpuHand: BattleCard[],
  playerCard: BattleCard,
  stat: StatAttribute,
  history: RoundRecord[]
): AICounterCardChoice {
  const targetVal = playerCard.stats[stat];

  // Separate winning cards from losing cards
  const winningCards: BattleCard[] = [];
  const losingCards: BattleCard[] = [];

  for (const card of cpuHand) {
    if (card.stats[stat] > targetVal) {
      winningCards.push(card);
    } else {
      losingCards.push(card);
    }
  }

  if (winningCards.length > 0) {
    // Strategic economy: Pick the LOWEST winning card to save higher cards for later
    winningCards.sort((a, b) => a.stats[stat] - b.stats[stat]);
    const optimalWinCard = winningCards[0];
    return {
      card: optimalWinCard,
      reasoning: `Level 3 Grandmaster AI: Minimal winner card (${optimalWinCard.stats[stat]} vs ${targetVal})`,
    };
  } else {
    // Sacrifice economy: If no card can win, sacrifice the card with lowest overall stat total
    losingCards.sort((a, b) => getTotalStats(a) - getTotalStats(b));
    const sacrificeCard = losingCards[0];
    return {
      card: sacrificeCard,
      reasoning: `Level 3 Grandmaster AI: Sacrificing lowest value card (${sacrificeCard.name})`,
    };
  }
}

/**
 * Analyzes previous round history to detect player stat choice frequencies.
 */
function getPlayerPreferredStats(history: RoundRecord[]): Record<StatAttribute, number> {
  const counts: Record<StatAttribute, number> = {
    attack: 0,
    defense: 0,
    speed: 0,
    brains: 0,
  };

  if (history.length === 0) {
    return { attack: 0.25, defense: 0.25, speed: 0.25, brains: 0.25 };
  }

  for (const record of history) {
    counts[record.stat]++;
  }

  const total = history.length;
  return {
    attack: counts.attack / total,
    defense: counts.defense / total,
    speed: counts.speed / total,
    brains: counts.brains / total,
  };
}

function getTotalStats(card: BattleCard): number {
  return card.stats.attack + card.stats.defense + card.stats.speed + card.stats.brains;
}
