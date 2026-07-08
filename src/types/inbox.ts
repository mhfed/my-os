/**
 * Quick Capture inbox — PRD §2.1 (the app's most important feature: capture
 * anything in 3 seconds, organize later). Items are triaged into a Task,
 * Journal entry, or Habit, then archived.
 */

export type InboxStatus = 'inbox' | 'archived';

export interface InboxItem {
  id: string;
  userId?: string;
  text: string;
  status: InboxStatus;
  createdAt: number;
}

/** Targets an inbox item can be converted into during triage. */
export type TriageTarget = 'task' | 'journal' | 'habit' | 'note' | 'goal' | 'transaction';

export interface InboxState {
  items: InboxItem[];
  ready: boolean;

  init: () => Promise<void>;
  /** Capture raw text into the inbox (the global capture button). */
  capture: (text: string) => Promise<void>;
  archive: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  /**
   * Convert an item into the given target (creating the row in the relevant
   * store) and archive it. Implemented in the inbox store, which imports the
   * tasks/journal/habits stores.
   */
  triage: (id: string, target: TriageTarget) => Promise<void>;

  // selectors
  open: () => InboxItem[];
  openCount: () => number;
}
