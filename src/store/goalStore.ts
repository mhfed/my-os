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

  const total = milestoneTotal + taskTotal;
  const done = milestoneDone + taskDone;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return {
    done,
    total,
    pct,
    complete: total > 0 && done === total,
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
      const mRows = await allRows<any>('SELECT * FROM milestones;');

      const mByGoal = mRows.reduce(
        (acc, m) => {
          if (!acc[m.goalId]) acc[m.goalId] = [];
          acc[m.goalId].push({
            id: m.id,
            goalId: m.goalId,
            title: m.title,
            done: m.done === 1,
            linkedTaskId: m.linkedTaskId ?? undefined,
            createdAt: m.createdAt,
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
    await runSql(
      `INSERT INTO goals (id, userId, title, description, deadline, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        goalId,
        null,
        input.title,
        input.description ?? null,
        input.deadline ?? null,
        'active',
        now,
        now,
      ],
    );

    const createdMilestones: Milestone[] = [];
    for (const mTitle of input.milestones) {
      if (!mTitle.trim()) continue;
      const mId = newId();

      // PRD: "Milestone tự động tạo task tương ứng trong Task Manager."
      const tasksStr = useTasksStore.getState();
      if (!tasksStr.ready) await tasksStr.init();

      const task = await tasksStr.addTask({
        title: mTitle,
        priority: 'P1',
        dueDate: input.deadline,
        context: input.title,
      });

      await runSql(
        `INSERT INTO milestones (id, goalId, title, done, linkedTaskId, createdAt)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [mId, goalId, mTitle, 0, task.id, now],
      );
      createdMilestones.push({
        id: mId,
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
      createdAt: now,
      updatedAt: now,
      milestones: createdMilestones,
    };

    set((state) => ({ goals: [newGoal, ...state.goals] }));
  },

  updateGoal: async (id, updates) => {
    const now = Date.now();

    // Update goal base info
    await runSql(
      'UPDATE goals SET title = ?, description = ?, deadline = ?, updatedAt = ? WHERE id = ?;',
      [
        updates.title,
        updates.description ?? null,
        updates.deadline ?? null,
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
        const mId = newId();

        const task = await tasksStr.addTask({
          title: mTitle,
          priority: 'P1',
          dueDate: updates.deadline,
          context: updates.title,
        });

        await runSql(
          `INSERT INTO milestones (id, goalId, title, done, linkedTaskId, createdAt)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [mId, id, mTitle, 0, task.id, now],
        );
        createdMilestones.push({
          id: mId,
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
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) return;
    const milestone = goal.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    const done = !milestone.done;
    await runSql('UPDATE milestones SET done = ? WHERE id = ?;', [
      done ? 1 : 0,
      milestoneId,
    ]);

    // Automatically complete the linked task if it exists?
    // Yes, this is an advanced UX detail. Let's do it if tasksStore is loaded.
    if (milestone.linkedTaskId) {
      const ts = useTasksStore.getState();
      const foundTask = ts.tasks.find((t) => t.id === milestone.linkedTaskId);
      if (foundTask && foundTask.done !== done) {
        await ts.toggleTask(milestone.linkedTaskId);
      }
    }

    set((state) => ({
      goals: state.goals.map((g) => {
        if (g.id === goalId) {
          return {
            ...g,
            milestones: g.milestones.map((m) =>
              m.id === milestoneId ? { ...m, done } : m,
            ),
          };
        }
        return g;
      }),
    }));
  },

  deleteGoal: async (id) => {
    await runSql('DELETE FROM goals WHERE id = ?;', [id]);
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
  },
}));
