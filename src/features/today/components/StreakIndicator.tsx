import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { colors, gradients } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { Icon } from '@/theme/icons';

interface StreakIndicatorProps {
  /** Number of consecutive days with activity. */
  count: number;
  /** Whether to show fire animation for high streaks. */
  animate?: boolean;
}

/**
 * A flame-styled streak badge showing consecutive days of activity.
 * Features a subtle pulse animation for streaks >= 3.
 */
export function StreakIndicator({
  count,
  animate = true,
}: StreakIndicatorProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (animate && count >= 3) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 600 }),
          withTiming(1, { duration: 600 }),
        ),
        -1,
        true,
      );
    }
  }, [animate, count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (count === 0) return null;

  const isHot = count >= 7;
  const isWarm = count >= 3;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View
        style={[
          styles.badge,
          isHot && styles.badgeHot,
          isWarm && !isHot && styles.badgeWarm,
        ]}
      >
        <Icon
          name='fire'
          size={14}
          color={
            isHot ? colors.white : isWarm ? colors.yellowDeep : colors.orange
          }
        />
        <Text style={[styles.count, isHot && styles.countHot]}>{count}</Text>
      </View>
      <Text style={styles.label}>day{count !== 1 ? 's' : ''}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.orange,
  },
  badgeWarm: {
    backgroundColor: colors.yellow,
    borderColor: colors.yellowDeep,
  },
  badgeHot: {
    backgroundColor: colors.orange,
    borderColor: colors.orangeDeep,
  },
  count: {
    fontFamily: fonts.displayExtra,
    fontSize: 14,
    color: colors.orange,
    ...textShadow.emboss,
  },
  countHot: {
    color: colors.white,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
});
