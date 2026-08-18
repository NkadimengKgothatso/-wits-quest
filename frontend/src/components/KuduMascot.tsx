import { useEffect, useState } from 'react';

interface KuduMascotProps {
  message?: string;
  pulse?: boolean;
  onClick?: () => void;
  compact?: boolean;
  mood?: 'neutral' | 'happy' | 'sad' | 'excited';
}

const DEFAULT_TIPS = [
  'Tap a glowing landmark to start a trivia challenge.',
  'Build your deck before challenging another student.',
  'Visit campus zones to earn territory points.',
  'Legendary cards appear at special Wits events.',
  'Check the leaderboard to see top explorers.',
];

export default function KuduMascot({ message, pulse = false, onClick, compact = false, mood = 'neutral' }: KuduMascotProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [bubbleOpen, setBubbleOpen] = useState(true);

  const currentMessage = message ?? DEFAULT_TIPS[tipIndex];

  useEffect(() => {
    if (message) return;
    const id = setInterval(() => {
      setTipIndex((i) => (i + 1) % DEFAULT_TIPS.length);
    }, 8000);
    return () => clearInterval(id);
  }, [message]);

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    setBubbleOpen((o) => !o);
  };

  return (
    <div
      className="kudu-breathe"
      style={{
        position: 'relative',
        width: compact ? 56 : 84,
        height: compact ? 56 : 84,
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={handleClick}
      title="Kudu Guide"
    >
      {/* Speech bubble */}
      {bubbleOpen && currentMessage && !compact && (
        <div
          className="slide-up"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: 180,
            maxWidth: 240,
            background: 'rgba(248, 242, 232, 0.96)',
            border: '1px solid rgba(220, 166, 104, 0.4)',
            borderRadius: 14,
            padding: '10px 14px',
            boxShadow: '0 8px 24px rgba(84, 68, 27, 0.18)',
            color: '#54441b',
            fontSize: 12,
            lineHeight: 1.45,
            fontWeight: 500,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {currentMessage}
          <div
            style={{
              position: 'absolute',
              bottom: -6,
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: 12,
              height: 12,
              background: 'rgba(248, 242, 232, 0.96)',
              borderRight: '1px solid rgba(220, 166, 104, 0.4)',
              borderBottom: '1px solid rgba(220, 166, 104, 0.4)',
            }}
          />
        </div>
      )}

      {/* Kudu illustration */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: '100%',
          filter: pulse ? 'drop-shadow(0 0 10px rgba(220,166,104,0.55))' : 'drop-shadow(0 4px 10px rgba(84,68,27,0.2))',
        }}
      >
        {/* Back horn */}
        <path
          d="M56 24c4-2 10-8 12-14 1-3 1-6-1-8s-6-2-7 1c-1 2-2 6-4 9-2 4-6 8-8 10"
          fill="none"
          stroke="#6b5b4f"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M58 22c3-1 8-5 10-9 1-2 1-4-1-5s-4 0-5 2c-1 2-2 4-3 6-1 3-4 5-5 6"
          fill="none"
          stroke="#8a7a6a"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Front horn */}
        <path
          d="M44 24c-4-2-10-8-12-14-1-3-1-6 1-8s6-2 7 1c1 2 2 6 4 9 2 4 6 8 8 10"
          fill="none"
          stroke="#6b5b4f"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M42 22c-3-1-8-5-10-9-1-2-1-4 1-5s4 0 5 2c1 2 2 4 3 6 1 3 4 5 5 6"
          fill="none"
          stroke="#8a7a6a"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Ears */}
        <g className="kudu-ear-twitch">
          <ellipse cx="28" cy="42" rx="10" ry="14" transform="rotate(-25 28 42)" fill="#c9a889" />
          <ellipse cx="28" cy="42" rx="6" ry="9" transform="rotate(-25 28 42)" fill="#a88b6f" />
        </g>
        <g className="kudu-ear-twitch" style={{ animationDelay: '0.3s' }}>
          <ellipse cx="72" cy="42" rx="10" ry="14" transform="rotate(25 72 42)" fill="#c9a889" />
          <ellipse cx="72" cy="42" rx="6" ry="9" transform="rotate(25 72 42)" fill="#a88b6f" />
        </g>

        {/* Head */}
        <ellipse cx="50" cy="52" rx="22" ry="26" fill="#c9a889" />
        <ellipse cx="50" cy="54" rx="14" ry="18" fill="#b89a7a" />

        {/* Muzzle */}
        <ellipse cx="50" cy="70" rx="10" ry="9" fill="#e8d5c4" />
        <ellipse cx="50" cy="68" rx="6" ry="5" fill="#d4bba6" />

        {/* Nose */}
        <ellipse cx="50" cy="74" rx="5" ry="3.5" fill="#5d4e44" />

        {/* Eyes */}
        <ellipse cx="41" cy="50" rx="3.5" ry="4" fill="#3d322a" />
        <ellipse cx="59" cy="50" rx="3.5" ry="4" fill="#3d322a" />
        <circle cx="42" cy="49" r="1.2" fill="#f8f2e8" />
        <circle cx="60" cy="49" r="1.2" fill="#f8f2e8" />

        {/* Eyelids / expression */}
        {mood === 'happy' || mood === 'excited' ? (
          <>
            <path d="M37 51c1.5 2 4.5 2 6 0" stroke="#3d322a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M55 51c1.5 2 4.5 2 6 0" stroke="#3d322a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        ) : mood === 'sad' ? (
          <>
            <path d="M37 46c1.5 1.5 4.5 0.5 6 -0.5" stroke="#a88b6f" strokeWidth="2" strokeLinecap="round" />
            <path d="M55 45.5c1.5 -0.5 4.5 0.5 6 1.5" stroke="#a88b6f" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M37 46c2-1 6-1 8 0" stroke="#a88b6f" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M55 46c2-1 6-1 8 0" stroke="#a88b6f" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}

        {/* Neck / shoulders */}
        <path d="M34 72c-4 8-6 18-6 28h44c0-10-2-20-6-28" fill="#b89a7a" />
        <path d="M42 74c-2 6-3 14-3 26h24c0-12-1-20-3-26" fill="#c9a889" />

        {/* Collar tag */}
        <rect x="44" y="78" width="12" height="6" rx="3" fill="#dca668" />
        <circle cx="50" cy="81" r="1.5" fill="#6b7d2c" />
      </svg>
    </div>
  );
}
