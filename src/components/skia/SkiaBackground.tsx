import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Blur,
  Canvas,
  Circle,
  Group,
  LinearGradient as SkiaLinearGradient,
  Rect,
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
 * A slow-drifting "aurora" field rendered with Skia and blurred heavily, sitting
 * behind screen content to give the flat dark ground depth and color. Three soft
 * orbs in the domain palette wander on independent sine loops. Driven entirely by
 * Reanimated shared values so it shares the app's motion clock and honors the OS
 * reduce-motion setting (static when reduced).
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

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents='none'>
      {/* Warm vertical wash — the bright cream "stage" of the game UI. */}
      <Rect x={0} y={0} width={width} height={height}>
        <SkiaLinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={['#FFE9C2', '#FBEFD8', '#F6E2C0']}
        />
      </Rect>
      {/* Soft drifting colour orbs for depth (kept light so the stage stays bright). */}
      <Group>
        <Blur blur={90} />
        <Circle
          cx={c1x}
          cy={c1y}
          r={r}
          color={palette.gradient[0]}
          opacity={intensity * 0.45}
        />
        <Circle
          cx={c2x}
          cy={c2y}
          r={r * 0.92}
          color={palette.gradient[1]}
          opacity={intensity * 0.4}
        />
        <Circle
          cx={c3x}
          cy={c3y}
          r={r * 0.85}
          color={colors.yellow}
          opacity={intensity * 0.35}
        />
      </Group>
    </Canvas>
  );
}
