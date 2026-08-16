// frontend/src/services/inventoryService.ts
//
// Task 1.5.1 — Inventory Query & Filtering Service
// Fetches cards owned by the current student, with rarity/category
// filter params, and merges against the master catalog so locked cards
// can still be shown (dimmed, with an unlock hint) in CardCollection.tsx.
//
// Follows the same resilience pattern as mockDb.ts: try the real backend
// first, fall back to local seed data if it's offline, so the screen
// still works while Kgothatso's route is being stood up.

import type { Card, CardStats } from '../types/card';
import type { CollectionEntry, InventoryEntry, InventoryFilters } from '../types/inventory';

const BACKEND_URL = 'http://localhost:3000';

// ---- Local fallback seed (used only if the backend is unreachable) ----
// Mirrors the master `cards` catalog. Quantity 0 = not yet unlocked.
const FALLBACK_CATALOG: (Card & { quantity: number; level: number })[] = [
  { id: 'card-101', name: 'The Great Hall', category: 'Landmarks', rarity: 'Legendary', stats: { attack: 24, defense: 27, speed: 11, brains: 26 }, image: '/cards/great-hall.webp', quantity: 1, level: 1 },
  { id: 'card-102', name: "Jan Smuts House", category: 'History', rarity: 'Epic', stats: { attack: 22, defense: 17, speed: 20, brains: 21 }, image: '/cards/jan-smuts-house.webp', quantity: 2, level: 1 },
  { id: 'card-103', name: 'Origins Centre', category: 'Science', rarity: 'Rare', stats: { attack: 16, defense: 12, speed: 14, brains: 20 }, image: '/cards/origins-centre.webp', quantity: 3, level: 1 },
  { id: 'card-104', name: 'Wartenweiler Library', category: 'Landmarks', rarity: 'Rare', stats: { attack: 13, defense: 19, speed: 10, brains: 20 }, image: '/cards/wartenweiler-library.webp', quantity: 1, level: 1 },
  { id: 'card-105', name: 'The Matrix', category: 'Lifestyle', rarity: 'Common', stats: { attack: 9, defense: 11, speed: 8, brains: 17 }, image: '/cards/the-matrix.webp', quantity: 4, level: 1 },
  { id: 'card-106', name: 'William Cullen Library', category: 'History', rarity: 'Epic', stats: { attack: 17, defense: 23, speed: 9, brains: 31 }, image: '/cards/cullen-library.webp', quantity: 1, level: 1 },
  { id: 'card-107', name: 'Solomon Mahlangu House', category: 'Landmarks', rarity: 'Legendary', stats: { attack: 29, defense: 24, speed: 19, brains: 23 }, image: '/cards/solomon-mahlangu-house.webp', quantity: 1, level: 1 },
  { id: 'card-108', name: 'Bidvest Stadium', category: 'Sports', rarity: 'Common', stats: { attack: 12, defense: 9, speed: 15, brains: 10 }, image: '/cards/bidvest-stadium.webp', quantity: 5, level: 1 },
  { id: 'card-109', name: 'Wits Medical School', category: 'Science', rarity: 'Rare', stats: { attack: 11, defense: 18, speed: 12, brains: 21 }, image: '/cards/wits-medical-school.webp', quantity: 2, level: 1 },
  { id: 'card-110', name: 'Bernard Price Institute', category: 'Science', rarity: 'Epic', stats: { attack: 18, defense: 18, speed: 21, brains: 24 }, image: '/cards/bernard-price-institute.webp', quantity: 1, level: 1 },
  { id: 'card-111', name: 'Science Stadium', category: 'Science', rarity: 'Legendary', stats: { attack: 26, defense: 19, speed: 24, brains: 26 }, image: '/cards/science-stadium.webp', quantity: 0, level: 1 },
  { id: 'card-112', name: 'Wits Business School', category: 'Lifestyle', rarity: 'Epic', stats: { attack: 17, defense: 21, speed: 16, brains: 26 }, image: '/cards/wits-business-school.webp', quantity: 0, level: 1 },
  { id: 'card-113', name: 'John Moffat Building', category: 'Landmarks', rarity: 'Epic', stats: { attack: 20, defense: 18, speed: 14, brains: 28 }, image: '/cards/john-moffat-building.webp', quantity: 0, level: 1 },
  { id: 'card-114', name: 'Library Lawns', category: 'Landmarks', rarity: 'Rare', stats: { attack: 14, defense: 20, speed: 9, brains: 19 }, image: '/cards/library-lawns.webp', quantity: 0, level: 1 },
];

