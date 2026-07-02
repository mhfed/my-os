import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  LinearGradient as SkiaLinearGradient,
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

import { type DomainKey } from '@/theme/colors';

export type { DomainKey };

// ─── Scene config per domain ─────────────────────────────────────────────

export interface SceneConfig {
  sky: readonly [string, string, string];
  sunColor: string;
  sunGlow: string;
  hillColors: readonly [string, string];
  hillFarColor: string;
  cloudColor: string;
  hasParticles: boolean;
  particleColor: string;
  particleKind: 'dot' | 'sparkle';
  treeColor: string;
}

export const SCENES: Record<DomainKey, SceneConfig> = {
  today: {
    sky: ['#C89BE0', '#E8C8F5', '#B0D4F0'] as const,
    sunColor: '#E8A5F5', sunGlow: '#D48AE8',
    hillColors: ['#B889D4', '#9B6FC0'] as const, hillFarColor: '#D4B0E8',
    cloudColor: 'rgba(230,210,240,0.50)',
    hasParticles: true, particleColor: '#FFE87C', particleKind: 'dot',
    treeColor: '#7A5CA8',
  },
  tasks: {
    sky: ['#5BA3D9', '#87CEEB', '#B0E0E6'] as const,
    sunColor: '#FFD700', sunGlow: '#FFA500',
    hillColors: ['#6B8E23', '#556B2F'] as const, hillFarColor: '#8FBC8F',
    cloudColor: 'rgba(255,255,255,0.70)',
    hasParticles: false, particleColor: '#FFFFFF', particleKind: 'dot',
    treeColor: '#3B6914',
  },
  finance: {
    sky: ['#FFD700', '#FFAA00', '#87CEEB'] as const,
    sunColor: '#FFD700', sunGlow: '#FF8C00',
    hillColors: ['#DAA520', '#B8860B'] as const, hillFarColor: '#E8C87A',
    cloudColor: 'rgba(255,200,100,0.40)',
    hasParticles: true, particleColor: '#FFD700', particleKind: 'sparkle',
    treeColor: '#8B6914',
  },
  health: {
    sky: ['#FF6B8A', '#FFB6C1', '#B0D4F0'] as const,
    sunColor: '#FF6B8A', sunGlow: '#FF4060',
    hillColors: ['#CD5C5C', '#B04848'] as const, hillFarColor: '#E8A0A0',
    cloudColor: 'rgba(255,200,200,0.50)',
    hasParticles: true, particleColor: '#FFB6C1', particleKind: 'dot',
    treeColor: '#8B3A3A',
  },
  habits: {
    sky: ['#FF7F50', '#FFA07A', '#B0D4F0'] as const,
    sunColor: '#FF8C00', sunGlow: '#FF6600',
    hillColors: ['#D2691E', '#A0522D'] as const, hillFarColor: '#D4A060',
    cloudColor: 'rgba(255,180,120,0.40)',
    hasParticles: true, particleColor: '#DAA520', particleKind: 'dot',
    treeColor: '#6B3A1F',
  },
  goals: {
    sky: ['#32CD32', '#90EE90', '#B0E0E6'] as const,
    sunColor: '#FFD700', sunGlow: '#FFA500',
    hillColors: ['#228B22', '#006400'] as const, hillFarColor: '#6BBE6B',
    cloudColor: 'rgba(200,255,200,0.50)',
    hasParticles: true, particleColor: '#90EE90', particleKind: 'dot',
    treeColor: '#004D00',
  },
  journal: {
    sky: ['#FFB6C1', '#FFD1DC', '#E0F0FF'] as const,
    sunColor: '#FFB6C1', sunGlow: '#FF8CA0',
    hillColors: ['#DDA0DD', '#C080C0'] as const, hillFarColor: '#E8C8E0',
    cloudColor: 'rgba(255,220,240,0.45)',
    hasParticles: true, particleColor: '#FFB6C1', particleKind: 'dot',
    treeColor: '#A06090',
  },
  notes: {
    sky: ['#FFD700', '#FFFACD', '#B0E0E6'] as const,
    sunColor: '#FFD700', sunGlow: '#FFB300',
    hillColors: ['#DAA520', '#B8922A'] as const, hillFarColor: '#E8D07A',
    cloudColor: 'rgba(255,250,200,0.50)',
    hasParticles: true, particleColor: '#DAA520', particleKind: 'dot',
    treeColor: '#8B7A14',
  },
  inbox: {
    sky: ['#9370DB', '#DDA0DD', '#B0D4F0'] as const,
    sunColor: '#9370DB', sunGlow: '#7B50C8',
    hillColors: ['#7B68AE', '#5F4B8B'] as const, hillFarColor: '#B0A0D0',
    cloudColor: 'rgba(200,180,255,0.40)',
    hasParticles: true, particleColor: '#C8B0F0', particleKind: 'dot',
    treeColor: '#4A3B70',
  },
};

