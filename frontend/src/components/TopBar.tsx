import WitsLogo from './WitsLogo';
import { IconFlame, IconSettings } from './IconSet';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

interface TopBarProps {
  onAdminNav?: () => void;
}

export default function TopBar({ onAdminNav }: TopBarProps) {
  const { currentUser, logout } = useAuth();

  const level = currentUser?.level || 1;
  const currentXP = currentUser?.currentXP || 0;
  const targetXP = level * 200;
  const xpPct = Math.min(100, Math.max(5, Math.round((currentXP / targetXP) * 100)));

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-2"
      style={{
        background: 'rgba(17, 30, 54, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(164, 181, 209, 0.2)',
      }}
    >
      {/* Official Wits University Crest Logo */}
      <div className="flex items-center gap-2 pr-2 border-r border-slate-700/50">
        <WitsLogo variant="compact" showText={false} width={34} height={34} />
        <div className="hidden sm:block">
          <span style={{ fontSize: 11, fontWeight: 800, color: '#ffffff', letterSpacing: '0.1em' }}>WITS</span>
          <span style={{ fontSize: 9, display: 'block', color: '#b0cbe6', letterSpacing: '0.15em', marginTop: -2 }}>QUEST</span>
        </div>
      </div>

      {/* Student Avatar & Badge */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #496894, #1d3156)',
          border: '2px solid rgba(254, 214, 206, 0.7)',
          boxShadow: '0 0 12px rgba(254, 214, 206, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          color: '#fed6ce',
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        {currentUser?.initials || 'KM'}
      </div>

      {/* Player Info & Level */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
            {currentUser?.name || currentUser?.username || 'Wits Scholar'}
          </span>
          <span
            className="badge"
            style={{ background: 'rgba(254, 214, 206, 0.2)', color: '#fed6ce', fontSize: 10, padding: '2px 6px', borderRadius: 6 }}
          >
            Lv.{level} {currentUser?.divisionTier || 'Explorer'}
          </span>
          <div className="flex items-center gap-1" style={{ background: 'rgba(254, 214, 206, 0.15)', padding: '2px 6px', borderRadius: 10 }}>
            <IconFlame size={12} color="#fed6ce" />
            <span style={{ fontSize: 11, color: '#fed6ce', fontWeight: 700 }}>
              {currentUser?.dailyStreakCount || 1}d Streak
            </span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="flex items-center gap-2 mt-1">
          <div className="stat-bar-track flex-1">
            <div
              className="xp-bar-fill stat-bar-fill"
              style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg, #b0cbe6, #fed6ce)', transition: 'width 0.4s ease' }}
            />
          </div>
          <span style={{ fontSize: 10, color: '#a4b5d1', whiteSpace: 'nowrap' }}>
            {currentXP.toLocaleString()} / {targetXP.toLocaleString()} XP
          </span>
        </div>
      </div>

      {/* Admin Console Toggle */}
      {onAdminNav && (
        <button
          onClick={onAdminNav}
          className="flex items-center gap-1"
          style={{
            background: 'rgba(73, 104, 148, 0.4)',
            border: '1px solid rgba(164, 181, 209, 0.3)',
            borderRadius: 8,
            color: '#a4b5d1',
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 10px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <IconSettings size={12} color="#a4b5d1" />
          <span>Admin</span>
        </button>
      )}

      {/* Log Out Button */}
      <button
        onClick={logout}
        title="Sign Out to Login Page"
        className="flex items-center gap-1"
        style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 8,
          color: '#f87171',
          fontSize: 11,
          fontWeight: 600,
          padding: '4px 8px',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <LogOut size={12} color="#f87171" />
        <span className="hidden sm:inline">Exit</span>
      </button>
    </div>
  );
}
