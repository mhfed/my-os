import { type ReactNode, useCallback } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { springs } from '@/theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'none';

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: ReactNode;
  /** How far to shrink on press-in. Default 0.96. */
  scaleTo?: number;
  /** Haptic fired on press-in. Default 'light'; 'none' to disable. */
  haptic?: HapticStyle;
  style?: StyleProp<ViewStyle>;
}

const fire = (style: HapticStyle) => {
  if (style === 'none') return;
  if (style === 'selection') {
    Haptics.selectionAsync();
    return;
  }
  const map = {
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
  } as const;
  Haptics.impactAsync(map[style]);
};

/**
 * Drop-in Pressable that springs to `scaleTo` on press-in and back on release,
 * with an optional haptic tap. Use anywhere the app currently feels "dead" to
 * the touch.
 */
export function PressableScale({
  children,
  scaleTo = 0.96,
  haptic = 'light',
  style,
  onPressIn,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback<NonNullable<PressableProps['onPressIn']>>(
    (e) => {
      scale.value = withSpring(scaleTo, springs.press);
      fire(haptic);
      onPressIn?.(e);
    },
    [scale, scaleTo, haptic, onPressIn]
  );

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springs.press);
  }, [scale]);

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
