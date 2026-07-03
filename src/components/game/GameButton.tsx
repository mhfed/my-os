import { type ReactNode, useCallback } from 'react';
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
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

import { colors, gradients, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { springs } from '@/theme/motion';
import { Icon, type IconName } from '@/theme/icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type GameButtonVariant =
  | 'green'
  | 'purple'
  | 'gold'
  | 'gem'
  | 'red'
  | 'blue'
  | 'pink';
export type GameButtonSize = 'sm' | 'md' | 'lg';

interface VariantSpec {
  gradient: readonly [string, string];
  glow: string;
}

const VARIANTS: Record<GameButtonVariant, VariantSpec> = {
  green: { gradient: gradients.green, glow: colors.green },
  purple: { gradient: gradients.purple, glow: colors.purple },
  gold: { gradient: gradients.gold, glow: colors.gold },
  gem: { gradient: gradients.gem, glow: colors.teal },
  red: { gradient: gradients.red, glow: colors.red },
  blue: { gradient: gradients.blue, glow: colors.blue },
  pink: { gradient: gradients.pink, glow: colors.pink },
};

const SIZES: Record<
  GameButtonSize,
  { height: number; paddingH: number; font: number; r: number }
> = {
  sm: { height: 40, paddingH: 20, font: 15, r: radius.pill },
  md: { height: 52, paddingH: 28, font: 17, r: radius.pill },
  lg: { height: 62, paddingH: 34, font: 20, r: radius.pill },
};

interface GameButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label?: string;
  variant?: GameButtonVariant;
  size?: GameButtonSize;
  icon?: IconName;
  children?: ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  haptic?: boolean;
}

/**
 * Lumina neon glass button — pill-shaped with gradient fill and subtle glow.
 * Press animates with a squishy spring.
 */
export function GameButton({
  label,
  variant = 'blue',
  size = 'md',
  icon,
  children,
  fullWidth = false,
  style,
  haptic = true,
  onPressIn,
  onPressOut,
  ...rest
}: GameButtonProps) {
  const spec = VARIANTS[variant];
  const dims = SIZES[size];
  const press = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.04 }],
    opacity: 1 - press.value * 0.1,
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

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.root,
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      <LinearGradient
        colors={spec.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.cap,
          {
            height: dims.height,
            paddingHorizontal: dims.paddingH,
            borderRadius: dims.r,
          },
        ]}
      >
        {children ?? (
          <View style={styles.content}>
            {icon ? (
              <Icon name={icon} size={dims.font + 2} color={colors.white} />
            ) : null}
            {label ? (
              <Text
                style={[
                  styles.label,
                  textShadow.button,
                  { fontSize: dims.font },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            ) : null}
          </View>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  cap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fonts.displayBold,
    color: colors.white,
    letterSpacing: 0.3,
  },
});
