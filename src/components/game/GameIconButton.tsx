import { useCallback } from 'react';
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors, gradients, tint } from '@/theme/colors';
import { springs } from '@/theme/motion';
import { Icon, type IconName } from '@/theme/icons';

import type { GameButtonVariant } from './GameButton';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface VariantSpec {
  gradient: readonly [string, string];
  base: string;
}

const VARIANTS: Record<GameButtonVariant, VariantSpec> = {
  green: { gradient: gradients.green, base: colors.greenDeep },
  purple: { gradient: gradients.purple, base: colors.purpleDeep },
  gold: { gradient: gradients.gold, base: colors.goldDeep },
  gem: { gradient: gradients.gem, base: colors.tealDeep },
  red: { gradient: gradients.red, base: colors.redDeep },
  blue: { gradient: gradients.blue, base: colors.blueDeep },
  pink: { gradient: gradients.pink, base: colors.pinkDeep },
};

interface GameIconButtonProps extends Omit<
  PressableProps,
  'style' | 'children'
> {
  icon: IconName;
  variant?: GameButtonVariant;
  size?: number;
  iconSize?: number;
  style?: ViewStyle;
  haptic?: boolean;
}

export function GameIconButton({
  icon,
  variant = 'purple',
  size = 46,
  iconSize,
  style,
  haptic = true,
  onPressIn,
  onPressOut,
  ...rest
}: GameIconButtonProps) {
  const spec = VARIANTS[variant];
  const press = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.05 }],
    opacity: 1 - press.value * 0.08,
  }));

  const handlePressIn = useCallback<NonNullable<PressableProps['onPressIn']>>(
    (e) => {
      press.value = withSpring(1, springs.press);
      if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPressIn?.(e);
    },
    [press, haptic, onPressIn],
  );

  const handlePressOut = useCallback<NonNullable<PressableProps['onPressOut']>>(
    (e) => {
      press.value = withSpring(0, springs.bouncy);
      onPressOut?.(e);
    },
    [press, onPressOut],
  );

  const r = size * 0.5;

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[{ width: size, height: size }, animatedStyle, style]}
    >
      <LinearGradient
        colors={[tint(spec.gradient[0], '22'), tint(spec.gradient[1], '11')]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.cap,
          {
            width: size,
            height: size,
            borderRadius: r,
            borderColor: tint(spec.gradient[0], '40'),
            backgroundColor: 'rgba(255,255,255,0.01)',
          },
        ]}
      >
        <Icon
          name={icon}
          size={iconSize ?? size * 0.45}
          color={spec.gradient[0]}
        />
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  cap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
});
