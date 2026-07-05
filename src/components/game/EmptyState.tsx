import { StyleSheet, Text, View } from 'react-native';

import { colors, glass, radius, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { Icon, type IconName } from '@/theme/icons';
import { GameButton, type GameButtonVariant } from './GameButton';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  /** Accent for the icon halo. Default muted. */
  accent?: string;
  /** Optional primary action. */
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: GameButtonVariant;
}

/**
 * Designed zero-state — a soft glowing icon, a one-line headline and subline in
 * the user's voice, and an optional CTA (DESIGN_SPEC §6). No blank rectangles.
 */
export function EmptyState({
  icon,
  title,
  subtitle,
  accent = colors.muted,
  actionLabel,
  onAction,
  actionVariant = 'blue',
}: EmptyStateProps) {
  return (
    <View style={styles.root}>
      <View style={[styles.halo, { backgroundColor: tint(accent, '1F') }]}>
        <Icon name={icon} size={34} color={accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <GameButton
          label={actionLabel}
          variant={actionVariant}
          size='sm'
          onPress={onAction}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 8,
    borderRadius: radius.xl,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.rim,
  },
  halo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 260,
  },
  action: {
    marginTop: 10,
    alignSelf: 'center',
  },
});
