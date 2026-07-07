import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon } from '@/theme/icons';
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
 * Hero balance card — premium card with total balance + income/spent mini cards.
 * Formatted with flat desaturated neon styling.
 */
export function FinanceHero({ totalBalance, income, spent }: FinanceHeroProps) {
  return (
    <View style={styles.card}>
      {/* Decorative ambient glowing orbs */}
      <View style={styles.glowBlobLeft} pointerEvents='none' />
      <View style={styles.glowBlobRight} pointerEvents='none' />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.label}>Tổng tài sản</Text>
          <View style={styles.chipBrand}>
            <Icon name='crown' size={11} color={colors.gold} />
            <Text style={styles.chipBrandText}>PREMIUM</Text>
          </View>
        </View>
        <Text
          style={styles.cardholder}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          NGUYEN MINH HIEU
        </Text>
        <Text style={styles.balance}>{formatVND(totalBalance)}</Text>

        <View style={styles.subRow}>
          {/* Income block (No label, just green arrow + amount) */}
          <View style={[styles.subCard, { borderLeftColor: colors.green }]}>
            <View style={styles.subHeader}>
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: tint(colors.green, '1A'),
                    borderColor: colors.green,
                  },
                ]}
              >
                <Icon name='arrow-bottom-left' size={13} color={colors.green} />
              </View>
              <Text
                style={[styles.subAmount, { color: colors.green }]}
                numberOfLines={1}
              >
                +{formatCompactVND(income)}
              </Text>
            </View>
          </View>

          {/* Expense block (No label, just red arrow + amount) */}
          <View style={[styles.subCard, { borderLeftColor: colors.red }]}>
            <View style={styles.subHeader}>
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: tint(colors.red, '1A'),
                    borderColor: colors.red,
                  },
                ]}
              >
                <Icon name='arrow-top-right' size={13} color={colors.red} />
              </View>
              <Text
                style={[styles.subAmount, { color: colors.text }]}
                numberOfLines={1}
              >
                -{formatCompactVND(spent)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    backgroundColor: 'rgba(18, 20, 28, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
    position: 'relative',
  },
  glowBlobLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: tint(colors.green, '0D'),
  },
  glowBlobRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: tint(colors.gold, '0A'),
  },
  content: {
    padding: 20,
    position: 'relative',
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  chipBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: tint(colors.gold, '15'),
    borderWidth: 1,
    borderColor: colors.goldDeep,
    borderRadius: radius.pill,
  },
  chipBrandText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: colors.gold,
    letterSpacing: 0.5,
  },
  balance: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
    letterSpacing: -0.5,
    opacity: 0.85,
  },
  cardholder: {
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 3,
  },
  subRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  subCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: radius.xl,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderLeftWidth: 3,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subAmount: {
    fontFamily: fonts.monoSemibold,
    fontSize: 16,
    flex: 1,
  },
});
