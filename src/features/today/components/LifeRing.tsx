import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Stop } from 'react-native-svg';

import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

const CIRCUMFERENCE = 527.8;

interface LifeRingProps {
  /** Overall today score, 0–100. */
  score: number;
  /** Tasks-driven legend value, 0–100. */
  focus: number;
  /** Habits-driven legend value, 0–100. */
  body: number;
  /** Journal/mood-driven legend value, 0–100. */
  mind: number;
}

export function LifeRing({ score, focus, body, mind }: LifeRingProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const dashOffset = CIRCUMFERENCE * (1 - clamped / 100);

  const legend = [
    { label: 'Focus', value: focus, color: colors.purple },
    { label: 'Body', value: body, color: colors.teal },
    { label: 'Mind', value: mind, color: colors.red },
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.ringWrap}>
        <Svg width={200} height={200}>
          <Defs>
            <LinearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.purple} />
              <Stop offset="1" stopColor={colors.teal} />
            </LinearGradient>
          </Defs>
          <Circle cx={100} cy={100} r={84} stroke={colors.track} strokeWidth={14} fill="none" />
          <G rotation={-90} originX={100} originY={100}>
            <Circle
              cx={100}
              cy={100}
              r={84}
              stroke="url(#ringGradient)"
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE}`}
              strokeDashoffset={dashOffset}
              fill="none"
            />
          </G>
        </Svg>
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.scoreLabel}>TODAY&apos;S SCORE</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {legend.map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.label} {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 34,
  },
  ringWrap: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontFamily: fonts.monoSemibold,
    fontSize: 62,
    lineHeight: 62,
    letterSpacing: -2,
    color: colors.text,
  },
  scoreLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 1.5,
    marginTop: 6,
  },
  legend: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 18,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
});
