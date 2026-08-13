// frontend/src/styles/theme.ts
//
// Wits Quest — original dark navy / sunset-peach glassmorphic theme,
// restored after a brief light-theme experiment. Same token names as
// before so screens that already import `theme` don't need edits.

export const theme = {
  colors: {
    paper: '#1d3156',
    paperDeep: 'rgba(29, 49, 86, 0.6)',
    cardBg: 'rgba(73, 104, 148, 0.35)',
    cardBorder: 'rgba(164, 181, 209, 0.2)',

    ink: '#FFFFFF',
    inkSoft: '#a4b5d1',
    mist: 'rgba(164, 181, 209, 0.5)',

    brass: '#fed6ce',        // Sunset Peach — primary accent / legendary / CTA
    brassSoft: 'rgba(254, 214, 206, 0.15)',

    moss: '#4ade80',         // success / active / in-range
    mossSoft: 'rgba(74, 222, 128, 0.15)',

    lavender: '#a78bfa',     // epic
    lavenderSoft: 'rgba(167, 139, 250, 0.15)',

    sky: '#60a5fa',          // rare / info / active map pins
    skySoft: 'rgba(96, 165, 250, 0.15)',

    rust: '#f87171',         // danger / locked / attack stat
    rustSoft: 'rgba(239, 68, 68, 0.12)',
  },
  fonts: {
    display: `'Outfit', 'Plus Jakarta Sans', sans-serif`,
    body: `'Outfit', 'Plus Jakarta Sans', sans-serif`,
    mono: `'Outfit', 'Plus Jakarta Sans', sans-serif`,
  },
  // Full-page background gradients, used as: style={{ background: theme.gradients.page }}
  gradients: {
    page: 'radial-gradient(ellipse at 30% 10%, #253d6a 0%, #1d3156 45%, #0f1a2e 100%)',
    pageAlt: 'radial-gradient(ellipse at 60% 0%, #253d6a 0%, #1d3156 50%, #0f1a2e 100%)',
    cardFrame: 'linear-gradient(160deg, #1d3156 0%, #253d6a 100%)',
    cardFrameLocked: 'linear-gradient(160deg, #121f38 0%, #182949 100%)',
  },
} as const;

export const RARITY_STYLES: Record<
  'Legendary' | 'Epic' | 'Rare' | 'Common',
  { color: string; soft: string; glow: string; label: string }
> = {
  Legendary: { color: theme.colors.brass, soft: theme.colors.brassSoft, glow: 'rgba(254, 214, 206, 0.4)', label: 'LEGENDARY' },
  Epic: { color: theme.colors.lavender, soft: theme.colors.lavenderSoft, glow: 'rgba(167, 139, 250, 0.3)', label: 'EPIC' },
  Rare: { color: theme.colors.sky, soft: theme.colors.skySoft, glow: 'rgba(96, 165, 250, 0.3)', label: 'RARE' },
  Common: { color: theme.colors.mist, soft: 'rgba(164, 181, 209, 0.1)', glow: 'transparent', label: 'COMMON' },
};

export const STAT_COLORS = {
  attack: theme.colors.rust,
  defense: theme.colors.sky,
  speed: '#facc15',
  brains: theme.colors.lavender,
} as const;