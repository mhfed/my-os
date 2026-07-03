import { memo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { base3D, colors, gradients, radius } from '@/theme/colors';
import { springs } from '@/theme/motion';
import { Icon, type IconName } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import type { HabitView } from '@/types/habit';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface HabitPillProps {
  habit: HabitView;
  onToggle: (id: string) => void;
}

const LIFT = 5;

/**
 * A chunky 3D habit tile. Done = glossy purple jelly slab sitting on a darker
 * base with a check badge; undone = bright tile with an inset icon bubble.
 * Presses spring the cap down into its base for a tactile click.
 */
export const HabitPill = memo(function HabitPill({ habit, onToggle }: HabitPillProps) {
  const done = habit.doneToday;
  const iconName = habit.icon as IconName;
  const press = useSharedValue(0);

  const capStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: press.value * LIFT }],
  }));

  const onPressIn = () => {
    press.value = withSpring(1, springs.press);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const onPressOut = () => {
    press.value = withSpring(0, springs.bouncy);
  };

  return (
    <AnimatedPressable
      onPress={() => onToggle(habit.id)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.wrap}
    >
      {/* dark base slab */}
      <View
        style={[
          styles.base,
          { backgroundColor: done ? colors.purpleDeep : colors.track },
        ]}
      />
      {/* animated cap */}
      <Animated.View style={[styles.cap, capStyle]}>
        {done ? (
          <LinearGradient
            colors={gradients.purple}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.fill}
          >
            <LinearGradient
              colors={gradients.gloss}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.6 }}
              style={styles.gloss}
              pointerEvents='none'
            />
            <Icon name={iconName} size={22} color={colors.white} />
            <Text style={styles.labelOn} numberOfLines={1}>
              {habit.name}
            </Text>
            <View style={styles.checkBadge}>
              <Icon name='check-bold' size={11} color={colors.white} />
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.fill, styles.fillOff]}>
            <View style={styles.iconBubble}>
              <Icon name={iconName} size={20} color={colors.purple} />
            </View>
            <Text style={styles.labelOff} numberOfLines={1}>
              {habit.name}
            </Text>
          </View>
        )}
      </Animated.View>
    </AnimatedPressable>
  );
});

const SIZE_W = 76;
const SIZE_H = 86;

const styles = StyleSheet.create({
  wrap: {
    width: SIZE_W,
    height: SIZE_H + LIFT,
  },
  base: {
    position: 'absolute',
    top: LIFT,
    left: 0,
    right: 0,
    height: SIZE_H,
    borderRadius: radius.md,
  },
  cap: {
    height: SIZE_H,
    borderRadius: radius.md,
  },
  fill: {
    flex: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  fillOff: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.white,
    ...base3D(colors.track, 2),
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.purpleDeep + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.green,
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelOn: {
    fontFamily: fonts.displayBold,
    fontSize: 11,
    color: colors.white,
  },
  labelOff: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: colors.muted,
  },
});
