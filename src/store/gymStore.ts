/**
 * Zustand store for the Gym Tracker (active Workout) screen — the single source
 * of truth for the in-progress session. Holds the already-`logged` exercises
 * and the one currently `active` exercise. Mutations are intentionally minimal
 * (an "add set" simply appends a placeholder set to the active exercise).
 */

import { create } from 'zustand';

export interface ExerciseSet {
  weight: string;
  reps: string;
}

export interface LoggedExercise {
  name: string;
  pr: boolean;
  sets: ExerciseSet[];
}

export interface ActiveExercise {
  name: string;
  rest: string;
  sets: ExerciseSet[];
  nextSetLabel: string;
}

const SEED_LOGGED: LoggedExercise[] = [
  {
    name: 'Bench Press',
    pr: true,
    sets: [
      { weight: '60kg', reps: '12' },
      { weight: '70kg', reps: '10' },
      { weight: '80kg', reps: '6' },
    ],
  },
  {
    name: 'Incline DB Press',
    pr: false,
    sets: [
      { weight: '26kg', reps: '12' },
      { weight: '28kg', reps: '10' },
      { weight: '28kg', reps: '9' },
    ],
  },
  {
    name: 'Cable Fly',
    pr: false,
    sets: [
      { weight: '15kg', reps: '15' },
      { weight: '17kg', reps: '12' },
      { weight: '17kg', reps: '12' },
    ],
  },
];

const SEED_ACTIVE: ActiveExercise = {
  name: 'Tricep Pushdown',
  rest: '01:23',
  sets: [
    { weight: '25kg', reps: '12 reps' },
    { weight: '25kg', reps: '10 reps' },
  ],
  nextSetLabel: 'Set 3',
};

export interface WorkoutHistory {
  id: string;
  name: string;
  startTime: number;
  endTime: number | null;
  exercises: LoggedExercise[];
}

interface GymState {
  history: WorkoutHistory[];
  isWorkoutActive: boolean;
  workoutName: string;
  workoutStartTime: number;
  logged: LoggedExercise[];
  active: ActiveExercise | null;

  ready: boolean;
  init: () => Promise<void>;

  startWorkout: (name: string) => void;
  finishWorkout: () => Promise<void>;
  cancelWorkout: () => void;

  /** Moves current active to logged, starts a new active exercise. */
  addExercise: (name: string) => void;

  /** Append a placeholder set to the active exercise. */
  addSet: () => void;
  updateSet: (index: number, field: 'weight' | 'reps', value: string) => void;
}

