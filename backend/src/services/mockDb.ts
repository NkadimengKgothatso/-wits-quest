import {
  UserRecord,
  CardRecord,
  UserCardInventoryRecord,
  UserDeckRecord,
  BattleMatchRecord,
  AsyncPvPChallengeRecord,
  DivisionTier,
  DefensiveTelemetryReport,
  RoundResultData,
} from '../models/schema.js';
import crypto from 'crypto';

class MockDatabase {
  private users: Map<string, UserRecord> = new Map();
  private cards: Map<string, CardRecord> = new Map();
  private userCards: Map<string, UserCardInventoryRecord[]> = new Map();
  private userDecks: Map<string, UserDeckRecord> = new Map();
  private battleMatches: BattleMatchRecord[] = [];
  private asyncChallenges: Map<string, AsyncPvPChallengeRecord> = new Map();

  constructor() {
    this.seedTwoTestAccounts();
  }

  /**
   * Completely clears all database stores to 0 items.
   */
  public clearAllData() {
    this.users.clear();
    this.cards.clear();
    this.userCards.clear();
    this.userDecks.clear();
    this.battleMatches = [];
    this.asyncChallenges.clear();
  }

  /**
   * Initializes database with exactly TWO clean test student accounts and ZERO pre-seeded cards.
   */
  public seedTwoTestAccounts() {
    this.clearAllData();

    const now = new Date().toISOString();

    // Account 1: Kagiso (Test Account 1)
    this.insertUser({
      id: 'usr_kagiso',
      email: 'kagiso@students.wits.ac.za',
      studentNumber: '2481920',
      username: 'Kagiso_Scholar',
      passwordHash: '$2b$10$e8w.R2/xGZ5uK4H...',
      role: 'STUDENT',
      level: 1,
      currentXP: 0,
      totalXP: 0,
      essenceBalance: 100,
      dailyStreakCount: 1,
      lastCheckInDate: now,
      streakMultiplier: 1.0,
      eloRating: 1000,
      divisionTier: 'GOLD',
      pvpWins: 0,
      pvpLosses: 0,
      pvpDraws: 0,
      maxStatBudget: 300,
      legendaryCap: 1,
      createdAt: now,
      updatedAt: now,
    });

    // Account 2: Thabo (Test Account 2)
    this.insertUser({
      id: 'usr_thabo',
      email: 'thabo@students.wits.ac.za',
      studentNumber: '2591044',
      username: 'Thabo_Engineer',
      passwordHash: '$2b$10$e8w.R2/xGZ5uK4H...',
      role: 'STUDENT',
      level: 1,
      currentXP: 0,
      totalXP: 0,
      essenceBalance: 100,
      dailyStreakCount: 1,
      lastCheckInDate: now,
      streakMultiplier: 1.0,
      eloRating: 1000,
      divisionTier: 'GOLD',
      pvpWins: 0,
      pvpLosses: 0,
      pvpDraws: 0,
      maxStatBudget: 300,
      legendaryCap: 1,
      createdAt: now,
      updatedAt: now,
    });

    console.log('[MockDatabase] Initialized with 2 clean test accounts (Kagiso & Thabo) and 0 fake cards.');
  }

  // --- PROGRAMMATIC INSERTION APIS ---

  public insertUser(userData: Partial<UserRecord> & { email: string; username: string }): UserRecord {
    const id = userData.id || `usr_${crypto.randomBytes(6).toString('hex')}`;
    const now = new Date().toISOString();

    const user: UserRecord = {
      id,
      email: userData.email,
      studentNumber: userData.studentNumber || '2000000',
      username: userData.username,
      passwordHash: userData.passwordHash || 'hashed_pwd_stub',
      role: userData.role || 'STUDENT',
      level: userData.level || 1,
      currentXP: userData.currentXP || 0,
      totalXP: userData.totalXP || 0,
      essenceBalance: userData.essenceBalance || 100,
      dailyStreakCount: userData.dailyStreakCount || 1,
      lastCheckInDate: userData.lastCheckInDate || now,
      streakMultiplier: userData.streakMultiplier || 1.0,
      eloRating: userData.eloRating || 1000,
      divisionTier: userData.divisionTier || this.calculateDivisionTier(userData.eloRating || 1000),
      pvpWins: userData.pvpWins || 0,
      pvpLosses: userData.pvpLosses || 0,
      pvpDraws: userData.pvpDraws || 0,
      maxStatBudget: userData.maxStatBudget || 300,
      legendaryCap: userData.legendaryCap || 1,
      createdAt: userData.createdAt || now,
      updatedAt: userData.updatedAt || now,
    };

    this.users.set(user.id, user);
    return user;
  }

