import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { base3D, colors, gradients, radius } from '@/theme/colors';
import { fonts, textShadow } from '@/theme/typography';
import type { MonthlyOverview } from '@/types/finance';
import { formatCompactVND } from '@/utils/currency';

interface MonthlyTrendChartProps {
  data: MonthlyOverview[];
}

const CHART_H = 100;
const BAR_W = 13;
const BAR_GAP = 5;
const GROUP_GAP = 12;
const GROUP_W = BAR_W * 2 + BAR_GAP;
const LABEL_H = 20;
const RADIUS = 4;

function shortMonth(monthKey: string): string {
  const [, m] = monthKey.split('-');
  const names = [
    'T1',
    'T2',
    'T3',
    'T4',
    'T5',
    'T6',
    'T7',
    'T8',
    'T9',
    'T10',
    'T11',
    'T12',
  ];
  return names[parseInt(m, 10) - 1] ?? m;
}

/** Monthly trend chart - designed to sit inside a GamePanel */
export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const [tooltip, setTooltip] = useState<{
    month: string;
    income: number;
    spent: number;
  } | null>(null);

  if (data.length === 0) return null;

  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.spent]), 1);

  const totalW = data.length * (GROUP_W + GROUP_GAP) - GROUP_GAP;
  const svgH = CHART_H + LABEL_H;

  function barH(val: number): number {
    return Math.max(3, (val / maxVal) * CHART_H);
  }

  return (
    <>
      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.teal }]} />
          <Text style={styles.legendText}>Thu nhập</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.red }]} />
          <Text style={styles.legendText}>Chi tiêu</Text>
        </View>
      </View>

      {/* Tooltip */}
      {tooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipMonth}>{tooltip.month}</Text>
          <View style={styles.tooltipRow}>
            <Text style={[styles.tooltipVal, { color: colors.teal }]}>
              ↙ {formatCompactVND(tooltip.income)}
            </Text>
            <Text style={[styles.tooltipVal, { color: colors.red }]}>
              ↗ {formatCompactVND(tooltip.spent)}
            </Text>
          </View>
        </View>
      )}

      {/* Chart */}
      <View style={styles.chartWrap}>
        <Svg width={totalW} height={svgH}>
          <Defs>
            <LinearGradient id='incomeFill' x1='0' y1='0' x2='0' y2='1'>
              <Stop offset='0' stopColor={gradients.gold[0]} stopOpacity={1} />
              <Stop offset='1' stopColor={gradients.gold[1]} stopOpacity={1} />
            </LinearGradient>
            <LinearGradient id='incomeFillMuted' x1='0' y1='0' x2='0' y2='1'>
              <Stop
                offset='0'
                stopColor={gradients.gold[0]}
                stopOpacity={0.5}
              />
              <Stop
                offset='1'
                stopColor={gradients.gold[1]}
                stopOpacity={0.5}
              />
            </LinearGradient>
            <LinearGradient id='spentFill' x1='0' y1='0' x2='0' y2='1'>
              <Stop offset='0' stopColor={gradients.red[0]} stopOpacity={1} />
              <Stop offset='1' stopColor={gradients.red[1]} stopOpacity={1} />
            </LinearGradient>
            <LinearGradient id='spentFillMuted' x1='0' y1='0' x2='0' y2='1'>
              <Stop
                offset='0'
                stopColor={gradients.red[0]}
                stopOpacity={0.5}
              />
              <Stop
                offset='1'
                stopColor={gradients.red[1]}
                stopOpacity={0.5}
              />
            </LinearGradient>
          </Defs>

          {data.map((d, i) => {
            const x = i * (GROUP_W + GROUP_GAP);
            const incH = barH(d.income);
            const expH = barH(d.spent);
            const isActive = tooltip?.month === shortMonth(d.month);

            return (
              <Pressable
                key={d.month}
                onPress={() =>
                  setTooltip(
                    isActive
                      ? null
                      : {
                          month: shortMonth(d.month),
                          income: d.income,
                          spent: d.spent,
                        },
                  )
                }
              >
                {/* Income bar */}
                <Rect
                  x={x}
                  y={CHART_H - incH}
                  width={BAR_W}
                  height={incH}
                  rx={RADIUS}
                  fill={isActive ? 'url(#incomeFill)' : 'url(#incomeFillMuted)'}
                />
                {/* Expense bar */}
                <Rect
                  x={x + BAR_W + BAR_GAP}
                  y={CHART_H - expH}
                  width={BAR_W}
                  height={expH}
                  rx={RADIUS}
                  fill={isActive ? 'url(#spentFill)' : 'url(#spentFillMuted)'}
                />
              </Pressable>
            );
          })}
        </Svg>

        {/* Month labels */}
        <View style={[styles.labels, { width: totalW }]}>
          {data.map((d) => (
            <Text key={d.month} style={styles.monthLabel}>
              {shortMonth(d.month)}
            </Text>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
  },
  tooltip: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    alignItems: 'center',
    ...base3D(colors.tealDeep, 2),
  },
  tooltipMonth: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.text,
    marginBottom: 4,
    ...textShadow.emboss,
  },
  tooltipRow: {
    flexDirection: 'row',
    gap: 16,
  },
  tooltipVal: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
  },
  chartWrap: {
    alignItems: 'flex-start',
    gap: 4,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthLabel: {
    width: GROUP_W + GROUP_GAP,
    textAlign: 'center',
    fontFamily: fonts.monoRegular,
    fontSize: 10,
    color: colors.muted,
  },
});
