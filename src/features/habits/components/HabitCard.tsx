import { StyleSheet, Text, View } from 'react-native';

import { colors, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';
import type { HabitView } from '@/types/habit';

interface HabitCardProps {
  habit: HabitView;
}

/** A single habit row card: icon chip + name/sub + streak + progress bar. */
export function HabitCard({ habit }: HabitCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View
          style={[styles.iconWrap, { backgroundColor: tint(habit.color) }]}
        >
          <Icon name={habit.icon as IconName} size={20} color={habit.color} />
        </View>

        <View style={styles.middle}>
          <Text style={styles.name}>{habit.name}</Text>
          {habit.sub ? <Text style={styles.sub}>{habit.sub}</Text> : null}
        </View>

        <View style={styles.right}>
          <View style={styles.streakRow}>
            <Text style={[styles.streak, { color: habit.color }]}>
              {habit.streak}
            </Text>
            <Text style={styles.flame}>🔥</Text>
          </View>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${habit.pct}%`, backgroundColor: habit.color },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginBottom: 13,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  streak: {
    fontFamily: fonts.monoSemibold,
    fontSize: 24,
  },
  flame: {
    fontSize: 11,
  },
  streakLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
  },
  track: {
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  fill: {
    height: 7,
    borderRadius: 4,
  },
});
