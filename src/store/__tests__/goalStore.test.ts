import { computeGoalProgress } from '../goalStore';
import type { Goal } from '@/types/goal';
import type { Task } from '@/types/task';

describe('goalStore', () => {
  describe('computeGoalProgress', () => {
    it('should compute progress correctly based on milestones and tasks', () => {
      const goal: Goal = {
        id: 'goal-1',
        title: 'Test Goal',
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        milestones: [
          { id: 'm1', goalId: 'goal-1', title: 'Milestone 1', done: true, createdAt: Date.now() },
          { id: 'm2', goalId: 'goal-1', title: 'Milestone 2', done: false, createdAt: Date.now() },
        ],
      };

      const linkedTasks: Task[] = [
        {
          id: 'task-1',
          title: 'Linked Task 1',
          priority: 'P1',
          done: true,
          goalId: 'goal-1',
          createdAt: Date.now(),
        },
      ];

      const progress = computeGoalProgress(goal, linkedTasks);
      // Total should be: 2 milestones + 1 contributing task = 3 items.
      // Done should be: 1 milestone (m1) + 1 task (task-1) = 2.
      expect(progress.total).toBe(3);
      expect(progress.done).toBe(2);
      expect(progress.pct).toBe(67);
      expect(progress.complete).toBe(false);
    });
  });
});
