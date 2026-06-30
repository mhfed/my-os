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
