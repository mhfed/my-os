/**
 * First-run seed data for the Finance feature.
 *
 * Everything is anchored to the CURRENT month (relative to `new Date()`), so
 * the Finance screen is always populated regardless of when the app first
 * runs. Ids are deterministic (`seed-*`) so re-seeding is idempotent.
 *
 * Design targets for the current month (VND):
 *   Budget   12,000,000   Expense 8,450,000 (70% used, 3,550,000 left)
 *   Income   25,000,000   Saved   16,550,000
 *   Split — Rent 3,211,000 · Food 2,197,000 · Transport 1,690,000 · Shopping 1,352,000
 */

import {
  insertCategory,
  insertTransaction,
  upsertBudget,
} from '@/db/database';
import { currentMonthKey } from '@/utils/date';
import type { Budget, Category, Transaction } from '@/types/finance';

// Deterministic createdAt so seed rows have a stable, sortable origin.
const SEED_CREATED_AT = Date.UTC(2024, 0, 1, 0, 0, 0);

const CAT = {
  rent: 'seed-cat-rent',
  food: 'seed-cat-food',
  transport: 'seed-cat-transport',
  shopping: 'seed-cat-shopping',
  salary: 'seed-cat-salary',
} as const;

/** System category IDs used by debt & savings stores — stable across installs. */
export const SYS_CAT = {
  debtIncome: 'sys-cat-debt-income',
  debtExpense: 'sys-cat-debt-expense',
  savings: 'sys-cat-savings',
} as const;

/** System categories always present — inserted via ensureSystemCategories() in financeStore.init(). */
export const SYSTEM_CATEGORIES: Category[] = [
  {
    id: SYS_CAT.debtIncome,
    name: 'Thu nợ',
    type: 'income',
    color: '#4ECDC4',
    icon: 'cash-plus',
    createdAt: SEED_CREATED_AT - 3,
  },
  {
    id: SYS_CAT.debtExpense,
    name: 'Trả nợ',
    type: 'expense',
    color: '#F5B16E',
    icon: 'cash-minus',
    createdAt: SEED_CREATED_AT - 2,
  },
  {
    id: SYS_CAT.savings,
    name: 'Tiết kiệm',
    type: 'expense',
    color: '#7C6EF5',
    icon: 'piggy-bank',
    createdAt: SEED_CREATED_AT - 1,
  },
];

export const SEED_CATEGORIES: Category[] = [
  {
    id: CAT.rent,
    name: 'Rent',
    type: 'expense',
    color: '#7C6EF5',
    icon: 'home',
    createdAt: SEED_CREATED_AT,
  },
  {
    id: CAT.food,
    name: 'Food',
    type: 'expense',
    color: '#4ECDC4',
    icon: 'coffee',
    createdAt: SEED_CREATED_AT + 1,
  },
  {
    id: CAT.transport,
    name: 'Transport',
    type: 'expense',
    color: '#F5B16E',
    icon: 'car',
    createdAt: SEED_CREATED_AT + 2,
  },
  {
    id: CAT.shopping,
    name: 'Shopping',
    type: 'expense',
    color: '#FF6B6B',
    icon: 'cart',
    createdAt: SEED_CREATED_AT + 3,
  },
  {
    id: CAT.salary,
    name: 'Salary',
    type: 'income',
    color: '#4ECDC4',
    icon: 'cash-multiple',
    createdAt: SEED_CREATED_AT + 4,
  },
];

/**
 * Returns epoch-ms for a day in the current month, clamped so it never lands
 * in the future. `daysAgo` counts back from today; if today is early in the
 * month and that would cross into the previous month, we clamp to day 1.
 */
function dayInCurrentMonth(daysAgo: number): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(12, 0, 0, 0);
  target.setDate(now.getDate() - daysAgo);
  // Keep the transaction inside the current month.
  if (target.getMonth() !== now.getMonth() || target.getFullYear() !== now.getFullYear()) {
    return new Date(now.getFullYear(), now.getMonth(), 1, 12, 0, 0, 0).getTime();
  }
  return target.getTime();
}

interface SeedTxnSpec {
  id: string;
  type: Transaction['type'];
  amount: number;
  categoryId: string;
  note: string;
  daysAgo: number;
}

