/**
 * Lumina OS color tokens — exact palette from stitch/DESIGN.md.
 *
 * Material 3 dark scheme: deep charcoal surfaces, neon functional accents.
 *
 * Electric Blue (primary-container):  #00f0ff  — navigation, core OS
 * Neon Green  (secondary-container): #2ff801  — habits, growth
 * Hot Pink    (tertiary-container):  #ffccd6  — health, vitality
 * Gold        (accent):              #FFD700   — rewards, goals
 */
export const colors = {
  // ---- surfaces (Material 3 dark scale, exact) ---------------------------
  appBg: '#131313', // background / surface / surface-dim
  screenBg: '#131313',
  card: '#1c1b1b', // surface-container-low
  cardAlt: '#201f1f', // surface-container
  track: '#2a2a2a', // surface-container-high
  border: 'rgba(255,255,255,0.08)', // glass-card border

  // ---- text ---------------------------------------------------------------
  text: '#e5e2e1', // on-surface
  textOnDark: '#ffffff',
  muted: '#b9cacb', // on-surface-variant
  tabInactive: '#b9cacb', // on-surface-variant

  // ---- domain accents (mapped from spec palette) -------------------------
  purple: '#bb86fc', // custom accent purple
  purpleDeep: '#9c5fe8',
  teal: '#00dbe9', // primary-fixed-dim / surface-tint
  tealDeep: '#00b8d4',
  green: '#2ff801', // secondary-container (Neon Green)
  greenDeep: '#00c800',
  orange: '#ff8c00',
  orangeDeep: '#e07000',
  yellow: '#FFD700',
  yellowDeep: '#e0b800',
  red: '#ff1744',
  redDeep: '#d50000',
  blue: '#00f0ff', // primary-container (Electric Blue)
  blueDeep: '#00bcd4',
  pink: '#ffccd6', // tertiary-container (Hot Pink)
  pinkDeep: '#ff4081',
  gold: '#FFD700', // Gold accent
  goldDeep: '#ffab00',
  amber: '#ff8f00',
  copper: '#d84315',
  goldSoft: '#fff8e1',

  white: '#ffffff',
  black: '#0e0e0e', // surface-container-lowest

  // ---- exact Material 3 tokens (for direct reference) --------------------
  primary: '#dbfcff',
  onPrimary: '#00363a',
  primaryContainer: '#00f0ff',
  onPrimaryContainer: '#006970',
  secondary: '#d7ffc5',
  onSecondary: '#053900',
  secondaryContainer: '#2ff801',
  onSecondaryContainer: '#0f6d00',
  tertiary: '#fff3f4',
  onTertiary: '#66002c',
  tertiaryContainer: '#ffccd6',
  onTertiaryContainer: '#bb0058',
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#b9cacb',
  outline: '#849495',
  outlineVariant: '#3b494b',
  surfaceTint: '#00dbe9',
  primaryFixed: '#7df4ff',
  primaryFixedDim: '#00dbe9',
  secondaryFixed: '#79ff5b',
  secondaryFixedDim: '#2ae500',
  tertiaryFixed: '#ffd9e0',
  tertiaryFixedDim: '#ffb1c3',
  surfaceContainerLowest: '#0e0e0e',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainer: '#201f1f',
  surfaceContainerHigh: '#2a2a2a',
  surfaceContainerHighest: '#353534',
} as const;

/** Add an alpha suffix to a hex (e.g. tint('#00f0ff') -> '#00f0ff1A'). */
export const tint = (hex: string, alpha = '1A') => `${hex}${alpha}`;

/**
 * Glass surface tokens following the exact glass-card spec:
 *   background: rgba(26,26,26,0.6)
 *   backdrop-filter: blur(12px)
 *   border: 1px solid rgba(255,255,255,0.08)
 */
export const glass = {
  fill: 'rgba(26,26,26,0.6)',
  fillStrong: 'rgba(26,26,26,0.8)',
  fillSoft: 'rgba(26,26,26,0.4)',
  rim: 'rgba(255,255,255,0.08)',
  rimSoft: 'rgba(255,255,255,0.05)',
  dark: 'rgba(255,255,255,0.08)', // dark glass for pills on dark bg
  darkRim: 'rgba(255,255,255,0.12)',
} as const;

/**
 * Gradient stops. Glow/bloom effects use 15-20px blur of accent colors.
 */
export const gradients = {
  backdrop: ['#1A1A1A', '#131313'] as const,
  warm: ['#242424', '#1A1A1A'] as const,
  green: ['#2ff801', '#00c800'] as const,
  purple: ['#bb86fc', '#9c5fe8'] as const,
  gold: ['#FFD700', '#ffab00'] as const,
  gem: ['#00dbe9', '#00b8d4'] as const,
  red: ['#ff1744', '#d50000'] as const,
  blue: ['#00f0ff', '#00bcd4'] as const,
  pink: ['#ffccd6', '#ff4081'] as const,
  gloss: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.0)'] as const,
  glassPanel: [
    'rgba(255,255,255,0.03)',
    'rgba(255,255,255,0.01)',
    'rgba(255,255,255,0.0)',
  ] as const,
  spend: ['#00dbe9', '#2ff801'] as const,
  /** Power Orb gradient: Electric Blue → Neon Green */
  powerOrb: ['#00f0ff', '#2ae500'] as const,
};

