export type SavingsStatus = 'active' | 'achieved' | 'cancelled';

export interface SavingsGoal {
  id: string;
  userId?: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: number;
  icon: string;
  color: string;
  note?: string;
  status: SavingsStatus;
  createdAt: number;
}

export interface SavingsContribution {
  id: string;
  goalId: string;
  amount: number;
  date: number;
  note?: string;
  linkedTransactionId?: string;
  createdAt: number;
}

export interface SavingsGoalView extends SavingsGoal {
  contributions: SavingsContribution[];
  progressPct: number;
  remaining: number;
  monthlyNeeded: number | null;
  isAchieved: boolean;
  daysUntilDeadline: number | null;
  isOverdue: boolean;
}

export interface SavingsState {
  goals: SavingsGoal[];
  contributions: SavingsContribution[];
  ready: boolean;
  init: () => Promise<void>;
  addGoal: (input: Omit<SavingsGoal, 'id' | 'currentAmount' | 'status' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, patch: Partial<Pick<SavingsGoal, 'name' | 'targetAmount' | 'deadline' | 'icon' | 'color' | 'note'>>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addContribution: (goalId: string, amount: number, date: number, note?: string, linkTxn?: boolean) => Promise<void>;
  markAchieved: (id: string) => Promise<void>;
  getGoalView: (id: string) => SavingsGoalView | null;
  getActiveGoals: () => SavingsGoalView[];
}
