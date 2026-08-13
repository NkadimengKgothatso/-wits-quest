import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useAuth } from '../context/AuthContext'
import { getFullCollection } from '../services/inventoryService'
import { theme, RARITY_STYLES, STAT_COLORS } from '../styles/theme'
import type { Card } from '../types/card'
import type { CollectionEntry } from '../types/inventory'

const CATEGORIES: (Card['category'] | 'All')[] = ['All', 'Science', 'History', 'Landmarks', 'Lifestyle', 'Sports']
const RARITIES: (Card['rarity'] | 'All')[] = ['All', 'Legendary', 'Epic', 'Rare', 'Common']

function statPercent(v: number) {
  // stat bars are scaled against a 100-point ceiling per attribute
  return Math.min(100, v)
}

function CardDetail({ entry, onClose }: { entry: CollectionEntry; onClose: () => void }) {
  const { card, unlocked } = entry
  const rs = RARITY_STYLES[card.rarity]
  const stats = unlocked ? entry.effectiveStats : card.stats

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(13, 22, 45, 0.9)',
        backdropFilter: 'blur(16px)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: '100%', maxWidth: 360, padding: 24, background: 'rgba(17, 30, 54, 0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(164, 181, 209, 0.15)', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{
          borderRadius: 14,
          border: `2px solid ${unlocked ? rs.color : 'rgba(164, 181, 209, 0.3)'}`,
          background: unlocked ? theme.gradients.cardFrame : theme.gradients.cardFrameLocked,
          overflow: 'hidden', marginBottom: 20,
          boxShadow: unlocked ? `0 0 32px ${rs.glow}` : 'none',
          opacity: unlocked ? 1 : 0.85,
        }}>
          <div style={{
            padding: '8px 14px', display: 'flex', justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.colors.cardBorder}`,
          }}>
            <span style={{ fontFamily: theme.fonts.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: unlocked ? rs.color : theme.colors.mist }}>
              {unlocked ? rs.label : 'UNEXPLORED'}
            </span>
            <span style={{ fontSize: 10, color: theme.colors.inkSoft }}>{card.category}</span>
          </div>

          <div style={{
            height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: unlocked ? rs.soft : theme.colors.paperDeep,
          }}>
            {unlocked ? (
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: theme.colors.cardBg, border: `2px solid ${rs.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: rs.color, fontFamily: theme.fonts.display, fontWeight: 700, fontSize: 18 }}>
                {card.name.substring(0, 2).toUpperCase()}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '0 16px' }}>
                <div style={{
                  width: 54, height: 54, borderRadius: '50%',
                  background: theme.colors.cardBg, border: `2px dashed ${theme.colors.mist}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
                  color: theme.colors.mist, fontSize: 10, fontWeight: 700,
                }}>
                  ?
                </div>
                <span style={{ fontSize: 11, color: theme.colors.inkSoft, fontWeight: 600 }}>Not yet unlocked</span>
              </div>
            )}
          </div>

          <div style={{ padding: '10px 14px', borderTop: `1px solid ${theme.colors.cardBorder}` }}>
            <div style={{ fontFamily: theme.fonts.display, fontSize: 17, fontWeight: 700, color: theme.colors.ink, marginBottom: 12 }}>
              {card.name}
            </div>

            {([
              { k: 'attack', label: 'ATK', v: stats.attack },
              { k: 'defense', label: 'DEF', v: stats.defense },
              { k: 'speed', label: 'SPD', v: stats.speed },
              { k: 'brains', label: 'BRN', v: stats.brains },
            ] as const).map(({ k, label, v }) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: theme.colors.inkSoft, fontWeight: 700 }}>{label}</span>
                  <span style={{ fontFamily: theme.fonts.mono, fontSize: 12, fontWeight: 700, color: unlocked ? STAT_COLORS[k] : theme.colors.mist }}>{v}</span>
                </div>
                <div style={{ height: 5, borderRadius: 4, background: theme.colors.paperDeep, overflow: 'hidden' }}>
                  <div style={{ width: `${statPercent(v)}%`, height: '100%', borderRadius: 4, background: unlocked ? STAT_COLORS[k] : theme.colors.mist }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 12,
          background: unlocked ? theme.colors.mossSoft : theme.colors.rustSoft,
          border: `1px solid ${unlocked ? theme.colors.moss : theme.colors.rust}`,
          color: unlocked ? theme.colors.moss : theme.colors.rust, fontWeight: 600,
        }}>
          {unlocked ? (
            <div>You own <strong>×{entry.quantity}</strong> {entry.quantity === 1 ? 'copy' : 'copies'} of this card.</div>
          ) : (
            <div>
              <div style={{ fontWeight: 800, marginBottom: 4 }}>How to unlock this card</div>
              <div style={{ fontSize: 11, color: theme.colors.inkSoft }}>{entry.unlockHint}</div>
            </div>
          )}
        </div>

        {unlocked && (
          <div style={{ display: 'flex', gap: 10 }}>
            {entry.quantity > 1 && (
              <button style={ghostBtn}>Scrap Duplicate (+50 Essence)</button>
            )}
            <button style={primaryBtn}>Forge Upgrade</button>
          </div>
        )}

        <button onClick={onClose} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: theme.colors.inkSoft, cursor: 'pointer', fontSize: 13, padding: 8, fontWeight: 700 }}>
          Close
        </button>
      </div>
    </div>
  )
}

const primaryBtn: CSSProperties = {
  flex: 1, fontSize: 12, padding: '10px', borderRadius: 10, border: 'none',
  background: theme.colors.brass, color: '#FFFFFF', fontWeight: 700, cursor: 'pointer',
}
const ghostBtn: CSSProperties = {
  flex: 1, fontSize: 12, padding: '10px', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
  background: 'transparent', border: `1px solid ${theme.colors.cardBorder}`, color: theme.colors.inkSoft,
}

export default function CardCollection() {
  const { currentUser } = useAuth()
  const [entries, setEntries] = useState<CollectionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [catFilter, setCatFilter] = useState<Card['category'] | 'All'>('All')
  const [rarityFilter, setRarityFilter] = useState<Card['rarity'] | 'All'>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Unlocked' | 'Locked'>('All')
  const [selectedEntry, setSelectedEntry] = useState<CollectionEntry | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!currentUser?.id) {
      setLoading(false)
      return
    }
    setLoading(true)
    getFullCollection(currentUser.id, {
      rarity: rarityFilter === 'All' ? undefined : [rarityFilter],
      category: catFilter === 'All' ? undefined : catFilter,
      search: searchTerm || undefined,
    })
      .then((res) => !cancelled && setEntries(res))
      .catch(() => !cancelled && setError('Could not load your collection right now.'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [currentUser?.id, rarityFilter, catFilter, searchTerm])

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (statusFilter === 'Unlocked' && !e.unlocked) return false
      if (statusFilter === 'Locked' && e.unlocked) return false
      return true
    })
  }, [entries, statusFilter])

  const unlockedCount = entries.filter((e) => e.unlocked).length
  const totalCount = entries.length || 1
  const completionPct = Math.round((unlockedCount / totalCount) * 100)

  return (
    <div style={{ minHeight: '100vh', background: theme.gradients.page, paddingTop: 70, paddingBottom: 80, fontFamily: theme.fonts.body }}>
      {/* Top control bar */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(17, 30, 54, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.colors.cardBorder}`,
        position: 'sticky', top: 56, zIndex: 20,
      }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
          <input
            placeholder="Search card name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10, border: `1px solid ${theme.colors.cardBorder}`,
              background: theme.colors.cardBg, color: theme.colors.ink, fontSize: 13, outline: 'none',
            }}
          />
          <div style={{
            background: theme.colors.lavenderSoft, border: `1px solid ${theme.colors.lavender}`,
            borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6,
            color: theme.colors.lavender, fontFamily: theme.fonts.mono, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
          }}>
            {currentUser?.essenceBalance ?? 0} ESSENCE
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {(['All', 'Unlocked', 'Locked'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                flex: 1, padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                border: `1px solid ${statusFilter === st ? theme.colors.brass : theme.colors.cardBorder}`,
                background: statusFilter === st ? theme.colors.brassSoft : theme.colors.cardBg,
                color: statusFilter === st ? theme.colors.brass : theme.colors.inkSoft,
                fontSize: 11, fontWeight: 700,
              }}
            >
              {st === 'Unlocked' ? 'Unlocked Cards' : st === 'Locked' ? 'Locked Cards' : 'All Cards'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {RARITIES.map((r) => (
            <button key={r} onClick={() => setRarityFilter(r)} style={pillStyle(rarityFilter === r)}>{r}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2, marginTop: 6 }}>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCatFilter(c)} style={pillStyle(catFilter === c)}>{c}</button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '12px 16px 6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: theme.colors.brass, fontWeight: 700 }}>
            Collection Progress: {unlockedCount} / {entries.length} Cards Unlocked ({completionPct}%)
          </span>
          <span style={{ fontSize: 11, color: theme.colors.inkSoft, fontWeight: 600 }}>
            {filtered.length} Shown
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 4, background: theme.colors.paperDeep, overflow: 'hidden' }}>
          <div style={{ width: `${completionPct}%`, height: '100%', background: theme.colors.moss }} />
        </div>
      </div>

      {loading && (
        <div style={{ padding: 24, textAlign: 'center', color: theme.colors.inkSoft, fontSize: 13 }}>Loading your collection…</div>
      )}
      {error && (
        <div style={{ padding: 24, textAlign: 'center', color: theme.colors.rust, fontSize: 13 }}>{error}</div>
      )}
      {!currentUser?.id && !loading && (
        <div style={{ padding: 24, textAlign: 'center', color: theme.colors.inkSoft, fontSize: 13 }}>Log in to see your collection.</div>
      )}

      {/* Card grid */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, padding: '12px 16px 16px' }}>
          {filtered.map((entry) => {
            const { card, unlocked } = entry
            const rs = RARITY_STYLES[card.rarity]
            return (
              <button
                key={card.id}
                onClick={() => setSelectedEntry(entry)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{
                  borderRadius: 14,
                  border: `1.5px solid ${unlocked ? rs.color : 'rgba(164, 181, 209, 0.25)'}`,
                  background: unlocked ? theme.gradients.cardFrame : theme.gradients.cardFrameLocked,
                  overflow: 'hidden',
                  boxShadow: unlocked && (card.rarity === 'Legendary' || card.rarity === 'Epic') ? `0 0 12px ${rs.glow}` : 'none',
                  opacity: unlocked ? 1 : 0.75,
                }}>
                  <div style={{ padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.colors.cardBorder}` }}>
                    <span style={{ fontFamily: theme.fonts.mono, fontSize: 8, fontWeight: 700, letterSpacing: '0.06em', color: unlocked ? rs.color : theme.colors.mist }}>
                      {unlocked ? rs.label : 'UNEXPLORED'}
                    </span>
                    <span style={{ fontSize: 8, color: theme.colors.inkSoft }}>{card.category}</span>
                  </div>

                  <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: unlocked ? rs.soft : theme.colors.paperDeep, position: 'relative' }}>
                    {unlocked ? (
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: theme.colors.cardBg, border: `1.5px solid ${rs.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: rs.color, fontFamily: theme.fonts.display, fontWeight: 700, fontSize: 13 }}>
                        {card.name.substring(0, 2).toUpperCase()}
                      </div>
                    ) : (
                      <div style={{ width: 42, height: 42, borderRadius: '50%', border: `1.5px dashed ${theme.colors.mist}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.mist, fontSize: 14, fontWeight: 700 }}>
                        ?
                      </div>
                    )}
                    {unlocked && entry.quantity > 1 && (
                      <span style={{ position: 'absolute', top: 4, right: 6, fontSize: 9, color: theme.colors.lavender, fontWeight: 700, background: theme.colors.lavenderSoft, borderRadius: 6, padding: '1px 5px' }}>
                        ×{entry.quantity}
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '6px 8px 8px' }}>
                    <div style={{ fontFamily: theme.fonts.display, fontSize: 11, fontWeight: 700, color: unlocked ? theme.colors.ink : theme.colors.inkSoft, marginBottom: 6, lineHeight: 1.2 }}>
                      {card.name}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px' }}>
                      {([
                        { label: 'ATK', v: unlocked ? entry.effectiveStats.attack : card.stats.attack, c: STAT_COLORS.attack },
                        { label: 'DEF', v: unlocked ? entry.effectiveStats.defense : card.stats.defense, c: STAT_COLORS.defense },
                        { label: 'SPD', v: unlocked ? entry.effectiveStats.speed : card.stats.speed, c: STAT_COLORS.speed },
                        { label: 'BRN', v: unlocked ? entry.effectiveStats.brains : card.stats.brains, c: STAT_COLORS.brains },
                      ]).map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 8, fontWeight: 700, color: unlocked ? s.c : theme.colors.mist }}>{s.label}</span>
                          <div style={{ flex: 1, height: 4, borderRadius: 3, background: theme.colors.paperDeep, overflow: 'hidden' }}>
                            <div style={{ width: `${statPercent(s.v)}%`, height: '100%', background: unlocked ? s.c : theme.colors.mist }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    {!unlocked && (
                      <div style={{ fontSize: 8, color: theme.colors.rust, marginTop: 5, fontWeight: 700 }}>Not yet unlocked</div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selectedEntry && <CardDetail entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}
    </div>
  )
}

function pillStyle(active: boolean): CSSProperties {
  return {
    flexShrink: 0, padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer',
    border: `1px solid ${active ? theme.colors.brass : theme.colors.cardBorder}`,
    background: active ? theme.colors.brassSoft : theme.colors.cardBg,
    color: active ? theme.colors.brass : theme.colors.inkSoft,
  }
}