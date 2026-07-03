import { StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import {
  colors,
  gradients,
  gradientFor,
  resolveAccent,
  tint,
} from '@/theme/colors';
import { Icon, type IconName } from '@/theme/icons';

interface IconBadgeProps {
  icon: IconName;
  color: string;
  size?: number;
  iconSize?: number;
  style?: ViewStyle;
}

/**
 * Glossy 3D icon badge — a candy/clay chip with a deep base wall and gradient
 * cap. `color` resolves to the nearest theme accent.
 */
export function IconBadge({
  icon,
  color,
  size = 36,
  iconSize,
  style,
}: IconBadgeProps) {
  const { face, deep } = resolveAccent(color);
  const r = Math.max(9, Math.round(size * 0.34));
  const lift = Math.max(2, Math.round(size * 0.08));
  const spot = Math.round(size * 0.34);

  return (
    <View style={[{ width: size, height: size + lift }, style]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { top: lift, borderRadius: r, backgroundColor: deep },
        ]}
      />
      <LinearGradient
        colors={[
          tint(gradientFor(face)[0], 'CC'),
          tint(gradientFor(face)[1], 'E6'),
        ]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[styles.cap, { width: size, height: size, borderRadius: r }]}
      >
        <LinearGradient
          colors={gradients.gloss}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.gloss, { borderRadius: r - 2, height: size * 0.52 }]}
          pointerEvents='none'
        />
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
        <Icon
          name={icon}
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
