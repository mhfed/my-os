/**
 * Zustand store for the Tasks feature — now SQLite-backed (PRD §2.2). Holds the
 * task list + active filter, runs a one-time async `init()` that seeds + loads
 * from the `tasks` table, and exposes async CRUD mutations plus the derived
 * selectors (section grouping, today list, header counts) the screen reads.
 */

import { create } from 'zustand';

import { allRows, initDatabase, runSql, tableIsEmpty } from '@/db/database';
import { startOfToday } from '@/utils/day';
import type {
  Subtask,
  NewTaskInput,
  Priority,
  Task,
  TaskFilter,
  TaskSection,
  TasksState,
} from '@/types/task';

export const FILTERS: TaskFilter[] = ['All', 'Today', 'This week', 'Projects'];

const DAY_MS = 86_400_000;

/** Row shape as returned by SQLite (done is 0/1, optionals are null). */
interface TaskRow {
  id: string;
  userId: string | null;
  title: string;
  context: string | null;
  priority: string;
  done: number;
  dueDate: number | null;
  createdAt: number;
  completedAt: number | null;
  goalId: string | null;
  sourceInboxId: string | null;
}

interface SubtaskRow {
  id: string;
  taskId: string;
  title: string;
  done: number;
  createdAt: number;
}

function mapRow(r: TaskRow, subtasks: SubtaskRow[] = []): Task {
  return {
    id: r.id,
    userId: r.userId ?? undefined,
    title: r.title,
    context: r.context ?? undefined,
    priority: r.priority as Priority,
    done: r.done === 1,
    dueDate: r.dueDate ?? undefined,
    createdAt: r.createdAt,
    completedAt: r.completedAt ?? undefined,
    goalId: r.goalId ?? undefined,
    sourceInboxId: r.sourceInboxId ?? undefined,
    subtasks: subtasks.map((s) => ({
      id: s.id,
      taskId: s.taskId,
      title: s.title,
      done: s.done === 1,
      createdAt: s.createdAt,
    })),
  };
}

