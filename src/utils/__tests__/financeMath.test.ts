import { calcAccruedInterest, getWeeklyBudget, calcMonthlyNeeded } from '../financeMath';
import type { DebtEntry, DebtPayment } from '@/types/debt';
import type { Budget } from '@/types/finance';

describe('financeMath', () => {
  describe('calcAccruedInterest', () => {
    const entryBase = {
      id: 'debt-1',
      startDate: 1000,
      originalAmount: 10000000, // 10M VND
      interestRate: 12, // 12%
    };

    it('should return 0 when interestType is none', () => {
      const entry = { ...entryBase, interestType: 'none' as const };
      const interest = calcAccruedInterest(entry, []);
      expect(interest).toBe(0);
    });

    it('should calculate simple interest correctly with no payments', () => {
      const entry = {
        ...entryBase,
        interestType: 'simple' as const,
        interestPeriod: 'year' as const,
      };
      // msPerPeriod = 365.25 days
      const oneYearMs = 365.25 * 24 * 3600 * 1000;
      const interest = calcAccruedInterest(entry, [], entry.startDate + oneYearMs);
      // 10M * 12% * 1 = 1.2M
      expect(interest).toBe(1200000);
    });

    it('should calculate simple interest correctly with partial payments', () => {
      const entry = {
        ...entryBase,
        interestType: 'simple' as const,
        interestPeriod: 'year' as const,
      };
      const oneYearMs = 365.25 * 24 * 3600 * 1000;
      const payments: DebtPayment[] = [
        {
          id: 'pay-1',
          debtId: 'debt-1',
          amount: 5000000, // Pay 5M after 6 months
          date: entry.startDate + oneYearMs / 2,
          createdAt: Date.now(),
        },
      ];
      const interest = calcAccruedInterest(entry, payments, entry.startDate + oneYearMs);
      // First 6 months: 10M * 0.12 * 0.5 = 600k
      // Next 6 months: 5M * 0.12 * 0.5 = 300k
      // Total: 900k
      expect(interest).toBe(900000);
    });

    it('should calculate compound interest correctly with no payments', () => {
      const entry = {
        ...entryBase,
        interestType: 'compound' as const,
        interestPeriod: 'year' as const,
      };
      const oneYearMs = 365.25 * 24 * 3600 * 1000;
      const interest = calcAccruedInterest(entry, [], entry.startDate + oneYearMs);
      // 10M * (1.12^1 - 1) = 1.2M
      expect(interest).toBe(1200000);
    });

    it('should calculate compound interest correctly with partial payments', () => {
      const entry = {
        ...entryBase,
        interestType: 'compound' as const,
        interestPeriod: 'year' as const,
      };
      const oneYearMs = 365.25 * 24 * 3600 * 1000;
      const payments: DebtPayment[] = [
        {
          id: 'pay-1',
          debtId: 'debt-1',
          amount: 5000000,
          date: entry.startDate + oneYearMs / 2,
          createdAt: Date.now(),
        },
      ];
      const interest = calcAccruedInterest(entry, payments, entry.startDate + oneYearMs);
      // First 6 months balance: 10M * (1.12 ^ 0.5) = 10,583,005.2
      // balance after payment = 10,583,005.24 - 5,000,000 = 5,583,005.24
      // End of year balance = 5,583,005.24 * (1.12 ^ 0.5) = 5,908,497.46
      // accruedInterest = 5,908,497.46 - 5,000,000 = 908,497
      expect(interest).toBe(908497);
    });
  });

  describe('getWeeklyBudget', () => {
    const budgets: Budget[] = [
      { id: 'b1', categoryId: 'cat-1', amount: 3000000, month: '2026-07', createdAt: Date.now() }, // 3M for July
      { id: 'b2', categoryId: 'cat-1', amount: 3100000, month: '2026-08', createdAt: Date.now() }, // 3.1M for August
    ];

    it('should compute weekly budget correctly within a single month', () => {
      // 2026-07-06 is Monday
      const mondayMs = new Date(2026, 6, 6).getTime();
      const weeklyBudget = getWeeklyBudget(budgets, mondayMs, 'cat-1');
      // 7 days in July. July has 31 days. Daily = 3,000,000 / 31 = 96,774.1935
      // Weekly = daily * 7 = 677,419
      expect(weeklyBudget).toBe(677419);
    });

    it('should compute weekly budget correctly across a month boundary', () => {
      // 2026-07-27 is Monday.
      // July 27, 28, 29, 30, 31 (5 days)
      // August 1, 2 (2 days)
      const mondayMs = new Date(2026, 6, 27).getTime();
      const weeklyBudget = getWeeklyBudget(budgets, mondayMs, 'cat-1');
      // July daily = 3M / 31 = 96774.1935 * 5 = 483,871
      // August daily = 3.1M / 31 = 100,000 * 2 = 200,000
      // Total = 683,871
      expect(weeklyBudget).toBe(683871);
    });
  });

  describe('calcMonthlyNeeded', () => {
    it('should return null when deadline is undefined', () => {
      expect(calcMonthlyNeeded(1000, 500, undefined)).toBeNull();
    });

    it('should return remaining amount if deadline is past', () => {
      expect(calcMonthlyNeeded(1000, 200, Date.now() - 1000)).toBe(800);
    });

    it('should return remaining amount if less than 1 month left', () => {
      const deadline = Date.now() + 15 * 24 * 3600 * 1000; // 15 days left
      expect(calcMonthlyNeeded(1000000, 200000, deadline)).toBe(800000);
    });

    it('should calculate monthly needed correctly with > 1 month left', () => {
      const deadline = Date.now() + 60.88 * 24 * 3600 * 1000; // Exactly 2 months left (2 * 30.44 days)
      expect(calcMonthlyNeeded(1000000, 200000, deadline)).toBe(400000);
    });
  });
});
