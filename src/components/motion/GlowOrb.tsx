import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

interface GlowOrbProps {
  /** Halo color (usually a domain accent). */
  color: string;
  /** Box size in px — the orb fills it and fades to transparent at the edge. */
  size?: number;
  /** Center opacity, 0–1. Default 0.5. */
  intensity?: number;
  /** Absolutely position behind siblings (caller positions the wrapper). */
  style?: StyleProp<ViewStyle>;
}

/**
 * A soft radial halo for layering behind hero elements (the Life ring, a
 * balance figure) to give the flat dark surface depth and a focal point.
 * Purely decorative — keep it `pointerEvents="none"` (default).
 */
export function GlowOrb({ color, size = 260, intensity = 0.5, style }: GlowOrbProps) {
  return (
    <View pointerEvents="none" style={[styles.wrap, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={intensity} />
            <Stop offset="0.55" stopColor={color} stopOpacity={intensity * 0.35} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={size} height={size} fill="url(#glow)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
