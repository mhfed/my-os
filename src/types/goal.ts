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
  }) => Promise<void>;
  updateGoalStatus: (
    id: string,
    status: GoalStatus,
    dropReason?: string,
  ) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}
