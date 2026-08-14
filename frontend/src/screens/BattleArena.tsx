import { useState, useEffect } from 'react';
import { Swords, Shield, Zap, Brain, Trophy, Bot, User, RefreshCw, Cpu, Check, X, Minus } from 'lucide-react';
import {
  BattleCard,
  StatAttribute,
  AIDifficulty,
  createBattleState,
  resolveRound,
  calculateRewards,
  BattleState,
  RoundOutcome,
} from '../utils/battleEngine';
import { selectAIAction, selectAICounterCard } from '../utils/battleAI';
import { saveMockBattleResult } from '../services/mockDbClient';
import { useAuth } from '../context/AuthContext';

const PLAYER_CARDS: any[] = [
  { id: 1, name: 'Great Hall Pillars', emoji: '🏛️', attack: 85, defense: 95, speed: 40, brains: 90, rarity: 'Legendary', stats: { attack: 85, defense: 95, speed: 40, brains: 90 } },
  { id: 2, name: "Solomon's Torch", emoji: '🔥', attack: 90, defense: 70, speed: 85, brains: 88, rarity: 'Epic', stats: { attack: 90, defense: 70, speed: 85, brains: 88 } },
  { id: 3, name: 'Quantum Reactor', emoji: '⚛️', attack: 75, defense: 60, speed: 70, brains: 95, rarity: 'Rare', stats: { attack: 75, defense: 60, speed: 70, brains: 95 } },
  { id: 4, name: 'Wits Springbok', emoji: '🦌', attack: 72, defense: 55, speed: 92, brains: 60, rarity: 'Common', stats: { attack: 72, defense: 55, speed: 92, brains: 60 } },
  { id: 5, name: 'Ancient Tome', emoji: '📚', attack: 55, defense: 72, speed: 30, brains: 99, rarity: 'Epic', stats: { attack: 55, defense: 72, speed: 30, brains: 99 } },
]

const CPU_CARDS: any[] = [
  { id: 101, name: 'Joburg Skyline', emoji: '🌆', attack: 80, defense: 88, speed: 55, brains: 82, rarity: 'Epic', stats: { attack: 80, defense: 88, speed: 55, brains: 82 } },
  { id: 102, name: 'Reef Gold', emoji: '🥇', attack: 95, defense: 65, speed: 72, brains: 78, rarity: 'Legendary', stats: { attack: 95, defense: 65, speed: 72, brains: 78 } },
  { id: 103, name: 'Ubuntu Spirit', emoji: '🤝', attack: 60, defense: 90, speed: 60, brains: 92, rarity: 'Rare', stats: { attack: 60, defense: 90, speed: 60, brains: 92 } },
  { id: 104, name: 'Voortrekker', emoji: '🐂', attack: 78, defense: 75, speed: 68, brains: 70, rarity: 'Common', stats: { attack: 78, defense: 75, speed: 68, brains: 70 } },
  { id: 105, name: 'Kruger Leopard', emoji: '🐆', attack: 92, defense: 58, speed: 96, brains: 65, rarity: 'Epic', stats: { attack: 92, defense: 58, speed: 96, brains: 65 } },
]

const ATTR_KEYS: StatAttribute[] = ['attack', 'defense', 'speed', 'brains'];
type AttrKey = StatAttribute;

const ATTR_META: Record<AttrKey, { icon: any; label: string; color: string }> = {
  attack: { icon: Swords, label: 'Attack', color: '#f87171' },
  defense: { icon: Shield, label: 'Defense', color: '#dca668' },
  speed: { icon: Zap, label: 'Speed', color: '#facc15' },
  brains: { icon: Brain, label: 'Brains', color: '#e8c99a' },
}

const RARITY_BORDER: Record<string, string> = {
  Legendary: '#dca668', Epic: '#c99255', Rare: '#a87d4d', Common: 'rgba(220, 166, 104, 0.5)'
}

type RoundResult = 'win' | 'lose' | 'tie' | null

interface RoundRecord { playerCard: typeof PLAYER_CARDS[0]; cpuCard: typeof CPU_CARDS[0]; attr: AttrKey; result: RoundResult }

