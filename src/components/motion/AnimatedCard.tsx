import { type ReactNode, useEffect } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { springs, staggerDelay, timing } from '@/theme/motion';

interface AnimatedCardProps {
  children: ReactNode;
  /** Position in a list — drives the staggered entrance delay. */
  index?: number;
  /** Extra delay (ms) on top of the stagger, e.g. to let a hero settle first. */
  delay?: number;
  /** Distance (px) the card travels up into place. Default 14. */
  translate?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Wraps content in a fade + slide-up entrance. Drop it around cards, rows or
 * sections and pass `index` so a list reveals top-to-bottom. Respects the OS
 * "reduce motion" setting (renders instantly, fully visible).
 */
export function AnimatedCard({
  children,
  index = 0,
  delay = 0,
  translate = 14,
  style,
}: AnimatedCardProps) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const offset = useSharedValue(reduceMotion ? 0 : translate);
  const scale = useSharedValue(reduceMotion ? 1 : 0.98);

  useEffect(() => {
    if (reduceMotion) return;
    const total = delay + staggerDelay(index);
    opacity.value = withDelay(total, withTiming(1, timing.base));
    offset.value = withDelay(total, withSpring(0, springs.smooth));
    scale.value = withDelay(total, withSpring(1, springs.smooth));
  }, [reduceMotion, delay, index, opacity, offset, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: offset.value }, { scale: scale.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
