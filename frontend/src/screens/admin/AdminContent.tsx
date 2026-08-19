import { useState, useEffect } from 'react';
import { RARITY_TARGET_RANGE } from '../../services/cardCatalogService';
import type { Card } from '../../types/card';
import { publishCard, publishTrivia, getEvents, CampusEvent, createAvatar } from '../../services/apiClient';
import { CheckCircle, XCircle, Image as ImageIcon, Swords, Shield, Zap, Brain, PenTool, HelpCircle, User, Save, UploadCloud } from 'lucide-react';

type ContentTab = 'trivia' | 'card' | 'avatar';
type CardCategory = 'Science' | 'History' | 'Landmarks' | 'Lifestyle' | 'Sports';
type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

interface Draft {
  id: number;
  type: ContentTab;
  label: string;
  savedAt: string;
}

const RARITY_COLORS: Record<CardRarity, string> = {
  Common: '#8A7B72',
  Rare: '#6b7d2c',
  Epic: '#c99255',
  Legendary: '#dca668',
};

const STAT_META = [
  { key: 'attack', label: 'Attack', icon: Swords, color: '#e8a6a6' },
  { key: 'defense', label: 'Defense', icon: Shield, color: '#dca668' },
  { key: 'speed', label: 'Speed', icon: Zap, color: '#e8c98f' },
  { key: 'brains', label: 'Brains', icon: Brain, color: '#8fae6e' },
] as const;

