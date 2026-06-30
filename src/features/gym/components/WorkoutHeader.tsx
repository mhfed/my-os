import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, tint } from '@/theme/colors';
import { Icon } from '@/theme/icons';
import { fonts } from '@/theme/typography';

/** Workout starts at 42:15 elapsed and ticks up live from there. */
const START_SECONDS = 42 * 60 + 15;

const pad = (n: number): string => String(n).padStart(2, '0');

/** HH:MM:SS, zero-padded. */
function formatElapsed(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

interface WorkoutHeaderProps {
  onBack: () => void;
  muscleGroup: string;
  progressLabel: string;
}

/** Live-pulsing red dot — Animated loop on opacity 0.3 ↔ 1. */
function LiveDot() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.liveDot, { opacity }]} />;
}

export function WorkoutHeader({
  onBack,
  muscleGroup,
  progressLabel,
}: WorkoutHeaderProps) {
  const [seconds, setSeconds] = useState(START_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.titleLeft}
        >
          <Icon name="chevron-left" size={22} color={colors.muted} />
          <Text style={styles.title}>Workout</Text>
        </Pressable>

        <View style={styles.livePill}>
          <LiveDot />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <View style={styles.timerCard}>
        <View style={styles.timerLeft}>
          <Text style={styles.timer}>{formatElapsed(seconds)}</Text>
          <Text style={styles.elapsedLabel}>Elapsed time</Text>
        </View>

        <View style={styles.timerRight}>
          <View style={styles.groupPill}>
            <Icon name="fire" size={15} color={colors.purple} />
            <Text style={styles.groupText}>{muscleGroup}</Text>
          </View>
          <Text style={styles.progressText}>{progressLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 6,
    paddingHorizontal: 22,
    paddingBottom: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    color: colors.text,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: tint(colors.red),
    borderWidth: 1,
    borderColor: '#FF6B6B40',
    borderRadius: 9,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.red,
  },
  liveText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.red,
  },
  timerCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerLeft: {
    flexShrink: 1,
  },
  timer: {
    fontFamily: fonts.monoSemibold,
    fontSize: 42,
    lineHeight: 42,
    letterSpacing: -1,
    color: colors.text,
  },
  elapsedLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginTop: 6,
  },
  timerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  groupPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: tint(colors.purple),
    borderWidth: 1,
    borderColor: '#7C6EF540',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  groupText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: '#B8B0FF',
  },
  progressText: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.muted,
  },
});
