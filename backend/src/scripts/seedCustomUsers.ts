import { mockDb } from '../services/mockDb.js';

/**
 * Example script demonstrating how you can programmatically insert users,
 * master cards, custom decks, and async challenges by code.
 */
export function insertMockDataByCode() {
  console.log('--- INSERTING CUSTOM MOCK USERS & CARDS VIA CODE ---');

  // 1. Insert a custom user
  const newUser = mockDb.insertUser({
    id: 'usr_sipho',
    email: '2601990@students.wits.ac.za',
    studentNumber: '2601990',
    username: 'Sipho_Tactician',
    level: 8,
    eloRating: 1420,
    divisionTier: 'GOLD',
    pvpWins: 22,
    pvpLosses: 8,
    essenceBalance: 550,
  });
  console.log(`✓ Inserted User: ${newUser.username} (${newUser.id}), Level ${newUser.level}, Elo ${newUser.eloRating}`);

  // 2. Insert a custom landmark card
  const newCard = mockDb.insertCard({
    id: 'card-999',
    name: 'Chamber of Mines Engineering',
    category: 'Science',
    rarity: 'Legendary',
    baseAttack: 94,
    baseDefense: 88,
    baseSpeed: 70,
    baseBrains: 96,
  });
  console.log(`✓ Inserted Card: ${newCard.name} (${newCard.id}), Total Stats: ${newCard.totalStats}`);

  // 3. Add card to user inventory and create custom deck
  mockDb.insertUserCard(newUser.id, newCard.id);
  const deck = mockDb.createUserDeck(newUser.id, 'Sipho Engineering Deck', ['card-101', 'card-102', 'card-103', 'card-105', newCard.id], true);
  console.log(`✓ Created Deck for ${newUser.username}: "${deck.deckName}" (Stat Cost: ${deck.totalStatCost})`);

  // 4. Query full user deck with cards
  const fullDeckCards = mockDb.getUserFullDeckCards(newUser.id);
  console.log(`✓ Retried Deck Cards for ${newUser.username}:`, fullDeckCards.map((c: any) => c.name).join(', '));

  console.log('--- MOCK DB CODE INSERTION COMPLETE ---\n');
}

// Execute if run directly
insertMockDataByCode();
