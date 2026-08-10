import { useState, useEffect } from 'react';
import { Swords, Shield, Zap, Brain, User, RefreshCw, Radio, Check, Users, Swords as ChallengeIcon, Search } from 'lucide-react';
import { battleSocketClient } from '../utils/websocketClient';
import { useAuth } from '../context/AuthContext';
import { saveMockBattleResult, MockUser } from '../services/mockDbClient';
import StudentOpponentDrawer from '../components/StudentOpponentDrawer';

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
  name?: string;
  initials?: string;
  isOnline?: boolean;
}

const AVAILABLE_STUDENTS: StudentOpponent[] = [
  { id: 'usr_thabo', username: 'Thabo_Engineer', level: 4, divisionTier: 'GOLD', eloRating: 1120 },
  { id: 'usr_kagiso', username: 'Kagiso_Scholar', level: 5, divisionTier: 'GOLD', eloRating: 1250 },
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
  { id: 'c104', name: 'Wits Springbok', rarity: 'Common', stats: { attack: 72, defense: 55, speed: 92, brains: 60 } },
  { id: 'c105', name: 'Ancient Tome', rarity: 'Epic', stats: { attack: 55, defense: 72, speed: 30, brains: 99 } },
];

function getCanonicalMatchId(id1: string, id2: string): string {
  const sorted = [id1, id2].sort();
  return `room_pvp_${sorted[0]}_vs_${sorted[1]}`;
}

