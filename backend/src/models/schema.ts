export type UserRole = 'STUDENT' | 'ADMIN' | 'LECTURER';

export type DivisionTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export type CardCategory = 'Science' | 'History' | 'Landmarks' | 'Lifestyle' | 'Sports';

export type MatchType = 'CPU' | 'LIVE_PVP' | 'ASYNC_PVP';

export type ChallengeStatus = 'PENDING_DEFENDER_TURN' | 'COMPLETED' | 'EXPIRED';

export interface UserRecord {
  id: string;
  email: string;
  studentNumber: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  level: number;
  currentXP: number;
  totalXP: number;
  essenceBalance: number;
  dailyStreakCount: number;
  lastCheckInDate: string;
  streakMultiplier: number;
  eloRating: number;
  divisionTier: DivisionTier;
  pvpWins: number;
  pvpLosses: number;
  pvpDraws: number;
  maxStatBudget: number;
  legendaryCap: number;
  createdAt: string;
  updatedAt: string;
}

export interface CardRecord {
  id: string;
  name: string;
  category: CardCategory;
  rarity: CardRarity;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  baseBrains: number;
  totalStats: number;
  imageUrl: string;
  landmarkId?: string;
}

export interface UserCardInventoryRecord {
  id: string;
  userId: string;
  cardId: string;
  level: number;
  attackBonus: number;
  defenseBonus: number;
  speedBonus: number;
  brainsBonus: number;
  quantity: number;
  acquiredAt: string;
}

export interface UserDeckRecord {
  id: string;
  userId: string;
  deckName: string;
  cardIds: string[];
  totalStatCost: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoundResultData {
  roundNumber: number;
  statChosen: 'attack' | 'defense' | 'speed' | 'brains';
  challengerCardId: string;
  opponentCardId: string;
  challengerStatVal: number;
  opponentStatVal: number;
  outcome: 'win' | 'lose' | 'tie';
}

export interface BattleMatchRecord {
  id: string;
  matchType: MatchType;
  challengerId: string;
  opponentId: string;
  winnerId: string | 'DRAW';
  roundsWonChallenger: number;
  roundsWonOpponent: number;
  xpAwarded: number;
  essenceAwarded: number;
  eloChange: number;
  roundsData: RoundResultData[];
  createdAt: string;
}

export interface DefensiveTelemetryReport {
  failedStat: 'attack' | 'defense' | 'speed' | 'brains';
  losingCardName: string;
  winningEnemyCardName: string;
  statDeficit: number;
  adviceMessage: string;
}

export interface AsyncPvPChallengeRecord {
  id: string;
  challengerId: string;
  defenderId: string;
  status: ChallengeStatus;
  currentRound: number;
  maxRounds: number;
  challengerDeckIds: string[];
  defenderDeckIds: string[];
  roundsHistory: RoundResultData[];
  defensiveTelemetry?: DefensiveTelemetryReport;
  expiresAt: string;
  createdAt: string;
}
