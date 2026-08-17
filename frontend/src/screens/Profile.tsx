import React, { useEffect, useState } from 'react';
import { User, Medal, Flame, Award, ChevronRight, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMockUserCards } from '../services/mockDbClient';

interface ProfileProps {
  onNavigate: (screen: string) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  const { currentUser: user, updateUserLocally } = useAuth();
  const [cardCount, setCardCount] = useState<number>(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  useEffect(() => {
    if (user?.id) {
      getMockUserCards(user.id).then(cards => {
        setCardCount(cards.length);
      });
      setEditNameValue(user.name || user.username);
    }
  }, [user?.id, user?.name, user?.username]);

  if (!user) return null;

  const currentLevelTarget = user.level * 200;
  const xpPercent = Math.min(100, Math.max(0, (user.currentXP / currentLevelTarget) * 100));

  const handleSaveName = async () => {
    if (editNameValue.trim()) {
      const { updateMockUser } = await import('../services/mockDbClient');
      const updatedUser = await updateMockUser(user.id, { name: editNameValue.trim(), username: editNameValue.trim().replace(/\s+/g, '_') });
      if (updatedUser) {
        updateUserLocally(updatedUser);
      }
    }
    setIsEditingName(false);
  };

  return (
    <div className="flex flex-col h-full" style={{ padding: '24px 16px', overflowY: 'auto', paddingBottom: '90px' }}>
      <h1 style={{ 
        fontFamily: 'Playfair Display, serif', 
        fontSize: '28px', 
        fontWeight: 700, 
        color: 'var(--color-text)', 
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        Profile
      </h1>

      {/* User Info Header */}
      <div className="flex flex-col items-center mb-8">
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          border: '3px solid var(--color-accent)'
        }}>
          {user.initials ? (
            <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text)' }}>{user.initials}</span>
          ) : (
            <User size={40} color="var(--color-text)" />
          )}
        </div>
        
        {isEditingName ? (
          <div className="flex items-center gap-2 mb-4">
            <input 
              autoFocus
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--color-border)', textAlign: 'center', fontSize: '20px', fontWeight: 700, color: 'var(--color-text)', width: '200px' }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-4" onClick={() => setIsEditingName(true)} style={{ cursor: 'pointer' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{user.name || user.username}</h2>
            <div style={{ padding: '4px', background: 'var(--color-bg)', borderRadius: '50%' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color="var(--color-muted)"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
            </div>
          </div>
        )}

        <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginBottom: '8px' }}>
          Level {user.level} {user.divisionTier} - {user.dailyStreakCount}-day streak
        </p>
        
        {/* XP Bar */}
        <div style={{ width: '200px', height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${xpPercent}%`, height: '100%', background: 'var(--color-accent)' }} />
        </div>
        <p style={{ fontSize: '10px', color: 'var(--color-muted)', marginTop: '4px' }}>{user.currentXP} / {currentLevelTarget} XP</p>
      </div>

      {/* Stats Container */}
      <div className="flex justify-between mb-8" style={{ gap: '12px' }}>
        {[
          { label: 'Cards', value: cardCount.toString() },
          { label: 'PvP Wins', value: user.pvpWins.toString() },
          { label: 'Essence', value: user.essenceBalance.toString() }
        ].map(stat => (
          <div key={stat.label} className="flex-1 flex flex-col items-center justify-center" style={{
            background: 'var(--color-card-bg)',
            padding: '16px 8px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(44, 34, 30, 0.05)'
          }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>{stat.value}</span>
            <span style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: 500 }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Reputation Badges */}
      <div>
        <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Reputation Badges</h3>
        <div className="flex justify-between" style={{ padding: '0 8px' }}>
          {[
            { icon: <Award size={20} color="var(--color-text)" />, label: 'First Card', bg: 'rgba(211, 122, 50, 0.15)' },
            { icon: <Flame size={20} color="var(--color-text)" />, label: `${user.dailyStreakCount}-Day Streak`, bg: 'rgba(74, 124, 89, 0.15)' },
            { icon: <Medal size={20} color="var(--color-text)" />, label: user.divisionTier, bg: 'rgba(44, 34, 30, 0.1)' },
            { icon: <Award size={20} color="var(--color-text)" />, label: 'First Win', bg: 'rgba(211, 122, 50, 0.15)' }
          ].map(badge => (
            <div key={badge.label} className="flex flex-col items-center gap-2">
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: badge.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {badge.icon}
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-text)', fontWeight: 600, textAlign: 'center', maxWidth: '50px' }}>
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
