import { create } from 'zustand';

import { allRows, initDatabase, runSql } from '@/db/database';
import type { Note, NoteState } from '@/types/note';

function newId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

let initPromise: Promise<void> | null = null;

export const useNoteStore = create<NoteState>()((set, get) => ({
  notes: [],
  ready: false,

  init: async () => {
    if (get().ready) return;
    if (initPromise) return initPromise;
    initPromise = (async () => {
      await initDatabase();
      const rows = await allRows<any>(
        'SELECT * FROM notes ORDER BY updatedAt DESC;',
      );
      const notes: Note[] = rows.map((r) => ({
        id: r.id,
        userId: r.userId ?? undefined,
        title: r.title,
        content: r.content,
        tags: JSON.parse(r.tags || '[]'),
        isReadingList: r.isReadingList === 1,
        url: r.url ?? undefined,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
      set({ notes, ready: true });
    })();
    return initPromise;
  },

  saveNote: async (input) => {
    const now = Date.now();
    const id = input.id ?? newId();
    const tagsJson = JSON.stringify(input.tags ?? []);

    await runSql(
      `INSERT INTO notes (id, userId, title, content, tags, isReadingList, url, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         content = excluded.content,
         tags = excluded.tags,
         isReadingList = excluded.isReadingList,
         url = excluded.url,
         updatedAt = excluded.updatedAt;`,
      [
        id,
        null,
        input.title,
        input.content,
        tagsJson,
        input.isReadingList ? 1 : 0,
        input.url ?? null,
        now,
        now,
      ],
    );

    const updatedNote: Note = {
      id,
      title: input.title,
      content: input.content,
      tags: input.tags ?? [],
      isReadingList: input.isReadingList,
      url: input.url,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      const others = state.notes.filter((n) => n.id !== id);
      // Keep descending order of updatedAt
      return { notes: [updatedNote, ...others] };
    });
  },

  deleteNote: async (id) => {
    await runSql('DELETE FROM notes WHERE id = ?;', [id]);
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
  },
}));
