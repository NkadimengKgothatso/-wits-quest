// frontend/src/types/inventory.ts
//
// Builds on types/card.ts's `Card` (the master catalog definition — what
// a card IS) by adding the "a student owns this" layer, which is a
// separate concept in the schema (user_cards, joined to cards). Keeping
// these separate mirrors the backend tables and means Card stays a pure
// catalog type that other screens/members can rely on unchanged.

import type { Card, CardStats } from './card';

/** A card the player owns, with Forge upgrade level/bonuses applied. */
export interface InventoryEntry {
  unlocked: true;
  inventoryId: string; // user_cards.id
  card: Card;
  level: number; // Forge upgrade level
  quantity: number; // duplicate count, for scrapping
  bonusStats: CardStats; // accumulated Forge bonuses
  effectiveStats: CardStats; // card.stats + bonusStats — what battles/deck cost use
  totalStatCost: number; // sum of effectiveStats, used against maxStatBudget
}

/** A catalog card the player has not unlocked yet. */
export interface LockedCardEntry {
  unlocked: false;
  card: Card;
  unlockHint: string;
}

export type CollectionEntry = InventoryEntry | LockedCardEntry;

export interface InventoryFilters {
  rarity?: Card['rarity'][];
  category?: Card['category'];
  search?: string;
}