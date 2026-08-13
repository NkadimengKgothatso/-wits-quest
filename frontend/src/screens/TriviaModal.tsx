import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveMockBattleResult } from '../services/mockDbClient';

interface Landmark {
  id: string;
  name: string;
  category: string;
  distance: number;
  rarity: string;
  cardName: string;
}

interface TriviaModalProps {
  landmark: Landmark;
  onClose: () => void;
  onCardEarned: () => void;
}

const QUESTIONS: Record<string, {
  question: string;
  options: string[];
  correct: number;
  card: { name: string; attack: number; defense: number; speed: number; brains: number; rarity: string };
}> = {
  'great-hall': {
    question: 'In which year was the iconic Wits Great Hall inaugurated?',
    options: ['1937', '1954', '1963', '1972'],
    correct: 1,
    card: { name: 'Great Hall Pillars', attack: 85, defense: 95, speed: 40, brains: 90, rarity: 'Legendary' },
  },
  'solomon': {
    question: 'Solomon Mahlangu was a prominent activist in which anti-apartheid movement?',
    options: ['PAC', 'ANC/MK', 'AZAPO', 'BCM'],
    correct: 1,
    card: { name: "Solomon's Torch", attack: 90, defense: 70, speed: 85, brains: 88, rarity: 'Epic' },
  },
  'senate-house': {
    question: 'What function did Senate House originally serve when constructed?',
    options: ['Student residence', 'Central administration', 'Medical faculty', 'Engineering labs'],
    correct: 1,
    card: { name: 'Senate Seal', attack: 60, defense: 88, speed: 45, brains: 92, rarity: 'Rare' },
  },
  default: {
    question: 'Wits University was formally established in which year?',
    options: ['1896', '1904', '1922', '1934'],
    correct: 2,
    card: { name: 'Wits Crest', attack: 70, defense: 75, speed: 60, brains: 85, rarity: 'Rare' },
  },
};

const STAT_COLORS: Record<string, string> = {
  attack: '#f87171',
  defense: '#60a5fa',
  speed: '#facc15',
  brains: '#a78bfa',
};

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#a4b5d1', fontWeight: 700 }}>
          {label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{value}</span>
      </div>
      <div className="stat-bar-track">
        <div
          className="stat-bar-fill"
          style={{ width: `${value}%`, background: color, boxShadow: `0 0 6px ${color}60` }}
        />
      </div>
    </div>
  );
}

