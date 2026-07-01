import { type ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
 * The base playful surface of the game UI: a bright, glassy panel with a soft
 * cool drop shadow, beveled rim, and top sheen. It keeps the playful rounded
 * shape while feeling closer to premium iOS game chrome.
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
        style,
      ]}
    >
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.42)',
          'rgba(255,255,255,0.16)',
          'rgba(255,255,255,0)',
        ]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.85, y: 0.82 }}
        style={styles.glassFill}
        pointerEvents='none'
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.72)', 'rgba(255,255,255,0)']}
        start={{ x: 0.4, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.topGlow}
        pointerEvents='none'
      />
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {headerRight}
        </View>
      ) : null}
      {/* The header is always inset by INSET; only the body follows `flush`, so
          edge-to-edge scrollers bleed to the edges while headers stay aligned.
          A titled body skips its own top inset (the header supplies the gap). */}
      <View style={flush ? undefined : title ? styles.body : styles.padded}>
        {children}
      </View>
    </View>
  );
}

const INSET = 16;

const styles = StyleSheet.create({
  panel: {
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.98)',
    overflow: 'hidden',
    ...elevation.panel,
  },
  glassFill: {
    ...StyleSheet.absoluteFillObject,
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 64,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  padded: {
    padding: INSET,
  },
  body: {
    paddingHorizontal: INSET,
    paddingBottom: INSET,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: INSET,
    paddingHorizontal: INSET,
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.text,
    ...textShadow.emboss,
  },
});
