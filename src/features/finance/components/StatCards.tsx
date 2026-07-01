import { StyleSheet, Text, View } from 'react-native';

import { colors, elevation, glow, tint } from '@/theme/colors';
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
    {
      label: 'Income',
      value: income,
      icon: 'arrow-bottom-left',
      accent: colors.teal,
    },
    {
      label: 'Spent',
      value: spent,
      icon: 'arrow-top-right',
      accent: colors.red,
    },
    { label: 'Saved', value: saved, icon: 'piggy-bank', accent: colors.purple },
  ];

  return (
    <View style={styles.row}>
      {stats.map((stat) => (
        <View
          key={stat.label}
          style={[
            styles.card,
            { borderColor: tint(stat.accent, '33') },
            glow(stat.accent, 0.16, 14),
          ]}
        >
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
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    ...elevation.card,
  },
  chip: {
    width: 32,
    height: 32,
    borderRadius: 10,
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
