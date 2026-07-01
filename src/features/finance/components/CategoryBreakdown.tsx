import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { base3D, colors, gradients, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { AnimatedCard, PressableScale } from '@/components/motion';
import { GameButton } from '@/components/game';
import type { CategorySpend } from '@/types/finance';
import { formatCompactVND } from '@/utils/currency';

import { CategoryDonut, resolveAccent } from './CategoryDonut';
import { SetBudgetModal } from './SetBudgetModal';

interface CategoryBreakdownProps {
  data: CategorySpend[];
}

/** Gradient (2-stop) matched to a resolved theme accent face for bar fills. */
function gradientForFace(face: string): readonly [string, string] {
  switch (face) {
    case colors.green:
      return gradients.green;
    case colors.purple:
      return gradients.purple;
    case colors.orange:
      return gradients.gold;
    case colors.yellow:
      return gradients.gold;
    case colors.teal:
      return gradients.gem;
    case colors.red:
      return gradients.red;
    case colors.blue:
      return gradients.blue;
    case colors.pink:
      return gradients.pink;
    default:
      return gradients.gem;
  }
}

/** "By category" section: donut + legend rows. Designed to sit inside a GamePanel. */
export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const [budgetOpen, setBudgetOpen] = useState(false);

  return (
    <>
      <View style={styles.donutRow}>
        <CategoryDonut data={data} />

        <View style={styles.legend}>
          {data.map((slice, index) => {
            const { face, deep } = resolveAccent(slice.color);
            const hasBudget = slice.budget > 0;
            const isOver = slice.budgetUsed >= 1;
            const barFillPct = Math.min(1, slice.budgetUsed);
            const barGradient = isOver
              ? gradients.red
              : slice.budgetUsed >= 0.8
                ? gradients.gold
                : gradientForFace(face);

            return (
              <AnimatedCard key={slice.categoryId} index={index}>
                <View style={styles.legendRow}>
                  <View style={[styles.iconBadgeWrap, base3D(deep, 2)]}>
                    <View style={[styles.iconBadge, { backgroundColor: face }]}>
                      <Icon
                        name={slice.icon as any}
                        size={13}
                        color={colors.white}
                      />
                    </View>
                  </View>

                  <View style={styles.legendBody}>
                    <View style={styles.legendTopLine}>
                      <Text style={styles.name} numberOfLines={1}>
                        {slice.name}
                      </Text>
                      {!hasBudget ? (
                        <Text style={styles.pct}>{Math.round(slice.pct)}%</Text>
                      ) : null}
                    </View>

                    {hasBudget ? (
                      <>
                        <View style={styles.barTrack}>
                          <LinearGradient
                            colors={barGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                              styles.barFill,
                              { width: `${barFillPct * 100}%` },
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
                          {isOver ? '⚠️ ' : ''}
                          {formatCompactVND(slice.amount)} /{' '}
                          {formatCompactVND(slice.budget)}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.amountText} numberOfLines={1}>
                        {formatCompactVND(slice.amount)}
                      </Text>
                    )}
                  </View>
                </View>
              </AnimatedCard>
            );
          })}
        </View>
      </View>

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
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  legend: {
    flex: 1,
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadgeWrap: {
    borderRadius: radius.sm,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  legendBody: {
    flex: 1,
    gap: 4,
  },
  legendTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  pct: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.muted,
  },
  barTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  budgetText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
  },
  amountText: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.muted,
  },
  budgetBtn: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
});
