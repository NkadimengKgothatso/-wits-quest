import { useState, useEffect } from 'react'
import { addCard, RARITY_TARGET_RANGE } from '../../services/cardCatalogService'
import type { Card } from '../../types/card'
import { publishCard, publishTrivia, getEvents, CampusEvent, createAvatar } from '../../services/apiClient'
import { CheckCircle, XCircle, Image as ImageIcon, Swords, Shield, Zap, Brain, PenTool, HelpCircle, User, Save, UploadCloud } from 'lucide-react'

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
  { key: 'attack', label: 'Attack', icon: Swords, color: '#e8a6a6' },
  { key: 'defense', label: 'Defense', icon: Shield, color: '#dca668' },
  { key: 'speed', label: 'Speed', icon: Zap, color: '#e8c98f' },
  { key: 'brains', label: 'Brains', icon: Brain, color: '#8fae6e' },
] as const

const CATEGORIES: Card['category'][] = ['Landmarks', 'Science', 'History', 'Lifestyle', 'Sports']
const RARITIES: Card['rarity'][] = ['Common', 'Rare', 'Epic', 'Legendary']

export default function AdminContent() {
  const [tab, setTab] = useState<ContentTab>('trivia')
  const [savedMsg, setSavedMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Trivia State
  const [events, setEvents] = useState<CampusEvent[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [questionType, setQuestionType] = useState<'mc' | 'text'>('mc')
  const [questionText, setQuestionText] = useState('')
  const [mcOptions, setMcOptions] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(0)
  const [textAnswer, setTextAnswer] = useState('')

  // Card State
  const [cardForm, setCardForm] = useState<{
    title: string
    category: Card['category']
    rarity: Card['rarity']
    attack: number
    defense: number
    speed: number
    brains: number
  }>({
    title: '',
    category: 'Landmarks',
    rarity: 'Common',
    attack: 50,
    defense: 50,
    speed: 50,
    brains: 50,
  })

  // Avatar State
  const [avatarForm, setAvatarForm] = useState({
    id: '', iconName: '', label: '', cssClass: 'avatar-default', description: ''
  })

  const [drafts, setDrafts] = useState<Draft[]>([])

  const cardTotalCost = cardForm.attack + cardForm.defense + cardForm.speed + cardForm.brains
  const [targetMin, targetMax] = RARITY_TARGET_RANGE[cardForm.rarity]
  const costInRange = cardTotalCost >= targetMin && cardTotalCost <= targetMax

  useEffect(() => {
    getEvents(true).then((data) => {
      setEvents(data)
      if (data.length > 0) setSelectedEventId(data[0].id)
    }).catch(console.error)
  }, [])

  async function handleSave() {
    setErrorMsg('')
    setSavedMsg('')
    setIsSaving(true)

    try {
      if (tab === 'trivia') {
        if (!selectedEventId) throw new Error('You must select an event.')
        if (!questionText.trim()) throw new Error('Question text is required.')
        
        let finalCorrectAnswer = ''
        if (questionType === 'mc') {
          if (mcOptions.some(opt => !opt.trim())) throw new Error('All multiple choice options must be filled.')
          finalCorrectAnswer = mcOptions[correctIndex].trim()
        } else {
          if (!textAnswer.trim()) throw new Error('Accepted answers are required.')
          finalCorrectAnswer = textAnswer.trim()
        }

        await publishTrivia({
          eventId: selectedEventId,
          question: questionText.trim(),
          questionType,
          options: questionType === 'mc' ? mcOptions.map(o => o.trim()) : undefined,
          correctAnswer: finalCorrectAnswer
        })
        
        setSavedMsg('Trivia question published successfully!')
        setQuestionText('')
        setMcOptions(['', '', '', ''])
        setTextAnswer('')
        setCorrectIndex(0)
      } else if (tab === 'card') {
        if (!cardForm.title.trim()) throw new Error('Card title is required')
        
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
        setCardForm({ ...cardForm, title: '', attack: 50, defense: 50, speed: 50, brains: 50 })
      } else if (tab === 'avatar') {
        if (!avatarForm.id || !avatarForm.label || !avatarForm.description) {
          throw new Error('ID, Label, and Description are required')
        }
        await createAvatar({
          id: avatarForm.id,
          emoji: avatarForm.iconName || 'User', // Using iconName field instead of emoji
          label: avatarForm.label,
          cssClass: avatarForm.cssClass,
          description: avatarForm.description
        })
        setSavedMsg('Avatar published!')
        setAvatarForm({ id: '', iconName: '', label: '', cssClass: 'avatar-default', description: '' })
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish content')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSavedMsg(''), 4000)
    }
  }

  function saveDraft() {
    let label = 'Untitled'
    if (tab === 'trivia') label = questionText.slice(0, 40) || 'Untitled trivia'
    if (tab === 'card') label = cardForm.title || 'Untitled card'
    if (tab === 'avatar') label = avatarForm.label || 'Untitled avatar'
    
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
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto', fontFamily: 'Georgia, serif' }}>
      <div style={{ marginBottom: 32, paddingBottom: 16, borderBottom: '2px solid var(--color-border)' }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-text)', margin: '0 0 8px' }}>Content Authoring Console</h2>
        <p style={{ fontSize: 15, color: 'var(--color-muted)', margin: 0 }}>Create and manage Wits campus trivia, cards, and avatars.</p>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {([
          ['trivia', 'Trivia Questions', HelpCircle], 
          ['card', 'Card Collection', PenTool], 
          ['avatar', 'Avatars', User]
        ] as const).map(([t, label, Icon]) => {
          const draftCount = drafts.filter((d) => d.type === t).length
          const active = tab === t
          return (
            <button
              key={t}
              onClick={() => { setTab(t); setSavedMsg(''); setErrorMsg('') }}
              style={{
                flex: 1, padding: '16px 24px', borderRadius: 16, fontSize: 15, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                border: `2px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: active ? 'var(--color-accent)' : 'var(--color-card-bg)',
                color: active ? 'white' : 'var(--color-text)',
                boxShadow: active ? '0 4px 12px rgba(211, 122, 50, 0.3)' : 'none'
              }}
            >
              <Icon size={20} />
              {label}
              {draftCount > 0 && (
                <span style={{
                  background: active ? 'rgba(255,255,255,0.25)' : 'rgba(143, 174, 110, 0.2)',
                  borderRadius: 99, padding: '2px 8px', fontSize: 12, fontWeight: 800,
                  color: active ? 'white' : '#8fae6e', marginLeft: 'auto'
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
        <div style={formCardStyle}>
          <div>
            <label style={labelStyle}>Linked Event Location</label>
            <select 
              style={inputStyle} 
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <option value="" disabled>-- Select an Active Event --</option>
              {events.map(evt => (
                <option key={evt.id} value={evt.id}>{evt.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Question Type</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {([['mc', 'Multiple Choice'], ['text', 'Text Match']] as const).map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => setQuestionType(t)}
                  style={{
                    flex: 1, padding: '12px 16px', borderRadius: 12,
                    background: questionType === t ? '#4a3620' : 'transparent',
                    border: `2px solid ${questionType === t ? '#4a3620' : 'var(--color-border)'}`,
                    color: questionType === t ? 'white' : 'var(--color-text)',
                    cursor: 'pointer', fontSize: 14, fontWeight: 700,
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
              style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
              placeholder="In which year was the iconic Wits Great Hall inaugurated?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>

          {questionType === 'mc' ? (
            <div>
              <label style={labelStyle}>
                Answer Options <span style={{ fontSize: 12, color: 'var(--color-muted)', marginLeft: 8 }}>(Select the correct answer)</span>
              </label>
              {['A', 'B', 'C', 'D'].map((opt, i) => (
                <div key={opt} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                  <button
                    onClick={() => setCorrectIndex(i)}
                    style={{
                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      background: correctIndex === i ? '#2e7d32' : 'var(--color-bg)',
                      border: `2px solid ${correctIndex === i ? '#2e7d32' : 'var(--color-border)'}`,
                      color: correctIndex === i ? 'white' : 'var(--color-text)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {correctIndex === i ? <CheckCircle size={20} /> : <span style={{ fontWeight: 800 }}>{opt}</span>}
                  </button>
                  <input
                    style={inputStyle}
                    placeholder={`Option ${opt}`}
                    value={mcOptions[i]}
                    onChange={(e) => {
                      const newOpts = [...mcOptions]
                      newOpts[i] = e.target.value
                      setMcOptions(newOpts)
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div>
              <label style={labelStyle}>Accepted Answers (comma-separated)</label>
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

      {/* Card Form */}
      {tab === 'card' && (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ ...formCardStyle, flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={labelStyle}>Card Title</label>
                <input
                  style={inputStyle}
                  placeholder="Great Hall Pillars"
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
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Rarity</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {(['Common', 'Rare', 'Epic', 'Legendary'] as const).map((r) => {
                  const isSelected = cardForm.rarity === r
                  return (
                    <button
                      key={r}
                      onClick={() => setCardForm((f) => ({ ...f, rarity: r }))}
                      style={{
                        flex: 1, padding: '12px 4px', borderRadius: 12,
                        background: isSelected ? RARITY_COLORS[r] : 'var(--color-bg)',
                        border: `2px solid ${isSelected ? RARITY_COLORS[r] : 'var(--color-border)'}`,
                        color: isSelected ? 'white' : 'var(--color-text)',
                        cursor: 'pointer', fontSize: 14, fontWeight: 700,
                      }}
                    >
                      {r}
                    </button>
                  )
                })}
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '10px 0 0' }}>
                Recommended total stat cost for {cardForm.rarity}: <strong>{targetMin}–{targetMax}</strong> pts.
              </p>
            </div>

            <div>
              <label style={labelStyle}>Card Artwork</label>
              <div style={{
                border: '2px dashed var(--color-border)', borderRadius: 16, padding: 40,
                textAlign: 'center', cursor: 'pointer', background: 'var(--color-bg)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
              }}>
                <ImageIcon size={48} color="var(--color-muted)" />
                <div style={{ fontSize: 15, color: 'var(--color-text)', fontWeight: 700 }}>Click to upload artwork</div>
                <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>PNG, JPG, SVG — Recommended 512×512</div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <label style={{ fontSize: 16, color: 'var(--color-text)', fontWeight: 800, margin: 0 }}>Card Stats</label>
                <span style={{ fontSize: 14, fontWeight: 700, color: costInRange ? '#2e7d32' : '#b3261e' }}>
                  Total: {cardTotalCost} pts {costInRange ? '(Balanced)' : `(Aim for ${targetMin}–${targetMax})`}
                </span>
              </div>
              {STAT_META.map(({ key, label, icon: Icon, color }) => (
                <div key={key} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={16} /> {label}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 900, color }}>{cardForm[key as keyof typeof cardForm]}</span>
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
          </div>

          {/* Live Preview */}
          <div style={{ width: 240, flexShrink: 0, position: 'sticky', top: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Preview</div>
            <div style={{
              borderRadius: 20,
              overflow: 'hidden',
              border: `3px solid ${RARITY_COLORS[cardForm.rarity]}`,
              boxShadow: `0 12px 24px rgba(0,0,0,0.15)`,
              background: 'linear-gradient(135deg, #f5ecd7 0%, #e8d9b8 100%)',
            }}>
              <div style={{
                height: 140,
                background: `linear-gradient(135deg, ${RARITY_COLORS[cardForm.rarity]}40 0%, ${RARITY_COLORS[cardForm.rarity]}10 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ImageIcon size={48} color={RARITY_COLORS[cardForm.rarity]} style={{ opacity: 0.5 }} />
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>
                  {cardForm.title || 'Untitled Card'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-muted)', fontWeight: 700, marginBottom: 16 }}>
                  {cardForm.category} · {cardForm.rarity}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {STAT_META.map(({ key, label, icon: Icon, color }) => (
                    <div key={key} style={{
                      background: 'rgba(255,255,255,0.7)',
                      borderRadius: 8, padding: '6px 10px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <Icon size={14} color="var(--color-muted)" />
                      <span style={{ fontSize: 14, fontWeight: 900, color }}>{cardForm[key as keyof typeof cardForm]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Form */}
      {tab === 'avatar' && (
        <div style={formCardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={labelStyle}>Avatar ID</label>
              <input
                style={inputStyle}
                placeholder="avatar_owl"
                value={avatarForm.id}
                onChange={(e) => setAvatarForm({ ...avatarForm, id: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Icon Name (Lucide)</label>
              <input
                style={inputStyle}
                placeholder="User, Bird, Ghost..."
                value={avatarForm.iconName}
                onChange={(e) => setAvatarForm({ ...avatarForm, iconName: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Label</label>
              <input
                style={inputStyle}
                placeholder="Wise Owl"
                value={avatarForm.label}
                onChange={(e) => setAvatarForm({ ...avatarForm, label: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>CSS Class</label>
              <input
                style={inputStyle}
                placeholder="avatar-owl"
                value={avatarForm.cssClass}
                onChange={(e) => setAvatarForm({ ...avatarForm, cssClass: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80 }}
              placeholder="Awarded for getting 50 questions right."
              value={avatarForm.description}
              onChange={(e) => setAvatarForm({ ...avatarForm, description: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div style={{ 
        marginTop: 32, 
        padding: 24, 
        background: 'var(--color-card-bg)', 
        borderRadius: 20,
        border: '2px solid var(--color-border)',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {savedMsg && <div style={{ color: '#2e7d32', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={18} /> {savedMsg}</div>}
          {errorMsg && <div style={{ color: '#b3261e', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><XCircle size={18} /> {errorMsg}</div>}
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            onClick={saveDraft}
            style={{ 
              padding: '14px 24px', borderRadius: 12, background: 'transparent', 
              color: 'var(--color-text)', fontWeight: 700, border: '2px solid var(--color-border)', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 
            }}
          >
            <Save size={18} /> Save Draft
          </button>
          <button
            style={{ 
              padding: '14px 28px', borderRadius: 12, background: 'var(--color-accent)', 
              color: 'white', fontWeight: 700, border: 'none', 
              cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1,
              display: 'flex', alignItems: 'center', gap: 8
            }}
            onClick={handleSave}
            disabled={isSaving}
          >
            <UploadCloud size={18} /> {isSaving ? 'Publishing…' : 'Publish to Game'}
          </button>
        </div>
      </div>
    </div>
  )
}

const formCardStyle = {
  padding: 32,
  borderRadius: 24,
  background: 'var(--color-card-bg)',
  border: '2px solid var(--color-border)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 24
}

const labelStyle = {
  fontSize: 14,
  color: 'var(--color-text)',
  fontWeight: 700,
  display: 'block',
  marginBottom: 10
}

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 12,
  border: '2px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  outline: 'none',
  fontSize: 15,
  boxSizing: 'border-box' as const,
  fontFamily: 'inherit'
}