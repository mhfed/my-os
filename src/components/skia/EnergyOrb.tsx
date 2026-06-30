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

import { colors, domains } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { timing } from '@/theme/motion';
import { Counter } from '@/components/motion';

const SIZE = 220;
const C = SIZE / 2; // center
const RING_R = 88;
const ORB_R = 66;
const TWO_PI = Math.PI * 2;

interface EnergyOrbProps {
  /** Overall today score, 0–100 — fills the ring and shows in the core. */
  score: number;
  focus: number;
  body: number;
  mind: number;
}

/**
 * The hero of the Today screen: a glowing, faux-3D energy sphere whose ring
 * sweeps to the day's score on mount and whose surface has a slowly rotating
 * aurora sheen. Replaces the old flat LifeRing. The score read-out overlays the
 * Skia canvas as crisp native text. Honors reduce-motion (renders settled).
 */
export function EnergyOrb({ score, focus, body, mind }: EnergyOrbProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const reduce = useReducedMotion();

  // Full-circle path; we trim it with `end` to show the score fraction.
  const ringPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(C, C, RING_R);
    return p;
  }, []);

  // Clip used to keep the rotating sheen inside the sphere's silhouette.
  const orbClip = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(C, C, ORB_R);
    return p;
  }, []);

  const fill = useSharedValue(reduce ? clamped / 100 : 0);
  const spin = useSharedValue(0);

  useEffect(() => {
    if (reduce) {
      fill.value = clamped / 100;
      return;
    }
    fill.value = withDelay(180, withTiming(clamped / 100, timing.reveal));
    spin.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.linear }), -1, false);
  }, [clamped, reduce, fill, spin]);

  const sheenTransform = useDerivedValue(() => [{ rotate: spin.value * TWO_PI }]);

  const legend = [
    { label: 'Focus', value: focus, color: colors.purple },
    { label: 'Body', value: body, color: colors.teal },
    { label: 'Mind', value: mind, color: colors.red },
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.orbWrap}>
        <Canvas style={{ width: SIZE, height: SIZE }}>
          {/* soft outer halo */}
          <Circle cx={C} cy={C} r={ORB_R + 8} color={domains.today.accent} opacity={0.45}>
            <BlurMask blur={32} style="normal" />
          </Circle>

          {/* ring track */}
          <Circle cx={C} cy={C} r={RING_R} style="stroke" strokeWidth={12} color={colors.track} />

          {/* animated score arc, started from 12 o'clock going clockwise */}
          <Group origin={vec(C, C)} transform={[{ rotate: -Math.PI / 2 }]}>
            <Path
              path={ringPath}
              style="stroke"
              strokeWidth={12}
              strokeCap="round"
              start={0}
              end={fill}
            >
              <SweepGradient c={vec(C, C)} colors={[colors.purple, colors.teal, colors.purple]} />
            </Path>
          </Group>

          {/* the 3D sphere — light from top-left */}
          <Circle cx={C} cy={C} r={ORB_R}>
            <RadialGradient
              c={vec(C - 22, C - 26)}
              r={ORB_R * 1.7}
              colors={['#FFFFFF', '#C9C0FF', '#8B7BF0', '#6A4FF5', '#2E1A6E']}
              positions={[0, 0.12, 0.4, 0.66, 1]}
            />
          </Circle>

          {/* rotating aurora sheen, clipped to the sphere, screen-blended */}
          <Group clip={orbClip}>
            <Group origin={vec(C, C)} transform={sheenTransform} blendMode="screen" opacity={0.5}>
              <Circle cx={C} cy={C} r={ORB_R}>
                <SweepGradient
                  c={vec(C, C)}
                  colors={['transparent', colors.teal, 'transparent', colors.red, 'transparent']}
                />
              </Circle>
            </Group>
          </Group>

          {/* specular highlight */}
          <Circle cx={C - 20} cy={C - 24} r={13} color="#FFFFFF" opacity={0.85}>
            <BlurMask blur={7} style="normal" />
          </Circle>
        </Canvas>

        <View style={styles.center} pointerEvents="none">
          <Counter value={score} duration={timing.reveal.duration} style={styles.score} />
          <Text style={styles.scoreLabel}>TODAY&apos;S SCORE</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {legend.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.label} {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 34 },
  orbWrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  score: {
    fontFamily: fonts.monoSemibold,
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: -2,
    color: colors.white,
    textAlign: 'center',
    minWidth: 120,
  },
  scoreLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  legend: { flexDirection: 'row', gap: 18, marginTop: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
});
