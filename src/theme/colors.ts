/**
 * Personal OS color tokens — "Magic Academy" mobile-game design language.
 *
 * The visual target: a modern, polished game UI. Saturated accents, glossy
 * buttons with a hard coloured "base" shadow for a 3D pressable feel, cooler
 * glassy surfaces, and a soft sky-to-slate backdrop.
 *
 * See `.claude/skills/design-system/SKILL.md` for the full design system.
 */
export const colors = {
  // ---- surfaces ----------------------------------------------------------
  appBg: '#93A7D9', // outermost cool sky backdrop
  screenBg: '#EEF3FF', // light blue-white screen background
  card: '#FCFDFF', // card / panel surface (bright)
  cardAlt: '#F4F8FF', // alternate cool panel
  track: '#DCE5F6', // progress track / inset wells
  border: '#C8D5EE', // soft cool hairline / panel edge

  // ---- text --------------------------------------------------------------
  text: '#182033', // primary text (deep slate)
  textOnDark: '#FFFFFF', // text on coloured/3D buttons
  muted: '#6E7A96', // secondary / muted cool text
  tabInactive: '#93A0BD', // inactive tab tint

  // ---- accents (candy game palette) --------------------------------------
  purple: '#6D5EF7', // primary magic accent
  purpleDeep: '#4B3FD0', // 3D base / pressed shade for purple
  teal: '#1ECAD3', // gems / info
  tealDeep: '#1296A3',
  green: '#57C96B', // success / primary CTA
  greenDeep: '#31964B',
  orange: '#FF9B55', // coins / warning
  orangeDeep: '#D7722F',
  yellow: '#FFC94A', // XP / stars
  yellowDeep: '#D99A1C',
  red: '#FF647C', // danger / close / expense
  redDeep: '#D6455D',
  blue: '#4F8CFF', // secondary info
  blueDeep: '#3265D6',
  pink: '#FF78AE',
  pinkDeep: '#D9568A',

  white: '#FFFFFF',
  black: '#101522',
} as const;

/** Add an alpha suffix to a hex (e.g. tint('#3FD4E8') -> '#3FD4E81A'). */
export const tint = (hex: string, alpha = '1A') => `${hex}${alpha}`;

/**
 * Gradient stops used across the app. Game UIs lean on glossy vertical
 * gradients (light top -> rich bottom) plus the signature gloss highlight.
 */
export const gradients = {
  // screen backdrop (soft sky)
  backdrop: ['#C4D4FF', '#93A7D9'] as const,
  // cool interior wash
  warm: ['#F8FBFF', '#EEF3FF'] as const,
  // CTA candy green
  green: ['#7CDE8E', '#57C96B'] as const,
  // magic purple
  purple: ['#9A8CFF', '#6D5EF7'] as const,
  // coins / gold
  gold: ['#FFD978', '#FF9B55'] as const,
  // gems / cyan
  gem: ['#72E4EA', '#1ECAD3'] as const,
  // danger
  red: ['#FF94A7', '#FF647C'] as const,
  // sky / tasks
  blue: ['#7DAFFF', '#4F8CFF'] as const,
  // candy pink
  pink: ['#FFA1C7', '#FF78AE'] as const,
  // glossy highlight overlay (top sheen on jelly buttons)
  gloss: ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.0)'] as const,
  // progress fill
  spend: ['#7C5BE6', '#3FD4E8'] as const,
};

export type AppColors = typeof colors;

/**
 * Per-domain identity colors. Each entry carries an `accent` (solid), a `deep`
 * (the darker 3D base / pressed shade), a `soft` (tint for chips) and a glossy
 * `gradient` pair for buttons / rings / headers.
 */
export interface DomainPalette {
  accent: string;
  deep: string;
  soft: string;
  gradient: readonly [string, string];
}

