import { useState, useEffect } from 'react';
import { Swords, Shield, Zap, Brain, Trophy, Bot, RefreshCw, Cpu, Check, X, Minus, MapPin, Search, Users, Sparkles, ChevronLeft } from 'lucide-react';
import {
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
  attack: { icon: Swords, label: 'Attack', color: '#EF4444' }, // Red
  defense: { icon: Shield, label: 'Defense', color: '#D37A32' }, // Orange/Rust
  speed: { icon: Zap, label: 'Speed', color: '#EAB308' }, // Yellow
  brains: { icon: Brain, label: 'Brains', color: '#4A7C59' }, // Green
}

const RARITY_BORDER: Record<string, string> = {
  Legendary: '#D37A32', Epic: '#8B5CF6', Rare: '#3B82F6', Common: '#8A7B72'
}

type Mode = 'hub' | 'ai' | 'multiplayer';

export default function BattleArena() {
  const { currentUser, updateUserLocally } = useAuth();
  const [mode, setMode] = useState<Mode>('hub');
  
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [battleState, setBattleState] = useState<BattleState>(() =>
    createBattleState(PLAYER_CARDS, CPU_CARDS, 'medium')
  );
  const [playerCardIdx, setPlayerCardIdx] = useState(0);
  const [cpuCardIdx, setCpuCardIdx] = useState(0);
  const [selectedAttr, setSelectedAttr] = useState<StatAttribute | null>(null);
  const [lastOutcome, setLastOutcome] = useState<RoundOutcome | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [animating, setAnimating] = useState(false);

  const playerCard = PLAYER_CARDS[playerCardIdx];
  const cpuCard = CPU_CARDS[cpuCardIdx];

  // Timer effect
  useEffect(() => {
    if (mode !== 'ai' || lastOutcome !== null || battleState.isGameOver) return;
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
  }, [mode, lastOutcome, battleState.isGameOver, playerCardIdx]);

  // Persist battle results
  useEffect(() => {
    if (battleState.isGameOver && battleState.winner && currentUser && mode === 'ai') {
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
  }, [battleState.isGameOver, mode]);

  function handleAutoPlay() {
    const randomAttr = ATTR_KEYS[Math.floor(Math.random() * ATTR_KEYS.length)];
    executeRound(randomAttr);
  }

  function executeRound(attr: StatAttribute) {
    if (animating || lastOutcome !== null || battleState.isGameOver) return;

    setSelectedAttr(attr);
    setAnimating(true);

    const aiChoice = selectAICounterCard(
      battleState.cpuHand,
      playerCard,
      attr,
      battleState.rounds,
      difficulty
    );

    const activeCpuCard = aiChoice.card;
    setCpuCardIdx(CPU_CARDS.findIndex((c) => c.id === activeCpuCard.id));

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

  function startBattle(diff: AIDifficulty) {
    setDifficulty(diff);
    setBattleState(createBattleState(PLAYER_CARDS, CPU_CARDS, diff));
    setPlayerCardIdx(0);
    setCpuCardIdx(0);
    setSelectedAttr(null);
    setLastOutcome(null);
    setTimeLeft(30);
    setMode('ai');
  }

  if (mode === 'hub') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '24px 16px', overflowY: 'auto', paddingBottom: 80 }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '32px', textAlign: 'center' }}>
          Battle Arena
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Mode Selection */}
          <div 
            onClick={() => startBattle('medium')}
            style={{
              background: 'var(--color-card-bg)',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(44, 34, 30, 0.05)',
              border: '2px solid var(--color-border)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(211, 122, 50, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Bot size={32} color="var(--color-accent)" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)', marginBottom: 8 }}>Campaign AI</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: 16 }}>Practice against AI opponents of varying difficulty to test your deck.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Easy', 'Med', 'Hard'].map(d => (
                <span key={d} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, color: 'var(--color-muted)' }}>
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Multiplayer Mode Selection */}
          <div 
            onClick={() => alert("Multiplayer is coming soon!")}
            style={{
              background: 'var(--color-card-bg)',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(44, 34, 30, 0.05)',
              border: '2px solid var(--color-border)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(74, 124, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Users size={32} color="var(--color-success)" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)', marginBottom: 8 }}>Async Multiplayer</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: 16 }}>Challenge other players' defense decks asynchronously.</p>
            <span style={{ background: 'var(--color-success)', color: 'white', padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 800 }}>
              RANKED
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- MATCH UI ---
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - timeLeft / 30);
  const rewards = calculateRewards(battleState);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      paddingTop: 16,
      paddingBottom: 80,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Header */}
      <div style={{ padding: '0 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => setMode('hub')} style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronLeft size={20} color="var(--color-text)" />
        </button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)' }}>AI Match - {difficulty.toUpperCase()}</h2>
          <span style={{ fontSize: 12, color: 'var(--color-muted)', fontWeight: 600 }}>1430 ELO</span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Scoreboard */}
      <div style={{ padding: '0 16px 24px' }}>
        <div style={{ background: 'var(--color-card-bg)', padding: '16px', borderRadius: 24, boxShadow: '0 4px 12px rgba(44, 34, 30, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--color-muted)', fontWeight: 700, marginBottom: 4 }}>YOU</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-success)' }}>{battleState.playerWins}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 48, height: 48, marginBottom: 8 }}>
              <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="24" cy="24" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="4" />
                <circle
                  cx="24" cy="24" r={radius}
                  fill="none"
                  stroke={timeLeft <= 10 ? 'var(--color-accent)' : 'var(--color-success)'}
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: timeLeft <= 10 ? 'var(--color-accent)' : 'var(--color-text)' }}>
                {timeLeft}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2, 3, 4].map((i) => {
                const r = battleState.rounds[i];
                return (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: !r ? 'var(--color-border)' : r.outcome === 'win' ? 'var(--color-success)' : r.outcome === 'lose' ? 'var(--color-accent)' : '#EAB308',
                  }} />
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--color-muted)', fontWeight: 700, marginBottom: 4 }}>CPU</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-accent)' }}>{battleState.cpuWins}</span>
          </div>
        </div>
      </div>

      {/* Center Stage */}
      <div style={{ flex: 1, padding: '0 16px 24px', position: 'relative' }}>
        {battleState.isGameOver ? (
          <div className="slide-up" style={{
            background: 'var(--color-card-bg)', borderRadius: 24, padding: 32, textAlign: 'center',
            border: `2px solid ${battleState.winner === 'player' ? 'var(--color-success)' : battleState.winner === 'cpu' ? 'var(--color-accent)' : '#EAB308'}`,
            boxShadow: '0 8px 24px rgba(44, 34, 30, 0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              {battleState.winner === 'player' ? (
                <Trophy size={48} color="var(--color-success)" />
              ) : battleState.winner === 'cpu' ? (
                <Bot size={48} color="var(--color-accent)" />
              ) : (
                <Minus size={48} color="#EAB308" />
              )}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: battleState.winner === 'player' ? 'var(--color-success)' : battleState.winner === 'cpu' ? 'var(--color-accent)' : '#EAB308' }}>
              {battleState.winner === 'player' ? 'VICTORY' : battleState.winner === 'cpu' ? 'DEFEATED' : 'DRAW'}
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-muted)', margin: '8px 0 16px' }}>
              {battleState.playerWins} — {battleState.cpuWins} · Best of 5
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-accent)', marginBottom: 24, fontWeight: 700 }}>
              {rewards.message}
            </div>
            <button
              style={{
                background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 800, padding: '16px 32px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center'
              }}
              onClick={() => startBattle(difficulty)}
            >
              <RefreshCw size={18} /> PLAY AGAIN
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 16, height: 260 }}>
            {/* Player card */}
            <div
              className={animating ? 'clash-left' : ''}
              style={{
                flex: 1, borderRadius: 20, border: `2px solid ${RARITY_BORDER[playerCard.rarity]}`, background: 'var(--color-card-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(44, 34, 30, 0.05)'
              }}
            >
              <div style={{ fontSize: 9, color: 'var(--color-muted)', fontWeight: 800, letterSpacing: '0.1em' }}>YOUR CARD</div>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${RARITY_BORDER[playerCard.rarity]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: RARITY_BORDER[playerCard.rarity], fontWeight: 900, fontSize: 20 }}>
                {playerCard.name.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text)', textAlign: 'center', padding: '0 8px' }}>
                {playerCard.name}
              </div>
              {selectedAttr && (
                <div style={{ background: `${ATTR_META[selectedAttr].color}15`, borderRadius: 12, padding: '6px 16px', color: ATTR_META[selectedAttr].color, fontSize: 16, fontWeight: 900 }}>
                  {ATTR_META[selectedAttr].label} {playerCard.stats[selectedAttr]}
                </div>
              )}
              {lastOutcome && (
                <div style={{ position: 'absolute', inset: 0, background: lastOutcome === 'win' ? 'rgba(74, 124, 89, 0.1)' : lastOutcome === 'lose' ? 'rgba(211, 122, 50, 0.1)' : 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {lastOutcome === 'win' ? <Check size={48} color="var(--color-success)" /> : lastOutcome === 'lose' ? <X size={48} color="var(--color-accent)" /> : <Minus size={48} color="#EAB308" />}
                </div>
              )}
            </div>

            {/* VS divider */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--color-muted)' }}>VS</div>
              {lastOutcome && (
                <div className="slide-up" style={{ background: lastOutcome === 'win' ? 'var(--color-success)' : lastOutcome === 'lose' ? 'var(--color-accent)' : '#EAB308', borderRadius: 8, padding: '4px 10px', color: 'white', fontSize: 10, fontWeight: 900, textAlign: 'center' }}>
                  {lastOutcome.toUpperCase()}
                </div>
              )}
            </div>

            {/* CPU card */}
            <div style={{
              flex: 1, borderRadius: 20, border: `2px solid ${RARITY_BORDER[cpuCard.rarity]}`, background: 'var(--color-card-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(44, 34, 30, 0.05)'
            }}>
              <div style={{ fontSize: 9, color: 'var(--color-accent)', fontWeight: 800, letterSpacing: '0.1em' }}>CPU CARD</div>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${RARITY_BORDER[cpuCard.rarity]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: RARITY_BORDER[cpuCard.rarity], fontWeight: 900, fontSize: 20 }}>
                {cpuCard.name.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text)', textAlign: 'center', padding: '0 8px' }}>
                {cpuCard.name}
              </div>
              {selectedAttr && (
                <div style={{ background: `${ATTR_META[selectedAttr].color}15`, borderRadius: 12, padding: '6px 16px', color: ATTR_META[selectedAttr].color, fontSize: 16, fontWeight: 900 }}>
                  {ATTR_META[selectedAttr].label} {cpuCard.stats[selectedAttr]}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Attribute Controls */}
      {!battleState.isGameOver && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
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
                    background: isSelected ? `${meta.color}15` : 'var(--color-card-bg)',
                    border: `1.5px solid ${isSelected ? meta.color : 'var(--color-border)'}`,
                    borderRadius: 16, padding: '12px 8px', color: isSelected ? meta.color : 'var(--color-text)',
                    cursor: lastOutcome ? 'default' : 'pointer', fontWeight: 800, fontSize: 13, textAlign: 'center',
                    boxShadow: isSelected ? `0 4px 12px ${meta.color}30` : '0 2px 8px rgba(44, 34, 30, 0.05)',
                    transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  }}
                >
                  <IconComp size={20} color={isSelected ? meta.color : 'var(--color-muted)'} />
                  <span style={{ fontSize: 10, color: isSelected ? meta.color : 'var(--color-muted)' }}>{meta.label}</span>
                  <span style={{ fontSize: 14, color: isSelected ? meta.color : 'var(--color-text)' }}>{playerCard[attr]}</span>
                </button>
              );
            })}
          </div>

          {/* Card Hand Selector */}
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
            {PLAYER_CARDS.map((card, i) => (
              <div
                key={card.id}
                onClick={() => setPlayerCardIdx(i)}
                style={{
                  flexShrink: 0, width: 64, borderRadius: 12,
                  border: `2px solid ${i === playerCardIdx ? RARITY_BORDER[card.rarity] : 'var(--color-border)'}`,
                  background: i === playerCardIdx ? `${RARITY_BORDER[card.rarity]}10` : 'var(--color-card-bg)',
                  padding: '8px 4px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(44, 34, 30, 0.05)'
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 900, color: RARITY_BORDER[card.rarity], marginBottom: 4 }}>
                  {card.name.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ fontSize: 9, color: 'var(--color-text)', fontWeight: 800, lineHeight: 1.1 }}>
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
