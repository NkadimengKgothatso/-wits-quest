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
import { getCatalog } from './cardCatalogService';

const BACKEND_URL = 'http://localhost:3000';

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

  return getCatalog()
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
    catalog = res.ok ? await res.json() : getCatalog();
  } catch {
    catalog = getCatalog();
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