export default function TriviaModal({ landmark, onClose, onCardEarned }: TriviaModalProps) {
  const { currentUser, updateUserLocally } = useAuth();
  const qdata = QUESTIONS[landmark.id] ?? QUESTIONS.default;
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showReward, setShowReward] = useState(false);

  function handleSubmit() {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === qdata.correct) {
      if (currentUser) {
        saveMockBattleResult({
          userId: currentUser.id,
          matchType: 'CPU',
          opponentId: 'TRIVIA_CHALLENGE',
          outcome: 'win',
          xpAwarded: 50,
          essenceAwarded: 15,
          eloDelta: 10,
        }).then((updatedUser) => {
          if (updatedUser) updateUserLocally(updatedUser);
        });
      }
      setTimeout(() => {
        setShowReward(true);
        onCardEarned();
      }, 800);
    }
  }

  const card = qdata.card;
  const isCorrect = submitted && selected === qdata.correct;
  const isWrong = submitted && selected !== qdata.correct;

  const rarityBorderColor = {
    Legendary: '#fed6ce',
    Epic: '#a78bfa',
    Rare: '#60a5fa',
    Common: '#a4b5d1',
  }[card.rarity] ?? '#a4b5d1';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(13, 22, 45, 0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {!showReward ? (
        <div
          className="glass-modal slide-up"
          style={{ width: '100%', maxWidth: 420, overflow: 'hidden' }}
        >
          {/* Header image */}
          <div style={{
            height: 140,
            background: 'linear-gradient(135deg, #253d6a 0%, #1a2e4a 60%, #111e36 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Architectural SVG background */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3 }}>
              {[15, 25, 35, 45, 55, 65, 75, 85].map((x, i) => (
                <rect key={i} x={`${x}%`} y="20%" width="4%" height="80%" fill="#a4b5d1" rx="2" />
              ))}
              <polygon points="10%,20% 50%,2% 90%,20%" fill="none" stroke="#a4b5d1" strokeWidth="2" />
              <rect x="5%" y="85%" width="90%" height="4%" fill="#a4b5d1" rx="1" />
            </svg>
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 40%, rgba(17,30,54,0.9) 100%)',
            }} />
            {/* Badges */}
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
              <span className="badge" style={{ background: 'rgba(254, 214, 206, 0.15)', color: '#fed6ce', border: '1px solid rgba(254, 214, 206, 0.4)', fontSize: 10 }}>
                IN-RANGE VERIFIED ({landmark.distance}m)
              </span>
            </div>
            <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
              <span className="badge" style={{ background: 'rgba(176, 203, 230, 0.2)', color: '#b0cbe6', fontSize: 10 }}>
                {landmark.category.toUpperCase()}
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'white', marginTop: 4 }}>
                {landmark.name}
              </div>
            </div>
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(29, 49, 86, 0.7)', border: 'none',
                borderRadius: '50%', width: 28, height: 28,
                color: '#a4b5d1', cursor: 'pointer', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          {/* Question */}
          <div style={{ padding: '20px 24px 24px' }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'white', lineHeight: 1.4, marginBottom: 16 }}>
              {qdata.question}
            </div>

            {/* Answer options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {qdata.options.map((opt, i) => {
                let borderColor = 'rgba(164, 181, 209, 0.3)';
                let bg = 'rgba(29, 49, 86, 0.6)';
                let color = 'white';

                if (submitted) {
                  if (i === qdata.correct) {
                    borderColor = 'rgba(254, 214, 206, 0.8)';
                    bg = 'rgba(254, 214, 206, 0.15)';
                    color = '#fed6ce';
                  } else if (i === selected && i !== qdata.correct) {
                    borderColor = 'rgba(164, 181, 209, 0.5)';
                    bg = 'rgba(73, 104, 148, 0.3)';
                    color = '#a4b5d1';
                  }
                } else if (selected === i) {
                  borderColor = 'rgba(176, 203, 230, 0.8)';
                  bg = 'rgba(176, 203, 230, 0.15)';
                  color = '#b0cbe6';
                }

                return (
                  <button
                    key={i}
                    onClick={() => !submitted && setSelected(i)}
                    style={{
                      background: bg,
                      border: `1.5px solid ${borderColor}`,
                      borderRadius: 12,
                      padding: '12px 16px',
                      color,
                      textAlign: 'left',
                      cursor: submitted ? 'default' : 'pointer',
                      fontWeight: 600,
                      fontSize: 14,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: selected === i && !submitted ? 'rgba(176, 203, 230, 0.3)' : 'rgba(73, 104, 148, 0.4)',
                      border: `1.5px solid ${borderColor}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, flexShrink: 0,
                    }}>
                      {submitted && i === qdata.correct ? '✓' : submitted && i === selected ? '✕' : String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {isWrong && (
              <div style={{
                background: 'rgba(73, 104, 148, 0.3)', border: '1px solid rgba(164, 181, 209, 0.3)',
                borderRadius: 10, padding: '10px 14px', color: '#a4b5d1', fontSize: 13, marginBottom: 16,
              }}>
                Incorrect — Visit this landmark again to retry the challenge.
              </div>
            )}

            {!submitted ? (
              <button
                className="btn-peach"
                style={{ width: '100%', fontSize: 15, padding: '14px', opacity: selected === null ? 0.5 : 1, borderRadius: 10 }}
                onClick={handleSubmit}
                disabled={selected === null}
              >
                Submit Answer
              </button>
            ) : isCorrect ? (
              <button
                className="btn-peach"
                style={{ width: '100%', fontSize: 15, padding: '14px', borderRadius: 10 }}
                onClick={() => setShowReward(true)}
              >
                Claim Your Card Reward
              </button>
            ) : (
              <button className="btn-ghost" style={{ width: '100%', fontSize: 15, padding: '14px', borderRadius: 10 }} onClick={onClose}>
                Close
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Card Reward Modal */
        <div
          className="glass-modal slide-up"
          style={{ width: '100%', maxWidth: 360, padding: 28, textAlign: 'center' }}
        >
          <div style={{ fontSize: 13, color: '#fed6ce', fontWeight: 800, marginBottom: 8, letterSpacing: '0.1em' }}>
            CARD UNLOCKED
          </div>
          <div style={{ fontSize: 11, color: '#a4b5d1', marginBottom: 20 }}>
            Added to your collection
          </div>

          {/* Card */}
          <div
            className={`card-flip card-legendary`}
            style={{
              width: 220,
              margin: '0 auto 24px',
              borderRadius: 16,
              border: `2px solid ${rarityBorderColor}`,
              background: 'linear-gradient(135deg, #1d3156 0%, #253d6a 100%)',
              overflow: 'hidden',
              boxShadow: `0 0 32px ${rarityBorderColor}60`,
            }}
          >
            {/* Card top bar */}
            <div style={{
              padding: '8px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `1px solid ${rarityBorderColor}30`,
            }}>
              <span className="badge" style={{
                background: `${rarityBorderColor}20`,
                color: rarityBorderColor,
                fontSize: 9,
              }}>
                {card.rarity.toUpperCase()}
              </span>
              <span style={{ fontSize: 9, color: '#a4b5d1' }}>Landmarks</span>
            </div>

            {/* Card artwork emblem */}
            <div style={{
              height: 110,
              background: 'linear-gradient(135deg, #253d6a 0%, #1a2e4a 60%, #111e36 100%)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div className="float" style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(29, 49, 86, 0.8)', border: `2px solid ${rarityBorderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: rarityBorderColor, fontWeight: 900, fontSize: 16 }}>
                {card.name.substring(0, 2).toUpperCase()}
              </div>
              {/* Glow aura */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse at center, ${rarityBorderColor}12 0%, transparent 70%)`,
              }} />
            </div>

            {/* Card name */}
            <div style={{ padding: '8px 12px', borderBottom: `1px solid ${rarityBorderColor}20` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{card.name}</div>
            </div>

            {/* Stats */}
            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <StatBar label="ATK" value={card.attack} color={STAT_COLORS.attack} />
              <StatBar label="DEF" value={card.defense} color={STAT_COLORS.defense} />
              <StatBar label="SPD" value={card.speed} color={STAT_COLORS.speed} />
              <StatBar label="BRN" value={card.brains} color={STAT_COLORS.brains} />
            </div>
          </div>

          <div style={{ fontSize: 13, color: '#a4b5d1', marginBottom: 20 }}>
            +50 Essence · +320 XP
          </div>

          <button className="btn-peach" style={{ width: '100%', fontSize: 15, padding: '14px', borderRadius: 10 }} onClick={onClose}>
            Continue Exploring
          </button>
        </div>
      )}
    </div>
  );
}
