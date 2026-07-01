/**
 * Personal OS color tokens — "Magic Academy" mobile-game design language.
 *
 * The visual target: a bright, candy-coloured casual game UI. High-saturation
 * accents, jelly/glossy buttons with a hard coloured "base" shadow for a 3D
 * pressable feel, warm playful surfaces, and a dreamy purple backdrop.
 *
 * See `.claude/skills/design-system/SKILL.md` for the full design system.
 */
export const colors = {
  // ---- surfaces ----------------------------------------------------------
  appBg: '#7C4DFF', // outermost dreamy purple backdrop
  screenBg: '#FBEFD8', // warm cream screen background
  card: '#FFFFFF', // card / panel surface (bright)
  cardAlt: '#FFF6E6', // alternate warm panel
  track: '#EAD9B8', // progress track / inset wells
  border: '#E7C690', // soft warm hairline / panel edge

  // ---- text --------------------------------------------------------------
  text: '#4A2E12', // primary text (warm dark brown — reads on cream)
  textOnDark: '#FFFFFF', // text on coloured/3D buttons
  muted: '#A6814E', // secondary / muted warm text
  tabInactive: '#C9A876', // inactive tab tint

  // ---- accents (candy game palette) --------------------------------------
  purple: '#7C5BE6', // primary magic accent
  purpleDeep: '#5B3FC4', // 3D base / pressed shade for purple
  teal: '#3FD4E8', // gems / info
  tealDeep: '#1FA9BE',
  green: '#6FD03A', // success / primary CTA (Play green)
  greenDeep: '#4DA61F', // CTA 3D base shade
  orange: '#FFA726', // coins / warning
  orangeDeep: '#E07E12',
  yellow: '#FFD23F', // XP / stars
  yellowDeep: '#E0A800',
  red: '#FF5A6E', // danger / close / expense
  redDeep: '#D63A52',
  blue: '#5B8DEF', // secondary info
  blueDeep: '#3D6BC4',
  pink: '#FF7EB6',
  pinkDeep: '#E0568F',

  white: '#FFFFFF',
  black: '#2A1A0A',
} as const;

/** Add an alpha suffix to a hex (e.g. tint('#3FD4E8') -> '#3FD4E81A'). */
export const tint = (hex: string, alpha = '1A') => `${hex}${alpha}`;

/**
 * Gradient stops used across the app. Game UIs lean on glossy vertical
 * gradients (light top -> rich bottom) plus the signature gloss highlight.
 */
export const gradients = {
  // screen backdrop (dreamy purple)
  backdrop: ['#9B6DFF', '#7C4DFF'] as const,
  // warm interior wash
  warm: ['#FFE9C2', '#FBEFD8'] as const,
  // CTA candy green
  green: ['#8FE34A', '#5BC02E'] as const,
  // magic purple
  purple: ['#9B7BFF', '#7C5BE6'] as const,
  // coins / gold
  gold: ['#FFE27A', '#FFB23F'] as const,
  // gems / cyan
  gem: ['#7DE9F7', '#3FD4E8'] as const,
  // danger
  red: ['#FF8A9B', '#FF5A6E'] as const,
  // sky / tasks
  blue: ['#7DA8FF', '#5B8DEF'] as const,
  // candy pink
  pink: ['#FF9ECB', '#FF7EB6'] as const,
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

/** Neutral soft elevation for floating panels/cards. */
export const elevation = {
  card: {
    shadowColor: '#7A4A12',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  panel: {
    shadowColor: '#5A3A12',
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
