import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Path,
  RadialGradient,
  Skia,
  SweepGradient,
  vec,
} from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, domains, glow } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { timing } from '@/theme/motion';
import { Counter, ShimmerView } from '@/components/motion';
import { formatVND } from '@/utils/currency';

const SIZE = 200;
const C = SIZE / 2;
const RING_R = 78;
const ORB_R = 58;
const TWO_PI = Math.PI * 2;

interface FinanceHeroProps {
  /** Budget used percentage (0-1) */
  budgetUsed: number;
  /** Amount spent this month */
  spent: number;
  /** Amount saved this month */
  saved: number;
}

/**
 * Finance hero visualization: A glowing orb with ring showing budget health.
 * Similar to Today's EnergyOrb but themed for finance with teal/gold palette.
 */
export function FinanceHero({ budgetUsed, spent, saved }: FinanceHeroProps) {
  const clamped = Math.max(0, Math.min(1, budgetUsed));
  const reduce = useReducedMotion();

  // Determine health status
  const isOver = clamped >= 1;
  const isWarning = !isOver && clamped >= 0.9;
  const healthColor = isOver
    ? colors.red
    : isWarning
      ? colors.orange
      : domains.finance.accent;

  const ringPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(C, C, RING_R);
    return p;
  }, []);

  const orbClip = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(C, C, ORB_R);
    return p;
  }, []);

  const fill = useSharedValue(reduce ? clamped : 0);
  const spin = useSharedValue(0);
  const pulseGlow = useSharedValue(0);

  useEffect(() => {
    if (reduce) {
      fill.value = clamped;
      return;
    }
    fill.value = withDelay(180, withTiming(clamped, timing.reveal));
    spin.value = withRepeat(
      withTiming(1, { duration: 12000, easing: Easing.linear }),
      -1,
      false,
    );
    pulseGlow.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [clamped, reduce, fill, spin, pulseGlow]);

  const sheenTransform = useDerivedValue(() => [
    { rotate: spin.value * TWO_PI },
  ]);

  const glowOpacity = useDerivedValue(() => 0.3 + pulseGlow.value * 0.2);

  // Gradient colors based on health
  const ringColors = isOver
    ? [colors.red, colors.orange, colors.red]
    : isWarning
      ? [colors.orange, colors.yellow, colors.orange]
      : [domains.finance.accent, colors.teal, domains.finance.accent];

  const orbGradientColors = isOver
    ? ['#FFFFFF', '#FFB3B3', '#FF6B6B', '#E04545', '#6E1A1A']
    : isWarning
      ? ['#FFFFFF', '#FFE4B3', '#FFB866', '#E0A030', '#6E4A1A']
      : ['#FFFFFF', '#B3F0FF', '#66E0F0', '#3FD4E8', '#1A5A6E'];

  return (
    <View style={styles.panel}>
      {/* Shimmer overlay */}
      <ShimmerView width={300} height={280} duration={3500} />
      <LinearGradient
        colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={styles.gloss}
        pointerEvents='none'
      />

      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>SPENT THIS MONTH</Text>
          <Counter
            value={spent}
            prefix='₫'
            separator=','
            duration={timing.reveal.duration}
            style={[styles.amount, { color: healthColor }]}
          />
        </View>
        <View style={styles.savedBadge}>
          <Text style={styles.savedLabel}>Saved</Text>
          <Text
            style={[
              styles.savedValue,
              { color: saved >= 0 ? colors.green : colors.red },
            ]}
          >
            {formatVND(saved)}
          </Text>
        </View>
      </View>

      <View style={styles.orbWrap}>
        <Canvas style={{ width: SIZE, height: SIZE }}>
          {/* Outer glow halo */}
          <Circle
            cx={C}
            cy={C}
            r={ORB_R + 12}
            color={healthColor}
            opacity={glowOpacity}
          >
            <BlurMask blur={40} style='normal' />
          </Circle>

          {/* Ring track */}
          <Circle
            cx={C}
            cy={C}
            r={RING_R}
            style='stroke'
            strokeWidth={10}
            color={colors.track}
          />

          {/* Animated budget arc */}
          <Group origin={vec(C, C)} transform={[{ rotate: -Math.PI / 2 }]}>
            <Path
              path={ringPath}
              style='stroke'
              strokeWidth={10}
              strokeCap='round'
              start={0}
              end={fill}
            >
              <SweepGradient c={vec(C, C)} colors={ringColors} />
            </Path>
          </Group>

          {/* The 3D sphere */}
          <Circle cx={C} cy={C} r={ORB_R}>
            <RadialGradient
              c={vec(C - 18, C - 20)}
              r={ORB_R * 1.6}
              colors={orbGradientColors}
              positions={[0, 0.15, 0.45, 0.7, 1]}
            />
          </Circle>

          {/* Rotating sheen */}
          <Group clip={orbClip}>
            <Group
              origin={vec(C, C)}
              transform={sheenTransform}
              blendMode='screen'
              opacity={0.4}
            >
              <Circle cx={C} cy={C} r={ORB_R}>
                <SweepGradient
                  c={vec(C, C)}
                  colors={[
                    'transparent',
                    colors.teal,
                    'transparent',
                    colors.yellow,
                    'transparent',
                  ]}
                />
              </Circle>
            </Group>
          </Group>

          {/* Specular highlight */}
          <Circle cx={C - 16} cy={C - 18} r={10} color='#FFFFFF' opacity={0.8}>
            <BlurMask blur={6} style='normal' />
          </Circle>
        </Canvas>

        <View style={styles.center} pointerEvents='none'>
          <Text style={[styles.percent, { color: healthColor }]}>
            {Math.round(clamped * 100)}%
          </Text>
          <Text style={styles.percentLabel}>of budget</Text>
        </View>
      </View>

      {/* Status message */}
      <Text style={[styles.status, { color: healthColor }]}>
        {isOver
          ? '⚠️ Vượt ngân sách'
          : isWarning
            ? '⚡ Sắp đến giới hạn'
            : '✨ Đúng kế hoạch'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    paddingBottom: 16,
    ...glow(domains.finance.accent, 0.18, 20),
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  amount: {
    fontFamily: fonts.monoSemibold,
    fontSize: 28,
    letterSpacing: -1,
  },
  savedBadge: {
    alignItems: 'flex-end',
  },
  savedLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
  },
  savedValue: {
    fontFamily: fonts.monoSemibold,
    fontSize: 14,
  },
  orbWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    top: 50,
  },
  percent: {
    fontFamily: fonts.monoSemibold,
    fontSize: 36,
    letterSpacing: -1,
  },
  percentLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  status: {
    fontFamily: fonts.displayMedium,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});
