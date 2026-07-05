import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, glass, radius, tint } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { FILTERS } from '@/store/tasksStore';
import type { TaskFilter } from '@/types/task';

interface FilterPillsProps {
  active: TaskFilter;
  onSelect: (filter: TaskFilter) => void;
}

/** Horizontal row of filter pills; the active one uses tasks domain blue. */
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
            style={[
              styles.pill,
              isActive ? styles.pillActive : styles.pillInactive,
            ]}
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
    paddingHorizontal: 22,
    paddingVertical: 14,
    gap: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: tint(colors.blue, '20'),
    borderColor: colors.blue,
  },
  pillInactive: {
    backgroundColor: glass.fill,
    borderColor: glass.rim,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 13,
  },
  labelActive: {
    color: colors.blue,
  },
  labelInactive: {
    color: colors.muted,
  },
});
