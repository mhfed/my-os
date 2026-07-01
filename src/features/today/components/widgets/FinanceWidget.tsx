import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { WidgetCard } from '../WidgetCard';
import { useFinanceStore } from '@/store/financeStore';
import { formatCompactVND } from '@/utils/currency';

export function FinanceWidget() {
  const router = useRouter();
  const ready = useFinanceStore((s) => s.ready);

  if (!ready) return null;

  const overview = useFinanceStore.getState().getOverview();
  const pct = Math.min(100, Math.round(overview.budgetUsed * 100));
  const barColor =
    pct > 100 ? colors.red : pct > 80 ? colors.orange : colors.teal;

  return (
    <WidgetCard
      domain='finance'
      title='Finance'
      icon='wallet'
      onPress={() => router.push('/finance')}
    >
      <Text style={styles.spent}>{formatCompactVND(overview.spent)}</Text>
      <Text style={styles.budgetLabel}>
        of {formatCompactVND(overview.budget)} budget
      </Text>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${pct}%`, backgroundColor: barColor },
          ]}
        />
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatCompactVND(overview.income)}</Text>
          <Text style={styles.statLabel}>Income</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatCompactVND(overview.saved)}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
      </View>
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  spent: {
    fontFamily: fonts.displayExtra,
    fontSize: 20,
    color: colors.teal,
  },
  budgetLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.muted,
    marginTop: -2,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.track,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  stat: {
    gap: 1,
  },
  statValue: {
    fontFamily: fonts.monoSemibold,
    fontSize: 12,
    color: colors.text,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.muted,
    textTransform: 'uppercase',
  },
});