  public insertCard(cardData: Partial<CardRecord> & { name: string; category: any; rarity: any }): CardRecord {
    const id = cardData.id || `card_${crypto.randomBytes(4).toString('hex')}`;
    const baseAttack = cardData.baseAttack || 0;
    const baseDefense = cardData.baseDefense || 0;
    const baseSpeed = cardData.baseSpeed || 0;
    const baseBrains = cardData.baseBrains || 0;

    const card: CardRecord = {
      id,
      name: cardData.name,
      category: cardData.category,
      rarity: cardData.rarity,
      baseAttack,
      baseDefense,
      baseSpeed,
      baseBrains,
      totalStats: baseAttack + baseDefense + baseSpeed + baseBrains,
      imageUrl: cardData.imageUrl || '/assets/cards/default.webp',
      landmarkId: cardData.landmarkId,
    };

    this.cards.set(card.id, card);
    return card;
  }

  public insertUserCard(userId: string, cardId: string, level = 1): UserCardInventoryRecord {
    const list = this.userCards.get(userId) || [];
    const existing = list.find((item) => item.cardId === cardId);

    if (existing) {
      existing.quantity += 1;
      return existing;
    }

    const newRecord: UserCardInventoryRecord = {
      id: `inv_${crypto.randomBytes(4).toString('hex')}`,
      userId,
      cardId,
      level,
      attackBonus: (level - 1) * 5,
      defenseBonus: (level - 1) * 5,
      speedBonus: (level - 1) * 5,
      brainsBonus: (level - 1) * 5,
      quantity: 1,
      acquiredAt: new Date().toISOString(),
    };

    list.push(newRecord);
    this.userCards.set(userId, list);
    return newRecord;
  }

  public createUserDeck(userId: string, deckName: string, cardIds: string[], isDefault = false): UserDeckRecord {
    const now = new Date().toISOString();
    let totalStatCost = 0;

    cardIds.forEach((cId: string) => {
      const card = this.cards.get(cId);
      if (card) totalStatCost += card.totalStats;
    });

    const deck: UserDeckRecord = {
      id: `deck_${crypto.randomBytes(4).toString('hex')}`,
      userId,
      deckName,
      cardIds,
      totalStatCost,
      isDefault,
      createdAt: now,
      updatedAt: now,
    };

    this.userDecks.set(userId, deck);
    return deck;
  }

  // --- QUERY APIS ---

  public getUser(id: string): UserRecord | undefined {
    return this.users.get(id);
  }

  public getAllUsers(): UserRecord[] {
    return Array.from(this.users.values());
  }

  public getCard(id: string): CardRecord | undefined {
    return this.cards.get(id);
  }

  public getAllCards(): CardRecord[] {
    return Array.from(this.cards.values());
  }

  public getUserDeck(userId: string): UserDeckRecord | undefined {
    return this.userDecks.get(userId);
  }

  public getUserFullDeckCards(userId: string): CardRecord[] {
    const deck = this.getUserDeck(userId);
    if (!deck) return [];

    const cardsList: CardRecord[] = [];
    deck.cardIds.forEach((cId: string) => {
      const c = this.cards.get(cId);
      if (c) cardsList.push(c);
    });

    return cardsList;
  }

