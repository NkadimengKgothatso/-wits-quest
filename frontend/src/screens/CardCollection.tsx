import { useState } from 'react'

export interface CollectionCard {
  id: number
  name: string
  category: string
  rarity: 'Legendary' | 'Epic' | 'Rare' | 'Common'
  attack: number
  defense: number
  speed: number
  brains: number
  owned: number
  landmarkLocation: string
  unlockInstruction: string
}

const ALL_MASTER_CARDS: CollectionCard[] = [
  { id: 1, name: 'Great Hall Pillars', category: 'Landmarks', rarity: 'Legendary', attack: 85, defense: 95, speed: 40, brains: 90, owned: 1, landmarkLocation: 'Great Hall', unlockInstruction: 'Unlocked via Great Hall GPS Trivia Challenge' },
  { id: 2, name: "Solomon's Torch", category: 'History', rarity: 'Epic', attack: 90, defense: 70, speed: 85, brains: 88, owned: 2, landmarkLocation: 'Solomon Mahlangu House', unlockInstruction: 'Unlocked via Solomon Mahlangu House GPS Trivia' },
  { id: 3, name: 'Quantum Reactor', category: 'Science', rarity: 'Rare', attack: 75, defense: 60, speed: 70, brains: 95, owned: 3, landmarkLocation: 'Science Stadium', unlockInstruction: 'Unlocked via Science Stadium GPS Trivia' },
  { id: 4, name: 'Senate Seal', category: 'Administration', rarity: 'Rare', attack: 60, defense: 88, speed: 45, brains: 92, owned: 1, landmarkLocation: 'Solomon Mahlangu House', unlockInstruction: 'Unlocked via Senate House Landmark Event' },
  { id: 5, name: 'Cave Painting', category: 'Heritage', rarity: 'Common', attack: 40, defense: 50, speed: 35, brains: 78, owned: 4, landmarkLocation: 'Origins Centre', unlockInstruction: 'Unlocked via Origins Centre Museum Trivia' },
  { id: 6, name: 'Ancient Tome', category: 'Knowledge', rarity: 'Epic', attack: 55, defense: 72, speed: 30, brains: 99, owned: 1, landmarkLocation: 'Cullen Library', unlockInstruction: 'Unlocked via Cullen Library Rare Archives Trivia' },
  { id: 7, name: 'The Rock Drill', category: 'Art', rarity: 'Legendary', attack: 98, defense: 80, speed: 65, brains: 75, owned: 1, landmarkLocation: 'WAM Art Museum', unlockInstruction: 'Unlocked via Wits Art Museum GPS Check-in' },
  { id: 8, name: 'Wits Springbok', category: 'Sports', rarity: 'Common', attack: 72, defense: 55, speed: 92, brains: 60, owned: 5, landmarkLocation: 'Wits Diggers Field', unlockInstruction: 'Unlocked via Wits Sports Field Trivia' },
  { id: 9, name: 'Wits Medical', category: 'Science', rarity: 'Rare', attack: 50, defense: 85, speed: 55, brains: 96, owned: 2, landmarkLocation: 'Medical School', unlockInstruction: 'Unlocked via Health Sciences Campus Trivia' },
  { id: 10, name: 'Star Trails', category: 'Science', rarity: 'Epic', attack: 65, defense: 65, speed: 78, brains: 88, owned: 1, landmarkLocation: 'Planetarium', unlockInstruction: 'Unlocked via Wits Planetarium Night Event' },
  { id: 11, name: 'Cullen Archive', category: 'Knowledge', rarity: 'Rare', attack: 45, defense: 80, speed: 40, brains: 94, owned: 3, landmarkLocation: 'Cullen Library', unlockInstruction: 'Unlocked via Cullen Library Main Desk Check-in' },
  { id: 12, name: 'Origins Fossil', category: 'Heritage', rarity: 'Common', attack: 38, defense: 62, speed: 28, brains: 70, owned: 2, landmarkLocation: 'Origins Centre', unlockInstruction: 'Unlocked via Origins Museum Entrance Trivia' },
  // LOCKED CARDS UNLOCKED BY MAP EXPLORATION:
  { id: 13, name: 'High Voltage Coil', category: 'Science', rarity: 'Legendary', attack: 92, defense: 68, speed: 84, brains: 91, owned: 0, landmarkLocation: 'Chamber of Mines Engineering', unlockInstruction: 'Locked: Walk within 25m of Engineering Block & complete trivia challenge' },
  { id: 14, name: 'Biomedical Genome', category: 'Science', rarity: 'Epic', attack: 62, defense: 78, speed: 60, brains: 97, owned: 0, landmarkLocation: 'Medical School Lab', unlockInstruction: 'Locked: Walk within 25m of Medical School & complete trivia challenge' },
  { id: 15, name: 'Mandelstam Theorem', category: 'Knowledge', rarity: 'Epic', attack: 70, defense: 65, speed: 50, brains: 98, owned: 0, landmarkLocation: 'Mathematical Sciences Building', unlockInstruction: 'Locked: Walk within 25m of Maths Building & complete trivia challenge' },
  { id: 16, name: 'Law Moot Shield', category: 'Administration', rarity: 'Rare', attack: 68, defense: 92, speed: 42, brains: 89, owned: 0, landmarkLocation: 'Oliver Schreiner Law Building', unlockInstruction: 'Locked: Walk within 25m of Law Building & complete trivia challenge' },
]

