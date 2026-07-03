import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, glass, gradients, radius } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';

export type CurrencyKind = 'coins' | 'gems' | 'xp' | 'savings';

interface KindSpec {
  icon: IconName;
  iconColor: string;
}

const KINDS: Record<CurrencyKind, KindSpec> = {
  coins: { icon: 'star-four-points', iconColor: '#FFD700' },
  gems: { icon: 'diamond-stone', iconColor: '#00dbe9' },
  xp: { icon: 'lightning-bolt', iconColor: '#2ff801' },
  savings: { icon: 'treasure-chest', iconColor: '#FFD700' },
};

interface CurrencyChipProps {
  kind: CurrencyKind;
  value: number | string;
  onAdd?: () => void;
}

/**
 * Lumina HUD resource pill — exact stitch spec:
 * Dark glass with Gold (#FFD700) border.
 * ₫ symbol follows amount with non-breaking space: "500.000 ₫"
 */
export function CurrencyChip({ kind, value, onAdd }: CurrencyChipProps) {
  const spec = KINDS[kind];
  const isSavings = kind === 'savings';

  const formatted = typeof value === 'number'
    ? value.toLocaleString('vi-VN')
    : value;

  return (
    <View style={styles.wrap}>
      <View style={[styles.pill, isSavings && styles.pillSavings]}>
        {isSavings ? (
          <LinearGradient
            colors={[gradients.gold[0], gradients.gold[1]]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <BlurView intensity={12} tint='dark' style={StyleSheet.absoluteFill} />
        )}
        <View style={[styles.iconBubble, isSavings && { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
          <Icon name={spec.icon} size={14} color={spec.iconColor} />
        </View>
        <Text style={[styles.value, isSavings && styles.valueSavings]}>
          {formatted} ₫
        </Text>
      </View>
      {onAdd ? (
        <Pressable onPress={onAdd} hitSlop={6} style={styles.addWrap}>
          <LinearGradient
            colors={gradients.green}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.add}
          >
            <Icon name='plus' size={14} color={colors.white} />
          </LinearGradient>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 30,
    paddingLeft: 4,
    paddingRight: 12,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: '#FFD700', // Gold border per spec
    overflow: 'hidden',
    zIndex: 1,
  },
  pillSavings: {
    backgroundColor: 'transparent',
    borderColor: '#FFD700',
  },
  iconBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  value: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.white,
    letterSpacing: 0.3,
  },
  valueSavings: {
    color: colors.black,
  },
  addWrap: { marginLeft: -10 },
  add: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});
