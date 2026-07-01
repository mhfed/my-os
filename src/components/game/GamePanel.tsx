import { type ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, elevation, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';

interface GamePanelProps {
  children: ReactNode;
  /** Optional chunky title rendered in the rounded display font. */
  title?: string;
  /** Right-aligned slot in the header row (e.g. a count chip). */
  headerRight?: ReactNode;
  /** Use the warm alternate surface instead of white. */
  alt?: boolean;
  /** Drop the default inner padding (for edge-to-edge content). */
  flush?: boolean;
  style?: ViewStyle;
}

/**
 * The base playful surface of the game UI: a bright, heavily-rounded panel with
 * a soft warm drop shadow and a 2px light inner edge that reads as a beveled
 * rim. Everything sits on these — sections, cards, lists.
 */
export function GamePanel({
  children,
  title,
  headerRight,
  alt = false,
  flush = false,
  style,
}: GamePanelProps) {
  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: alt ? colors.cardAlt : colors.card },
        !flush && styles.padded,
        style,
      ]}
    >
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {headerRight}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    ...elevation.panel,
  },
  padded: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.text,
    ...textShadow.emboss,
  },
});
