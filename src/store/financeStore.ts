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
import { ensureSystemCategories, seedDatabase } from '@/data/seed';
import {
  addMonths,
  currentMonthKey,
  monthRange,
  weekRange,
  getWeekKey,
} from '@/utils/date';
import { getWeeklyBudget } from '@/utils/financeMath';
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
  WeeklyOverview,
  WeeklyCategorySpend,
} from '@/types/finance';

/** RFC4122 id when available, otherwise a sufficiently-unique fallback. */
function newId(): string {
  try {
    const c = globalThis.crypto;
    if (c && typeof c.randomUUID === 'function') {
      return c.randomUUID();
    }
  } catch {
    // crypto unavailable in Hermes release builds — fall through
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
    let [categories, transactions, budgets, recurring] = await Promise.all([
      loadCategories(),
      loadTransactions(),
      loadBudgets(),
      loadRecurring(),
    ]);

    // Ensure system categories (Thu nợ, Trả nợ, Tiết kiệm) exist for existing users
    const existingIds = new Set(categories.map((c) => c.id));
    const added = await ensureSystemCategories(existingIds);
    if (added.length > 0) {
      categories = [...added, ...categories];
    }

    // Auto-generate recurring transactions that have passed their dayOfMonth
    // this month and haven't been inserted yet. Idempotent — safe to re-run.
    const now = new Date();
    const todayMs = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const monthKey = currentMonthKey();
    const { start, end } = monthRange(monthKey);
    const monthTxns = transactions.filter(
      (t) => t.date >= start && t.date < end,
    );
    const generated: Transaction[] = [];

    for (const rule of recurring) {
      const lastDayOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();
      const day = Math.min(rule.dayOfMonth, lastDayOfMonth);
      const targetMs = new Date(
        now.getFullYear(),
        now.getMonth(),
        day,
        12,
        0,
        0,
      ).getTime();
      if (targetMs > todayMs) continue;
      if (monthTxns.some((t) => t.recurringId === rule.id)) continue;

      const txn: Transaction = {
        id: newId(),
        type: rule.type,
        amount: rule.amount,
        categoryId: rule.categoryId,
        note: rule.note,
        date: targetMs,
        recurringId: rule.id,
        createdAt: Date.now(),
      };
      await dbInsertTransaction(txn);
      generated.push(txn);
    }

    set({
      categories,
      transactions: [...generated, ...transactions],
      budgets,
      recurring,
      ready: true,
    });
  },

  // ----- month navigation -----
  setActiveMonth: (month) => set({ activeMonth: month }),
  stepMonth: (delta) =>
    set((state) => ({ activeMonth: addMonths(state.activeMonth, delta) })),

  // ----- mutations -----
  addTransaction: async (input) => {
    const { savingsGoalId, debtId, ...rest } = input as any;
    const txn: Transaction = {
      ...rest,
      id: newId(),
      createdAt: Date.now(),
    };
    await dbInsertTransaction(txn);
    set((state) => ({ transactions: [txn, ...state.transactions] }));

    if (savingsGoalId) {
      try {
        const { useSavingsStore } = await import('@/store/savingsStore');
        const savings = useSavingsStore.getState();
        if (!savings.ready) await savings.init();
        await savings.addContribution(
          savingsGoalId,
          txn.amount,
          txn.date,
          txn.note ?? '',
          false,
        );
      } catch (e) {
        console.warn('Failed to sync transaction to savings goal', e);
      }
    } else if (debtId) {
      try {
        const { useDebtStore } = await import('@/store/debtStore');
        const debt = useDebtStore.getState();
        if (!debt.ready) await debt.init();
        await debt.addPayment(
          debtId,
          txn.amount,
          txn.date,
          txn.note ?? '',
          'cash',
          undefined,
          false,
        );
      } catch (e) {
        console.warn('Failed to sync transaction to debt payment', e);
      }
    }
  },

  deleteTransaction: async (id) => {
    await dbDeleteTransaction(id);
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
  },

  updateTransaction: async (id, patch) => {
    const { runSql } = await import('@/db/database');
    const existing = get().transactions.find((t) => t.id === id);
    if (!existing) return;
    const updated = { ...existing, ...patch };
    await runSql(
      'UPDATE transactions SET type=?, amount=?, categoryId=?, note=?, date=? WHERE id=?;',
      [
        updated.type,
        updated.amount,
        updated.categoryId,
        updated.note ?? null,
        updated.date,
        id,
      ],
    );
    set((s) => ({
      transactions: s.transactions.map((t) => (t.id === id ? updated : t)),
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

    const budgetUsed = budget > 0 ? spent / budget : 0;

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
    const { activeMonth, transactions, categories, budgets } = get();
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
      const catBudget =
        budgets.find(
          (b) => b.categoryId === category.id && b.month === activeMonth,
        )?.amount ?? 0;
      result.push({
        categoryId: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        amount,
        pct: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
        budget: catBudget,
        budgetUsed: catBudget > 0 ? amount / catBudget : 0,
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

  getMonthlyTrends: (numMonths: number): MonthlyOverview[] => {
    const { activeMonth, transactions, budgets } = get();
    const result: MonthlyOverview[] = [];

    for (let i = numMonths - 1; i >= 0; i--) {
      const month = addMonths(activeMonth, -i);
      const { start, end } = monthRange(month);
      let income = 0;
      let spent = 0;
      for (const t of transactions) {
        if (t.date < start || t.date >= end) continue;
        if (t.type === 'income') income += t.amount;
        else spent += t.amount;
      }
      const budget = budgets
        .filter((b) => b.month === month)
        .reduce((s, b) => s + b.amount, 0);
      const budgetUsed = budget > 0 ? spent / budget : 0;
      result.push({
        month,
        spent,
        income,
        saved: income - spent,
        budget,
        budgetUsed,
        remaining: budget - spent,
      });
    }

    return result;
  },

  getWeeklyOverview: (weekKey: string): WeeklyOverview => {
    const { transactions, budgets } = get();
    const { start, end } = weekRange(weekKey);

    let income = 0;
    let spent = 0;
    for (const t of transactions) {
      if (t.date < start || t.date >= end) continue;
      if (t.type === 'income') income += t.amount;
      else spent += t.amount;
    }

    const budget = getWeeklyBudget(budgets, start);

    const budgetUsed = budget > 0 ? spent / budget : 0;

    return {
      week: weekKey,
      spent,
      income,
      saved: income - spent,
      budget,
      budgetUsed,
      remaining: budget - spent,
    };
  },

  getWeeklyCategorySpend: (weekKey: string): WeeklyCategorySpend[] => {
    const { transactions, categories, budgets } = get();
    const { start, end } = weekRange(weekKey);

    const totals = new Map<string, number>();
    let totalExpense = 0;
    for (const t of transactions) {
      if (t.type !== 'expense') continue;
      if (t.date < start || t.date >= end) continue;
      totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
      totalExpense += t.amount;
    }

    const result: WeeklyCategorySpend[] = [];
    for (const category of categories) {
      const amount = totals.get(category.id) ?? 0;
      if (amount <= 0) continue;
      const catBudget = getWeeklyBudget(budgets, start, category.id);
      result.push({
        categoryId: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        amount,
        pct: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
        budget: catBudget,
        budgetUsed: catBudget > 0 ? amount / catBudget : 0,
      });
    }

    return result.sort((a, b) => b.amount - a.amount);
  },

  getWeeklyTrends: (numWeeks: number): WeeklyOverview[] => {
    const { transactions, budgets } = get();
    const result: WeeklyOverview[] = [];
    const now = Date.now();

    for (let i = numWeeks - 1; i >= 0; i--) {
      const targetTime = now - i * 7 * 86_400_000;
      const weekKey = getWeekKey(targetTime);
      const { start, end } = weekRange(weekKey);

      let income = 0;
      let spent = 0;
      for (const t of transactions) {
        if (t.date < start || t.date >= end) continue;
        if (t.type === 'income') income += t.amount;
        else spent += t.amount;
      }

      const budget = getWeeklyBudget(budgets, start);

      const budgetUsed = budget > 0 ? spent / budget : 0;

      result.push({
        week: weekKey,
        spent,
        income,
        saved: income - spent,
        budget,
        budgetUsed,
        remaining: budget - spent,
      });
    }

    return result;
  },
}));
