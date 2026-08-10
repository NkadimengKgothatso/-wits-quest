import { useState, useEffect } from 'react';
import { Swords, Shield, Zap, Brain, User, RefreshCw, Radio, Check, Users, Swords as ChallengeIcon } from 'lucide-react';
import { battleSocketClient } from '../utils/websocketClient';

type AttrKey = 'attack' | 'defense' | 'speed' | 'brains';

const ATTR_META: Record<AttrKey, { icon: typeof Swords; label: string; color: string }> = {
  attack: { icon: Swords, label: 'ATK', color: '#f87171' },
  defense: { icon: Shield, label: 'DEF', color: '#60a5fa' },
  speed: { icon: Zap, label: 'SPD', color: '#facc15' },
  brains: { icon: Brain, label: 'BRN', color: '#a78bfa' },
};

interface StudentOpponent {
  id: string;
  username: string;
  level: number;
  divisionTier: string;
  eloRating: number;
}

const AVAILABLE_STUDENTS: StudentOpponent[] = [
  { id: 'usr_thabo', username: 'Thabo_Engineer', level: 4, divisionTier: 'GOLD', eloRating: 1120 },
  { id: 'usr_lesedi', username: 'Lesedi_Grandmaster', level: 12, divisionTier: 'PLATINUM', eloRating: 1650 },
  { id: 'usr_sipho', username: 'Sipho_Tactician', level: 8, divisionTier: 'GOLD', eloRating: 1420 },
];

interface LivePlayerCard {
  id: string;
  name: string;
  rarity: string;
  stats: Record<AttrKey, number>;
}

const DEFAULT_PLAYER_CARDS: LivePlayerCard[] = [
  { id: 'c101', name: 'Great Hall Pillars', rarity: 'Legendary', stats: { attack: 85, defense: 95, speed: 40, brains: 90 } },
  { id: 'c102', name: "Solomon's Torch", rarity: 'Epic', stats: { attack: 90, defense: 70, speed: 85, brains: 88 } },
  { id: 'c103', name: 'Quantum Physics Lab', rarity: 'Rare', stats: { attack: 75, defense: 60, speed: 70, brains: 95 } },
];

