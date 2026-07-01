import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { FILTERS } from '@/store/tasksStore';
import type { TaskFilter } from '@/types/task';

interface FilterPillsProps {
  active: TaskFilter;
  onSelect: (filter: TaskFilter) => void;
}

/** Horizontal row of filter pills; the active one is inverted (light bg). */
export function FilterPills({ active, onSelect }: FilterPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scrollView}
    >
      {FILTERS.map((filter) => {
        const isActive = filter === active;
        return (
          <Pressable
            key={filter}
            onPress={() => onSelect(filter)}
            style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
          >
            <Text
              style={[
                styles.label,
                isActive ? styles.labelActive : styles.labelInactive,
              ]}
            >
              {filter}
            </Text>
          </Pressable>
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
    paddingTop: 18,
    paddingHorizontal: 22,
    paddingBottom: 4,
    gap: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
  },
  pillActive: {
    backgroundColor: tint(colors.blue, '2A'),
    borderColor: colors.blue,
  },
  pillInactive: {
    backgroundColor: 'rgba(252,253,255,0.82)',
    borderColor: colors.border,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  labelActive: {
    color: colors.blue,
  },
  labelInactive: {
    color: colors.muted,
  },
});
