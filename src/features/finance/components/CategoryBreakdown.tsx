import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { SetBudgetModal } from './SetBudgetModal';
import { fonts } from '@/theme/typography';
import type { CategorySpend } from '@/types/finance';
import { formatCompactVND } from '@/utils/currency';

import { CategoryDonut } from './CategoryDonut';

interface CategoryBreakdownProps {
  data: CategorySpend[];
}

/** "By category" section: donut + legend rows. */
export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const [budgetOpen, setBudgetOpen] = useState(false);

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>By category</Text>
        <Pressable onPress={() => setBudgetOpen(true)}>
          <Text style={styles.actionText}>Set budget</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
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
                      {formatCompactVND(slice.amount)} / {formatCompactVND(slice.budget)}
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

      {budgetOpen && (
        <SetBudgetModal
          visible={budgetOpen}
          onClose={() => setBudgetOpen(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  actionText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.purple,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
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
    backgroundColor: colors.border,
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
});
