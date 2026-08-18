//AdminContent.tsx
import { useState } from 'react'
import { addCard, RARITY_TARGET_RANGE } from '../../services/cardCatalogService'
import type { Card } from '../../types/card'

type ContentTab = 'trivia' | 'card'

const CATEGORIES: Card['category'][] = ['Landmarks', 'Science', 'History', 'Lifestyle', 'Sports']
const RARITIES: Card['rarity'][] = ['Common', 'Rare', 'Epic', 'Legendary']

export default function AdminContent() {
  const [tab, setTab] = useState<ContentTab>('trivia')
  const [questionType, setQuestionType] = useState<'mc' | 'text'>('mc')
  const [correct, setCorrect] = useState(0)
  const [savedMsg, setSavedMsg] = useState('')

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
    attack: 10,
    defense: 10,
    speed: 10,
    brains: 10,
  })

  const cardTotalCost = cardForm.attack + cardForm.defense + cardForm.speed + cardForm.brains
  const [targetMin, targetMax] = RARITY_TARGET_RANGE[cardForm.rarity]
  const costInRange = cardTotalCost >= targetMin && cardTotalCost <= targetMax

  function handleSave() {
    setSavedMsg('Saved successfully!')
    setTimeout(() => setSavedMsg(''), 2000)
  }

  function handlePublishCard() {
    if (!cardForm.title.trim()) return
    addCard({
      name: cardForm.title.trim(),
      category: cardForm.category,
      rarity: cardForm.rarity,
      stats: {
        attack: cardForm.attack,
        defense: cardForm.defense,
        speed: cardForm.speed,
        brains: cardForm.brains,
      },
    })
    setSavedMsg(`"${cardForm.title.trim()}" published — it will now appear (locked) on student dashboards.`)
    setTimeout(() => setSavedMsg(''), 3000)
    setCardForm({ title: '', category: 'Landmarks', rarity: 'Common', attack: 10, defense: 10, speed: 10, brains: 10 })
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-text)', margin: '0 0 4px' }}>Content Authoring Console</h2>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: 0, fontWeight: 600 }}>Create and edit Wits campus trivia questions and card definitions</p>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {([['trivia', 'Trivia Question Authoring'], ['card', 'Card Set Definitions']] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
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
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Trivia Form */}
      {tab === 'trivia' && (
        <div style={{ padding: 32, borderRadius: 24, background: 'var(--color-card-bg)', border: '2px solid var(--color-border)', boxShadow: '0 8px 32px rgba(44, 34, 30, 0.05)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Event selector */}
          <div>
            <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Linked Event Location</label>
            <select style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontSize: 14 }}>
              <option>The Great Hall History Challenge</option>
              <option>Science Stadium STEM Quiz</option>
              <option>Origins Centre Heritage Trail</option>
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
            />
          </div>

          {/* Options */}
          {questionType === 'mc' ? (
            <div>
              <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 12 }}>
                Answer Options <span style={{ fontSize: 11, color: 'var(--color-success)', marginLeft: 8 }}>(Select the correct answer)</span>
              </label>
              {['A', 'B', 'C', 'D'].map((opt, i) => (
                <div key={opt} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                  <button
                    onClick={() => setCorrect(i)}
                    style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: correct === i ? 'var(--color-success)' : 'var(--color-bg)',
                      border: `2px solid ${correct === i ? 'var(--color-success)' : 'var(--color-border)'}`,
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

          {savedMsg && tab === 'trivia' && (
            <div style={{ color: 'var(--color-success)', fontSize: 14, fontWeight: 800 }}>✓ {savedMsg}</div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button style={{ flex: 1, fontSize: 14, padding: '14px', borderRadius: 12, background: 'transparent', color: 'var(--color-muted)', fontWeight: 800, border: '2px solid var(--color-border)', cursor: 'pointer' }}>Save Draft</button>
            <button style={{ flex: 1, fontSize: 14, padding: '14px', borderRadius: 12, background: 'var(--color-accent)', color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer' }} onClick={handleSave}>
              Submit for Review
            </button>
          </div>
        </div>
      )}

      {/* Card Form */}
      {tab === 'card' && (
        <div style={{ padding: 32, borderRadius: 24, background: 'var(--color-card-bg)', border: '2px solid var(--color-border)', boxShadow: '0 8px 32px rgba(44, 34, 30, 0.05)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Card Title</label>
              <input
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontSize: 14 }}
                placeholder="e.g. Wartenweiler Library"
                value={cardForm.title}
                onChange={(e) => setCardForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Category</label>
              <select
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontSize: 14 }}
                value={cardForm.category}
                onChange={(e) => setCardForm((f) => ({ ...f, category: e.target.value as Card['category'] }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Rarity</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {RARITIES.map((r) => {
                const isSelected = cardForm.rarity === r;
                return (
                  <button
                    key={r}
                    onClick={() => setCardForm((f) => ({ ...f, rarity: r }))}
                    style={{
                      flex: 1, padding: '10px 4px', borderRadius: 10,
                      background: isSelected ? 'var(--color-accent)' : 'transparent',
                      border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      color: isSelected ? 'white' : 'var(--color-muted)',
                      cursor: 'pointer', fontSize: 13, fontWeight: 800,
                    }}
                  >
                    {r}
                  </button>
                )
              })}
            </div>
            <p style={{ fontSize: 11, color: 'var(--color-muted)', margin: '8px 0 0', fontWeight: 600 }}>
              Recommended total stat cost for {cardForm.rarity}: {targetMin}–{targetMax} pts, so decks stay balanced against the rest of the catalog.
            </p>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <label style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: 800 }}>Card Stats</label>
              <span style={{ fontSize: 13, fontWeight: 900, color: costInRange ? 'var(--color-success)' : '#EF4444' }}>
                Total: {cardTotalCost} pts {costInRange ? '✓ balanced' : `(target ${targetMin}–${targetMax})`}
              </span>
            </div>
            {[
              { key: 'attack', label: 'Attack', icon: '⚔', color: '#EF4444' },
              { key: 'defense', label: 'Defense', icon: '🛡', color: '#3B82F6' },
              { key: 'speed', label: 'Speed', icon: '⚡', color: '#F59E0B' },
              { key: 'brains', label: 'Brains', icon: '🧠', color: '#8B5CF6' }
            ].map(({ key, label, icon, color }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 700 }}>{label} {icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color }}>{cardForm[key as keyof typeof cardForm]}</span>
                </div>
                <input
                  type="range" min={0} max={35}
                  value={cardForm[key as keyof typeof cardForm] as number}
                  onChange={(e) => setCardForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: color }}
                />
              </div>
            ))}
          </div>

          {savedMsg && tab === 'card' && (
            <div style={{ color: 'var(--color-success)', fontSize: 14, fontWeight: 800 }}>✓ {savedMsg}</div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button style={{ flex: 1, fontSize: 14, padding: '14px', borderRadius: 12, background: 'transparent', color: 'var(--color-muted)', fontWeight: 800, border: '2px solid var(--color-border)', cursor: 'pointer' }}>Save Draft</button>
            <button
              style={{ flex: 1, fontSize: 14, padding: '14px', borderRadius: 12, background: 'var(--color-accent)', color: 'white', fontWeight: 800, border: 'none', cursor: cardForm.title.trim() ? 'pointer' : 'not-allowed', opacity: cardForm.title.trim() ? 1 : 0.5 }}
              onClick={handlePublishCard}
              disabled={!cardForm.title.trim()}
            >
              Publish Card
            </button>
          </div>
        </div>
      )}
    </div>
  )
}