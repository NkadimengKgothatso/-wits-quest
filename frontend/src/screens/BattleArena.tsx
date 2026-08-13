import { useState, useEffect } from 'react'

const PLAYER_CARDS = [
  { id: 1, name: 'Great Hall Pillars', emoji: '🏛️', attack: 85, defense: 95, speed: 40, brains: 90, rarity: 'Legendary' },
  { id: 2, name: "Solomon's Torch", emoji: '🔥', attack: 90, defense: 70, speed: 85, brains: 88, rarity: 'Epic' },
  { id: 3, name: 'Quantum Reactor', emoji: '⚛️', attack: 75, defense: 60, speed: 70, brains: 95, rarity: 'Rare' },
  { id: 4, name: 'Wits Springbok', emoji: '🦌', attack: 72, defense: 55, speed: 92, brains: 60, rarity: 'Common' },
  { id: 5, name: 'Ancient Tome', emoji: '📚', attack: 55, defense: 72, speed: 30, brains: 99, rarity: 'Epic' },
]

const CPU_CARDS = [
  { id: 101, name: 'Joburg Skyline', emoji: '🌆', attack: 80, defense: 88, speed: 55, brains: 82, rarity: 'Epic' },
  { id: 102, name: 'Reef Gold', emoji: '🥇', attack: 95, defense: 65, speed: 72, brains: 78, rarity: 'Legendary' },
  { id: 103, name: 'Ubuntu Spirit', emoji: '🤝', attack: 60, defense: 90, speed: 60, brains: 92, rarity: 'Rare' },
  { id: 104, name: 'Voortrekker', emoji: '🐂', attack: 78, defense: 75, speed: 68, brains: 70, rarity: 'Common' },
  { id: 105, name: 'Kruger Leopard', emoji: '🐆', attack: 92, defense: 58, speed: 96, brains: 65, rarity: 'Epic' },
]

const ATTR_KEYS = ['attack', 'defense', 'speed', 'brains'] as const
type AttrKey = typeof ATTR_KEYS[number]

const ATTR_META: Record<AttrKey, { icon: string; label: string; color: string }> = {
  attack: { icon: 'ATK', label: 'Attack', color: '#f87171' },
  defense: { icon: 'DEF', label: 'Defense', color: '#dca668' },
  speed: { icon: 'SPD', label: 'Speed', color: '#facc15' },
  brains: { icon: 'BRN', label: 'Brains', color: '#e8c99a' },
}

const RARITY_BORDER: Record<string, string> = {
  Legendary: '#dca668', Epic: '#c99255', Rare: '#a87d4d', Common: 'rgba(220, 166, 104, 0.5)'
}

type RoundResult = 'win' | 'lose' | 'tie' | null

interface RoundRecord { playerCard: typeof PLAYER_CARDS[0]; cpuCard: typeof CPU_CARDS[0]; attr: AttrKey; result: RoundResult }

