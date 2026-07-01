import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

interface ShimmerViewProps {
  /** Width of the shimmer effect. */
  width?: number;
  /** Height of the shimmer effect. */
  height?: number;
  /** Shimmer color (default: white with low opacity). */
  color?: string;
  /** Duration of one shimmer cycle in ms. */
  duration?: number;
  /** Container style. */
  style?: ViewStyle;
}

/**
 * A subtle shimmer overlay effect for adding polish to panels.
 * Creates a moving highlight that sweeps across the surface.
 */
export function ShimmerView({
  width = 200,
  height = 100,
  color = 'rgba(255,255,255,0.15)',
  duration = 2000,
  style,
}: ShimmerViewProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [-width, width]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            width: width * 0.5,
            height,
            backgroundColor: color,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'absolute',
  },
  shimmer: {
    opacity: 0.6,
    transform: [{ skewX: '-20deg' }],
  },
});
