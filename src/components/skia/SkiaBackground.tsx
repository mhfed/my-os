import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Blur,
  Canvas,
  Circle,
  Group,
  LinearGradient as SkiaLinearGradient,
  Path,
  Rect,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, domains, type DomainKey } from '@/theme/colors';

interface SkiaBackgroundProps {
  /** Which domain's palette to tint the aurora with. Default 'today'. */
  domain?: DomainKey;
  /** Overall strength of the glow, 0–1. Default 0.5. */
  intensity?: number;
}

const TWO_PI = Math.PI * 2;

/**
 * A slow-drifting layered backdrop rendered with Skia. The look targets a soft,
 * premium iOS-game shell: cool sky gradient, blurred colour fields, and a few
 * translucent glass shapes floating behind the main content.
 */
export function SkiaBackground({
  domain = 'today',
  intensity = 0.5,
}: SkiaBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const reduce = useReducedMotion();
  const palette = domains[domain];

  // One looping 0→1 phase; each orb reads it at a different rate/offset.
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    t.value = withRepeat(
      withTiming(1, { duration: 16000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reduce, t]);

  const r = Math.max(width, height) * 0.42;

  const c1x = useDerivedValue(
    () => width * 0.2 + Math.sin(t.value * TWO_PI) * width * 0.16,
  );
  const c1y = useDerivedValue(
    () => height * 0.16 + Math.cos(t.value * TWO_PI) * height * 0.06,
  );

  const c2x = useDerivedValue(
    () => width * 0.88 + Math.sin(t.value * TWO_PI + 2.1) * width * 0.14,
  );
  const c2y = useDerivedValue(
    () => height * 0.34 + Math.cos(t.value * TWO_PI + 2.1) * height * 0.08,
  );

  const c3x = useDerivedValue(
    () => width * 0.4 + Math.sin(t.value * TWO_PI + 4.2) * width * 0.2,
  );
  const c3y = useDerivedValue(
    () => height * 0.82 + Math.cos(t.value * TWO_PI + 4.2) * height * 0.07,
  );

  const glass1x = useDerivedValue(
    () => width * 0.74 + Math.sin(t.value * TWO_PI + 0.8) * width * 0.04,
  );
  const glass1y = useDerivedValue(
    () => height * 0.2 + Math.cos(t.value * TWO_PI + 1.1) * height * 0.03,
  );

  const glass2x = useDerivedValue(
    () => width * 0.12 + Math.sin(t.value * TWO_PI + 3.4) * width * 0.05,
  );
  const glass2y = useDerivedValue(
    () => height * 0.68 + Math.cos(t.value * TWO_PI + 2.8) * height * 0.04,
  );

  const ribbon = `M ${-width * 0.06} ${height * 0.5}
    C ${width * 0.18} ${height * 0.38}, ${width * 0.42} ${height * 0.64}, ${width * 0.64} ${height * 0.5}
    S ${width * 1.06} ${height * 0.32}, ${width * 1.08} ${height * 0.56}
    L ${width * 1.08} ${height * 0.78}
    C ${width * 0.82} ${height * 0.68}, ${width * 0.42} ${height * 0.9}, ${-width * 0.06} ${height * 0.78}
    Z`;

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents='none'>
      {/* Base shell wash with a cool iOS-like sky gradient. */}
      <Rect x={0} y={0} width={width} height={height}>
        <SkiaLinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={['#F9FBFF', '#EEF3FF', '#DCE7FF']}
        />
      </Rect>

      {/* Broad ribbon tint so the background reads as layered, not flat. */}
      <Group opacity={0.24}>
        <Blur blur={52} />
        <Path path={ribbon} color={palette.gradient[0]} />
      </Group>

      {/* Translucent "glass" cards in the far background. */}
      <Group opacity={0.75}>
        <Blur blur={20} />
        <RoundedRect
          x={glass1x}
          y={glass1y}
          width={width * 0.3}
          height={height * 0.16}
          r={32}
          color='rgba(255,255,255,0.18)'
        />
        <RoundedRect
          x={glass2x}
          y={glass2y}
          width={width * 0.38}
          height={height * 0.14}
          r={34}
          color='rgba(255,255,255,0.14)'
        />
      </Group>

      {/* Soft drifting colour orbs for depth. */}
      <Group>
        <Blur blur={96} />
        <Circle
          cx={c1x}
          cy={c1y}
          r={r}
          color={palette.gradient[0]}
          opacity={intensity * 0.42}
        />
        <Circle
          cx={c2x}
          cy={c2y}
          r={r * 0.92}
          color={palette.gradient[1]}
          opacity={intensity * 0.34}
        />
        <Circle
          cx={c3x}
          cy={c3y}
          r={r * 0.85}
          color={colors.blue}
          opacity={intensity * 0.24}
        />
      </Group>

      {/* Top and bottom atmospheric fades help the content sit on the scene. */}
      <Rect x={0} y={0} width={width} height={height * 0.26}>
        <SkiaLinearGradient
          start={vec(0, 0)}
          end={vec(0, height * 0.26)}
          colors={['rgba(255,255,255,0.78)', 'rgba(255,255,255,0)']}
        />
      </Rect>
      <Rect x={0} y={height * 0.7} width={width} height={height * 0.3}>
        <SkiaLinearGradient
          start={vec(0, height * 0.7)}
          end={vec(0, height)}
          colors={['rgba(255,255,255,0)', 'rgba(217,227,250,0.45)']}
        />
      </Rect>
    </Canvas>
  );
}
