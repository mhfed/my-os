/**
 * Zustand store for the Journal feature — SQLite-backed, one entry per calendar
 * day (keyed by `date` "YYYY-MM-DD"). Implements the `JournalState` contract
 * from `@/types/journal`. Mutations persist to SQLite first via an UPSERT, then
 * update the in-memory `entries` array; selectors derive the streak, written
 * dates and per-day lookups the screen subscribes to.
 */

import { create } from 'zustand';

import { allRows, initDatabase, runSql, tableIsEmpty } from '@/db/database';
import { addDays, todayKey } from '@/utils/day';
import type { JournalEntry, JournalState, Mood } from '@/types/journal';

/** RFC4122 id when available, otherwise a sufficiently-unique fallback. */
function newId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Word count derived from entry text — split on whitespace, drop empties. */
export const wordCount = (text: string): number =>
  text.split(/\s+/).filter((w) => w.length > 0).length;

// ---------------------------------------------------------------------------
// Row <-> domain mapping
// ---------------------------------------------------------------------------

interface JournalEntryRow {
  id: string;
  userId: string | null;
  date: string;
  mood: number;
  text: string;
  createdAt: number;
  updatedAt: number;
}

function mapEntry(r: JournalEntryRow): JournalEntry {
  return {
    id: r.id,
    userId: r.userId ?? undefined,
    date: r.date,
    mood: r.mood as Mood,
    text: r.text,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Seed (first run) — today's entry + the previous 11 consecutive days so the
// streak reads 12 on a fresh install.
// ---------------------------------------------------------------------------

const SEED_TODAY_TEXT =
  'Hôm nay đi gym xong thấy khá ổn, bench press cuối cùng cũng lên được 80kg sau mấy tuần stuck. Chiều họp với team về Q3 roadmap, hơi căng nhưng mình nghĩ hướng đi đã rõ hơn. Tối nay định đọc nốt chương cuối của cuốn "Deep Work"';

const SEED_PAST: { text: string; mood: Mood }[] = [
  { text: 'Ngày làm việc bình thường, code xong vài task nhỏ.', mood: 3 },
  { text: 'Trời mưa cả ngày, ở nhà đọc sách và nghỉ ngơi.', mood: 2 },
  { text: 'Gặp lại mấy đứa bạn cũ, vui hết cả buổi tối.', mood: 4 },
  { text: 'Hơi mệt nhưng vẫn cố hoàn thành deadline đúng hạn.', mood: 2 },
  { text: 'Chạy bộ buổi sáng, cảm thấy đầu óc tỉnh táo hẳn.', mood: 4 },
  { text: 'Họp nhiều quá, không kịp làm việc gì ra hồn.', mood: 2 },
  { text: 'Nấu ăn ở nhà, thử món mới khá ngon.', mood: 3 },
  { text: 'Học thêm được vài thứ mới về SQLite, thú vị.', mood: 4 },
  { text: 'Một ngày yên bình, không có gì đặc biệt.', mood: 3 },
  { text: 'Cuối tuần dọn dẹp nhà cửa, thấy nhẹ nhõm.', mood: 3 },
  { text: 'Xem phim với gia đình, một buổi tối ấm cúng.', mood: 4 },
];

async function seed(): Promise<void> {
  const today = todayKey();
  const now = Date.now();

  await runSql(
    `INSERT INTO journal_entries (id, userId, date, mood, text, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [newId(), null, today, 3, SEED_TODAY_TEXT, now, now],
  );

  for (let k = 1; k <= SEED_PAST.length; k += 1) {
    const date = addDays(today, -k);
    const { text, mood } = SEED_PAST[k - 1];
    await runSql(
      `INSERT INTO journal_entries (id, userId, date, mood, text, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [newId(), null, date, mood, text, now, now],
    );
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useJournalStore = create<JournalState>()((set, get) => ({
  entries: [],
  activeDate: todayKey(),
  ready: false,
  /** Stable set of dates with entries - updated alongside entries. */
  writtenDatesSet: new Set<string>(),

  // ----- lifecycle -----
  init: async () => {
    if (get().ready) return; // idempotent
    await initDatabase();
    if (await tableIsEmpty('journal_entries')) {
      await seed();
    }
    const rows = await allRows<JournalEntryRow>(
      'SELECT * FROM journal_entries ORDER BY date DESC;',
    );
    set({ entries: rows.map(mapEntry), ready: true, writtenDatesSet: new Set(rows.map(r => r.date)) });
  },

  setActiveDate: (date) => set({ activeDate: date }),

  saveEntry: async (text, mood) => {
    const date = get().activeDate;
    const existing = get().entries.find((e) => e.date === date);
    const now = Date.now();
    const id = existing?.id ?? newId();
    const createdAt = existing?.createdAt ?? now;

    // Upsert by the UNIQUE `date` column: insert a fresh row, or — when the day
    // already has an entry — update its text/mood/updatedAt in place.
    await runSql(
      `INSERT INTO journal_entries (id, userId, date, mood, text, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET
         mood = excluded.mood,
         text = excluded.text,
         updatedAt = excluded.updatedAt;`,
      [id, null, date, mood, text, createdAt, now],
    );

    const saved: JournalEntry = {
      id,
      date,
      mood,
      text,
      createdAt,
      updatedAt: now,
    };

    set((s) => {
      const others = s.entries.filter((e) => e.date !== date);
      const newEntries = [saved, ...others];
      return { entries: newEntries, writtenDatesSet: new Set(newEntries.map(e => e.date)) };
    });
  },

  // ----- selectors -----
  entryFor: (date) => get().entries.find((e) => e.date === date),

  streak: () => {
    const written = get().writtenDates();
    let count = 0;
    let cursor = todayKey();
    while (written.has(cursor)) {
      count += 1;
      cursor = addDays(cursor, -1);
    }
    return count;
  },

  writtenDates: () => get().writtenDatesSet,

  getTimeCapsule: () => {
    const today = todayKey();
    const map = new Map(get().entries.map((e) => [e.date, e]));

    // Order of preference: 1 year, 1 month, 1 week
    // Since dates are YYYY-MM-DD, we can roughly compute them

    // 1 year ago
    const oneYearDate = new Date();
    oneYearDate.setFullYear(oneYearDate.getFullYear() - 1);
    const yKey = oneYearDate.toISOString().split('T')[0];
    if (map.has(yKey)) return map.get(yKey)!;

    // 1 month ago
    const oneMonthDate = new Date();
    oneMonthDate.setMonth(oneMonthDate.getMonth() - 1);
    const mKey = oneMonthDate.toISOString().split('T')[0];
    if (map.has(mKey)) return map.get(mKey)!;

    // 1 week ago
    const wKey = addDays(today, -7);
    if (map.has(wKey)) return map.get(wKey)!;

    // Fallback: Just return a random old entry that isn't today (for the sake of the UX if others don't exist)
    const oldEntries = get().entries.filter(
      (e) => e.date !== today && e.text.length > 10,
    );
    if (oldEntries.length > 0) {
      // Pick one randomly based on today's day to be pseudo-stable for the day
      const now = new Date();
      return oldEntries[(now.getDate() + now.getMonth()) % oldEntries.length];
    }

    return null;
  },

  searchEntries: (query: string) => {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase();
    return get().entries.filter((e) => e.text.toLowerCase().includes(q));
  },
}));
