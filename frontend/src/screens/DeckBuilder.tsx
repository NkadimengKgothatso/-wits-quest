import { useState } from 'react'

const ALL_CARDS = [
  { id: 1, name: 'Great Hall Pillars', rarity: 'Legendary', attack: 85, defense: 95, speed: 40, brains: 90, cost: 85, owned: 1 },
  { id: 2, name: "Solomon's Torch", rarity: 'Epic', attack: 90, defense: 70, speed: 85, brains: 88, cost: 72, owned: 2 },
  { id: 3, name: 'Quantum Reactor', rarity: 'Rare', attack: 75, defense: 60, speed: 70, brains: 95, cost: 55, owned: 3 },
  { id: 4, name: 'Senate Seal', rarity: 'Rare', attack: 60, defense: 88, speed: 45, brains: 92, cost: 48, owned: 1 },
  { id: 5, name: 'Cave Painting', rarity: 'Common', attack: 40, defense: 50, speed: 35, brains: 78, cost: 22, owned: 4 },
  { id: 6, name: 'Ancient Tome', rarity: 'Epic', attack: 55, defense: 72, speed: 30, brains: 99, cost: 64, owned: 1 },
  { id: 7, name: 'The Rock Drill', rarity: 'Legendary', attack: 98, defense: 80, speed: 65, brains: 75, cost: 88, owned: 1 },
  { id: 8, name: 'Wits Springbok', rarity: 'Common', attack: 72, defense: 55, speed: 92, brains: 60, cost: 28, owned: 5 },
  { id: 9, name: 'Wits Medical', rarity: 'Rare', attack: 50, defense: 85, speed: 55, brains: 96, cost: 58, owned: 2 },
  { id: 10, name: 'Star Trails', rarity: 'Epic', attack: 65, defense: 65, speed: 78, brains: 88, cost: 68, owned: 1 },
]

const RARITY_BORDER: Record<string, string> = {
  Legendary: '#fed6ce',
  Epic: '#a78bfa',
  Rare: '#60a5fa',
  Common: 'rgba(164, 181, 209, 0.5)',
}