export default function BattleArena() {
  const { currentUser, updateUserLocally } = useAuth();
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [battleState, setBattleState] = useState<BattleState>(() =>
    createBattleState(PLAYER_CARDS, CPU_CARDS, 'medium')
  );
  const [playerCardIdx, setPlayerCardIdx] = useState(0);
  const [cpuCardIdx, setCpuCardIdx] = useState(0);
  const [selectedAttr, setSelectedAttr] = useState<StatAttribute | null>(null);
  const [lastOutcome, setLastOutcome] = useState<RoundOutcome | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [animating, setAnimating] = useState(false);

  const playerCard = PLAYER_CARDS[playerCardIdx];
  const cpuCard = CPU_CARDS[cpuCardIdx];

  // Timer effect
  useEffect(() => {
    if (lastOutcome !== null || battleState.isGameOver) return;
    const t = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          clearInterval(t);
          handleAutoPlay();
          return 30;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [lastOutcome, battleState.isGameOver, playerCardIdx]);

  // Persist battle results to Mock DB on Game Over
  useEffect(() => {
    if (battleState.isGameOver && battleState.winner && currentUser) {
      const rewards = calculateRewards(battleState);
      saveMockBattleResult({
        userId: currentUser.id,
        matchType: 'CPU',
        opponentId: 'CPU_BOT',
        outcome: battleState.winner === 'player' ? 'win' : battleState.winner === 'cpu' ? 'lose' : 'tie',
        xpAwarded: rewards.xp,
        essenceAwarded: rewards.essence,
        eloDelta: rewards.eloChange,
        roundsData: battleState.rounds.map((r) => ({
          roundNumber: r.roundNumber,
          statChosen: r.stat,
          challengerCardId: String(r.playerCard.id),
          opponentCardId: String(r.cpuCard.id),
          challengerStatVal: r.playerStatValue,
          opponentStatVal: r.cpuStatValue,
          outcome: r.outcome,
        })),
      }).then((updatedUser) => {
        if (updatedUser) updateUserLocally(updatedUser);
      });
    }
  }, [battleState.isGameOver]);

  function handleDifficultyChange(newDiff: AIDifficulty) {
    setDifficulty(newDiff);
    setBattleState(createBattleState(PLAYER_CARDS, CPU_CARDS, newDiff));
    setPlayerCardIdx(0);
    setCpuCardIdx(0);
    setSelectedAttr(null);
    setLastOutcome(null);
    setAiReasoning('');
    setTimeLeft(30);
  }

  function handleAutoPlay() {
    const randomAttr = ATTR_KEYS[Math.floor(Math.random() * ATTR_KEYS.length)];
    executeRound(randomAttr);
  }

  function executeRound(attr: StatAttribute) {
    if (animating || lastOutcome !== null || battleState.isGameOver) return;

    setSelectedAttr(attr);
    setAnimating(true);

    // AI chooses counter card based on difficulty level
    const aiChoice = selectAICounterCard(
      battleState.cpuHand,
      playerCard,
      attr,
      battleState.rounds,
      difficulty
    );

    const activeCpuCard = aiChoice.card;
    setCpuCardIdx(CPU_CARDS.findIndex((c) => c.id === activeCpuCard.id));
    setAiReasoning(aiChoice.reasoning || '');

    setTimeout(() => {
      const nextState = resolveRound(battleState, playerCard, activeCpuCard, attr);
      const latestRecord = nextState.rounds[nextState.rounds.length - 1];

      setBattleState(nextState);
      setLastOutcome(latestRecord.outcome);
      setAnimating(false);

      setTimeout(() => {
        if (!nextState.isGameOver) {
          setLastOutcome(null);
          setSelectedAttr(null);
          setPlayerCardIdx((v) => (v + 1) % PLAYER_CARDS.length);
          setCpuCardIdx((v) => (v + 1) % CPU_CARDS.length);
          setTimeLeft(30);
        }
      }, 1800);
    }, 600);
  }

  function resetGame() {
    setBattleState(createBattleState(PLAYER_CARDS, CPU_CARDS, difficulty));
    setPlayerCardIdx(0);
    setCpuCardIdx(0);
    setSelectedAttr(null);
    setLastOutcome(null);
    setAiReasoning('');
    setTimeLeft(30);
  }

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - timeLeft / 30);
  const rewards = calculateRewards(battleState);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 20%, #1e3a5f 0%, #54441b 50%, #3d2f12 100%)',
      paddingTop: 70,
      paddingBottom: 80,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* AI Difficulty Selector Bar */}
      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#a4b5d1', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Cpu size={14} color="#60a5fa" /> AI LEVEL:
        </div>
        {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((level) => {
          const isSelected = difficulty === level;
          const label = level === 'easy' ? 'Level 1 (Easy)' : level === 'medium' ? 'Level 2 (Medium)' : 'Level 3 (Hard)';
          return (
            <button
              key={level}
              onClick={() => handleDifficultyChange(level)}
              style={{
                background: isSelected ? 'rgba(96, 165, 250, 0.25)' : 'rgba(29, 49, 86, 0.6)',
                border: `1px solid ${isSelected ? '#60a5fa' : 'rgba(164,181,209,0.3)'}`,
                color: isSelected ? '#60a5fa' : '#a4b5d1',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Top Header */}
      <div style={{ padding: '4px 16px 12px' }}>
        <div className="glass" style={{ padding: '12px 16px', borderRadius: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Player */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #e8c99a, #6b7d2c)',
                border: '2px solid rgba(232, 201, 154, 0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>🧙</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Player</div>
                <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 700 }}>{battleState.playerWins} wins</div>
              </div>
            </div>

            {/* Round info + clock */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 10, color: '#dca668', fontWeight: 700, letterSpacing: '0.1em' }}>
                BEST OF 5 · ROUND {battleState.currentRound}
              </div>
              {/* Circular countdown */}
              <div style={{ position: 'relative', width: 64, height: 64 }}>
                <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(220, 166, 104, 0.2)" strokeWidth="4" />
                  <circle
                    cx="28" cy="28" r={radius}
                    fill="none"
                    stroke={timeLeft <= 10 ? '#f87171' : '#dca668'}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 4px ${timeLeft <= 10 ? '#f87171' : '#dca668'})` }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 900,
                  color: timeLeft <= 10 ? '#f87171' : 'white',
                }}>
                  {timeLeft}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                {[0, 1, 2, 3, 4].map((i) => {
                  const r = battleState.rounds[i];
                  return (
                    <div key={i} style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: !r ? 'rgba(220, 166, 104, 0.2)' : r.outcome === 'win' ? '#4ade80' : r.outcome === 'lose' ? '#f87171' : '#facc15',
                      border: '1px solid rgba(220, 166, 104, 0.3)',
                    }} />
                  );
                })}
              </div>
            </div>

            {/* CPU */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>
                  CPU Bot ({difficulty.toUpperCase()})
                </div>
                <div style={{ fontSize: 11, color: '#f87171', fontWeight: 700 }}>{battleState.cpuWins} wins</div>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f87171, #991b1b)',
                border: '2px solid rgba(248, 113, 113, 0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={18} color="#ffffff" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Telemetry / Reasoning Bar */}
      {aiReasoning && (
        <div style={{ padding: '0 16px 8px' }}>
          <div style={{
            background: 'rgba(15, 26, 46, 0.7)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 10,
            color: '#93c5fd',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <Cpu size={12} color="#60a5fa" />
            <span>AI Reasoning: {aiReasoning}</span>
          </div>
        </div>
      )}

      {/* Center Stage */}
      <div style={{ flex: 1, padding: '8px 16px', position: 'relative' }}>
        {battleState.isGameOver ? (
          <div className="glass slide-up" style={{
            borderRadius: 20, padding: 32, textAlign: 'center',
            border: `2px solid ${battleState.winner === 'player' ? '#4ade80' : battleState.winner === 'cpu' ? '#f87171' : '#facc15'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              {battleState.winner === 'player' ? (
                <Trophy size={48} color="#4ade80" />
              ) : battleState.winner === 'cpu' ? (
                <Bot size={48} color="#f87171" />
              ) : (
                <Minus size={48} color="#facc15" />
              )}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: battleState.winner === 'player' ? '#4ade80' : battleState.winner === 'cpu' ? '#f87171' : '#facc15' }}>
              {battleState.winner === 'player' ? 'VICTORY' : battleState.winner === 'cpu' ? 'DEFEATED' : 'DRAW'}
            </div>
            <div style={{ fontSize: 14, color: '#dca668', margin: '8px 0 16px' }}>
              {battleState.playerWins} — {battleState.cpuWins} · Best of 5
            </div>
            <div style={{ fontSize: 12, color: '#facc15', marginBottom: 20, fontWeight: 700 }}>
              {rewards.message}
            </div>
            <button
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 800,
                padding: '12px 32px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
              onClick={resetGame}
            >
              <RefreshCw size={16} /> PLAY AGAIN
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, height: 260 }}>
            {/* Player card */}
            <div
              className={animating ? 'clash-left' : ''}
              style={{
                flex: 1,
                borderRadius: 16,
                border: `2px solid ${RARITY_BORDER[playerCard.rarity]}`,
                background: 'linear-gradient(160deg, #54441b 0%, #6b5630 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ fontSize: 9, color: '#e8c99a', fontWeight: 700, letterSpacing: '0.1em' }}>YOUR CARD</div>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(84, 68, 27, 0.8)', border: `2px solid ${RARITY_BORDER[playerCard.rarity]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: RARITY_BORDER[playerCard.rarity], fontWeight: 800, fontSize: 14 }} className="float">
                {playerCard.name.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'white', textAlign: 'center', padding: '0 8px' }}>
                {playerCard.name}
              </div>
              {selectedAttr && (
                <div style={{
                  background: `${ATTR_META[selectedAttr].color}20`,
                  border: `1px solid ${ATTR_META[selectedAttr].color}60`,
                  borderRadius: 8, padding: '4px 12px',
                  color: ATTR_META[selectedAttr].color,
                  fontSize: 15, fontWeight: 900,
                }}>
                  {ATTR_META[selectedAttr].label} {playerCard.stats[selectedAttr]}
                </div>
              )}
              {lastOutcome && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: lastOutcome === 'win' ? 'rgba(34,197,94,0.2)' : lastOutcome === 'lose' ? 'rgba(239,68,68,0.2)' : 'rgba(250,204,21,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {lastOutcome === 'win' ? (
                    <Check size={44} color="#4ade80" />
                  ) : lastOutcome === 'lose' ? (
                    <X size={44} color="#f87171" />
                  ) : (
                    <Minus size={44} color="#facc15" />
                  )}
                </div>
              )}
            </div>

            {/* VS divider */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{
                fontSize: 18, fontWeight: 900, color: '#dca668',
                textShadow: '0 0 16px rgba(220, 166, 104, 0.7)',
              }}>VS</div>
              {lastOutcome && (
                <div className="slide-up" style={{
                  background: lastOutcome === 'win' ? 'rgba(34,197,94,0.25)' : lastOutcome === 'lose' ? 'rgba(239,68,68,0.25)' : 'rgba(250,204,21,0.25)',
                  border: `1px solid ${lastOutcome === 'win' ? '#4ade80' : lastOutcome === 'lose' ? '#f87171' : '#facc15'}`,
                  borderRadius: 8, padding: '4px 8px',
                  color: lastOutcome === 'win' ? '#4ade80' : lastOutcome === 'lose' ? '#f87171' : '#facc15',
                  fontSize: 9, fontWeight: 900, textAlign: 'center',
                }}>
                  {lastOutcome.toUpperCase()}
                </div>
              )}
            </div>

            {/* CPU card */}
            <div style={{
              flex: 1,
              borderRadius: 16,
              border: `2px solid ${RARITY_BORDER[cpuCard.rarity]}`,
              background: 'linear-gradient(160deg, #2d1a1a 0%, #3d1f1f 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ fontSize: 9, color: '#f87171', fontWeight: 700, letterSpacing: '0.1em' }}>CPU CARD</div>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(45, 26, 26, 0.8)',
                border: `2px solid ${RARITY_BORDER[cpuCard.rarity]}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: RARITY_BORDER[cpuCard.rarity], fontWeight: 800, fontSize: 13,
              }}>
                {cpuCard.name.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'white', textAlign: 'center', padding: '0 8px' }}>
                {cpuCard.name}
              </div>
              {selectedAttr && (
                <div style={{
                  background: `${ATTR_META[selectedAttr].color}20`,
                  border: `1px solid ${ATTR_META[selectedAttr].color}60`,
                  borderRadius: 8, padding: '4px 12px',
                  color: ATTR_META[selectedAttr].color,
                  fontSize: 15, fontWeight: 900,
                }}>
                  {ATTR_META[selectedAttr].label} {cpuCard.stats[selectedAttr]}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Attribute Controls */}
      {!battleState.isGameOver && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
            {ATTR_KEYS.map((attr) => {
              const meta = ATTR_META[attr];
              const IconComp = meta.icon;
              const isSelected = selectedAttr === attr;
              return (
                <button
                  key={attr}
                  onClick={() => !lastOutcome && executeRound(attr)}
                  disabled={!!lastOutcome}
                  style={{
                    background: isSelected ? `${meta.color}25` : 'rgba(107, 125, 44, 0.4)',
                    border: `1.5px solid ${isSelected ? meta.color : 'rgba(220, 166, 104, 0.3)'}`,
                    borderRadius: 12,
                    padding: '10px 6px',
                    color: isSelected ? meta.color : 'white',
                    cursor: lastOutcome ? 'default' : 'pointer',
                    fontWeight: 800,
                    fontSize: 12,
                    textAlign: 'center',
                    boxShadow: isSelected ? `0 0 12px ${meta.color}50` : 'none',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <IconComp size={16} color={meta.color} />
                  <span style={{ fontSize: 10 }}>{meta.label}</span>
                  <span style={{ fontSize: 11, color: isSelected ? meta.color : '#dca668' }}>
                    {playerCard[attr]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Card Hand Selector */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {PLAYER_CARDS.map((card, i) => (
              <div
                key={card.id}
                onClick={() => setPlayerCardIdx(i)}
                style={{
                  flexShrink: 0,
                  width: 56,
                  borderRadius: 10,
                  border: `1.5px solid ${i === playerCardIdx ? RARITY_BORDER[card.rarity] : 'rgba(168,187,217,0.25)'}`,
                  background: i === playerCardIdx ? 'rgba(61,90,128,0.6)' : 'rgba(44,62,80,0.4)',
                  padding: '6px 4px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 22 }}>{card.emoji}</div>
                <div style={{ fontSize: 8, color: i === playerCardIdx ? 'white' : '#dca668', fontWeight: 700, lineHeight: 1.2, marginTop: 2 }}>
                  {card.name.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
