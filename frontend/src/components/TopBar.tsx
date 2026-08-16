import WitsLogo from './WitsLogo';
import KuduMascot from './KuduMascot';
import { IconFlame, IconSettings } from './IconSet';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  onAdminNav?: () => void;
}

export default function TopBar({ onAdminNav }: TopBarProps) {
  const { currentUser: user, logout } = useAuth();
  
  if (!user) return null;

  const xpInLevel = user.currentXP % 200;
  const xpPercent = Math.min(100, Math.max(0, (xpInLevel / 200) * 100));

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-2"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: '0 2px 12px rgba(44, 34, 30, 0.05)',
      }}
    >
      {/* Official Wits University Crest Logo */}
      <div className="flex items-center gap-2 pr-2 border-r" style={{ borderColor: 'var(--color-border)' }}>
        <WitsLogo variant="compact" showText={false} width={34} height={34} />
        <div className="hidden sm:block">
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '0.1em' }}>WITS</span>
          <span style={{ fontSize: 9, display: 'block', color: 'var(--color-accent)', letterSpacing: '0.15em', marginTop: -2 }}>QUEST</span>
        </div>
      </div>

      {/* Kudu Guide Mascot */}
      <KuduMascot compact message={`Welcome back, ${user.name ? user.name.split(' ')[0] : user.username}.`} />

      {/* Student Avatar & Badge */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--color-accent)',
          border: '2px solid rgba(211, 122, 50, 0.65)',
          boxShadow: '0 0 12px rgba(211, 122, 50, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          color: 'white',
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        {user.initials}
      </div>

      {/* Player Info & Level */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>{user.name || user.username}</span>
          <span
            className="badge"
            style={{ background: 'rgba(211, 122, 50, 0.1)', color: 'var(--color-accent)', fontSize: 10, padding: '2px 6px', borderRadius: 6 }}
          >
            Lv.{user.level} {user.divisionTier}
          </span>
          <div className="flex items-center gap-1" style={{ background: 'rgba(211, 122, 50, 0.1)', padding: '2px 6px', borderRadius: 10 }}>
            <IconFlame size={12} color="var(--color-accent)" />
            <span style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 700 }}>{user.dailyStreakCount}d Streak</span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="flex items-center gap-2 mt-1">
          <div className="stat-bar-track flex-1" style={{ background: 'var(--color-border)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
            <div className="xp-bar-fill stat-bar-fill" style={{ width: `${xpPercent}%`, background: 'var(--color-accent)', height: '100%' }} />
          </div>
          <span style={{ fontSize: 10, color: 'var(--color-muted)', whiteSpace: 'nowrap', fontWeight: 600 }}>{xpInLevel} / 200 XP</span>
        </div>
      </div>

      {/* Admin Console & Logout Controls */}
      <div className="flex items-center gap-2" style={{ marginLeft: 'auto' }}>
        {onAdminNav && (
          <button
            onClick={onAdminNav}
            className="flex items-center gap-1"
            style={{
              background: 'transparent',
              border: '1.5px solid var(--color-border)',
              borderRadius: 8,
              color: 'var(--color-text)',
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 8px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <IconSettings size={12} color="var(--color-text)" />
            <span>Admin</span>
          </button>
        )}
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
      </div>
    </div>
  );
}
