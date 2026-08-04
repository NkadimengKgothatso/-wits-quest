import React from 'react';

interface WitsLogoProps {
  width?: number;
  height?: number;
  showText?: boolean;
  className?: string;
  variant?: 'full' | 'crest-only' | 'compact';
}

export default function WitsLogo({
  width = 180,
  height,
  showText = true,
  variant = 'full',
  className = ''
}: WitsLogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Official Wits Kudu Crest & Shield Vector Emblem */}
      <svg
        viewBox="0 0 200 240"
        width={variant === 'compact' ? 36 : (width ? width * 0.45 : 80)}
        height={variant === 'compact' ? 36 : (height ? height * 0.45 : 96)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 12px rgba(254, 214, 206, 0.35))' }}
      >
        {/* Kudu Head & Horns Silhouette */}
        <g id="KuduHead">
          {/* Left Horn */}
          <path
            d="M 90,65 C 75,50 60,30 65,15 C 68,6 78,5 82,12 C 84,18 78,32 88,48 C 92,54 96,58 98,62 Z"
            fill="#a4b5d1"
          />
          {/* Right Horn */}
          <path
            d="M 110,65 C 125,50 140,30 135,15 C 132,6 122,5 118,12 C 116,18 122,32 112,48 C 108,54 104,58 102,62 Z"
            fill="#a4b5d1"
          />
          {/* Head & Neck */}
          <path
            d="M 88,62 C 80,68 85,82 92,95 L 100,105 L 108,95 C 115,82 120,68 112,62 C 106,60 94,60 88,62 Z"
            fill="#d1dbe8"
          />
          {/* Muzzle */}
          <path d="M 96,95 L 100,103 L 104,95 Z" fill="#1d3156" />
        </g>

        {/* Heraldic Shield */}
        <g id="Shield">
          {/* Shield Outer Frame */}
          <path
            d="M 40,110 C 40,110 40,185 100,215 C 160,185 160,110 160,110 L 40,110 Z"
            fill="#1d3156"
            stroke="#fed6ce"
            strokeWidth="4"
          />
          {/* Gold Upper Section */}
          <path
            d="M 43,113 L 157,113 L 157,145 L 43,145 Z"
            fill="#d4af37"
          />
          {/* Open Book Emblem on Gold */}
          <g id="OpenBook" transform="translate(82, 118)">
            <path
              d="M 4,16 C 10,12 18,12 18,12 L 18,3 C 18,3 10,3 4,7 Z"
              fill="#ffffff"
              stroke="#1d3156"
              strokeWidth="1.5"
            />
            <path
              d="M 32,16 C 26,12 18,12 18,12 L 18,3 C 18,3 26,3 32,7 Z"
              fill="#ffffff"
              stroke="#1d3156"
              strokeWidth="1.5"
            />
            <line x1="8" y1="7" x2="14" y2="7" stroke="#1d3156" strokeWidth="1" />
            <line x1="8" y1="10" x2="14" y2="10" stroke="#1d3156" strokeWidth="1" />
            <line x1="22" y1="7" x2="28" y2="7" stroke="#1d3156" strokeWidth="1" />
            <line x1="22" y1="10" x2="28" y2="10" stroke="#1d3156" strokeWidth="1" />
          </g>

          {/* Waves in Lower Shield */}
          <path
            d="M 43,160 Q 60,150 75,160 T 110,160 T 145,160 T 157,160 L 157,180 Q 130,200 100,211 Q 70,200 43,180 Z"
            fill="#496894"
          />
          <path
            d="M 46,172 Q 65,165 80,172 T 120,172 T 154,172 C 150,182 130,198 100,208 C 70,198 50,182 46,172 Z"
            fill="#b0cbe6"
            opacity="0.6"
          />
        </g>

        {/* Motto Ribbon - Scientia et Labore */}
        {variant !== 'compact' && (
          <g id="Ribbon" transform="translate(15, 205)">
            <path
              d="M 10,12 C 40,2 130,2 160,12 L 170,22 L 155,20 C 130,10 40,10 15,20 L 0,22 Z"
              fill="#132340"
              stroke="#b0cbe6"
              strokeWidth="1"
            />
            <text
              x="85"
              y="13"
              fill="#fed6ce"
              fontSize="8.5"
              fontWeight="bold"
              fontFamily="Outfit, serif"
              textAnchor="middle"
              letterSpacing="1"
            >
              SCIENTIA ET LABORE
            </text>
          </g>
        )}
      </svg>

      {/* Typography: WITS UNIVERSITY */}
      {showText && variant !== 'compact' && (
        <div className="text-center mt-2">
          <h2
            style={{
              fontFamily: "'Times New Roman', Times, serif, 'Outfit'",
              fontWeight: 800,
              fontSize: width ? width * 0.16 : 28,
              letterSpacing: '0.12em',
              color: '#ffffff',
              lineHeight: 1.1,
              textTransform: 'uppercase',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}
          >
            WITS
          </h2>
          <p
            style={{
              fontFamily: "'Times New Roman', Times, serif, 'Outfit'",
              fontWeight: 600,
              fontSize: width ? width * 0.07 : 13,
              letterSpacing: '0.28em',
              color: '#b0cbe6',
              textTransform: 'uppercase',
              marginTop: 2
            }}
          >
            UNIVERSITY
          </p>
        </div>
      )}
    </div>
  );
}
