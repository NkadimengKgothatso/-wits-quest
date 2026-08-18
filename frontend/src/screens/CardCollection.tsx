import { useState, useEffect } from 'react';
import { Building, BookOpen, FlaskConical, Palette, Trophy, MapPin, Search, Sparkles, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFullCollection, getPlayerInventory } from '../services/inventoryService';
import { validateDeck, saveDeck as saveDeckRequest } from '../services/deckService';
import { CATALOG_UPDATED_EVENT } from '../services/cardCatalogService';
import type { Card } from '../types/card';
import type { CollectionEntry, InventoryEntry } from '../types/inventory';

const RARITY_COLORS: Record<string, string> = {
  Legendary: '#8b1c23',
  Epic: '#115509',
  Rare: '#ab730c',
  Common: '#8A7B72',
};

const CATEGORY_ICONS: Record<Card['category'], any> = {
  Landmarks: Building,
  History: BookOpen,
  Science: FlaskConical,
  Sports: Trophy,
  Lifestyle: Palette,
};

function totalStats(s: { attack: number; defense: number; speed: number; brains: number }) {
  return s.attack + s.defense + s.speed + s.brains;
}

function HolographicCard({ entry, onClick }: { entry: CollectionEntry; onClick: () => void }) {
  const { card, unlocked } = entry;
  const color = unlocked ? RARITY_COLORS[card.rarity] : 'var(--color-muted)';
  const Icon = CATEGORY_ICONS[card.category] || MapPin;
  const stats = unlocked ? entry.effectiveStats : card.stats;
  const cost = unlocked ? entry.totalStatCost : totalStats(card.stats);

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
        flexDirection: 'column',
        opacity: unlocked ? 1 : 0.7,
      }}
      className="card-hover-effect"
    >
      {/* Holographic overlay */}
      {unlocked && card.rarity === 'Legendary' && (
        <div className="holo-overlay" />
      )}

      {/* Rarity & Level Badge */}
      <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', background: `${color}10` }}>
        <span style={{ fontSize: 10, fontWeight: 800, color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {unlocked ? card.rarity : 'Locked'}
        </span>
        {unlocked && (
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text)', background: 'var(--color-bg)', padding: '2px 6px', borderRadius: 8 }}>
            Lvl {entry.level}
          </span>
        )}
      </div>

      {/* Image Area */}
      <div style={{
        height: '110px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, var(--color-bg) 0%, var(--color-card-bg) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {unlocked ? (
          <img
            src={card.image}
            alt={card.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const sibling = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (sibling) sibling.style.display = 'flex';
            }}
          />
        ) : (
          <Icon size={48} color={color} strokeWidth={1.5} style={{ opacity: 0.4 }} />
        )}
        {unlocked && (
          <div style={{
            position: 'absolute', display: 'none', width: '100%', height: '100%',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(180deg, var(--color-bg) 0%, var(--color-card-bg) 100%)',
          }} className="image-fallback">
            <Icon size={48} color={color} strokeWidth={1.5} style={{ filter: `drop-shadow(0 4px 12px ${color}60)` }} />
          </div>
        )}
        {/* Quantity Badge */}
        {unlocked && (
          <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'var(--color-accent)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            x{entry.quantity}
          </div>
        )}
      </div>

      {/* Stats Area */}
      <div style={{ padding: '12px' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text)', marginBottom: 2, lineHeight: 1.1 }}>{card.name}</div>
        <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 8 }}>{card.category}</div>

        {unlocked ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--color-bg)', padding: '4px 6px', borderRadius: 6 }}>
                <span style={{ fontSize: 9, color: 'var(--color-muted)', fontWeight: 700 }}>ATK</span>
                <span style={{ fontSize: 12, color: 'var(--color-text)', fontWeight: 800 }}>{stats.attack}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--color-bg)', padding: '4px 6px', borderRadius: 6 }}>
                <span style={{ fontSize: 9, color: 'var(--color-muted)', fontWeight: 700 }}>DEF</span>
                <span style={{ fontSize: 12, color: 'var(--color-text)', fontWeight: 800 }}>{stats.defense}</span>
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-accent)', fontWeight: 800 }}>Cost: {cost} pts</div>
          </>
        ) : (
          <div style={{ fontSize: 10, color: 'var(--color-muted)', fontWeight: 600 }}>Tap to see how to unlock</div>
        )}
      </div>
    </div>
  );
}

