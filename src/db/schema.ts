/**
 * SQLite schema for the Finance data layer.
 *
 * Columns mirror the domain types in `@/types/finance`:
 *   - Monetary amounts are INTEGER VND (đồng has no minor unit).
 *   - `date` / `createdAt` are INTEGER epoch-ms.
 *   - `userId` is nullable (multi-user-ready per the PRD).
 * Statements are idempotent (`CREATE TABLE IF NOT EXISTS`).
 */

export const SCHEMA: string[] = [
  `CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    categoryId TEXT NOT NULL,
    note TEXT,
    date INTEGER NOT NULL,
    recurringId TEXT,
    createdAt INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT,
    categoryId TEXT NOT NULL,
    amount INTEGER NOT NULL,
    month TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS recurring (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    categoryId TEXT NOT NULL,
    note TEXT,
    dayOfMonth INTEGER NOT NULL,
    createdAt INTEGER NOT NULL
  );`,

  // One budget row per (category, month).
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_category_month
    ON budgets (categoryId, month);`,

  `CREATE INDEX IF NOT EXISTS idx_transactions_date
    ON transactions (date);`,

  // ----- Phase 1 modules -------------------------------------------------
  // Tasks: `done`/`completedAt` track completion; `dueDate` (epoch-ms,
  // nullable) drives the overdue/today grouping, `context` is the freeform
  // label (e.g. "Work", "Health").
  `CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT,
    title TEXT NOT NULL,
    context TEXT,
    priority TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    dueDate INTEGER,
    createdAt INTEGER NOT NULL,
    completedAt INTEGER
  );`,

  `CREATE TABLE IF NOT EXISTS task_subtasks (
    id TEXT PRIMARY KEY NOT NULL,
    taskId TEXT NOT NULL,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    createdAt INTEGER NOT NULL,
    FOREIGN KEY(taskId) REFERENCES tasks(id) ON DELETE CASCADE
  );`,

  // Habits: definition rows. Per-day completion lives in habit_logs.
  `CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT,
    name TEXT NOT NULL,
    sub TEXT,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    createdAt INTEGER NOT NULL
  );`,

  // One row per (habit, day). `date` is "YYYY-MM-DD" local. Presence with
  // done=1 means completed that day.
  `CREATE TABLE IF NOT EXISTS habit_logs (
    habitId TEXT NOT NULL,
    date TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (habitId, date)
  );`,

  // Journal: one entry per calendar day (`date` "YYYY-MM-DD").
  `CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT,
    date TEXT NOT NULL UNIQUE,
    mood INTEGER NOT NULL,
    text TEXT NOT NULL DEFAULT '',
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );`,

  // ----- Phase 2 Gym -----------------------------------------------------
  `CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT,
    name TEXT NOT NULL,
    startTime INTEGER NOT NULL,
    endTime INTEGER,
    createdAt INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS workout_exercises (
    id TEXT PRIMARY KEY NOT NULL,
    workoutId TEXT NOT NULL,
    name TEXT NOT NULL,
    orderIndex INTEGER NOT NULL,
    pr INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(workoutId) REFERENCES workouts(id) ON DELETE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS workout_sets (
    id TEXT PRIMARY KEY NOT NULL,
    exerciseId TEXT NOT NULL,
    weight TEXT NOT NULL,
    reps TEXT NOT NULL,
    orderIndex INTEGER NOT NULL,
    FOREIGN KEY(exerciseId) REFERENCES workout_exercises(id) ON DELETE CASCADE
  );`,

  // ----- Phase 3 Knowledge & Goals ---------------------------------------
  `CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    isReadingList INTEGER NOT NULL DEFAULT 0,
    url TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT,
    title TEXT NOT NULL,
    description TEXT,
    deadline INTEGER,
    status TEXT NOT NULL DEFAULT 'active',
    dropReason TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY NOT NULL,
    goalId TEXT NOT NULL,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    linkedTaskId TEXT,
    createdAt INTEGER NOT NULL,
    FOREIGN KEY(goalId) REFERENCES goals(id) ON DELETE CASCADE
  );`,

  // Quick Capture inbox (PRD §2.1). `status`: 'inbox' | 'archived'.
  `CREATE TABLE IF NOT EXISTS inbox_items (
    id TEXT PRIMARY KEY NOT NULL,
    userId TEXT,
    text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'inbox',
    createdAt INTEGER NOT NULL
  );`,

  `CREATE INDEX IF NOT EXISTS idx_tasks_dueDate ON tasks (dueDate);`,
  `CREATE INDEX IF NOT EXISTS idx_task_subtasks_taskId ON task_subtasks (taskId);`,
  `CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs (date);`,
  `CREATE INDEX IF NOT EXISTS idx_inbox_status ON inbox_items (status);`,
  `CREATE INDEX IF NOT EXISTS idx_workouts_startTime ON workouts (startTime);`,
  `CREATE INDEX IF NOT EXISTS idx_workout_exercises_workoutId ON workout_exercises (workoutId);`,
  `CREATE INDEX IF NOT EXISTS idx_notes_updatedAt ON notes (updatedAt);`,
  `CREATE INDEX IF NOT EXISTS idx_goals_status ON goals (status);`,
  `CREATE INDEX IF NOT EXISTS idx_milestones_goalId ON milestones (goalId);`,
];
