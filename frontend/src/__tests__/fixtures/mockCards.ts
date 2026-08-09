import { BattleCard } from '../../utils/battleEngine';

/**
 * Standard balanced player test deck (Total Stat Cost <= 300).
 */
export const MOCK_PLAYER_DECK: BattleCard[] = [
  {
    id: 'p1',
    name: 'Great Hall Pillars',
    rarity: 'Legendary',
    category: 'Landmarks',
    stats: { attack: 85, defense: 95, speed: 40, brains: 90 },
  },
  {
    id: 'p2',
    name: "Solomon's Torch",
    rarity: 'Epic',
    category: 'Landmarks',
    stats: { attack: 90, defense: 70, speed: 85, brains: 88 },
  },
  {
    id: 'p3',
    name: 'Quantum Reactor',
    rarity: 'Rare',
    category: 'Science',
    stats: { attack: 75, defense: 60, speed: 70, brains: 95 },
  },
  {
    id: 'p4',
    name: 'Wits Springbok',
    rarity: 'Common',
    category: 'Sports',
    stats: { attack: 72, defense: 55, speed: 92, brains: 60 },
  },
  {
    id: 'p5',
    name: 'Ancient Tome',
    rarity: 'Epic',
    category: 'History',
    stats: { attack: 55, defense: 72, speed: 30, brains: 99 },
  },
];

/**
 * Standard CPU test deck.
 */
export const MOCK_CPU_DECK: BattleCard[] = [
  {
    id: 'c1',
    name: 'Joburg Skyline',
    rarity: 'Epic',
    category: 'Landmarks',
    stats: { attack: 80, defense: 88, speed: 55, brains: 82 },
  },
  {
    id: 'c2',
    name: 'Reef Gold',
    rarity: 'Legendary',
    category: 'History',
    stats: { attack: 95, defense: 65, speed: 72, brains: 78 },
  },
  {
    id: 'c3',
    name: 'Ubuntu Spirit',
    rarity: 'Rare',
    category: 'Lifestyle',
    stats: { attack: 60, defense: 90, speed: 60, brains: 92 },
  },
  {
    id: 'c4',
    name: 'Voortrekker',
    rarity: 'Common',
    category: 'History',
    stats: { attack: 78, defense: 75, speed: 68, brains: 70 },
  },
  {
    id: 'c5',
    name: 'Kruger Leopard',
    rarity: 'Epic',
    category: 'Sports',
    stats: { attack: 92, defense: 58, speed: 96, brains: 65 },
  },
];

/**
 * Asymmetric test cards for edge-case evaluation.
 */
export const EXTREME_ATTACK_CARD: BattleCard = {
  id: 'x1',
  name: 'Titan Blade',
  rarity: 'Legendary',
  category: 'Science',
  stats: { attack: 100, defense: 10, speed: 10, brains: 10 },
};

export const EXTREME_DEFENSE_CARD: BattleCard = {
  id: 'x2',
  name: 'Aegis Shield',
  rarity: 'Epic',
  category: 'Landmarks',
  stats: { attack: 10, defense: 100, speed: 10, brains: 10 },
};
