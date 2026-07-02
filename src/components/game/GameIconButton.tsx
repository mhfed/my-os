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

import { colors, glassy, gradients } from '@/theme/colors';
import { springs } from '@/theme/motion';
import { Icon, type IconName } from '@/theme/icons';

import type { GameButtonVariant, ButtonMaterial } from './GameButton';


const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
interface VariantSpec {
  gradient: readonly [string, string];
  base: string;
}

const glassGrad = (g: readonly [string, string]) =>
  [glassy(g[0], 'D6'), glassy(g[1], 'E8')] as const;

const VARIANTS: Record<GameButtonVariant, VariantSpec> = {
  green: { gradient: glassGrad(gradients.green), base: colors.greenDeep },
  purple: { gradient: glassGrad(gradients.purple), base: colors.purpleDeep },
  gold: { gradient: glassGrad(gradients.gold), base: colors.goldDeep },
  gem: { gradient: glassGrad(gradients.gem), base: colors.tealDeep },
  red: { gradient: glassGrad(gradients.red), base: colors.redDeep },
  blue: { gradient: glassGrad(gradients.blue), base: colors.blueDeep },
};

const MATERIALS: Record<ButtonMaterial, { capGradient: readonly [string, string]; capBorder: string } | null> = {
  gem: null,
  stone: { capGradient: ['#B8B0A8', '#8A8078'] as const, capBorder: 'rgba(90,80,72,0.5)' },
  wood: { capGradient: ['#C4A060', '#8B6914'] as const, capBorder: 'rgba(70,50,10,0.5)' },
  metal: { capGradient: ['#D8D8D8', '#888888'] as const, capBorder: 'rgba(160,160,180,0.6)' },
};

interface GameIconButtonProps extends Omit<
  PressableProps,
  'style' | 'children'
> {
  icon: IconName;
  variant?: GameButtonVariant;
  material?: ButtonMaterial;
  size?: number;
  iconSize?: number;
  style?: ViewStyle;
  haptic?: boolean;
}

/**
 * 3D icon button with material variants.
 * Same 3-layer press mechanic as GameButton.
 */
export function GameIconButton({
  icon,
  variant = 'purple',
  material = 'gem',
  size = 46,
  iconSize,
  style,
  haptic = true,
  onPressIn,
  onPressOut,
  ...rest
}: GameIconButtonProps) {
  const spec = VARIANTS[variant];
  const mat = MATERIALS[material];
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
  const capGradient = mat?.capGradient ?? spec.gradient;
  const capBorder = mat?.capBorder ?? 'rgba(255,255,255,0.6)';

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
          { top: lift, borderRadius: r, backgroundColor: material === 'metal' ? '#666' : spec.base },
        ]}
      />
      <Animated.View style={capStyle}>
        <LinearGradient
          colors={capGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.cap, { width: size, height: size, borderRadius: r, borderColor: capBorder }]}
        >
          {material === 'gem' && (
            <LinearGradient
              colors={gradients.gloss}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={[styles.gloss, { borderRadius: r - 2, height: size * 0.5 }]}
              pointerEvents='none'
            />
          )}
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
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 2,
    left: 3,
    right: 3,
  },
});
