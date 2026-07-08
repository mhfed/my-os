import { create } from 'zustand';

import { allRows, runSql } from '@/db/database';
import { SYS_CAT } from '@/data/seed';
import { calcMonthlyNeeded } from '@/utils/financeMath';
import type {
  SavingsContribution,
  SavingsGoal,
  SavingsGoalView,
  SavingsState,
  SavingsStatus,
} from '@/types/savings';

function newId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---------------------------------------------------------------------------
// View builder
// ---------------------------------------------------------------------------

function buildView(goal: SavingsGoal, contributions: SavingsContribution[]): SavingsGoalView {
  const goalContributions = contributions.filter((c) => c.goalId === goal.id);
  const progressPct =
    goal.targetAmount > 0
      ? Math.min(1, goal.currentAmount / goal.targetAmount)
      : 0;
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const isAchieved = goal.currentAmount >= goal.targetAmount;
  const now = Date.now();

  let daysUntilDeadline: number | null = null;
  let isOverdue = false;
  let monthlyNeeded: number | null = null;

  if (goal.deadline) {
    daysUntilDeadline = Math.round((goal.deadline - now) / 86_400_000);
    isOverdue = !isAchieved && now > goal.deadline;
    if (!isOverdue && remaining > 0) {
      monthlyNeeded = calcMonthlyNeeded(goal.targetAmount, goal.currentAmount, goal.deadline, now);
    }
  }

  return {
    ...goal,
    contributions: goalContributions.sort((a, b) => b.date - a.date),
    progressPct,
    remaining,
    monthlyNeeded,
    isAchieved,
    daysUntilDeadline,
    isOverdue,
  };
}

// ---------------------------------------------------------------------------
// DB row mappers
// ---------------------------------------------------------------------------

interface SavingsGoalRow {
  id: string;
  user_id: string | null;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: number | null;
  icon: string;
  color: string;
  note: string | null;
  status: string;
  created_at: number;
}

interface SavingsContributionRow {
  id: string;
  goal_id: string;
  amount: number;
  date: number;
  note: string | null;
  linked_transaction_id: string | null;
  created_at: number;
}

function mapGoal(r: SavingsGoalRow): SavingsGoal {
  return {
    id: r.id,
    userId: r.user_id ?? undefined,
    name: r.name,
    targetAmount: r.target_amount,
    currentAmount: r.current_amount,
    deadline: r.deadline ?? undefined,
    icon: r.icon,
    color: r.color,
    note: r.note ?? undefined,
    status: r.status as SavingsStatus,
    createdAt: r.created_at,
  };
}

function mapContribution(r: SavingsContributionRow): SavingsContribution {
  return {
    id: r.id,
    goalId: r.goal_id,
    amount: r.amount,
    date: r.date,
    note: r.note ?? undefined,
    linkedTransactionId: r.linked_transaction_id ?? undefined,
    createdAt: r.created_at,
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSavingsStore = create<SavingsState>()((set, get) => ({
  goals: [],
  contributions: [],
  ready: false,

  init: async () => {
    const [goals, contributions] = await Promise.all([
      allRows<SavingsGoalRow>('SELECT * FROM savings_goals ORDER BY created_at DESC;'),
      allRows<SavingsContributionRow>('SELECT * FROM savings_contributions ORDER BY date DESC;'),
    ]);
    set({
      goals: goals.map(mapGoal),
      contributions: contributions.map(mapContribution),
      ready: true,
    });
  },

  addGoal: async (input) => {
    const goal: SavingsGoal = {
      ...input,
      id: newId(),
      currentAmount: 0,
      status: 'active',
      createdAt: Date.now(),
    };
    await runSql(
      `INSERT INTO savings_goals
        (id, user_id, name, target_amount, current_amount, deadline, icon, color, note, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        goal.id,
        goal.userId ?? null,
        goal.name,
        goal.targetAmount,
        0,
        goal.deadline ?? null,
        goal.icon,
        goal.color,
        goal.note ?? null,
        goal.status,
        goal.createdAt,
      ],
    );
    set((s) => ({ goals: [goal, ...s.goals] }));
  },

  updateGoal: async (id, patch) => {
    const existing = get().goals.find((g) => g.id === id);
    if (!existing) return;
    const updated = { ...existing, ...patch };
    await runSql(
      'UPDATE savings_goals SET name=?, target_amount=?, deadline=?, icon=?, color=?, note=? WHERE id=?;',
      [
        updated.name,
        updated.targetAmount,
        updated.deadline ?? null,
        updated.icon,
        updated.color,
        updated.note ?? null,
        id,
      ],
    );
    set((s) => ({ goals: s.goals.map((g) => (g.id === id ? updated : g)) }));
  },

  deleteGoal: async (id) => {
    await runSql('DELETE FROM savings_goals WHERE id = ?;', [id]);
    set((s) => ({
      goals: s.goals.filter((g) => g.id !== id),
      contributions: s.contributions.filter((c) => c.goalId !== id),
    }));
  },

  addContribution: async (goalId, amount, date, note, linkTxn = false) => {
    const contribution: SavingsContribution = {
      id: newId(),
      goalId,
      amount,
      date,
      note,
      createdAt: Date.now(),
    };

    let linkedTransactionId: string | undefined;
    if (linkTxn) {
      const { useFinanceStore } = await import('@/store/financeStore');
      const goal = get().goals.find((g) => g.id === goalId);
      await useFinanceStore.getState().addTransaction({
        type: 'expense',
        amount,
        categoryId: SYS_CAT.savings,
        note: `Tiết kiệm: ${goal?.name ?? ''}`,
        date,
      });
      const txns = useFinanceStore.getState().transactions;
      linkedTransactionId = txns[0]?.id;
      contribution.linkedTransactionId = linkedTransactionId;
    }

    await runSql(
      `INSERT INTO savings_contributions
        (id, goal_id, amount, date, note, linked_transaction_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        contribution.id,
        contribution.goalId,
        contribution.amount,
        contribution.date,
        contribution.note ?? null,
        contribution.linkedTransactionId ?? null,
        contribution.createdAt,
      ],
    );

    const newCurrentAmount = (get().goals.find((g) => g.id === goalId)?.currentAmount ?? 0) + amount;
    await runSql('UPDATE savings_goals SET current_amount=? WHERE id=?;', [newCurrentAmount, goalId]);

    set((s) => ({
      contributions: [contribution, ...s.contributions],
      goals: s.goals.map((g) =>
        g.id === goalId ? { ...g, currentAmount: newCurrentAmount } : g,
      ),
    }));
  },

  markAchieved: async (id) => {
    await runSql('UPDATE savings_goals SET status=? WHERE id=?;', ['achieved', id]);
    set((s) => ({
      goals: s.goals.map((g) => (g.id === id ? { ...g, status: 'achieved' } : g)),
    }));
  },

  getGoalView: (id) => {
    const { goals, contributions } = get();
    const goal = goals.find((g) => g.id === id);
    if (!goal) return null;
    return buildView(goal, contributions);
  },

  getActiveGoals: () => {
    const { goals, contributions } = get();
    return goals
      .filter((g) => g.status === 'active')
      .map((g) => buildView(g, contributions))
      .sort((a, b) => {
        if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
        return b.progressPct - a.progressPct;
      });
  },
}));
