/**
 * Zustand store for Quick Capture — the inbox + triage flow (PRD §2.1). Captured
 * text lands in the `inbox_items` table with status 'inbox'; triage converts an
 * item into a Task / Journal entry / Habit (delegating to those stores) and then
 * archives it. Implements the `InboxState` contract from `@/types/inbox`.
 */

import { create } from 'zustand';

import {
  allRows,
  firstRow,
  initDatabase,
  runSql,
  tableIsEmpty,
} from '@/db/database';
import { colors } from '@/theme/colors';
import { todayKey } from '@/utils/day';
import { useHabitsStore } from '@/store/habitsStore';
import { useJournalStore } from '@/store/journalStore';
import { useTasksStore } from '@/store/tasksStore';
import type { InboxItem, InboxState, TriageTarget } from '@/types/inbox';

/** RFC4122 id when available, otherwise a sufficiently-unique fallback. */
function newId(): string {
  try {
    const c = globalThis.crypto;
    if (c && typeof c.randomUUID === 'function') {
      return c.randomUUID();
    }
  } catch {
    // crypto unavailable in Hermes release builds — fall through
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---------------------------------------------------------------------------
// Row <-> domain mapping
// ---------------------------------------------------------------------------

interface InboxItemRow {
  id: string;
  userId: string | null;
  text: string;
  status: string;
  createdAt: number;
}

function mapRow(r: InboxItemRow): InboxItem {
  return {
    id: r.id,
    userId: r.userId ?? undefined,
    text: r.text,
    status: r.status as InboxItem['status'],
    createdAt: r.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Seed (first run) — a few sample captures so the inbox isn't empty.
// ---------------------------------------------------------------------------

const SEED_TEXTS = [
  'Buy a birthday gift for Mom',
  'Idea: weekend hiking trip',
  'Try the new ramen place',
];

async function seed(): Promise<void> {
  const now = Date.now();
  for (let i = 0; i < SEED_TEXTS.length; i += 1) {
    await runSql(
      `INSERT INTO inbox_items (id, userId, text, status, createdAt)
       VALUES (?, ?, ?, ?, ?);`,
      [newId(), null, SEED_TEXTS[i], 'inbox', now + i],
    );
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

/** Module-level guard so init() runs its async work exactly once. */
let initPromise: Promise<void> | null = null;

export const useInboxStore = create<InboxState>()((set, get) => ({
  items: [],
  customSlang: {},
  ready: false,

  // ----- lifecycle -----
  init: async () => {
    if (get().ready) return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      await initDatabase();
      if (await tableIsEmpty('inbox_items')) {
        await seed();
      }
      const rows = await allRows<InboxItemRow>(
        'SELECT * FROM inbox_items ORDER BY createdAt DESC;',
      );

      const customSlangRow = await firstRow<{ value: string }>(
        'SELECT value FROM app_settings WHERE key = ?;',
        ['customSlang'],
      );
      const customSlang = customSlangRow
        ? JSON.parse(customSlangRow.value)
        : {};

      set({ items: rows.map(mapRow), customSlang, ready: true });
    })();

    return initPromise;
  },

  capture: async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return; // ignore empty / whitespace-only captures

    const item: InboxItem = {
      id: newId(),
      text: trimmed,
      status: 'inbox',
      createdAt: Date.now(),
    };

    try {
      await runSql(
        `INSERT INTO inbox_items (id, userId, text, status, createdAt) VALUES (?, ?, ?, ?, ?);`,
        [item.id, null, item.text, item.status, item.createdAt],
      );
      set((s) => ({ items: [item, ...s.items] }));
    } catch (e) {
      console.warn('Failed to save capture to inbox', e);
    }
  },

  archive: async (id: string) => {
    await runSql('UPDATE inbox_items SET status = ? WHERE id = ?;', [
      'archived',
      id,
    ]);
    set((s) => ({
      items: s.items.map((it) =>
        it.id === id ? { ...it, status: 'archived' } : it,
      ),
    }));
  },

  remove: async (id: string) => {
    await runSql('DELETE FROM inbox_items WHERE id = ?;', [id]);
    set((s) => ({ items: s.items.filter((it) => it.id !== id) }));
  },

  triage: async (
    id: string,
    target: TriageTarget,
    confirmedAmount?: number,
  ) => {
    const item = get().items.find((it) => it.id === id);
    if (!item) return;

    switch (target) {
      case 'task': {
        const tasks = useTasksStore.getState();
        if (!tasks.ready) await tasks.init();
        // Cross-module traceability (my-os-8u7): keep a back-reference to the
        // inbox item this task was triaged from instead of a dead copy.
        await useTasksStore.getState().addTask({
          title: item.text,
          priority: 'P2',
          sourceInboxId: item.id,
        });
        break;
      }
      case 'habit': {
        const habits = useHabitsStore.getState();
        if (!habits.ready) await habits.init();
        await useHabitsStore.getState().addHabit({
          name: item.text,
          icon: 'check-circle',
          color: colors.purple,
        });
        break;
      }
      case 'journal': {
        const journal = useJournalStore.getState();
        if (!journal.ready) await journal.init();
        const existing = useJournalStore.getState().entryFor(todayKey());
        await useJournalStore
          .getState()
          .saveEntry(
            (existing?.text ? existing.text + '\n' : '') + item.text,
            existing?.mood ?? 3,
          );
        break;
      }
      case 'note': {
        const { useNoteStore } = await import('@/store/noteStore');
        const notes = useNoteStore.getState();
        if (!notes.ready) await notes.init();
        await useNoteStore.getState().saveNote({
          title: 'Captured Note',
          content: item.text,
          isReadingList: false,
        });
        break;
      }
      case 'goal': {
        const { useGoalStore } = await import('@/store/goalStore');
        const goals = useGoalStore.getState();
        if (!goals.ready) await goals.init();
        await useGoalStore.getState().createGoal({
          title: item.text,
          milestones: [],
        });
        break;
      }
      case 'transaction': {
        const { parseQuickCapture } = await import('@/utils/parser');
        const parsed = parseQuickCapture(item.text, get().customSlang);
        const { useFinanceStore } = await import('@/store/financeStore');
        const { CAT } = await import('@/data/seed');
        const finance = useFinanceStore.getState();
        if (!finance.ready) await finance.init();

        const amount =
          confirmedAmount !== undefined
            ? confirmedAmount
            : (parsed.metadata?.amount ?? 0);
        const type = parsed.metadata?.transactionType ?? 'expense';
        const note = parsed.type === 'transaction' ? parsed.text : item.text;

        await finance.addTransaction({
          type,
          amount,
          categoryId: type === 'expense' ? CAT.food : CAT.salary,
          note,
          date: Date.now(),
        });

        if (confirmedAmount !== undefined) {
          await get().learnSlang(item.text, confirmedAmount);
        }
        break;
      }
    }

    await get().archive(id);
  },

  learnSlang: async (text: string, confirmedAmount: number) => {
    const { learnSlangFromInput } = await import('@/utils/parser');
    const learned = learnSlangFromInput(text, confirmedAmount);
    if (learned) {
      const nextSlang = {
        ...get().customSlang,
        [learned.word]: learned.multiplier,
      };
      set({ customSlang: nextSlang });
      await runSql(
        'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);',
        ['customSlang', JSON.stringify(nextSlang)],
      );
    }
  },

  // ----- selectors -----
  open: () =>
    get()
      .items.filter((it) => it.status === 'inbox')
      .sort((a, b) => b.createdAt - a.createdAt),

  openCount: () => get().items.filter((it) => it.status === 'inbox').length,
}));
