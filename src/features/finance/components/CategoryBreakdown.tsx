import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { PressableScale } from '@/components/motion';
import type { CategorySpend } from '@/types/finance';
import { formatCompactVND } from '@/utils/currency';

import { CategoryDonut } from './CategoryDonut';
import { SetBudgetModal } from './SetBudgetModal';

interface CategoryBreakdownProps {
  data: CategorySpend[];
}

/** "By category" section: donut + legend rows. Designed to sit inside a GamePanel. */
export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const [budgetOpen, setBudgetOpen] = useState(false);

  return (
    <>
      <View style={styles.donutRow}>
        <CategoryDonut data={data} />

        <View style={styles.legend}>
          {data.map((slice) => {
            const hasBudget = slice.budget > 0;
            const isOver = slice.budgetUsed >= 1;
            const barFill = Math.min(1, slice.budgetUsed) * 56;
            const barColor =
              slice.budgetUsed > 1
                ? colors.red
                : slice.budgetUsed >= 0.8
                  ? colors.orange
                  : colors.teal;

            return (
              <View key={slice.categoryId} style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: slice.color }]} />
                <Text style={styles.name} numberOfLines={1}>
                  {slice.name}
                </Text>
                {hasBudget ? (
                  <View style={styles.budgetRight}>
                    <View style={styles.miniBarTrack}>
                      <View
                        style={[
                          styles.miniBarFill,
                          { width: barFill, backgroundColor: barColor },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.budgetText,
                        { color: isOver ? colors.red : colors.muted },
                      ]}
                      numberOfLines={1}
                    >
                      {formatCompactVND(slice.amount)} /{' '}
                      {formatCompactVND(slice.budget)}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.pct}>
                    {formatCompactVND(slice.amount)} · {Math.round(slice.pct)}%
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <PressableScale
        style={styles.budgetBtn}
        onPress={() => setBudgetOpen(true)}
        haptic='light'
      >
        <Text style={styles.budgetBtnText}>Set budgets</Text>
      </PressableScale>

      {budgetOpen && (
        <SetBudgetModal
          visible={budgetOpen}
          onClose={() => setBudgetOpen(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  legend: {
    flex: 1,
    gap: 9,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 3,
    marginRight: 10,
  },
  name: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text,
  },
  pct: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.muted,
  },
  budgetRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  miniBarTrack: {
    width: 56,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: 4,
    borderRadius: 2,
  },
  budgetText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
  },
  budgetBtn: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.track,
    alignItems: 'center',
  },
  budgetBtnText: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.text,
  },
});
