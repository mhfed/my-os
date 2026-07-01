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
  | 'blue';
export type GameButtonSize = 'sm' | 'md' | 'lg';

interface VariantSpec {
  gradient: readonly [string, string];
  base: string; // the darker 3D base / pressed shade
}

const VARIANTS: Record<GameButtonVariant, VariantSpec> = {
  green: { gradient: gradients.green, base: colors.greenDeep },
  purple: { gradient: gradients.purple, base: colors.purpleDeep },
  gold: { gradient: gradients.gold, base: colors.orangeDeep },
  gem: { gradient: gradients.gem, base: colors.tealDeep },
  red: { gradient: gradients.red, base: colors.redDeep },
  blue: { gradient: ['#7DA8FF', '#5B8DEF'] as const, base: colors.blueDeep },
};

const SIZES: Record<
  GameButtonSize,
  {
    height: number;
    paddingH: number;
    font: number;
    radius: number;
    lift: number;
  }
> = {
  sm: { height: 40, paddingH: 18, font: 15, radius: radius.md, lift: 4 },
  md: { height: 52, paddingH: 24, font: 18, radius: radius.lg, lift: 5 },
  lg: { height: 62, paddingH: 30, font: 22, radius: radius.xl, lift: 6 },
};

interface GameButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label?: string;
  variant?: GameButtonVariant;
  size?: GameButtonSize;
  icon?: IconName;
  /** Render arbitrary children instead of label. */
  children?: ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  haptic?: boolean;
}

/**
 * The signature mobile-game CTA: a chunky, glossy "jelly" button that sits on a
 * darker coloured base. Pressing it springs the cap down INTO the base (the
 * `lift` collapses) for a satisfying physical click, fires a haptic, then
 * springs back.
 *
 * The look is built from three layers:
 *   1. a `base` slab (the darker `deep` colour) that creates the 3D side wall
 *   2. the gradient `cap` (light top -> rich bottom)
 *   3. a top `gloss` highlight overlay for the candy sheen
 */
export function GameButton({
  label,
  variant = 'green',
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
  const press = useSharedValue(0); // 0 = up, 1 = pressed down

  const capStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: press.value * dims.lift }],
  }));

  const handlePressIn = useCallback<NonNullable<PressableProps['onPressIn']>>(
    (e) => {
      press.value = withSpring(1, springs.press);
      if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
        { paddingBottom: dims.lift },
        style,
      ]}
    >
      {/* 3D base slab */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            top: dims.lift,
            borderRadius: dims.radius,
            backgroundColor: spec.base,
          },
        ]}
      />

      {/* Animated cap */}
      <Animated.View style={capStyle}>
        <LinearGradient
          colors={spec.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[
            styles.cap,
            {
              height: dims.height,
              paddingHorizontal: dims.paddingH,
              borderRadius: dims.radius,
            },
          ]}
        >
          {/* gloss sheen on the top half */}
          <LinearGradient
            colors={gradients.gloss}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[
              styles.gloss,
              { borderRadius: dims.radius - 2, height: dims.height * 0.5 },
            ]}
            pointerEvents='none'
          />
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
      </Animated.View>
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
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 2,
    left: 4,
    right: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fonts.displayExtra,
    color: colors.white,
    letterSpacing: 0.3,
  },
});
