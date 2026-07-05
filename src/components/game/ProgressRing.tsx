import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { colors, glow as glowStyle } from '@/theme/colors';

interface ProgressRingProps {
  /** 0..1 fill fraction. */
  progress: number;
  /** Outer diameter in px. Default 120. */
  size?: number;
  /** Ring stroke width. Default 10 (chunky, rounded caps). */
  stroke?: number;
  /** Solid fill color (used when `gradient` not given). Default teal. */
  color?: string;
  /** Optional two-stop gradient for the fill (overrides `color`). */
  gradient?: readonly [string, string];
  /** Track color behind the fill. Default white 10%. */
  trackColor?: string;
  /** Emit a colored halo when true (active state). */
  glow?: boolean;
  /** Center content (value, label, icon). */
  children?: ReactNode;
  style?: ViewStyle;
}

/**
 * Concentric progress ring — thick stroke, rounded caps, optional gradient +
 * glow. The house primitive for daily score, goal %, and workout progress
 * (DESIGN_SPEC §3). Static by design; wrap in Reanimated if a draw-in is needed.
 */
export function ProgressRing({
  progress,
  size = 120,
  stroke = 10,
  color = colors.teal,
  gradient,
  trackColor = 'rgba(255,255,255,0.10)',
  glow = false,
  children,
  style,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = clamped * circumference;
  const gradId = 'ring-grad';
  const strokeColor = gradient ? `url(#${gradId})` : color;

  return (
    <View
      style={[
        { width: size, height: size },
        styles.wrap,
        glow ? glowStyle(gradient ? gradient[1] : color, 0.35, 16) : null,
        style,
      ]}
    >
      <Svg width={size} height={size}>
        {gradient ? (
          <Defs>
            <LinearGradient id={gradId} x1='0' y1='0' x2='1' y2='1'>
              <Stop offset='0' stopColor={gradient[0]} />
              <Stop offset='1' stopColor={gradient[1]} />
            </LinearGradient>
          </Defs>
        ) : null}
        {/* Track */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={trackColor}
          strokeWidth={stroke}
          fill='none'
        />
        {/* Fill — rotated -90° so it starts at 12 o'clock. */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap='round'
          strokeDasharray={`${dash} ${circumference - dash}`}
          fill='none'
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      {children ? <View style={styles.center}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
