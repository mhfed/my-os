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

interface GymState {
  logged: LoggedExercise[];
  active: ActiveExercise;
  /** Append a placeholder set to the active exercise (minimal no-op-ish). */
  addSet: () => void;
}

export const useGymStore = create<GymState>((set) => ({
  logged: SEED_LOGGED,
  active: SEED_ACTIVE,
  addSet: () =>
    set((state) => ({
      active: {
        ...state.active,
        sets: [
          ...state.active.sets,
          { weight: state.active.sets[0]?.weight ?? '25kg', reps: '0 reps' },
        ],
      },
    })),
}));
