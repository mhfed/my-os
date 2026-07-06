/**
 * expo-sqlite access layer for the Finance feature.
 *
 * Exposes a memoized `getDb()`, an `initDatabase()` that applies the schema and
 * reports whether the DB was empty (so the store can seed on first run), and a
 * handful of parameterized async CRUD helpers consumed by the Zustand store.
 */

import * as SQLite from 'expo-sqlite';

import { COLUMN_MIGRATIONS, SCHEMA } from '@/db/schema';
import type {
  Budget,
  Category,
  RecurringRule,
  Transaction,
} from '@/types/finance';

const DB_NAME = 'personalos.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Memoized handle to the opened database. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
}

/**
 * Applies the schema and returns `{ wasEmpty }`. `wasEmpty` is true when there
 * were no category rows before init — the signal the store uses to seed.
 */
export async function initDatabase(): Promise<{ wasEmpty: boolean }> {
  const db = await getDb();
  await db.execAsync('PRAGMA journal_mode = WAL;');
  for (const statement of SCHEMA) {
    await db.execAsync(statement);
  }
  await applyMigrations(db);
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM categories;',
  );
  const wasEmpty = (row?.count ?? 0) === 0;
  return { wasEmpty };
}

/** True when `column` already exists on `table` (via PRAGMA table_info). */
async function columnExists(
  db: SQLite.SQLiteDatabase,
  table: string,
  column: string,
): Promise<boolean> {
  const cols = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${table});`,
  );
  return cols.some((c) => c.name === column);
}

/**
 * Applies additive column migrations idempotently. SQLite's `ALTER TABLE ADD
 * COLUMN` errors if the column exists, so each is guarded by a runtime check —
 * this keeps `initDatabase()` safe to call on every launch and by any store.
 */
async function applyMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  for (const { table, column, definition } of COLUMN_MIGRATIONS) {
    if (!(await columnExists(db, table, column))) {
      await db.execAsync(
        `ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Row <-> domain mapping. SQLite returns `null` for absent TEXT columns; the
// domain types use `undefined` for optional fields, so we normalize here.
// ---------------------------------------------------------------------------

interface CategoryRow {
  id: string;
  userId: string | null;
  name: string;
  type: string;
  color: string;
  icon: string;
  createdAt: number;
}

interface TransactionRow {
  id: string;
  userId: string | null;
  type: string;
  amount: number;
  categoryId: string;
  note: string | null;
  date: number;
  recurringId: string | null;
  createdAt: number;
}

interface BudgetRow {
  id: string;
  userId: string | null;
  categoryId: string;
  amount: number;
  month: string;
  createdAt: number;
}

interface RecurringRow {
  id: string;
  userId: string | null;
  type: string;
  amount: number;
  categoryId: string;
  note: string | null;
  dayOfMonth: number;
  createdAt: number;
}

function mapCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    userId: r.userId ?? undefined,
    name: r.name,
    type: r.type as Category['type'],
    color: r.color,
    icon: r.icon,
    createdAt: r.createdAt,
  };
}

function mapTransaction(r: TransactionRow): Transaction {
  return {
    id: r.id,
    userId: r.userId ?? undefined,
    type: r.type as Transaction['type'],
    amount: r.amount,
    categoryId: r.categoryId,
    note: r.note ?? undefined,
    date: r.date,
    recurringId: r.recurringId ?? undefined,
    createdAt: r.createdAt,
  };
}

function mapBudget(r: BudgetRow): Budget {
  return {
    id: r.id,
    userId: r.userId ?? undefined,
    categoryId: r.categoryId,
    amount: r.amount,
    month: r.month,
    createdAt: r.createdAt,
  };
}

function mapRecurring(r: RecurringRow): RecurringRule {
  return {
    id: r.id,
    userId: r.userId ?? undefined,
    type: r.type as RecurringRule['type'],
    amount: r.amount,
    categoryId: r.categoryId,
    note: r.note ?? undefined,
    dayOfMonth: r.dayOfMonth,
    createdAt: r.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Load-all helpers
// ---------------------------------------------------------------------------

export async function loadCategories(): Promise<Category[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<CategoryRow>(
    'SELECT * FROM categories ORDER BY createdAt ASC;',
  );
  return rows.map(mapCategory);
}

export async function loadTransactions(): Promise<Transaction[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TransactionRow>(
    'SELECT * FROM transactions ORDER BY date DESC;',
  );
  return rows.map(mapTransaction);
}

export async function loadBudgets(): Promise<Budget[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<BudgetRow>('SELECT * FROM budgets;');
  return rows.map(mapBudget);
}

export async function loadRecurring(): Promise<RecurringRule[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<RecurringRow>('SELECT * FROM recurring;');
  return rows.map(mapRecurring);
}

// ---------------------------------------------------------------------------
// Write helpers (parameterized)
// ---------------------------------------------------------------------------

export async function insertCategory(category: Category): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO categories
      (id, userId, name, type, color, icon, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      category.id,
      category.userId ?? null,
      category.name,
      category.type,
      category.color,
      category.icon,
      category.createdAt,
    ],
  );
}

export async function insertTransaction(txn: Transaction): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO transactions
      (id, userId, type, amount, categoryId, note, date, recurringId, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      txn.id,
      txn.userId ?? null,
      txn.type,
      txn.amount,
      txn.categoryId,
      txn.note ?? null,
      txn.date,
      txn.recurringId ?? null,
      txn.createdAt,
    ],
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM transactions WHERE id = ?;', [id]);
}

/** Inserts or replaces the single budget row for a (category, month). */
export async function upsertBudget(budget: Budget): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO budgets (id, userId, categoryId, amount, month, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(categoryId, month)
       DO UPDATE SET amount = excluded.amount;`,
    [
      budget.id,
      budget.userId ?? null,
      budget.categoryId,
      budget.amount,
      budget.month,
      budget.createdAt,
    ],
  );
}

export async function insertRecurring(rule: RecurringRule): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO recurring
      (id, userId, type, amount, categoryId, note, dayOfMonth, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      rule.id,
      rule.userId ?? null,
      rule.type,
      rule.amount,
      rule.categoryId,
      rule.note ?? null,
      rule.dayOfMonth,
      rule.createdAt,
    ],
  );
}

// ---------------------------------------------------------------------------
// Generic helpers — shared by the Phase-1 module stores (tasks, habits,
// journal, inbox). Use these instead of writing bespoke per-table helpers.
// `initDatabase()` above already applies the full SCHEMA, so every table
// exists by the time any store calls these.
// ---------------------------------------------------------------------------

type SqlParam = string | number | null;

/** Run an INSERT/UPDATE/DELETE with positional params. */
export async function runSql(
  sql: string,
  params: SqlParam[] = [],
): Promise<void> {
  const db = await getDb();
  await db.runAsync(sql, params);
}

/** Fetch all rows of a query, typed by the caller. */
export async function allRows<T>(
  sql: string,
  params: SqlParam[] = [],
): Promise<T[]> {
  const db = await getDb();
  return db.getAllAsync<T>(sql, params);
}

/** Fetch the first row of a query (or null). */
export async function firstRow<T>(
  sql: string,
  params: SqlParam[] = [],
): Promise<T | null> {
  const db = await getDb();
  return db.getFirstAsync<T>(sql, params);
}

/** True when a table has no rows — the signal each store uses to seed. */
export async function tableIsEmpty(table: string): Promise<boolean> {
  const row = await firstRow<{ count: number }>(
    `SELECT COUNT(*) AS count FROM ${table};`,
  );
  return (row?.count ?? 0) === 0;
}
