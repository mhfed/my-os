/**
 * Zustand store for the Finance feature — the single source of truth the UI
 * subscribes to. Implements the `FinanceState` contract from
 * `@/types/finance`. Mutations persist to SQLite first, then update the
 * in-memory arrays; all selectors derive view-models for `activeMonth` only.
 */

import { create } from 'zustand';

import {
  deleteTransaction as dbDeleteTransaction,
  initDatabase,
  insertCategory as dbInsertCategory,
  insertTransaction as dbInsertTransaction,
  loadBudgets,
  loadCategories,
  loadRecurring,
  loadTransactions,
  upsertBudget as dbUpsertBudget,
} from '@/db/database';
import { seedDatabase } from '@/data/seed';
import { addMonths, currentMonthKey, monthRange } from '@/utils/date';
import * as FileSystem from 'expo-file-system';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import type {
  Budget,
  Category,
  CategorySpend,
  FinanceState,
  MonthlyOverview,
  Transaction,
  TransactionView,
} from '@/types/finance';

/** RFC4122 id when available, otherwise a sufficiently-unique fallback. */
function newId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useFinanceStore = create<FinanceState>()((set, get) => ({
  activeMonth: currentMonthKey(),
  categories: [],
  transactions: [],
  budgets: [],
  recurring: [],
  ready: false,

  // ----- lifecycle -----
  init: async () => {
    const { wasEmpty } = await initDatabase();
    if (wasEmpty) {
      await seedDatabase();
    }
    const [categories, transactions, budgets, recurring] = await Promise.all([
      loadCategories(),
      loadTransactions(),
      loadBudgets(),
      loadRecurring(),
    ]);
    set({ categories, transactions, budgets, recurring, ready: true });
  },

  // ----- month navigation -----
  setActiveMonth: (month) => set({ activeMonth: month }),
  stepMonth: (delta) =>
    set((state) => ({ activeMonth: addMonths(state.activeMonth, delta) })),

  // ----- mutations -----
  addTransaction: async (input) => {
    const txn: Transaction = {
      ...input,
      id: newId(),
      createdAt: Date.now(),
    };
    await dbInsertTransaction(txn);
    set((state) => ({ transactions: [txn, ...state.transactions] }));
  },

  deleteTransaction: async (id) => {
    await dbDeleteTransaction(id);
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
  },

  addCategory: async (input) => {
    const category: Category = {
      ...input,
      id: newId(),
      createdAt: Date.now(),
    };
    await dbInsertCategory(category);
    set((state) => ({ categories: [...state.categories, category] }));
  },

  updateCategory: async (id, input) => {
    const { runSql } = await import('@/db/database');
    const existing = get().categories.find((c) => c.id === id);
    if (!existing) return;
    const updated = { ...existing, ...input };
    await runSql(
      'UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ?;',
      [updated.name, updated.color, updated.icon, id],
    );
    set((state) => ({
      categories: state.categories.map((c) => (c.id === id ? updated : c)),
    }));
  },

  deleteCategory: async (id) => {
    const { runSql } = await import('@/db/database');
    await runSql('DELETE FROM categories WHERE id = ?;', [id]);
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },

  setBudget: async (categoryId, amount, month) => {
    const existing = get().budgets.find(
      (b) => b.categoryId === categoryId && b.month === month,
    );
    const budget: Budget = existing
      ? { ...existing, amount }
      : {
          id: newId(),
          categoryId,
          amount,
          month,
          createdAt: Date.now(),
        };
    await dbUpsertBudget(budget);
    set((state) => ({
      budgets: existing
        ? state.budgets.map((b) => (b.id === budget.id ? budget : b))
        : [...state.budgets, budget],
    }));
  },

  addRecurring: async (input) => {
    const rule = {
      ...input,
      id: newId(),
      createdAt: Date.now(),
    };
    const { runSql } = await import('@/db/database');
    await runSql(
      `INSERT INTO recurring (id, userId, type, amount, categoryId, note, dayOfMonth, createdAt)
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
    set((state) => ({ recurring: [rule, ...state.recurring] }));
  },

  deleteRecurring: async (id) => {
    const { runSql } = await import('@/db/database');
    await runSql('DELETE FROM recurring WHERE id = ?;', [id]);
    set((state) => ({ recurring: state.recurring.filter((r) => r.id !== id) }));
  },

  exportCSV: async () => {
    const { transactions, categories } = get();

    // Sort transactions by date descending
    const sorted = [...transactions].sort((a, b) => b.date - a.date);
    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    const lines = ['Date,Type,Category,Amount,Note'];
    for (const t of sorted) {
      const d = new Date(t.date);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const catName = catMap.get(t.categoryId) || 'Unknown';
      // Escape note just in case it has commas
      const note = t.note ? `"${t.note.replace(/"/g, '""')}"` : '';
      lines.push(`${dateStr},${t.type},${catName},${t.amount},${note}`);
    }

    const csvContent = lines.join('\n');
    const fileName = `PersonalOS_Finance_${Date.now()}.csv`;
    // @ts-ignore
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    // @ts-ignore
    await FileSystem.writeAsStringAsync(fileUri, csvContent);

    if (await isAvailableAsync()) {
      await shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Finance Data',
      });
    }
  },

  // ----- selectors (active month only) -----
  getOverview: (): MonthlyOverview => {
    const { activeMonth, transactions, budgets } = get();
    const { start, end } = monthRange(activeMonth);

    let income = 0;
    let spent = 0;
    for (const t of transactions) {
      if (t.date < start || t.date >= end) continue;
      if (t.type === 'income') income += t.amount;
      else spent += t.amount;
    }

    const budget = budgets
      .filter((b) => b.month === activeMonth)
      .reduce((sum, b) => sum + b.amount, 0);

    const budgetUsed =
      budget > 0 ? Math.min(1, Math.max(0, spent / budget)) : 0;

    return {
      month: activeMonth,
      spent,
      income,
      saved: income - spent,
      budget,
      budgetUsed,
      remaining: budget - spent,
    };
  },

  getCategorySpend: (): CategorySpend[] => {
    const { activeMonth, transactions, categories } = get();
    const { start, end } = monthRange(activeMonth);

    const totals = new Map<string, number>();
    let totalExpense = 0;
    for (const t of transactions) {
      if (t.type !== 'expense') continue;
      if (t.date < start || t.date >= end) continue;
      totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
      totalExpense += t.amount;
    }

    const result: CategorySpend[] = [];
    for (const category of categories) {
      const amount = totals.get(category.id) ?? 0;
      if (amount <= 0) continue;
      result.push({
        categoryId: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        amount,
        pct: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      });
    }

    return result.sort((a, b) => b.amount - a.amount);
  },

  getTransactionViews: (limit?: number): TransactionView[] => {
    const { activeMonth, transactions, categories } = get();
    const { start, end } = monthRange(activeMonth);
    const byId = new Map(categories.map((c) => [c.id, c]));

    const views = transactions
      .filter((t) => t.date >= start && t.date < end)
      .sort((a, b) => b.date - a.date)
      .map<TransactionView>((t) => {
        const category = byId.get(t.categoryId);
        const categoryName = category?.name ?? 'Uncategorized';
        return {
          id: t.id,
          name: t.note || categoryName,
          categoryName,
          color: category?.color ?? '#999999',
          icon: category?.icon ?? 'cash',
          amount: t.amount,
          type: t.type,
          date: t.date,
        };
      });

    return typeof limit === 'number' ? views.slice(0, limit) : views;
  },
}));
