import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPlayerInventory } from '../services/inventoryService'
import { validateDeck, saveDeck } from '../services/deckService'
import { CATALOG_UPDATED_EVENT } from '../services/cardCatalogService'
import type { InventoryEntry } from '../types/inventory'

const RARITY_BORDER: Record<string, string> = {
  Legendary: '#dca668',
  Epic: '#c99255',
  Rare: '#a87d4d',
  Common: 'rgba(220, 166, 104, 0.5)',
}

export default function DeckBuilder() {
  const { currentUser: user } = useAuth()
  const [deck, setDeck] = useState<(InventoryEntry | null)[]>([null, null, null, null, null])
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveErrors, setSaveErrors] = useState<string[]>([])
  const [collection, setCollection] = useState<InventoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  function loadCollection() {
    if (!user?.id) { setLoading(false); return }
    setLoading(true)
    getPlayerInventory(user.id)
      .then((cards) => setCollection(cards || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCollection()
  }, [user?.id])

  // Refresh when Admin publishes a new card so it can show up here once unlocked
  useEffect(() => {
    const handler = () => loadCollection()
    window.addEventListener(CATALOG_UPDATED_EVENT, handler)
    return () => window.removeEventListener(CATALOG_UPDATED_EVENT, handler)
  }, [user?.id])

  const maxStatBudget = user?.maxStatBudget ?? 300
  const legendaryCap = user?.legendaryCap ?? 1
  const validation = validateDeck(deck, maxStatBudget, legendaryCap)
  const filled = deck.filter(Boolean).length

  function addCard(entry: InventoryEntry) {
    const emptyIdx = deck.findIndex((s) => s === null)
    if (emptyIdx === -1) return
    if (deck.some((c) => c?.inventoryId === entry.inventoryId)) return
    const newDeck = [...deck]
    newDeck[emptyIdx] = entry
    setDeck(newDeck)
    setSaveState('idle')
  }

  function removeCard(idx: number) {
    const newDeck = [...deck]
    newDeck[idx] = null
    setDeck(newDeck)
    setSaveState('idle')
  }

  async function handleSave() {
    if (!validation.valid || !user?.id) return
    setSaveState('saving')
    const result = await saveDeck(user.id, 'My Battle Deck', deck)
    if (result.success) {
      setSaveState('saved')
      setSaveErrors([])
    } else {
      setSaveState('error')
      setSaveErrors(result.errors ?? ['Deck could not be saved.'])
    }
  }

  const inDeck = new Set(deck.filter(Boolean).map((c) => c!.inventoryId))
  const canSave = validation.valid

  if (!user) return null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 60% 0%, #6b5630 0%, #54441b 50%, #3d2f12 100%)',
      paddingTop: 84,
      paddingBottom: 80,
    }}>
      {/* Top half — Active Deck */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0 }}>Active Deck</h2>
            <p style={{ fontSize: 12, color: '#dca668', margin: '2px 0 0' }}>Select 5 cards for battle</p>
          </div>
          <button
            className={canSave ? 'btn-peach' : 'btn-ghost'}
            style={{
              fontSize: 13,
              padding: '8px 18px',
              opacity: canSave ? 1 : 0.5,
              background: canSave ? '#dca668' : 'rgba(220, 166, 104, 0.2)',
              border: 'none',
              borderRadius: 8,
              color: canSave ? '#1f1608' : '#dca668',
              fontWeight: 800,
              cursor: canSave ? 'pointer' : 'not-allowed',
            }}
            onClick={handleSave}
            disabled={!canSave || saveState === 'saving'}
          >
            {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? '✓ Saved!' : 'Save Deck'}
          </button>
        </div>

        {/* Deck slots - with images */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {deck.map((entry, i) => (
            <div
              key={i}
              style={{ flex: 1, aspectRatio: '2/3', minWidth: 0 }}
            >
              {entry ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 12,
                    border: `1.5px solid ${RARITY_BORDER[entry.card.rarity]}`,
                    background: 'linear-gradient(160deg, #54441b 0%, #6b5630 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    overflow: 'hidden',
                  }}
                  onClick={() => removeCard(i)}
                >
                  <img
                    src={entry.card.image}
                    alt={entry.card.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeCard(i) }}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 16, height: 16, borderRadius: '50%',
                      background: 'rgba(239, 68, 68, 0.6)',
                      border: 'none', color: 'white', fontSize: 10,
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      zIndex: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 12,
                  border: '1.5px dashed rgba(220, 166, 104, 0.3)',
                  background: 'rgba(84, 68, 27, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(220, 166, 104, 0.4)',
                  fontSize: 20,
                  aspectRatio: '2/3',
                }}>
                  +
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Constraint meters */}
        <div className="glass-dark" style={{ padding: 14, borderRadius: 14, background: 'rgba(84, 68, 27, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(220, 166, 104, 0.15)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Slot count */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#dca668', fontWeight: 600 }}>Card Slots</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: filled === 5 ? '#4ade80' : 'white' }}>
                  {filled}/5
                </span>
              </div>
              <div className="stat-bar-track" style={{ background: 'rgba(0,0,0,0.3)', height: 6, borderRadius: 3 }}>
                <div className="stat-bar-fill" style={{
                  width: `${(filled / 5) * 100}%`,
                  height: '100%',
                  background: filled === 5 ? '#4ade80' : '#dca668',
                  borderRadius: 3,
                }} />
              </div>
            </div>

            {/* Total Stat Cost */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#dca668', fontWeight: 600 }}>Deck Stat Cost</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: validation.totalStatCost > maxStatBudget ? '#f87171' : '#e8c99a' }}>
                  {validation.totalStatCost} / {maxStatBudget} Max
                </span>
              </div>
              <div className="stat-bar-track" style={{ background: 'rgba(0,0,0,0.3)', height: 6, borderRadius: 3 }}>
                <div className="stat-bar-fill" style={{
                  width: `${Math.min(100, (validation.totalStatCost / maxStatBudget) * 100)}%`,
                  height: '100%',
                  background: validation.totalStatCost > maxStatBudget ? '#f87171' : 'linear-gradient(90deg, #e8c99a, #dca668)',
                  borderRadius: 3,
                }} />
              </div>
            </div>

            {/* Legendary Cap */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#dca668', fontWeight: 600 }}>Legendary Cap</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: validation.legendaryCount > legendaryCap ? '#f87171' : '#dca668' }}>
                  {validation.legendaryCount} / {legendaryCap} Max
                </span>
              </div>
              <div className="stat-bar-track" style={{ background: 'rgba(0,0,0,0.3)', height: 6, borderRadius: 3 }}>
                <div className="stat-bar-fill" style={{
                  width: validation.legendaryCount > 0 ? '100%' : '0%',
                  height: '100%',
                  background: validation.legendaryCount > legendaryCap ? '#f87171' : '#dca668',
                  borderRadius: 3,
                }} />
              </div>
            </div>
          </div>
        </div>

        {validation.errors.length > 0 && filled > 0 && (
          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #f87171' }}>
            {validation.errors.map((e, i) => (
              <div key={i} style={{ fontSize: 11, color: '#f87171', fontWeight: 600 }}>{e}</div>
            ))}
          </div>
        )}
        {saveState === 'error' && saveErrors.length > 0 && (
          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #f87171' }}>
            {saveErrors.map((e, i) => (
              <div key={i} style={{ fontSize: 11, color: '#f87171', fontWeight: 600 }}>{e}</div>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(220, 166, 104, 0.3), transparent)', margin: '16px 0' }} />

      {/* Bottom half — Collection drawer */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#dca668', marginBottom: 16 }}>
          📦 Your Collection — tap to add
        </div>

        {loading ? (
           <div style={{ textAlign: 'center', padding: '20px', color: '#dca668' }}>Loading collection...</div>
        ) : !user ? (
           <div style={{ textAlign: 'center', padding: '20px', color: '#dca668' }}>Log in to build a deck.</div>
        ) : collection.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '20px', color: '#dca668' }}>No cards available.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {collection.map((entry) => {
              const alreadyIn = inDeck.has(entry.inventoryId)
              const deckFull = filled >= 5
              const disabled = alreadyIn || (deckFull && !alreadyIn)

              return (
                <div
                  key={entry.inventoryId}
                  style={{
                    background: alreadyIn ? 'rgba(232, 201, 154, 0.1)' : 'rgba(107, 125, 44, 0.35)',
                    border: `1px solid ${alreadyIn ? 'rgba(232, 201, 154, 0.5)' : 'rgba(220, 166, 104, 0.2)'}`,
                    borderRadius: 12,
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    opacity: disabled && !alreadyIn ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(84, 68, 27, 0.8)',
                    border: `1px solid ${RARITY_BORDER[entry.card.rarity]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    <img
                      src={entry.card.image}
                      alt={entry.card.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{entry.card.name}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: RARITY_BORDER[entry.card.rarity], background: `${RARITY_BORDER[entry.card.rarity]}18`, borderRadius: 4, padding: '1px 5px' }}>
                        {entry.card.rarity}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11, fontWeight: 700 }}>
                      <span style={{ color: '#f87171' }}>ATK {entry.effectiveStats.attack}</span>
                      <span style={{ color: '#dca668' }}>DEF {entry.effectiveStats.defense}</span>
                      <span style={{ color: '#facc15' }}>SPD {entry.effectiveStats.speed}</span>
                      <span style={{ color: '#e8c99a' }}>BRN {entry.effectiveStats.brains}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#dca668', marginTop: 2 }}>Lv.{entry.level} · Cost: {entry.totalStatCost} pts · ×{entry.quantity} owned</div>
                  </div>
                  {alreadyIn ? (
                    <div style={{ fontSize: 11, color: '#e8c99a', fontWeight: 700, flexShrink: 0 }}>✓ In Deck</div>
                  ) : (
                    <button
                      className="btn-peach"
                      style={{ fontSize: 11, padding: '6px 14px', flexShrink: 0, opacity: disabled ? 0.4 : 1, border: 'none', background: '#dca668', color: '#1f1608', borderRadius: 8, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer' }}
                      disabled={disabled}
                      onClick={() => !disabled && addCard(entry)}
                    >
                      + Add
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}