export const domains = {
  today: {
    accent: colors.purple,
    deep: colors.purpleDeep,
    soft: tint(colors.purple),
    gradient: gradients.purple,
  },
  tasks: {
    accent: colors.blue,
    deep: colors.blueDeep,
    soft: tint(colors.blue),
    gradient: ['#7DA8FF', '#5B8DEF'],
  },
  finance: {
    accent: colors.teal,
    deep: colors.tealDeep,
    soft: tint(colors.teal),
    gradient: gradients.gem,
  },
  health: {
    accent: colors.red,
    deep: colors.redDeep,
    soft: tint(colors.red),
    gradient: gradients.red,
  },
  journal: {
    accent: colors.pink,
    deep: colors.pinkDeep,
    soft: tint(colors.pink),
    gradient: ['#FF9ECB', '#FF7EB6'],
  },
  habits: {
    accent: colors.orange,
    deep: colors.orangeDeep,
    soft: tint(colors.orange),
    gradient: gradients.gold,
  },
  goals: {
    accent: colors.green,
    deep: colors.greenDeep,
    soft: tint(colors.green),
    gradient: gradients.green,
  },
  notes: {
    accent: colors.yellow,
    deep: colors.yellowDeep,
    soft: tint(colors.yellow),
    gradient: gradients.gold,
  },
  inbox: {
    accent: colors.purple,
    deep: colors.purpleDeep,
    soft: tint(colors.purple),
    gradient: gradients.purple,
  },
} as const satisfies Record<string, DomainPalette>;

export type DomainKey = keyof typeof domains;

/**
 * Colored drop-shadow "glow" preset — a soft tinted halo around an element.
 * iOS uses shadow*, Android falls back to `elevation`.
 */
export const glow = (hex: string, opacity = 0.45, radius = 18) =>
  ({
    shadowColor: hex,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Math.round(radius / 2),
  }) as const;

/**
 * The signature game "3D base" shadow: a HARD (zero-blur) coloured shadow
 * offset straight down, making a button look like a thick pressable slab
 * sitting on a darker base. Pair with `deep` colours.
 */
export const base3D = (deepHex: string, height = 5) =>
  ({
    shadowColor: deepHex,
    shadowOffset: { width: 0, height },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: height + 2,
  }) as const;

const ACCENT_FACES: readonly string[] = [
  colors.purple,
  colors.teal,
  colors.green,
  colors.orange,
  colors.yellow,
  colors.red,
  colors.blue,
  colors.pink,
];

const ACCENT_DEEP: Record<string, string> = {
  [colors.purple]: colors.purpleDeep,
  [colors.teal]: colors.tealDeep,
  [colors.green]: colors.greenDeep,
  [colors.orange]: colors.orangeDeep,
  [colors.yellow]: colors.yellowDeep,
  [colors.red]: colors.redDeep,
  [colors.blue]: colors.blueDeep,
  [colors.pink]: colors.pinkDeep,
};

const ACCENT_GRADIENT: Record<string, readonly [string, string]> = {
  [colors.purple]: gradients.purple,
  [colors.teal]: gradients.gem,
  [colors.green]: gradients.green,
  [colors.orange]: gradients.gold,
  [colors.yellow]: gradients.gold,
  [colors.red]: gradients.red,
  [colors.blue]: gradients.blue,
  [colors.pink]: gradients.pink,
};

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

/**
 * Map an arbitrary hex color to the nearest theme accent face, so any
 * category/domain color always resolves to a real `deep` 3D-base pairing —
 * even for legacy/custom hexes that aren't an exact palette match.
 */
export function resolveAccent(hex: string): { face: string; deep: string } {
  if (ACCENT_DEEP[hex]) return { face: hex, deep: ACCENT_DEEP[hex] };

  const rgb = hexToRgb(hex);
  if (!rgb) return { face: colors.purple, deep: colors.purpleDeep };

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

/** Glossy 2-stop gradient matched to a resolved accent face. */
export function gradientFor(face: string): readonly [string, string] {
  return ACCENT_GRADIENT[face] ?? gradients.gem;
}

/** Neutral soft elevation for floating panels/cards. */
export const elevation = {
  card: {
    shadowColor: '#4B5D86',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  panel: {
    shadowColor: '#40527A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },
} as const;

/** Border radius scale — chunky, jelly-rounded corners. */
export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999,
} as const;
