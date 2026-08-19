import React, { useEffect, useState } from 'react';
import { User, Medal, Flame, Award, ChevronRight, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMockUserCards } from '../services/apiClient';



interface ProfileProps {
  onNavigate: (screen: string) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  const { currentUser: user, updateUserLocally, logout, avatars } = useAuth();
  const [cardCount, setCardCount] = useState<number>(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

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
      const { updateMockUser } = await import('../services/apiClient');
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
        <div 
          onClick={() => setIsAvatarModalOpen(true)}
          style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          background: 'var(--color-card-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          border: '3px solid var(--color-accent)',
          boxShadow: '0 8px 24px rgba(211, 122, 50, 0.12)',
          fontSize: '48px',
          overflow: 'hidden',
          cursor: 'pointer'
        }}>
          <span className={avatars.find(a => a.id === (user.avatar || 'owl'))?.cssClass || 'avatar-owl'}>
            {avatars.find(a => a.id === (user.avatar || 'owl'))?.emoji || '🦉'}
          </span>
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



      {/* Avatar Selection Modal */}
      {isAvatarModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px'
        }} onClick={() => setIsAvatarModalOpen(false)}>
          <div style={{
            background: 'var(--color-bg)', padding: '24px', borderRadius: '24px',
            width: '100%', maxWidth: '400px', boxShadow: '0 12px 48px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
                Choose Avatar
              </h3>
              <button onClick={() => setIsAvatarModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {avatars.map((item) => {
                const isSelected = (user.avatar || 'owl') === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={async () => {
                      const { updateMockUser } = await import('../services/apiClient');
                      const updatedUser = await updateMockUser(user.id, { avatar: item.id });
                      if (updatedUser) {
                        updateUserLocally(updatedUser);
                      }
                      setIsAvatarModalOpen(false);
                    }}
                    style={{
                      background: isSelected ? 'rgba(211, 122, 50, 0.12)' : 'var(--color-card-bg)',
                      border: isSelected ? '2px solid var(--color-accent)' : '1.5px solid var(--color-border)',
                      borderRadius: '16px',
                      padding: '12px 6px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(44, 34, 30, 0.03)',
                      transition: 'all 0.2s',
                      transform: isSelected ? 'scale(1.03)' : 'scale(1)'
                    }}
                  >
                    <span className={item.cssClass} style={{ fontSize: '32px' }}>
                      {item.emoji}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: isSelected ? 'var(--color-accent)' : 'var(--color-muted)', textAlign: 'center', lineHeight: 1.1 }}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="flex justify-center mt-12 mb-4">
        <button
          onClick={logout}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1.5px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 8,
            color: '#EF4444',
            fontSize: 14,
            fontWeight: 700,
            padding: '10px 24px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

    </div>
  );
}
