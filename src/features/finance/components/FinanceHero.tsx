import { StyleSheet, Text, View } from 'react-native';

import { colors, glass } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { formatVND, formatCompactVND } from '@/utils/currency';

interface FinanceHeroProps {
  /** Total net worth / balance */
  totalBalance: number;
  /** Income for this period */
  income: number;
  /** Spent for this period */
  spent: number;
}

/**
 * Hero balance card — glass card with total balance + income/spent mini cards.
 * Matches the mockup "Tổng số dư" section.
 */
export function FinanceHero({ totalBalance, income, spent }: FinanceHeroProps) {
  return (
    <View style={styles.card}>
      {/* Decorative glow blob */}
      <View style={styles.glowBlob} pointerEvents="none" />

      <View style={styles.content}>
        <Text style={styles.label}>Tổng số dư</Text>
        <Text style={styles.balance}>{formatVND(totalBalance)}</Text>

        <View style={styles.subRow}>
          <View style={styles.subCard}>
            <View style={styles.subHeader}>
              <Text style={styles.subIcon}>↓</Text>
              <Text style={[styles.subLabel, { color: colors.secondaryFixedDim }]}>Thu nhập</Text>
            </View>
            <Text style={[styles.subAmount, { color: colors.secondaryFixedDim }]}>
              {formatCompactVND(income)}
            </Text>
          </View>

          <View style={styles.subCard}>
            <View style={styles.subHeader}>
              <Text style={styles.subIcon}>↑</Text>
              <Text style={[styles.subLabel, { color: colors.error }]}>Chi tiêu</Text>
            </View>
            <Text style={[styles.subAmount, { color: colors.error }]}>
              {formatCompactVND(spent)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
    overflow: 'hidden',
  },
  glowBlob: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
  },
  content: {
    padding: 24,
    position: 'relative',
    zIndex: 1,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 14,
    letterSpacing: 0.7,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  balance: {
    fontFamily: fonts.displayBold,
    fontSize: 36,
    lineHeight: 42,
    color: colors.primaryContainer,
    letterSpacing: -0.5,
  },
  subRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  subCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  subIcon: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  subLabel: {
    fontFamily: fonts.display,
    fontSize: 14,
    letterSpacing: 0.7,
  },
  subAmount: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    lineHeight: 28,
  },
});
