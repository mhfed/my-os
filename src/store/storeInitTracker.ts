import { create } from 'zustand';

/**
 * Tracks which stores failed during startup and why.
 * Created separately so screens can surface init errors
 * even when the store itself never reached `ready: true`.
 */
interface InitTrackerState {
  errors: Record<string, string>;
  setError: (name: string, message: string) => void;
}

export const useInitTracker = create<InitTrackerState>((set) => ({
  errors: {},
  setError: (name, message) =>
    set((s) => ({ errors: { ...s.errors, [name]: message } })),
}));
