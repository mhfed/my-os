import { useMemo, useState } from 'react';
import { StyleSheet, Text, View, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import {
  colors,
  gradientFor,
  gradients,
  radius,
  resolveAccent,
  tint,
} from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
import { AnimatedCard, PressableScale } from '@/components/motion';
import { GameButton, IconBadge } from '@/components/game';
import type { CategorySpend } from '@/types/finance';
import { formatCompactVND } from '@/utils/currency';

import { SetBudgetModal } from './SetBudgetModal';

interface CategoryBreakdownProps {
  visible: boolean;
  onClose: () => void;
  data: CategorySpend[];
  period?: 'weekly' | 'monthly';
  periodKey?: string;
}

/**
 * "By category" section — a ranked list of chunky 3D jelly bars (longest =
 * most spent), each led by its glossy IconBadge. Bar length maps to the
 * category's share of total spend; over-budget categories tint red. Designed
 * to sit inside a GamePanel.
 */
export function CategoryBreakdown({
  visible,
  onClose,
  data,
  period = 'monthly',
  periodKey,
}: CategoryBreakdownProps) {
  const insets = useSafeAreaInsets();
  const [budgetOpen, setBudgetOpen] = useState(false);

  // Rank by spend, descending, so the biggest bar sits on top.
  const ranked = useMemo(
    () => [...data].sort((a, b) => b.amount - a.amount),
    [data],
  );
  const maxPct = ranked.length ? Math.max(...ranked.map((s) => s.pct)) : 0;

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='fullScreen'
      onRequestClose={onClose}
    >
      <View style={[styles.modalScreen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.04)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.gloss}
            pointerEvents='none'
          />

          {/* Header */}
          <View style={styles.modalHeader}>
            <PressableScale
              onPress={onClose}
              haptic='light'
              hitSlop={10}
              style={styles.back}
            >
              <Icon name='close' size={24} color={colors.text} />
            </PressableScale>
            <Text style={styles.modalTitle}>Phân bổ & Ngân sách</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
            {ranked.length === 0 ? (
              <View style={styles.empty}>
                <IconBadge icon='chart-donut' color={colors.teal} size={40} />
                <Text style={styles.emptyText}>Chưa có chi tiêu chu kỳ này</Text>
              </View>
            ) : (
              <View style={styles.list}>
                {ranked.map((slice, index) => {
                  const hasBudget = slice.budget > 0;
                  const isOver = hasBudget && slice.budgetUsed >= 1;
                  const isNear = hasBudget && !isOver && slice.budgetUsed >= 0.8;
                  const widthPct = maxPct > 0 ? (slice.pct / maxPct) * 100 : 0;
                  const fillColor = isOver
                    ? colors.red
                    : isNear
                      ? colors.gold
                      : slice.color;

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
                            <View
                              style={[
                                styles.barFill,
                                {
                                  width: `${Math.max(widthPct, 6)}%`,
                                  backgroundColor: fillColor,
                                },
                              ]}
                            />
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
              label='Cài đặt hạn mức ngân sách'
              variant='gem'
              size='sm'
              icon='cash-edit'
              fullWidth
              style={styles.budgetBtn}
              onPress={() => setBudgetOpen(true)}
            />
          </ScrollView>

          {budgetOpen && (
            <SetBudgetModal
              visible={budgetOpen}
              onClose={() => setBudgetOpen(false)}
              period={period}
              periodKey={periodKey}
            />
          )}
        </View>
      </Modal>
  );
}

const styles = StyleSheet.create({
  modalScreen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  modalSafeArea: {
    flex: 1,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gloss: {
    ...StyleSheet.absoluteFillObject,
    height: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
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
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
