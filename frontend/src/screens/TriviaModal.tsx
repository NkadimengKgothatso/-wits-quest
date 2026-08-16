import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveMockBattleResult } from '../services/mockDbClient';
import { CheckCircle2, X } from 'lucide-react';

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
    question: 'Which Nobel Peace Prize laureate studied law at Wits before going into exile?',
    options: ['Desmond Tutu', 'Nelson Mandela', 'Albert Luthuli', 'F.W. de Klerk'],
    correct: 1,
    card: { name: 'Wits Crest', attack: 70, defense: 75, speed: 60, brains: 85, rarity: 'Rare' },
  },
};

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
          xpAwarded: 250,
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(44, 34, 30, 0.4)',
        backdropFilter: 'blur(4px)',
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
          className="slide-up"
          style={{ 
            width: '100%', 
            maxWidth: 420, 
            background: 'var(--color-bg)',
            borderRadius: 24,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div style={{ padding: '24px 24px 16px', textAlign: 'center', position: 'relative' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
              Event Challenge
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-muted)' }}>{landmark.name}</p>
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 24, right: 24,
                background: 'transparent', border: 'none',
                color: 'var(--color-muted)', cursor: 'pointer',
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Verification Banner */}
          <div style={{
            margin: '0 24px 24px',
            background: 'rgba(74, 124, 89, 0.1)',
            border: '1px solid rgba(74, 124, 89, 0.3)',
            borderRadius: 12,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'var(--color-success)',
            fontSize: 13,
            fontWeight: 600
          }}>
            <CheckCircle2 size={18} />
            Location verified - you're within range
          </div>

          {/* Question Area */}
          <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Alumni Trivia
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)' }}>
                +250 XP
              </span>
            </div>
            
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.4, marginBottom: 24 }}>
              {qdata.question}
            </div>

            {/* Answer options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'auto' }}>
              {qdata.options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrectOption = i === qdata.correct;
                
                let bg = 'var(--color-card-bg)';
                let borderColor = 'var(--color-border)';
                let color = 'var(--color-text)';
                
                if (submitted) {
                  if (isCorrectOption) {
                    bg = 'var(--color-success)';
                    borderColor = 'var(--color-success)';
                    color = '#fff';
                  } else if (isSelected && !isCorrectOption) {
                    borderColor = 'red';
                  }
                } else if (isSelected) {
                  borderColor = 'var(--color-success)';
                  color = 'var(--color-success)';
                }

                return (
                  <button
                    key={i}
                    onClick={() => !submitted && setSelected(i)}
                    style={{
                      background: bg,
                      border: `1.5px solid ${borderColor}`,
                      borderRadius: 16,
                      padding: '16px',
                      color,
                      textAlign: 'left',
                      cursor: submitted ? 'default' : 'pointer',
                      fontWeight: 600,
                      fontSize: 15,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 8px rgba(44, 34, 30, 0.05)'
                    }}
                  >
                    {opt}
                    {submitted && isCorrectOption && <CheckCircle2 size={20} color="#fff" />}
                  </button>
                );
              })}
            </div>

            {/* Action Button & Progress */}
            <div style={{ marginTop: 32 }}>
              {!submitted ? (
                <button
                  style={{ 
                    width: '100%', 
                    background: 'var(--color-accent)', 
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 16, 
                    padding: '16px', 
                    borderRadius: 16,
                    opacity: selected === null ? 0.5 : 1,
                    marginBottom: 16
                  }}
                  onClick={handleSubmit}
                  disabled={selected === null}
                >
                  Submit
                </button>
              ) : isCorrect ? (
                <button
                  style={{ width: '100%', background: 'var(--color-accent)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, padding: '16px', borderRadius: 16, marginBottom: 16 }}
                  onClick={() => setShowReward(true)}
                >
                  Claim Reward
                </button>
              ) : (
                <button
                  style={{ width: '100%', background: 'var(--color-card-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontWeight: 700, fontSize: 16, padding: '16px', borderRadius: 16, marginBottom: 16 }}
                  onClick={onClose}
                >
                  Close
                </button>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--color-muted)', fontWeight: 600 }}>Time Remaining</span>
                <div style={{ flex: 1, height: 4, background: 'var(--color-border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: '75%', height: '100%', background: 'var(--color-accent)' }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-accent)', fontWeight: 700 }}>19s</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Card Reward Modal (Keeping logic but simplifying UI to match new theme) */
        <div
          className="slide-up"
          style={{ width: '100%', maxWidth: 360, background: 'var(--color-bg)', padding: 32, borderRadius: 24, textAlign: 'center' }}
        >
          <div style={{ fontSize: 14, color: 'var(--color-accent)', fontWeight: 800, marginBottom: 8, letterSpacing: '0.1em' }}>
            CARD UNLOCKED
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 24 }}>
            Added to your collection
          </div>

          <div
            style={{
              width: 200,
              margin: '0 auto 32px',
              borderRadius: 16,
              background: 'var(--color-card-bg)',
              border: `2px solid var(--color-accent)`,
              padding: 24,
              boxShadow: '0 8px 24px rgba(211, 122, 50, 0.2)'
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-text)', marginBottom: 8 }}>{card.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{card.rarity}</div>
          </div>

          <button 
            style={{ width: '100%', background: 'var(--color-accent)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, padding: '16px', borderRadius: 16 }}
            onClick={onClose}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