export default function AdminContent() {
  const [tab, setTab] = useState<ContentTab>('trivia');
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Trivia State
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [questionType, setQuestionType] = useState<'mc' | 'text'>('mc');
  const [questionText, setQuestionText] = useState('');
  const [mcOptions, setMcOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [textAnswer, setTextAnswer] = useState('');

  // Card State
  const [cardForm, setCardForm] = useState<{
    title: string;
    category: Card['category'];
    rarity: Card['rarity'];
    attack: number;
    defense: number;
    speed: number;
    brains: number;
    imageUrl?: string;
  }>({
    title: '',
    category: 'Landmarks',
    rarity: 'Common',
    attack: 50,
    defense: 50,
    speed: 50,
    brains: 50,
    imageUrl: '',
  });

  // Avatar State
  const [avatarForm, setAvatarForm] = useState({
    label: '',
    emoji: '',
  });

  const [drafts, setDrafts] = useState<Draft[]>([]);

  const cardTotalCost = cardForm.attack + cardForm.defense + cardForm.speed + cardForm.brains;
  const [targetMin, targetMax] = RARITY_TARGET_RANGE[cardForm.rarity];
  const costInRange = cardTotalCost >= targetMin && cardTotalCost <= targetMax;

  useEffect(() => {
    getEvents(true)
      .then((data) => {
        setEvents(data);
        if (data.length > 0) setSelectedEventId(data[0].id);
      })
      .catch(console.error);
  }, []);

  async function handleSave() {
    setErrorMsg('');
    setSavedMsg('');
    setIsSaving(true);

    try {
      if (tab === 'trivia') {
        if (!selectedEventId) throw new Error('You must select an event.');
        if (!questionText.trim()) throw new Error('Question text is required.');

        let finalCorrectAnswer = '';
        if (questionType === 'mc') {
          if (mcOptions.some((opt) => !opt.trim())) throw new Error('All multiple choice options must be filled.');
          finalCorrectAnswer = mcOptions[correctIndex].trim();
        } else {
          if (!textAnswer.trim()) throw new Error('Accepted answers are required.');
          finalCorrectAnswer = textAnswer.trim();
        }

        await publishTrivia({
          eventId: selectedEventId,
          question: questionText.trim(),
          questionType,
          options: questionType === 'mc' ? mcOptions.map((o) => o.trim()) : undefined,
          correctAnswer: finalCorrectAnswer,
        });

        setSavedMsg('Trivia question published successfully!');
        setQuestionText('');
        setMcOptions(['', '', '', '']);
        setTextAnswer('');
        setCorrectIndex(0);
      } else if (tab === 'card') {
        if (!cardForm.title.trim()) throw new Error('Card title is required');

        await publishCard({
          name: cardForm.title.trim(),
          category: cardForm.category,
          rarity: cardForm.rarity,
          baseAttack: cardForm.attack,
          baseDefense: cardForm.defense,
          baseSpeed: cardForm.speed,
          baseBrains: cardForm.brains,
          imageUrl: cardForm.imageUrl,
        });

        setSavedMsg('Card published to database!');
        setCardForm({ ...cardForm, title: '', attack: 50, defense: 50, speed: 50, brains: 50, imageUrl: '' });
      } else if (tab === 'avatar') {
        if (!avatarForm.label || !avatarForm.emoji) {
          throw new Error('Avatar Name and Emoji are required');
        }
        await createAvatar({
          id: avatarForm.label.toLowerCase().replace(/\s+/g, '_'),
          emoji: avatarForm.emoji,
          label: avatarForm.label,
          cssClass: 'avatar-default',
          description: '',
        });
        setSavedMsg('Avatar saved to database!');
        setAvatarForm({ label: '', emoji: '' });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish content');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSavedMsg(''), 4000);
    }
  }

  function saveDraft() {
    let label = 'Untitled';
    if (tab === 'trivia') label = questionText.slice(0, 40) || 'Untitled trivia';
    if (tab === 'card') label = cardForm.title || 'Untitled card';
    if (tab === 'avatar') label = avatarForm.label || 'Untitled avatar';

    setDrafts((d) => [
      ...d,
      {
        id: Date.now(),
        type: tab,
        label,
        savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setSavedMsg('Draft saved!');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  return (
    <div className="admin-content-container">
      <style>{`
        .admin-content-container {
          padding: 16px 16px 90px;
          max-width: 960px;
          margin: 0 auto;
          box-sizing: border-box;
          min-height: 100vh;
        }

        .admin-header {
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 2px solid var(--color-border);
        }

        .admin-header h2 {
          font-size: 22px;
          font-weight: 900;
          color: var(--color-text);
          margin: 0 0 4px;
          font-family: var(--font-serif, Georgia, serif);
        }

        .admin-header p {
          font-size: 13px;
          color: var(--color-muted);
          margin: 0;
        }

        .admin-tab-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }

        .admin-tab-btn {
          padding: 10px 8px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          text-align: center;
          border: 2px solid var(--color-border);
          background: var(--color-card-bg);
          color: var(--color-text);
        }

        .admin-tab-btn.active {
          border-color: var(--color-accent);
          background: var(--color-accent);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(211, 122, 50, 0.25);
        }

        .admin-form-card {
          padding: 18px 16px;
          border-radius: 20px;
          background: var(--color-card-bg);
          border: 1.5px solid var(--color-border);
          box-shadow: 0 4px 16px rgba(44, 34, 30, 0.06);
          display: flex;
          flex-direction: column;
          gap: 18px;
          box-sizing: border-box;
        }

        .responsive-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }

        .card-builder-layout {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .rarity-pill-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .stat-row {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 10px 12px;
          margin-bottom: 8px;
        }

        .action-dock {
          margin-top: 20px;
          padding: 16px;
          background: var(--color-card-bg);
          border-radius: 18px;
          border: 1.5px solid var(--color-border);
          box-shadow: 0 4px 16px rgba(44, 34, 30, 0.08);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-buttons-row {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 10px;
        }

        @media (min-width: 768px) {
          .admin-content-container {
            padding: 28px 24px 80px;
          }
          .admin-header h2 {
            font-size: 28px;
          }
          .admin-tab-bar {
            display: flex;
            gap: 14px;
          }
          .admin-tab-btn {
            flex: 1;
            flex-direction: row;
            padding: 14px 20px;
            font-size: 15px;
            gap: 10px;
          }
          .responsive-grid-2 {
            grid-template-columns: 1fr 1fr;
            gap: 18px;
          }
          .card-builder-layout {
            flex-direction: row;
            align-items: flex-start;
          }
          .rarity-pill-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          .action-dock {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          .action-buttons-row {
            display: flex;
            gap: 12px;
          }
        }
      `}</style>

      {/* Header */}
      <div className="admin-header">
        <h2>Content Console</h2>
        <p>Create and customize Wits trivia questions, cards, and avatars.</p>
      </div>

      {/* Tab Selector */}
      <div className="admin-tab-bar">
        {([
          ['trivia', 'Trivia', HelpCircle],
          ['card', 'Cards', PenTool],
          ['avatar', 'Avatars', User],
        ] as const).map(([t, label, Icon]) => {
          const draftCount = drafts.filter((d) => d.type === t).length;
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setSavedMsg('');
                setErrorMsg('');
              }}
              className={`admin-tab-btn ${active ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {draftCount > 0 && (
                <span
                  style={{
                    background: active ? 'rgba(255,255,255,0.3)' : 'var(--color-accent)',
                    borderRadius: 99,
                    padding: '1px 6px',
                    fontSize: 10,
                    fontWeight: 900,
                    color: '#ffffff',
                  }}
                >
                  {draftCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: TRIVIA QUESTIONS ─── */}
      {tab === 'trivia' && (
        <div className="admin-form-card">
          <div>
            <label style={labelStyle}>Linked Event Location</label>
            <select
              style={inputStyle}
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <option value="" disabled>-- Select an Active Campus Event --</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Question Format</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {([['mc', 'Multiple Choice'], ['text', 'Text Match']] as const).map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => setQuestionType(t)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: questionType === t ? 'var(--color-text)' : 'var(--color-bg)',
                    border: `1.5px solid ${questionType === t ? 'var(--color-text)' : 'var(--color-border)'}`,
                    color: questionType === t ? '#ffffff' : 'var(--color-text)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Question Text</label>
            <textarea
              style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
              placeholder="e.g. In which year was the iconic Wits Great Hall opened?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>

          {questionType === 'mc' ? (
            <div>
              <label style={labelStyle}>
                Options & Correct Answer
                <span style={{ fontSize: 11, color: 'var(--color-muted)', display: 'block', marginTop: 2, fontWeight: 500 }}>
                  Tap a letter circle to mark it as the correct answer.
                </span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {['A', 'B', 'C', 'D'].map((opt, i) => (
                  <div key={opt} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setCorrectIndex(i)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: correctIndex === i ? '#2e7d32' : 'var(--color-bg)',
                        border: `2px solid ${correctIndex === i ? '#2e7d32' : 'var(--color-border)'}`,
                        color: correctIndex === i ? '#ffffff' : 'var(--color-text)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: 13,
                      }}
                    >
                      {correctIndex === i ? <CheckCircle size={18} /> : opt}
                    </button>
                    <input
                      style={{ ...inputStyle, padding: '10px 12px' }}
                      placeholder={`Option ${opt}`}
                      value={mcOptions[i]}
                      onChange={(e) => {
                        const newOpts = [...mcOptions];
                        newOpts[i] = e.target.value;
                        setMcOptions(newOpts);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label style={labelStyle}>Accepted Answers (comma separated)</label>
              <input
                style={inputStyle}
                placeholder="1922, nineteen twenty-two"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: CARD COLLECTION ─── */}
      {tab === 'card' && (
        <div className="card-builder-layout">
          {/* Main Card Form */}
          <div className="admin-form-card" style={{ flex: 1 }}>
            <div className="responsive-grid-2">
              <div>
                <label style={labelStyle}>Card Title</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Great Hall Pillars"
                  value={cardForm.title}
                  onChange={(e) => setCardForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  style={inputStyle}
                  value={cardForm.category}
                  onChange={(e) => setCardForm((f) => ({ ...f, category: e.target.value as CardCategory }))}
                >
                  {(['Landmarks', 'Science', 'History', 'Lifestyle', 'Sports'] as CardCategory[]).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Rarity Tier</label>
              <div className="rarity-pill-grid">
                {(['Common', 'Rare', 'Epic', 'Legendary'] as const).map((r) => {
                  const isSelected = cardForm.rarity === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setCardForm((f) => ({ ...f, rarity: r }))}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 12,
                        background: isSelected ? RARITY_COLORS[r] : 'var(--color-bg)',
                        border: `2px solid ${isSelected ? RARITY_COLORS[r] : 'var(--color-border)'}`,
                        color: isSelected ? '#ffffff' : 'var(--color-text)',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 800,
                        textAlign: 'center',
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '8px 0 0' }}>
                Recommended Stat Budget: <strong>{targetMin}–{targetMax} pts</strong>
              </p>
            </div>

            <div>
              <label style={labelStyle}>Card Artwork</label>
              <label
                style={{
                  border: '2px dashed var(--color-border)',
                  borderRadius: 16,
                  padding: '24px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--color-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setCardForm((f) => ({ ...f, imageUrl: ev.target?.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {cardForm.imageUrl ? (
                  <img
                    src={cardForm.imageUrl}
                    alt="Preview"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <>
                    <ImageIcon size={32} color="var(--color-muted)" />
                    <div style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 800 }}>Tap to upload image</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>PNG, JPG or SVG</div>
                  </>
                )}
              </label>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: 900, margin: 0 }}>
                  Combat Stats
                </label>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: costInRange ? '#2e7d32' : '#b3261e',
                    background: costInRange ? 'rgba(46, 125, 50, 0.1)' : 'rgba(179, 38, 30, 0.1)',
                    padding: '2px 8px',
                    borderRadius: 8,
                  }}
                >
                  Total: {cardTotalCost} pts
                </span>
              </div>

              {STAT_META.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="stat-row">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon size={14} color={color} /> {label}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--color-text)' }}>
                      {cardForm[key as keyof typeof cardForm]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={cardForm[key as keyof typeof cardForm] as number}
                    onChange={(e) => setCardForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                    style={{ width: '100%', accentColor: color, cursor: 'pointer' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Live Preview Card */}
          <div style={{ width: '100%', maxWidth: 280, margin: '0 auto' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
              Live Mobile Card Preview
            </div>
            <div
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                border: `3px solid ${RARITY_COLORS[cardForm.rarity]}`,
                boxShadow: '0 8px 24px rgba(44, 34, 30, 0.12)',
                background: 'linear-gradient(135deg, #f5ecd7 0%, #e8d9b8 100%)',
              }}
            >
              <div
                style={{
                  height: 140,
                  background: `linear-gradient(135deg, ${RARITY_COLORS[cardForm.rarity]}40 0%, ${RARITY_COLORS[cardForm.rarity]}10 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {cardForm.imageUrl ? (
                  <img src={cardForm.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon size={40} color={RARITY_COLORS[cardForm.rarity]} style={{ opacity: 0.5 }} />
                )}
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--color-text)', marginBottom: 2 }}>
                  {cardForm.title || 'Untitled Card'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 800, marginBottom: 12 }}>
                  {cardForm.category} · {cardForm.rarity}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {STAT_META.map(({ key, label, icon: Icon, color }) => (
                    <div
                      key={key}
                      style={{
                        background: 'rgba(255,255,255,0.7)',
                        borderRadius: 8,
                        padding: '4px 8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Icon size={12} color="var(--color-muted)" />
                      <span style={{ fontSize: 13, fontWeight: 900, color }}>
                        {cardForm[key as keyof typeof cardForm]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: AVATARS ─── */}
      {tab === 'avatar' && (
        <div className="admin-form-card">
          <div className="responsive-grid-2">
            <div>
              <label style={labelStyle}>Avatar Name</label>
              <input
                style={inputStyle}
                placeholder="e.g. Wise Owl"
                value={avatarForm.label}
                onChange={(e) => setAvatarForm({ ...avatarForm, label: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Emoji Icon</label>
              <input
                style={inputStyle}
                placeholder="e.g. 🦉"
                value={avatarForm.emoji}
                onChange={(e) => setAvatarForm({ ...avatarForm, emoji: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Action Dock ─── */}
      <div className="action-dock">
        {(savedMsg || errorMsg) && (
          <div style={{ width: '100%' }}>
            {savedMsg && (
              <div style={{ color: '#2e7d32', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={16} /> {savedMsg}
              </div>
            )}
            {errorMsg && (
              <div style={{ color: '#b3261e', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                <XCircle size={16} /> {errorMsg}
              </div>
            )}
          </div>
        )}

        <div className="action-buttons-row">
          <button
            type="button"
            onClick={saveDraft}
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontWeight: 800,
              border: '1.5px solid var(--color-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: 13,
            }}
          >
            <Save size={16} /> Draft
          </button>
          <button
            type="button"
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: 'var(--color-accent)',
              color: '#ffffff',
              fontWeight: 800,
              border: 'none',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: 13,
              boxShadow: '0 4px 12px rgba(211, 122, 50, 0.3)',
            }}
            onClick={handleSave}
            disabled={isSaving}
          >
            <UploadCloud size={16} /> {isSaving ? 'Publishing…' : 'Publish to Game'}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--color-text)',
  fontWeight: 800,
  display: 'block',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1.5px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  outline: 'none',
  fontSize: 14,
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};