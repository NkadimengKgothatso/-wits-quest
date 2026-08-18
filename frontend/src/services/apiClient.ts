export interface User {
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
  avatar?: string;
}
export type MockUser = User; // Compatibility alias

export interface Card {
  id: string;
  name: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  baseBrains: number;
  totalStats: number;
  imageUrl?: string;
}
export type MockCard = Card;

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('wits_quest_jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Track online active session user IDs
const activeOnlineUserIds = new Set<string>();

export function setStudentOnlineStatus(userId: string, isOnline: boolean) {
  if (isOnline) {
    activeOnlineUserIds.add(userId);
  } else {
    activeOnlineUserIds.delete(userId);
  }
}

export function formatUserMeta(user: User): User {
  let name = user.name;
  if (!name) {
    const parts = user.username.split('_');
    name = parts[0] ? parts[0] : user.username;
  }
  let initials = user.initials;
  if (!initials) {
    const parts = name.split(' ');
    initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name.substring(0, 2).toUpperCase();
  }
  const isOnline = activeOnlineUserIds.has(user.id);
  return { ...user, name, initials, isOnline };
}

export async function getMockUsers(): Promise<User[]> {
  const res = await fetch(`${BACKEND_URL}/api/users`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch users');
  const users: User[] = await res.json();
  return users.map(formatUserMeta);
}

export async function getRegisteredStudentOpponents(currentUserId?: string): Promise<User[]> {
  const allUsers = await getMockUsers();
  const filtered = currentUserId ? allUsers.filter((u) => u.id !== currentUserId && u.role === 'STUDENT') : allUsers;
  return filtered.sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    return b.eloRating - a.eloRating;
  });
}

export async function getMockUserById(id: string): Promise<User | undefined> {
  const res = await fetch(`${BACKEND_URL}/api/users/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) return undefined;
  const user: User = await res.json();
  return formatUserMeta(user);
}

// Async PvP is not yet fully implemented in the backend routes, so returning empty for now
export async function getMockAsyncChallenges(userId: string): Promise<any[]> {
  return [];
}
export function updateMockAsyncChallenge(id: string, updates: any): any {
  return undefined;
}
export async function createMockAsyncChallenge(challengerId: string, defenderId: string): Promise<any> {
  return null;
}

export async function saveMockBattleResult(data: {
  userId: string;
  matchType: 'CPU' | 'LIVE_PVP' | 'ASYNC_PVP';
  opponentId: string;
  outcome: 'win' | 'lose' | 'tie';
  xpAwarded: number;
  essenceAwarded: number;
  eloDelta: number;
  roundsData?: any[];
}): Promise<User | undefined> {
  const res = await fetch(`${BACKEND_URL}/api/battle/result`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.ok) {
    const result = await res.json();
    if (result && result.user) {
      return formatUserMeta(result.user);
    }
  }
  return undefined;
}

export async function getMockUserCards(userId: string): Promise<{ card: Card; owned: number; level: number }[]> {
  const res = await fetch(`${BACKEND_URL}/api/users/${userId}/cards`, { headers: getAuthHeaders() });
  if (!res.ok) return [];
  const cards = await res.json();
  return cards.map((c: any) => ({
    card: {
      id: c.cardId,
      name: c.name,
      category: c.category,
      rarity: c.rarity,
      baseAttack: c.baseAttack,
      baseDefense: c.baseDefense,
      baseSpeed: c.baseSpeed,
      baseBrains: c.baseBrains,
      totalStats: c.totalStats,
      imageUrl: c.imageUrl
    },
    owned: c.quantity,
    level: c.level
  }));
}

export async function updateMockUser(userId: string, updates: Partial<User>): Promise<User | undefined> {
  const res = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (res.ok) {
    const updated = await res.json();
    return formatUserMeta(updated);
  }
  return undefined;
}

export async function getCards(): Promise<Card[]> {
  const res = await fetch(`${BACKEND_URL}/api/cards`, { headers: getAuthHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function publishCard(data: {
  name: string;
  category: string;
  rarity: string;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  baseBrains: number;
}): Promise<Card> {
  const res = await fetch(`${BACKEND_URL}/api/mock/cards`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Failed to publish card');
  }
  return result;
}

export async function publishTrivia(data: {
  question: string;
  questionType: 'mc' | 'text';
  correctIndex: number;
}): Promise<any> {
  const res = await fetch(`${BACKEND_URL}/api/mock/trivia`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Failed to submit trivia');
  }
  return result;
}

export async function getTriviaQuestions(status?: string): Promise<any[]> {
  const url = status
    ? `${BACKEND_URL}/api/mock/trivia?status=${status}`
    : `${BACKEND_URL}/api/mock/trivia`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export interface CampusEvent {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  startDate: string;
  endDate: string;
  active: number;
  cardReward?: string;
  xpAward?: number;
  essenceAward?: number;
  createdAt: string;
}

export async function createEvent(data: {
  name: string;
  lat: number;
  lng: number;
  radius?: number;
  startDate?: string;
  endDate?: string;
  active?: boolean;
  cardReward?: string;
  xpAward?: number;
  essenceAward?: number;
}): Promise<CampusEvent> {
  const res = await fetch(`${BACKEND_URL}/api/events`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Failed to create event');
  }
  return result;
}

export async function getEvents(active?: boolean): Promise<CampusEvent[]> {
  const url = active !== undefined ? `${BACKEND_URL}/api/events?active=${active}` : `${BACKEND_URL}/api/events`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function updateEvent(
  id: string,
  data: Partial<{
    name: string;
    lat: number;
    lng: number;
    radius?: number;
    startDate?: string;
    endDate?: string;
    active?: boolean;
    cardReward?: string;
    xpAward?: number;
    essenceAward?: number;
  }>
): Promise<CampusEvent> {
  const res = await fetch(`${BACKEND_URL}/api/events/${id}`, {
    method: 'PUT',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Failed to update event');
  }
  return result;
}

export async function deleteEvent(id: string): Promise<{ success: boolean; id: string }> {
  const res = await fetch(`${BACKEND_URL}/api/events/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Failed to delete event');
  }
  return result;
}

export interface Avatar {
  id: string;
  emoji: string;
  label: string;
  cssClass: string;
  description: string;
}

export async function getAvatars(): Promise<Avatar[]> {
  const res = await fetch(`${BACKEND_URL}/api/avatars`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch avatars');
  return res.json();
}

export async function createAvatar(avatar: Avatar): Promise<Avatar> {
  const res = await fetch(`${BACKEND_URL}/api/avatars`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(avatar),
  });
  if (!res.ok) throw new Error('Failed to create avatar');
  return res.json();
}
