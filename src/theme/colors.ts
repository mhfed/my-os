/**
 * Personal OS color tokens — "Sunny Farm Glass" design language.
 *
 * The visual target: a bright, cheerful farm-game world (blue sky, rolling
 * green hills, golden sun) with UI chrome rendered as translucent 3D glass —
 * frosted white panels you can see the scenery through, chunky see-through
 * candy buttons with hard coloured 3D bases, and glossy sheens everywhere.
 *
 * See `.claude/skills/design-system/SKILL.md` for the full design system.
 */
export const colors = {
  // ---- surfaces ------------------------------------------------------------
  appBg: '#5EC4F0', // farm sky blue (outermost backdrop)
  screenBg: '#D8F1FF', // light sky fallback behind the Skia scene
  card: '#FFFFFFB8', // translucent white glass panel (~72%)
  cardAlt: '#EFFBFFA6', // tinted alt glass (~65%)
  track: '#FFFFFF7A', // translucent inset well / progress track
  border: '#FFFFFFE0', // bright glass rim

  // ---- text ----------------------------------------------------------------
  text: '#3E2C15', // warm farm-brown primary text
  textOnDark: '#FFFFFF', // text on coloured/3D buttons
  muted: '#8A7150', // secondary text (hay brown)
  tabInactive: '#7E97AA', // inactive tab tint (hazy sky)

  // ---- accents (juicy farm palette) ----------------------------------------
  purple: '#9C5FE8', // berry / magic
  purpleDeep: '#7239BC',
  teal: '#2FC6E4', // pond water / gems
  tealDeep: '#1795B4',
  green: '#58C832', // grass / success CTA
  greenDeep: '#3B9414',
  orange: '#FF9330', // carrot / coins
  orangeDeep: '#D66B0E',
  yellow: '#FFC933', // sunshine / XP
  yellowDeep: '#E09E00',
  red: '#FF5D55', // barn red / danger
  redDeep: '#D63A34',
  blue: '#3D9BFF', // clear sky / info
  blueDeep: '#1F6FD6',
  pink: '#FF7FC3', // blossom
  pinkDeep: '#E0509A',
  gold: '#FFD700', // treasure / coins
  goldDeep: '#B8860B', // gold 3D base
  amber: '#FF8C00', // warm treasure accent
  copper: '#CD7F32', // copper accent
  goldSoft: '#FFF3C4', // gold tint fill

  white: '#FFFFFF',
  black: '#26190B',
} as const;

/** Add an alpha suffix to a hex (e.g. tint('#3FD4E8') -> '#3FD4E81A'). */
export const tint = (hex: string, alpha = '1A') => `${hex}${alpha}`;

/**
 * Translucent "coloured glass" shade — a hex with a heavier alpha so vivid
 * candy surfaces let the farm scenery glow through. Default ~88% opaque.
 */
export const glassy = (hex: string, alpha = 'E0') => `${hex}${alpha}`;

/**
 * Shared frosted-glass surface tokens. Use these instead of ad-hoc rgba
 * whites so every pane of glass in the app matches.
 */
export const glass = {
  /** Primary frosted panel fill (over BlurView). */
  fill: 'rgba(255,255,255,0.42)',
  /** Stronger fill for readable content areas. */
  fillStrong: 'rgba(255,255,255,0.60)',
  /** Subtle fill for far-background shapes. */
  fillSoft: 'rgba(255,255,255,0.22)',
  /** Bright top/outer rim that sells the glass edge. */
  rim: 'rgba(255,255,255,0.92)',
  /** Softer inner rim / hairline. */
  rimSoft: 'rgba(255,255,255,0.55)',
  /** Dark glass (HUD pills sitting on bright sky). */
  dark: 'rgba(38,45,66,0.44)',
  darkRim: 'rgba(255,255,255,0.50)',
} as const;

/**
 * Gradient stops used across the app. Glossy vertical gradients
 * (light top -> rich bottom) plus the signature gloss highlight.
 */
export const gradients = {
  // screen backdrop (sunny sky)
  backdrop: ['#A9E4FF', '#5EC4F0'] as const,
  // soft interior wash
  warm: ['#FFFFFF', '#EAF7FF'] as const,
  // CTA grass green
  green: ['#8BE05C', '#58C832'] as const,
  // berry purple
  purple: ['#BE8CFF', '#9C5FE8'] as const,
  // sunshine gold
  gold: ['#FFDE6B', '#FF9330'] as const,
  // pond gem cyan
  gem: ['#7BE3F5', '#2FC6E4'] as const,
  // barn red
  red: ['#FF938D', '#FF5D55'] as const,
  // clear sky blue
  blue: ['#7FC0FF', '#3D9BFF'] as const,
  // blossom pink
  pink: ['#FFA9D6', '#FF7FC3'] as const,
  // glossy highlight overlay (top sheen on jelly/glass surfaces)
  gloss: ['rgba(255,255,255,0.62)', 'rgba(255,255,255,0.0)'] as const,
  // frosted glass panel wash (diagonal)
  glassPanel: [
    'rgba(255,255,255,0.58)',
    'rgba(255,255,255,0.30)',
    'rgba(255,255,255,0.14)',
  ] as const,
  // progress fill
  spend: ['#58C832', '#2FC6E4'] as const,
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
    gradient: gradients.blue,
  },
  finance: {
    accent: colors.gold,
    deep: colors.goldDeep,
    soft: tint(colors.gold),
    gradient: gradients.gold,
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
    gradient: gradients.pink,
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
  colors.gold,
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
  [colors.gold]: colors.goldDeep,
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
  [colors.gold]: gradients.gold,
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

/** Neutral soft elevation for floating glass panels/cards. */
export const elevation = {
  card: {
    shadowColor: '#1E5E7A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 6,
  },
  panel: {
    shadowColor: '#1E5E7A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
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
