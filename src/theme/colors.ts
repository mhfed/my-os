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
  appBg: '#090A0F', // premium deep dark cyber background
  screenBg: '#090A0F',
  card: '#12141C', // surface-container-low, sleeker dark color
  cardAlt: '#181A24', // surface-container
  track: '#1F2230', // surface-container-high
  border: 'rgba(255,255,255,0.05)', // premium thin glass-card border

  // ---- text ---------------------------------------------------------------
  text: '#E2E8F0', // slate-200
  textOnDark: '#ffffff',
  muted: '#94A3B8', // slate-400
  tabInactive: '#64748B', // slate-500

  // ---- domain accents (refined premium neon finance palette) --------------
  purple: '#8B5CF6', // Amethyst Purple
  purpleDeep: '#7C3AED',
  teal: '#06B6D4', // Cyber Cyan/Teal
  tealDeep: '#0891B2',
  green: '#10B981', // Emerald Green
  greenDeep: '#059669',
  orange: '#F59E0B', // Amber Orange
  orangeDeep: '#D97706',
  yellow: '#FBBF24', // Yellow gold
  yellowDeep: '#D97706',
  red: '#EF4444', // Coral Red
  redDeep: '#DC2626',
  blue: '#0EA5E9', // Premium Electric Blue
  blueDeep: '#0284C7',
  pink: '#EC4899', // Rose Pink
  pinkDeep: '#DB2777',
  gold: '#FBBF24', // Premium Gold
  goldDeep: '#D97706',
  amber: '#F59E0B',
  copper: '#C2410C',
  goldSoft: '#FEF3C7',

  white: '#ffffff',
  black: '#07080D',

  // ---- exact Material 3 tokens (for direct reference) --------------------
  primary: '#E0F2FE',
  onPrimary: '#0369A1',
  primaryContainer: '#0EA5E9',
  onPrimaryContainer: '#075985',
  secondary: '#D1FAE5',
  onSecondary: '#065F46',
  secondaryContainer: '#10B981',
  onSecondaryContainer: '#047857',
  tertiary: '#FCE7F3',
  onTertiary: '#9D174D',
  tertiaryContainer: '#EC4899',
  onTertiaryContainer: '#BE185D',
  error: '#FEE2E2',
  onError: '#991B1B',
  errorContainer: '#EF4444',
  onErrorContainer: '#B91C1C',
  onSurface: '#E2E8F0',
  onSurfaceVariant: '#94A3B8',
  outline: '#475569',
  outlineVariant: '#334155',
  surfaceTint: '#06B6D4',
  primaryFixed: '#BAE6FD',
  primaryFixedDim: '#38BDF8',
  secondaryFixed: '#A7F3D0',
  secondaryFixedDim: '#34D399',
  tertiaryFixed: '#FBCFE8',
  tertiaryFixedDim: '#F472B6',
  surfaceContainerLowest: '#07080D',
  surfaceContainerLow: '#12141C',
  surfaceContainer: '#181A24',
  surfaceContainerHigh: '#1F2230',
  surfaceContainerHighest: '#2A2E3D',
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
  fill: 'rgba(18,20,28,0.7)', // sleeker and darker for premium feel
  fillStrong: 'rgba(12,13,18,0.85)',
  fillSoft: 'rgba(24,26,36,0.5)',
  rim: 'rgba(255,255,255,0.05)',
  rimSoft: 'rgba(255,255,255,0.03)',
  dark: 'rgba(0,0,0,0.2)', // dark glass for pills on dark bg
  darkRim: 'rgba(255,255,255,0.08)',
} as const;

/**
 * Gradient stops. Glow/bloom effects use 15-20px blur of accent colors.
 */
export const gradients = {
  backdrop: ['#0F111A', '#07080D'] as const,
  warm: ['#181922', '#0F111A'] as const,
  green: ['#34D399', '#10B981'] as const,
  purple: ['#C084FC', '#8B5CF6'] as const,
  gold: ['#FCD34D', '#F59E0B'] as const,
  gem: ['#22D3EE', '#06B6D4'] as const,
  red: ['#F87171', '#EF4444'] as const,
  blue: ['#38BDF8', '#0EA5E9'] as const,
  pink: ['#F472B6', '#EC4899'] as const,
  gloss: ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.0)'] as const,
  glassPanel: [
    'rgba(255,255,255,0.02)',
    'rgba(255,255,255,0.01)',
    'rgba(255,255,255,0.0)',
  ] as const,
  spend: ['#10B981', '#06B6D4'] as const,
  /** Power Orb gradient: Cyber Blue → Emerald Green */
  powerOrb: ['#0EA5E9', '#10B981'] as const,
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
    accent: '#06B6D4', // primary-fixed-dim (teal)
    deep: '#0891B2',
    soft: tint('#06B6D4'),
    gradient: gradients.gem,
  },
  tasks: {
    accent: '#0EA5E9', // primary-container (Electric Blue)
    deep: '#0284C7',
    soft: tint('#0EA5E9'),
    gradient: gradients.blue,
  },
  finance: {
    accent: '#FBBF24', // Gold
    deep: '#D97706',
    soft: tint('#FBBF24'),
    gradient: gradients.gold,
  },
  health: {
    accent: '#EC4899', // tertiary-container (Hot Pink)
    deep: '#DB2777',
    soft: tint('#EC4899'),
    gradient: gradients.pink,
  },
  journal: {
    accent: '#EC4899',
    deep: '#DB2777',
    soft: tint('#EC4899'),
    gradient: gradients.pink,
  },
  habits: {
    accent: '#10B981', // secondary-container (Emerald Green)
    deep: '#059669',
    soft: tint('#10B981'),
    gradient: gradients.green,
  },
  goals: {
    accent: '#FBBF24', // Gold
    deep: '#D97706',
    soft: tint('#FBBF24'),
    gradient: gradients.gold,
  },
  notes: {
    accent: '#FBBF24',
    deep: '#D97706',
    soft: tint('#FBBF24'),
    gradient: gradients.gold,
  },
  inbox: {
    accent: '#8B5CF6', // purple
    deep: '#7C3AED',
    soft: tint('#8B5CF6'),
    gradient: gradients.purple,
  },
} as const satisfies Record<string, DomainPalette>;

export type DomainKey = keyof typeof domains;

/** Neon glow drop-shadow — 24px blur of accent color at 15% opacity (softer ambient look) */
export const glow = (hex: string, opacity = 0.15, radius = 24) =>
  ({
    shadowColor: hex,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Math.round(radius / 3),
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
  '#8B5CF6', '#FBBF24', '#06B6D4', '#10B981', '#F59E0B',
  '#EF4444', '#0EA5E9', '#EC4899',
];

const ACCENT_DEEP: Record<string, string> = {
  '#8B5CF6': '#7C3AED',
  '#FBBF24': '#D97706',
  '#06B6D4': '#0891B2',
  '#10B981': '#059669',
  '#F59E0B': '#D97706',
  '#EF4444': '#DC2626',
  '#0EA5E9': '#0284C7',
  '#EC4899': '#DB2777',
};

const ACCENT_GRADIENT: Record<string, readonly [string, string]> = {
  '#8B5CF6': gradients.purple,
  '#FBBF24': gradients.gold,
  '#06B6D4': gradients.gem,
  '#10B981': gradients.green,
  '#F59E0B': gradients.gold,
  '#EF4444': gradients.red,
  '#0EA5E9': gradients.blue,
  '#EC4899': gradients.pink,
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
