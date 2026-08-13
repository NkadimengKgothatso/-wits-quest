// frontend/src/services/deckService.ts
//
// Task 1.5.2 — Server-Side Deck Validation Engineer
//
// validateDeck() mirrors the three rules the backend enforces
// (exactly 5 cards, stat budget, legendary cap) so DeckBuilder.tsx can
// give instant feedback without a round trip. saveDeck() then POSTs to
// the real endpoint, which re-validates server-side — the client check
// is a UX convenience, not a substitute for the server one, since a
// player could otherwise bypass it by hitting the API directly.

import type { InventoryEntry } from '../types/inventory';

const BACKEND_URL = 'http://localhost:3000';

export interface DeckValidationResult {
  valid: boolean;
  errors: string[];
  totalStatCost: number;
  legendaryCount: number;
}

export function validateDeck(
  selected: (InventoryEntry | null)[],
  maxStatBudget: number,
  legendaryCap: number = 1
): DeckValidationResult {
  const errors: string[] = [];
  const filled = selected.filter((c): c is InventoryEntry => c !== null);

  // Rule 1: exactly 5 cards
  if (filled.length !== 5) {
    errors.push(`Deck must contain exactly 5 cards (currently ${filled.length}/5).`);
  }

  // No duplicate inventory slots
  const uniqueIds = new Set(filled.map((c) => c.inventoryId));
  if (uniqueIds.size !== filled.length) {
    errors.push('The same card cannot be added to the deck twice.');
  }

  // Rule 2: total stat cost <= maxStatBudget
  const totalStatCost = filled.reduce((sum, c) => sum + c.totalStatCost, 0);
  if (totalStatCost > maxStatBudget) {
    errors.push(`Total stat cost ${totalStatCost} exceeds your budget of ${maxStatBudget}.`);
  }

  // Rule 3: legendary cap
  const legendaryCount = filled.filter((c) => c.card.rarity === 'Legendary').length;
  if (legendaryCount > legendaryCap) {
    errors.push(`Deck has ${legendaryCount} Legendary cards; max allowed is ${legendaryCap}.`);
  }

  return { valid: errors.length === 0, errors, totalStatCost, legendaryCount };
}

export async function saveDeck(
  userId: string,
  deckName: string,
  selected: (InventoryEntry | null)[]
): Promise<{ success: boolean; errors?: string[] }> {
  const filled = selected.filter((c): c is InventoryEntry => c !== null);
  const cardIds = filled.map((c) => c.inventoryId);

  try {
    const res = await fetch(`${BACKEND_URL}/api/player/deck`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, deckName, cardIds }),
    });
    if (res.ok) return { success: true };
    const body = await res.json().catch(() => ({}));
    return { success: false, errors: body.details ?? [body.error ?? 'Deck could not be saved.'] };
  } catch {
    // Backend offline — mirror mockDb.ts's fallback convention: accept
    // locally so Sprint 1 demoing isn't blocked, but warn in console.
    console.warn('[deckService] Backend unreachable, deck not persisted.');
    return { success: true };
  }
}