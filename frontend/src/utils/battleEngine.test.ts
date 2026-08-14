import { describe, it, expect } from 'vitest';
import { createBattleState, resolveRound, calculateRewards, BattleCard, AIDifficulty, StatAttribute } from './battleEngine';

const mockPlayerDeck: BattleCard[] = [
  { id: 1, name: 'Card1', rarity: 'Common', stats: { attack: 10, defense: 20, speed: 30, brains: 40 } },
  { id: 2, name: 'Card2', rarity: 'Rare', stats: { attack: 50, defense: 40, speed: 30, brains: 20 } },
];

const mockCpuDeck: BattleCard[] = [
  { id: 3, name: 'Card3', rarity: 'Common', stats: { attack: 15, defense: 15, speed: 15, brains: 15 } },
  { id: 4, name: 'Card4', rarity: 'Epic', stats: { attack: 60, defense: 60, speed: 60, brains: 60 } },
];

describe('battleEngine', () => {
  describe('createBattleState', () => {
    it('creates an initial battle state correctly', () => {
      const state = createBattleState(mockPlayerDeck, mockCpuDeck, 'hard', 3);
      expect(state.playerDeck).toEqual(mockPlayerDeck);
      expect(state.cpuDeck).toEqual(mockCpuDeck);
      expect(state.currentRound).toBe(1);
      expect(state.maxRounds).toBe(3);
      expect(state.difficulty).toBe('hard');
      expect(state.isGameOver).toBe(false);
      expect(state.winner).toBeNull();
    });

    it('uses medium difficulty and 5 max rounds by default', () => {
      const state = createBattleState(mockPlayerDeck, mockCpuDeck);
      expect(state.difficulty).toBe('medium');
      expect(state.maxRounds).toBe(5);
    });
  });

  describe('resolveRound', () => {
    it('evaluates a round win correctly', () => {
      const state = createBattleState(mockPlayerDeck, mockCpuDeck);
      const nextState = resolveRound(state, mockPlayerDeck[1], mockCpuDeck[0], 'attack'); // 50 vs 15

      expect(nextState.rounds.length).toBe(1);
      expect(nextState.rounds[0].outcome).toBe('win');
      expect(nextState.playerWins).toBe(1);
      expect(nextState.cpuWins).toBe(0);
      expect(nextState.currentRound).toBe(2);
      expect(nextState.isGameOver).toBe(false);
    });

    it('evaluates a round lose correctly', () => {
      const state = createBattleState(mockPlayerDeck, mockCpuDeck);
      const nextState = resolveRound(state, mockPlayerDeck[0], mockCpuDeck[1], 'attack'); // 10 vs 60

      expect(nextState.rounds[0].outcome).toBe('lose');
      expect(nextState.playerWins).toBe(0);
      expect(nextState.cpuWins).toBe(1);
    });

    it('evaluates a round tie correctly', () => {
      const state = createBattleState(mockPlayerDeck, mockCpuDeck);
      // Let's create a scenario for a tie
      const tieCard: BattleCard = { id: 5, name: 'Tie', rarity: 'Common', stats: { attack: 15, defense: 15, speed: 15, brains: 15 } };
      const nextState = resolveRound(state, tieCard, mockCpuDeck[0], 'attack'); // 15 vs 15

      expect(nextState.rounds[0].outcome).toBe('tie');
      expect(nextState.playerWins).toBe(0);
      expect(nextState.cpuWins).toBe(0);
    });

    it('determines game over and winner correctly when target wins reached', () => {
      let state = createBattleState(mockPlayerDeck, mockCpuDeck, 'easy', 3);
      // Target wins for maxRounds 3 is ceil(3/2) = 2
      
      // Round 1 (Player wins)
      state = resolveRound(state, mockPlayerDeck[1], mockCpuDeck[0], 'attack'); // 50 vs 15
      expect(state.isGameOver).toBe(false);

      // Round 2 (Player wins again -> 2 wins total)
      state = resolveRound(state, mockPlayerDeck[1], mockCpuDeck[0], 'attack');
      expect(state.isGameOver).toBe(true);
      expect(state.winner).toBe('player');
      expect(state.currentRound).toBe(2); // Round shouldn't increment on game over
    });

    it('returns the same state if game is already over', () => {
      let state = createBattleState(mockPlayerDeck, mockCpuDeck, 'easy', 1);
      state = resolveRound(state, mockPlayerDeck[1], mockCpuDeck[0], 'attack');
      expect(state.isGameOver).toBe(true);

      const nextState = resolveRound(state, mockPlayerDeck[1], mockCpuDeck[0], 'attack');
      expect(nextState).toBe(state); // Strict equality
    });
    
    it('handles a draw game outcome', () => {
      let state = createBattleState(mockPlayerDeck, mockCpuDeck, 'easy', 2);
      const tieCard: BattleCard = { id: 5, name: 'Tie', rarity: 'Common', stats: { attack: 15, defense: 15, speed: 15, brains: 15 } };
      
      state = resolveRound(state, tieCard, mockCpuDeck[0], 'attack'); // Tie
      state = resolveRound(state, tieCard, mockCpuDeck[0], 'attack'); // Tie -> max rounds 2 reached
      
      expect(state.isGameOver).toBe(true);
      expect(state.winner).toBe('draw');
    });

    it('handles a CPU win outcome', () => {
        let state = createBattleState(mockPlayerDeck, mockCpuDeck, 'easy', 1);
        state = resolveRound(state, mockPlayerDeck[0], mockCpuDeck[1], 'attack'); // Player loses 10 vs 60
        expect(state.isGameOver).toBe(true);
        expect(state.winner).toBe('cpu');
    });
  });

  describe('calculateRewards', () => {
    it('returns 0 rewards if game is not over', () => {
      const state = createBattleState(mockPlayerDeck, mockCpuDeck);
      const rewards = calculateRewards(state);
      expect(rewards.xp).toBe(0);
      expect(rewards.essence).toBe(0);
      expect(rewards.eloChange).toBe(0);
    });

    it('calculates player win rewards correctly on hard', () => {
      const state = createBattleState(mockPlayerDeck, mockCpuDeck, 'hard', 1);
      const nextState = resolveRound(state, mockPlayerDeck[1], mockCpuDeck[0], 'attack'); // Player wins
      const rewards = calculateRewards(nextState);
      
      expect(rewards.xp).toBe(Math.round(150 * 1.5));
      expect(rewards.essence).toBe(Math.round(45 * 1.5));
      expect(rewards.eloChange).toBe(25);
    });

    it('calculates player win rewards correctly on medium', () => {
      const state = createBattleState(mockPlayerDeck, mockCpuDeck, 'medium', 1);
      const nextState = resolveRound(state, mockPlayerDeck[1], mockCpuDeck[0], 'attack');
      const rewards = calculateRewards(nextState);
      
      expect(rewards.xp).toBe(Math.round(150 * 1.2));
      expect(rewards.essence).toBe(Math.round(45 * 1.2));
      expect(rewards.eloChange).toBe(18);
    });

    it('calculates player win rewards correctly on easy', () => {
      const state = createBattleState(mockPlayerDeck, mockCpuDeck, 'easy', 1);
      const nextState = resolveRound(state, mockPlayerDeck[1], mockCpuDeck[0], 'attack');
      const rewards = calculateRewards(nextState);
      
      expect(rewards.xp).toBe(150);
      expect(rewards.essence).toBe(45);
      expect(rewards.eloChange).toBe(12);
    });

    it('calculates CPU win correctly', () => {
      const state = createBattleState(mockPlayerDeck, mockCpuDeck, 'easy', 1);
      const nextState = resolveRound(state, mockPlayerDeck[0], mockCpuDeck[1], 'attack'); // Player loses
      const rewards = calculateRewards(nextState);
      
      expect(rewards.xp).toBe(-20);
      expect(rewards.essence).toBe(0);
      expect(rewards.eloChange).toBe(-15);
    });

    it('calculates draw correctly', () => {
      const state = createBattleState(mockPlayerDeck, mockCpuDeck, 'easy', 1);
      const tieCard: BattleCard = { id: 5, name: 'Tie', rarity: 'Common', stats: { attack: 15, defense: 15, speed: 15, brains: 15 } };
      const nextState = resolveRound(state, tieCard, mockCpuDeck[0], 'attack'); // Tie
      const rewards = calculateRewards(nextState);
      
      expect(rewards.xp).toBe(75);
      expect(rewards.essence).toBe(20);
      expect(rewards.eloChange).toBe(0);
    });
  });
});
