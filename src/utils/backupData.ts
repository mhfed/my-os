import { allRows, getDb } from '@/db/database';

/**
 * Canonical list of every user-data table, in FK-safe insert order (parents
 * before children). This is the single source of truth for backup/restore and
 * supersedes the partial list that used to live in `export.ts`.
 *
 * NOTE: keep this in sync with `src/db/schema.ts`. When a new persisted table
 * is added, append it here (respecting FK order) so it is included in backups.
 */
export const BACKUP_TABLES: string[] = [
  // Finance core (parents first)
  'categories',
  'transactions',
  'budgets',
  'recurring',
  // Tasks
  'tasks',
  'task_subtasks',
  // Habits
  'habits',
  'habit_logs',
  // Journal
  'journal_entries',
  // Inbox
  'inbox_items',
  // Gym (parents first)
  'workouts',
  'workout_exercises',
  'workout_sets',
  // Knowledge & goals
  'notes',
  'goals',
  'milestones',
  // Finance: debt ledger (parents first)
  'debt_entries',
  'debt_nettings',
  'debt_payments',
  // Finance: savings (parents first)
  'savings_goals',
  'savings_contributions',
  // App settings
  'app_settings',
];

/** Current backup payload schema version. Bump on breaking shape changes. */
export const BACKUP_VERSION = 1;

export interface BackupPayload {
  version: number;
  createdAt: number;
  appVersion?: string;
  tables: Record<string, Record<string, unknown>[]>;
}

/**
 * Read every backup table into a single JSON-serialisable snapshot.
 * Missing tables (e.g. `milestones` if not yet created) are skipped safely.
 */
export async function createSnapshot(
  appVersion?: string,
): Promise<BackupPayload> {
  const tables: Record<string, Record<string, unknown>[]> = {};
  for (const t of BACKUP_TABLES) {
    try {
      tables[t] = await allRows<Record<string, unknown>>(`SELECT * FROM ${t};`);
    } catch {
      // Table may not exist on this schema version — skip rather than fail the
      // whole backup.
      tables[t] = [];
    }
  }
  return {
    version: BACKUP_VERSION,
    createdAt: Date.now(),
    appVersion,
    tables,
  };
}

/** Serialise a snapshot to a pretty JSON string. */
export function serializeSnapshot(payload: BackupPayload): string {
  return JSON.stringify(payload, null, 2);
}

/**
 * Restore a snapshot into SQLite. This is a **full replace**: every backup
 * table is cleared and repopulated from the payload, all inside one
 * transaction so a failure rolls back cleanly (never leaves a half-restored
 * DB). Tables absent from the payload are left untouched.
 */
export async function restoreSnapshot(payload: BackupPayload): Promise<void> {
  if (!payload || typeof payload !== 'object' || !payload.tables) {
    throw new Error('Invalid backup payload: missing "tables".');
  }

  const db = await getDb();

  await db.withTransactionAsync(async () => {
    // Defer FK enforcement so delete/insert order across related tables can't
    // trip constraints mid-restore.
    await db.execAsync('PRAGMA foreign_keys = OFF;');

    // Delete children before parents (reverse FK-safe order).
    for (const table of [...BACKUP_TABLES].reverse()) {
      if (!(table in payload.tables)) continue;
      try {
        await db.runAsync(`DELETE FROM ${table};`);
      } catch {
        // Table absent on this schema — ignore.
      }
    }

    // Insert parents before children (forward order).
    for (const table of BACKUP_TABLES) {
      const rows = payload.tables[table];
      if (!Array.isArray(rows) || rows.length === 0) continue;

      for (const row of rows) {
        const columns = Object.keys(row);
        if (columns.length === 0) continue;
        const placeholders = columns.map(() => '?').join(', ');
        const values = columns.map((c) => normalizeValue(row[c]));
        const sql = `INSERT OR REPLACE INTO ${table} (${columns
          .map((c) => `"${c}"`)
          .join(', ')}) VALUES (${placeholders});`;
        try {
          await db.runAsync(sql, values);
        } catch {
          // Skip a single incompatible row rather than aborting the whole
          // restore (e.g. a column that no longer exists).
        }
      }
    }

    await db.execAsync('PRAGMA foreign_keys = ON;');
  });
}

/** Coerce a JSON value into a SQLite-storable primitive. */
function normalizeValue(v: unknown): string | number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number' || typeof v === 'string') return v;
  // Objects/arrays that slipped through get JSON-encoded.
  return JSON.stringify(v);
}

/** Count total rows across all tables in a payload (for UI summaries). */
export function countRows(payload: BackupPayload): number {
  return Object.values(payload.tables).reduce(
    (sum, rows) => sum + (Array.isArray(rows) ? rows.length : 0),
    0,
  );
}
