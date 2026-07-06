import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
  notificationsEnabled: boolean;
  ready: boolean;
  init: () => Promise<void>;
  openSuperApp: () => void;
  closeSuperApp: () => void;
  setEditMode: (v: boolean) => void;
  togglePinnedItem: (key: SuperAppItemKey) => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  superAppOpen: false,
  editMode: false,
  pinnedItems: DEFAULT_PINNED,
  notificationsEnabled: false,
  ready: false,

  init: async () => {
    if (get().ready) return;
    await initDatabase();

    // Load pinned items
    const row = await firstRow<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?;',
      ['pinnedItems'],
    );
    const pinnedItems: SuperAppItemKey[] = row
      ? (JSON.parse(row.value) as SuperAppItemKey[])
      : DEFAULT_PINNED;

    // Load notification preferences
    const notifRow = await firstRow<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?;',
      ['notificationsEnabled'],
    );
    const notificationsEnabled = notifRow ? notifRow.value === 'true' : false;

    set({ pinnedItems, notificationsEnabled, ready: true });
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
      ['pinnedItems', JSON.stringify(next)],
    );
  },

  requestNotificationPermission: async () => {
    if (Platform.OS === 'web') return false;

    let { status } = await Notifications.getPermissionsAsync();

    // If not granted, request the permission
    if (status !== 'granted') {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      status = newStatus;
    }

    const granted = status === 'granted';
    set({ notificationsEnabled: granted });

    await runSql(
      'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);',
      ['notificationsEnabled', granted.toString()],
    );

    return granted;
  },
}));
