import { create } from 'zustand';

import { allRows, initDatabase, runSql } from '@/db/database';
import type { Goal, GoalState, Milestone } from '@/types/goal';
import type { Task } from '@/types/task';
import { useTasksStore } from './tasksStore';

/**
 * Cross-module goal progress (my-os-8u7). A goal advances from two sources:
 *   1. its milestones (each done milestone counts as one unit), and
 *   2. standalone tasks linked to it via `task.goalId` that are NOT already
 *      represented by a milestone's `linkedTaskId` (so we never double-count a
 *      milestone-generated task).
 * Completing any of those units moves the ring. Returns a stable value object;
 * callers should memoize since this allocates.
 */
export interface GoalProgress {
  done: number;
  total: number;
  pct: number;
  complete: boolean;
  /** Linked tasks that contribute independently of milestones. */
  contributingTasks: Task[];
}

function parseLinkedIds(fieldValue?: string | null): string[] {
  if (!fieldValue) return [];
  const trimmed = fieldValue.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      return JSON.parse(trimmed) as string[];
    } catch (e) {
      // fallback
    }
  }
  return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
}

export function computeGoalProgress(
  goal: Goal,
  linkedTasks: Task[],
): GoalProgress {
  const milestoneTaskIds = new Set(
    goal.milestones.map((m) => m.linkedTaskId).filter(Boolean) as string[],
  );
  const contributingTasks = linkedTasks.filter(
    (t) => t.goalId === goal.id && !milestoneTaskIds.has(t.id),
  );

  const milestoneTotal = goal.milestones.length;
  const milestoneDone = goal.milestones.filter((m) => m.done).length;
  const taskTotal = contributingTasks.length;
  const taskDone = contributingTasks.filter((t) => t.done).length;

  let total = milestoneTotal + taskTotal;
  let done = milestoneDone + taskDone;

  // Add savings goals if linked
  const savingsGoalIds = parseLinkedIds(goal.savingsGoalId);
  if (savingsGoalIds.length > 0) {
    try {
      const { useSavingsStore } = require('./savingsStore');
      const savingsGoals = useSavingsStore.getState().goals;
      for (const sgId of savingsGoalIds) {
        const sg = savingsGoals.find((g: any) => g.id === sgId);
        if (sg) {
          total += 1;
          const progress = sg.targetAmount > 0 ? Math.min(1, sg.currentAmount / sg.targetAmount) : 0;
          done += progress;
        }
      }
    } catch (e) {
      console.warn('Failed to load savings goal progress', e);
    }
  }

  // Add habits if linked
  const habitIds = parseLinkedIds(goal.habitId);
  if (habitIds.length > 0) {
    try {
      const { useHabitsStore } = require('./habitsStore');
      const habitViews = useHabitsStore.getState().views();
      for (const hId of habitIds) {
        const habitView = habitViews.find((h: any) => h.id === hId);
        if (habitView) {
          total += 1;
          done += (habitView.pct / 100);
        }
      }
    } catch (e) {
      console.warn('Failed to load habit progress', e);
    }
  }

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return {
    done: Math.round(done * 100) / 100,
    total,
    pct,
    complete: total > 0 && done >= total,
    contributingTasks,
  };
}

function newId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

let initPromise: Promise<void> | null = null;

