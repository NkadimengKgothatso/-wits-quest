export interface MockUser {
  id: string;
  email: string;
  studentNumber: string;
  username: string;
  name?: string;
  initials?: string;
  isOnline?: boolean;
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

// Track online active session user IDs
const activeOnlineUserIds = new Set<string>(['usr_thabo']);

const INITIAL_TEST_USERS: MockUser[] = [
  {
    id: 'usr_kagiso',
    email: 'kagiso@students.wits.ac.za',
    studentNumber: '2481920',
    username: 'Kagiso_Scholar',
    name: 'Kagiso Mthembu',
    initials: 'KM',
    isOnline: false,
    role: 'STUDENT',
    level: 12,
    currentXP: 2450,
    totalXP: 2450,
    essenceBalance: 350,
    dailyStreakCount: 7,
    lastCheckInDate: new Date().toISOString(),
    streakMultiplier: 1.2,
    eloRating: 1250,
    divisionTier: 'GOLD',
    pvpWins: 34,
    pvpLosses: 12,
    pvpDraws: 2,
    maxStatBudget: 350,
    legendaryCap: 1,
  },
  {
    id: 'usr_thabo',
    email: 'thabo@students.wits.ac.za',
    studentNumber: '2591044',
    username: 'Thabo_Engineer',
    name: 'Thabo Nkosi',
    initials: 'TN',
    isOnline: true,
    role: 'STUDENT',
    level: 28,
    currentXP: 48200,
    totalXP: 48200,
    essenceBalance: 1200,
    dailyStreakCount: 12,
    lastCheckInDate: new Date().toISOString(),
    streakMultiplier: 1.5,
    eloRating: 1940,
    divisionTier: 'DIAMOND',
    pvpWins: 142,
    pvpLosses: 28,
    pvpDraws: 5,
    maxStatBudget: 400,
    legendaryCap: 2,
  },
  {
    id: 'usr_lesedi',
    email: 'lesedi@students.wits.ac.za',
    studentNumber: '2601934',
    username: 'Lesedi_Grandmaster',
    name: 'Lesedi Mokoena',
    initials: 'LM',
    isOnline: false,
    role: 'STUDENT',
    level: 18,
    currentXP: 29400,
    totalXP: 29400,
    essenceBalance: 850,
    dailyStreakCount: 9,
    lastCheckInDate: new Date().toISOString(),
    streakMultiplier: 1.3,
    eloRating: 1650,
    divisionTier: 'PLATINUM',
    pvpWins: 88,
    pvpLosses: 34,
    pvpDraws: 4,
    maxStatBudget: 350,
    legendaryCap: 1,
  },
  {
    id: 'usr_sipho',
    email: 'sipho@students.wits.ac.za',
    studentNumber: '2394821',
    username: 'Sipho_Tactician',
    name: 'Sipho Zulu',
    initials: 'SZ',
    isOnline: false,
    role: 'STUDENT',
    level: 8,
    currentXP: 14200,
    totalXP: 14200,
    essenceBalance: 400,
    dailyStreakCount: 4,
    lastCheckInDate: new Date().toISOString(),
    streakMultiplier: 1.1,
    eloRating: 1420,
    divisionTier: 'GOLD',
    pvpWins: 45,
    pvpLosses: 22,
    pvpDraws: 1,
    maxStatBudget: 300,
    legendaryCap: 1,
  },
  {
    id: 'usr_lerato',
    email: 'lerato@students.wits.ac.za',
    studentNumber: '2510293',
    username: 'Lerato_Master',
    name: 'Lerato Dlamini',
    initials: 'LD',
    isOnline: false,
    role: 'STUDENT',
    level: 25,
    currentXP: 41550,
    totalXP: 41550,
    essenceBalance: 980,
    dailyStreakCount: 7,
    lastCheckInDate: new Date(Date.now() - 3600000 * 5).toISOString(),
    streakMultiplier: 1.4,
    eloRating: 1850,
    divisionTier: 'DIAMOND',
    pvpWins: 118,
    pvpLosses: 30,
    pvpDraws: 3,
    maxStatBudget: 400,
    legendaryCap: 2,
  },
  {
    id: 'usr_amahle',
    email: 'amahle@students.wits.ac.za',
    studentNumber: '2491024',
    username: 'Amahle_Explorer',
    name: 'Amahle Khumalo',
    initials: 'AK',
    isOnline: false,
    role: 'STUDENT',
    level: 22,
    currentXP: 34200,
    totalXP: 34200,
    essenceBalance: 620,
    dailyStreakCount: 9,
    lastCheckInDate: new Date(Date.now() - 3600000 * 12).toISOString(),
    streakMultiplier: 1.3,
    eloRating: 1520,
    divisionTier: 'PLATINUM',
    pvpWins: 97,
    pvpLosses: 41,
    pvpDraws: 6,
    maxStatBudget: 350,
    legendaryCap: 1,
  },
  {
    id: 'usr_nandi',
    email: 'nandi@students.wits.ac.za',
    studentNumber: '2489201',
    username: 'Nandi_Strategist',
    name: 'Nandi Sithole',
    initials: 'NS',
    isOnline: false,
    role: 'STUDENT',
    level: 11,
    currentXP: 19800,
    totalXP: 19800,
    essenceBalance: 290,
    dailyStreakCount: 3,
    lastCheckInDate: new Date(Date.now() - 3600000 * 24).toISOString(),
    streakMultiplier: 1.0,
    eloRating: 1180,
    divisionTier: 'GOLD',
    pvpWins: 62,
    pvpLosses: 38,
    pvpDraws: 2,
    maxStatBudget: 350,
    legendaryCap: 1,
  },
];

let localMockUsers: MockUser[] = [...INITIAL_TEST_USERS];

/**
 * Dynamically set online status when user logs in or logs out
 */
export function setStudentOnlineStatus(userId: string, isOnline: boolean) {
  if (isOnline) {
    activeOnlineUserIds.add(userId);
  } else {
    activeOnlineUserIds.delete(userId);
  }

  const user = localMockUsers.find((u) => u.id === userId);
  if (user) {
    user.isOnline = isOnline;
  }
}

/**
 * Helper to compute display name, initials, and online status for users
 */
export function formatUserMeta(user: MockUser): MockUser {
  let name = user.name;
  if (!name) {
    if (user.username === 'Kagiso_Scholar' || user.email.includes('kagiso')) {
      name = 'Kagiso Mthembu';
    } else if (user.username === 'Thabo_Engineer' || user.email.includes('thabo')) {
      name = 'Thabo Nkosi';
    } else {
      const parts = user.username.split('_');
      name = parts[0] ? parts[0] : user.username;
    }
  }
  let initials = user.initials;
  if (!initials) {
    const parts = name.split(' ');
    initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name.substring(0, 2).toUpperCase();
  }

  const isOnline = activeOnlineUserIds.has(user.id);
  return { ...user, name, initials, isOnline };
}

/**
 * Get all mock users.
 */
export async function getMockUsers(): Promise<MockUser[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/mock/users`);
    if (res.ok) {
      const users: MockUser[] = await res.json();
      return users.map(formatUserMeta);
    }
  } catch (err) {
    // Backend offline, fallback to localMockUsers
  }
  return localMockUsers.map(formatUserMeta);
}

/**
 * Get registered student opponents excluding active user, sorted online first.
 */
export async function getRegisteredStudentOpponents(currentUserId?: string): Promise<MockUser[]> {
  const allUsers = await getMockUsers();
  const filtered = currentUserId ? allUsers.filter((u) => u.id !== currentUserId) : allUsers;

  return filtered.sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    return b.eloRating - a.eloRating;
  });
}

/**
 * Get single mock user by ID.
 */
export async function getMockUserById(id: string): Promise<MockUser | undefined> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/mock/users/${id}`);
    if (res.ok) {
      const user: MockUser = await res.json();
      return formatUserMeta(user);
    }
  } catch (err) {
    // fallback
  }
  const found = localMockUsers.find((u) => u.id === id);
  return found ? formatUserMeta(found) : undefined;
}

