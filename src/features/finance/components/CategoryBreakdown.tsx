import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import {
  colors,
  gradientFor,
  gradients,
  radius,
  resolveAccent,
} from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { AnimatedCard } from '@/components/motion';
import { GameButton, IconBadge } from '@/components/game';
import type { CategorySpend } from '@/types/finance';
import { formatCompactVND } from '@/utils/currency';

import { SetBudgetModal } from './SetBudgetModal';

interface CategoryBreakdownProps {
  data: CategorySpend[];
}

/**
 * "By category" section — a ranked list of chunky 3D jelly bars (longest =
 * most spent), each led by its glossy IconBadge. Bar length maps to the
 * category's share of total spend; over-budget categories tint red. Designed
 * to sit inside a GamePanel.
 */
export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const [budgetOpen, setBudgetOpen] = useState(false);

  // Rank by spend, descending, so the biggest bar sits on top.
  const ranked = useMemo(
    () => [...data].sort((a, b) => b.amount - a.amount),
    [data],
  );
  const maxPct = ranked.length ? Math.max(...ranked.map((s) => s.pct)) : 0;

  return (
    <>
      {ranked.length === 0 ? (
        <View style={styles.empty}>
          <IconBadge icon='chart-donut' color={colors.teal} size={40} />
          <Text style={styles.emptyText}>Chưa có chi tiêu tháng này</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {ranked.map((slice, index) => {
            const { face } = resolveAccent(slice.color);
            const hasBudget = slice.budget > 0;
            const isOver = hasBudget && slice.budgetUsed >= 1;
            const isNear = hasBudget && !isOver && slice.budgetUsed >= 0.8;
            // Bar length = share of total spend, normalised so the top
            // category fills the track. Keep a minimum nub for tiny slices.
            const widthPct = maxPct > 0 ? (slice.pct / maxPct) * 100 : 0;
            const barGradient = isOver
              ? gradients.red
              : isNear
                ? gradients.gold
                : gradientFor(face);

            return (
              <AnimatedCard key={slice.categoryId} index={index}>
                <View style={styles.row}>
                  <IconBadge
                    icon={slice.icon as never}
                    color={slice.color}
                    size={34}
                    iconSize={17}
                  />

                  <View style={styles.body}>
                    <View style={styles.topLine}>
                      <Text style={styles.name} numberOfLines={1}>
                        {slice.name}
                      </Text>
                      <Text style={styles.amount} numberOfLines={1}>
                        {formatCompactVND(slice.amount)}
                      </Text>
                      <Text style={styles.pct}>{Math.round(slice.pct)}%</Text>
                    </View>

                    <View style={styles.barTrack}>
                      <LinearGradient
                        colors={barGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                          styles.barFill,
                          { width: `${Math.max(widthPct, 6)}%` },
                        ]}
                      >
                        <LinearGradient
                          colors={gradients.gloss}
                          start={{ x: 0.5, y: 0 }}
                          end={{ x: 0.5, y: 1 }}
                          style={styles.barGloss}
                          pointerEvents='none'
                        />
                      </LinearGradient>
                    </View>

                    {hasBudget ? (
                      <Text
                        style={[
                          styles.budgetText,
                          { color: isOver ? colors.red : colors.muted },
                        ]}
                        numberOfLines={1}
                      >
                        {isOver ? '⚠️ ' : isNear ? '⚡ ' : ''}
                        {formatCompactVND(slice.amount)} /{' '}
                        {formatCompactVND(slice.budget)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </AnimatedCard>
            );
          })}
        </View>
      )}

      <GameButton
        label='Set budgets'
        variant='gem'
        size='sm'
        icon='cash-edit'
        fullWidth
        style={styles.budgetBtn}
        onPress={() => setBudgetOpen(true)}
      />

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
  list: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  body: {
    flex: 1,
    gap: 5,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  amount: {
    fontFamily: fonts.monoSemibold,
    fontSize: 13,
    color: colors.text,
  },
  pct: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    color: colors.muted,
    minWidth: 30,
    textAlign: 'right',
  },
  barTrack: {
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.track,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.pill,
    minWidth: 14,
  },
  barGloss: {
    position: 'absolute',
    top: 1,
    left: 2,
    right: 2,
    height: '48%',
    borderRadius: radius.pill,
  },
  budgetText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
  },
  empty: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  budgetBtn: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
});
