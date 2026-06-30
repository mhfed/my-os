/**
 * Journal domain — PRD §2.3 Daily Journal. One entry per calendar day,
 * keyed by `date` ("YYYY-MM-DD"). Consumed by the Journal screen and Today.
 */

/** Mood index 0–4 (cry → excited), matching the design's 5-mood selector. */
export type Mood = 0 | 1 | 2 | 3 | 4;

export interface JournalEntry {
  id: string;
  userId?: string;
  date: string;
  mood: Mood;
  text: string;
  createdAt: number;
  updatedAt: number;
}

export interface JournalState {
  entries: JournalEntry[];
  /** "YYYY-MM-DD" the screen is editing (defaults to today). */
  activeDate: string;
  ready: boolean;

  init: () => Promise<void>;
  setActiveDate: (date: string) => void;
  /** Create or update the entry for `activeDate` (upsert). */
  saveEntry: (text: string, mood: Mood) => Promise<void>;

  // selectors
  entryFor: (date: string) => JournalEntry | undefined;
  /** Consecutive days with an entry up to today. */
  streak: () => number;
  /** Set of "YYYY-MM-DD" that have an entry (for the calendar dots). */
  writtenDates: () => Set<string>;

  /** Return an entry from exactly 1 week, 1 month, or 1 year ago, or null */
  getTimeCapsule: () => JournalEntry | null;
  /** Searches historical entries by text (case-insensitive) */
  searchEntries: (query: string) => JournalEntry[];
}
