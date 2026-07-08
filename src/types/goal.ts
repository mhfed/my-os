export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  done: boolean;
  linkedTaskId?: string;
  createdAt: number;
}

export type GoalStatus = 'active' | 'completed' | 'dropped';

export interface Goal {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  deadline?: number;
  status: GoalStatus;
  dropReason?: string;
  savingsGoalId?: string;
  habitId?: string;
  createdAt: number;
  updatedAt: number;
  milestones: Milestone[];
}

export interface GoalState {
  goals: Goal[];
  ready: boolean;

  init: () => Promise<void>;
  createGoal: (input: {
    title: string;
    description?: string;
    deadline?: number;
    milestones: string[];
    savingsGoalId?: string;
    habitId?: string;
  }) => Promise<void>;
  updateGoal: (
    id: string,
    updates: {
      title: string;
      description?: string;
      deadline?: number;
      newMilestones?: string[];
      savingsGoalId?: string;
      habitId?: string;
    },
  ) => Promise<void>;
  updateGoalStatus: (
    id: string,
    status: GoalStatus,
    dropReason?: string,
  ) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}