export default function LivePvPArena() {
  const { currentUser: authUser, updateUserLocally } = useAuth();
  const currentUser = authUser
    ? { id: authUser.id, username: authUser.username }
    : { id: 'usr_kagiso', username: 'Kagiso_Scholar' };

  const defaultOpponent = AVAILABLE_STUDENTS.find((s) => s.id !== currentUser.id) || AVAILABLE_STUDENTS[0];
  const initialRoomId = getCanonicalMatchId(currentUser.id, defaultOpponent.id);
  const [matchId, setMatchId] = useState(initialRoomId);
  const [opponentUser, setOpponentUser] = useState<StudentOpponent>(defaultOpponent);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

      const myVal = myTurn.statVal !== undefined ? Number(myTurn.statVal) : (activeCard.stats[myTurn.stat as AttrKey] || 80);
      const oppVal = oppTurn.statVal !== undefined ? Number(oppTurn.statVal) : 75;

      let outcome: 'win' | 'lose' | 'tie' = 'tie';
      let updatedMyScore = myScore;
      let updatedOppScore = opponentScore;

      if (myVal > oppVal) {
        outcome = 'win';
        updatedMyScore = myScore + 1;
        setMyScore(updatedMyScore);
      } else if (oppVal > myVal) {
        outcome = 'lose';
        updatedOppScore = opponentScore + 1;
        setOpponentScore(updatedOppScore);
      }

      setDualRevealData({
        myChoice: { cardId: myTurn.cardId, stat: myTurn.stat as AttrKey },
        opponentChoice: {
          cardId: oppTurn.cardId,
          stat: oppTurn.stat as AttrKey,
          cardName: oppTurn.cardName || 'Opponent Card',
          statVal: oppVal,
        },
        outcome,
      });

      setRoomState('REVEALED');

      // Check if 5-round match has completed or a player won best-of-5 (3 points)
      const isMatchFinished = data.roundNumber >= 5 || updatedMyScore >= 3 || updatedOppScore >= 3;
      if (isMatchFinished) {
        const matchOutcome: 'win' | 'lose' | 'tie' =
          updatedMyScore > updatedOppScore ? 'win' : updatedMyScore < updatedOppScore ? 'lose' : 'tie';

        saveMockBattleResult({
          userId: currentUser.id,
          matchType: 'LIVE_PVP',
          opponentId: opponentUser.id,
          outcome: matchOutcome,
          xpAwarded: matchOutcome === 'win' ? 150 : matchOutcome === 'tie' ? 0 : -30,
          essenceAwarded: matchOutcome === 'win' ? 40 : matchOutcome === 'tie' ? 15 : 0,
          eloDelta: matchOutcome === 'win' ? 25 : matchOutcome === 'lose' ? -25 : 0,
        }).then((updatedUser) => {
          if (updatedUser) updateUserLocally(updatedUser);
        });
      }
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
          return 15;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [turnTime, roomState]);

  function handleSelectOpponentFromDrawer(student: MockUser) {
    const opp: StudentOpponent = {
      id: student.id,
      username: student.username,
      level: student.level,
      divisionTier: student.divisionTier,
      eloRating: student.eloRating,
      name: student.name,
      initials: student.initials,
      isOnline: student.isOnline,
    };
    setOpponentUser(opp);
    const newRoomId = getCanonicalMatchId(currentUser.id, student.id);
    setMatchId(newRoomId);
    setRoomState('WAITING');
    setMyLockedAttr(null);
    setDualRevealData(null);
    setTurnTime(15);
    battleSocketClient.joinRoom(newRoomId, currentUser.id, currentUser.username);
  }

  function handleLockInTurn(stat: AttrKey) {
    if (myLockedAttr || roomState !== 'READY') return;
    setMyLockedAttr(stat);
    setRoomState('LOCKED_IN');
    const statVal = activeCard.stats[stat] || 80;
    battleSocketClient.submitTurn(
      matchId,
      currentUser.id,
      activeCard.id,
      stat,
      activeCard.name,
      statVal
    );
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
      {/* Active User Status Banner */}
      <div style={{ padding: '0 16px 8px', maxWidth: 600, margin: '0 auto' }}>
        <div className="glass-dark" style={{ padding: 10, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#a4b5d1', display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={14} color="#fed6ce" />
            <span>ACTIVE ARENA PLAYER:</span>
            <span style={{ color: '#fed6ce', fontWeight: 800 }}>{currentUser.username}</span>
          </div>
          <div style={{ fontSize: 10, background: 'rgba(254,214,206,0.15)', color: '#fed6ce', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
            {authUser?.divisionTier || 'GOLD'} TIER ({authUser?.eloRating || 1000} ELO)
          </div>
        </div>
      </div>

      {/* UX Student Opponent Selection Bar */}
      <div style={{ padding: '0 16px 14px', maxWidth: 600, margin: '0 auto' }}>
        <div className="glass-dark" style={{ padding: 14, borderRadius: 14, border: '1px solid rgba(254, 214, 206, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #496894, #1d3156)',
              border: '2px solid #fed6ce', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, color: '#fed6ce', fontSize: 12, flexShrink: 0
            }}>
              {opponentUser.initials || opponentUser.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#a4b5d1', fontWeight: 700, letterSpacing: '0.05em' }}>TARGETED OPPONENT</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{opponentUser.name || opponentUser.username}</span>
                <span style={{ fontSize: 9, background: 'rgba(254,214,206,0.2)', color: '#fed6ce', padding: '1px 5px', borderRadius: 4 }}>
                  {opponentUser.divisionTier}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(254,214,206,0.25), rgba(73,104,148,0.4))',
              border: '1px solid #fed6ce',
              color: '#fed6ce',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 0 12px rgba(254,214,206,0.25)',
              transition: 'all 0.2s',
            }}
          >
            <Search size={14} />
            <span>Choose Opponent</span>
          </button>
        </div>
      </div>

      {/* Student Directory Side Drawer */}
      <StudentOpponentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentUserId={currentUser.id}
        selectedOpponentId={opponentUser.id}
        onSelectStudent={handleSelectOpponentFromDrawer}
      />

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
            <Check size={32} color="#4ade80" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: 15, fontWeight: 800, color: '#4ade80' }}>Card Submitted!</div>
            <div style={{ fontSize: 11, color: '#a4b5d1', marginTop: 4 }}>
              You selected <b>{activeCard.name}</b> ({myLockedAttr?.toUpperCase()}: {activeCard.stats[myLockedAttr || 'attack']}).
            </div>
            <div style={{ fontSize: 11, color: '#fed6ce', fontWeight: 700, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <RefreshCw size={14} className="spin" />
              Waiting for {opponentUser.username} to select...
            </div>
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
                <div style={{ fontSize: 9, color: activeCard.rarity === 'Legendary' ? '#fed6ce' : activeCard.rarity === 'Epic' ? '#a78bfa' : '#60a5fa', fontWeight: 800, textTransform: 'uppercase', marginTop: 2 }}>
                  {activeCard.rarity}
                </div>
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
              <div>
                {/* Deck Card Switcher Carousel */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#fed6ce', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>CHOOSE CARD TO PLAY:</span>
                    <span style={{ color: '#a4b5d1', fontWeight: 600 }}>{mySelectedCardIdx + 1} of {DEFAULT_PLAYER_CARDS.length} Selected</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                    {DEFAULT_PLAYER_CARDS.map((card, idx) => {
                      const isSelected = idx === mySelectedCardIdx;
                      const rarityColor = card.rarity === 'Legendary' ? '#fed6ce' : card.rarity === 'Epic' ? '#a78bfa' : card.rarity === 'Rare' ? '#60a5fa' : '#a4b5d1';
                      return (
                        <button
                          key={card.id}
                          onClick={() => setMySelectedCardIdx(idx)}
                          style={{
                            flex: '0 0 110px',
                            background: isSelected ? 'rgba(254,214,206,0.18)' : 'rgba(17, 30, 54, 0.65)',
                            border: isSelected ? `2px solid ${rarityColor}` : '1px solid rgba(164,181,209,0.2)',
                            borderRadius: 12,
                            padding: 8,
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? `0 0 12px ${rarityColor}40` : 'none',
                          }}
                        >
                          <div style={{ fontSize: 9, color: rarityColor, fontWeight: 800, textTransform: 'uppercase' }}>
                            {card.rarity}
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: 'white', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {card.name}
                          </div>
                          <div style={{ fontSize: 9, color: '#a4b5d1', marginTop: 4, display: 'flex', justifyContent: 'space-around' }}>
                            <span>ATK:{card.stats.attack}</span>
                            <span>DEF:{card.stats.defense}</span>
                          </div>
                          {isSelected && (
                            <div style={{ fontSize: 8, background: rarityColor, color: '#0f1a2e', fontWeight: 900, borderRadius: 4, padding: '1px 0', marginTop: 4 }}>
                              ACTIVE
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Attribute Stat Lock In Buttons */}
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
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1.2s linear infinite; }`}</style>
    </div>
  );
}
