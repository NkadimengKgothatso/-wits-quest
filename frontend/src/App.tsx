import React, { useState } from 'react';
import { MapPin, Compass, Shield, Award, Users, Play, CheckCircle2, Zap } from 'lucide-react';
import cardsData from '../data/mock_cards.json';
import campusData from '../data/wits_campus_bounds.json';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'collection' | 'battle' | 'leaderboard' | 'admin'>('map');
  const [simulatedDistance, setSimulatedDistance] = useState<number>(15);
  const [activeTriviaModal, setActiveTriviaModal] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [triviaResult, setTriviaResult] = useState<'correct' | 'incorrect' | null>(null);

  const handleTriviaSubmit = (index: number) => {
    setSelectedAnswer(index);
    if (index === 1) { // 1922 is the correct answer for Great Hall
      setTriviaResult('correct');
    } else {
      setTriviaResult('incorrect');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1d3156' }}>
      {/* Top Header Navigation */}
      <header style={{
        backgroundColor: 'rgba(29, 49, 86, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(164, 181, 209, 0.25)',
        padding: '0.875rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #b0cbe6 0%, #fed6ce 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1d3156',
            fontWeight: 800,
            fontSize: '1.25rem',
            boxShadow: '0 0 15px rgba(254, 214, 206, 0.4)'
          }}>
            WQ
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.5px' }}>WITS QUEST</h1>
            <p style={{ fontSize: '0.75rem', color: '#a4b5d1' }}>COMS3011A Project 6 — Anime RPG Edition</p>
          </div>
        </div>

        {/* Tab Selector Buttons */}
        <nav style={{ display: 'flex', gap: '0.5rem', background: '#132340', padding: '0.35rem', borderRadius: '12px' }}>
          {[
            { id: 'map', label: 'Map Explorer', icon: MapPin },
            { id: 'collection', label: 'Card Collection', icon: Award },
            { id: 'battle', label: 'Battle Arena', icon: Zap },
            { id: 'leaderboard', label: 'Leaderboard', icon: Users },
            { id: 'admin', label: 'Admin Console', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.875rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isActive ? '#fed6ce' : 'transparent',
                  color: isActive ? '#1d3156' : '#a4b5d1',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 12px rgba(254, 214, 206, 0.4)' : 'none'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Player Profile Mini Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#496894', padding: '0.4rem 0.85rem', borderRadius: '20px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#fed6ce', boxShadow: '0 0 8px #fed6ce' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>Level 12 Explorer</span>
          <span style={{ fontSize: '0.75rem', backgroundColor: '#1d3156', color: '#b0cbe6', padding: '0.2rem 0.5rem', borderRadius: '10px' }}>XP 2,450</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {activeTab === 'map' && (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', height: 'calc(100vh - 140px)' }}>
            {/* Map Controls & Status Panel */}
            <div style={{ backgroundColor: '#496894', borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(164, 181, 209, 0.3)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass color="#fed6ce" /> Location Simulator
              </h2>
              
              <div style={{ backgroundColor: '#1d3156', padding: '1rem', borderRadius: '12px' }}>
                <label style={{ fontSize: '0.8rem', color: '#a4b5d1', display: 'block', marginBottom: '0.5rem' }}>
                  Simulated Distance to Great Hall: <strong style={{ color: '#fed6ce' }}>{simulatedDistance} meters</strong>
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={simulatedDistance}
                  onChange={(e) => setSimulatedDistance(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#fed6ce' }}
                />
                <p style={{ fontSize: '0.75rem', color: simulatedDistance <= 25 ? '#fed6ce' : '#a4b5d1', marginTop: '0.5rem' }}>
                  {simulatedDistance <= 25 ? '✓ IN REACH: Great Hall Event Unlocked!' : '⚠ TOO FAR: Walk closer (<25m) to trigger event.'}
                </p>
              </div>

              <button
                disabled={simulatedDistance > 25}
                onClick={() => setActiveTriviaModal(true)}
                style={{
                  padding: '0.85rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: simulatedDistance <= 25 ? '#fed6ce' : '#1d3156',
                  color: simulatedDistance <= 25 ? '#1d3156' : '#a4b5d1',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: simulatedDistance <= 25 ? 'pointer' : 'not-allowed',
                  boxShadow: simulatedDistance <= 25 ? '0 0 18px rgba(254, 214, 206, 0.5)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {simulatedDistance <= 25 ? 'Unlock Great Hall Trivia Event' : 'Out of Radius'}
              </button>

              <div style={{ marginTop: 'auto', backgroundColor: '#132340', padding: '1rem', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '0.85rem', color: '#b0cbe6', marginBottom: '0.5rem' }}>Active Wits Landmarks</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: '#a4b5d1' }}>
                  <li>📍 Great Hall (-26.1912, 28.0302)</li>
                  <li>📍 Solomon Mahlangu House (-26.1935, 28.0315)</li>
                  <li>📍 Science Stadium (-26.1895, 28.0275)</li>
                </ul>
              </div>
            </div>

            {/* Map Rendering Container */}
            <div style={{ backgroundColor: '#132340', borderRadius: '16px', border: '1px solid rgba(164, 181, 209, 0.3)', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <MapPin size={48} color="#b0cbe6" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>Wits Campus Interactive Map Engine</h3>
                <p style={{ fontSize: '0.85rem', color: '#a4b5d1', maxWidth: '450px', margin: '0.5rem auto 1.5rem' }}>
                  Leaflet.js spatial renderer focused on Braamfontein Main Campus.
                </p>
                <div style={{ display: 'inline-flex', gap: '1rem', backgroundColor: '#496894', padding: '0.75rem 1.25rem', borderRadius: '10px' }}>
                  <span style={{ color: '#fed6ce', fontWeight: 600 }}>Active Bounds: Wits Main Campus</span>
                  <span style={{ color: '#b0cbe6' }}>Verification: Haversine Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trivia Challenge Modal */}
        {activeTriviaModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(19, 35, 64, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: '#1d3156',
              border: '1px solid #b0cbe6',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ backgroundColor: '#496894', color: '#fed6ce', fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.6rem', borderRadius: '6px' }}>WITS HISTORY EVENT</span>
                <button onClick={() => { setActiveTriviaModal(false); setTriviaResult(null); setSelectedAnswer(null); }} style={{ background: 'none', border: 'none', color: '#a4b5d1', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>Great Hall Foundation Trivia</h3>
              <p style={{ fontSize: '0.9rem', color: '#a4b5d1', marginBottom: '1.25rem' }}>In which year was the iconic Wits Great Hall officially inaugurated on Braamfontein Campus?</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                {['1910', '1922', '1948', '1965'].map((option, idx) => (
                  <button
                    key={option}
                    onClick={() => handleTriviaSubmit(idx)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid #496894',
                      backgroundColor: selectedAnswer === idx ? (triviaResult === 'correct' ? '#fed6ce' : '#e74c3c') : '#132340',
                      color: selectedAnswer === idx && triviaResult === 'correct' ? '#1d3156' : '#ffffff',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {option} {selectedAnswer === idx && triviaResult === 'correct' && '✓ Correct!'}
                  </button>
                ))}
              </div>

              {triviaResult === 'correct' && (
                <div style={{ backgroundColor: 'rgba(254, 214, 206, 0.15)', border: '1px solid #fed6ce', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                  <h4 style={{ color: '#fed6ce', fontWeight: 700, marginBottom: '0.25rem' }}>🎉 Event Completed!</h4>
                  <p style={{ fontSize: '0.8rem', color: '#a4b5d1', marginBottom: '0.75rem' }}>You unlocked the Legendary "Great Hall Pillars" Card!</p>
                  <button onClick={() => { setActiveTriviaModal(false); setActiveTab('collection'); }} style={{ backgroundColor: '#fed6ce', color: '#1d3156', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>View in Collection</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card Collection Tab */}
        {activeTab === 'collection' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>Collectible Card Inventory</h2>
                <p style={{ fontSize: '0.85rem', color: '#a4b5d1' }}>Wits Campus Card Deck Collection (4 Cards Owned)</p>
              </div>
              <div style={{ backgroundColor: '#496894', padding: '0.5rem 1rem', borderRadius: '10px', color: '#fed6ce', fontWeight: 700 }}>
                Essence Balance: 450 💎
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {cardsData.map((card) => (
                <div key={card.id} style={{
                  backgroundColor: '#496894',
                  borderRadius: '16px',
                  border: card.rarity === 'Legendary' ? '2px solid #fed6ce' : '1px solid rgba(164, 181, 209, 0.4)',
                  padding: '1.25rem',
                  boxShadow: card.rarity === 'Legendary' ? '0 0 20px rgba(254, 214, 206, 0.3)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b0cbe6' }}>{card.category}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      backgroundColor: card.rarity === 'Legendary' ? '#fed6ce' : '#1d3156',
                      color: card.rarity === 'Legendary' ? '#1d3156' : '#b0cbe6',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px'
                    }}>
                      {card.rarity}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{card.name}</h3>

                  {/* Stat Attributes Display */}
                  <div style={{ backgroundColor: '#1d3156', borderRadius: '10px', padding: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div>⚔ ATK: <strong style={{ color: '#fed6ce' }}>{card.stats.attack}</strong></div>
                    <div>🛡 DEF: <strong style={{ color: '#b0cbe6' }}>{card.stats.defense}</strong></div>
                    <div>⚡ SPD: <strong style={{ color: '#fed6ce' }}>{card.stats.speed}</strong></div>
                    <div>🧠 BRN: <strong style={{ color: '#b0cbe6' }}>{card.stats.brains}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder for Battle, Leaderboard, Admin */}
        {(activeTab === 'battle' || activeTab === 'leaderboard' || activeTab === 'admin') && (
          <div style={{ backgroundColor: '#496894', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
              {activeTab.toUpperCase()} MODULE ACTIVE
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#b0cbe6' }}>
              Interactive anime component ready for local dev server testing.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
