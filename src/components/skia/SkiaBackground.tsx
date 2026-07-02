import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Blur,
  Canvas,
  Circle,
  Group,
  LinearGradient as SkiaLinearGradient,
  Oval,
  Path,
  RadialGradient,
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

import { domains, type DomainKey } from '@/theme/colors';

interface SkiaBackgroundProps {
  /** Which domain's palette tints the far hill / atmosphere. Default 'today'. */
  domain?: DomainKey;
  /** Overall strength of the scene colours, 0–1. Default 0.5. */
  intensity?: number;
}

const TWO_PI = Math.PI * 2;

/**
 * The "Sunny Farm" world behind every screen: a bright blue sky with a golden
 * sun and drifting puffy clouds over layered rolling green hills — the Hay Day
 * postcard. Frosted glass UI panels float on top of this scene, so it stays
 * saturated and lively while the glass blurs it into soft colour.
 */
export function SkiaBackground({
  domain = 'today',
  intensity = 0.5,
}: SkiaBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const reduce = useReducedMotion();
  const palette = domains[domain];

  // One looping 0→1 phase; clouds/sun read it at different rates/offsets.
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    t.value = withRepeat(
      withTiming(1, { duration: 24000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reduce, t]);

  // Sun sits top-right and breathes gently.
  const sunX = width * 0.82;
  const sunY = height * 0.13;
  const sunR = width * 0.16;
  const sunHalo = useDerivedValue(
    () => sunR * (2.1 + Math.sin(t.value * TWO_PI) * 0.12),
  );

  // Clouds drift slowly across the sky, wrapping around.
  const cloud1x = useDerivedValue(
    () => ((t.value * 1.0) % 1) * (width + 260) - 200,
  );
  const cloud1xB = useDerivedValue(() => cloud1x.value + 44);
  const cloud1xC = useDerivedValue(() => cloud1x.value + 88);
  const cloud2x = useDerivedValue(
    () => ((t.value * 0.62 + 0.45) % 1) * (width + 300) - 240,
  );
  const cloud2xB = useDerivedValue(() => cloud2x.value + 58);
  const cloud3x = useDerivedValue(
    () => ((t.value * 0.8 + 0.78) % 1) * (width + 220) - 170,
  );
  const cloud3xB = useDerivedValue(() => cloud3x.value + 40);

  const cloud1y = height * 0.08;
  const cloud2y = height * 0.19;
  const cloud3y = height * 0.3;

  // Rolling hills — three overlapping bezier ridges from mid-screen down.
  const hillFar = `M 0 ${height * 0.52}
    C ${width * 0.22} ${height * 0.44}, ${width * 0.42} ${height * 0.56}, ${width * 0.62} ${height * 0.5}
    S ${width * 0.94} ${height * 0.42}, ${width} ${height * 0.48}
    L ${width} ${height} L 0 ${height} Z`;

  const hillMid = `M 0 ${height * 0.64}
    C ${width * 0.18} ${height * 0.55}, ${width * 0.4} ${height * 0.68}, ${width * 0.6} ${height * 0.62}
    S ${width * 0.9} ${height * 0.54}, ${width} ${height * 0.62}
    L ${width} ${height} L 0 ${height} Z`;

  const hillNear = `M 0 ${height * 0.8}
    C ${width * 0.24} ${height * 0.7}, ${width * 0.5} ${height * 0.84}, ${width * 0.74} ${height * 0.77}
    S ${width * 0.96} ${height * 0.72}, ${width} ${height * 0.76}
    L ${width} ${height} L 0 ${height} Z`;

  const o = Math.min(1, 0.55 + intensity * 0.9);

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents='none'>
      {/* Sunny sky */}
      <Rect x={0} y={0} width={width} height={height}>
        <SkiaLinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={['#4FB8EE', '#8ADCFF', '#D5F4FF']}
        />
      </Rect>

      {/* Golden sun + warm halo */}
      <Circle cx={sunX} cy={sunY} r={sunHalo} opacity={0.5 * o}>
        <RadialGradient
          c={vec(sunX, sunY)}
          r={sunR * 2.4}
          colors={['rgba(255,224,110,0.95)', 'rgba(255,224,110,0)']}
        />
      </Circle>
      <Circle cx={sunX} cy={sunY} r={sunR} opacity={0.96}>
        <RadialGradient
          c={vec(sunX - sunR * 0.25, sunY - sunR * 0.25)}
          r={sunR * 1.5}
          colors={['#FFF3B0', '#FFD23F', '#FFAD33']}
        />
      </Circle>

      {/* Puffy drifting clouds (each = 3 soft ovals) */}
      <Group opacity={0.92}>
        <Blur blur={6} />
        <Oval x={cloud1x} y={cloud1y} width={150} height={52} color='white' />
        <Oval
          x={cloud1xB}
          y={cloud1y - 22}
          width={110}
          height={54}
          color='white'
        />
        <Oval
          x={cloud1xC}
          y={cloud1y + 4}
          width={100}
          height={42}
          color='white'
        />
      </Group>
      <Group opacity={0.8}>
        <Blur blur={7} />
        <Oval x={cloud2x} y={cloud2y} width={180} height={56} color='white' />
        <Oval
          x={cloud2xB}
          y={cloud2y - 24}
          width={120}
          height={58}
          color='white'
        />
      </Group>
      <Group opacity={0.62}>
        <Blur blur={8} />
        <Oval x={cloud3x} y={cloud3y} width={130} height={42} color='white' />
        <Oval
          x={cloud3xB}
          y={cloud3y - 16}
          width={90}
          height={44}
          color='white'
        />
      </Group>

      {/* Domain-tinted atmosphere over the horizon so each tab feels distinct */}
      <Group opacity={0.2 * o}>
        <Blur blur={70} />
        <Circle
          cx={width * 0.28}
          cy={height * 0.46}
          r={Math.max(width, height) * 0.3}
          color={palette.gradient[0]}
        />
      </Group>

      {/* Rolling hills — far (hazy) → mid → near (lush) */}
      <Path path={hillFar} opacity={0.9 * o}>
        <SkiaLinearGradient
          start={vec(0, height * 0.42)}
          end={vec(0, height)}
          colors={['#9ADB6E', '#7BC94F']}
        />
      </Path>
      <Path path={hillMid} opacity={0.95 * o}>
        <SkiaLinearGradient
          start={vec(0, height * 0.54)}
          end={vec(0, height)}
          colors={['#7FCE4B', '#57B92E']}
        />
      </Path>
      <Path path={hillNear} opacity={o}>
        <SkiaLinearGradient
          start={vec(0, height * 0.7)}
          end={vec(0, height)}
          colors={['#6BC438', '#3EA51C']}
        />
      </Path>

      {/* Sunlight kiss on the hilltops */}
      <Group opacity={0.35 * o}>
        <Blur blur={26} />
        <Oval
          x={width * 0.5}
          y={height * 0.47}
          width={width * 0.5}
          height={height * 0.06}
          color='#FFF3B0'
        />
      </Group>

      {/* Top fade so the HUD/status bar stays readable on bright sky */}
      <Rect x={0} y={0} width={width} height={height * 0.18}>
        <SkiaLinearGradient
          start={vec(0, 0)}
          end={vec(0, height * 0.18)}
          colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
        />
      </Rect>
    </Canvas>
  );
}
