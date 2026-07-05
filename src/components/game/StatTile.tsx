import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, glass, radius, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';

interface StatTileProps {
  icon: IconName;
  /** Domain accent — tints the icon chip and (optionally) the value. */
  accent: string;
  label: string;
  value: string | number;
  /** Color the value with the accent (e.g. currency). Default text color. */
  accentValue?: boolean;
  /** Small trailing glyph, e.g. 'arrow-top-right' or 'chevron-right'. */
  trailingIcon?: IconName;
  onPress?: () => void;
  /** Force a square tile (bento grid). Default true. */
  square?: boolean;
}

/**
 * Bento stat tile — 3D-ish icon chip top-left, optional nav glyph top-right,
 * label + big Quicksand value at the bottom (DESIGN_SPEC §3). The scannable
 * unit of the Today dashboard and metric rows.
 */
export function StatTile({
  icon,
  accent,
  label,
  value,
  accentValue = false,
  trailingIcon,
  onPress,
  square = true,
}: StatTileProps) {
  const Wrapper: typeof Pressable | typeof View = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={[styles.tile, square && styles.square]}
    >
      <View style={styles.top}>
        <View style={[styles.iconChip, { backgroundColor: tint(accent, '24') }]}>
          <Icon name={icon} size={22} color={accent} />
        </View>
        {trailingIcon ? (
          <Icon name={trailingIcon} size={16} color={colors.muted} />
        ) : null}
      </View>
      <View>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text
          style={[styles.value, accentValue && { color: accent }]}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.rim,
    padding: 16,
    justifyContent: 'space-between',
    gap: 16,
  },
  square: {
    aspectRatio: 1,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.muted,
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.text,
    marginTop: 2,
  },
});
