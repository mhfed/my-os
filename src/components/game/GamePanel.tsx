import { type ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, elevation, glass, gradients, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';

export type PanelVariant = 'glass' | 'wood' | 'fabric' | 'stone';

interface GamePanelProps {
  children: ReactNode;
  /** Optional chunky title rendered in the rounded display font. */
  title?: string;
  /** Left-aligned slot in the header row (e.g. a 3D icon badge). */
  headerLeft?: ReactNode;
  /** Right-aligned slot in the header row (e.g. a count chip). */
  headerRight?: ReactNode;
  /** Use the airier alternate glass (more see-through). */
  alt?: boolean;
  /** Drop the default inner padding (for edge-to-edge content). */
  flush?: boolean;
  /** Material variant: glass (default), wood, fabric, stone. */
  variant?: PanelVariant;
  style?: ViewStyle;
}

const VARIANTS: Record<PanelVariant, {
  bg: string;
  border: string;
  shadow: string;
  rivet: string | null;
}> = {
  glass: {
    bg: glass.fill,
    border: glass.rim,
    shadow: '#1E5E7A',
    rivet: null,
  },
  wood: {
    bg: '#D4A76A',
    border: '#8B6914',
    shadow: '#5C3A0E',
    rivet: '#8B6914',
  },
  fabric: {
    bg: '#E8DCC8',
    border: '#C4A97A',
    shadow: '#8B7350',
    rivet: null,
  },
  stone: {
    bg: '#C8C0B8',
    border: '#8A8078',
    shadow: '#5A5048',
    rivet: null,
  },
};

/**
 * The base surface of "Sunny Farm Glass" UI. Default variant renders a real
 * frosted-glass pane (BlurView + translucent white wash). Wood/fabric/stone
 * variants render solid natural-material backgrounds.
 */
export function GamePanel({
  children,
  title,
  headerLeft,
  headerRight,
  alt = false,
  flush = false,
  variant = 'glass',
  style,
}: GamePanelProps) {
  const isGlass = variant === 'glass';
  const mat = VARIANTS[variant];

  return (
    <View style={[styles.shadowWrap, { elevation: elevation.panel.elevation }]}>
      <View
        style={[
          styles.panel,
          {
            borderColor: mat.border,
            shadowColor: mat.shadow,
          },
        ]}
      >
        {isGlass ? (
          <>
            <BlurView
              intensity={alt ? 26 : 40}
              tint='light'
              style={StyleSheet.absoluteFill}
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: alt ? glass.fillSoft : glass.fill },
              ]}
            />
            <LinearGradient
              colors={gradients.glassPanel}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.9, y: 0.9 }}
              style={styles.glassFill}
              pointerEvents='none'
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.85)', 'rgba(255,255,255,0)']}
              start={{ x: 0.4, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.topGlow}
              pointerEvents='none'
            />
          </>
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: mat.bg },
            ]}
          />
        )}

        {/* Rivet decorations for wood variant */}
        {variant === 'wood' && (
          <>
            <View style={[styles.rivet, styles.rivetTL]} />
            <View style={[styles.rivet, styles.rivetTR]} />
            <View style={[styles.rivet, styles.rivetBL]} />
            <View style={[styles.rivet, styles.rivetBR]} />
          </>
        )}

        {title ? (
          <View style={styles.header}>
            {headerLeft ? (
              <View style={styles.headerLeft}>{headerLeft}</View>
            ) : null}
            <Text
              style={[
                styles.title,
                headerLeft ? styles.titleWithLeft : undefined,
              ]}
            >
              {title}
            </Text>
            {headerRight ? (
              <View style={styles.headerRight}>{headerRight}</View>
            ) : null}
          </View>
        ) : null}
        <View style={flush ? undefined : title ? styles.body : styles.padded}>
          {children}
        </View>
      </View>
    </View>
  );
}

const INSET = 16;

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: radius.lg,
    shadowColor: '#1E5E7A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  panel: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
  },
  glassFill: {
    ...StyleSheet.absoluteFillObject,
  },
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 56,
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
    gap: 10,
  },
  headerLeft: {
    flexShrink: 0,
  },
  headerRight: {
    flexShrink: 0,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.text,
    ...textShadow.emboss,
    flex: 1,
  },
  titleWithLeft: {
    flex: 0,
  },
  // Rivet decorations for wood variant
  rivet: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B6914',
    opacity: 0.6,
  },
  rivetTL: { top: 8, left: 8 },
  rivetTR: { top: 8, right: 8 },
  rivetBL: { bottom: 8, left: 8 },
  rivetBR: { bottom: 8, right: 8 },
});
