import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import type { CategorySpend } from '@/types/finance';

interface CategoryDonutProps {
  data: CategorySpend[];
}

const SIZE = 108;
const RADIUS = 15.9; // matches the design's r=15.9 on a 0 0 42 42 viewBox
const STROKE = 6;
// Circumference of r=15.9 ≈ 99.9, which the design treats as ~100 so that
// dash lengths map 1:1 to percentages ("38 62", "26 74", …).
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Donut chart of category spend. Arcs are laid out exactly like the design:
 * a base track ring plus one colored arc per category, each with
 * strokeDasharray "len gap" and an accumulating negative dashoffset, rotated
 * -90° so the first slice begins at the top.
 */
export function CategoryDonut({ data }: CategoryDonutProps) {
  let offset = 0;

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE} viewBox="0 0 42 42">
        <G rotation={-90} originX={21} originY={21}>
          {/* base ring */}
          <Circle
            cx={21}
            cy={21}
            r={RADIUS}
            fill="none"
            stroke={colors.track}
            strokeWidth={STROKE}
          />
          {data.map((slice) => {
            const len = (slice.pct / 100) * CIRCUMFERENCE;
            const gap = CIRCUMFERENCE - len;
            const dashoffset = offset;
            offset -= len;
            return (
              <Circle
                key={slice.categoryId}
                cx={21}
                cy={21}
                r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth={STROKE}
                strokeDasharray={`${len} ${gap}`}
                strokeDashoffset={dashoffset}
              />
            );
          })}
        </G>
      </Svg>

      <View style={styles.center} pointerEvents="none">
        <Text style={styles.count}>{data.length}</Text>
        <Text style={styles.caption}>categories</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontFamily: fonts.monoSemibold,
    fontSize: 18,
    color: colors.text,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.muted,
  },
});