export type AppColors = typeof colors;

export interface DomainPalette {
  accent: string;
  deep: string;
  soft: string;
  gradient: readonly [string, string];
}

export const domains = {
  today: {
    accent: '#00dbe9', // primary-fixed-dim (teal)
    deep: '#00b8d4',
    soft: tint('#00dbe9'),
    gradient: gradients.gem,
  },
  tasks: {
    accent: '#00f0ff', // primary-container (Electric Blue)
    deep: '#00bcd4',
    soft: tint('#00f0ff'),
    gradient: gradients.blue,
  },
  finance: {
    accent: '#FFD700', // Gold
    deep: '#ffab00',
    soft: tint('#FFD700'),
    gradient: gradients.gold,
  },
  health: {
    accent: '#ffccd6', // tertiary-container (Hot Pink)
    deep: '#ff4081',
    soft: tint('#ffccd6'),
    gradient: gradients.pink,
  },
  journal: {
    accent: '#ffccd6',
    deep: '#ff4081',
    soft: tint('#ffccd6'),
    gradient: gradients.pink,
  },
  habits: {
    accent: '#2ff801', // secondary-container (Neon Green)
    deep: '#00c800',
    soft: tint('#2ff801'),
    gradient: gradients.green,
  },
  goals: {
    accent: '#FFD700', // Gold
    deep: '#ffab00',
    soft: tint('#FFD700'),
    gradient: gradients.gold,
  },
  notes: {
    accent: '#FFD700',
    deep: '#e0b800',
    soft: tint('#FFD700'),
    gradient: gradients.gold,
  },
  inbox: {
    accent: '#bb86fc', // purple
    deep: '#9c5fe8',
    soft: tint('#bb86fc'),
    gradient: gradients.purple,
  },
} as const satisfies Record<string, DomainPalette>;

export type DomainKey = keyof typeof domains;

/** Neon glow drop-shadow — 15-20px blur of accent color at 30% opacity */
export const glow = (hex: string, opacity = 0.3, radius = 18) =>
  ({
    shadowColor: hex,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Math.round(radius / 2),
  }) as const;

/** 3D base shadow for pressable elements */
export const base3D = (deepHex: string, height = 5) =>
  ({
    shadowColor: deepHex,
    shadowOffset: { width: 0, height },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: height + 2,
  }) as const;

const ACCENT_FACES: readonly string[] = [
  '#bb86fc', '#FFD700', '#00dbe9', '#2ff801', '#ff8c00',
  '#FFD700', '#ff1744', '#00f0ff', '#ffccd6',
];

const ACCENT_DEEP: Record<string, string> = {
  '#bb86fc': '#9c5fe8',
  '#FFD700': '#ffab00',
  '#00dbe9': '#00b8d4',
  '#2ff801': '#00c800',
  '#ff8c00': '#e07000',
  '#ff1744': '#d50000',
  '#00f0ff': '#00bcd4',
  '#ffccd6': '#ff4081',
};

const ACCENT_GRADIENT: Record<string, readonly [string, string]> = {
  '#bb86fc': gradients.purple,
  '#FFD700': gradients.gold,
  '#00dbe9': gradients.gem,
  '#2ff801': gradients.green,
  '#ff8c00': gradients.gold,
  '#ff1744': gradients.red,
  '#00f0ff': gradients.blue,
  '#ffccd6': gradients.pink,
};

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

export function resolveAccent(hex: string): { face: string; deep: string } {
  if (ACCENT_DEEP[hex]) return { face: hex, deep: ACCENT_DEEP[hex] };
  const rgb = hexToRgb(hex);
  if (!rgb) return { face: '#bb86fc', deep: '#9c5fe8' };
  let best = ACCENT_FACES[0];
  let bestDist = Infinity;
  for (const face of ACCENT_FACES) {
    const frgb = hexToRgb(face);
    if (!frgb) continue;
    const dist =
      (rgb[0] - frgb[0]) ** 2 +
      (rgb[1] - frgb[1]) ** 2 +
      (rgb[2] - frgb[2]) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = face;
    }
  }
  return { face: best, deep: ACCENT_DEEP[best] };
}

export function gradientFor(face: string): readonly [string, string] {
  return ACCENT_GRADIENT[face] ?? gradients.gem;
}

/** Dark elevation for floating glass panels */
export const elevation = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 6,
  },
  panel: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 5,
  },
} as const;

/** Border radius — extreme pill-shaped. Converted from rem (1rem = 16px). */
export const radius = {
  sm: 8,    // 0.5rem
  md: 16,   // 1rem (DEFAULT)
  lg: 24,   // 1.5rem
  xl: 32,   // 2rem  — primary cards
  xxl: 48,  // 3rem
  pill: 9999, // full
} as const;
