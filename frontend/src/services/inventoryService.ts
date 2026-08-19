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
    .filter((c) => !filters?.rarity?.length || filters.rarity.includes(c.card.rarity))
    .filter((c) => !filters?.category || c.card.category === filters.category)
    .filter((c) => !filters?.search || c.card.name.toLowerCase().includes(filters.search.toLowerCase()))
    .map((c) => {
      const bonusStats: CardStats = { attack: c.attackBonus, defense: c.defenseBonus, speed: c.speedBonus, brains: c.brainsBonus };
      const effectiveStats: CardStats = {
        attack: c.card.baseAttack + c.attackBonus,
        defense: c.card.baseDefense + c.defenseBonus,
        speed: c.card.baseSpeed + c.speedBonus,
        brains: c.card.baseBrains + c.brainsBonus,
      };
      return {
        unlocked: true,
        inventoryId: c.inventoryId,
        card: { id: c.card.id, name: c.card.name, category: c.card.category as Card['category'], rarity: c.card.rarity, stats: effectiveStats, image: c.card.imageUrl ?? '' },
        level: c.level,
        quantity: c.owned,
        bonusStats,
        effectiveStats,
        totalStatCost: effectiveStats.attack + effectiveStats.defense + effectiveStats.speed + effectiveStats.brains,
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