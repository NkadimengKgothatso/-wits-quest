import type { Card, CardStats } from '../types/card';
import type { CollectionEntry, InventoryEntry, InventoryFilters } from '../types/inventory';
import { getCards, getMockUserCards } from './apiClient';

const NO_BONUS: CardStats = { attack: 0, defense: 0, speed: 0, brains: 0 };

function totalOf(s: CardStats): number {
  return s.attack + s.defense + s.speed + s.brains;
}

export async function getPlayerInventory(
  userId: string,
  filters?: InventoryFilters
): Promise<InventoryEntry[]> {
  try {
    const data = await getMockUserCards(userId);
    let inventory = data.map((d: any) => {
      const card = d.card;
      const c: Card = {
        id: card.id,
        name: card.name,
        category: card.category,
        rarity: card.rarity as any,
        image: card.imageUrl,
        stats: {
          attack: card.baseAttack,
          defense: card.baseDefense,
          speed: card.baseSpeed,
          brains: card.baseBrains
        }
      };
      
      return {
        unlocked: true,
        inventoryId: `inv_${c.id}`, // fallback inventory ID
        card: c,
        level: d.level,
        quantity: d.owned,
        bonusStats: NO_BONUS,
        effectiveStats: c.stats,
        totalStatCost: totalOf(c.stats)
      } as InventoryEntry;
    });

    if (filters) {
       if (filters.rarity?.length) inventory = inventory.filter(c => filters.rarity!.includes(c.card.rarity));
       if (filters.category) inventory = inventory.filter(c => c.card.category === filters.category);
       if (filters.search) inventory = inventory.filter(c => c.card.name.toLowerCase().includes(filters.search!.toLowerCase()));
    }
    return inventory;
  } catch (err) {
    console.error("Failed to load player inventory", err);
    return [];
  }
}

export async function getFullCollection(
  userId: string,
  filters?: InventoryFilters
): Promise<CollectionEntry[]> {
  const owned = await getPlayerInventory(userId, filters);
  const ownedIds = new Set(owned.map((e) => e.card.id));

  let catalog: Card[] = [];
  try {
    const rawCards = await getCards();
    catalog = rawCards.map((c: any) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      rarity: c.rarity,
      image: c.imageUrl,
      stats: {
        attack: c.baseAttack,
        defense: c.baseDefense,
        speed: c.baseSpeed,
        brains: c.baseBrains
      }
    }));
  } catch (err) {
    console.error("Failed to load catalog", err);
    catalog = [];
  }

  const locked: CollectionEntry[] = catalog
    .filter((c) => !ownedIds.has(c.id))
    .map((c) => ({
      unlocked: false,
      card: c,
      unlockHint: 'Find the event associated with this card and answer the trivia!',
    }));

  let merged: CollectionEntry[] = [...owned, ...locked];

  if (filters) {
     if (filters.rarity?.length) merged = merged.filter(c => filters.rarity!.includes(c.card.rarity));
     if (filters.category) merged = merged.filter(c => c.card.category === filters.category);
     if (filters.search) merged = merged.filter(c => c.card.name.toLowerCase().includes(filters.search!.toLowerCase()));
  }

  return merged;
}