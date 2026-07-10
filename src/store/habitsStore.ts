/**
 * Zustand store for the Habits feature — SQLite-backed. Habit definitions live
 * in `habits`; per-day completion lives in `habit_logs` (one row per
 * (habitId, date) with done=1). Implements the `HabitsState` contract from
 * `@/types/habit`.
 *
 * Streaks / percentages / weekly patterns are NOT stored — they are derived in
 * the `views()` selector from the log rows so they stay correct as days roll
 * over. A `habitId|date` Set is rebuilt on every state change for O(1) lookups.
 */

import { create } from 'zustand';

import { allRows, initDatabase, runSql, tableIsEmpty } from '@/db/database';
import { addDays, lastNDays, todayKey } from '@/utils/day';
import type {
  Habit,
  HabitLog,
  HabitsState,
  HabitView,
  NewHabitInput,
} from '@/types/habit';

/** RFC4122 id when available, otherwise a sufficiently-unique fallback. */
function newId(): string {
  try {
    const c = globalThis.crypto;
    if (c && typeof c.randomUUID === 'function') {
      return c.randomUUID();
    }
  } catch {
    // crypto unavailable in Hermes release builds — fall through
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Key into the done-log Set. */
const logKey = (habitId: string, date: string): string => `${habitId}|${date}`;

/** Build a Set of "habitId|date" for every done log — O(1) membership tests. */
function buildDoneSet(logs: HabitLog[]): Set<string> {
  const set = new Set<string>();
  for (const log of logs) {
    if (log.done) set.add(logKey(log.habitId, log.date));
  }
  return set;
}

// ---------------------------------------------------------------------------
// Row <-> domain mapping
// ---------------------------------------------------------------------------

interface HabitRow {
  id: string;
  userId: string | null;
  name: string;
  sub: string | null;
  icon: string;
  color: string;
  sortOrder: number;
  createdAt: number;
}

interface HabitLogRow {
  habitId: string;
  date: string;
  done: number;
}

function mapHabit(r: HabitRow): Habit {
  return {
    id: r.id,
    userId: r.userId ?? undefined,
    name: r.name,
    sub: r.sub ?? undefined,
    icon: r.icon,
    color: r.color,
    sortOrder: r.sortOrder,
    createdAt: r.createdAt,
  };
}

function mapLog(r: HabitLogRow): HabitLog {
  return {
    habitId: r.habitId,
    date: r.date,
    done: r.done === 1,
  };
}

// ---------------------------------------------------------------------------
// Seed (first run)
// ---------------------------------------------------------------------------

interface SeedHabit {
  id: string;
  name: string;
  sub: string;
  icon: string;
  color: string;
  /** Consecutive done days ending today — also the resulting streak. */
  targetStreak: number;
}

const SEED_HABITS: SeedHabit[] = [
  {
    id: 'water',
    name: 'Drink water',
    sub: '8 glasses / day',
    icon: 'water',
    color: '#4ECDC4',
    targetStreak: 23,
  },
  {
    id: 'read',
    name: 'Read',
    sub: '30 min',
    icon: 'book-open-variant',
    color: '#7C6EF5',
    targetStreak: 12,
  },
  {
    id: 'meditate',
    name: 'Meditate',
    sub: '10 min morning',
    icon: 'flower',
    color: '#F5B16E',
    targetStreak: 8,
  },
  {
    id: 'workout',
    name: 'Workout',
    sub: '5x / week',
    icon: 'dumbbell',
    color: '#FF6B6B',
    targetStreak: 4,
  },
  {
    id: 'screen',
    name: 'No late screen',
    sub: 'before 23:00',
    icon: 'moon-waning-crescent',
    color: '#7C6EF5',
    targetStreak: 6,
  },
];

async function seed(): Promise<void> {
  const now = Date.now();
  const today = todayKey();

  for (let i = 0; i < SEED_HABITS.length; i += 1) {
    const h = SEED_HABITS[i];
    await runSql(
      `INSERT INTO habits (id, userId, name, sub, icon, color, sortOrder, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [h.id, null, h.name, h.sub, h.icon, h.color, i, now],
    );

    // One done log per day for the last `targetStreak` consecutive days
    // ending today.
    for (let k = 0; k < h.targetStreak; k += 1) {
      const date = addDays(today, -k);
      await runSql(
        `INSERT OR REPLACE INTO habit_logs (habitId, date, done)
         VALUES (?, ?, 1);`,
        [h.id, date],
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useHabitsStore = create<HabitsState>()((set, get) => ({
  habits: [],
  logs: [],
  ready: false,

  // ----- lifecycle -----
  init: async () => {
    if (get().ready) return; // idempotent
    await initDatabase();
    if (await tableIsEmpty('habits')) {
      await seed();
    }
    const habitRows = await allRows<HabitRow>(
      'SELECT * FROM habits ORDER BY sortOrder ASC;',
    );
    const logRows = await allRows<HabitLogRow>('SELECT * FROM habit_logs;');
    set({
      habits: habitRows.map(mapHabit),
      logs: logRows.map(mapLog),
      ready: true,
    });
  },

  addHabit: async (input: NewHabitInput) => {
    const now = Date.now();
    const maxOrder = get().habits.reduce(
      (max, h) => Math.max(max, h.sortOrder),
      -1,
    );
    const habit: Habit = {
      id: newId(),
      name: input.name,
      sub: input.sub,
      icon: input.icon,
      color: input.color,
      sortOrder: maxOrder + 1,
      createdAt: now,
    };

    await runSql(
      `INSERT INTO habits (id, userId, name, sub, icon, color, sortOrder, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        habit.id,
        null,
        habit.name,
        habit.sub ?? null,
        habit.icon,
        habit.color,
        habit.sortOrder,
        habit.createdAt,
      ],
    );

    set((s) => ({ habits: [...s.habits, habit] }));
    return habit;
  },

  toggleToday: async (habitId: string) => {
    await get().toggleLog(habitId, todayKey());
  },

  toggleLog: async (habitId: string, date: string) => {
    const isDone = get().logs.some(
      (l) => l.habitId === habitId && l.date === date && l.done,
    );

    if (isDone) {
      // Remove the completion for that day.
      await runSql('DELETE FROM habit_logs WHERE habitId = ? AND date = ?;', [
        habitId,
        date,
      ]);
      set((s) => ({
        logs: s.logs.filter((l) => !(l.habitId === habitId && l.date === date)),
      }));
    } else {
      // Mark the day done (upsert).
      await runSql(
        `INSERT OR REPLACE INTO habit_logs (habitId, date, done)
         VALUES (?, ?, 1);`,
        [habitId, date],
      );
      set((s) => {
        const others = s.logs.filter(
          (l) => !(l.habitId === habitId && l.date === date),
        );
        return { logs: [...others, { habitId, date, done: true }] };
      });
    }
  },

  // ----- selectors -----
  views: (): HabitView[] => {
    const { habits, logs } = get();
    const done = buildDoneSet(logs);
    const window = lastNDays(7);
    const today = todayKey();

    return habits.map((h) => {
      // Streak: consecutive done days ending today (walk backwards).
      let streak = 0;
      let cursor = today;
      while (done.has(logKey(h.id, cursor))) {
        streak += 1;
        cursor = addDays(cursor, -1);
      }

      // Pattern: 7-day rolling window, oldest → newest.
      const pattern: number[] = window.map((d) =>
        done.has(logKey(h.id, d)) ? 1 : 0,
      );
      const doneCount = pattern.reduce((sum, v) => sum + v, 0);
      const pct = Math.round((doneCount / 7) * 100);

      return {
        id: h.id,
        name: h.name,
        sub: h.sub,
        icon: h.icon,
        color: h.color,
        streak,
        pct,
        pattern,
        doneToday: done.has(logKey(h.id, today)),
      };
    });
  },

  completion: (): number => {
    const views = get().views();
    if (views.length === 0) return 0;
    const total = views.reduce((sum, v) => sum + v.pct, 0);
    return Math.round(total / views.length);
  },

  doneTodayCount: (): number =>
    get()
      .views()
      .filter((v) => v.doneToday).length,
}));
