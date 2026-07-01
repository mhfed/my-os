import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { base3D, colors, elevation, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import { GameIconButton } from '@/components/game';
import { AnimatedCard } from '@/components/motion';

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
      <LinearGradient
        colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.headerGlow}
        pointerEvents='none'
      />
      <Text style={styles.title}>Finance</Text>

      <View style={styles.rightGroup}>
        {onExportCSV && (
          <GameIconButton
            icon='file-download'
            variant='purple'
            size={36}
            iconSize={17}
            onPress={onExportCSV}
          />
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
    overflow: 'hidden',
  },
  headerGlow: {
    ...StyleSheet.absoluteFillObject,
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
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(252,253,255,0.9)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.96)',
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
