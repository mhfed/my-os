import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients, radius } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';

export type CurrencyKind = 'coins' | 'gems' | 'xp';

interface KindSpec {
  icon: IconName;
  iconColor: string;
}

const KINDS: Record<CurrencyKind, KindSpec> = {
  coins: { icon: 'star-four-points', iconColor: '#FFD978' },
  gems: { icon: 'diamond-stone', iconColor: '#72E4EA' },
  xp: { icon: 'lightning-bolt', iconColor: '#FFD978' },
};

interface CurrencyChipProps {
  kind: CurrencyKind;
  value: number | string;
  /** Show the trailing round "+" affordance (like the shop chips). */
  onAdd?: () => void;
}

/**
 * The HUD resource pill: a dark inset capsule holding a coloured icon + a bold
 * mono value, optionally capped by a round green "+" button. This is the
 * coins/gems readout from the reference's top bar.
 */
export function CurrencyChip({ kind, value, onAdd }: CurrencyChipProps) {
  const spec = KINDS[kind];

  return (
    <View style={styles.wrap}>
      <View style={styles.pill}>
        <View style={styles.iconBubble}>
          <Icon name={spec.icon} size={15} color={spec.iconColor} />
        </View>
        <Text style={styles.value}>{value}</Text>
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
    backgroundColor: 'rgba(24,32,51,0.82)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    zIndex: 1,
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