/** Generate a stable id */
function newId(): string {
  try {
    const c = globalThis.crypto;
    if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  } catch {
    // crypto unavailable in Hermes release builds — fall through
  }
  return `gym-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

let initPromise: Promise<void> | null = null;

export const useGymStore = create<GymState>((set, get) => ({
  history: [],
  isWorkoutActive: false,
  workoutName: 'Chest & Triceps',
  workoutStartTime: 0,
  logged: [],
  active: null,
  ready: false,

  init: async () => {
    if (get().ready) return;
    if (initPromise) return initPromise;
    initPromise = (async () => {
      const { allRows } = await import('@/db/database');

      const workouts = await allRows<any>(
        'SELECT * FROM workouts ORDER BY startTime DESC;',
      );
      const wIds = workouts.map((w) => w.id).join("','");

      let exercisesMap: Record<string, any[]> = {};
      let setsMap: Record<string, any[]> = {};

      if (wIds) {
        const exercises = await allRows<any>(
          `SELECT * FROM workout_exercises WHERE workoutId IN ('${wIds}') ORDER BY orderIndex ASC;`,
        );
        const eIds = exercises.map((e) => e.id).join("','");
        if (eIds) {
          const sets = await allRows<any>(
            `SELECT * FROM workout_sets WHERE exerciseId IN ('${eIds}') ORDER BY orderIndex ASC;`,
          );
          sets.forEach((s) => {
            if (!setsMap[s.exerciseId]) setsMap[s.exerciseId] = [];
            setsMap[s.exerciseId].push(s);
          });
        }
        exercises.forEach((e) => {
          if (!exercisesMap[e.workoutId]) exercisesMap[e.workoutId] = [];
          exercisesMap[e.workoutId].push({
            ...e,
            sets: setsMap[e.id] || [],
          });
        });
      }

      const history: WorkoutHistory[] = workouts.map((w) => ({
        id: w.id,
        name: w.name,
        startTime: w.startTime,
        endTime: w.endTime,
        exercises: (exercisesMap[w.id] || []).map((e) => ({
          name: e.name,
          pr: e.pr === 1,
          sets: e.sets.map((s: any) => ({ weight: s.weight, reps: s.reps })),
        })),
      }));

      set({ history, ready: true });
    })();
    return initPromise;
  },

  startWorkout: (name) => {
    set({
      isWorkoutActive: true,
      workoutName: name,
      workoutStartTime: Date.now(),
      logged: [],
      active: null,
    });
  },

  finishWorkout: async () => {
    const { workoutName, workoutStartTime, logged, active } = get();
    const finalLogged = [...logged];

    if (active && active.sets.length > 0) {
      finalLogged.push({
        name: active.name,
        pr: false,
        sets: active.sets,
      });
    }

    if (finalLogged.length === 0) {
      set({ isWorkoutActive: false, logged: [], active: null });
      return;
    }

    const { runSql } = await import('@/db/database');
    const workoutId = newId();
    const endTime = Date.now();

    await runSql(
      'INSERT INTO workouts (id, userId, name, startTime, endTime, createdAt) VALUES (?, ?, ?, ?, ?, ?);',
      [workoutId, null, workoutName, workoutStartTime, endTime, endTime],
    );

    for (let i = 0; i < finalLogged.length; i++) {
      const ex = finalLogged[i];
      const exId = newId();
      await runSql(
        'INSERT INTO workout_exercises (id, workoutId, name, orderIndex, pr) VALUES (?, ?, ?, ?, ?);',
        [exId, workoutId, ex.name, i, ex.pr ? 1 : 0],
      );
      for (let j = 0; j < ex.sets.length; j++) {
        const s = ex.sets[j];
        await runSql(
          'INSERT INTO workout_sets (id, exerciseId, weight, reps, orderIndex) VALUES (?, ?, ?, ?, ?);',
          [newId(), exId, s.weight, s.reps, j],
        );
      }
    }

    const newHistoryItem: WorkoutHistory = {
      id: workoutId,
      name: workoutName,
      startTime: workoutStartTime,
      endTime,
      exercises: finalLogged,
    };

    set((state) => ({
      history: [newHistoryItem, ...state.history],
      isWorkoutActive: false,
      logged: [],
      active: null,
    }));
  },

  cancelWorkout: () => {
    set({ isWorkoutActive: false, logged: [], active: null });
  },

  addExercise: (name) => {
    set((state) => {
      const nextLogged = [...state.logged];
      if (state.active && state.active.sets.length > 0) {
        nextLogged.push({
          name: state.active.name,
          pr: false,
          sets: state.active.sets,
        });
      }
      return {
        logged: nextLogged,
        active: {
          name,
          rest: '00:00',
          sets: [{ weight: '20kg', reps: '10' }],
          nextSetLabel: 'Set 1',
        },
      };
    });
  },

  addSet: () =>
    set((state) => {
      if (!state.active) return state;
      const setNum = state.active.sets.length + 1;
      return {
        active: {
          ...state.active,
          sets: [
            ...state.active.sets,
            { weight: state.active.sets[0]?.weight ?? '20kg', reps: '0' },
          ],
          nextSetLabel: `Set ${setNum}`,
        },
      };
    }),

  updateSet: (index, field, value) => {
    set((state) => {
      if (!state.active) return state;
      const newSets = [...state.active.sets];
      if (newSets[index]) {
        newSets[index] = { ...newSets[index], [field]: value };
      }
      return {
        active: { ...state.active, sets: newSets },
      };
    });
  },
}));
