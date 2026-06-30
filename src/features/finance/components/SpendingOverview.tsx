import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import type { MonthlyOverview } from '@/types/finance';
import { formatVND } from '@/utils/currency';

type SpendingOverviewProps = Pick<
  MonthlyOverview,
  'spent' | 'budgetUsed' | 'remaining'
>;

/** Top "SPENT THIS MONTH" card with the budget progress bar. */
export function SpendingOverview({
  spent,
  budgetUsed,
  remaining,
}: SpendingOverviewProps) {
  const pct = Math.max(0, Math.min(1, budgetUsed));

  return (
    <View style={styles.card}>
      <Text style={styles.label}>SPENT THIS MONTH</Text>
      <Text style={styles.amount}>{formatVND(spent)}</Text>

      <View style={styles.track}>
        <LinearGradient
          colors={[colors.purple, colors.teal]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${pct * 100}%` }]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerMuted}>
          {Math.round(pct * 100)}% of budget
        </Text>
        <Text style={styles.footerLeft}>{formatVND(remaining)} left</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  amount: {
    fontFamily: fonts.monoSemibold,
    fontSize: 34,
    color: colors.text,
    letterSpacing: -1,
    marginBottom: 16,
  },
  track: {
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.track,
    marginBottom: 10,
    overflow: 'hidden',
  },
  fill: {
    height: 9,
    borderRadius: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerMuted: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  footerLeft: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.teal,
  },
});
