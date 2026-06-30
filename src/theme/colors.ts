/**
 * Personal OS color tokens — derived 1:1 from the Claude Design source
 * (06 Finance.dc.html). Dark theme only for Phase 1.
 */
export const colors = {
  // surfaces
  appBg: '#050507', // outermost backdrop
  screenBg: '#0A0A0F', // screen background
  card: '#13131A', // card / surface
  track: '#1C1C26', // progress track / chart base ring
  border: '#2A2A38', // hairline borders

  // text
  text: '#F0F0FF', // primary text
  muted: '#8888AA', // secondary / muted text
  tabInactive: '#5A5A72', // inactive tab tint

  // accents (semantic + category palette)
  purple: '#7C6EF5', // primary accent
  teal: '#4ECDC4', // income / positive
  orange: '#F5B16E', // warning / transport
  red: '#FF6B6B', // expense / over-budget

  white: '#FFFFFF',
} as const;

/** 10%-alpha tint backgrounds used behind icon chips (e.g. "#4ECDC41A"). */
export const tint = (hex: string, alpha = '1A') => `${hex}${alpha}`;

/** Progress / spend gradient stops used across the Finance screen. */
export const gradients = {
  spend: ['#7C6EF5', '#4ECDC4'] as const,
};

export type AppColors = typeof colors;

/**
 * Per-domain identity colors. Every feature gets one recognizable accent so the
 * app reads as "many colors, one system" instead of all-purple. Each entry is
 * an `accent` (solid), `soft` (10% tint for chips/backgrounds) and a `gradient`
 * pair for rings / headers / progress fills.
 */
export interface DomainPalette {
  accent: string;
  soft: string;
  gradient: readonly [string, string];
}

export const domains = {
  today: { accent: '#7C6EF5', soft: tint('#7C6EF5'), gradient: ['#7C6EF5', '#4ECDC4'] },
  tasks: { accent: '#5B8DEF', soft: tint('#5B8DEF'), gradient: ['#5B8DEF', '#7C6EF5'] },
  finance: { accent: '#4ECDC4', soft: tint('#4ECDC4'), gradient: ['#4ECDC4', '#3BA9C9'] },
  health: { accent: '#FF6B6B', soft: tint('#FF6B6B'), gradient: ['#FF8A6B', '#FF5E8A'] },
  journal: { accent: '#F56EA8', soft: tint('#F56EA8'), gradient: ['#F56EA8', '#9B6EF5'] },
  habits: { accent: '#F5B16E', soft: tint('#F5B16E'), gradient: ['#F5C66E', '#F58E6E'] },
  goals: { accent: '#5BD99A', soft: tint('#5BD99A'), gradient: ['#5BD99A', '#4ECDC4'] },
  notes: { accent: '#F5C66E', soft: tint('#F5C66E'), gradient: ['#F5C66E', '#F5B16E'] },
  inbox: { accent: '#9B8CFF', soft: tint('#9B8CFF'), gradient: ['#9B8CFF', '#7C6EF5'] },
} as const satisfies Record<string, DomainPalette>;

export type DomainKey = keyof typeof domains;

/**
 * Colored drop-shadow presets ("glow"). Spread into a style to float an element
 * above the dark background with a soft tinted halo. iOS uses shadow*, Android
 * falls back to `elevation`.
 */
export const glow = (hex: string, opacity = 0.45, radius = 18) =>
  ({
    shadowColor: hex,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: Math.round(radius / 2),
  }) as const;

/** Neutral elevation for cards that should lift off the screen subtly. */
export const elevation = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
