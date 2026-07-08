import type { DebtEntry, DebtPayment } from '@/types/debt';
import type { Budget } from '@/types/finance';

/**
 * Calculates interest accrued on a debt entry over time, taking partial payments into account.
 * For Simple interest: interest = sum of (principal_in_period * rate * elapsed_time).
 * For Compound interest: balance compounds at each interval; payments are subtracted from this compounding balance.
 */
export function calcAccruedInterest(
  entry: Pick<DebtEntry, 'id' | 'startDate' | 'originalAmount' | 'interestType' | 'interestRate' | 'interestPeriod'>,
  payments: DebtPayment[],
  now: number = Date.now()
): number {
  if (entry.interestType === 'none' || !entry.interestRate) return 0;
  const rate = entry.interestRate / 100;
  const msPerPeriod =
    entry.interestPeriod === 'year'
      ? 365.25 * 24 * 3600 * 1000
      : 30.44 * 24 * 3600 * 1000;

  // Filter and sort payments chronologically that occurred between startDate and now
  const sortedPayments = [...payments]
    .filter((p) => p.debtId === entry.id && p.date > entry.startDate && p.date <= now)
    .sort((a, b) => a.date - b.date);

  let lastTime = entry.startDate;

  if (entry.interestType === 'simple') {
    let interestAccrued = 0;
    let currentPrincipal = entry.originalAmount;
    for (const p of sortedPayments) {
      const elapsed = (p.date - lastTime) / msPerPeriod;
      interestAccrued += currentPrincipal * rate * elapsed;
      currentPrincipal = Math.max(0, currentPrincipal - p.amount);
      lastTime = p.date;
    }
    const elapsedToNow = (now - lastTime) / msPerPeriod;
    interestAccrued += currentPrincipal * rate * elapsedToNow;
    return Math.round(interestAccrued);
  }

  if (entry.interestType === 'compound') {
    let balance = entry.originalAmount;
    for (const p of sortedPayments) {
      const elapsed = (p.date - lastTime) / msPerPeriod;
      balance = balance * Math.pow(1 + rate, elapsed);
      balance = Math.max(0, balance - p.amount);
      lastTime = p.date;
    }
    const elapsedToNow = (now - lastTime) / msPerPeriod;
    balance = balance * Math.pow(1 + rate, elapsedToNow);

    const totalPaid = sortedPayments.reduce((sum, p) => sum + p.amount, 0);
    const remainingPrincipal = Math.max(0, entry.originalAmount - totalPaid);
    return Math.round(Math.max(0, balance - remainingPrincipal));
  }

  return 0;
}

/**
 * Calculates weekly budget proportionally.
 * Loops through the 7 days of the week, finds the monthly budget for that day's month,
 * and sums the daily proportion of that monthly budget.
 */
export function getWeeklyBudget(
  budgets: Budget[],
  startOfWeekMs: number,
  categoryId?: string
): number {
  let totalWeeklyBudget = 0;
  for (let i = 0; i < 7; i++) {
    const dayMs = startOfWeekMs + i * 24 * 3600 * 1000;
    const date = new Date(dayMs);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    // Filter budgets matching the target month & category if specified
    const monthBudgets = budgets.filter(
      (b) => b.month === monthKey && (!categoryId || b.categoryId === categoryId)
    );
    const budgetSum = monthBudgets.reduce((sum, b) => sum + b.amount, 0);

    // Number of days in this month
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    totalWeeklyBudget += budgetSum / daysInMonth;
  }
  return Math.round(totalWeeklyBudget);
}

/**
 * Calculates the monthly needed savings for a savings goal.
 * Safely caps the monthly needed amount at the remaining target if the deadline is less than 1 month away.
 */
export function calcMonthlyNeeded(
  targetAmount: number,
  currentAmount: number,
  deadline: number | undefined,
  now: number = Date.now()
): number | null {
  if (!deadline) return null;
  const remaining = Math.max(0, targetAmount - currentAmount);
  if (remaining <= 0) return 0;
  if (now >= deadline) return remaining;

  const msPerMonth = 30.44 * 24 * 3600 * 1000;
  const monthsLeft = (deadline - now) / msPerMonth;

  if (monthsLeft < 1.0) {
    return remaining;
  }
  return Math.ceil(remaining / monthsLeft);
}