/** Generate a stable id, falling back when crypto.randomUUID is unavailable. */
function newId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) {
    return c.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const INSERT_SQL = `INSERT OR REPLACE INTO tasks
  (id, userId, title, context, priority, done, dueDate, createdAt, completedAt, goalId, sourceInboxId)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

/** Seed tasks — stable ids, dueDates relative to local midnight today. */
function seedTasks(): Task[] {
  const base = startOfToday();
  const now = Date.now();
  return [
    {
      id: 'seed-task-1',
      title: 'Submit tax documents',
      priority: 'P0',
      done: false,
      dueDate: base - 2 * DAY_MS,
      createdAt: now,
    },
    {
      id: 'seed-task-2',
      title: 'Reply to landlord email',
      priority: 'P1',
      done: false,
      dueDate: base - 1 * DAY_MS,
      createdAt: now,
    },
    {
      id: 'seed-task-3',
      title: 'Review PRD draft',
      context: 'Work',
      priority: 'P0',
      done: false,
      dueDate: base + 10 * 3_600_000,
      createdAt: now,
    },
    {
      id: 'seed-task-4',
      title: 'Gym session · push day',
      context: 'Health',
      priority: 'P1',
      done: false,
      dueDate: base + 18 * 3_600_000,
      createdAt: now,
    },
    {
      id: 'seed-task-5',
      title: 'Call dentist',
      context: 'Personal',
      priority: 'P1',
      done: false,
      dueDate: base + 14 * 3_600_000,
      createdAt: now,
    },
    {
      id: 'seed-task-6',
      title: 'Buy groceries',
      context: 'Errands',
      priority: 'P2',
      done: true,
      dueDate: base,
      createdAt: now,
      completedAt: now,
    },
  ];
}

async function insertTask(task: Task): Promise<void> {
  await runSql(INSERT_SQL, [
    task.id,
    task.userId ?? null,
    task.title,
    task.context ?? null,
    task.priority,
    task.done ? 1 : 0,
    task.dueDate ?? null,
    task.createdAt,
    task.completedAt ?? null,
    task.goalId ?? null,
    task.sourceInboxId ?? null,
  ]);
}

/** Module-level guard so init() runs its async work exactly once. */
let initPromise: Promise<void> | null = null;

export const useTasksStore = create<TasksState>()((set, get) => ({
  tasks: [],
  activeFilter: 'All',
  ready: false,

  init: async () => {
    if (get().ready) return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      await initDatabase();

      if (await tableIsEmpty('tasks')) {
        for (const task of seedTasks()) {
          await insertTask(task);
        }
      }

      const subtaskRows = await allRows<SubtaskRow>(
        'SELECT * FROM task_subtasks ORDER BY createdAt ASC;',
      );

      const subtasksByTask = subtaskRows.reduce(
        (acc, row) => {
          if (!acc[row.taskId]) acc[row.taskId] = [];
          acc[row.taskId].push(row);
          return acc;
        },
        {} as Record<string, SubtaskRow[]>,
      );

      const rows = await allRows<TaskRow>(
        'SELECT * FROM tasks ORDER BY dueDate DESC, createdAt DESC;',
      );
      set({
        tasks: rows.map((r) => mapRow(r, subtasksByTask[r.id])),
        ready: true,
      });
    })();

    return initPromise;
  },

  addTask: async (input: NewTaskInput) => {
    const taskId = newId();
    const now = Date.now();
    const subtasks: Subtask[] = (input.subtasks || []).map((t, i) => ({
      id: `${taskId}-sub-${i}`,
      taskId: taskId,
      title: t,
      done: false,
      createdAt: now + i,
    }));

    const task: Task = {
      id: taskId,
      title: input.title,
      context: input.context,
      priority: input.priority,
      done: false,
      dueDate: input.dueDate,
      createdAt: now,
      goalId: input.goalId,
      sourceInboxId: input.sourceInboxId,
      subtasks,
    };
    await insertTask(task);
    for (const st of subtasks) {
      await runSql(
        'INSERT INTO task_subtasks (id, taskId, title, done, createdAt) VALUES (?, ?, ?, ?, ?);',
        [st.id, st.taskId, st.title, 0, st.createdAt],
      );
    }
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  toggleTask: async (id: string) => {
    const current = get().tasks.find((t) => t.id === id);
    if (!current) return;

    const done = !current.done;
    const completedAt = done ? Date.now() : undefined;

    await runSql('UPDATE tasks SET done = ?, completedAt = ? WHERE id = ?;', [
      done ? 1 : 0,
      completedAt ?? null,
      id,
    ]);

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, done, completedAt } : t,
      ),
    }));
  },

  toggleSubtask: async (taskId: string, subtaskId: string) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task || !task.subtasks) return;
    const subtask = task.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return;

    const done = !subtask.done;
    await runSql('UPDATE task_subtasks SET done = ? WHERE id = ?;', [
      done ? 1 : 0,
      subtaskId,
    ]);

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks!.map((s) =>
                s.id === subtaskId ? { ...s, done } : s,
              ),
            }
          : t,
      ),
    }));
  },

  deleteTask: async (id: string) => {
    await runSql('DELETE FROM task_subtasks WHERE taskId = ?;', [id]);
    await runSql('DELETE FROM tasks WHERE id = ?;', [id]);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  setFilter: (filter: TaskFilter) => set({ activeFilter: filter }),

  sectionOf: (task: Task): TaskSection => {
    const start = startOfToday();
    if (task.dueDate != null && task.dueDate < start && !task.done) {
      return 'overdue';
    }
    if (task.dueDate != null && task.dueDate >= start + DAY_MS) {
      return 'upcoming';
    }
    return 'today';
  },

  todayTasks: () => {
    const { tasks, sectionOf } = get();
    return tasks
      .filter((t) => !t.done && sectionOf(t) === 'today')
      .sort((a, b) => (b.dueDate ?? b.createdAt) - (a.dueDate ?? a.createdAt));
  },

  activeCount: () => get().tasks.filter((t) => !t.done).length,

  overdueCount: () => {
    const { tasks, sectionOf } = get();
    return tasks.filter((t) => !t.done && sectionOf(t) === 'overdue').length;
  },
}));

/** Human-readable time/context label for a task row. */
export function taskTimeLabel(task: Task): string {
  if (task.done) {
    if (task.completedAt) {
      const d = new Date(task.completedAt);
      const hh = d.getHours() < 10 ? `0${d.getHours()}` : `${d.getHours()}`;
      const mm =
        d.getMinutes() < 10 ? `0${d.getMinutes()}` : `${d.getMinutes()}`;
      return `✓ Done at ${hh}:${mm}`;
    }
    return '✓ Done';
  }

  const start = startOfToday();

  if (task.dueDate != null && task.dueDate < start) {
    const daysAgo = Math.round((start - task.dueDate) / DAY_MS);
    return daysAgo <= 1 ? 'Due yesterday' : `Due ${daysAgo} days ago`;
  }

  if (task.dueDate != null) {
    const d = new Date(task.dueDate);
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    if (hasTime) {
      const hh = d.getHours() < 10 ? `0${d.getHours()}` : `${d.getHours()}`;
      const mm =
        d.getMinutes() < 10 ? `0${d.getMinutes()}` : `${d.getMinutes()}`;
      return `${hh}:${mm}${task.context ? ` · ${task.context}` : ''}`;
    }
  }

  return task.context ? `Anytime · ${task.context}` : 'Anytime';
}
