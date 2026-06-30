import { create } from 'zustand';

import { firstRow, initDatabase, runSql } from '@/db/database';

export type SuperAppItemKey =
  | 'today'
  | 'tasks'
  | 'health'
  | 'finance'
  | 'inbox'
  | 'journal'
  | 'habits'
  | 'notes'
  | 'goals';

const DEFAULT_PINNED: SuperAppItemKey[] = [
  'inbox',
  'journal',
  'habits',
  'notes',
  'goals',
];

interface SettingsState {
  superAppOpen: boolean;
  editMode: boolean;
  pinnedItems: SuperAppItemKey[];
  ready: boolean;
  init: () => Promise<void>;
  openSuperApp: () => void;
  closeSuperApp: () => void;
  setEditMode: (v: boolean) => void;
  togglePinnedItem: (key: SuperAppItemKey) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  superAppOpen: false,
  editMode: false,
  pinnedItems: DEFAULT_PINNED,
  ready: false,

  init: async () => {
    if (get().ready) return;
    await initDatabase();
    const row = await firstRow<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?;',
      ['pinnedItems']
    );
    const pinnedItems: SuperAppItemKey[] = row
      ? (JSON.parse(row.value) as SuperAppItemKey[])
      : DEFAULT_PINNED;
    set({ pinnedItems, ready: true });
  },

  openSuperApp: () => set({ superAppOpen: true, editMode: false }),
  closeSuperApp: () => set({ superAppOpen: false, editMode: false }),
  setEditMode: (v) => set({ editMode: v }),

  togglePinnedItem: async (key) => {
    const { pinnedItems } = get();
    const next = pinnedItems.includes(key)
      ? pinnedItems.filter((k) => k !== key)
      : [...pinnedItems, key];
    set({ pinnedItems: next });
    await runSql(
      'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);',
      ['pinnedItems', JSON.stringify(next)]
    );
  },
}));
