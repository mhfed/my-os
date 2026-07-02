import { StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import {
  colors,
  glassy,
  gradients,
  gradientFor,
  resolveAccent,
} from '@/theme/colors';
import { Ucon, type UconName } from '@/theme/ucons';

interface Unicon3DProps {
  name: UconName;
  color: string;
  size?: number;
  iconSize?: number;
  style?: ViewStyle;
}

/**
 * 3D glossy chip badge for Unicons — same candy/clay style as IconBadge but
 * renders an SVG Unicon instead of a MaterialCommunityIcon glyph.
 *
 * Use this anywhere you want a rich 3D icon badge with a selected Unicon:
 *
 * ```tsx
 * <Unicon3D name="wallet" color={colors.teal} size={44} />
 * ```
 */
export function Unicon3D({
  name,
  color,
  size = 36,
  iconSize,
  style,
}: Unicon3DProps) {
  const { face, deep } = resolveAccent(color);
  const r = Math.max(9, Math.round(size * 0.34));
  const lift = Math.max(2, Math.round(size * 0.08));
  const spot = Math.round(size * 0.34);

  return (
    <View style={[{ width: size, height: size + lift }, style]}>
      {/* deep base wall */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { top: lift, borderRadius: r, backgroundColor: deep },
        ]}
      />
      {/* translucent candy-glass gradient cap */}
      <LinearGradient
        colors={[
          glassy(gradientFor(face)[0], 'CC'),
          glassy(gradientFor(face)[1], 'E6'),
        ]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[styles.cap, { width: size, height: size, borderRadius: r }]}
      >
        {/* top gloss sheen (top half) */}
        <LinearGradient
          colors={gradients.gloss}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.gloss, { borderRadius: r - 2, height: size * 0.52 }]}
          pointerEvents='none'
        />
        {/* soft highlight spot (top-left) */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.1,
            left: size * 0.14,
            width: spot,
            height: spot * 0.72,
            borderRadius: spot,
            backgroundColor: 'rgba(255,255,255,0.5)',
          }}
          pointerEvents='none'
        />
        <Ucon
          name={name}
          size={iconSize ?? Math.round(size * 0.5)}
          color={colors.white}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.65)',
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 2,
    left: 3,
    right: 3,
  },
});
