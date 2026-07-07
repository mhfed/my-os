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
  const r = Math.max(9, Math.round(size * 0.34));

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: r,
          backgroundColor: tint(color, '12'),
          borderWidth: 1,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Icon
        name={icon}
        size={iconSize ?? Math.round(size * 0.5)}
        color={color}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
