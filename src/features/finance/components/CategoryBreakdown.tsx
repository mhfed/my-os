import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import type { CategorySpend } from '@/types/finance';

import { CategoryDonut } from './CategoryDonut';

interface CategoryBreakdownProps {
  data: CategorySpend[];
}

/** "By category" section: donut + legend rows. */
export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>By category</Text>

      <View style={styles.card}>
        <CategoryDonut data={data} />

        <View style={styles.legend}>
          {data.map((slice) => (
            <View key={slice.categoryId} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: slice.color }]} />
              <Text style={styles.name} numberOfLines={1}>
                {slice.name}
              </Text>
              <Text style={styles.pct}>{Math.round(slice.pct)}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
    marginBottom: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
  },
  legend: {
    flex: 1,
    gap: 9,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 3,
    marginRight: 10,
  },
  name: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text,
  },
  pct: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.muted,
  },
});
