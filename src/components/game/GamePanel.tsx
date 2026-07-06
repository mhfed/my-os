import { type ReactNode, useEffect } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { colors, elevation, glass, radius } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { springs, timing } from '@/theme/motion';

export type PanelVariant = 'glass' | 'elevated' | 'inset';

interface GamePanelProps {
  children: ReactNode;
  title?: string;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  alt?: boolean;
  flush?: boolean;
  variant?: PanelVariant;
  style?: ViewStyle;
}

const VARIANTS: Record<
  PanelVariant,
  {
    bg: string;
    border: string;
    blurIntensity: number;
  }
> = {
  glass: {
    bg: 'rgba(26,26,26,0.6)', // exact glass-card fill
    border: 'rgba(255,255,255,0.08)',
    blurIntensity: 12,
  },
  elevated: {
    bg: '#242424',
    border: 'rgba(255,255,255,0.06)',
    blurIntensity: 0,
  },
  inset: {
    bg: '#1A1A1A',
    border: 'rgba(255,255,255,0.04)',
    blurIntensity: 0,
  },
};

/**
 * Lumina glass card — exact match to stitch/DESIGN.md glass-card spec:
 *   background: rgba(26,26,26,0.6)
 *   backdrop-filter: blur(12px)
 *   border: 1px solid rgba(255,255,255,0.08)
 *   corner radius: 24-32px (xl = 32px)
 *   padding: 16px
 */
export function GamePanel({
  children,
  title,
  headerLeft,
  headerRight,
  flush = false,
  variant = 'glass',
  style,
}: GamePanelProps) {
  const mat = VARIANTS[variant];
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const offset = useSharedValue(reduceMotion ? 0 : 10);
  const scale = useSharedValue(reduceMotion ? 1 : 0.985);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withTiming(1, timing.base);
    offset.value = withSpring(0, springs.smooth);
    scale.value = withSpring(1, springs.smooth);
  }, [reduceMotion, opacity, offset, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: offset.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.shadowWrap,
        { elevation: elevation.panel.elevation },
        animatedStyle,
        style,
      ]}
    >
      <View
        style={[
          styles.panel,
          {
            borderColor: mat.border,
            backgroundColor: mat.bg,
          },
        ]}
      >
        <BlurView
          intensity={mat.blurIntensity}
          tint='dark'
          style={StyleSheet.absoluteFill}
        />

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
    </Animated.View>
  );
}

const INSET = 16; // p-4

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: radius.xl, // 32px primary card radius
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  panel: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
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
  headerLeft: { flexShrink: 0 },
  headerRight: { flexShrink: 0 },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.text,
    flex: 1,
  },
  titleWithLeft: { flex: 0 },
});
