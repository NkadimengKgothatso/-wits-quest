import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPlayerInventory } from '../services/inventoryService'
import { validateDeck, saveDeck } from '../services/deckService'
import { theme, RARITY_STYLES, STAT_COLORS } from '../styles/theme'
import type { InventoryEntry } from '../types/inventory'

export default function DeckBuilder() {
  const { currentUser } = useAuth()
  const maxStatBudget = currentUser?.maxStatBudget ?? 300
  const legendaryCap = currentUser?.legendaryCap ?? 1

  const [collection, setCollection] = useState<InventoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [deck, setDeck] = useState<(InventoryEntry | null)[]>([null, null, null, null, null])
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveErrors, setSaveErrors] = useState<string[]>([])

  useEffect(() => {
    if (!currentUser?.id) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    getPlayerInventory(currentUser.id)
      .then((res) => !cancelled && setCollection(res))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [currentUser?.id])

  const validation = validateDeck(deck, maxStatBudget, legendaryCap)
  const filled = deck.filter(Boolean).length
  const inDeck = new Set(deck.filter(Boolean).map((c) => c!.inventoryId))

  function addCard(entry: InventoryEntry) {
    const emptyIdx = deck.findIndex((s) => s === null)
    if (emptyIdx === -1 || inDeck.has(entry.inventoryId)) return
    const next = [...deck]
    next[emptyIdx] = entry
    setDeck(next)
    setSaveState('idle')
  }

  function removeCard(idx: number) {
    const next = [...deck]
    next[idx] = null
    setDeck(next)
    setSaveState('idle')
  }

  async function handleSave() {
    if (!validation.valid || !currentUser?.id) return
    setSaveState('saving')
    const result = await saveDeck(currentUser.id, 'My Battle Deck', deck)
    if (result.success) {
      setSaveState('saved')
      setSaveErrors([])
    } else {
      setSaveState('error')
      setSaveErrors(result.errors ?? ['Deck could not be saved.'])
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: theme.gradients.pageAlt, paddingTop: 70, paddingBottom: 80, fontFamily: theme.fonts.body }}>
      {/* Active deck */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontFamily: theme.fonts.display, fontSize: 19, fontWeight: 700, color: theme.colors.ink, margin: 0 }}>Active Deck</h2>
            <p style={{ fontSize: 12, color: theme.colors.inkSoft, margin: '2px 0 0' }}>Select 5 cards for battle</p>
          </div>
          <button
            onClick={handleSave}
            disabled={!validation.valid || saveState === 'saving'}
            style={{
              fontSize: 13, padding: '9px 18px', borderRadius: 10, border: 'none', cursor: validation.valid ? 'pointer' : 'not-allowed',
              background: validation.valid ? theme.colors.brass : theme.colors.paperDeep,
              color: validation.valid ? '#FFFFFF' : theme.colors.mist,
              fontWeight: 700,
            }}
          >
            {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? '✓ Saved!' : 'Save Deck'}
          </button>
        </div>

        {/* Deck slots */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {deck.map((entry, i) => (
            <div key={i} style={{ flex: 1, aspectRatio: '2/3', minWidth: 0 }}>
              {entry ? (
                <div
                  onClick={() => removeCard(i)}
                  style={{
                    width: '100%', height: '100%', borderRadius: 12, cursor: 'pointer', position: 'relative',
                    border: `1.5px solid ${RARITY_STYLES[entry.card.rarity].color}`,
                    background: theme.gradients.cardFrame,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}
                >
                  <div style={{ fontFamily: theme.fonts.display, fontSize: 13, fontWeight: 700, color: theme.colors.ink }}>
                    {entry.card.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: theme.colors.inkSoft, textAlign: 'center', padding: '0 4px', lineHeight: 1.2 }}>
                    {entry.card.name}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeCard(i) }}
                    style={{
                      position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: '50%',
                      background: theme.colors.rustSoft, border: 'none', color: theme.colors.rust, fontSize: 10,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{
                  width: '100%', height: '100%', borderRadius: 12, border: `1.5px dashed ${theme.colors.cardBorder}`,
                  background: theme.colors.paperDeep, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: theme.colors.mist, fontSize: 20,
                }}>
                  +
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Constraint meters */}
        <div style={{ padding: 14, borderRadius: 14, background: theme.colors.cardBg, border: `1px solid ${theme.colors.cardBorder}` }}>
          <Meter label="Card Slots" value={filled} max={5} display={`${filled}/5`} ok={filled === 5} />
          <Meter label="Deck Stat Cost" value={validation.totalStatCost} max={maxStatBudget} display={`${validation.totalStatCost} / ${maxStatBudget} Max`} ok={validation.totalStatCost <= maxStatBudget} />
          <Meter label="Legendary Cap" value={validation.legendaryCount} max={legendaryCap} display={`${validation.legendaryCount} / ${legendaryCap} Max`} ok={validation.legendaryCount <= legendaryCap} last />
        </div>

        {validation.errors.length > 0 && filled > 0 && (
          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: theme.colors.rustSoft, border: `1px solid ${theme.colors.rust}` }}>
            {validation.errors.map((e, i) => (
              <div key={i} style={{ fontSize: 11, color: theme.colors.rust, fontWeight: 600 }}>{e}</div>
            ))}
          </div>
        )}
        {saveState === 'error' && saveErrors.length > 0 && (
          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: theme.colors.rustSoft, border: `1px solid ${theme.colors.rust}` }}>
            {saveErrors.map((e, i) => (
              <div key={i} style={{ fontSize: 11, color: theme.colors.rust, fontWeight: 600 }}>{e}</div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 1, background: theme.colors.cardBorder, margin: '4px 0' }} />

      {/* Collection drawer */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: theme.colors.inkSoft, marginBottom: 10 }}>
          Your Collection — tap to add
        </div>

        {loading && <div style={{ fontSize: 13, color: theme.colors.inkSoft, padding: '12px 0' }}>Loading your cards…</div>}
        {!currentUser?.id && !loading && <div style={{ fontSize: 13, color: theme.colors.inkSoft, padding: '12px 0' }}>Log in to build a deck.</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {collection.map((entry) => {
            const alreadyIn = inDeck.has(entry.inventoryId)
            const deckFull = filled >= 5
            const disabled = alreadyIn || (deckFull && !alreadyIn)
            const rs = RARITY_STYLES[entry.card.rarity]

            return (
              <div
                key={entry.inventoryId}
                style={{
                  background: alreadyIn ? theme.colors.paperDeep : theme.colors.cardBg,
                  border: `1px solid ${alreadyIn ? theme.colors.cardBorder : theme.colors.cardBorder}`,
                  borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12,
                  opacity: disabled && !alreadyIn ? 0.5 : 1,
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: rs.soft, border: `1px solid ${rs.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: rs.color, fontWeight: 700, fontSize: 10, flexShrink: 0 }}>
                  {entry.card.name.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: theme.colors.ink }}>{entry.card.name}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: rs.color, background: rs.soft, borderRadius: 4, padding: '1px 5px' }}>
                      {entry.card.rarity}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, fontFamily: theme.fonts.mono, fontSize: 11, fontWeight: 700 }}>
                    <span style={{ color: STAT_COLORS.attack }}>ATK {entry.effectiveStats.attack}</span>
                    <span style={{ color: STAT_COLORS.defense }}>DEF {entry.effectiveStats.defense}</span>
                    <span style={{ color: STAT_COLORS.speed }}>SPD {entry.effectiveStats.speed}</span>
                    <span style={{ color: STAT_COLORS.brains }}>BRN {entry.effectiveStats.brains}</span>
                  </div>
                  <div style={{ fontSize: 10, color: theme.colors.inkSoft, marginTop: 2 }}>Cost: {entry.totalStatCost} pts · ×{entry.quantity} owned</div>
                </div>
                {alreadyIn ? (
                  <div style={{ fontSize: 11, color: theme.colors.moss, fontWeight: 700, flexShrink: 0 }}>✓ In Deck</div>
                ) : (
                  <button
                    onClick={() => !disabled && addCard(entry)}
                    disabled={disabled}
                    style={{
                      fontSize: 11, padding: '6px 14px', borderRadius: 8, flexShrink: 0,
                      background: '#1d3156', border: `1px solid ${theme.colors.brass}`,
                      color: theme.colors.brass, fontWeight: 700,
                      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
                    }}
                  >
                    + Add
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Meter({ label, value, max, display, ok, last }: { label: string; value: number; max: number; display: string; ok: boolean; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: theme.colors.inkSoft, fontWeight: 600 }}>{label}</span>
        <span style={{ fontFamily: theme.fonts.mono, fontSize: 12, fontWeight: 700, color: ok ? theme.colors.moss : theme.colors.rust }}>{display}</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: theme.colors.paperDeep, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: '100%', background: ok ? theme.colors.moss : theme.colors.rust }} />
      </div>
    </div>
  )
}