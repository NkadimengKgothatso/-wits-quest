import { useState } from 'react'

type ContentTab = 'trivia' | 'card'

export default function AdminContent() {
  const [tab, setTab] = useState<ContentTab>('trivia')
  const [questionType, setQuestionType] = useState<'mc' | 'text'>('mc')
  const [correct, setCorrect] = useState(0)
  const [savedMsg, setSavedMsg] = useState('')

  const [cardForm, setCardForm] = useState({
    title: '',
    category: 'Landmarks',
    rarity: 'Common',
    attack: 50,
    defense: 50,
    speed: 50,
    brains: 50,
  })

  function handleSave() {
    setSavedMsg('Saved successfully!')
    setTimeout(() => setSavedMsg(''), 2000)
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: '0 0 4px' }}>Content Authoring Console</h2>
        <p style={{ fontSize: 12, color: '#a4b5d1', margin: 0 }}>Create and edit Wits campus trivia questions and card definitions</p>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([['trivia', 'Trivia Question Authoring'], ['card', 'Card Set Definitions']] as const).map(([t, label]) => (
          <button
            key={t}
            className={`tab-pill ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Trivia Form */}
      {tab === 'trivia' && (
        <div className="glass" style={{ padding: 24, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Event selector */}
          <div>
            <label style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 6 }}>Linked Event Location</label>
            <select className="input-glass" style={{ appearance: 'none' }}>
              <option>Great Hall History Challenge</option>
              <option>Science Stadium STEM Quiz</option>
              <option>Origins Heritage Trail</option>
            </select>
          </div>

          {/* Question type toggle */}
          <div>
            <label style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 8 }}>Question Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {([['mc', 'Multiple Choice'], ['text', 'Text Match']] as const).map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => setQuestionType(t)}
                  style={{
                    padding: '8px 16px', borderRadius: 10,
                    background: questionType === t ? 'rgba(176,203,230,0.2)' : 'rgba(73,104,148,0.3)',
                    border: `1px solid ${questionType === t ? 'rgba(176,203,230,0.6)' : 'rgba(164,181,209,0.25)'}`,
                    color: questionType === t ? '#b0cbe6' : '#a4b5d1',
                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Question text */}
          <div>
            <label style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 6 }}>Question Text</label>
            <textarea
              className="input-glass"
              placeholder="In which year was the iconic Wits Great Hall inaugurated?"
              style={{ minHeight: 80, resize: 'vertical' }}
            />
          </div>

          {/* Options */}
          {questionType === 'mc' ? (
            <div>
              <label style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                Answer Options <span style={{ fontSize: 10, color: '#4ade80' }}>(select correct answer)</span>
              </label>
              {['A', 'B', 'C', 'D'].map((opt, i) => (
                <div key={opt} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <button
                    onClick={() => setCorrect(i)}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: correct === i ? 'rgba(34,197,94,0.3)' : 'rgba(73,104,148,0.4)',
                      border: `1.5px solid ${correct === i ? '#4ade80' : 'rgba(164,181,209,0.3)'}`,
                      color: correct === i ? '#4ade80' : '#a4b5d1',
                      cursor: 'pointer', fontSize: 11, fontWeight: 800,
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {correct === i ? '✓' : opt}
                  </button>
                  <input
                    className="input-glass"
                    placeholder={`Option ${opt}`}
                    style={{ flex: 1 }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div>
              <label style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 6 }}>Accepted Answers (comma-separated)</label>
              <input className="input-glass" placeholder="1922, nineteen twenty-two" />
            </div>
          )}

          {savedMsg && (
            <div style={{ color: '#4ade80', fontSize: 13, fontWeight: 700 }}>✓ {savedMsg}</div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" style={{ flex: 1, fontSize: 13, padding: '12px' }}>Save Draft</button>
            <button className="btn-peach" style={{ flex: 1, fontSize: 13, padding: '12px' }} onClick={handleSave}>
              Submit for Review
            </button>
          </div>
        </div>
      )}

      {/* Card Form */}
      {tab === 'card' && (
        <div className="glass" style={{ padding: 24, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 6 }}>Card Title</label>
              <input
                className="input-glass"
                placeholder="Great Hall Pillars"
                value={cardForm.title}
                onChange={(e) => setCardForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 6 }}>Category</label>
              <select
                className="input-glass"
                style={{ appearance: 'none' }}
                value={cardForm.category}
                onChange={(e) => setCardForm((f) => ({ ...f, category: e.target.value }))}
              >
                {['Landmarks', 'Science', 'History', 'Heritage', 'Knowledge', 'Sports', 'Art'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 6 }}>Rarity</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['Common', 'Rare', 'Epic', 'Legendary'] as const).map((r) => {
                const colorMap: Record<string, string> = { Common: '#a4b5d1', Rare: '#60a5fa', Epic: '#a78bfa', Legendary: '#fed6ce' }
                return (
                  <button
                    key={r}
                    onClick={() => setCardForm((f) => ({ ...f, rarity: r }))}
                    style={{
                      flex: 1, padding: '7px 4px', borderRadius: 8,
                      background: cardForm.rarity === r ? `${colorMap[r]}25` : 'rgba(73,104,148,0.3)',
                      border: `1px solid ${cardForm.rarity === r ? colorMap[r] : 'rgba(164,181,209,0.2)'}`,
                      color: cardForm.rarity === r ? colorMap[r] : '#a4b5d1',
                      cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      fontFamily: 'Outfit, sans-serif',
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
            <label style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600, display: 'block', marginBottom: 6 }}>Card Artwork</label>
            <div style={{
              border: '2px dashed rgba(164,181,209,0.3)', borderRadius: 12, padding: 24,
              textAlign: 'center', cursor: 'pointer',
              background: 'rgba(29,49,86,0.4)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
              <div style={{ fontSize: 12, color: '#a4b5d1' }}>Drop artwork here or click to upload</div>
              <div style={{ fontSize: 10, color: 'rgba(164,181,209,0.5)', marginTop: 4 }}>PNG, JPG, SVG — Recommended 512×512</div>
            </div>
          </div>

          {/* Stat sliders */}
          <div>
            <label style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 700, display: 'block', marginBottom: 10 }}>Card Stats</label>
            {[
              { key: 'attack', label: 'Attack (ATK)', color: '#f87171' },
              { key: 'defense', label: 'Defense (DEF)', color: '#60a5fa' },
              { key: 'speed', label: 'Speed (SPD)', color: '#facc15' },
              { key: 'brains', label: 'Brains (BRN)', color: '#a78bfa' },
            ].map(({ key, label, color }) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color }}>{cardForm[key as keyof typeof cardForm]}</span>
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

          {savedMsg && <div style={{ color: '#4ade80', fontSize: 13, fontWeight: 700 }}>✓ {savedMsg}</div>}

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" style={{ flex: 1, fontSize: 13, padding: '12px' }}>Save Draft</button>
            <button className="btn-peach" style={{ flex: 1, fontSize: 13, padding: '12px' }} onClick={handleSave}>
              Publish Card
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