// Most-recent named transactions + fillers so each category hits its target.
//   Food:      65,000 + 420,000 + 900,000 + 812,000   = 2,197,000
//   Transport: 48,000 + 850,000 + 792,000             = 1,690,000
//   Shopping:  260,000 + 600,000 + 492,000            = 1,352,000
//   Rent:      3,211,000                               = 3,211,000
//   Income:    25,000,000                              = 25,000,000
const SEED_TXN_SPECS: SeedTxnSpec[] = [
  // ----- 5 named, most-recent transactions -----
  { id: 'seed-txn-1', type: 'expense', amount: 65_000, categoryId: CAT.food, note: 'Highlands Coffee', daysAgo: 0 },
  { id: 'seed-txn-2', type: 'expense', amount: 48_000, categoryId: CAT.transport, note: 'Grab ride', daysAgo: 0 },
  { id: 'seed-txn-3', type: 'income', amount: 25_000_000, categoryId: CAT.salary, note: 'Salary', daysAgo: 2 },
  { id: 'seed-txn-4', type: 'expense', amount: 420_000, categoryId: CAT.food, note: 'VinMart groceries', daysAgo: 3 },
  { id: 'seed-txn-5', type: 'expense', amount: 260_000, categoryId: CAT.shopping, note: 'Netflix', daysAgo: 4 },

  // ----- fillers so category sums hit the design targets -----
  { id: 'seed-txn-6', type: 'expense', amount: 3_211_000, categoryId: CAT.rent, note: 'Monthly rent', daysAgo: 5 },
  { id: 'seed-txn-7', type: 'expense', amount: 900_000, categoryId: CAT.food, note: 'Lunch & dinners', daysAgo: 6 },
  { id: 'seed-txn-8', type: 'expense', amount: 812_000, categoryId: CAT.food, note: 'Weekend market', daysAgo: 8 },
  { id: 'seed-txn-9', type: 'expense', amount: 850_000, categoryId: CAT.transport, note: 'Fuel', daysAgo: 7 },
  { id: 'seed-txn-10', type: 'expense', amount: 792_000, categoryId: CAT.transport, note: 'Grab rides', daysAgo: 9 },
  { id: 'seed-txn-11', type: 'expense', amount: 600_000, categoryId: CAT.shopping, note: 'Clothing', daysAgo: 10 },
  { id: 'seed-txn-12', type: 'expense', amount: 492_000, categoryId: CAT.shopping, note: 'Household goods', daysAgo: 12 },
];

export const SEED_TRANSACTIONS: Transaction[] = SEED_TXN_SPECS.map((spec) => ({
  id: spec.id,
  type: spec.type,
  amount: spec.amount,
  categoryId: spec.categoryId,
  note: spec.note,
  date: dayInCurrentMonth(spec.daysAgo),
  createdAt: SEED_CREATED_AT,
}));

// Budgets sum to 12,000,000 across the four expense categories.
//   Rent 4,500,000 + Food 3,000,000 + Transport 2,400,000 + Shopping 2,100,000
const SEED_BUDGET_AMOUNTS: { categoryId: string; amount: number }[] = [
  { categoryId: CAT.rent, amount: 4_500_000 },
  { categoryId: CAT.food, amount: 3_000_000 },
  { categoryId: CAT.transport, amount: 2_400_000 },
  { categoryId: CAT.shopping, amount: 2_100_000 },
];

export const SEED_BUDGETS: Budget[] = SEED_BUDGET_AMOUNTS.map((b, i) => ({
  id: `seed-budget-${i + 1}`,
  categoryId: b.categoryId,
  amount: b.amount,
  month: currentMonthKey(),
  createdAt: SEED_CREATED_AT,
}));

/** Writes all seed rows into SQLite via the db helpers. */
export async function seedDatabase(): Promise<void> {
  for (const category of SYSTEM_CATEGORIES) {
    await insertCategory(category);
  }
  for (const category of SEED_CATEGORIES) {
    await insertCategory(category);
  }
  for (const txn of SEED_TRANSACTIONS) {
    await insertTransaction(txn);
  }
  for (const budget of SEED_BUDGETS) {
    await upsertBudget(budget);
  }
}

/** Idempotent: inserts system categories if they don't exist yet (existing users). */
export async function ensureSystemCategories(existingIds: Set<string>): Promise<Category[]> {
  const added: Category[] = [];
  for (const cat of SYSTEM_CATEGORIES) {
    if (!existingIds.has(cat.id)) {
      await insertCategory(cat);
      added.push(cat);
    }
  }
  return added;
}
