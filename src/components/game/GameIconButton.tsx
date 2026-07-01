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

import { colors, gradients } from '@/theme/colors';
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
  gold: { gradient: gradients.gold, base: colors.orangeDeep },
  gem: { gradient: gradients.gem, base: colors.tealDeep },
  red: { gradient: gradients.red, base: colors.redDeep },
  blue: { gradient: ['#7DA8FF', '#5B8DEF'] as const, base: colors.blueDeep },
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

/**
 * Round (or squircle) 3D icon button — the HUD chrome used for close / camera /
 * settings / "+" affordances. Same jelly-press mechanic as {@link GameButton}.
 */
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
  const lift = Math.max(3, Math.round(size * 0.1));
  const press = useSharedValue(0);

  const capStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: press.value * lift }],
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

  const r = size * 0.42;

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[{ width: size, height: size + lift }, style]}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          { top: lift, borderRadius: r, backgroundColor: spec.base },
        ]}
      />
      <Animated.View style={capStyle}>
        <LinearGradient
          colors={spec.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.cap, { width: size, height: size, borderRadius: r }]}
        >
          <LinearGradient
            colors={gradients.gloss}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.gloss, { borderRadius: r - 2, height: size * 0.5 }]}
            pointerEvents='none'
          />
          <Icon
            name={icon}
            size={iconSize ?? size * 0.5}
            color={colors.white}
          />
        </LinearGradient>
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  cap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 2,
    left: 3,
    right: 3,
  },
});
