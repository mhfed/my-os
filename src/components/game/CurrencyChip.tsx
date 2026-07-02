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
  coins: { icon: 'star-four-points', iconColor: '#FFD978' },
  gems: { icon: 'diamond-stone', iconColor: '#72E4EA' },
  xp: { icon: 'lightning-bolt', iconColor: '#FFD978' },
  savings: { icon: 'treasure-chest', iconColor: '#FFD700' }, // savings: gold chest
};

interface CurrencyChipProps {
  kind: CurrencyKind;
  value: number | string;
  onAdd?: () => void;
}

/**
 * HUD resource pill. `savings` kind renders a gold gradient background
 * (instead of dark glass) to visually distinguish it as a premium resource.
 */
export function CurrencyChip({ kind, value, onAdd }: CurrencyChipProps) {
  const spec = KINDS[kind];
  const isSavings = kind === 'savings';

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
          <BlurView intensity={22} tint='dark' style={StyleSheet.absoluteFill} />
        )}
        <View style={[styles.iconBubble, isSavings && { backgroundColor: 'rgba(0,0,0,0.15)' }]}>
          <Icon name={spec.icon} size={15} color={spec.iconColor} />
        </View>
        <Text style={[styles.value, isSavings && styles.valueSavings]}>{value}</Text>
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
    backgroundColor: glass.dark,
    borderWidth: 1.5,
    borderColor: glass.darkRim,
    overflow: 'hidden',
    zIndex: 1,
  },
  pillSavings: {
    backgroundColor: 'transparent',
    borderColor: colors.goldDeep,
  },
  iconBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  value: {
    fontFamily: fonts.displayExtra,
    fontSize: 14,
    color: colors.white,
    letterSpacing: 0.3,
  },
  valueSavings: {
    color: '#3E2C15',
  },
  addWrap: {
    marginLeft: -10,
  },
  add: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
