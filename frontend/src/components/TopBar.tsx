import { IconFlame, IconSettings } from './IconSet';
import KuduMascot from './KuduMascot';
import WitsLogo from './WitsLogo';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  adminMode?: boolean;
}

export default function TopBar({ adminMode }: TopBarProps) {
  const { currentUser: user, logout } = useAuth();
  
  if (!user) return null;

  const xpInLevel = user.currentXP % 200;
  const xpPercent = Math.min(100, Math.max(0, (xpInLevel / 200) * 100));

  return (
    <>
      <style>{`
        .animated-name {
          display: inline-block;
          background: linear-gradient(90deg, var(--color-text), var(--color-accent), var(--color-text));
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer {
          to {
            background-position: 200% center;
          }
        }
      `}</style>
      <div
        className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-2"
        style={{
          background: 'rgba(31, 22, 8, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Mascot / Logo */}
        {adminMode ? (
          <div className="flex items-center gap-2 pr-2 border-r" style={{ borderColor: 'var(--color-border)' }}>
            <KuduMascot compact message="" />
          </div>
        ) : (
          <KuduMascot compact message={`Welcome back, ${user.name ? user.name.split(' ')[0] : user.username}.`} />
        )}

        {/* Player Info & Level */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="animated-name" style={{ fontSize: 15, fontWeight: 800 }}>
              {user.name || user.username}
            </span>
            {!adminMode && (
              <>
                <span
                  style={{ background: 'rgba(211, 122, 50, 0.1)', color: 'var(--color-accent)', fontSize: 10, padding: '2px 6px', borderRadius: 6, fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  Lv.{user.level} {user.divisionTier}
                </span>
                <div className="flex items-center gap-1" style={{ background: 'rgba(211, 122, 50, 0.1)', padding: '2px 6px', borderRadius: 10 }}>
                  <IconFlame size={12} color="var(--color-accent)" />
                  <span style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 700 }}>{user.dailyStreakCount}</span>
                </div>
              </>
            )}
          </div>

          {/* XP Progress Bar (Hidden in Admin Mode) */}
          {!adminMode && (
            <div className="flex items-center gap-2 mt-1">
              <div className="stat-bar-track flex-1" style={{ background: 'var(--color-border)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                <div className="xp-bar-fill stat-bar-fill" style={{ width: `${xpPercent}%`, background: 'var(--color-accent)', height: '100%' }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--color-muted)', whiteSpace: 'nowrap', fontWeight: 600 }}>{xpInLevel} / 200 XP</span>
            </div>
          )}
        </div>

        {/* Admin Console Controls & Logout */}
        <div className="flex items-center gap-2" style={{ marginLeft: 'auto' }}>
          {adminMode && (
            <button
              onClick={logout}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1.5px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8,
                color: '#EF4444',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 8px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </>
  );
}
