import { create } from 'zustand';

import { allRows, runSql } from '@/db/database';
import { SYS_CAT } from '@/data/seed';
import { calcAccruedInterest } from '@/utils/financeMath';
import {
  cancelNotification,
  scheduleNotification,
} from '@/services/notifications';
import type {
  DebtEntry,
  DebtPayment,
  DebtNetting,
  DebtState,
  DebtStatus,
  DebtSummary,
  DebtView,
} from '@/types/debt';

function newId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildView(entry: DebtEntry, payments: DebtPayment[]): DebtView {
  const entryPayments = payments.filter((p) => p.debtId === entry.id);
  const paidAmount = entryPayments.reduce((s, p) => s + p.amount, 0);
  const accruedInterest = calcAccruedInterest(entry, entryPayments);
  const remainingPrincipal = Math.max(0, entry.originalAmount - paidAmount);
  const totalOwed = remainingPrincipal + accruedInterest;
  const progressPct =
    entry.originalAmount > 0
      ? Math.min(1, paidAmount / entry.originalAmount)
      : 0;
  const now = Date.now();
  const isOverdue =
    entry.status !== 'settled' && !!entry.dueDate && now > entry.dueDate;
  const daysUntilDue = entry.dueDate
    ? Math.round((entry.dueDate - now) / 86_400_000)
    : null;

  return {
    ...entry,
    payments: entryPayments.sort((a, b) => b.date - a.date),
    paidAmount,
    accruedInterest,
    remainingPrincipal,
    totalOwed,
    progressPct,
    isOverdue,
    daysUntilDue,
  };
}

// ---------------------------------------------------------------------------
// DB row mappers
// ---------------------------------------------------------------------------

interface DebtEntryRow {
  id: string;
  user_id: string | null;
  type: string;
  party: string;
  original_amount: number;
  note: string | null;
  start_date: number;
  due_date: number | null;
  interest_type: string;
  interest_rate: number | null;
  interest_period: string | null;
  status: string;
  linked_transaction_id: string | null;
  created_at: number;
}

interface DebtPaymentRow {
  id: string;
  debt_id: string;
  amount: number;
  date: number;
  note: string | null;
  payment_method: string | null;
  linked_netting_id: string | null;
  created_at: number;
}

interface DebtNettingRow {
  id: string;
  user_id: string | null;
  party: string;
  amount: number;
  date: number;
  note: string | null;
  created_at: number;
}

function mapEntry(r: DebtEntryRow): DebtEntry {
  return {
    id: r.id,
    userId: r.user_id ?? undefined,
    type: r.type as DebtEntry['type'],
    party: r.party,
    originalAmount: r.original_amount,
    note: r.note ?? undefined,
    startDate: r.start_date,
    dueDate: r.due_date ?? undefined,
    interestType: r.interest_type as DebtEntry['interestType'],
    interestRate: r.interest_rate ?? undefined,
    interestPeriod:
      (r.interest_period as DebtEntry['interestPeriod']) ?? undefined,
    status: r.status as DebtStatus,
    linkedTransactionId: r.linked_transaction_id ?? undefined,
    createdAt: r.created_at,
  };
}

function mapPayment(r: DebtPaymentRow): DebtPayment {
  return {
    id: r.id,
    debtId: r.debt_id,
    amount: r.amount,
    date: r.date,
    note: r.note ?? undefined,
    paymentMethod: (r.payment_method as DebtPayment['paymentMethod']) ?? undefined,
    linkedNettingId: r.linked_netting_id ?? undefined,
    createdAt: r.created_at,
  };
}