/**
 * Programmatically insert/register a new mock user.
 */
export async function insertMockUser(user: Partial<MockUser> & { username: string; email: string }): Promise<MockUser> {
  const newUserRaw: MockUser = {
    id: user.id || `usr_${Date.now()}`,
    email: user.email,
    studentNumber: user.studentNumber || '2000000',
    username: user.username,
    name: user.name,
    isOnline: true,
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

  try {
    const res = await fetch(`${BACKEND_URL}/api/mock/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUserRaw),
    });
    if (res.ok) {
      const inserted: MockUser = await res.json();
      setStudentOnlineStatus(inserted.id, true);
      return formatUserMeta(inserted);
    }
  } catch (err) {
    console.warn('[MockDBClient] Backend API offline. Storing in local client fallback memory.');
  }

  setStudentOnlineStatus(newUserRaw.id, true);
  const formatted = formatUserMeta(newUserRaw);
  localMockUsers.push(formatted);
  return formatted;
}

/**
 * Save battle result and update student profile in database.
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
}): Promise<MockUser | undefined> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/mock/battle/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const result = await res.json();
      if (result && result.user) {
        const formatted = formatUserMeta(result.user);
        const idx = localMockUsers.findIndex((u) => u.id === formatted.id);
        if (idx >= 0) localMockUsers[idx] = formatted;
        return formatted;
      }
    }
  } catch (err) {
    console.warn('[MockDBClient] Could not save battle result to backend, updating local state.');
  }

  // Local fallback update
  const userIndex = localMockUsers.findIndex((u) => u.id === data.userId);
  if (userIndex >= 0) {
    const u = localMockUsers[userIndex];
    const newTotalXP = Math.max(0, u.totalXP + data.xpAwarded);
    let level = u.level;
    let currentXP = Math.max(0, u.currentXP + data.xpAwarded);
    let target = level * 200;
    while (currentXP >= target) {
      currentXP -= target;
      level++;
      target = level * 200;
    }
    const newElo = Math.max(0, u.eloRating + data.eloDelta);
    const newEssence = Math.max(0, u.essenceBalance + data.essenceAwarded);
    const updated: MockUser = {
      ...u,
      level,
      currentXP,
      totalXP: newTotalXP,
      essenceBalance: newEssence,
      eloRating: newElo,
      pvpWins: data.outcome === 'win' ? u.pvpWins + 1 : u.pvpWins,
      pvpLosses: data.outcome === 'lose' ? u.pvpLosses + 1 : u.pvpLosses,
      pvpDraws: data.outcome === 'tie' ? u.pvpDraws + 1 : u.pvpDraws,
    };
    localMockUsers[userIndex] = formatUserMeta(updated);
    return localMockUsers[userIndex];
  }
  return undefined;
}
