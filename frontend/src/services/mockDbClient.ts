export interface MockUser {
  id: string;
  email: string;
  studentNumber: string;
  username: string;
  role: 'STUDENT' | 'ADMIN' | 'LECTURER';
  level: number;
  currentXP: number;
  totalXP: number;
  essenceBalance: number;
  dailyStreakCount: number;
  lastCheckInDate: string;
  streakMultiplier: number;
  eloRating: number;
  divisionTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  pvpWins: number;
  pvpLosses: number;
  pvpDraws: number;
  maxStatBudget: number;
  legendaryCap: number;
}

export interface MockCard {
  id: string;
  name: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  baseBrains: number;
  totalStats: number;
  imageUrl: string;
}

const BACKEND_URL = 'http://localhost:3000';

/**
 * Local fallback mock users if backend is unreachable.
 */
let localMockUsers: MockUser[] = [];

/**
 * Programmatically insert a new mock user in code.
 */
export async function insertMockUser(user: Partial<MockUser> & { username: string; email: string }): Promise<MockUser> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/mock/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[MockDBClient] Backend API offline. Storing in local client fallback memory.');
  }

  const newUser: MockUser = {
    id: user.id || `usr_${Date.now()}`,
    email: user.email,
    studentNumber: user.studentNumber || '2000000',
    username: user.username,
    role: user.role || 'STUDENT',
    level: user.level || 1,
    currentXP: user.currentXP || 0,
    totalXP: user.totalXP || 0,
    essenceBalance: user.essenceBalance || 100,
    dailyStreakCount: user.dailyStreakCount || 1,
    lastCheckInDate: user.lastCheckInDate || new Date().toISOString(),
    streakMultiplier: user.streakMultiplier || 1.0,
    eloRating: user.eloRating || 1000,
    divisionTier: user.divisionTier || 'GOLD',
    pvpWins: user.pvpWins || 0,
    pvpLosses: user.pvpLosses || 0,
    pvpDraws: user.pvpDraws || 0,
    maxStatBudget: user.maxStatBudget || 300,
    legendaryCap: user.legendaryCap || 1,
  };

  localMockUsers.push(newUser);
  return newUser;
}

/**
 * Programmatically insert a custom card in code.
 */
export async function insertMockCard(card: Partial<MockCard> & { name: string; category: string; rarity: any }): Promise<MockCard> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/mock/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[MockDBClient] Backend API offline.');
  }

  return {
    id: card.id || `card_${Date.now()}`,
    name: card.name,
    category: card.category,
    rarity: card.rarity,
    baseAttack: card.baseAttack || 70,
    baseDefense: card.baseDefense || 70,
    baseSpeed: card.baseSpeed || 70,
    baseBrains: card.baseBrains || 70,
    totalStats: (card.baseAttack || 70) + (card.baseDefense || 70) + (card.baseSpeed || 70) + (card.baseBrains || 70),
    imageUrl: card.imageUrl || '/assets/cards/default.webp',
  };
}

/**
 * Get all mock users.
 */
export async function getMockUsers(): Promise<MockUser[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/mock/users`);
    if (res.ok) return await res.json();
  } catch (err) {
    // fallback
  }
  return localMockUsers;
}

/**
 * Save battle result and update student profile.
 */
export async function saveMockBattleResult(data: {
  userId: string;
  matchType: 'CPU' | 'LIVE_PVP' | 'ASYNC_PVP';
  opponentId: string;
  outcome: 'win' | 'lose' | 'tie';
  xpAwarded: number;
  essenceAwarded: number;
  eloDelta: number;
  roundsData?: any[];
}) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/mock/battle/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[MockDBClient] Could not save battle result to backend.');
  }
}
