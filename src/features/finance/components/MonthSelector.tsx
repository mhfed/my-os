import { StyleSheet, Text, View } from 'react-native';

import { base3D, colors, elevation, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { GameIconButton } from '@/components/game';
import { AnimatedCard, PressableScale } from '@/components/motion';

interface MonthSelectorProps {
  /** Pre-formatted month label, e.g. "June 2025". */
  month: string;
  onPrev: () => void;
  onNext: () => void;
  onManageRecurring?: () => void;
  onExportCSV?: () => void;
}

/** Screen header: "Finance" title + the month stepper control. */
export function MonthSelector({
  month,
  onPrev,
  onNext,
  onManageRecurring,
  onExportCSV,
}: MonthSelectorProps) {
  return (
    <AnimatedCard index={0} style={styles.header}>
      <Text style={styles.title}>Finance</Text>

      <View style={styles.rightGroup}>
        {onExportCSV && (
          <PressableScale onPress={onExportCSV} hitSlop={8} haptic='light'>
            <View style={styles.actionPill}>
              <Text style={styles.actionText}>Export</Text>
            </View>
          </PressableScale>
        )}

        {onManageRecurring && (
          <GameIconButton
            icon='calendar-sync'
            variant='gold'
            size={36}
            iconSize={17}
            onPress={onManageRecurring}
          />
        )}

        <View style={styles.stepper}>
          <GameIconButton
            icon='chevron-left'
            variant='purple'
            size={36}
            iconSize={18}
            onPress={onPrev}
            accessibilityRole='button'
            accessibilityLabel='Previous month'
          />

          <Text style={styles.month} numberOfLines={1}>
            {month}
          </Text>

          <GameIconButton
            icon='chevron-right'
            variant='purple'
            size={36}
            iconSize={18}
            onPress={onNext}
            accessibilityRole='button'
            accessibilityLabel='Next month'
          />
        </View>
      </View>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.text,
    letterSpacing: -0.4,
    ...textShadow.emboss,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionPill: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.card,
  },
  actionText: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
    color: colors.text,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 6,
    ...elevation.card,
  },
  month: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.text,
    paddingHorizontal: 6,
    ...textShadow.emboss,
  },
});
