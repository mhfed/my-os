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

import { colors, glassy, gradients, radius } from '@/theme/colors';
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
export type ButtonMaterial = 'gem' | 'stone' | 'wood' | 'metal';

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

/** Material overrides for the gradient cap. */
const MATERIALS: Record<ButtonMaterial, { capGradient: readonly [string, string]; capBorder: string } | null> = {
  gem: null, // use variant's own glassGrad
  stone: {
    capGradient: ['#B8B0A8', '#8A8078'] as const,
    capBorder: 'rgba(90,80,72,0.5)',
  },
  wood: {
    capGradient: ['#C4A060', '#8B6914'] as const,
    capBorder: 'rgba(70,50,10,0.5)',
  },
  metal: {
    capGradient: ['#D8D8D8', '#888888'] as const,
    capBorder: 'rgba(160,160,180,0.6)',
  },
};

const SIZES: Record<
  GameButtonSize,
  { height: number; paddingH: number; font: number; r: number; lift: number }
> = {
  sm: { height: 40, paddingH: 18, font: 15, r: radius.md, lift: 4 },
  md: { height: 52, paddingH: 24, font: 18, r: radius.lg, lift: 5 },
  lg: { height: 62, paddingH: 30, font: 22, r: radius.xl, lift: 6 },
};

interface GameButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label?: string;
  variant?: GameButtonVariant;
  size?: GameButtonSize;
  material?: ButtonMaterial;
  icon?: IconName;
  children?: ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  haptic?: boolean;
}

/**
 * 3-layer button: base + gradient cap + gloss.
 * `material` prop changes the cap look:
 *   gem (default) — translucent jewel,
 *   stone — matte rock,
 *   wood — warm grain,
 *   metal — cold sheen.
 */
export function GameButton({
  label,
  variant = 'green',
  size = 'md',
  material = 'gem',
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
  const mat = MATERIALS[material];
  const dims = SIZES[size];
  const press = useSharedValue(0);

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

  const capGradient = mat?.capGradient ?? spec.gradient;
  const capBorder = mat?.capBorder ?? 'rgba(255,255,255,0.6)';

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
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            top: dims.lift,
            borderRadius: dims.r,
            backgroundColor: material === 'metal' ? '#666' : spec.base,
          },
        ]}
      />

      <Animated.View style={capStyle}>
        <LinearGradient
          colors={capGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[
            styles.cap,
            {
              height: dims.height,
              paddingHorizontal: dims.paddingH,
              borderRadius: dims.r,
              borderColor: capBorder,
            },
          ]}
        >
          {/* Only gem gets the glossy top sheen */}
          {material === 'gem' && (
            <LinearGradient
              colors={gradients.gloss}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={[
                styles.gloss,
                { borderRadius: dims.r - 2, height: dims.height * 0.5 },
              ]}
              pointerEvents='none'
            />
          )}
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