export const useGoalStore = create<GoalState>()((set, get) => ({
  goals: [],
  ready: false,

  init: async () => {
    if (get().ready) return;
    if (initPromise) return initPromise;
    initPromise = (async () => {
      await initDatabase();
      const rows = await allRows<any>(
        'SELECT * FROM goals ORDER BY createdAt DESC;',
      );
      const taskRows = await allRows<any>(
        'SELECT * FROM tasks WHERE goalId IS NOT NULL;',
      );

      const mByGoal = taskRows.reduce(
        (acc, t) => {
          if (!acc[t.goalId]) acc[t.goalId] = [];
          acc[t.goalId].push({
            id: t.id,
            goalId: t.goalId,
            title: t.title,
            done: t.done === 1,
            linkedTaskId: t.id,
            createdAt: t.createdAt,
          });
          return acc;
        },
        {} as Record<string, Milestone[]>,
      );

      const goals: Goal[] = rows.map((r) => ({
        id: r.id,
        userId: r.userId ?? undefined,
        title: r.title,
        description: r.description ?? undefined,
        deadline: r.deadline ?? undefined,
        status: r.status as Goal['status'],
        dropReason: r.dropReason ?? undefined,
        savingsGoalId: r.savingsGoalId ?? undefined,
        habitId: r.habitId ?? undefined,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        milestones: mByGoal[r.id] || [],
      }));
      set({ goals, ready: true });
    })();
    return initPromise;
  },

  createGoal: async (input) => {
    const goalId = newId();
    const now = Date.now();
    const savingsGoalIdVal = Array.isArray(input.savingsGoalId)
      ? JSON.stringify(input.savingsGoalId)
      : input.savingsGoalId ?? null;
    const habitIdVal = Array.isArray(input.habitId)
      ? JSON.stringify(input.habitId)
      : input.habitId ?? null;

    await runSql(
      `INSERT INTO goals (id, userId, title, description, deadline, status, savingsGoalId, habitId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        goalId,
        null,
        input.title,
        input.description ?? null,
        input.deadline ?? null,
        'active',
        savingsGoalIdVal,
        habitIdVal,
        now,
        now,
      ],
    );

    const createdMilestones: Milestone[] = [];
    for (const mTitle of input.milestones) {
      if (!mTitle.trim()) continue;

      const tasksStr = useTasksStore.getState();
      if (!tasksStr.ready) await tasksStr.init();

      const task = await tasksStr.addTask({
        title: mTitle,
        priority: 'P1',
        dueDate: input.deadline,
        context: input.title,
        goalId: goalId,
      });

      createdMilestones.push({
        id: task.id,
        goalId,
        title: mTitle,
        done: false,
        linkedTaskId: task.id,
        createdAt: now,
      });
    }

    const newGoal: Goal = {
      id: goalId,
      title: input.title,
      description: input.description,
      deadline: input.deadline,
      status: 'active',
      savingsGoalId: Array.isArray(input.savingsGoalId) ? JSON.stringify(input.savingsGoalId) : input.savingsGoalId,
      habitId: Array.isArray(input.habitId) ? JSON.stringify(input.habitId) : input.habitId,
      createdAt: now,
      updatedAt: now,
      milestones: createdMilestones,
    };

    set((state) => ({ goals: [newGoal, ...state.goals] }));
  },

  updateGoal: async (id, updates) => {
    const now = Date.now();
    const savingsGoalIdVal = Array.isArray(updates.savingsGoalId)
      ? JSON.stringify(updates.savingsGoalId)
      : updates.savingsGoalId ?? null;
    const habitIdVal = Array.isArray(updates.habitId)
      ? JSON.stringify(updates.habitId)
      : updates.habitId ?? null;

    // Update goal base info
    await runSql(
      'UPDATE goals SET title = ?, description = ?, deadline = ?, savingsGoalId = ?, habitId = ?, updatedAt = ? WHERE id = ?;',
      [
        updates.title,
        updates.description ?? null,
        updates.deadline ?? null,
        savingsGoalIdVal,
        habitIdVal,
        now,
        id,
      ],
    );

    const createdMilestones: Milestone[] = [];
    if (updates.newMilestones && updates.newMilestones.length > 0) {
      const tasksStr = useTasksStore.getState();
      if (!tasksStr.ready) await tasksStr.init();

      for (const mTitle of updates.newMilestones) {
        if (!mTitle.trim()) continue;

        const task = await tasksStr.addTask({
          title: mTitle,
          priority: 'P1',
          dueDate: updates.deadline,
          context: updates.title,
          goalId: id,
        });

        createdMilestones.push({
          id: task.id,
          goalId: id,
          title: mTitle,
          done: false,
          linkedTaskId: task.id,
          createdAt: now,
        });
      }
    }

    set((state) => ({
      goals: state.goals.map((g) => {
        if (g.id !== id) return g;
        return {
          ...g,
          title: updates.title,
          description: updates.description,
          deadline: updates.deadline,
          savingsGoalId: Array.isArray(updates.savingsGoalId) ? JSON.stringify(updates.savingsGoalId) : updates.savingsGoalId,
          habitId: Array.isArray(updates.habitId) ? JSON.stringify(updates.habitId) : updates.habitId,
          updatedAt: now,
          milestones: [...g.milestones, ...createdMilestones],
        };
      }),
    }));
  },

  updateGoalStatus: async (id, status, dropReason) => {
    const now = Date.now();
    await runSql(
      'UPDATE goals SET status = ?, dropReason = ?, updatedAt = ? WHERE id = ?;',
      [status, dropReason ?? null, now, id],
    );
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, status, dropReason, updatedAt: now } : g,
      ),
    }));
  },

  toggleMilestone: async (goalId, milestoneId) => {
    const ts = useTasksStore.getState();
    if (!ts.ready) await ts.init();
    const foundTask = ts.tasks.find((t) => t.id === milestoneId);
    if (foundTask) {
      await ts.toggleTask(milestoneId);
    }

    set((state) => ({
      goals: state.goals.map((g) => {
        if (g.id === goalId) {
          return {
            ...g,
            milestones: g.milestones.map((m) =>
              m.id === milestoneId ? { ...m, done: !m.done } : m,
            ),
          };
        }
        return g;
      }),
    }));
  },

  deleteGoal: async (id) => {
    await runSql('DELETE FROM goals WHERE id = ?;', [id]);
    // Optionally clean up tasks associated with this goal
    await runSql('UPDATE tasks SET goalId = NULL WHERE goalId = ?;', [id]);
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
  },
}));