function mapNetting(r: DebtNettingRow): DebtNetting {
  return {
    id: r.id,
    userId: r.user_id ?? undefined,
    party: r.party,
    amount: r.amount,
    date: r.date,
    note: r.note ?? undefined,
    createdAt: r.created_at,
  };
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

function syncDebtNotifications(entry: DebtEntry) {
  const t3Id = `debt-${entry.id}-t3`;
  const t0Id = `debt-${entry.id}-t0`;

  if (entry.status === 'settled' || !entry.dueDate) {
    cancelNotification(t3Id);
    cancelNotification(t0Id);
    return;
  }

  // Set notification to 9:00 AM of the target day
  const d = new Date(entry.dueDate);
  d.setHours(9, 0, 0, 0);

  const t0 = d.getTime();
  const t3 = t0 - 3 * 86_400_000; // 3 days before

  const verb = entry.type === 'lend' ? 'Thu nợ' : 'Trả nợ';

  // Non-blocking fire-and-forget
  scheduleNotification(
    t3Id,
    `Sắp đến hạn ${verb.toLowerCase()}`,
    `Bạn có khoản ${verb.toLowerCase()} với ${entry.party} trong 3 ngày tới.`,
    t3,
  );

  scheduleNotification(
    t0Id,
    `Đến hạn ${verb.toLowerCase()}`,
    `Hôm nay là ngày hạn ${verb.toLowerCase()} với ${entry.party}.`,
    t0,
  );
}

function cancelDebtNotifications(id: string) {
  cancelNotification(`debt-${id}-t3`);
  cancelNotification(`debt-${id}-t0`);
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useDebtStore = create<DebtState>()((set, get) => ({
  entries: [],
  payments: [],
  nettings: [],
  ready: false,

  init: async () => {
    const [entries, payments, nettings] = await Promise.all([
      allRows<DebtEntryRow>(
        'SELECT * FROM debt_entries ORDER BY created_at DESC;',
      ),
      allRows<DebtPaymentRow>(
        'SELECT * FROM debt_payments ORDER BY date DESC;',
      ),
      allRows<DebtNettingRow>(
        'SELECT * FROM debt_nettings ORDER BY date DESC;',
      ),
    ]);
    set({
      entries: entries.map(mapEntry),
      payments: payments.map(mapPayment),
      nettings: nettings.map(mapNetting),
      ready: true,
    });
  },

  addDebt: async (input) => {
    const entry: DebtEntry = {
      ...input,
      id: newId(),
      status: 'open',
      createdAt: Date.now(),
    };
    await runSql(
      `INSERT INTO debt_entries
        (id, user_id, type, party, original_amount, note, start_date, due_date,
         interest_type, interest_rate, interest_period, status, linked_transaction_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        entry.id,
        entry.userId ?? null,
        entry.type,
        entry.party,
        entry.originalAmount,
        entry.note ?? null,
        entry.startDate,
        entry.dueDate ?? null,
        entry.interestType,
        entry.interestRate ?? null,
        entry.interestPeriod ?? null,
        entry.status,
        entry.linkedTransactionId ?? null,
        entry.createdAt,
      ],
    );
    set((s) => ({ entries: [entry, ...s.entries] }));
    syncDebtNotifications(entry);
  },

  updateDebt: async (id, patch) => {
    const existing = get().entries.find((e) => e.id === id);
    if (!existing) return;
    const updated = { ...existing, ...patch };
    await runSql(
      `UPDATE debt_entries SET party=?, original_amount=?, note=?, due_date=?, interest_type=?, interest_rate=?, interest_period=? WHERE id=?;`,
      [
        updated.party,
        updated.originalAmount,
        updated.note ?? null,
        updated.dueDate ?? null,
        updated.interestType,
        updated.interestRate ?? null,
        updated.interestPeriod ?? null,
        id,
      ],
    );
    set((s) => ({
      entries: s.entries.map((e) => (e.id === id ? updated : e)),
    }));
    syncDebtNotifications(updated);
  },

  deleteDebt: async (id) => {
    await runSql('DELETE FROM debt_entries WHERE id = ?;', [id]);
    set((s) => ({
      entries: s.entries.filter((e) => e.id !== id),
      payments: s.payments.filter((p) => p.debtId !== id),
    }));
    cancelDebtNotifications(id);
  },

  addPayment: async (debtId, amount, date, note, paymentMethod = 'cash', linkedNettingId, linkTxn = true) => {
    const payment: DebtPayment = {
      id: newId(),
      debtId,
      amount,
      date,
      note,
      paymentMethod,
      linkedNettingId,
      createdAt: Date.now(),
    };
    await runSql(
      `INSERT INTO debt_payments (id, debt_id, amount, date, note, payment_method, linked_netting_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        payment.id,
        payment.debtId,
        payment.amount,
        payment.date,
        payment.note ?? null,
        paymentMethod,
        payment.linkedNettingId ?? null,
        payment.createdAt,
      ],
    );

    // Auto-sync with Finance: log a transaction if paying via cash
    if (paymentMethod === 'cash' && linkTxn) {
      try {
        const { useFinanceStore } = await import('@/store/financeStore');
        const entry = get().entries.find((e) => e.id === debtId);
        if (entry) {
          const categoryId = entry.type === 'lend' ? SYS_CAT.debtIncome : SYS_CAT.debtExpense;
          await useFinanceStore.getState().addTransaction({
            type: entry.type === 'lend' ? 'income' : 'expense',
            amount,
            categoryId,
            note: entry.type === 'lend' 
              ? `Thu nợ từ ${entry.party}${note ? `: ${note}` : ''}` 
              : `Trả nợ ${entry.party}${note ? `: ${note}` : ''}`,
            date,
          });
        }
      } catch (e) {
        console.warn('Failed to link debt payment to finance transaction', e);
      }
    }

    // Recalculate status
    const { entries, payments: existingPayments } = get();
    const allPayments = [payment, ...existingPayments];
    const entry = entries.find((e) => e.id === debtId);
    if (entry) {
      const paidAmount = allPayments
        .filter((p) => p.debtId === debtId)
        .reduce((s, p) => s + p.amount, 0);
      const newStatus: DebtStatus =
        paidAmount >= entry.originalAmount ? 'settled' : 'partial';
      if (newStatus !== entry.status) {
        await runSql('UPDATE debt_entries SET status=? WHERE id=?;', [
          newStatus,
          debtId,
        ]);
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === debtId ? { ...e, status: newStatus } : e,
          ),
        }));
        syncDebtNotifications({ ...entry, status: newStatus });
      }
    }

    set((s) => ({ payments: [payment, ...s.payments] }));
  },

  deletePayment: async (paymentId, debtId, amount) => {
    await runSql('DELETE FROM debt_payments WHERE id = ?;', [paymentId]);
    const { entries, payments } = get();
    const remaining = payments.filter((p) => p.id !== paymentId);
    const paidAmount = remaining
      .filter((p) => p.debtId === debtId)
      .reduce((s, p) => s + p.amount, 0);
    const entry = entries.find((e) => e.id === debtId);
    if (entry) {
      const newStatus: DebtStatus = paidAmount <= 0 ? 'open' : 'partial';
      if (newStatus !== entry.status) {
        await runSql('UPDATE debt_entries SET status=? WHERE id=?;', [
          newStatus,
          debtId,
        ]);
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === debtId ? { ...e, status: newStatus } : e,
          ),
        }));
        syncDebtNotifications({ ...entry, status: newStatus });
      }
    }
    set(() => ({ payments: remaining }));
  },

  settleDebt: async (id, linkToFinance = true) => {
    const view = get().getDebtView(id);
    if (!view) return;

    let linkedTransactionId: string | undefined;

    if (linkToFinance) {
      const { useFinanceStore } = await import('@/store/financeStore');
      const categoryId =
        view.type === 'lend' ? SYS_CAT.debtIncome : SYS_CAT.debtExpense;
      await useFinanceStore.getState().addTransaction({
        type: view.type === 'lend' ? 'income' : 'expense',
        amount: view.totalOwed > 0 ? view.totalOwed : view.originalAmount,
        categoryId,
        note:
          view.type === 'lend'
            ? `Thu nợ từ ${view.party}`
            : `Trả nợ ${view.party}`,
        date: Date.now(),
      });
      const txns = useFinanceStore.getState().transactions;
      linkedTransactionId = txns[0]?.id;
    }

    await runSql(
      'UPDATE debt_entries SET status=?, linked_transaction_id=? WHERE id=?;',
      ['settled', linkedTransactionId ?? null, id],
    );
    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === id ? { ...e, status: 'settled', linkedTransactionId } : e,
      ),
    }));
    cancelDebtNotifications(id);
  },

  addNetting: async (party, amount, borrowId, lendId, note) => {
    const netting: DebtNetting = {
      id: newId(),
      party,
      amount,
      date: Date.now(),
      note: note || `Cấn trừ nợ tự động với ${party}`,
      createdAt: Date.now(),
    };

    await runSql(
      `INSERT INTO debt_nettings (id, user_id, party, amount, date, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        netting.id,
        null,
        netting.party,
        netting.amount,
        netting.date,
        netting.note ?? null,
        netting.createdAt,
      ],
    );

    // Call addPayment for both debt entries
    await get().addPayment(borrowId, amount, netting.date, netting.note, 'netting', netting.id);
    await get().addPayment(lendId, amount, netting.date, netting.note, 'netting', netting.id);

    set((s) => ({
      nettings: [netting, ...s.nettings],
    }));
  },

  getDebtView: (id) => {
    const { entries, payments } = get();
    const entry = entries.find((e) => e.id === id);
    if (!entry) return null;
    return buildView(entry, payments);
  },

  getSummary: (): DebtSummary => {
    const { entries, payments } = get();
    const now = Date.now();
    const upcoming = now + 7 * 86_400_000;
    let totalReceivable = 0;
    let totalPayable = 0;
    let overdueCount = 0;
    let upcomingCount = 0;

    for (const entry of entries) {
      if (entry.status === 'settled') continue;
      const view = buildView(entry, payments);
      if (entry.type === 'lend') totalReceivable += view.totalOwed;
      else totalPayable += view.totalOwed;
      if (view.isOverdue) overdueCount++;
      else if (entry.dueDate && entry.dueDate <= upcoming) upcomingCount++;
    }

    return { totalReceivable, totalPayable, overdueCount, upcomingCount };
  },
}));
