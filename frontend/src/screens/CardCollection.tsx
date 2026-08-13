import { useState } from 'react'

const CARDS = [
  { id: 1, name: 'Great Hall Pillars', category: 'Landmarks', rarity: 'Legendary', emoji: '🏛️', attack: 85, defense: 95, speed: 40, brains: 90, owned: 1 },
  { id: 2, name: "Solomon's Torch", category: 'History', rarity: 'Epic', emoji: '🔥', attack: 90, defense: 70, speed: 85, brains: 88, owned: 2 },
  { id: 3, name: 'Quantum Reactor', category: 'Science', rarity: 'Rare', emoji: '⚛️', attack: 75, defense: 60, speed: 70, brains: 95, owned: 3 },
  { id: 4, name: 'Senate Seal', category: 'Administration', rarity: 'Rare', emoji: '🏛', attack: 60, defense: 88, speed: 45, brains: 92, owned: 1 },
  { id: 5, name: 'Cave Painting', category: 'Heritage', rarity: 'Common', emoji: '🪨', attack: 40, defense: 50, speed: 35, brains: 78, owned: 4 },
  { id: 6, name: 'Ancient Tome', category: 'Knowledge', rarity: 'Epic', emoji: '📚', attack: 55, defense: 72, speed: 30, brains: 99, owned: 1 },
  { id: 7, name: 'The Rock Drill', category: 'Art', rarity: 'Legendary', emoji: '⛏️', attack: 98, defense: 80, speed: 65, brains: 75, owned: 1 },
  { id: 8, name: 'Wits Springbok', category: 'Sports', rarity: 'Common', emoji: '🦌', attack: 72, defense: 55, speed: 92, brains: 60, owned: 5 },
  { id: 9, name: 'Wits Medical', category: 'Science', rarity: 'Rare', emoji: '🩺', attack: 50, defense: 85, speed: 55, brains: 96, owned: 2 },
  { id: 10, name: 'Star Trails', category: 'Science', rarity: 'Epic', emoji: '✨', attack: 65, defense: 65, speed: 78, brains: 88, owned: 1 },
  { id: 11, name: 'Cullen Archive', category: 'Knowledge', rarity: 'Rare', emoji: '🗃️', attack: 45, defense: 80, speed: 40, brains: 94, owned: 3 },
  { id: 12, name: 'Origins Fossil', category: 'Heritage', rarity: 'Common', emoji: '🦴', attack: 38, defense: 62, speed: 28, brains: 70, owned: 2 },
]

const RARITY_STYLES: Record<string, { border: string; glow: string; label: string; labelColor: string }> = {
  Legendary: { border: '#dca668', glow: 'rgba(220, 166, 104, 0.4)', label: '✦ LEGENDARY', labelColor: '#dca668' },
  Epic: { border: '#c99255', glow: 'rgba(201, 146, 85, 0.3)', label: '◈ EPIC', labelColor: '#c99255' },
  Rare: { border: '#a87d4d', glow: 'rgba(168, 125, 77, 0.3)', label: '◆ RARE', labelColor: '#a87d4d' },
  Common: { border: 'rgba(220, 166, 104, 0.5)', glow: 'transparent', label: '○ COMMON', labelColor: '#dca668' },
}

const STAT_COLORS = { attack: '#f87171', defense: '#dca668', speed: '#facc15', brains: '#e8c99a' }

