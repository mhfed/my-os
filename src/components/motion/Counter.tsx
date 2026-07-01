import { useEffect } from 'react';
import { StyleSheet, type TextStyle, TextInput } from 'react-native';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { timing } from '@/theme/motion';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

/** Formats a raw number the same way on the JS thread (defaultValue) and the UI thread (animated worklet). */
function formatCount(
  raw: number,
  decimals: number,
  separator: string,
  prefix: string,
  suffix: string,
) {
  'worklet';
  const pow = 10 ** decimals;
  const rounded = Math.round(raw * pow) / pow;
  const neg = rounded < 0;
  const abs = Math.abs(rounded);
  const intPart = Math.floor(abs);
  let intStr = String(intPart);

  if (separator) {
    // Insert the group separator every three digits, right to left.
    let out = '';
    let count = 0;
    for (let i = intStr.length - 1; i >= 0; i--) {
      out = intStr[i] + out;
      count++;
      if (count % 3 === 0 && i > 0) out = separator + out;
    }
    intStr = out;
  }

  let text = intStr;
  if (decimals > 0) {
    const frac = Math.round((abs - intPart) * pow);
    text += '.' + String(frac).padStart(decimals, '0');
  }

  return `${prefix}${neg ? '-' : ''}${text}${suffix}`;
}

interface CounterProps {
  /** Target value to count up (or down) to. */
  value: number;
  /** Decimal places to display. Default 0. */
  decimals?: number;
  /** Group thousands with this separator (e.g. ',' or '.'). '' to disable. */
  separator?: string;
  prefix?: string;
  suffix?: string;
  /** Animation duration; defaults to the shared "reveal" timing. */
  duration?: number;
  style?: TextStyle | TextStyle[];
}

/**
 * Animated number that tweens from its previous value to `value`. Renders via
 * an un-editable TextInput so the digits update on the UI thread without
 * re-rendering React each frame. Pair with a mono font for a clean odometer.
 */
export function Counter({
  value,
  decimals = 0,
  separator = ',',
  prefix = '',
  suffix = '',
  duration,
  style,
}: CounterProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(value);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = value;
      return;
    }
    progress.value = withTiming(value, {
      ...timing.reveal,
      ...(duration ? { duration } : null),
    });
  }, [value, duration, reduceMotion, progress]);

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    return {
      text: formatCount(progress.value, decimals, separator, prefix, suffix),
    } as object;
  }, [decimals, separator, prefix, suffix]);

  return (
    <AnimatedTextInput
      editable={false}
      defaultValue={formatCount(value, decimals, separator, prefix, suffix)}
      animatedProps={animatedProps}
      style={[styles.base, style]}
      // The input is display-only; stop it from ever grabbing focus.
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 0,
  },
});
