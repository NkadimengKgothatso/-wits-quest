import React, { useState, useEffect } from 'react';
import { Building, BookOpen, FlaskConical, FileText, Compass, Book, Palette, Trophy, MapPin, Search, ChevronDown, Filter, Sparkles, Layers, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMockUserCards, MockCard } from '../services/apiClient';

interface UserCardItem {
  card: MockCard;
  owned: number;
  level: number;
}

const RARITY_COLORS: Record<string, string> = {
  Legendary: '#eab308', // gold/orange
  Epic: '#a855f7',      // purple
  Rare: '#3b82f6',      // blue
  Common: '#8A7B72',    // warm grey
};

const CATEGORY_ICONS: Record<string, any> = {
  Landmarks: Building,
  History: BookOpen,
  Science: FlaskConical,
  Administration: FileText,
  Heritage: Compass,
  Knowledge: Book,
  Art: Palette,
  Sports: Trophy,
};

function HolographicCard({ item, onClick }: { item: UserCardItem; onClick: () => void }) {
  const { card, level, owned } = item;
  const color = RARITY_COLORS[card.rarity];
  const Icon = CATEGORY_ICONS[card.category] || MapPin;

  return (
    <div 
      onClick={onClick}
      style={{
        position: 'relative',
        borderRadius: '16px',
        background: 'var(--color-card-bg)',
        border: `2px solid ${color}40`,
        boxShadow: `0 8px 24px rgba(44, 34, 30, 0.08)`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column'
      }}
      className="card-hover-effect"
    >
      {/* Holographic overlay */}
      {card.rarity === 'Legendary' && (
        <div className="holo-overlay" />
      )}

      {/* Rarity & Level Badge */}
      <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', background: `${color}10` }}>
        <span style={{ fontSize: 10, fontWeight: 800, color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {card.rarity}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text)', background: 'var(--color-bg)', padding: '2px 6px', borderRadius: 8 }}>
          Lvl {level}
        </span>
      </div>
      
      {/* Icon Area */}
      <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, var(--color-bg) 0%, var(--color-card-bg) 100%)', position: 'relative' }}>
        <Icon size={48} color={color} strokeWidth={1.5} style={{ filter: `drop-shadow(0 4px 12px ${color}60)` }} />
        {/* Quantity Badge */}
        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'var(--color-accent)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          x{owned}
        </div>
      </div>
      
      {/* Stats Area */}
      <div style={{ padding: '12px' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text)', marginBottom: 2, lineHeight: 1.1 }}>{card.name}</div>
        <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 12 }}>{card.category}</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--color-bg)', padding: '4px 6px', borderRadius: 6 }}>
            <span style={{ fontSize: 9, color: 'var(--color-muted)', fontWeight: 700 }}>ATK</span>
            <span style={{ fontSize: 12, color: 'var(--color-text)', fontWeight: 800 }}>{Math.floor(card.baseAttack * (1 + level * 0.1))}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--color-bg)', padding: '4px 6px', borderRadius: 6 }}>
            <span style={{ fontSize: 9, color: 'var(--color-muted)', fontWeight: 700 }}>DEF</span>
            <span style={{ fontSize: 12, color: 'var(--color-text)', fontWeight: 800 }}>{Math.floor(card.baseDefense * (1 + level * 0.1))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardDetailModal({ item, onClose }: { item: UserCardItem; onClose: () => void }) {
  const { card, level, owned } = item;
  const color = RARITY_COLORS[card.rarity];
  const Icon = CATEGORY_ICONS[card.category] || MapPin;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(26, 20, 18, 0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="slide-up-fast" style={{ width: '100%', maxWidth: 360, background: 'var(--color-bg)', borderRadius: 28, overflow: 'hidden', boxShadow: `0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px ${color}30` }}>
        
        {/* Header Graphic */}
        <div style={{ height: 180, background: `radial-gradient(circle at top, ${color}40, var(--color-card-bg))`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {card.rarity === 'Legendary' && <Sparkles size={100} color={color} style={{ position: 'absolute', opacity: 0.2 }} />}
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 32px ${color}40` }}>
            <Icon size={56} color={color} strokeWidth={1.5} />
          </div>
          <div style={{ position: 'absolute', top: 16, right: 16, background: 'var(--color-bg)', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, color }}>
            {card.rarity.toUpperCase()}
          </div>
        </div>

        {/* Info Content */}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-text)', lineHeight: 1.1, marginBottom: 4 }}>{card.name}</h2>
              <span style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 600 }}>{card.category} • Level {level}</span>
            </div>
            <div style={{ background: 'var(--color-accent)', color: '#fff', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 800 }}>
              x{owned} Owned
            </div>
          </div>

          <h3 style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Combat Stats (Lv.{level})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'ATTACK', v: Math.floor(card.baseAttack * (1 + level * 0.1)), base: card.baseAttack },
              { label: 'DEFENSE', v: Math.floor(card.baseDefense * (1 + level * 0.1)), base: card.baseDefense },
              { label: 'SPEED', v: Math.floor(card.baseSpeed * (1 + level * 0.1)), base: card.baseSpeed },
              { label: 'BRAINS', v: Math.floor(card.baseBrains * (1 + level * 0.1)), base: card.baseBrains },
            ].map(({ label, v, base }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--color-text)', fontWeight: 800 }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 900, color }}>{v} <span style={{ fontSize: 10, color: 'var(--color-muted)', fontWeight: 600 }}>(+{v - base})</span></span>
                </div>
                <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, v)}%`, height: '100%', background: color }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}
              style={{ flex: 1, padding: '16px', borderRadius: 16, background: 'var(--color-border)', color: 'var(--color-text)', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer' }}
            >
              Close
            </button>
            <button
              onClick={() => {
                const addEvent = new CustomEvent('equipCard', { detail: item });
                window.dispatchEvent(addEvent);
              }}
              style={{ flex: 1, padding: '16px', borderRadius: 16, background: 'var(--color-accent)', color: '#fff', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(211, 122, 50, 0.3)' }}
            >
              Equip to Deck
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const DECK_STORAGE_KEY = (userId: string) => `wits_quest_deck_${userId}`;

export default function CardCollection({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const { currentUser: user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [inventory, setInventory] = useState<UserCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<UserCardItem | null>(null);
  const [deck, setDeck] = useState<(UserCardItem | null)[]>([null, null, null, null, null]);
  const [saved, setSaved] = useState(false);

  const deckCards = deck.filter(Boolean) as UserCardItem[];
  const totalCost = deckCards.reduce((s, c) => s + c.card.totalStats, 0);
  const legendaryCount = deckCards.filter((c) => c.card.rarity === 'Legendary').length;
  const filled = deckCards.length;
  const maxBudget = user?.maxStatBudget && user.maxStatBudget > 1000 ? user.maxStatBudget : 1500;
  const costOverLimit = totalCost > maxBudget;
  const legendaryOverLimit = legendaryCount > (user?.legendaryCap || 1);
  const canSave = filled === 5 && !costOverLimit && !legendaryOverLimit;

  // Load persisted deck from localStorage once inventory is loaded
  useEffect(() => {
    if (!user?.id || inventory.length === 0) return;
    try {
      const raw = localStorage.getItem(DECK_STORAGE_KEY(user.id));
      if (raw) {
        const savedIds: (string | null)[] = JSON.parse(raw);
        const restored = savedIds.map((id) =>
          id ? inventory.find((item) => item.card.id === id) ?? null : null
        );
        setDeck(restored);
        setSaved(true);
      }
    } catch {
      // ignore corrupt storage
    }
  }, [user?.id, inventory]);

  function saveDeck() {
    if (!canSave || !user?.id) return;
    const ids = deck.map((item) => item?.card.id ?? null);
    localStorage.setItem(DECK_STORAGE_KEY(user.id), JSON.stringify(ids));
    setSaved(true);
  }

  function addCard(item: UserCardItem) {
    const emptyIdx = deck.findIndex((s) => s === null);
    if (emptyIdx === -1) return;
    if (deck.some((c) => c?.card.id === item.card.id)) return;
    const newDeck = [...deck];
    newDeck[emptyIdx] = item;
    setDeck(newDeck);
    setSaved(false);
    setSelectedCard(null); // Close modal
  }

  function removeCard(idx: number) {
    const newDeck = [...deck];
    newDeck[idx] = null;
    setDeck(newDeck);
    setSaved(false);
  }

  useEffect(() => {
    const handleEquip = (e: Event) => {
      const customEvent = e as CustomEvent<UserCardItem>;
      addCard(customEvent.detail);
    };
    window.addEventListener('equipCard', handleEquip);
    return () => window.removeEventListener('equipCard', handleEquip);
  }, [deck]);

  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      getMockUserCards(user.id)
        .then(cards => {
          setInventory(cards || []);
        })
        .catch(() => {
          setInventory([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  const categories = ['All', 'Landmarks', 'History', 'Science', 'Administration', 'Knowledge', 'Heritage', 'Sports', 'Art'];

  const filtered = inventory.filter((item) => {
    if (catFilter !== 'All' && item.card.category !== catFilter) return false;
    if (searchTerm && !item.card.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', paddingTop: 60, paddingBottom: 100 }}>
      {/* Premium Header */}
      <div style={{ background: 'var(--color-card-bg)', padding: '32px 16px 24px', borderBottom: '1px solid var(--color-border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, opacity: 0.05, transform: 'rotate(15deg)' }}>
          <Layers size={200} />
        </div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8 }}>
          My Collection
        </h1>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ background: 'var(--color-bg)', padding: '6px 12px', borderRadius: 12, border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 600, marginRight: 6 }}>TOTAL CARDS</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-accent)' }}>{inventory.reduce((acc, curr) => acc + curr.owned, 0)}</span>
          </div>
          <div style={{ background: 'var(--color-bg)', padding: '6px 12px', borderRadius: 12, border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 600, marginRight: 6 }}>UNIQUE</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text)' }}>{inventory.length}</span>
          </div>
        </div>

        {/* Active Deck Section */}
        <div style={{ marginTop: 20, background: 'rgba(0,0,0,0.1)', padding: 16, borderRadius: 16, border: '1px solid rgba(220,166,104,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>Active Deck</h3>
              <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: 0 }}>Select 5 cards for battle</p>
            </div>
            <button
              style={{ fontSize: 13, padding: '8px 18px', borderRadius: 8, fontWeight: 800, border: 'none', background: saved ? 'var(--color-success, #4a7c59)' : canSave ? 'var(--color-accent)' : 'var(--color-border)', color: (canSave || saved) ? 'white' : 'var(--color-muted)', opacity: (canSave || saved) ? 1 : 0.5, cursor: canSave && !saved ? 'pointer' : 'default', transition: 'background 0.3s' }}
              onClick={saveDeck}
              disabled={!canSave || saved}
            >
              {saved ? '✓ Deck Saved' : 'Save Deck'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
            {deck.map((item, i) => (
              <div key={i} style={{ flexShrink: 0, width: 80, aspectRatio: '2/3' }}>
                {item ? (
                  <div
                    onClick={() => removeCard(i)}
                    style={{
                      width: '100%', height: '100%', borderRadius: 12, border: `2px solid ${RARITY_COLORS[item.card.rarity]}`, background: 'var(--color-card-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text)' }}>{item.card.name.substring(0, 2).toUpperCase()}</div>
                    <button style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: '#EF4444', color: 'white', border: 'none', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', borderRadius: 12, border: '2px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: 24 }}>+</div>
                )}
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>
                <span color="var(--color-muted)">Stat Cost</span>
                <span color={costOverLimit ? '#EF4444' : 'var(--color-text)'}>{totalCost} / {maxBudget}</span>
              </div>
              <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2 }}><div style={{ height: '100%', background: costOverLimit ? '#EF4444' : 'var(--color-accent)', width: `${Math.min(100, (totalCost/maxBudget)*100)}%` }} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ padding: '16px', position: 'sticky', top: 0, zIndex: 20, background: 'rgba(250, 247, 242, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={20} color="var(--color-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: 16, outline: 'none', color: 'var(--color-text)', fontSize: 15, fontWeight: 600, boxShadow: '0 2px 8px rgba(44, 34, 30, 0.03)' }}
            placeholder="Search your collection..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              style={{ 
                flexShrink: 0, padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, border: 'none',
                background: catFilter === c ? 'var(--color-text)' : 'var(--color-card-bg)',
                color: catFilter === c ? 'var(--color-bg)' : 'var(--color-muted)',
                boxShadow: catFilter === c ? '0 4px 12px rgba(44, 34, 30, 0.2)' : '0 2px 4px rgba(44, 34, 30, 0.05)',
                transition: 'all 0.2s', cursor: 'pointer'
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: '20px 16px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>Loading collection...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'var(--color-card-bg)', borderRadius: 24, border: '1px dashed var(--color-border)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Search size={28} color="var(--color-muted)" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>No cards found</h3>
            <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>You don't own any cards matching these filters yet. Keep exploring Wits to earn more!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
            {filtered.map((item) => (
              <HolographicCard key={item.card.id} item={item} onClick={() => setSelectedCard(item)} />
            ))}
          </div>
        )}
      </div>

      {selectedCard && <CardDetailModal item={selectedCard} onClose={() => setSelectedCard(null)} />}

      <style>{`
        .card-hover-effect:active {
          transform: scale(0.96);
        }
        .holo-overlay {
          position: absolute;
          inset: 0;
          z-index: 10;
          background: linear-gradient(125deg, transparent 20%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 60%, transparent 80%);
          background-size: 200% 200%;
          animation: holo-shine 4s infinite linear;
          pointer-events: none;
          mix-blend-mode: overlay;
        }
        @keyframes holo-shine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .slide-up-fast {
          animation: slideUpFast 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes slideUpFast {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
