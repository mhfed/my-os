import { memo, useCallback } from 'react';
import { TaskCard } from '@/features/tasks/components/TaskCard';
import { taskTimeLabel, useTasksStore } from '@/store/tasksStore';
import type { Task } from '@/types/task';

interface TaskRowProps {
  task: Task;
  onToggle: (id: string) => void;
}

export const TaskRow = memo(function TaskRow({ task, onToggle }: TaskRowProps) {
  const toggleSubtask = useTasksStore((s) => s.toggleSubtask);

  return (
    <TaskCard
      task={task}
      timeLabel={taskTimeLabel(task)}
      overdue={false}
      onToggle={onToggle}
      onToggleSubtask={toggleSubtask}
    />
  );
})