export default function BattleArena() {
  const [playerCardIdx, setPlayerCardIdx] = useState(0)
  const [cpuCardIdx, setCpuCardIdx] = useState(0)
  const [selectedAttr, setSelectedAttr] = useState<AttrKey | null>(null)
  const [roundResult, setRoundResult] = useState<RoundResult>(null)
  const [rounds, setRounds] = useState<RoundRecord[]>([])
  const [timeLeft, setTimeLeft] = useState(30)
  const [animating, setAnimating] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const playerWins = rounds.filter((r) => r.result === 'win').length
  const cpuWins = rounds.filter((r) => r.result === 'lose').length
  const currentRound = rounds.length + 1

  const playerCard = PLAYER_CARDS[playerCardIdx]
  const cpuCard = CPU_CARDS[cpuCardIdx]

  useEffect(() => {
    if (roundResult !== null || gameOver) return
    const t = setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          clearInterval(t)
          autoPlay()
          return 30
        }
        return v - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [roundResult, gameOver, playerCardIdx])

  function autoPlay() {
    const randomAttr = ATTR_KEYS[Math.floor(Math.random() * 4)]
    resolveRound(randomAttr)
  }

  function resolveRound(attr: AttrKey) {
    if (animating || roundResult !== null) return
    setSelectedAttr(attr)
    setAnimating(true)

    setTimeout(() => {
      const pVal = playerCard[attr]
      const cVal = cpuCard[attr]
      const result: RoundResult = pVal > cVal ? 'win' : pVal < cVal ? 'lose' : 'tie'
      setRoundResult(result)
      setAnimating(false)

      setTimeout(() => {
        const newRounds = [...rounds, { playerCard, cpuCard, attr, result }]
        setRounds(newRounds)

        const newPlayerWins = newRounds.filter((r) => r.result === 'win').length
        const newCpuWins = newRounds.filter((r) => r.result === 'lose').length

        if (newPlayerWins >= 3 || newCpuWins >= 3 || newRounds.length >= 5) {
          setGameOver(true)
        } else {
          setRoundResult(null)
          setSelectedAttr(null)
          setPlayerCardIdx((v) => (v + 1) % PLAYER_CARDS.length)
          setCpuCardIdx((v) => (v + 1) % CPU_CARDS.length)
          setTimeLeft(30)
        }
      }, 1800)
    }, 600)
  }

  function resetGame() {
    setRounds([])
    setRoundResult(null)
    setSelectedAttr(null)
    setPlayerCardIdx(0)
    setCpuCardIdx(0)
    setTimeLeft(30)
    setGameOver(false)
  }

  const radius = 28
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - timeLeft / 30)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 20%, #1e3a5f 0%, #54441b 50%, #3d2f12 100%)',
      paddingTop: 70,
      paddingBottom: 80,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Header */}
      <div style={{ padding: '12px 16px' }}>
        <div className="glass" style={{ padding: '12px 16px', borderRadius: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Player */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #e8c99a, #6b7d2c)',
                border: '2px solid rgba(232, 201, 154, 0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>🧙</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Kagiso</div>
                <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 700 }}>{playerWins} wins</div>
              </div>
            </div>

            {/* Round info + clock */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 10, color: '#dca668', fontWeight: 700, letterSpacing: '0.1em' }}>
                BEST OF 5 · ROUND {currentRound}
              </div>
              {/* Circular countdown */}
              <div style={{ position: 'relative', width: 64, height: 64 }}>
                <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(220, 166, 104, 0.2)" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" r={radius}
                    fill="none"
                    stroke={timeLeft <= 10 ? '#f87171' : '#dca668'}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 4px ${timeLeft <= 10 ? '#f87171' : '#dca668'})` }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 900,
                  color: timeLeft <= 10 ? '#f87171' : 'white',
                }}>
                  {timeLeft}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                {[0,1,2,3,4].map((i) => {
                  const r = rounds[i]
                  return (
                    <div key={i} style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: !r ? 'rgba(220, 166, 104, 0.2)' : r.result === 'win' ? '#4ade80' : r.result === 'lose' ? '#f87171' : '#facc15',
                      border: '1px solid rgba(220, 166, 104, 0.3)',
                    }} />
                  )
                })}
              </div>
            </div>

            {/* CPU */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>CPU Opponent</div>
                <div style={{ fontSize: 11, color: '#f87171', fontWeight: 700 }}>{cpuWins} wins</div>
              </div>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f87171, #991b1b)',
                border: '2px solid rgba(248, 113, 113, 0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>🤖</div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Stage */}
      <div style={{ flex: 1, padding: '8px 16px', position: 'relative' }}>
        {gameOver ? (
          <div className="glass slide-up" style={{
            borderRadius: 20, padding: 32, textAlign: 'center',
            border: `2px solid ${playerWins > cpuWins ? '#4ade80' : '#f87171'}`,
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>
              {playerWins > cpuWins ? '🏆' : playerWins < cpuWins ? '💀' : '🤝'}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: playerWins > cpuWins ? '#4ade80' : playerWins < cpuWins ? '#f87171' : '#facc15' }}>
              {playerWins > cpuWins ? 'Victory!' : playerWins < cpuWins ? 'Defeated' : 'Draw!'}
            </div>
            <div style={{ fontSize: 14, color: '#dca668', margin: '8px 0 16px' }}>
              {playerWins} — {cpuWins} · Best of 5
            </div>
            {playerWins > cpuWins && (
              <div style={{ fontSize: 13, color: '#facc15', marginBottom: 16 }}>
                +850 XP · +180 💎 Essence · Rank +12
              </div>
            )}
            <button className="btn-peach" style={{ fontSize: 15, padding: '12px 32px' }} onClick={resetGame}>
              Play Again →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, height: 280 }}>
            {/* Player card */}
            <div
              className={animating ? 'clash-left' : ''}
              style={{
                flex: 1,
                borderRadius: 16,
                border: `2px solid ${RARITY_BORDER[playerCard.rarity]}`,
                background: 'linear-gradient(160deg, #54441b 0%, #6b5630 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ fontSize: 9, color: '#e8c99a', fontWeight: 700, letterSpacing: '0.1em' }}>YOUR CARD</div>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(84, 68, 27, 0.8)', border: `2px solid ${RARITY_BORDER[playerCard.rarity]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: RARITY_BORDER[playerCard.rarity], fontWeight: 800, fontSize: 14 }} className="float">
                {playerCard.name.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'white', textAlign: 'center', padding: '0 8px' }}>
                {playerCard.name}
              </div>
              {selectedAttr && (
                <div style={{
                  background: `${ATTR_META[selectedAttr].color}20`,
                  border: `1px solid ${ATTR_META[selectedAttr].color}60`,
                  borderRadius: 8, padding: '4px 12px',
                  color: ATTR_META[selectedAttr].color,
                  fontSize: 16, fontWeight: 900,
                }}>
                  {ATTR_META[selectedAttr].icon} {playerCard[selectedAttr]}
                </div>
              )}
              {roundResult && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: roundResult === 'win' ? 'rgba(34,197,94,0.15)' : roundResult === 'lose' ? 'rgba(239,68,68,0.15)' : 'rgba(250,204,21,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 40,
                }}>
                  {roundResult === 'win' ? '✓' : roundResult === 'lose' ? '✕' : '='}
                </div>
              )}
            </div>

            {/* VS divider */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{
                fontSize: 18, fontWeight: 900, color: '#dca668',
                textShadow: '0 0 16px rgba(220, 166, 104, 0.7)',
              }}>VS</div>
              {roundResult && (
                <div className="slide-up" style={{
                  background: roundResult === 'win' ? 'rgba(34,197,94,0.25)' : roundResult === 'lose' ? 'rgba(239,68,68,0.25)' : 'rgba(250,204,21,0.25)',
                  border: `1px solid ${roundResult === 'win' ? '#4ade80' : roundResult === 'lose' ? '#f87171' : '#facc15'}`,
                  borderRadius: 8, padding: '4px 8px',
                  color: roundResult === 'win' ? '#4ade80' : roundResult === 'lose' ? '#f87171' : '#facc15',
                  fontSize: 9, fontWeight: 900, textAlign: 'center',
                  letterSpacing: '0.06em',
                }}>
                  {roundResult === 'win' ? 'ROUND\nWON!' : roundResult === 'lose' ? 'ROUND\nLOST' : 'DRAW'}
                </div>
              )}
            </div>

            {/* CPU card */}
            <div
              className={animating ? 'clash-right' : ''}
              style={{
                flex: 1,
                borderRadius: 16,
                border: `2px solid ${RARITY_BORDER[cpuCard.rarity]}`,
                background: 'linear-gradient(160deg, #2d1a1a 0%, #3d1f1f 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ fontSize: 9, color: '#f87171', fontWeight: 700, letterSpacing: '0.1em' }}>CPU CARD</div>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(45, 26, 26, 0.8)', border: `2px solid ${RARITY_BORDER[cpuCard.rarity]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: RARITY_BORDER[cpuCard.rarity], fontWeight: 800, fontSize: 14 }}>
                {cpuCard.name.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'white', textAlign: 'center', padding: '0 8px' }}>
                {cpuCard.name}
              </div>
              {selectedAttr && (
                <div style={{
                  background: `${ATTR_META[selectedAttr].color}20`,
                  border: `1px solid ${ATTR_META[selectedAttr].color}60`,
                  borderRadius: 8, padding: '4px 12px',
                  color: ATTR_META[selectedAttr].color,
                  fontSize: 16, fontWeight: 900,
                }}>
                  {ATTR_META[selectedAttr].icon} {cpuCard[selectedAttr]}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      {!gameOver && (
        <div style={{ padding: '0 16px 16px' }}>
          {/* Attribute attack buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
            {ATTR_KEYS.map((attr) => {
              const meta = ATTR_META[attr]
              const isSelected = selectedAttr === attr
              return (
                <button
                  key={attr}
                  onClick={() => !roundResult && resolveRound(attr)}
                  disabled={!!roundResult}
                  style={{
                    background: isSelected ? `${meta.color}25` : 'rgba(107, 125, 44, 0.4)',
                    border: `1.5px solid ${isSelected ? meta.color : 'rgba(220, 166, 104, 0.3)'}`,
                    borderRadius: 12,
                    padding: '10px 6px',
                    color: isSelected ? meta.color : 'white',
                    cursor: roundResult ? 'default' : 'pointer',
                    fontWeight: 800,
                    fontSize: 12,
                    textAlign: 'center',
                    boxShadow: isSelected ? `0 0 12px ${meta.color}50` : 'none',
                    transition: 'all 0.2s',
                    fontFamily: 'Outfit, sans-serif',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{meta.icon}</span>
                  <span style={{ fontSize: 10 }}>{meta.label}</span>
                  <span style={{ fontSize: 11, color: isSelected ? meta.color : '#dca668' }}>
                    {playerCard[attr]}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Card carousel */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {PLAYER_CARDS.map((card, i) => (
              <div
                key={card.id}
                onClick={() => setPlayerCardIdx(i)}
                style={{
                  flexShrink: 0,
                  width: 56,
                  borderRadius: 10,
                  border: `1.5px solid ${i === playerCardIdx ? RARITY_BORDER[card.rarity] : 'rgba(168,187,217,0.25)'}`,
                  background: i === playerCardIdx ? 'rgba(61,90,128,0.6)' : 'rgba(44,62,80,0.4)',
                  padding: '6px 4px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: i === playerCardIdx ? `0 0 10px ${RARITY_BORDER[card.rarity]}50` : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 22 }}>{card.emoji}</div>
                <div style={{ fontSize: 8, color: i === playerCardIdx ? 'white' : '#dca668', fontWeight: 700, lineHeight: 1.2, marginTop: 2 }}>
                  {card.name.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