  // --- BATTLE & REWARD PERSISTENCE ---

  public recordBattleResult(
    userId: string,
    matchType: 'CPU' | 'LIVE_PVP' | 'ASYNC_PVP',
    opponentId: string,
    outcome: 'win' | 'lose' | 'tie',
    xpAwarded: number,
    essenceAwarded: number,
    eloDelta: number,
    roundsData: RoundResultData[]
  ): { user: UserRecord; matchRecord: BattleMatchRecord } {
    const user = this.users.get(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    const newTotalXP = user.totalXP + xpAwarded;
    let level = user.level;
    let currentXP = user.currentXP + xpAwarded;
    let xpTarget = level * 200;

    while (currentXP >= xpTarget) {
      currentXP -= xpTarget;
      level++;
      xpTarget = level * 200;
    }

    const newElo = Math.max(0, user.eloRating + eloDelta);
    const divisionTier = this.calculateDivisionTier(newElo);
    const maxStatBudget = level >= 20 ? 400 : level >= 10 ? 350 : 300;

    const updatedUser: UserRecord = {
      ...user,
      level,
      currentXP,
      totalXP: newTotalXP,
      essenceBalance: user.essenceBalance + essenceAwarded,
      eloRating: newElo,
      divisionTier,
      maxStatBudget,
      pvpWins: outcome === 'win' ? user.pvpWins + 1 : user.pvpWins,
      pvpLosses: outcome === 'lose' ? user.pvpLosses + 1 : user.pvpLosses,
      pvpDraws: outcome === 'tie' ? user.pvpDraws + 1 : user.pvpDraws,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(userId, updatedUser);

    const challengerRoundsWon = roundsData.filter((r) => r.outcome === 'win').length;
    const opponentRoundsWon = roundsData.filter((r) => r.outcome === 'lose').length;

    const matchRecord: BattleMatchRecord = {
      id: `match_${crypto.randomBytes(4).toString('hex')}`,
      matchType,
      challengerId: userId,
      opponentId,
      winnerId: outcome === 'win' ? userId : outcome === 'lose' ? opponentId : 'DRAW',
      roundsWonChallenger: challengerRoundsWon,
      roundsWonOpponent: opponentRoundsWon,
      xpAwarded,
      essenceAwarded,
      eloChange: eloDelta,
      roundsData,
      createdAt: new Date().toISOString(),
    };

    this.battleMatches.push(matchRecord);
    return { user: updatedUser, matchRecord };
  }

  // --- ASYNC PVP CHALLENGE QUEUE & DEFENSIVE TELEMETRY ---

  public createAsyncChallenge(challengerId: string, defenderId: string): AsyncPvPChallengeRecord {
    const challengerDeck = this.getUserFullDeckCards(challengerId);
    const defenderDeck = this.getUserFullDeckCards(defenderId);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const challenge: AsyncPvPChallengeRecord = {
      id: `async_${crypto.randomBytes(4).toString('hex')}`,
      challengerId,
      defenderId,
      status: 'PENDING_DEFENDER_TURN',
      currentRound: 1,
      maxRounds: 5,
      challengerDeckIds: challengerDeck.map((c) => c.id),
      defenderDeckIds: defenderDeck.map((c) => c.id),
      roundsHistory: [],
      expiresAt,
      createdAt: now.toISOString(),
    };

    this.asyncChallenges.set(challenge.id, challenge);
    return challenge;
  }

  public getAsyncChallengesForUser(userId: string): AsyncPvPChallengeRecord[] {
    return Array.from(this.asyncChallenges.values()).filter(
      (c) => c.challengerId === userId || c.defenderId === userId
    );
  }

  public calculateDivisionTier(elo: number): DivisionTier {
    if (elo >= 1800) return 'DIAMOND';
    if (elo >= 1500) return 'PLATINUM';
    if (elo >= 1000) return 'GOLD';
    if (elo >= 500) return 'SILVER';
    return 'BRONZE';
  }
}

export const mockDb = new MockDatabase();
