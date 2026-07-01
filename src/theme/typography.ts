/**
 * Font family tokens — "Magic Academy" game design language.
 *
 * Display = Baloo 2 (rounded, chunky, friendly) for headings / buttons / HUD.
 * Sans    = IBM Plex Sans for body copy / secondary text.
 * Mono    = IBM Plex Mono for numbers / amounts / counters.
 *
 * All loaded in app/_layout.tsx via @expo-google-fonts.
 */
export const fonts = {
  // body (IBM Plex Sans)
  regular: 'IBMPlexSans_400Regular',
  medium: 'IBMPlexSans_500Medium',
  semibold: 'IBMPlexSans_600SemiBold',
  bold: 'IBMPlexSans_700Bold',

  // numbers (IBM Plex Mono)
  monoRegular: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  monoSemibold: 'IBMPlexMono_600SemiBold',

  // display / game headings (Baloo 2 — rounded & chunky)
  display: 'Baloo2_600SemiBold',
  displayBold: 'Baloo2_700Bold',
  displayExtra: 'Baloo2_800ExtraBold',
  displayMedium: 'Baloo2_500Medium',
} as const;

export type Fonts = typeof fonts;

/**
 * The signature "outlined / embossed" game text shadow. Spread onto a Text
 * style to give headings a soft drop that lifts them off coloured surfaces.
 */
export const textShadow = {
  /** Soft dark drop for headings on light surfaces. */
  emboss: {
    textShadowColor: 'rgba(122,74,18,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 0,
  },
  /** Hard shadow for white text sitting on coloured buttons. */
  button: {
    textShadowColor: 'rgba(0,0,0,0.22)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 0,
  },
} as const;