const NO_BONUS: CardStats = { attack: 0, defense: 0, speed: 0, brains: 0 };

function sumStats(a: CardStats, b: CardStats): CardStats {
  return {
    attack: a.attack + b.attack,
    defense: a.defense + b.defense,
    speed: a.speed + b.speed,
    brains: a.brains + b.brains,
  };
}

function totalOf(s: CardStats): number {
  return s.attack + s.defense + s.speed + s.brains;
}

function buildQuery(userId: string, filters?: InventoryFilters): string {
  const params = new URLSearchParams({ userId });
  if (filters?.rarity?.length) params.set('rarity', filters.rarity.join(','));
  if (filters?.category) params.set('category', filters.category);
  return params.toString();
}

/**
 * Fetch only the cards the student owns (task 1.5.1). Prefer this when
 * you don't need locked cards, e.g. DeckBuilder's "your collection" list.
 */
export async function getPlayerInventory(
  userId: string,
  filters?: InventoryFilters
): Promise<InventoryEntry[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/player/inventory?${buildQuery(userId, filters)}`);
    if (res.ok) {
      const data = await res.json();
      // Expected shape from the backend route: { cards: [...] } where each
      // entry already has effective (base+bonus) stats computed server-side.
      return (data.cards ?? []).map((c: any) => normalizeServerEntry(c));
    }
  } catch {
    // backend offline — fall through to local seed
  }

  return FALLBACK_CATALOG
    .filter((c) => c.quantity > 0)
    .filter((c) => !filters?.rarity?.length || filters.rarity.includes(c.rarity))
    .filter((c) => !filters?.category || c.category === filters.category)
    .filter((c) => !filters?.search || c.name.toLowerCase().includes(filters.search.toLowerCase()))
    .map((c) => toInventoryEntry(c, c.quantity, c.level));
}

/**
 * Fetch the full collection (owned + locked) for the gallery view, so
 * CardCollection.tsx can render dimmed "not yet unlocked" cards too.
 */
export async function getFullCollection(
  userId: string,
  filters?: InventoryFilters
): Promise<CollectionEntry[]> {
  const owned = await getPlayerInventory(userId); // unfiltered — we filter the merged list below
  const ownedIds = new Set(owned.map((e) => e.card.id));

  let catalog: Card[];
  try {
    const res = await fetch(`${BACKEND_URL}/api/mock/cards`);
    catalog = res.ok ? await res.json() : FALLBACK_CATALOG;
  } catch {
    catalog = FALLBACK_CATALOG;
  }

  const locked: CollectionEntry[] = catalog
    .filter((c) => !ownedIds.has(c.id))
    .map((c) => ({
      unlocked: false,
      card: c,
      unlockHint: 'Walk within 25m of the linked campus landmark and answer its trivia challenge.',
    }));

  const merged: CollectionEntry[] = [...owned, ...locked];

  return merged.filter((entry) => {
    if (filters?.rarity?.length && !filters.rarity.includes(entry.card.rarity)) return false;
    if (filters?.category && entry.card.category !== filters.category) return false;
    if (filters?.search && !entry.card.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}

// ---- helpers ----

function toInventoryEntry(card: Card, quantity: number, level: number, bonus: CardStats = NO_BONUS): InventoryEntry {
  const effectiveStats = sumStats(card.stats, bonus);
  return {
    unlocked: true,
    inventoryId: `local_${card.id}`,
    card,
    level,
    quantity,
    bonusStats: bonus,
    effectiveStats,
    totalStatCost: totalOf(effectiveStats),
  };
}

function normalizeServerEntry(raw: any): InventoryEntry {
  const card: Card = {
    id: raw.cardId,
    name: raw.name,
    category: raw.category,
    rarity: raw.rarity,
    stats: { attack: raw.attack, defense: raw.defense, speed: raw.speed, brains: raw.brains },
    image: raw.imageUrl,
  };
  const bonus: CardStats = NO_BONUS; // already folded into raw.attack/etc. by the server
  return {
    unlocked: true,
    inventoryId: raw.inventoryId,
    card,
    level: raw.level,
    quantity: raw.quantity,
    bonusStats: bonus,
    effectiveStats: card.stats,
    totalStatCost: raw.totalStats ?? totalOf(card.stats),
  };
}