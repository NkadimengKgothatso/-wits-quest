import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMockUserCards, MockCard } from '../services/apiClient'

interface UserCardItem {
  card: MockCard;
  owned: number;
  level: number;
}

const RARITY_BORDER: Record<string, string> = {
  Legendary: '#dca668',
  Epic: '#c99255',
  Rare: '#a87d4d',
  Common: 'rgba(220, 166, 104, 0.5)',
}

export default function DeckBuilder() {
  const { currentUser: user } = useAuth()
  const [deck, setDeck] = useState<(UserCardItem | null)[]>([null, null, null, null, null])
  const [saved, setSaved] = useState(false)
  const [collection, setCollection] = useState<UserCardItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      setLoading(true)
      getMockUserCards(user.id)
        .then(cards => {
          setCollection(cards || [])
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [user?.id])

  const deckCards = deck.filter(Boolean) as UserCardItem[]
  const totalCost = deckCards.reduce((s, c) => s + c.card.totalStats, 0)
  const legendaryCount = deckCards.filter((c) => c.card.rarity === 'Legendary').length
  const filled = deckCards.length
  
  // Adjusted budget to 1500 for testing, since card totalStats are ~200-350
  const maxBudget = user?.maxStatBudget && user.maxStatBudget > 1000 ? user.maxStatBudget : 1500;
  const costOverLimit = totalCost > maxBudget;
  const legendaryOverLimit = legendaryCount > (user?.legendaryCap || 1)

  function addCard(item: UserCardItem) {
    const emptyIdx = deck.findIndex((s) => s === null)
    if (emptyIdx === -1) return
    if (deck.some((c) => c?.card.id === item.card.id)) return
    const newDeck = [...deck]
    newDeck[emptyIdx] = item
    setDeck(newDeck)
    setSaved(false)
  }

  function removeCard(idx: number) {
    const newDeck = [...deck]
    newDeck[idx] = null
    setDeck(newDeck)
    setSaved(false)
  }

  const inDeck = new Set(deck.filter(Boolean).map((c) => c!.card.id))
  const canSave = filled === 5 && !costOverLimit && !legendaryOverLimit

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
            style={{ fontSize: 13, padding: '8px 18px', opacity: canSave ? 1 : 0.5 }}
            onClick={() => canSave && setSaved(true)}
            disabled={!canSave}
          >
            {saved ? '✓ Saved!' : 'Save Deck'}
          </button>
        </div>

        {/* Deck slots */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {deck.map((item, i) => (
            <div
              key={i}
              style={{ flex: 1, aspectRatio: '2/3', minWidth: 0 }}
            >
              {item ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 12,
                    border: `1.5px solid ${RARITY_BORDER[item.card.rarity]}`,
                    background: 'linear-gradient(160deg, #54441b 0%, #6b5630 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                  onClick={() => removeCard(i)}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{item.card.name.substring(0, 2).toUpperCase()}</div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: 'white', textAlign: 'center', padding: '0 4px', lineHeight: 1.2 }}>
                    {item.card.name}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeCard(i) }}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 16, height: 16, borderRadius: '50%',
                      background: 'rgba(239, 68, 68, 0.6)',
                      border: 'none', color: 'white', fontSize: 10,
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
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
        <div className="glass-dark" style={{ padding: 14, borderRadius: 14 }}>
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
                }} />
              </div>
            </div>

            {/* Total Stat Cost */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#dca668', fontWeight: 600 }}>Deck Stat Cost</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: costOverLimit ? '#f87171' : '#e8c99a' }}>
                  {totalCost} / {maxBudget} Max
                </span>
              </div>
              <div className="stat-bar-track" style={{ background: 'rgba(0,0,0,0.3)', height: 6, borderRadius: 3 }}>
                <div className="stat-bar-fill" style={{
                  width: `${Math.min(100, (totalCost / maxBudget) * 100)}%`,
                  height: '100%',
                  background: costOverLimit ? '#f87171' : 'linear-gradient(90deg, #e8c99a, #dca668)',
                }} />
              </div>
            </div>

            {/* Legendary Cap */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#dca668', fontWeight: 600 }}>Legendary Cap</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: legendaryOverLimit ? '#f87171' : '#dca668' }}>
                  {legendaryCount} / {user.legendaryCap || 1} Max
                </span>
              </div>
              <div className="stat-bar-track" style={{ background: 'rgba(0,0,0,0.3)', height: 6, borderRadius: 3 }}>
                <div className="stat-bar-fill" style={{
                  width: legendaryCount > 0 ? '100%' : '0%',
                  height: '100%',
                  background: legendaryOverLimit ? '#f87171' : '#dca668',
                }} />
              </div>
            </div>
          </div>
        </div>
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
        ) : collection.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '20px', color: '#dca668' }}>No cards available.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {collection.map((item) => {
              const alreadyIn = inDeck.has(item.card.id)
              const deckFull = filled >= 5
              const disabled = alreadyIn || (deckFull && !alreadyIn)
              
              const calcAtk = Math.floor(item.card.baseAttack * (1 + item.level * 0.1))
              const calcDef = Math.floor(item.card.baseDefense * (1 + item.level * 0.1))
              const calcSpd = Math.floor(item.card.baseSpeed * (1 + item.level * 0.1))
              const calcBrn = Math.floor(item.card.baseBrains * (1 + item.level * 0.1))

              return (
                <div
                  key={item.card.id}
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
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(84, 68, 27, 0.8)', border: `1px solid ${RARITY_BORDER[item.card.rarity]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: RARITY_BORDER[item.card.rarity], fontWeight: 800, fontSize: 10, flexShrink: 0 }}>
                    {item.card.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{item.card.name}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: RARITY_BORDER[item.card.rarity], background: `${RARITY_BORDER[item.card.rarity]}18`, borderRadius: 4, padding: '1px 5px' }}>
                        {item.card.rarity}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11, fontWeight: 700 }}>
                      <span style={{ color: '#f87171' }}>ATK {calcAtk}</span>
                      <span style={{ color: '#dca668' }}>DEF {calcDef}</span>
                      <span style={{ color: '#facc15' }}>SPD {calcSpd}</span>
                      <span style={{ color: '#e8c99a' }}>BRN {calcBrn}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#dca668', marginTop: 2 }}>Lv.{item.level} · Total Stats: {item.card.totalStats} · ×{item.owned} owned</div>
                  </div>
                  {alreadyIn ? (
                    <div style={{ fontSize: 11, color: '#e8c99a', fontWeight: 700, flexShrink: 0 }}>✓ In Deck</div>
                  ) : (
                    <button
                      className="btn-peach"
                      style={{ fontSize: 11, padding: '6px 14px', flexShrink: 0, opacity: disabled ? 0.4 : 1, border: 'none', background: '#dca668', color: '#1f1608', borderRadius: 8, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer' }}
                      disabled={disabled}
                      onClick={() => !disabled && addCard(item)}
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
