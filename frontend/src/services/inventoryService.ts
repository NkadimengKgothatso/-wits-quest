import { getCards, getMockUserCards, type Card as ApiCard } from './apiClient';
import type { CollectionEntry, InventoryEntry, InventoryFilters } from '../types/inventory';
import type { Card, CardStats } from '../types/card';

function toClientCard(c: ApiCard): Card {
  return {
    id: c.id,
    name: c.name,
    category: c.category as Card['category'],
    rarity: c.rarity,
    stats: { attack: c.baseAttack, defense: c.baseDefense, speed: c.baseSpeed, brains: c.baseBrains },
    image: c.imageUrl ?? '',
  };
}

export async function getPlayerInventory(userId: string, filters?: InventoryFilters): Promise<InventoryEntry[]> {
  const owned = await getMockUserCards(userId);
  return owned
    .filter((c: any) => !filters?.rarity?.length || filters.rarity.includes(c.rarity))
    .filter((c: any) => !filters?.category || c.category === filters.category)
    .filter((c: any) => !filters?.search || c.name.toLowerCase().includes(filters.search.toLowerCase()))
    .map((c: any) => {
      const effectiveStats: CardStats = { attack: c.attack, defense: c.defense, speed: c.speed, brains: c.brains };
      return {
        unlocked: true,
        inventoryId: c.inventoryId,
        card: { id: c.cardId, name: c.name, category: c.category, rarity: c.rarity, stats: effectiveStats, image: c.imageUrl ?? '' },
        level: c.level,
        quantity: c.quantity,
        bonusStats: { attack: 0, defense: 0, speed: 0, brains: 0 },
        effectiveStats,
        totalStatCost: c.totalStats,
      } satisfies InventoryEntry;
    });
}

export async function getFullCollection(userId: string, filters?: InventoryFilters): Promise<CollectionEntry[]> {
  const [owned, catalog] = await Promise.all([getPlayerInventory(userId), getCards()]);
  const ownedIds = new Set(owned.map((e) => e.card.id));

  const locked: CollectionEntry[] = catalog
    .filter((c) => !ownedIds.has(c.id))
    .map((c) => ({
      unlocked: false,
      card: toClientCard(c),
      unlockHint: 'Walk within 25m of the linked campus landmark and answer its trivia challenge.',
    }));

  return [...owned, ...locked].filter((entry) => {
    if (filters?.rarity?.length && !filters.rarity.includes(entry.card.rarity)) return false;
    if (filters?.category && entry.card.category !== filters.category) return false;
    if (filters?.search && !entry.card.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}