// ─── Main component ──────────────────────────────────────────────────────

interface FarmBackgroundProps {
  domain?: DomainKey;
}

export function FarmBackground({ domain = 'today' }: FarmBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const reduce = useReducedMotion();
  const scene = SCENES[domain];

  // Global looping phase 0→1
  const phase = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    phase.value = withRepeat(
      withTiming(1, { duration: 30000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reduce, phase]);

  // Derived positions
  const sunX = useDerivedValue(() => width * 0.78 + Math.sin(phase.value * Math.PI * 2 * 0.3) * 20);
  const sunY = useDerivedValue(() => height * 0.18 - Math.sin(phase.value * Math.PI * 2 * 0.2) * 10);
  const sunR = useDerivedValue(() => 28 + (Math.sin(phase.value * Math.PI * 2 * 0.5) * 3));

  const c1x = useDerivedValue(() => width * 0.15 + (phase.value % 1) * width * 0.3);
  const c2x = useDerivedValue(() => width * 0.55 + ((phase.value + 0.4) % 1) * width * 0.35);
  const c3x = useDerivedValue(() => width * 0.35 + ((phase.value + 0.7) % 1) * width * 0.25);

  const w = width;
  const h = height;
  const s = scene;

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents='none'>
      {/* 1. Sky */}
      <Rect x={0} y={0} width={w} height={h}>
        <SkiaLinearGradient start={vec(0, 0)} end={vec(0, h)} colors={[s.sky[0], s.sky[1], s.sky[2]] as string[]} />
      </Rect>

      {/* 2. Sun glow */}
      <Circle cx={sunX} cy={sunY} r={sunR.value * 3.5} opacity={0.18}>
        <RadialGradient c={vec(0, 0)} r={sunR.value * 3.5} colors={[s.sunGlow, 'transparent']} />
      </Circle>

      {/* 3. Sun */}
      <Circle cx={sunX} cy={sunY} r={sunR} opacity={0.95}>
        <RadialGradient c={vec(0, 0)} r={sunR.value} colors={[s.sunColor, s.sunGlow] as string[]} />
      </Circle>

      {/* 4. Far hills */}
      <Path path={`M 0 ${h * 0.58} Q ${w * 0.2} ${h * 0.44} ${w * 0.4} ${h * 0.52} Q ${w * 0.6} ${h * 0.40} ${w * 0.8} ${h * 0.50} Q ${w * 0.92} ${h * 0.42} ${w} ${h * 0.52} L ${w} ${h} L 0 ${h} Z`}>
        <SkiaLinearGradient start={vec(0, h * 0.4)} end={vec(0, h * 0.7)} colors={[s.hillFarColor, s.hillColors[0] + '80'] as string[]} />
      </Path>

      {/* 5. Mid hills */}
      <Path path={`M 0 ${h * 0.70} Q ${w * 0.15} ${h * 0.58} ${w * 0.35} ${h * 0.63} Q ${w * 0.55} ${h * 0.56} ${w * 0.70} ${h * 0.66} Q ${w * 0.85} ${h * 0.58} ${w} ${h * 0.63} L ${w} ${h} L 0 ${h} Z`}>
        <SkiaLinearGradient start={vec(0, h * 0.55)} end={vec(0, h * 0.8)} colors={[s.hillColors[0], s.hillColors[1]] as string[]} />
      </Path>

      {/* 6. Clouds */}
      <Group opacity={0.55}>
        {[{ cx: c1x, y: h * 0.08, sc: 1 }, { cx: c2x, y: h * 0.16, sc: 0.7 }, { cx: c3x, y: h * 0.22, sc: 0.55 }].map((c, i) => (
          <Group key={i}>
            <Circle cx={c.cx} cy={c.y - 2 * c.sc} r={32 * c.sc} color={s.cloudColor} />
            <Circle cx={c.cx} cy={c.y} r={38 * c.sc} color={s.cloudColor} />
            <Circle cx={c.cx} cy={c.y + 4 * c.sc} r={28 * c.sc} color={s.cloudColor} />
            <Circle cx={c.cx} cy={c.y - 8 * c.sc} r={24 * c.sc} color={s.cloudColor} />
          </Group>
        ))}
      </Group>

      {/* 7. Trees */}
      <Group opacity={0.45}>
        {[{ x: w * 0.10, y: h * 0.64, sc: 1.0 }, { x: w * 0.26, y: h * 0.65, sc: 0.7 }, { x: w * 0.68, y: h * 0.66, sc: 0.85 }, { x: w * 0.85, y: h * 0.63, sc: 0.55 }].map((t, i) => (
          <Group key={i}>
            <Rect x={t.x - 4 * t.sc} y={t.y - 30 * t.sc} width={8 * t.sc} height={30 * t.sc} color={s.treeColor} />
            <Circle cx={t.x} cy={t.y - 42 * t.sc} r={24 * t.sc} color={s.treeColor} />
          </Group>
        ))}
      </Group>

      {/* 8. Particles for domains that have them */}
      {s.hasParticles && (
        <AmbientParticles
          kind={s.particleKind}
          color={s.particleColor}
          w={w} h={h}
          phase={phase}
        />
      )}

      {/* 9. Vignette */}
      <Rect x={0} y={0} width={w} height={h}>
        <RadialGradient
          c={vec(w * 0.5, h * 0.35)}
          r={Math.max(w, h) * 0.75}
          colors={['transparent', 'rgba(0,0,0,0.10)']}
        />
      </Rect>
    </Canvas>
  );
}

