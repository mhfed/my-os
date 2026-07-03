import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  BlurMask,
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
  domain?: DomainKey;
  intensity?: number;
}

const TWO_PI = Math.PI * 2;

/**
 * Lumina OS ambient background — deep charcoal (#131313) with softly drifting
 * neon orbs. Each orb is a large blurred circle (80px blur) at 15% opacity
 * with domain-specific accent color. Follows the stitch glow-orb spec.
 */
export function SkiaBackground({
  domain = 'today',
  intensity = 0.6,
}: SkiaBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const reduce = useReducedMotion();
  const palette = domains[domain];

  const t = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    t.value = withRepeat(
      withTiming(1, { duration: 30000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reduce, t]);

  const o = Math.min(1, 0.4 + intensity * 0.8);

  // Orb 1 — large, slow drift
  const orb1x = useDerivedValue(
    () => width * 0.2 + Math.sin(t.value * TWO_PI * 0.3) * width * 0.15,
  );
  const orb1y = useDerivedValue(
    () => height * 0.3 + Math.sin(t.value * TWO_PI * 0.25 + 1) * height * 0.1,
  );

  // Orb 2 — medium
  const orb2x = useDerivedValue(
    () => width * 0.75 + Math.sin(t.value * TWO_PI * 0.2 + 2) * width * 0.12,
  );
  const orb2y = useDerivedValue(
    () => height * 0.55 + Math.sin(t.value * TWO_PI * 0.3 + 0.5) * height * 0.08,
  );

  // Orb 3 — small
  const orb3x = useDerivedValue(
    () => width * 0.5 + Math.sin(t.value * TWO_PI * 0.15 + 3) * width * 0.18,
  );
  const orb3y = useDerivedValue(
    () => height * 0.8 + Math.sin(t.value * TWO_PI * 0.22 + 2) * height * 0.06,
  );

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents='none'>
      {/* Deep charcoal base — exact spec background */}
      <Rect x={0} y={0} width={width} height={height}>
        <SkiaLinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={['#131313', '#1A1A1A', '#131313']}
        />
      </Rect>

      {/* Glow orbs — 80px blur, 0.15 opacity, domain-tinted */}
      <Group opacity={0.15 * o}>
        <Circle cx={orb1x} cy={orb1y} r={150}>
          <BlurMask blur={80} style='normal' />
        </Circle>
        <Circle cx={orb1x} cy={orb1y} r={150} color={palette.accent} opacity={0.8} />
      </Group>

      <Group opacity={0.12 * o}>
        <Circle cx={orb2x} cy={orb2y} r={120}>
          <BlurMask blur={80} style='normal' />
        </Circle>
        <Circle cx={orb2x} cy={orb2y} r={120} color={palette.gradient[1] || palette.accent} opacity={0.7} />
      </Group>

      <Group opacity={0.1 * o}>
        <Circle cx={orb3x} cy={orb3y} r={100}>
          <BlurMask blur={80} style='normal' />
        </Circle>
        <Circle cx={orb3x} cy={orb3y} r={100} color={palette.gradient[0]} opacity={0.7} />
      </Group>
    </Canvas>
  );
}
