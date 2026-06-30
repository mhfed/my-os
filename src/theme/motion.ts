/**
 * Shared motion language. Keep every animation in the app speaking the same
 * dialect: a small set of durations, one easing curve for "settling" and two
 * spring presets. Tuning these in one place re-times the whole app.
 *
 * Used with react-native-reanimated (`withTiming(x, timing.base)` etc.).
 */
import { Easing } from 'react-native-reanimated';

/** The house easing — quick out, gentle settle. */
export const easeOut = Easing.bezier(0.22, 1, 0.36, 1);

export const durations = {
  fast: 160,
  base: 280,
  slow: 460,
  /** Big celebratory reveals (ring draw, count-up). */
  reveal: 900,
} as const;

export const timing = {
  fast: { duration: durations.fast, easing: easeOut },
  base: { duration: durations.base, easing: easeOut },
  slow: { duration: durations.slow, easing: easeOut },
  reveal: { duration: durations.reveal, easing: easeOut },
} as const;

/** Spring presets. `bouncy` for tactile taps, `smooth` for entrances. */
export const springs = {
  smooth: { damping: 18, stiffness: 180, mass: 1 },
  bouncy: { damping: 10, stiffness: 220, mass: 0.8 },
  press: { damping: 15, stiffness: 400, mass: 0.6 },
} as const;

/** Per-item delay (ms) for a staggered list entrance, capped so long lists
 *  don't feel sluggish. */
export const staggerDelay = (index: number, step = 55, max = 8) =>
  Math.min(index, max) * step;
