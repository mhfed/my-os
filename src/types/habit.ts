/**
 * Habit domain — PRD §2.4 Habit Tracker. A habit's definition is static; its
 * per-day completion lives in `HabitLog` rows so streaks/percentages are
 * computed, not stored. Consumed by the Habits screen and Today.
 */

export interface Habit {
  id: string;
  userId?: string;
  name: string;
  sub?: string;
  /** MaterialCommunityIcons glyph name. */
  icon: string;
  /** Hex accent color. */
  color: string;
  sortOrder: number;
  createdAt: number;
}

/** One completion record. `date` is "YYYY-MM-DD" local. */
export interface HabitLog {
  habitId: string;
  date: string;
  done: boolean;
}

/** A habit joined with its derived stats, ready for the UI. */
export interface HabitView {
  id: string;
  name: string;
  sub?: string;
  icon: string;
  color: string;
  /** Consecutive days completed up to & including today. */
  streak: number;
  /** Completion % over the last 7 days (0–100). */
  pct: number;
  /** Last 7 days oldest→newest, 1 = done. Length 7. */
  pattern: number[];
  /** Whether today's log is done. */
  doneToday: boolean;
}

export interface NewHabitInput {
  name: string;
  sub?: string;
  icon: string;
  color: string;
}

export interface HabitsState {
  habits: Habit[];
  logs: HabitLog[];
  ready: boolean;

  init: () => Promise<void>;
  addHabit: (input: NewHabitInput) => Promise<Habit>;
  /** Flip today's completion for a habit (persists a log row). */
  toggleToday: (habitId: string) => Promise<void>;
  /** Flip a specific day's completion (weekly grid taps). */
  toggleLog: (habitId: string, date: string) => Promise<void>;

  // selectors
  views: () => HabitView[];
  /** Rounded average of all habits' 7-day completion %. */
  completion: () => number;
  doneTodayCount: () => number;
}
