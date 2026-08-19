import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNextTrivia, submitTriviaAnswer } from '../services/apiClient';
import { CheckCircle2, X, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Landmark {
  id: string; // eventId
  name: string;
}

interface TriviaModalProps {
  landmark: Landmark;
  onClose: () => void;
  onCardEarned: () => void;
}

export default function TriviaModal({ landmark, onClose, onCardEarned }: TriviaModalProps) {
  const { currentUser } = useAuth();
  
  const [trivia, setTrivia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [textAns, setTextAns] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    getNextTrivia(landmark.id)
      .then(data => {
        setTrivia(data);
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg(err.message || 'No trivia available here.');
        setLoading(false);
      });
  }, [landmark.id]);

  async function handleSubmit() {
    if (!trivia) return;
    
    let answer: string | number;
    if (trivia.questionType === 'mc') {
      if (selectedOpt === null) return;
      answer = selectedOpt;
    } else {
      if (!textAns.trim()) return;
      answer = textAns.trim();
    }

    setSubmitting(true);
    try {
      const res = await submitTriviaAnswer(trivia.id, answer);
      setResult(res);
      window.dispatchEvent(new Event('triviaCompleted'));
      
      if (res.isCorrect) {
        setTimeout(() => {
          setShowReward(true);
          onCardEarned();
        }, 1500);
      } else {
        setTimeout(() => {
          setShowReward(true);
        }, 2500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  }

  const isMC = trivia?.questionType === 'mc';
  const hasAnswered = result !== null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(44, 34, 30, 0.6)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {!showReward ? (
        <div
          className="slide-up"
          style={{ 
            width: '100%', maxWidth: 440, background: 'var(--color-bg)',
            borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
          }}
        >
          {/* Header */}
          <div style={{ padding: '24px 24px 16px', textAlign: 'center', position: 'relative' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 4px' }}>
              Campus Challenge
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: 0 }}>{landmark.name}</p>
            {!hasAnswered && !submitting && (
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
            )}
          </div>

          {loading ? (
            <div style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Loader2 size={32} className="spin" color="var(--color-accent)" />
              <div style={{ color: 'var(--color-muted)', fontWeight: 600 }}>Scouting area...</div>
            </div>
          ) : errorMsg ? (
            <div style={{ padding: '0 24px 32px', textAlign: 'center' }}>
              <div style={{ color: 'var(--color-muted)', marginBottom: 24, padding: 24, background: 'var(--color-card-bg)', borderRadius: 16 }}>
                <AlertCircle size={32} style={{ marginBottom: 12 }} />
                <div style={{ fontWeight: 600 }}>{errorMsg}</div>
              </div>
              <button
                style={{ width: '100%', background: 'var(--color-accent)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, padding: '16px', borderRadius: 16 }}
                onClick={onClose}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Verification Banner */}
              <div style={{
                margin: '0 24px 24px',
                background: 'rgba(74, 124, 89, 0.1)', border: '1px solid rgba(74, 124, 89, 0.3)', borderRadius: 12,
                padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12,
                color: 'var(--color-success)', fontSize: 13, fontWeight: 600
              }}>
                <CheckCircle2 size={18} />
                Location verified - you're within range
              </div>

              {/* Question Area */}
              <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.4, marginBottom: 24 }}>
                  {trivia.question}
                </div>

                {/* Answers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'auto' }}>
                  {isMC ? (
                    trivia.options.map((opt: string, i: number) => {
                      const isSelected = selectedOpt === i;
                      
                      let bg = 'var(--color-card-bg)';
                      let borderColor = 'var(--color-border)';
                      let color = 'var(--color-text)';
                      
                      if (hasAnswered) {
                        if (result.isCorrect && isSelected) {
                          bg = 'var(--color-success)'; borderColor = 'var(--color-success)'; color = '#fff';
                        } else if (!result.isCorrect && isSelected) {
                          bg = 'var(--color-danger)'; borderColor = 'var(--color-danger)'; color = '#fff';
                        }
                      } else if (isSelected) {
                        borderColor = 'var(--color-accent)'; color = 'var(--color-accent)';
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => !hasAnswered && setSelectedOpt(i)}
                          style={{
                            background: bg, border: `2px solid ${borderColor}`, borderRadius: 16,
                            padding: '16px', color, textAlign: 'left',
                            cursor: hasAnswered ? 'default' : 'pointer',
                            fontWeight: 600, fontSize: 15, transition: 'all 0.2s',
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })
                  ) : (
                    <input
                      style={{
                        width: '100%', padding: '16px', borderRadius: 16,
                        border: '2px solid var(--color-border)', background: 'var(--color-card-bg)',
                        color: 'var(--color-text)', outline: 'none', fontSize: 16, fontWeight: 600,
                        boxSizing: 'border-box'
                      }}
                      placeholder="Type your answer..."
                      value={textAns}
                      onChange={(e) => !hasAnswered && setTextAns(e.target.value)}
                      disabled={hasAnswered}
                    />
                  )}
                </div>

                {/* Result Message (shown before transitioning to reward) */}
                {hasAnswered && (
                  <div style={{
                    marginTop: 16, padding: 16, borderRadius: 12,
                    background: result.isCorrect ? 'rgba(74, 124, 89, 0.1)' : 'rgba(179, 38, 30, 0.1)',
                    color: result.isCorrect ? 'var(--color-success)' : 'var(--color-danger)',
                    fontWeight: 700, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', textAlign: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {result.isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                      {result.isCorrect ? 'Correct!' : 'Incorrect!'}
                    </div>
                    {!result.isCorrect && (
                      <div style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 600 }}>
                        The answer was: <strong style={{ color: 'var(--color-success)' }}>{result.correctAnswer}</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Button */}
                {!hasAnswered && (
                  <div style={{ marginTop: 24 }}>
                    <button
                      style={{ 
                        width: '100%', background: 'var(--color-accent)', color: '#fff', border: 'none',
                        fontWeight: 700, fontSize: 16, padding: '16px', borderRadius: 16,
                        opacity: (isMC ? selectedOpt === null : !textAns.trim()) || submitting ? 0.5 : 1,
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
                      }}
                      onClick={handleSubmit}
                      disabled={(isMC ? selectedOpt === null : !textAns.trim()) || submitting}
                    >
                      {submitting ? <Loader2 size={20} className="spin" /> : 'Submit Answer'}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Reward / Failure Modal */
        <div
          className="slide-up"
          style={{ width: '100%', maxWidth: 360, background: 'var(--color-bg)', padding: 32, borderRadius: 24, textAlign: 'center', position: 'relative' }}
        >
          <style>{`
            @keyframes card-bounce-win {
              0% { transform: scale(0.3) translateY(100px); opacity: 0; }
              50% { transform: scale(1.1) translateY(-20px); opacity: 1; }
              70% { transform: scale(0.95) translateY(5px); }
              100% { transform: scale(1) translateY(0); }
            }
            .animate-card-win {
              animation: card-bounce-win 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
          `}</style>
          <div style={{ 
            fontSize: 14, fontWeight: 900, marginBottom: 16, letterSpacing: '0.15em',
            color: result.isCorrect ? 'var(--color-success)' : 'var(--color-danger)',
            textTransform: 'uppercase'
          }}>
            {result.isCorrect ? '✨ Challenge Conquered ✨' : 'Challenge Failed'}
          </div>
          
          {result.isCorrect ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
              {result.xpAwarded > 0 && (
                <div style={{ background: 'rgba(211, 122, 50, 0.1)', color: 'var(--color-accent)', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 800 }}>
                  +{result.xpAwarded} XP
                </div>
              )}
              {result.essenceAwarded > 0 && (
                <div style={{ background: 'rgba(143, 174, 110, 0.1)', color: '#8fae6e', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 800 }}>
                  +{result.essenceAwarded} Essence
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 24, fontWeight: 600, lineHeight: 1.4 }}>
              You missed out on this card.<br/>Better luck next time!
            </div>
          )}

          {result.cardReward && (
            <div
              className={result.isCorrect ? 'animate-card-win' : ''}
              style={{
                width: 200, margin: '0 auto 32px', borderRadius: 16, overflow: 'hidden',
                background: result.isCorrect ? 'linear-gradient(135deg, #f5ecd7 0%, #e8d9b8 100%)' : 'rgba(0,0,0,0.05)',
                border: `3px solid ${result.isCorrect ? 'var(--color-accent)' : 'var(--color-border)'}`,
                boxShadow: result.isCorrect ? '0 16px 32px rgba(211, 122, 50, 0.3)' : 'none',
                filter: result.isCorrect ? 'none' : 'grayscale(100%) opacity(0.5)',
                display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ 
                height: 140, width: '100%', 
                background: result.isCorrect ? 'rgba(211, 122, 50, 0.2)' : 'var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
              }}>
                {result.cardReward.imageUrl ? (
                  <img src={result.cardReward.imageUrl} alt={result.cardReward.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: 40, opacity: 0.2 }}>🖼️</div>
                )}
              </div>
              <div style={{ padding: '16px 12px', background: 'var(--color-card-bg)', flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--color-text)', marginBottom: 4, lineHeight: 1.1 }}>
                  {result.cardReward.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {result.cardReward.rarity}
                </div>
              </div>
            </div>
          )}

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
