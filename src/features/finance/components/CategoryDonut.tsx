import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { colors, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
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

/** Theme accent faces available for category slices — nearest-match target. */
const ACCENT_FACES: readonly string[] = [
  colors.purple,
  colors.teal,
  colors.green,
  colors.orange,
  colors.yellow,
  colors.red,
  colors.blue,
  colors.pink,
];

const ACCENT_DEEP: Record<string, string> = {
  [colors.purple]: colors.purpleDeep,
  [colors.teal]: colors.tealDeep,
  [colors.green]: colors.greenDeep,
  [colors.orange]: colors.orangeDeep,
  [colors.yellow]: colors.yellowDeep,
  [colors.red]: colors.redDeep,
  [colors.blue]: colors.blueDeep,
  [colors.pink]: colors.pinkDeep,
};

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

/**
 * Map an arbitrary category hex color to the nearest theme accent face, so any
 * 3D/deep pairing (or, here, chip fill) always resolves to a real design
 * token. Categories are created from the app's own palette swatches today,
 * so this is normally an exact match; the distance search is just a safe
 * fallback for any legacy/custom hex.
 */
export function resolveAccent(hex: string): { face: string; deep: string } {
  if (ACCENT_DEEP[hex]) return { face: hex, deep: ACCENT_DEEP[hex] };

  const rgb = hexToRgb(hex);
  if (!rgb) return { face: colors.purple, deep: colors.purpleDeep };

  let best = ACCENT_FACES[0];
  let bestDist = Infinity;
  for (const face of ACCENT_FACES) {
    const frgb = hexToRgb(face);
    if (!frgb) continue;
    const dist =
      (rgb[0] - frgb[0]) ** 2 +
      (rgb[1] - frgb[1]) ** 2 +
      (rgb[2] - frgb[2]) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = face;
    }
  }
  return { face: best, deep: ACCENT_DEEP[best] };
}

/**
 * Donut chart of category spend. Arcs are laid out exactly like the design:
 * a base track ring plus one colored arc per category, each with
 * strokeDasharray "len gap" and an accumulating negative dashoffset, rotated
 * -90° so the first slice begins at the top. Chart geometry/math is
 * untouched — only the surrounding chrome (center label) is themed.
 */
export function CategoryDonut({ data }: CategoryDonutProps) {
  let offset = 0;
  const total = data.reduce((sum, s) => sum + s.amount, 0);

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE} viewBox='0 0 42 42'>
        <G rotation={-90} originX={21} originY={21}>
          {/* base ring */}
          <Circle
            cx={21}
            cy={21}
            r={RADIUS}
            fill='none'
            stroke={colors.track}
            strokeWidth={STROKE}
          />
          {data.map((slice) => {
            const len = (slice.pct / 100) * CIRCUMFERENCE;
            const gap = CIRCUMFERENCE - len;
            const dashoffset = offset;
            offset -= len;
            const { face } = resolveAccent(slice.color);
            return (
              <Circle
                key={slice.categoryId}
                cx={21}
                cy={21}
                r={RADIUS}
                fill='none'
                stroke={face}
                strokeWidth={STROKE}
                strokeLinecap='round'
                strokeDasharray={`${len} ${gap}`}
                strokeDashoffset={dashoffset}
              />
            );
          })}
        </G>
      </Svg>

      <View style={styles.center} pointerEvents='none'>
        <Text style={styles.count} numberOfLines={1}>
          {total > 0 ? `${data.length}` : '0'}
        </Text>
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
    borderRadius: radius.pill,
    backgroundColor: colors.cardAlt,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.text,
    ...textShadow.emboss,
  },
  caption: {
    fontFamily: fonts.monoMedium,
    fontSize: 9,
    color: colors.muted,
    letterSpacing: 0.3,
  },
});
