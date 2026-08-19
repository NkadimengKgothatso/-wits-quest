import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEventTrivia, submitEventAnswer, type CampusEvent, type TriviaQuestion, type Card } from '../services/apiClient';
import { CheckCircle2, X } from 'lucide-react';

interface TriviaModalProps {
  event: CampusEvent;
  onClose: () => void;
  onCardEarned: () => void;
}

export default function TriviaModal({ event, onClose, onCardEarned }: TriviaModalProps) {
  const { currentUser } = useAuth();
  const [trivia, setTrivia] = useState<TriviaQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [selected, setSelected] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [earnedCard, setEarnedCard] = useState<Card | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getEventTrivia(event.id)
      .then((q) => setTrivia(q))
      .catch(() => setLoadError('Could not load this challenge.'))
      .finally(() => setLoading(false));
  }, [event.id]);

  async function handleSubmit() {
    if (!currentUser || !trivia) return;
    if (trivia.questionType === 'mc' && selected === null) return;
    if (trivia.questionType === 'text' && !textAnswer.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const result = await submitEventAnswer(event.id, currentUser.id, {
        selectedIndex: trivia.questionType === 'mc' ? selected ?? undefined : undefined,
        textAnswer: trivia.questionType === 'text' ? textAnswer.trim() : undefined,
      });
      setSubmitted(true);
      setIsCorrect(result.correct);
      if (result.correct) {
        setEarnedCard(result.card ?? null);
        onCardEarned();
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  }

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
          <div style={{ padding: '24px 24px 16px', textAlign: 'center', position: 'relative' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
              Event Challenge
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-muted)' }}>{event.name}</p>
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

          <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--color-muted)' }}>Loading challenge…</p>
            ) : loadError || !trivia ? (
              <>
                <p style={{ textAlign: 'center', color: 'var(--color-danger)', marginBottom: 16 }}>
                  {loadError || 'No trivia question has been set up for this event yet.'}
                </p>
                <button
                  style={{ width: '100%', background: 'var(--color-card-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontWeight: 700, fontSize: 16, padding: '16px', borderRadius: 16 }}
                  onClick={onClose}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Alumni Trivia
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)' }}>
                    +{event.xpAward ?? 100} XP
                  </span>
                </div>

                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.4, marginBottom: 24 }}>
                  {trivia.question}
                </div>

                {trivia.questionType === 'mc' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'auto' }}>
                    {(trivia.options ?? []).map((opt, i) => {
                      const isSelected = selected === i;
                      let bg = 'var(--color-card-bg)';
                      let borderColor = 'var(--color-border)';
                      let color = 'var(--color-text)';

                      if (submitted) {
                        if (isCorrect && isSelected) {
                          bg = 'var(--color-success)';
                          borderColor = 'var(--color-success)';
                          color = '#fff';
                        } else if (!isCorrect && isSelected) {
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
                          {submitted && isCorrect && isSelected && <CheckCircle2 size={20} color="#fff" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ marginBottom: 'auto' }}>
                    <input
                      style={{
                        width: '100%', padding: '16px', borderRadius: 16,
                        border: `1.5px solid ${submitted ? (isCorrect ? 'var(--color-success)' : 'red') : 'var(--color-border)'}`,
                        background: 'var(--color-card-bg)', color: 'var(--color-text)',
                        fontSize: 15, fontWeight: 600, outline: 'none',
                      }}
                      placeholder="Type your answer"
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      disabled={submitted}
                    />
                  </div>
                )}

                {submitError && (
                  <p style={{ color: 'var(--color-danger)', fontSize: 13, fontWeight: 600, marginTop: 12 }}>{submitError}</p>
                )}

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
                        opacity: isSubmitting || (trivia.questionType === 'mc' ? selected === null : !textAnswer.trim()) ? 0.5 : 1,
                        marginBottom: 16
                      }}
                      onClick={handleSubmit}
                      disabled={isSubmitting || (trivia.questionType === 'mc' ? selected === null : !textAnswer.trim())}
                    >
                      {isSubmitting ? 'Checking…' : 'Submit'}
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
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
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

          {earnedCard ? (
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
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-text)', marginBottom: 8 }}>{earnedCard.name}</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{earnedCard.rarity}</div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 32 }}>
              This event has no card reward attached, but your XP and Essence were still awarded.
            </p>
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
