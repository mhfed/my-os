import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { GamePanel, IconBadge, ProgressRing, StreakFlame } from '@/components/game';
import { PressableScale } from '@/components/motion';
import { colors, glass, gradients, glow, radius, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { springs } from '@/theme/motion';
import { spacing } from '@/theme/spacing';
import { Icon, type IconName } from '@/theme/icons';
import { useHabitsStore } from '@/store/habitsStore';
import type { HabitView } from '@/types/habit';

interface HabitCardProps {
  habit: HabitView;
  index?: number;
}

const GOLD_STAR_STREAK = 21;

/**
 * A single habit card (DESIGN_SPEC §5.5): 3D IconBadge, name, StreakFlame that
 * heats orange→pink by length, a mini weekly ProgressRing, and a chunky
 * "Hoàn thành" tap that fires a bounce + success haptic when today is checked.
 */
export function HabitCard({ habit, index = 0 }: HabitCardProps) {
  const toggleToday = useHabitsStore((s) => s.toggleToday);
  const reduceMotion = useReducedMotion();

  const doneDays = habit.pattern.reduce((sum, v) => sum + v, 0);
  const done = habit.doneToday;

  // Bounce the ring when today flips to done.
  const bounce = useSharedValue(1);
  const prevDone = useRef(done);
  useEffect(() => {
    if (done && !prevDone.current && !reduceMotion) {
      bounce.value = withSequence(
        withSpring(1.18, springs.bouncy),
        withSpring(1, springs.bouncy),
      );
    }
    prevDone.current = done;
  }, [done, reduceMotion, bounce]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounce.value }],
  }));

  const handleComplete = useCallback(() => {
    // Success pulse only when checking on; a lighter tap when unchecking.
    if (!done) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    void toggleToday(habit.id);
  }, [done, toggleToday, habit.id]);

  return (
    <GamePanel>
      <View style={styles.topRow}>
        <IconBadge icon={habit.icon as IconName} color={habit.color} size={44} />

        <View style={styles.middle}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {habit.name}
            </Text>
            {habit.streak >= GOLD_STAR_STREAK ? (
              <View style={glow(colors.gold, 0.6, 8)}>
                <Icon name='star' size={15} color={colors.gold} />
              </View>
            ) : null}
          </View>
          {habit.sub ? (
            <Text style={styles.sub} numberOfLines={1}>
              {habit.sub}
            </Text>
          ) : null}
          <StreakFlame count={habit.streak} label='ngày' size={16} bare style={styles.flame} />
        </View>

        <Animated.View style={ringStyle}>
          <ProgressRing
            progress={habit.pct / 100}
            size={52}
            stroke={6}
            gradient={gradients.green}
            glow={done}
          >
            <Text style={styles.ringValue}>{doneDays}/7</Text>
          </ProgressRing>
        </Animated.View>
      </View>

      <PressableScale
        haptic='none'
        onPress={handleComplete}
        accessibilityRole='button'
        accessibilityLabel={done ? `Bỏ hoàn thành ${habit.name}` : `Hoàn thành ${habit.name}`}
        style={[styles.completeBtn, done ? styles.completeBtnDone : styles.completeBtnIdle]}
      >
        <Icon
          name={done ? 'check-circle' : 'checkbox-blank-circle-outline'}
          size={20}
          color={done ? colors.green : colors.muted}
        />
        <Text style={[styles.completeText, { color: done ? colors.green : colors.text }]}>
          {done ? 'Đã hoàn thành hôm nay' : 'Hoàn thành'}
        </Text>
      </PressableScale>
    </GamePanel>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  middle: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: colors.text,
    flexShrink: 1,
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  flame: {
    marginTop: 4,
  },
  ringValue: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
    color: colors.text,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  completeBtnIdle: {
    backgroundColor: glass.fill,
    borderColor: glass.rim,
  },
  completeBtnDone: {
    backgroundColor: tint(colors.green, '1F'),
    borderColor: tint(colors.green, '55'),
  },
  completeText: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
