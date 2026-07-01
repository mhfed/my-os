import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useSettingsStore, type SuperAppItemKey } from '@/store/settingsStore';

/**
 * Maps each pinned SuperAppItemKey to a ReactNode (widget).
 * WidgetGrid renders them in a 2-column flex-wrap layout.
 */
interface WidgetGridProps {
  renderWidget: (key: SuperAppItemKey, index: number) => ReactNode;
}

export function WidgetGrid({ renderWidget }: WidgetGridProps) {
  const pinnedItems = useSettingsStore((s) => s.pinnedItems);
  const settingsReady = useSettingsStore((s) => s.ready);

  if (!settingsReady) return null;

  const visible = pinnedItems.slice(0, 8);

  if (visible.length === 0) return null;

  return (
    <View style={styles.grid}>
      {visible.map((key, i) => (
        <View key={key} style={styles.gridItem}>
          {renderWidget(key, i)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
  },
});
