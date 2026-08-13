import WitsLogo from './WitsLogo';
import KuduMascot from './KuduMascot';
import { IconFlame, IconSettings } from './IconSet';

interface TopBarProps {
  onAdminNav?: () => void;
}

export default function TopBar({ onAdminNav }: TopBarProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-2"
      style={{
        background: 'rgba(63, 47, 18, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(220, 166, 104, 0.15)',
      }}
    >
      {/* Official Wits University Crest Logo */}
      <div className="flex items-center gap-2 pr-2 border-r border-[#6b5630]/50">
        <WitsLogo variant="compact" showText={false} width={34} height={34} />
        <div className="hidden sm:block">
          <span style={{ fontSize: 11, fontWeight: 800, color: '#f8f2e8', letterSpacing: '0.1em' }}>WITS</span>
          <span style={{ fontSize: 9, display: 'block', color: '#e8c99a', letterSpacing: '0.15em', marginTop: -2 }}>QUEST</span>
        </div>
      </div>

      {/* Kudu Guide Mascot */}
      <KuduMascot compact message="Welcome back, explorer." />

      {/* Student Avatar & Badge */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6b7d2c, #54441b)',
          border: '2px solid rgba(220, 166, 104, 0.65)',
          boxShadow: '0 0 12px rgba(220, 166, 104, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          color: '#dca668',
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        KM
      </div>

      {/* Player Info & Level */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f8f2e8' }}>Kagiso Mthembu</span>
          <span
            className="badge"
            style={{ background: 'rgba(220, 166, 104, 0.18)', color: '#dca668', fontSize: 10, padding: '2px 6px', borderRadius: 6 }}
          >
            Lv.12 Explorer
          </span>
          <div className="flex items-center gap-1" style={{ background: 'rgba(220, 166, 104, 0.12)', padding: '2px 6px', borderRadius: 10 }}>
            <IconFlame size={12} color="#dca668" />
            <span style={{ fontSize: 11, color: '#dca668', fontWeight: 700 }}>7d Streak</span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="flex items-center gap-2 mt-1">
          <div className="stat-bar-track flex-1">
            <div className="xp-bar-fill stat-bar-fill" style={{ width: '68%', background: 'linear-gradient(90deg, #e8c99a, #dca668)' }} />
          </div>
          <span style={{ fontSize: 10, color: '#dca668', whiteSpace: 'nowrap' }}>2,450 / 3,600 XP</span>
        </div>
      </div>

      {/* Admin Console Toggle */}
      {onAdminNav && (
        <button
          onClick={onAdminNav}
          className="flex items-center gap-1"
          style={{
            background: 'rgba(107, 125, 44, 0.4)',
            border: '1px solid rgba(220, 166, 104, 0.25)',
            borderRadius: 8,
            color: '#dca668',
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 10px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <IconSettings size={12} color="#dca668" />
          <span>Admin</span>
        </button>
      )}
    </div>
  );
}
