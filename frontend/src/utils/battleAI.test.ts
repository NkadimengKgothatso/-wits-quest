import { describe, it, expect } from 'vitest';
import { selectAIAction, selectAICounterCard } from './battleAI';
import { BattleCard, RoundRecord } from './battleEngine';

const mockCpuHand: BattleCard[] = [
  { id: 1, name: 'Card1', rarity: 'Common', stats: { attack: 10, defense: 20, speed: 30, brains: 40 } },
  { id: 2, name: 'Card2', rarity: 'Rare', stats: { attack: 50, defense: 40, speed: 30, brains: 20 } },
];

const mockPlayerHand: BattleCard[] = [
  { id: 3, name: 'Card3', rarity: 'Common', stats: { attack: 15, defense: 15, speed: 15, brains: 15 } },
  { id: 4, name: 'Card4', rarity: 'Epic', stats: { attack: 60, defense: 60, speed: 60, brains: 60 } },
];

const mockHistory: RoundRecord[] = [
  { roundNumber: 1, playerCard: mockPlayerHand[0], cpuCard: mockCpuHand[0], stat: 'attack', playerStatValue: 15, cpuStatValue: 10, outcome: 'win' },
  { roundNumber: 2, playerCard: mockPlayerHand[0], cpuCard: mockCpuHand[0], stat: 'attack', playerStatValue: 15, cpuStatValue: 10, outcome: 'win' },
];

describe('battleAI', () => {
  describe('selectAIAction', () => {
    it('throws if CPU hand is empty', () => {
      expect(() => selectAIAction([], mockPlayerHand, [], 'easy')).toThrow('CPU hand is empty');
    });

    it('selects easy action', () => {
      const result = selectAIAction(mockCpuHand, mockPlayerHand, [], 'easy');
      expect(result.card).toBeDefined();
      expect(result.stat).toBeDefined();
      expect(result.reasoning).toContain('Level 1 Easy AI');
    });

    it('selects medium action (greedy pick)', () => {
      const result = selectAIAction(mockCpuHand, mockPlayerHand, [], 'medium');
      // Should pick Card2 and attack (50)
      expect(result.card.id).toBe(2);
      expect(result.stat).toBe('attack');
      expect(result.reasoning).toContain('Level 2 Medium AI');
    });

    it('selects hard action (minimax)', () => {
      const result = selectAIAction(mockCpuHand, mockPlayerHand, mockHistory, 'hard');
      expect(result.card).toBeDefined();
      expect(result.stat).toBeDefined();
      expect(result.reasoning).toContain('Level 3 Grandmaster AI');
    });

    it('defaults to medium action if difficulty unknown', () => {
      const result = selectAIAction(mockCpuHand, mockPlayerHand, [], 'unknown' as any);
      expect(result.card.id).toBe(2);
    });
  });

  describe('selectAICounterCard', () => {
    it('throws if CPU hand is empty', () => {
      expect(() => selectAICounterCard([], mockPlayerHand[0], 'attack', [], 'easy')).toThrow('CPU hand is empty');
    });

    it('selects easy counter card', () => {
      const result = selectAICounterCard(mockCpuHand, mockPlayerHand[0], 'attack', [], 'easy');
      expect(result.card).toBeDefined();
      expect(result.reasoning).toContain('Level 1 Easy AI');
    });

    it('selects medium counter card (highest in chosen stat)', () => {
      const result = selectAICounterCard(mockCpuHand, mockPlayerHand[0], 'brains', [], 'medium');
      // Should pick Card1 since brains is 40 vs Card2 brains 20
      expect(result.card.id).toBe(1);
      expect(result.reasoning).toContain('Level 2 Medium AI');
    });

    it('selects hard counter card (minimal winner)', () => {
      // Player card has attack 15. Cpu hand has attack 10 and attack 50.
      // Attack 50 > 15, so it should pick Card2 as minimal winner.
      const result = selectAICounterCard(mockCpuHand, mockPlayerHand[0], 'attack', [], 'hard');
      expect(result.card.id).toBe(2);
      expect(result.reasoning).toContain('Minimal winner card');
    });

    it('selects hard counter card (sacrifices lowest total when no winner)', () => {
      // Player card has attack 60. Cpu hand has attack 10 and 50. No winner possible.
      // Card1 total stats = 10+20+30+40 = 100
      // Card2 total stats = 50+40+30+20 = 140
      // Should sacrifice Card1 since 100 < 140
      const result = selectAICounterCard(mockCpuHand, mockPlayerHand[1], 'attack', [], 'hard');
      expect(result.card.id).toBe(1);
      expect(result.reasoning).toContain('Sacrificing lowest value card');
    });
    
    it('defaults to medium counter card if difficulty unknown', () => {
      const result = selectAICounterCard(mockCpuHand, mockPlayerHand[0], 'brains', [], 'unknown' as any);
      expect(result.card.id).toBe(1);
    });
  });
});
