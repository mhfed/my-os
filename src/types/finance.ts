/**
 * Finance domain model — Phase 2 · Finance Tracker (PersonalOS PRD §3.2).
 *
 * This file is the SHARED CONTRACT between the data layer (SQLite + Zustand
 * store) and the Finance UI. Both sides import from here; neither redefines
 * these shapes. The data model is multi-user-ready (every row carries an
 * optional `userId`) per the PRD architecture note.
 */

export type TxnType = 'income' | 'expense';

/** A user-editable spending/earning category (PRD: "Categories tùy chỉnh"). */
export interface Category {
  id: string;
  userId?: string;
  name: string;
  type: TxnType;
  /** Hex color used for chart slices, legend dots and icon chips. */
  color: string;
  /** Tabler icon name, e.g. "coffee", "car", "shopping-cart". */
  icon: string;
  createdAt: number;
}

/** A single money movement (PRD: "Ghi giao dịch nhanh"). */
export interface Transaction {
  id: string;
  userId?: string;
  type: TxnType;
  /** Positive integer in VND (đồng). Sign is derived from `type`. */
  amount: number;
  categoryId: string;
  note?: string;
  /** Epoch ms of when the transaction occurred. */
  date: number;
  /** Marks rows generated from a recurring rule (PRD: "Recurring transaction"). */
  recurringId?: string;
  createdAt: number;
}

/** A monthly budget cap for a category (PRD: "Ngân sách (Budget)"). */
export interface Budget {
  id: string;
  userId?: string;
  categoryId: string;
  /** Cap in VND for the given month. */
  amount: number;
  /** Month key "YYYY-MM". */
  month: string;
  createdAt: number;
}

/** Fixed monthly expense template (PRD: "Recurring transaction"). */
export interface RecurringRule {
  id: string;
  userId?: string;
  type: TxnType;
  amount: number;
  categoryId: string;
  note?: string;
  /** 1–28: day of month the charge recurs. */
  dayOfMonth: number;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Derived view-models — computed by the store, consumed by the UI.
// ---------------------------------------------------------------------------

/** Top summary card: total spent vs. total monthly budget. */
export interface MonthlyOverview {
  month: string; // "YYYY-MM"
  spent: number;
  income: number;
  saved: number; // income - spent
  budget: number; // sum of category budgets for the month
  /** 0–1 fraction of budget consumed. */
  budgetUsed: number;
  remaining: number; // budget - spent (can be negative)
}

/** One slice in the "By category" donut + legend. */
export interface CategorySpend {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  amount: number;
  /** 0–100, share of total expense for the month. */
  pct: number;
}

/** A transaction joined with its category, ready to render in a row. */
export interface TransactionView {
  id: string;
  name: string; // note || category name
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
  type: TxnType;
  date: number;
}

// ---------------------------------------------------------------------------
// Zustand store contract — implemented in src/store/financeStore.ts,
// consumed by the Finance screen via `useFinanceStore`.
// ---------------------------------------------------------------------------

export interface FinanceState {
  /** Currently-viewed month, "YYYY-MM". Drives every selector below. */
  activeMonth: string;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  recurring: RecurringRule[];
  ready: boolean;

  // lifecycle
  /** Loads data from SQLite (seeding on first run) and marks `ready`. */
  init: () => Promise<void>;

  // month navigation
  setActiveMonth: (month: string) => void;
  stepMonth: (delta: number) => void;

  // mutations (persist to SQLite)
  addTransaction: (
    input: Omit<Transaction, 'id' | 'createdAt'>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (input: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  setBudget: (categoryId: string, amount: number, month: string) => Promise<void>;

  // selectors (derived view-models for the active month)
  getOverview: () => MonthlyOverview;
  getCategorySpend: () => CategorySpend[];
  getTransactionViews: (limit?: number) => TransactionView[];
}