function CardDetail({ card, onClose }: { card: typeof CARDS[0]; onClose: () => void }) {
  const rs = RARITY_STYLES[card.rarity]
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(63, 47, 18, 0.94)',
        backdropFilter: 'blur(16px)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-modal slide-up" style={{ width: '100%', maxWidth: 360, padding: 24 }}>
        {/* Card display */}
        <div style={{
          borderRadius: 16, border: `2px solid ${rs.border}`,
          background: 'linear-gradient(135deg, #54441b 0%, #6b5630 100%)',
          overflow: 'hidden', marginBottom: 20,
          boxShadow: `0 0 32px ${rs.glow}`,
        }}>
          <div style={{
            padding: '8px 14px', display: 'flex', justifyContent: 'space-between',
            borderBottom: `1px solid ${rs.border}30`,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: rs.labelColor }}>{rs.label}</span>
            <span style={{ fontSize: 10, color: '#dca668' }}>{card.category}</span>
          </div>
          <div style={{
            height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(ellipse at center, ${rs.glow} 0%, transparent 70%)`,
          }}>
            <div className={card.rarity === 'Legendary' ? 'float' : ''} style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(84, 68, 27, 0.8)', border: `2px solid ${rs.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: rs.labelColor, fontWeight: 800, fontSize: 18 }}>
              {card.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
          <div style={{ padding: '10px 14px', borderTop: `1px solid ${rs.border}20` }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 12 }}>{card.name}</div>
            {[
              { k: 'attack', label: 'ATK', v: card.attack },
              { k: 'defense', label: 'DEF', v: card.defense },
              { k: 'speed', label: 'SPD', v: card.speed },
              { k: 'brains', label: 'BRN', v: card.brains },
            ].map(({ k, label, v }) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: '#dca668', fontWeight: 700 }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: STAT_COLORS[k as keyof typeof STAT_COLORS] }}>{v}</span>
                </div>
                <div className="stat-bar-track">
                  <div className="stat-bar-fill" style={{ width: `${v}%`, background: STAT_COLORS[k as keyof typeof STAT_COLORS] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 12, color: '#dca668', marginBottom: 16, textAlign: 'center' }}>
          You own <strong style={{ color: '#dca668' }}>×{card.owned}</strong> copies
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {card.owned > 1 && (
            <button className="btn-ghost" style={{ flex: 1, fontSize: 13, padding: '12px' }}>
              💎 Scrap Duplicate (+50)
            </button>
          )}
          <button className="btn-peach" style={{ flex: 1, fontSize: 13, padding: '12px' }}>
            ⬆ Upgrade (+10%)
          </button>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '100%', marginTop: 10, background: 'none', border: 'none',
            color: '#dca668', cursor: 'pointer', fontSize: 13, padding: 8,
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default function CardCollection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [rarityFilter, setRarityFilter] = useState('All')
  const [selectedCard, setSelectedCard] = useState<typeof CARDS[0] | null>(null)

  const categories = ['All', 'Landmarks', 'History', 'Science', 'Heritage', 'Knowledge', 'Art', 'Sports', 'Administration']
  const rarities = ['All', 'Legendary', 'Epic', 'Rare', 'Common']

  const filtered = CARDS.filter((c) => {
    if (catFilter !== 'All' && c.category !== catFilter) return false
    if (rarityFilter !== 'All' && c.rarity !== rarityFilter) return false
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 30% 10%, #6b5630 0%, #54441b 45%, #3d2f12 100%)', paddingTop: 70, paddingBottom: 80 }}>
      {/* Top control bar */}
      <div
        style={{
          padding: '12px 16px',
          background: 'rgba(63, 47, 18, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(220, 166, 104, 0.15)',
          position: 'sticky', top: 56, zIndex: 20,
        }}
      >
        {/* Search + Essence */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, opacity: 0.5 }}>🔍</span>
            <input
              className="input-glass"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>
          <div style={{
            background: 'rgba(220, 166, 104, 0.15)', border: '1px solid rgba(220, 166, 104, 0.4)',
            borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6,
            color: '#dca668', fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap',
          }}>
            💎 450
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {rarities.map((r) => (
            <button
              key={r}
              onClick={() => setRarityFilter(r)}
              className={`tab-pill ${rarityFilter === r ? 'active' : ''}`}
              style={{ flexShrink: 0 }}
            >
              {r === 'Legendary' ? '✦' : r === 'Epic' ? '◈' : r === 'Rare' ? '◆' : r === 'Common' ? '○' : '⬡'} {r}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2, marginTop: 6 }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`tab-pill ${catFilter === c ? 'active' : ''}`}
              style={{ flexShrink: 0, fontSize: 11 }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Card count */}
      <div style={{ padding: '10px 16px 6px', fontSize: 12, color: '#dca668', fontWeight: 600 }}>
        {filtered.length} cards · {CARDS.reduce((s, c) => s + c.owned, 0)} total owned
      </div>

      {/* Card grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 12,
        padding: '4px 16px 16px',
      }}>
        {filtered.map((card) => {
          const rs = RARITY_STYLES[card.rarity]
          return (
            <button
              key={card.id}
              onClick={() => setSelectedCard(card)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  borderRadius: 14,
                  border: `1.5px solid ${rs.border}`,
                  background: 'linear-gradient(160deg, #54441b 0%, #6b5630 100%)',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: card.rarity === 'Legendary' || card.rarity === 'Epic' ? `0 0 12px ${rs.glow}` : 'none',
                }}
                className={card.rarity === 'Legendary' ? 'card-legendary' : ''}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px) scale(1.02)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px ${rs.glow}`
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.transform = ''
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = card.rarity === 'Legendary' || card.rarity === 'Epic' ? `0 0 12px ${rs.glow}` : 'none'
                }}
              >
                {/* Top bar */}
                <div style={{
                  padding: '6px 8px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: `1px solid ${rs.border}20`,
                }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: rs.labelColor, letterSpacing: '0.06em' }}>
                    {rs.label}
                  </span>
                </div>

                {/* Artwork */}
                <div style={{
                  height: 80,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `radial-gradient(ellipse at center, ${rs.glow} 0%, transparent 70%)`,
                  position: 'relative',
                }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(63, 47, 18, 0.8)', border: `1.5px solid ${rs.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: rs.labelColor, fontWeight: 800, fontSize: 13 }}>
                    {card.name.substring(0, 2).toUpperCase()}
                  </div>
                  {card.owned > 1 && (
                    <span style={{
                      position: 'absolute', top: 4, right: 6,
                      fontSize: 9, color: '#dca668', fontWeight: 700,
                      background: 'rgba(220, 166, 104, 0.15)',
                      borderRadius: 6, padding: '1px 5px',
                    }}>
                      ×{card.owned}
                    </span>
                  )}
                </div>

                {/* Card name + stats */}
                <div style={{ padding: '6px 8px 8px' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'white', marginBottom: 6, lineHeight: 1.2 }}>
                    {card.name}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px' }}>
                    {[
                      { label: 'ATK', v: card.attack, c: STAT_COLORS.attack },
                      { label: 'DEF', v: card.defense, c: STAT_COLORS.defense },
                      { label: 'SPD', v: card.speed, c: STAT_COLORS.speed },
                      { label: 'BRN', v: card.brains, c: STAT_COLORS.brains },
                    ].map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: s.c }}>{s.label}</span>
                        <div className="stat-bar-track" style={{ flex: 1, height: 4 }}>
                          <div className="stat-bar-fill" style={{ width: `${s.v}%`, background: s.c, height: 4 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 9, color: '#dca668', marginTop: 5 }}>{card.category}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {selectedCard && <CardDetail card={selectedCard} onClose={() => setSelectedCard(null)} />}
    </div>
  )
}