// ─── Particles component ──────────────────────────────────────────────────

const PARTICLE_DATA = Array.from({ length: 10 }, (_, i) => ({
  seedX: (i * 137.5 + 50) % 100 / 100,
  seedY: (i * 97.3 + 20) % 100 / 100,
  speed: 0.3 + (i % 5) * 0.12,
  drift: ((i % 7) - 3) * 0.04,
}));

function AmbientParticles({
  kind,
  color,
  w,
  h,
  phase,
}: {
  kind: 'dot' | 'sparkle';
  color: string;
  w: number;
  h: number;
  phase: any;
}) {
  return (
    <Group>
      {PARTICLE_DATA.map((p, i) => (
        kind === 'sparkle' ? (
          <SparkleParticle key={i} p={p} color={color} w={w} h={h} phase={phase} />
        ) : (
          <DotParticle key={i} p={p} color={color} w={w} h={h} phase={phase} />
        )
      ))}
    </Group>
  );
}

function DotParticle({
  p, color, w, h, phase,
}: {
  p: typeof PARTICLE_DATA[0]; color: string; w: number; h: number; phase: any;
}) {
  const px = useDerivedValue(() => {
    const base = w * p.seedX;
    const drift = p.drift * w * ((phase.value * p.speed * 0.3) % 1);
    return ((base + drift + w) % (w * 1.1)) - w * 0.05;
  });
  const py = useDerivedValue(() => {
    const base = h * (0.2 + p.seedY * 0.5);
    const fall = (phase.value * p.speed * 50) % (h * 0.5);
    const wob = Math.sin(phase.value * p.speed * 8 + p.seedX * 6) * 12;
    return base + fall + wob;
  });
  const alpha = useDerivedValue(() =>
    0.25 + Math.sin(phase.value * p.speed * 6 + p.seedX * 4) * 0.2 + 0.35,
  );

  return <Circle cx={px} cy={py} r={2.5} color={color} opacity={alpha} />;
}

function SparkleParticle({
  p, color, w, h, phase,
}: {
  p: typeof PARTICLE_DATA[0]; color: string; w: number; h: number; phase: any;
}) {
  const px = useDerivedValue(() => {
    const base = w * p.seedX;
    return ((base + (phase.value * p.drift * 80) + w) % (w * 1.2)) - w * 0.1;
  });
  const py = useDerivedValue(() => {
    const base = h * (0.15 + p.seedY * 0.4);
    return ((base - (phase.value * p.speed * 40) + h) % (h * 0.7));
  });
  const alpha = useDerivedValue(() => {
    const pulse = Math.sin(phase.value * p.speed * 10 + p.seedX * 6);
    return 0.15 + (pulse * 0.5 + 0.5) * 0.7;
  });

  return <Circle cx={px} cy={py} r={3} color={color} opacity={alpha} />;
}
