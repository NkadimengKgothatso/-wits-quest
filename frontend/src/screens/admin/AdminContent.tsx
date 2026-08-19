import { useState, useEffect } from 'react'
import { publishCard, uploadCardImage, getEvents, saveEventTrivia, type CampusEvent } from '../../services/apiClient'
import { CheckCircle, XCircle, Save, UploadCloud } from 'lucide-react'

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

const RARITY_TARGET_RANGE: Record<CardRarity, [number, number]> = {
  Common: [40, 50],
  Rare: [58, 68],
  Epic: [75, 85],
  Legendary: [88, 98],
}

const STAT_META = [
  { key: 'attack', label: 'Attack', icon: '⚔', color: '#e8a6a6' },
  { key: 'defense', label: 'Defense', icon: '🛡', color: '#dca668' },
  { key: 'speed', label: 'Speed', icon: '⚡', color: '#e8c98f' },
  { key: 'brains', label: 'Brains', icon: '🧠', color: '#8fae6e' },
] as const

export default function AdminContent() {
  const [tab, setTab] = useState<ContentTab>('trivia')
  const [questionType, setQuestionType] = useState<'mc' | 'text'>('mc')
  const [correct, setCorrect] = useState(0)
  const [savedMsg, setSavedMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [mcOptions, setMcOptions] = useState(['', '', '', ''])
  const [acceptedAnswersText, setAcceptedAnswersText] = useState('')

  const [events, setEvents] = useState<CampusEvent[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')

  const [cardImageFile, setCardImageFile] = useState<File | null>(null)
  const [cardImagePreview, setCardImagePreview] = useState<string>('')

  // Card State
  const [cardForm, setCardForm] = useState<{
    title: string
    category: CardCategory
    rarity: CardRarity
    attack: number
    defense: number
    speed: number
    brains: number
    imageUrl?: string
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

  useEffect(() => {
    getEvents().then((evts) => {
      setEvents(evts)
      if (evts.length > 0) setSelectedEventId((prev) => prev || evts[0].id)
    })
  }, [])

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCardImageFile(file)
    setCardImagePreview(URL.createObjectURL(file))
  }

  function handleMcOptionChange(index: number, value: string) {
    setMcOptions((opts) => {
      const next = [...opts]
      next[index] = value
      return next
    })
  }

  async function handleSave() {
    setErrorMsg('')
    if (tab === 'trivia') {
      if (!selectedEventId) {
        setErrorMsg('Select an event to link this question to')
        return
      }
      if (!questionText.trim()) {
        setErrorMsg('Question text is required')
        return
      }
      if (questionType === 'mc' && mcOptions.some((o) => !o.trim())) {
        setErrorMsg('All four answer options are required')
        return
      }
      if (questionType === 'text' && !acceptedAnswersText.trim()) {
        setErrorMsg('At least one accepted answer is required')
        return
      }

      setIsSaving(true)
      try {
        await saveEventTrivia(selectedEventId, {
          question: questionText.trim(),
          questionType,
          options: questionType === 'mc' ? mcOptions.map((o) => o.trim()) : undefined,
          correctIndex: questionType === 'mc' ? correct : undefined,
          acceptedAnswers:
            questionType === 'text'
              ? acceptedAnswersText.split(',').map((a) => a.trim()).filter(Boolean)
              : undefined,
        })
        setSavedMsg('Trivia question saved and linked to event!')
        setTimeout(() => setSavedMsg(''), 3000)
        setQuestionText('')
        setMcOptions(['', '', '', ''])
        setAcceptedAnswersText('')
        setCorrect(0)
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to submit trivia')
      } finally {
        setIsSaving(false)
      }
      return
    }

    if (!cardForm.title.trim()) {
      setErrorMsg('Card title is required')
      return
    }
    setIsSaving(true)
    try {
      let imageUrl: string | undefined
      if (cardImageFile) {
        imageUrl = await uploadCardImage(cardImageFile)
      }
      await publishCard({
        name: cardForm.title.trim(),
        category: cardForm.category,
        rarity: cardForm.rarity,
        baseAttack: cardForm.attack,
        baseDefense: cardForm.defense,
        baseSpeed: cardForm.speed,
        baseBrains: cardForm.brains,
        imageUrl,
      })
      setSavedMsg('Card published to database!')
      setTimeout(() => setSavedMsg(''), 3000)
      setCardForm({
        title: '',
        category: 'Landmarks',
        rarity: 'Common',
        attack: 50,
        defense: 50,
        speed: 50,
        brains: 50,
      })
      setCardImageFile(null)
      setCardImagePreview('')
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

    setDrafts((prev) => [...prev, { id: Date.now(), type: tab, label, savedAt: new Date().toLocaleTimeString() }])
    setSavedMsg('Draft saved!')
    setTimeout(() => setSavedMsg(''), 2000)
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

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {([['trivia', 'Trivia Question Authoring'], ['card', 'Card Set Definitions'], ['avatar', 'Avatars']] as const).map(([t, label]) => {
          const draftCount = drafts.filter((d) => d.type === t).length
          return (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setSavedMsg('');
                setErrorMsg('');
              }}
              className={`admin-tab-btn ${tab === t ? 'active' : ''}`}
            >
              <span>{label}</span>
              {draftCount > 0 && (
                <span
                  style={{
                    background: tab === t ? 'rgba(255,255,255,0.3)' : 'var(--color-accent)',
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

      {tab === 'trivia' && (
        <div style={{ padding: 32, borderRadius: 24, background: 'var(--color-card-bg)', border: '2px solid var(--color-border)', boxShadow: '0 8px 32px rgba(44, 34, 30, 0.05)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Linked Event Location</label>
            <select
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontSize: 14 }}
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              {events.length === 0 && <option value="">No events yet — create one in Event Management first</option>}
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>{evt.name}</option>
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
              {['A', 'B', 'C', 'D'].map((opt, i) => (
                <div key={opt} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                  <button
                    onClick={() => setCorrect(i)}
                    style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: correct === i ? '#8fae6e' : 'var(--color-bg)',
                      border: `2px solid ${correct === i ? '#8fae6e' : 'var(--color-border)'}`,
                      color: correct === i ? 'white' : 'var(--color-muted)',
                      cursor: 'pointer', fontSize: 14, fontWeight: 900,
                    }}
                  >
                    {correct === i ? '✓' : opt}
                  </button>
                  <input
                    style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontSize: 14 }}
                    placeholder={`Option ${opt}`}
                    value={mcOptions[i]}
                    onChange={(e) => handleMcOptionChange(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div>
              <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Accepted Answers (comma-separated)</label>
              <input
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontSize: 14 }}
                placeholder="1922, nineteen twenty-two"
                value={acceptedAnswersText}
                onChange={(e) => setAcceptedAnswersText(e.target.value)}
              />
            </div>
          )}

          {savedMsg && <div style={{ color: '#8fae6e', fontSize: 14, fontWeight: 800 }}>✓ {savedMsg}</div>}
          {errorMsg && <div style={{ color: 'var(--color-danger)', fontSize: 14, fontWeight: 800 }}>✕ {errorMsg}</div>}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={saveDraft}
              style={{ flex: 1, fontSize: 14, padding: '14px', borderRadius: 12, background: 'transparent', color: 'var(--color-muted)', fontWeight: 800, border: '2px solid var(--color-border)', cursor: 'pointer' }}
            >
              Save Draft
            </button>
            <button
              style={{ flex: 1, fontSize: 14, padding: '14px', borderRadius: 12, background: 'var(--color-accent)', color: 'white', fontWeight: 800, border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1 }}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Submit for Review'}
            </button>
          </div>
        </div>
      )}

      {tab === 'card' && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, padding: 32, borderRadius: 24, background: 'var(--color-card-bg)', border: '2px solid var(--color-border)', boxShadow: '0 8px 32px rgba(44, 34, 30, 0.05)', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
              <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Card Artwork</label>
              <input
                id="card-artwork-input"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="card-artwork-input"
                style={{
                  display: 'block',
                  border: '2px dashed var(--color-border)', borderRadius: 16, padding: 32,
                  textAlign: 'center', cursor: 'pointer',
                  background: 'var(--color-bg)'
                }}
              >
                {cardImagePreview ? (
                  <img src={cardImagePreview} alt="Preview" style={{ maxHeight: 140, borderRadius: 8, margin: '0 auto' }} />
                ) : (
                  <>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🖼️</div>
                    <div style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: 700 }}>Drop artwork here or click to upload</div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 8, fontWeight: 600 }}>PNG, JPG, SVG — Recommended 512×512</div>
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

              {STAT_META.map(({ key, label, icon, color }) => (
                <div key={key} className="stat-row">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {icon} {label}
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

          <div style={{ width: 200, flexShrink: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Preview</div>
            <div style={{
              width: 200,
              borderRadius: 16,
              overflow: 'hidden',
              border: `2px solid ${RARITY_COLORS[cardForm.rarity]}`,
              boxShadow: `0 0 16px ${RARITY_COLORS[cardForm.rarity]}40`,
              background: 'linear-gradient(135deg, #FAF7F2 0%, #E5D5C5 100%)',
            }}>
              <div style={{
                height: 120,
                background: `linear-gradient(135deg, ${RARITY_COLORS[cardForm.rarity]}30 0%, ${RARITY_COLORS[cardForm.rarity]}10 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36,
                overflow: 'hidden',
              }}>
                {cardImagePreview ? (
                  <img src={cardImagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  '🖼️'
                )}
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text)', marginBottom: 2, minHeight: 18 }}>
                  {cardForm.title || 'Untitled Card'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 800, marginBottom: 12 }}>
                  {cardForm.category} · {cardForm.rarity}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {STAT_META.map(({ key, label, icon, color }) => (
                    <div key={key} style={{
                      background: 'rgba(255,255,255,0.6)',
                      borderRadius: 6, padding: '4px 8px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ fontSize: 9, color: 'var(--color-muted)', fontWeight: 700 }}>{icon} {label.slice(0, 3)}</span>
                      <span style={{ fontSize: 12, fontWeight: 900, color }}>{cardForm[key as keyof typeof cardForm]}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 2, marginTop: 8, height: 4 }}>
                  {STAT_META.map(({ key, color }) => (
                    <div key={key} style={{ flex: 1, borderRadius: 2, overflow: 'hidden', background: 'rgba(0,0,0,0.06)' }}>
                      <div style={{ height: '100%', width: `${cardForm[key as keyof typeof cardForm]}%`, background: color, borderRadius: 2 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {drafts.length > 0 && (
        <div style={{ marginTop: 24, padding: 20, borderRadius: 16, background: 'var(--color-card-bg)', border: '2px solid var(--color-border)' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Saved Drafts ({drafts.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {drafts.map((d) => (
              <div key={d.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', borderRadius: 10, background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                    background: d.type === 'trivia' ? 'rgba(143, 174, 110, 0.2)' : 'rgba(220, 166, 104, 0.2)',
                    color: d.type === 'trivia' ? '#8fae6e' : '#dca668',
                    borderRadius: 4, padding: '2px 6px',
                  }}>
                    {d.type}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)' }}>{d.label}</span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--color-muted)', fontWeight: 600 }}>{d.savedAt}</span>
              </div>
            ))}
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