export default function LivePvPArena() {
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string }>({
    id: 'usr_kagiso',
    username: 'Kagiso_Scholar',
  });
  const [matchId, setMatchId] = useState('room_live_wits_1');
  const [opponentUser, setOpponentUser] = useState<StudentOpponent>(AVAILABLE_STUDENTS[0]);

  const [roomState, setRoomState] = useState<'WAITING' | 'READY' | 'LOCKED_IN' | 'REVEALED'>('WAITING');
  const [spectators, setSpectators] = useState(0);
  const [turnTime, setTurnTime] = useState(15);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  const [mySelectedCardIdx, setMySelectedCardIdx] = useState(0);
  const [myLockedAttr, setMyLockedAttr] = useState<AttrKey | null>(null);

  const [dualRevealData, setDualRevealData] = useState<{
    myChoice?: { cardId: string; stat: AttrKey };
    opponentChoice?: { cardId: string; stat: AttrKey; cardName: string; statVal: number };
    outcome?: 'win' | 'lose' | 'tie';
  } | null>(null);

  const activeCard = DEFAULT_PLAYER_CARDS[mySelectedCardIdx];

  // 1. Connect & Setup WebSocket Listeners
  useEffect(() => {
    const socket = battleSocketClient.connect();

    // Join room
    battleSocketClient.joinRoom(matchId, currentUser.id, currentUser.username);

    // Listen for room updates and opponent player details
    socket.on('room_state_update', (data: { playerCount: number; spectatorCount: number; players?: { userId: string; username: string }[] }) => {
      setSpectators(data.spectatorCount);

      if (data.players) {
        const opp = data.players.find((p) => p.userId !== currentUser.id);
        if (opp) {
          setOpponentUser({
            id: opp.userId,
            username: opp.username,
            level: 5,
            divisionTier: 'GOLD',
            eloRating: 1200,
          });
        }
      }

      if (data.playerCount >= 2 && roomState === 'WAITING') {
        setRoomState('READY');
      }
    });

    socket.on('battle_start', (data: { players?: { userId: string; username: string }[] }) => {
      if (data.players) {
        const opp = data.players.find((p) => p.userId !== currentUser.id);
        if (opp) {
          setOpponentUser({
            id: opp.userId,
            username: opp.username,
            level: 5,
            divisionTier: 'GOLD',
            eloRating: 1200,
          });
        }
      }
      setRoomState('READY');
    });

    socket.on('round_outcome', (data: any) => {
      const p1 = data.player1Turn;
      const p2 = data.player2Turn;

      const isP1 = p1.userId === currentUser.id;
      const myTurn = isP1 ? p1 : p2;
      const oppTurn = isP1 ? p2 : p1;

      const myVal = activeCard.stats[myTurn.stat as AttrKey] || 80;
      const oppVal = Math.floor(Math.random() * 30) + 70;

      let outcome: 'win' | 'lose' | 'tie' = 'tie';
      if (myVal > oppVal) {
        outcome = 'win';
        setMyScore((s) => s + 1);
      } else if (oppVal > myVal) {
        outcome = 'lose';
        setOpponentScore((s) => s + 1);
      }

      setDualRevealData({
        myChoice: { cardId: myTurn.cardId, stat: myTurn.stat as AttrKey },
        opponentChoice: { cardId: oppTurn.cardId, stat: oppTurn.stat as AttrKey, cardName: 'Opponent Card', statVal: oppVal },
        outcome,
      });

      setRoomState('REVEALED');
    });

    return () => {
      socket.off('room_state_update');
      socket.off('battle_start');
      socket.off('round_outcome');
    };
  }, [matchId, currentUser, mySelectedCardIdx]);

  // Turn Timer
  useEffect(() => {
    if (roomState !== 'READY' || turnTime <= 0) return;
    const timer = setInterval(() => {
      setTurnTime((t) => {
        if (t <= 1) {
          clearInterval(timer);
          if (!myLockedAttr) handleLockInTurn('attack');
          return 15;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [turnTime, roomState, myLockedAttr]);

  function handleSelectOpponentToChallenge(student: StudentOpponent) {
    setOpponentUser(student);
    const newRoomId = `room_pvp_${currentUser.id}_vs_${student.id}`;
    setMatchId(newRoomId);
    setRoomState('WAITING');
    setMyLockedAttr(null);
    setDualRevealData(null);
    setTurnTime(15);
    battleSocketClient.joinRoom(newRoomId, currentUser.id, currentUser.username);
  }

  function handleSwitchUser(account: 'kagiso' | 'thabo') {
    if (account === 'kagiso') {
      setCurrentUser({ id: 'usr_kagiso', username: 'Kagiso_Scholar' });
      setOpponentUser(AVAILABLE_STUDENTS[0]); // Thabo
    } else {
      setCurrentUser({ id: 'usr_thabo', username: 'Thabo_Engineer' });
      setOpponentUser({ id: 'usr_kagiso', username: 'Kagiso_Scholar', level: 5, divisionTier: 'GOLD', eloRating: 1250 });
    }
    setRoomState('WAITING');
    setMyLockedAttr(null);
    setDualRevealData(null);
    setTurnTime(15);
  }

  function handleLockInTurn(stat: AttrKey) {
    if (myLockedAttr || roomState !== 'READY') return;
    setMyLockedAttr(stat);
    setRoomState('LOCKED_IN');
    battleSocketClient.submitTurn(matchId, currentUser.id, activeCard.id, stat);
  }

  function handleNextRound() {
    setMyLockedAttr(null);
    setDualRevealData(null);
    setTurnTime(15);
    setRoomState('READY');
  }

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - turnTime / 15);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 20%, #253d6a 0%, #1d3156 50%, #0f1a2e 100%)',
      paddingTop: 16, paddingBottom: 80,
    }}>
      {/* User Switcher Bar */}
      <div style={{ padding: '0 16px 8px', maxWidth: 600, margin: '0 auto' }}>
        <div className="glass-dark" style={{ padding: 10, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#a4b5d1', display: 'flex', alignItems: 'center', gap: 4 }}>
            <User size={12} color="#60a5fa" /> LOGGED IN AS:
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => handleSwitchUser('kagiso')}
              style={{
                background: currentUser.id === 'usr_kagiso' ? 'rgba(254,214,206,0.25)' : 'transparent',
                border: `1px solid ${currentUser.id === 'usr_kagiso' ? '#fed6ce' : 'rgba(164,181,209,0.2)'}`,
                color: currentUser.id === 'usr_kagiso' ? '#fed6ce' : '#a4b5d1',
                borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Kagiso_Scholar
            </button>
            <button
              onClick={() => handleSwitchUser('thabo')}
              style={{
                background: currentUser.id === 'usr_thabo' ? 'rgba(96,165,250,0.25)' : 'transparent',
                border: `1px solid ${currentUser.id === 'usr_thabo' ? '#60a5fa' : 'rgba(164,181,209,0.2)'}`,
                color: currentUser.id === 'usr_thabo' ? '#60a5fa' : '#a4b5d1',
                borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Thabo_Engineer
            </button>
          </div>
        </div>
      </div>

      {/* Select Opponent to Challenge Bar */}
      <div style={{ padding: '0 16px 14px', maxWidth: 600, margin: '0 auto' }}>
        <div className="glass-dark" style={{ padding: 12, borderRadius: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#fed6ce', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={12} color="#fed6ce" /> SELECT A STUDENT TO CHALLENGE TO LIVE MATCH:
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
            {AVAILABLE_STUDENTS.map((student) => {
              const isSelected = opponentUser.id === student.id;
              return (
                <button
                  key={student.id}
                  onClick={() => handleSelectOpponentToChallenge(student)}
                  style={{
                    flexShrink: 0,
                    background: isSelected ? 'rgba(254,214,206,0.2)' : 'rgba(17,30,54,0.6)',
                    border: `1px solid ${isSelected ? '#fed6ce' : 'rgba(164,181,209,0.25)'}`,
                    color: isSelected ? '#fed6ce' : 'white',
                    borderRadius: 8, padding: '6px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <ChallengeIcon size={12} color={isSelected ? '#fed6ce' : '#a4b5d1'} />
                  <span>{student.username} (Lv.{student.level})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Header bar */}
      <div style={{ padding: '0 16px 14px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Radio size={18} color="#4ade80" /> Live WebSocket Arena
            </h2>
            <div style={{ fontSize: 10, color: '#a4b5d1', marginTop: 2 }}>
              Match: {currentUser.username} vs {opponentUser.username}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: 20, padding: '3px 8px', fontSize: 9, color: '#34d399', fontWeight: 700 }}>
              14ms Ping
            </div>
            <div style={{ background: 'rgba(254,214,206,0.15)', border: '1px solid rgba(254,214,206,0.3)', borderRadius: 20, padding: '3px 8px', fontSize: 9, color: '#fed6ce', fontWeight: 700 }}>
              {spectators} Spectators
            </div>
          </div>
        </div>

        {/* Score Card with Real Names */}
        <div className="glass-dark" style={{ borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 11, color: '#fed6ce', fontWeight: 800 }}>{currentUser.username}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'white' }}>{myScore}</div>
          </div>

          {/* Radial Timer Ring */}
          <div style={{ position: 'relative', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="26" cy="26" r={radius} fill="none" stroke="rgba(164,181,209,0.2)" strokeWidth="4" />
              <circle
                cx="26" cy="26" r={radius} fill="none" stroke="#fed6ce" strokeWidth="4"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <span style={{ position: 'absolute', fontSize: 13, fontWeight: 900, color: '#fed6ce' }}>
              {turnTime}s
            </span>
          </div>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 11, color: '#60a5fa', fontWeight: 800 }}>{opponentUser.username}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'white' }}>{opponentScore}</div>
          </div>
        </div>
      </div>

      {/* Main Arena Content */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto' }}>
        {roomState === 'WAITING' ? (
          <div className="glass-dark" style={{ padding: 28, borderRadius: 16, textAlign: 'center' }}>
            <RefreshCw size={32} color="#60a5fa" className="spin" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>
              Waiting for {opponentUser.username} to Accept & Join...
            </div>
            <div style={{ fontSize: 11, color: '#a4b5d1', marginTop: 4, marginBottom: 14 }}>
              Open a 2nd browser tab as <b>{opponentUser.username}</b>, or click below to start match immediately.
            </div>
            <button
              onClick={() => setRoomState('READY')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: 'none',
                color: 'white', borderRadius: 10, padding: '10px 20px', fontSize: 12, fontWeight: 800, cursor: 'pointer',
              }}
            >
              Start Live Match with {opponentUser.username} →
            </button>
          </div>
        ) : roomState === 'LOCKED_IN' ? (
          <div className="glass-dark" style={{ padding: 28, borderRadius: 16, textAlign: 'center' }}>
            <Check size={32} color="#4ade80" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 15, fontWeight: 800, color: '#4ade80' }}>Your Turn Secret Locked In!</div>
            <div style={{ fontSize: 11, color: '#a4b5d1', marginTop: 4, marginBottom: 14 }}>
              You picked <b>{myLockedAttr?.toUpperCase()}</b> in secret. Waiting for {opponentUser.username} to lock in pick...
            </div>
            <button
              onClick={() => {
                const oppVal = Math.floor(Math.random() * 30) + 70;
                const myVal = activeCard.stats[myLockedAttr || 'attack'];
                const outcome = myVal > oppVal ? 'win' : myVal < oppVal ? 'lose' : 'tie';
                if (outcome === 'win') setMyScore((s) => s + 1);
                else if (outcome === 'lose') setOpponentScore((s) => s + 1);

                setDualRevealData({
                  myChoice: { cardId: activeCard.id, stat: myLockedAttr || 'attack' },
                  opponentChoice: { cardId: 'opp_1', stat: myLockedAttr || 'attack', cardName: 'Solomon\'s Torch', statVal: oppVal },
                  outcome,
                });
                setRoomState('REVEALED');
              }}
              style={{
                background: 'rgba(250,204,21,0.2)', border: '1px solid #facc15',
                color: '#facc15', borderRadius: 10, padding: '10px 20px', fontSize: 11, fontWeight: 800, cursor: 'pointer',
              }}
            >
              Simulate {opponentUser.username} Lock Pick →
            </button>
          </div>
        ) : (
          <div>
            {/* Arena Duel Stage */}
            <div style={{ display: 'flex', gap: 12, height: 230, marginBottom: 14 }}>
              {/* Player Card */}
              <div className="glass-dark" style={{ flex: 1, borderRadius: 16, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fed6ce', position: 'relative' }}>
                <div style={{ fontSize: 9, color: '#fed6ce', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 6 }}>
                  {currentUser.username.toUpperCase()}
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1d3156', border: '2px solid #fed6ce', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fed6ce', fontWeight: 900, fontSize: 14 }}>
                  {activeCard.name.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'white', marginTop: 6, textAlign: 'center' }}>{activeCard.name}</div>
                {dualRevealData?.myChoice && (
                  <div style={{ marginTop: 8, background: 'rgba(254,214,206,0.2)', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800, color: '#fed6ce' }}>
                    {dualRevealData.myChoice.stat.toUpperCase()} {activeCard.stats[dualRevealData.myChoice.stat]}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', fontWeight: 900, color: '#fed6ce', fontSize: 16 }}>VS</div>

              {/* Opponent Card */}
              <div className="glass-dark" style={{ flex: 1, borderRadius: 16, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #60a5fa', position: 'relative' }}>
                <div style={{ fontSize: 9, color: '#60a5fa', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 6 }}>
                  {opponentUser.username.toUpperCase()}
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1d3156', border: '2px solid #60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: 900, fontSize: 14 }}>
                  {opponentUser.username.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'white', marginTop: 6, textAlign: 'center' }}>
                  {dualRevealData?.opponentChoice?.cardName || 'Secret Card'}
                </div>
                {dualRevealData?.opponentChoice && (
                  <div style={{ marginTop: 8, background: 'rgba(96,165,250,0.2)', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800, color: '#60a5fa' }}>
                    {dualRevealData.opponentChoice.stat.toUpperCase()} {dualRevealData.opponentChoice.statVal}
                  </div>
                )}
              </div>
            </div>

            {/* Turn Controls or Reveal Result */}
            {roomState === 'REVEALED' && dualRevealData ? (
              <div className="glass-dark" style={{ borderRadius: 16, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: dualRevealData.outcome === 'win' ? '#4ade80' : dualRevealData.outcome === 'lose' ? '#f87171' : '#facc15', marginBottom: 10 }}>
                  {dualRevealData.outcome === 'win' ? 'ROUND WON' : dualRevealData.outcome === 'lose' ? 'ROUND LOST' : 'DRAW'}
                </div>
                <button
                  onClick={handleNextRound}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white',
                    border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  }}
                >
                  NEXT ROUND →
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(['attack', 'defense', 'speed', 'brains'] as AttrKey[]).map((attr) => {
                  const meta = ATTR_META[attr];
                  const IconComp = meta.icon;
                  return (
                    <button
                      key={attr}
                      onClick={() => handleLockInTurn(attr)}
                      style={{
                        background: 'rgba(73, 104, 148, 0.35)',
                        border: '1.5px solid rgba(164,181,209,0.2)',
                        borderRadius: 12, padding: 12, color: 'white', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <IconComp size={16} color={meta.color} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: meta.color }}>{meta.label}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 900 }}>{activeCard.stats[attr]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1.2s linear infinite; }`}</style>
    </div>
  );
}
