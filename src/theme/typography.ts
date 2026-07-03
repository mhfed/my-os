/**
 * Lumina OS typography — exact from stitch/DESIGN.md.
 *
 * Quicksand: headlines, labels, currency (rounded, game-like)
 * Be Vietnam Pro: body text (superior Vietnamese diacritics)
 */
export const fonts = {
  regular: 'BeVietnamPro_400Regular',
  medium: 'BeVietnamPro_500Medium',
  semibold: 'BeVietnamPro_600SemiBold',
  bold: 'BeVietnamPro_700Bold',
  monoRegular: 'BeVietnamPro_400Regular',
  monoMedium: 'BeVietnamPro_500Medium',
  monoSemibold: 'BeVietnamPro_600SemiBold',
  display: 'Quicksand_600SemiBold',
  displayBold: 'Quicksand_700Bold',
  displayExtra: 'Quicksand_700Bold',
  displayMedium: 'Quicksand_500Medium',
} as const;

export type Fonts = typeof fonts;

/** Typography style presets matching spec exactly. Use these for consistent text. */
export const typography = {
  headlineXl: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.32, // -0.02em at 32px
  },
  headlineLg: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 30,
  },
  headlineLgMobile: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  bodyLg: {
    fontFamily: fonts.regular,
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 26,
  },
  bodyMd: {
    fontFamily: fonts.regular,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  labelMd: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.7, // 0.05em at 14px
  },
  currencyDisplay: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
} as const;

export type TypographyPreset = keyof typeof typography;

/** Text shadow presets for depth on dark backgrounds */
export const textShadow = {
  emboss: {
    textShadowColor: 'rgba(0,0,0,0.50)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  button: {
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 2,
  },
} as const;
