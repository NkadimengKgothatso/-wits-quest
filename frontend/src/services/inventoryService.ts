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
  { id: 'card-101', name: 'Great Hall Pillars', category: 'Landmarks', rarity: 'Legendary', stats: { attack: 85, defense: 95, speed: 40, brains: 90 }, image: '/cards/great-hall-pillars.webp', quantity: 1, level: 1 },
  { id: 'card-102', name: "Solomon's Torch", category: 'History', rarity: 'Epic', stats: { attack: 90, defense: 70, speed: 85, brains: 88 }, image: '/cards/solomons-torch.webp', quantity: 2, level: 1 },
  { id: 'card-103', name: 'Quantum Reactor', category: 'Science', rarity: 'Rare', stats: { attack: 75, defense: 60, speed: 70, brains: 95 }, image: '/cards/quantum-reactor.webp', quantity: 3, level: 1 },
  { id: 'card-104', name: 'Senate Seal', category: 'Landmarks', rarity: 'Rare', stats: { attack: 60, defense: 88, speed: 45, brains: 92 }, image: '/cards/senate-seal.webp', quantity: 1, level: 1 },
  { id: 'card-105', name: 'Cave Painting', category: 'History', rarity: 'Common', stats: { attack: 40, defense: 50, speed: 35, brains: 78 }, image: '/cards/cave-painting.webp', quantity: 4, level: 1 },
  { id: 'card-106', name: 'Ancient Tome', category: 'History', rarity: 'Epic', stats: { attack: 55, defense: 72, speed: 30, brains: 99 }, image: '/cards/ancient-tome.webp', quantity: 1, level: 1 },
  { id: 'card-107', name: 'The Rock Drill', category: 'Landmarks', rarity: 'Legendary', stats: { attack: 98, defense: 80, speed: 65, brains: 75 }, image: '/cards/the-rock-drill.webp', quantity: 1, level: 1 },
  { id: 'card-108', name: 'Wits Springbok', category: 'Sports', rarity: 'Common', stats: { attack: 72, defense: 55, speed: 92, brains: 60 }, image: '/cards/wits-springbok.webp', quantity: 5, level: 1 },
  { id: 'card-109', name: 'Wits Medical', category: 'Science', rarity: 'Rare', stats: { attack: 50, defense: 85, speed: 55, brains: 96 }, image: '/cards/wits-medical.webp', quantity: 2, level: 1 },
  { id: 'card-110', name: 'Star Trails', category: 'Science', rarity: 'Epic', stats: { attack: 65, defense: 65, speed: 78, brains: 88 }, image: '/cards/star-trails.webp', quantity: 1, level: 1 },
  { id: 'card-111', name: 'High Voltage Coil', category: 'Science', rarity: 'Legendary', stats: { attack: 92, defense: 68, speed: 84, brains: 91 }, image: '/cards/high-voltage-coil.webp', quantity: 0, level: 1 },
  { id: 'card-112', name: 'Biomedical Genome', category: 'Science', rarity: 'Epic', stats: { attack: 62, defense: 78, speed: 60, brains: 97 }, image: '/cards/biomedical-genome.webp', quantity: 0, level: 1 },
  { id: 'card-113', name: 'Mandelstam Theorem', category: 'Science', rarity: 'Epic', stats: { attack: 70, defense: 65, speed: 50, brains: 98 }, image: '/cards/mandelstam-theorem.webp', quantity: 0, level: 1 },
  { id: 'card-114', name: 'Law Moot Shield', category: 'Landmarks', rarity: 'Rare', stats: { attack: 68, defense: 92, speed: 42, brains: 89 }, image: '/cards/law-moot-shield.webp', quantity: 0, level: 1 },
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