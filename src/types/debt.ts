export type DebtType = 'lend' | 'borrow';
export type InterestType = 'none' | 'simple' | 'compound';
export type InterestPeriod = 'month' | 'year';
export type DebtStatus = 'open' | 'partial' | 'settled';

export interface DebtEntry {
  id: string;
  userId?: string;
  type: DebtType;
  party: string;
  originalAmount: number;
  note?: string;
  startDate: number;
  dueDate?: number;
  /** Percentage, e.g. 10 means 10% per interestPeriod. */
  interestRate?: number;
  interestType: InterestType;
  interestPeriod?: InterestPeriod;
  status: DebtStatus;
  linkedTransactionId?: string;
  createdAt: number;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  date: number;
  note?: string;
  createdAt: number;
}

export interface DebtView extends DebtEntry {
  payments: DebtPayment[];
  paidAmount: number;
  accruedInterest: number;
  totalOwed: number;
  remainingPrincipal: number;
  progressPct: number;
  isOverdue: boolean;
  daysUntilDue: number | null;
}

export interface DebtSummary {
  totalReceivable: number;
  totalPayable: number;
  overdueCount: number;
  upcomingCount: number;
}

export interface DebtState {
  entries: DebtEntry[];
  payments: DebtPayment[];
  ready: boolean;
  init: () => Promise<void>;
  addDebt: (input: Omit<DebtEntry, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateDebt: (id: string, patch: Partial<Pick<DebtEntry, 'party' | 'note' | 'dueDate' | 'interestType' | 'interestRate' | 'interestPeriod'>>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  addPayment: (debtId: string, amount: number, date: number, note?: string) => Promise<void>;
  deletePayment: (paymentId: string, debtId: string, amount: number) => Promise<void>;
  settleDebt: (id: string, linkToFinance: boolean) => Promise<void>;
  getDebtView: (id: string) => DebtView | null;
  getSummary: () => DebtSummary;
}
