import { MapPin, Layers, Swords, User, ShieldAlert, FileText, Activity, Users } from 'lucide-react';

interface BottomNavProps {
  active: string;
  onNavigate: (screen: string) => void;
  adminMode?: boolean;
}

const PLAYER_NAV_ITEMS = [
  { id: 'map', label: 'MAP', icon: <MapPin size={20} strokeWidth={2.5} /> },
  { id: 'collection', label: 'CARDS', icon: <Layers size={20} strokeWidth={2.5} /> },
  { id: 'battle', label: 'BATTLE', icon: <Swords size={20} strokeWidth={2.5} /> },
  { id: 'profile', label: 'PROFILE', icon: <User size={20} strokeWidth={2.5} /> },
];

const ADMIN_NAV_ITEMS = [
  { id: 'events', label: 'EVENTS', icon: <MapPin size={20} strokeWidth={2.5} /> },
  { id: 'content', label: 'CONTENT', icon: <FileText size={20} strokeWidth={2.5} /> },
  { id: 'anticheat', label: 'ANTI-CHEAT', icon: <ShieldAlert size={20} strokeWidth={2.5} /> },
  { id: 'profiles', label: 'PLAYERS', icon: <Users size={20} strokeWidth={2.5} /> },
];

export default function BottomNav({ active, onNavigate, adminMode = false }: BottomNavProps) {
  const items = adminMode ? ADMIN_NAV_ITEMS : PLAYER_NAV_ITEMS;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex"
      style={{
        background: '#FAF7F2',
        borderTop: '1px solid #E5D5C5',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200"
            style={{
              color: isActive ? '#D37A32' : '#8A7B72',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32,
                  height: 3,
                  background: '#D37A32',
                  borderRadius: '0 0 4px 4px',
                }}
              />
            )}
            <div style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s' }}>
              {item.icon}
            </div>
            <span style={{ fontSize: 10, fontWeight: isActive ? 800 : 600, letterSpacing: '0.05em' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
