import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, glass, radius, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';

interface ListRowProps {
  /** Leading icon (rendered in a tinted chip) — or pass `leading` for custom. */
  icon?: IconName;
  iconColor?: string;
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  /** Trailing value text (e.g. a signed amount). */
  value?: string;
  valueColor?: string;
  /** Trailing element: a node, or 'chevron' for a nav affordance. */
  trailing?: ReactNode | 'chevron';
  onPress?: () => void;
  /** Render inside a glass card. Set false when used inside an existing panel. */
  card?: boolean;
}

/**
 * Standard list row — leading icon chip, title + subtitle, trailing value or
 * chevron (DESIGN_SPEC §3). The one row primitive for transactions, notes,
 * history and settings, so every list reads the same.
 */
export function ListRow({
  icon,
  iconColor = colors.blue,
  leading,
  title,
  subtitle,
  value,
  valueColor = colors.text,
  trailing,
  onPress,
  card = true,
}: ListRowProps) {
  const Wrapper: typeof Pressable | typeof View = onPress ? Pressable : View;
  return (
    <Wrapper onPress={onPress} style={[styles.row, card && styles.card]}>
      {leading ??
        (icon ? (
          <View style={[styles.chip, { backgroundColor: tint(iconColor, '1A') }]}>
            <Icon name={icon} size={20} color={iconColor} />
          </View>
        ) : null)}
      <View style={styles.mid}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {trailing === 'chevron' ? (
        <Icon name='chevron-right' size={20} color={colors.muted} />
      ) : (
        trailing ?? null
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  card: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: glass.fillStrong,
    borderWidth: 1,
    borderColor: glass.rim,
  },
  chip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mid: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  value: {
    fontFamily: fonts.displayBold,
    fontSize: 14,
  },
});
