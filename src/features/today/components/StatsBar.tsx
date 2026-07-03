import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';

interface StatItem {
  icon: IconName;
  label: string;
  value: string;
  color: string;
}

interface StatsBarProps {
  taskDone: number;
  taskTotal: number;
  habitDone: number;
  habitTotal: number;
  inboxOpen: number;
  streak: number;
  journalDone: boolean;
}

export const StatsBar = memo(function StatsBar({
  taskDone,
  taskTotal,
  habitDone,
  habitTotal,
  inboxOpen,
  streak,
}: StatsBarProps) {
  const stats: StatItem[] = [
    {
      icon: 'checkbox-marked-outline',
      label: 'Nhiệm vụ',
      value: `${taskDone}/${taskTotal}`,
      color: colors.blue,
    },
    {
      icon: 'checkbox-marked-circle-outline',
      label: 'Thói quen',
      value: `${habitDone}/${habitTotal}`,
      color: colors.orange,
    },
    {
      icon: 'bell-outline',
      label: 'Inbox',
      value: inboxOpen > 0 ? `${inboxOpen}` : '0',
      color: inboxOpen > 0 ? colors.purple : colors.muted,
    },
    {
      icon: 'fire',
      label: 'Streak',
      value: `${streak}`,
      color: streak > 0 ? colors.red : colors.muted,
    },
  ];

  return (
    <View style={styles.row}>
      {stats.map((s) => (
        <View key={s.label} style={styles.cell}>
          <Icon name={s.icon} size={20} color={s.color} />
          <Text style={[styles.value, { color: s.color }]}>{s.value}</Text>
          <Text style={styles.label}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 4,
  },
  value: {
    fontFamily: fonts.displayExtra,
    fontSize: 20,
    marginTop: 2,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.3,
  },
});
