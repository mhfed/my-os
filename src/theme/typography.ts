/**
 * Font family tokens. Loaded in app/_layout.tsx via @expo-google-fonts.
 * Sans = IBM Plex Sans (UI), Mono = IBM Plex Mono (numbers / amounts).
 */
export const fonts = {
  regular: 'IBMPlexSans_400Regular',
  medium: 'IBMPlexSans_500Medium',
  semibold: 'IBMPlexSans_600SemiBold',
  bold: 'IBMPlexSans_700Bold',

  monoRegular: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  monoSemibold: 'IBMPlexMono_600SemiBold',
} as const;

export type Fonts = typeof fonts;
