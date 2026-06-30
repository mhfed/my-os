/**
 * Task domain — PRD §2.2 Task Manager. Single source of truth for tasks,
 * consumed by both the Tasks screen and the Today aggregation.
 */

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  done: boolean;
  createdAt: number;
}

export interface Task {
  id: string;
  userId?: string;
  title: string;
  /** Freeform context label, e.g. "Work", "Health", "Errands". */
  context?: string;
  priority: Priority;
  done: boolean;
  /** Epoch-ms the task is due. Undefined = no date (lives under "Today"). */
  dueDate?: number;
  createdAt: number;
  completedAt?: number;
  subtasks?: Subtask[];
}

/** Overdue = past-due & not done; Today = due today or undated. */
export type TaskSection = 'overdue' | 'today' | 'upcoming';

export type TaskFilter = 'All' | 'Today' | 'This week' | 'Projects';

/** Input for creating a task (from the add form or inbox triage). */
export interface NewTaskInput {
  title: string;
  context?: string;
  priority: Priority;
  dueDate?: number;
  subtasks?: string[]; // Array of titles to create initially
}

export interface TasksState {
  tasks: Task[];
  activeFilter: TaskFilter;
  ready: boolean;

  init: () => Promise<void>;
  addTask: (input: NewTaskInput) => Promise<Task>;
  toggleTask: (id: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setFilter: (filter: TaskFilter) => void;

  // selectors
  sectionOf: (task: Task) => TaskSection;
  /** Not-done tasks due today (or undated), newest due first. */
  todayTasks: () => Task[];
  activeCount: () => number;
  overdueCount: () => number;
}
