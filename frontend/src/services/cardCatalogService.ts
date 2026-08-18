import type { Card } from '../types/card';

export type CatalogCard = Card & { quantity: number; level: number };

const STORAGE_KEY = 'wits_quest_card_catalog_v1';
export const CATALOG_UPDATED_EVENT = 'catalogUpdated';

// Seed catalog: real Wits landmarks, stats rebalanced to fit a 300-400pt,
// 5-card deck budget (Legendary ~90-95, Epic ~80, Rare ~62, Common ~45).
const SEED_CATALOG: CatalogCard[] = [
  { id: 'card-101', name: 'The Great Hall', category: 'Landmarks', rarity: 'Legendary', stats: { attack: 24, defense: 27, speed: 11, brains: 26 }, image: '/src/assets/styles/photos/great_hall.jpg', quantity: 1, level: 1 },
  { id: 'card-102', name: 'Origins Centre', category: 'Science', rarity: 'Rare', stats: { attack: 16, defense: 12, speed: 14, brains: 20 }, image: '/src/assets/styles/photos/origins.jpg', quantity: 3, level: 1 },
  { id: 'card-103', name: 'Library Lawns', category: 'Landmarks', rarity: 'Rare', stats: { attack: 14, defense: 20, speed: 9, brains: 19 }, image: '/src/assets/styles/photos/lawns.jpg', quantity: 0, level: 1 },
  { id: 'card-104', name: 'Wartenweiler Library', category: 'Landmarks', rarity: 'Rare', stats: { attack: 13, defense: 19, speed: 10, brains: 20 }, image: '/src/assets/styles/photos/wartenw.jpg', quantity: 1, level: 1 },
  { id: 'card-105', name: 'The Matrix', category: 'Lifestyle', rarity: 'Common', stats: { attack: 9, defense: 11, speed: 8, brains: 17 }, image: '/src/assets/styles/photos/matrix.jpeg', quantity: 4, level: 1 },
  { id: 'card-106', name: 'William Cullen Library', category: 'History', rarity: 'Epic', stats: { attack: 17, defense: 23, speed: 9, brains: 31 }, image: '/src/assets/styles/photos/WilliamCullen.jpg', quantity: 1, level: 1 },
  { id: 'card-107', name: 'Solomon Mahlangu House', category: 'Landmarks', rarity: 'Legendary', stats: { attack: 29, defense: 24, speed: 19, brains: 23 }, image: '/src/assets/styles/photos/solomon.jpeg', quantity: 1, level: 1 },
  { id: 'card-108', name: 'Bidvest Stadium', category: 'Sports', rarity: 'Common', stats: { attack: 12, defense: 9, speed: 15, brains: 10 }, image: '/src/assets/styles/photos/bidvest.jpeg', quantity: 5, level: 1 },
  { id: 'card-109', name: 'Wits Medical School', category: 'Science', rarity: 'Rare', stats: { attack: 11, defense: 18, speed: 12, brains: 21 }, image: '/src/assets/styles/photos/healthSci.jpg', quantity: 2, level: 1 },
  { id: 'card-111', name: 'Science Stadium', category: 'Science', rarity: 'Legendary', stats: { attack: 26, defense: 19, speed: 24, brains: 26 }, image: '/src/assets/styles/photos/wss.jpg', quantity: 0, level: 1 },
  { id: 'card-112', name: 'Wits Business School', category: 'Lifestyle', rarity: 'Epic', stats: { attack: 17, defense: 21, speed: 16, brains: 26 }, image: '/src/assets/styles/photos/wbs.jpeg', quantity: 0, level: 1 },
  { id: 'card-113', name: 'John Moffat Building', category: 'Landmarks', rarity: 'Epic', stats: { attack: 20, defense: 18, speed: 14, brains: 28 }, image: '/src/assets/styles/photos/John-Moffat.png', quantity: 0, level: 1 },
];

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function loadFromStorage(): CatalogCard[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function persist(catalog: CatalogCard[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
  } catch {
    // storage unavailable — catalog still works for this session
  }
}

let catalog: CatalogCard[] = loadFromStorage() ?? SEED_CATALOG;

/** Read the current catalog (owned + not-yet-unlocked cards). */
export function getCatalog(): CatalogCard[] {
  return catalog;
}

/**
 * Publish a new card from the Admin console. New cards default to
 * quantity 0 (locked) — students only own it once they complete the
 * linked landmark's trivia challenge, same as every other card.
 */
export function addCard(input: {
  name: string;
  category: Card['category'];
  rarity: Card['rarity'];
  stats: Card['stats'];
  image?: string;
}): CatalogCard {
  const newCard: CatalogCard = {
    id: `card-${Date.now()}`,
    name: input.name,
    category: input.category,
    rarity: input.rarity,
    stats: input.stats,
    image: input.image || `/cards/${slugify(input.name)}.webp`,
    quantity: 0,
    level: 1,
  };
  catalog = [...catalog, newCard];
  persist(catalog);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CATALOG_UPDATED_EVENT, { detail: newCard }));
  }
  return newCard;
}

/** Suggested total stat cost range per rarity, for the Admin stat sliders. */
export const RARITY_TARGET_RANGE: Record<Card['rarity'], [number, number]> = {
  Common: [40, 50],
  Rare: [58, 68],
  Epic: [75, 85],
  Legendary: [88, 98],
};