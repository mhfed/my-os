import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, glass, radius, tint } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fonts } from '@/theme/typography';
import { PressableScale } from '@/components/motion';
import { FILTERS } from '@/store/tasksStore';
import type { TaskFilter } from '@/types/task';

interface FilterPillsProps {
  active: TaskFilter;
  onSelect: (filter: TaskFilter) => void;
  pendingCount: number;
  completedCount: number;
  overdueCount: number;
}

export function FilterPills({
  active,
  onSelect,
  pendingCount,
  completedCount,
  overdueCount,
}: FilterPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {FILTERS.map((filter) => {
        const isActive = filter === active;
        
        let label = 'Cần làm';
        let count = pendingCount;
        let domainColor: string = colors.blue;

        if (filter === 'Completed') {
          label = 'Đã xong';
          count = completedCount;
          domainColor = colors.green;
        } else if (filter === 'Overdue') {
          label = 'Quá hạn';
          count = overdueCount;
          domainColor = colors.red;
        }

        return (
          <PressableScale
            key={filter}
            onPress={() => onSelect(filter)}
            scaleTo={0.94}
            haptic='light'
            style={[
              styles.pill,
              isActive
                ? { backgroundColor: tint(domainColor, '20'), borderColor: domainColor }
                : styles.pillInactive,
            ]}
          >
            <View style={styles.pillContent}>
              <Text
                style={[
                  styles.label,
                  isActive ? { color: domainColor } : styles.labelInactive,
                ]}
              >
                {label}
              </Text>
            </View>

            {count > 0 && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: domainColor }
                ]}
              >
                <Text style={styles.badgeText}>{count}</Text>
              </View>
            )}
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    position: 'relative',
  },
  pillInactive: {
    backgroundColor: glass.fill,
    borderColor: glass.rim,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  labelInactive: {
    color: colors.muted,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: colors.screenBg,
  },
  badgeText: {
    fontFamily: fonts.monoSemibold,
    fontSize: 8,
    color: colors.white,
    lineHeight: 10,
  },
});
