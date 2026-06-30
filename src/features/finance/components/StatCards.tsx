import { StyleSheet, Text, View } from 'react-native';

import { colors, tint } from '@/theme/colors';
import { Icon, type IconName } from '@/theme/icons';
import { fonts } from '@/theme/typography';
import type { MonthlyOverview } from '@/types/finance';
import { formatCompactVND } from '@/utils/currency';

type StatCardsProps = Pick<MonthlyOverview, 'income' | 'spent' | 'saved'>;

interface Stat {
  label: string;
  value: number;
  icon: IconName;
  accent: string;
}

/** The three summary stat cards: Income · Spent · Saved. */
export function StatCards({ income, spent, saved }: StatCardsProps) {
  const stats: Stat[] = [
    { label: 'Income', value: income, icon: 'arrow-bottom-left', accent: colors.teal },
    { label: 'Spent', value: spent, icon: 'arrow-top-right', accent: colors.red },
    { label: 'Saved', value: saved, icon: 'piggy-bank', accent: colors.purple },
  ];

  return (
    <View style={styles.row}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.card}>
          <View style={[styles.chip, { backgroundColor: tint(stat.accent) }]}>
            <Icon name={stat.icon} size={17} color={stat.accent} />
          </View>
          <Text style={styles.label}>{stat.label}</Text>
          <Text style={[styles.value, { color: stat.accent }]}>
            {formatCompactVND(stat.value)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  chip: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    marginBottom: 3,
  },
  value: {
    fontFamily: fonts.monoSemibold,
    fontSize: 14,
  },
});