const RARITY_STYLES: Record<string, { border: string; glow: string; label: string; labelColor: string }> = {
  Legendary: { border: '#dca668', glow: 'rgba(220, 166, 104, 0.4)', label: '✦ LEGENDARY', labelColor: '#dca668' },
  Epic: { border: '#c99255', glow: 'rgba(201, 146, 85, 0.3)', label: '◈ EPIC', labelColor: '#c99255' },
  Rare: { border: '#a87d4d', glow: 'rgba(168, 125, 77, 0.3)', label: '◆ RARE', labelColor: '#a87d4d' },
  Common: { border: 'rgba(220, 166, 104, 0.5)', glow: 'transparent', label: '○ COMMON', labelColor: '#dca668' },
}

const STAT_COLORS = { attack: '#f87171', defense: '#dca668', speed: '#facc15', brains: '#e8c99a' }

function CardDetail({ card, onClose }: { card: CollectionCard; onClose: () => void }) {
  const isLocked = card.owned === 0
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
          boxShadow: isLocked ? 'none' : `0 0 32px ${rs.glow}`,
          opacity: isLocked ? 0.85 : 1,
        }}>
          <div style={{
            padding: '8px 14px', display: 'flex', justifyContent: 'space-between',
            borderBottom: `1px solid ${rs.border}30`,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: rs.labelColor }}>{rs.label}</span>
            <span style={{ fontSize: 10, color: '#dca668' }}>{card.category}</span>
          </div>

          <div style={{
            height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: isLocked ? 'rgba(15, 26, 46, 0.6)' : `radial-gradient(ellipse at center, ${rs.glow} 0%, transparent 70%)`,
            position: 'relative',
          }}>
            <div className={card.rarity === 'Legendary' ? 'float' : ''} style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(84, 68, 27, 0.8)', border: `2px solid ${rs.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: rs.labelColor, fontWeight: 800, fontSize: 18 }}>
              {card.name.substring(0, 2).toUpperCase()}
            </div>
          </div>

          <div style={{ padding: '10px 14px', borderTop: `1px solid ${rs.border}20` }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: isLocked ? '#a4b5d1' : 'white', marginBottom: 12 }}>
              {card.name}
            </div>

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
                  <div className="stat-bar-fill" style={{ width: `${v}%`, background: isLocked ? '#a4b5d1' : STAT_COLORS[k as keyof typeof STAT_COLORS] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 12, color: '#dca668', marginBottom: 16, textAlign: 'center' }}>
          You own <strong style={{ color: '#dca668' }}>×{card.owned}</strong> copies
        </div>

        {!isLocked && (
          <div style={{ display: 'flex', gap: 10 }}>
            {card.owned > 1 && (
              <button className="btn-ghost" style={{ flex: 1, fontSize: 12, padding: '10px' }}>
                Scrap Duplicate (+50 Essence)
              </button>
            )}
            <button className="btn-peach" style={{ flex: 1, fontSize: 12, padding: '10px' }}>
              Forge Upgrade (+10%)
            </button>
          </div>
        )}

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
  const [statusFilter, setStatusFilter] = useState<'All' | 'Unlocked' | 'Locked'>('All')
  const [selectedCard, setSelectedCard] = useState<CollectionCard | null>(null)

  const categories = ['All', 'Landmarks', 'History', 'Science', 'Heritage', 'Knowledge', 'Art', 'Sports', 'Administration']
  const rarities = ['All', 'Legendary', 'Epic', 'Rare', 'Common']

  const unlockedCount = ALL_MASTER_CARDS.filter((c) => c.owned > 0).length
  const totalMasterCount = ALL_MASTER_CARDS.length
  const completionPercentage = Math.round((unlockedCount / totalMasterCount) * 100)

  const filtered = ALL_MASTER_CARDS.filter((c) => {
    if (statusFilter === 'Unlocked' && c.owned === 0) return false
    if (statusFilter === 'Locked' && c.owned > 0) return false
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
        {/* Search + Collection Progress Header */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              className="input-glass"
              placeholder="Search card name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 14 }}
            />
          </div>
          <div style={{
            background: 'rgba(220, 166, 104, 0.15)', border: '1px solid rgba(220, 166, 104, 0.4)',
            borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6,
            color: '#dca668', fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap',
          }}>
            450 ESSENCE
          </div>
        </div>

        {/* Lock Status Filter Pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {(['All', 'Unlocked', 'Locked'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 8,
                border: `1px solid ${statusFilter === st ? '#fed6ce' : 'rgba(164, 181, 209, 0.2)'}`,
                background: statusFilter === st ? 'rgba(254, 214, 206, 0.2)' : 'rgba(73, 104, 148, 0.2)',
                color: statusFilter === st ? '#fed6ce' : '#a4b5d1',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {st === 'Unlocked' ? 'Unlocked Cards' : st === 'Locked' ? 'Locked Cards' : 'All Cards'}
            </button>
          ))}
        </div>

        {/* Rarity & Category Filters */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {rarities.map((r) => (
            <button
              key={r}
              onClick={() => setRarityFilter(r)}
              className={`tab-pill ${rarityFilter === r ? 'active' : ''}`}
              style={{ flexShrink: 0 }}
            >
              {r}
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
        {filtered.length} cards · {ALL_MASTER_CARDS.reduce((s, c) => s + c.owned, 0)} total owned
      </div>

      {/* Card grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 12,
        padding: '12px 16px 16px',
      }}>
        {filtered.map((card) => {
          const isLocked = card.owned === 0
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
                  boxShadow: !isLocked && (card.rarity === 'Legendary' || card.rarity === 'Epic') ? `0 0 12px ${rs.glow}` : 'none',
                  opacity: isLocked ? 0.75 : 1,
                  position: 'relative',
                }}
              >
                {/* Top status bar */}
                <div style={{
                  padding: '6px 8px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: `1px solid ${rs.border}20`,
                  background: isLocked ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: isLocked ? '#f87171' : rs.labelColor, letterSpacing: '0.06em' }}>
                    {isLocked ? 'LOCKED' : rs.label}
                  </span>
                  <span style={{ fontSize: 8, color: '#a4b5d1' }}>{card.category}</span>
                </div>

                {/* Artwork */}
                <div style={{
                  height: 80,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: isLocked ? 'rgba(15, 26, 46, 0.8)' : `radial-gradient(ellipse at center, ${rs.glow} 0%, transparent 70%)`,
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
                      x{card.owned}
                    </span>
                  )}
                </div>

                {/* Card name + stats */}
                <div style={{ padding: '6px 8px 8px' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: isLocked ? '#a4b5d1' : 'white', marginBottom: 6, lineHeight: 1.2 }}>
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
                        <span style={{ fontSize: 8, fontWeight: 700, color: isLocked ? '#a4b5d1' : s.c }}>{s.label}</span>
                        <div className="stat-bar-track" style={{ flex: 1, height: 4 }}>
                          <div className="stat-bar-fill" style={{ width: `${s.v}%`, background: isLocked ? '#a4b5d1' : s.c, height: 4 }} />
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