function CardDetailModal({ entry, onClose }: { entry: CollectionEntry; onClose: () => void }) {
  const { card, unlocked } = entry;
  const color = unlocked ? RARITY_COLORS[card.rarity] : 'var(--color-muted)';
  const Icon = CATEGORY_ICONS[card.category] || MapPin;
  const stats = unlocked ? entry.effectiveStats : card.stats;
  const cost = unlocked ? entry.totalStatCost : totalStats(card.stats);

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

        {/* Header Graphic with Image */}
        <div style={{
          height: 180,
          background: `radial-gradient(circle at top, ${color}40, var(--color-card-bg))`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {unlocked && card.rarity === 'Legendary' && <Sparkles size={100} color={color} style={{ position: 'absolute', opacity: 0.2 }} />}

          {unlocked ? (
            <>
              <img src={card.image} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.4) 0%, transparent 100%)' }} />
            </>
          ) : (
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 32px ${color}40` }}>
              <Icon size={56} color={color} strokeWidth={1.5} />
            </div>
          )}

          <div style={{ position: 'absolute', top: 16, right: 16, background: 'var(--color-bg)', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, color, zIndex: 1 }}>
            {unlocked ? card.rarity.toUpperCase() : 'LOCKED'}
          </div>
        </div>

        {/* Info Content */}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-text)', lineHeight: 1.1, marginBottom: 4 }}>{card.name}</h2>
              <span style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 600 }}>{card.category}{unlocked ? ` • Level ${entry.level}` : ''}</span>
            </div>
            {unlocked && (
              <div style={{ background: 'var(--color-accent)', color: '#fff', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 800 }}>
                x{entry.quantity} Owned
              </div>
            )}
          </div>

          {unlocked ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Combat Stats (Lv.{entry.level})</h3>
                <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--color-accent)' }}>Total Cost: {cost} pts</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'ATTACK', v: stats.attack },
                  { label: 'DEFENSE', v: stats.defense },
                  { label: 'SPEED', v: stats.speed },
                  { label: 'BRAINS', v: stats.brains },
                ].map(({ label, v }) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--color-text)', fontWeight: 800 }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 900, color }}>{v}</span>
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
                    const addEvent = new CustomEvent('equipCard', { detail: entry });
                    window.dispatchEvent(addEvent);
                  }}
                  style={{ flex: 1, padding: '16px', borderRadius: 16, background: 'var(--color-accent)', color: '#fff', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(211, 122, 50, 0.3)' }}
                >
                  Equip to Deck
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ padding: 16, borderRadius: 16, background: 'var(--color-card-bg)', border: '1px dashed var(--color-border)', marginBottom: 20 }}>
                <h3 style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text)', marginBottom: 6 }}>How to unlock</h3>
                <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0 }}>{entry.unlockHint}</p>
              </div>
              <button
                onClick={onClose}
                style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'var(--color-border)', color: 'var(--color-text)', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer' }}
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const DECK_DRAFT_KEY = (userId: string) => `wits_quest_deck_draft_${userId}`;

export default function CardCollection() {
  const { currentUser: user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState<Card['category'] | 'All'>('All');
  const [entries, setEntries] = useState<CollectionEntry[]>([]);
  const [ownedForDeck, setOwnedForDeck] = useState<InventoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<CollectionEntry | null>(null);
  const [deck, setDeck] = useState<(InventoryEntry | null)[]>([null, null, null, null, null]);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const maxStatBudget = user?.maxStatBudget ?? 300;
  const legendaryCap = user?.legendaryCap ?? 1;
  const validation = validateDeck(deck, maxStatBudget, legendaryCap);
  const filled = deck.filter(Boolean).length;

  // Load persisted in-progress deck draft from localStorage once inventory is loaded
  useEffect(() => {
    if (!user?.id || ownedForDeck.length === 0) return;
    try {
      const raw = localStorage.getItem(DECK_DRAFT_KEY(user.id));
      if (raw) {
        const savedIds: (string | null)[] = JSON.parse(raw);
        const restored = savedIds.map((id) =>
          id ? ownedForDeck.find((entry) => entry.inventoryId === id) ?? null : null
        );
        setDeck(restored);
      }
    } catch {
      // ignore corrupt storage
    }
  }, [user?.id, ownedForDeck]);

  async function persistDeck() {
    if (!validation.valid || !user?.id) return;
    setSaveState('saving');
    const ids = deck.map((entry) => entry?.inventoryId ?? null);
    localStorage.setItem(DECK_DRAFT_KEY(user.id), JSON.stringify(ids));
    const result = await saveDeckRequest(user.id, 'My Battle Deck', deck);
    setSaveState(result.success ? 'saved' : 'error');
  }

  function addCard(entry: InventoryEntry) {
    const emptyIdx = deck.findIndex((s) => s === null);
    if (emptyIdx === -1) return;
    if (deck.some((c) => c?.inventoryId === entry.inventoryId)) return;
    const newDeck = [...deck];
    newDeck[emptyIdx] = entry;
    setDeck(newDeck);
    setSaveState('idle');
    setSelectedEntry(null);
  }

  function removeCard(idx: number) {
    const newDeck = [...deck];
    newDeck[idx] = null;
    setDeck(newDeck);
    setSaveState('idle');
  }

  useEffect(() => {
    const handleEquip = (e: Event) => {
      const customEvent = e as CustomEvent<InventoryEntry>;
      addCard(customEvent.detail);
    };
    window.addEventListener('equipCard', handleEquip);
    return () => window.removeEventListener('equipCard', handleEquip);
  }, [deck]);

  function loadCollection() {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    Promise.all([
      getFullCollection(user.id, {
        category: catFilter === 'All' ? undefined : catFilter,
        search: searchTerm || undefined,
      }),
      getPlayerInventory(user.id),
    ])
      .then(([full, owned]) => {
        setEntries(full);
        setOwnedForDeck(owned);
      })
      .catch(() => {
        setEntries([]);
        setOwnedForDeck([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    loadCollection();
  }, [user?.id, catFilter, searchTerm]);

  // Refresh when Admin publishes a new card, so it shows up (locked) immediately
  useEffect(() => {
    const handler = () => loadCollection();
    window.addEventListener(CATALOG_UPDATED_EVENT, handler);
    return () => window.removeEventListener(CATALOG_UPDATED_EVENT, handler);
  }, [user?.id, catFilter, searchTerm]);

  const categories: (Card['category'] | 'All')[] = ['All', 'Landmarks', 'History', 'Science', 'Lifestyle', 'Sports'];

  const totalOwnedCopies = ownedForDeck.reduce((acc, e) => acc + e.quantity, 0);

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
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-accent)' }}>{totalOwnedCopies}</span>
          </div>
          <div style={{ background: 'var(--color-bg)', padding: '6px 12px', borderRadius: 12, border: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 600, marginRight: 6 }}>UNIQUE</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text)' }}>{ownedForDeck.length}</span>
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
              style={{ fontSize: 13, padding: '8px 18px', borderRadius: 8, fontWeight: 800, border: 'none', background: saveState === 'saved' ? 'var(--color-success, #4a7c59)' : validation.valid ? 'var(--color-accent)' : 'var(--color-border)', color: (validation.valid || saveState === 'saved') ? 'white' : 'var(--color-muted)', opacity: (validation.valid || saveState === 'saved') ? 1 : 0.5, cursor: validation.valid && saveState !== 'saving' ? 'pointer' : 'default', transition: 'background 0.3s' }}
              onClick={persistDeck}
              disabled={!validation.valid || saveState === 'saving'}
            >
              {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? '✓ Deck Saved' : saveState === 'error' ? 'Retry Save' : 'Save Deck'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
            {deck.map((entry, i) => (
              <div key={i} style={{ flexShrink: 0, width: 80, aspectRatio: '2/3' }}>
                {entry ? (
                  <div
                    onClick={() => removeCard(i)}
                    style={{
                      width: '100%', height: '100%', borderRadius: 12,
                      border: `2px solid ${RARITY_COLORS[entry.card.rarity]}`,
                      background: 'var(--color-card-bg)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={entry.card.image}
                      alt={entry.card.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button style={{
                      position: 'absolute', top: -4, right: -4, width: 20, height: 20,
                      borderRadius: '50%', background: '#EF4444', color: 'white',
                      border: 'none', fontSize: 10, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', zIndex: 1
                    }}>
                      ✕
                    </button>
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'rgba(0,0,0,0.55)', color: 'white',
                      fontSize: 9, fontWeight: 800, textAlign: 'center', padding: '2px 0',
                    }}>
                      {entry.totalStatCost} pts
                    </div>
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
                <span style={{ color: 'var(--color-muted)' }}>Stat Cost</span>
                <span style={{ color: validation.totalStatCost > maxStatBudget ? '#EF4444' : 'var(--color-text)' }}>{validation.totalStatCost} / {maxStatBudget}</span>
              </div>
              <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2 }}><div style={{ height: '100%', background: validation.totalStatCost > maxStatBudget ? '#EF4444' : 'var(--color-accent)', width: `${Math.min(100, (validation.totalStatCost / maxStatBudget) * 100)}%` }} /></div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>
                <span style={{ color: 'var(--color-muted)' }}>Legendary Cap</span>
                <span style={{ color: validation.legendaryCount > legendaryCap ? '#EF4444' : 'var(--color-text)' }}>{validation.legendaryCount} / {legendaryCap}</span>
              </div>
              <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2 }}><div style={{ height: '100%', background: validation.legendaryCount > legendaryCap ? '#EF4444' : 'var(--color-accent)', width: validation.legendaryCount > 0 ? '100%' : '0%' }} /></div>
            </div>
          </div>

          {validation.errors.length > 0 && filled > 0 && (
            <div style={{ marginTop: 10, fontSize: 11, color: '#EF4444', fontWeight: 600 }}>
              {validation.errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}
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
        ) : !user ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>Log in to see your collection.</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'var(--color-card-bg)', borderRadius: 24, border: '1px dashed var(--color-border)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Search size={28} color="var(--color-muted)" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>No cards found</h3>
            <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>No cards match these filters yet. Keep exploring Wits to earn more!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
            {entries.map((entry) => (
              <HolographicCard key={entry.card.id} entry={entry} onClick={() => setSelectedEntry(entry)} />
            ))}
          </div>
        )}
      </div>

      {selectedEntry && <CardDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}

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