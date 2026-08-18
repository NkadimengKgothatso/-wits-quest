import { useState } from 'react'
import { publishCard, publishTrivia } from '../../services/apiClient'

type ContentTab = 'trivia' | 'card' | 'avatar'
type CardCategory = 'Science' | 'History' | 'Landmarks' | 'Lifestyle' | 'Sports'
type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'

interface Draft {
  id: number
  type: ContentTab
  label: string
  savedAt: string
}

const RARITY_COLORS: Record<CardRarity, string> = {
  Common: '#8A7B72',
  Rare: '#6b7d2c',
  Epic: '#c99255',
  Legendary: '#dca668',
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

  const [cardForm, setCardForm] = useState({
    title: '',
    category: 'Landmarks' as CardCategory,
    rarity: 'Common' as CardRarity,
    attack: 50,
    defense: 50,
    speed: 50,
    brains: 50,
  })

  const [avatarForm, setAvatarForm] = useState({
    id: '', emoji: '', label: '', cssClass: 'avatar-owl', description: ''
  })

  const [drafts, setDrafts] = useState<Draft[]>([])

  async function handleSave() {
    setErrorMsg('')
    if (tab === 'trivia') {
      if (!questionText.trim()) {
        setErrorMsg('Question text is required')
        return
      }
      setIsSaving(true)
      try {
        await publishTrivia({
          question: questionText.trim(),
          questionType,
          correctIndex: correct,
        })
        setSavedMsg('Trivia question submitted for review!')
        setTimeout(() => setSavedMsg(''), 3000)
        setQuestionText('')
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
      await publishCard({
        name: cardForm.title.trim(),
        category: cardForm.category,
        rarity: cardForm.rarity,
        baseAttack: cardForm.attack,
        baseDefense: cardForm.defense,
        baseSpeed: cardForm.speed,
        baseBrains: cardForm.brains,
      })
      setSavedMsg('Card published to database!')
      setTimeout(() => setSavedMsg(''), 3000)
      setCardForm({
        title: '',
        category: 'Landmarks' as CardCategory,
        rarity: 'Common' as CardRarity,
        attack: 50,
        defense: 50,
        speed: 50,
        brains: 50,
      })
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish card')
    } finally {
      setIsSaving(false)
    }
  }

  function saveDraft() {
    const label = tab === 'trivia'
      ? (questionText.slice(0, 40) || 'Untitled trivia')
      : (cardForm.title || 'Untitled card')
    setDrafts((d) => [...d, {
      id: Date.now(),
      type: tab,
      label,
      savedAt: new Date().toLocaleTimeString(),
    }])
    setSavedMsg('Draft saved!')
    setTimeout(() => setSavedMsg(''), 2000)
  }

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-text)', margin: '0 0 4px' }}>Content Authoring Console</h2>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: 0, fontWeight: 600 }}>Create and edit Wits campus trivia questions and card definitions</p>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {([['trivia', 'Trivia Question Authoring'], ['card', 'Card Set Definitions'], ['avatar', 'Avatars']] as const).map(([t, label]) => {
          const draftCount = drafts.filter((d) => d.type === t).length
          return (
            <button
              key={t}
              onClick={() => { setTab(t); setSavedMsg('') }}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: `2px solid ${tab === t ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: tab === t ? 'var(--color-accent)' : 'transparent',
                color: tab === t ? 'white' : 'var(--color-muted)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {label}
              {draftCount > 0 && (
                <span style={{
                  background: tab === t ? 'rgba(255,255,255,0.25)' : 'rgba(143, 174, 110, 0.2)',
                  border: `1px solid ${tab === t ? 'rgba(255,255,255,0.4)' : 'rgba(143, 174, 110, 0.4)'}`,
                  borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 800,
                  color: tab === t ? 'white' : '#8fae6e',
                }}>
                  {draftCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Trivia Form */}
      {tab === 'trivia' && (
        <div style={{ padding: 32, borderRadius: 24, background: 'var(--color-card-bg)', border: '2px solid var(--color-border)', boxShadow: '0 8px 32px rgba(44, 34, 30, 0.05)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Event selector */}
          <div>
            <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Linked Event Location</label>
            <select style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontSize: 14 }}>
              <option>Great Hall History Challenge</option>
              <option>Science Stadium STEM Quiz</option>
              <option>Origins Heritage Trail</option>
            </select>
          </div>

          {/* Question type toggle */}
          <div>
            <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Question Type</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {([['mc', 'Multiple Choice'], ['text', 'Text Match']] as const).map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => setQuestionType(t)}
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: 12,
                    background: questionType === t ? 'var(--color-accent)' : 'transparent',
                    border: `2px solid ${questionType === t ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    color: questionType === t ? 'white' : 'var(--color-muted)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 800,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Question text */}
          <div>
            <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Question Text</label>
            <textarea
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontSize: 14, minHeight: 100, resize: 'vertical' }}
              placeholder="In which year was the iconic Wits Great Hall inaugurated?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>

          {/* Options */}
          {questionType === 'mc' ? (
            <div>
              <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 12 }}>
                Answer Options <span style={{ fontSize: 11, color: '#8fae6e', marginLeft: 8 }}>(Select the correct answer)</span>
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
                  />
                </div>
              ))}
            </div>
          ) : (
            <div>
              <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Accepted Answers (comma-separated)</label>
              <input style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontSize: 14 }} placeholder="1922, nineteen twenty-two" />
            </div>
          )}

          {savedMsg && (
            <div style={{ color: '#8fae6e', fontSize: 14, fontWeight: 800 }}>✓ {savedMsg}</div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              onClick={saveDraft}
              style={{ flex: 1, fontSize: 14, padding: '14px', borderRadius: 12, background: 'transparent', color: 'var(--color-muted)', fontWeight: 800, border: '2px solid var(--color-border)', cursor: 'pointer' }}
            >
              Save Draft
            </button>
            <button style={{ flex: 1, fontSize: 14, padding: '14px', borderRadius: 12, background: 'var(--color-accent)', color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer' }} onClick={handleSave}>
              Submit for Review
            </button>
          </div>
        </div>
      )}

      {/* Card Form */}
      {tab === 'card' && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* Main form */}
          <div style={{ flex: 1, padding: 32, borderRadius: 24, background: 'var(--color-card-bg)', border: '2px solid var(--color-border)', boxShadow: '0 8px 32px rgba(44, 34, 30, 0.05)', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Card Title</label>
                <input
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontSize: 14 }}
                  placeholder="Great Hall Pillars"
                  value={cardForm.title}
                  onChange={(e) => setCardForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Category</label>
                <select
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontSize: 14 }}
                  value={cardForm.category}
                  onChange={(e) => setCardForm((f) => ({ ...f, category: e.target.value as CardCategory }))}
                >
                  {(['Landmarks', 'Science', 'History', 'Lifestyle', 'Sports'] as CardCategory[]).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Rarity</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {(['Common', 'Rare', 'Epic', 'Legendary'] as const).map((r) => {
                  const isSelected = cardForm.rarity === r
                  return (
                    <button
                      key={r}
                      onClick={() => setCardForm((f) => ({ ...f, rarity: r }))}
                      style={{
                        flex: 1, padding: '10px 4px', borderRadius: 10,
                        background: isSelected ? RARITY_COLORS[r] : 'transparent',
                        border: `2px solid ${isSelected ? RARITY_COLORS[r] : 'var(--color-border)'}`,
                        color: isSelected ? 'white' : 'var(--color-muted)',
                        cursor: 'pointer', fontSize: 13, fontWeight: 800,
                      }}
                    >
                      {r}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Image uploader */}
            <div>
              <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Card Artwork</label>
              <div style={{
                border: '2px dashed var(--color-border)', borderRadius: 16, padding: 32,
                textAlign: 'center', cursor: 'pointer',
                background: 'var(--color-bg)'
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🖼️</div>
                <div style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: 700 }}>Drop artwork here or click to upload</div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 8, fontWeight: 600 }}>PNG, JPG, SVG — Recommended 512×512</div>
              </div>
            </div>

            {/* Stat sliders */}
            <div>
              <label style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: 800, display: 'block', marginBottom: 16 }}>Card Stats</label>
              {STAT_META.map(({ key, label, icon, color }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700 }}>{label} {icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 900, color }}>{cardForm[key as keyof typeof cardForm]}</span>
                  </div>
                  <input
                    type="range" min={0} max={100}
                    value={cardForm[key as keyof typeof cardForm] as number}
                    onChange={(e) => setCardForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                    style={{ width: '100%', accentColor: color }}
                  />
                </div>
              ))}
            </div>

            {savedMsg && <div style={{ color: '#8fae6e', fontSize: 14, fontWeight: 800 }}>✓ {savedMsg}</div>}
            {errorMsg && <div style={{ color: 'var(--color-danger)', fontSize: 14, fontWeight: 800 }}>✕ {errorMsg}</div>}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                onClick={saveDraft}
                style={{ flex: 1, fontSize: 14, padding: '14px', borderRadius: 12, background: 'transparent', color: 'var(--color-muted)', fontWeight: 800, border: '2px solid var(--color-border)', cursor: 'pointer' }}
              >
                Save Draft
              </button>
              <button style={{ flex: 1, fontSize: 14, padding: '14px', borderRadius: 12, background: 'var(--color-accent)', color: 'white', fontWeight: 800, border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1 }} onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Publishing…' : 'Publish Card'}
              </button>
            </div>
          </div>

          {/* Live card preview */}
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
              {/* Card art area */}
              <div style={{
                height: 120,
                background: `linear-gradient(135deg, ${RARITY_COLORS[cardForm.rarity]}30 0%, ${RARITY_COLORS[cardForm.rarity]}10 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36,
              }}>
                🖼️
              </div>
              {/* Card info */}
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text)', marginBottom: 2, minHeight: 18 }}>
                  {cardForm.title || 'Untitled Card'}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-muted)', fontWeight: 700, marginBottom: 10 }}>
                  {cardForm.category} · {cardForm.rarity}
                </div>
                {/* Stat grid */}
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
                {/* Stat bars */}
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

      {/* Drafts list */}
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
    </div>
  )
}