export default function DeckBuilder() {
  const [deck, setDeck] = useState<(typeof ALL_CARDS[0] | null)[]>([null, null, null, null, null])
  const [saved, setSaved] = useState(false)

  const deckCards = deck.filter(Boolean) as typeof ALL_CARDS[0][]
  const totalCost = deckCards.reduce((s, c) => s + c.cost, 0)
  const legendaryCount = deckCards.filter((c) => c.rarity === 'Legendary').length
  const filled = deckCards.length
  const costOverLimit = totalCost > 300
  const legendaryOverLimit = legendaryCount > 1

  function addCard(card: typeof ALL_CARDS[0]) {
    const emptyIdx = deck.findIndex((s) => s === null)
    if (emptyIdx === -1) return
    if (deck.some((c) => c?.id === card.id)) return
    const newDeck = [...deck]
    newDeck[emptyIdx] = card
    setDeck(newDeck)
    setSaved(false)
  }

  function removeCard(idx: number) {
    const newDeck = [...deck]
    newDeck[idx] = null
    setDeck(newDeck)
    setSaved(false)
  }

  const inDeck = new Set(deck.filter(Boolean).map((c) => c!.id))
  const canSave = filled === 5 && !costOverLimit && !legendaryOverLimit

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 60% 0%, #253d6a 0%, #1d3156 50%, #0f1a2e 100%)',
      paddingTop: 70,
      paddingBottom: 80,
    }}>
      {/* Top half — Active Deck */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: 0 }}>Active Deck</h2>
            <p style={{ fontSize: 12, color: '#a4b5d1', margin: '2px 0 0' }}>Select 5 cards for battle</p>
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
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {deck.map((card, i) => (
            <div
              key={i}
              style={{ flex: 1, aspectRatio: '2/3', minWidth: 0 }}
            >
              {card ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 12,
                    border: `1.5px solid ${RARITY_BORDER[card.rarity]}`,
                    background: 'linear-gradient(160deg, #1d3156 0%, #253d6a 100%)',
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
                  <div style={{ fontSize: 24 }}>{card.emoji}</div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: 'white', textAlign: 'center', padding: '0 4px', lineHeight: 1.2 }}>
                    {card.name}
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
                  border: '1.5px dashed rgba(164, 181, 209, 0.3)',
                  background: 'rgba(29, 49, 86, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(164, 181, 209, 0.4)',
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
                <span style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600 }}>Card Slots</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: filled === 5 ? '#4ade80' : 'white' }}>
                  {filled}/5
                </span>
              </div>
              <div className="stat-bar-track">
                <div className="stat-bar-fill" style={{
                  width: `${(filled / 5) * 100}%`,
                  background: filled === 5 ? '#4ade80' : '#fed6ce',
                }} />
              </div>
            </div>

            {/* Total Stat Cost */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600 }}>Deck Stat Cost</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: costOverLimit ? '#f87171' : '#b0cbe6' }}>
                  {totalCost} / 300 Max
                </span>
              </div>
              <div className="stat-bar-track">
                <div className="stat-bar-fill" style={{
                  width: `${Math.min(100, (totalCost / 300) * 100)}%`,
                  background: costOverLimit ? '#f87171' : 'linear-gradient(90deg, #b0cbe6, #fed6ce)',
                }} />
              </div>
            </div>

            {/* Legendary Cap */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#a4b5d1', fontWeight: 600 }}>Legendary Cap</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: legendaryOverLimit ? '#f87171' : '#fed6ce' }}>
                  {legendaryCount} / 1 Max
                </span>
              </div>
              <div className="stat-bar-track">
                <div className="stat-bar-fill" style={{
                  width: legendaryCount > 0 ? '100%' : '0%',
                  background: legendaryOverLimit ? '#f87171' : '#fed6ce',
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(164,181,209,0.3), transparent)', margin: '4px 0' }} />

      {/* Bottom half — Collection drawer */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#a4b5d1', marginBottom: 10 }}>
          📦 Your Collection — tap to add
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ALL_CARDS.map((card) => {
            const alreadyIn = inDeck.has(card.id)
            const deckFull = filled >= 5
            const disabled = alreadyIn || (deckFull && !alreadyIn)

            return (
              <div
                key={card.id}
                style={{
                  background: alreadyIn ? 'rgba(176, 203, 230, 0.1)' : 'rgba(73, 104, 148, 0.35)',
                  border: `1px solid ${alreadyIn ? 'rgba(176, 203, 230, 0.5)' : 'rgba(164, 181, 209, 0.2)'}`,
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  opacity: disabled && !alreadyIn ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(29, 49, 86, 0.8)', border: `1px solid ${RARITY_BORDER[card.rarity]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: RARITY_BORDER[card.rarity], fontWeight: 800, fontSize: 10, flexShrink: 0 }}>
                  {card.name.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{card.name}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: RARITY_BORDER[card.rarity], background: `${RARITY_BORDER[card.rarity]}18`, borderRadius: 4, padding: '1px 5px' }}>
                      {card.rarity}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 11, fontWeight: 700 }}>
                    <span style={{ color: '#f87171' }}>ATK {card.attack}</span>
                    <span style={{ color: '#60a5fa' }}>DEF {card.defense}</span>
                    <span style={{ color: '#facc15' }}>SPD {card.speed}</span>
                    <span style={{ color: '#a78bfa' }}>BRN {card.brains}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#a4b5d1', marginTop: 2 }}>Cost: {card.cost} pts · ×{card.owned} owned</div>
                </div>
                {alreadyIn ? (
                  <div style={{ fontSize: 11, color: '#b0cbe6', fontWeight: 700, flexShrink: 0 }}>✓ In Deck</div>
                ) : (
                  <button
                    className="btn-peach"
                    style={{ fontSize: 11, padding: '6px 14px', flexShrink: 0, opacity: disabled ? 0.4 : 1 }}
                    disabled={disabled}
                    onClick={() => !disabled && addCard(card)}
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
