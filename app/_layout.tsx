import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
} from '@expo-google-fonts/be-vietnam-pro';
import {
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors } from '@/theme/colors';
import { useFinanceStore } from '@/store/financeStore';
import { useTasksStore } from '@/store/tasksStore';
import { useHabitsStore } from '@/store/habitsStore';
import { useJournalStore } from '@/store/journalStore';
import { useInboxStore } from '@/store/inboxStore';
import { useNoteStore } from '@/store/noteStore';
import { useGoalStore } from '@/store/goalStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useDebtStore } from '@/store/debtStore';
import { useSavingsStore } from '@/store/savingsStore';
import { useInitTracker } from '@/store/storeInitTracker';
import { GlobalCapture } from '@/components/GlobalCapture';
import { SuperAppSheet } from '@/components/SuperAppSheet';
import { autoBackup } from '@/services/backup';

// Keep the splash screen visible while we bootstrap fonts + every module store.
SplashScreen.preventAutoHideAsync();

// Ensure notifications show up when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  const [initStarted, setInitStarted] = useState(false);
  const [allInitAttempted, setAllInitAttempted] = useState(false);

  // Kick off every module store's (idempotent) initialization exactly once.
  // Each init() is individually wrapped so a single store crash doesn't block
  // the entire boot sequence — the app shows UI with gracefully degraded data
  // for any store that failed.
  useEffect(() => {
    if (!initStarted) {
      setInitStarted(true);
      const setError = useInitTracker.getState().setError;
      const safeInit = async (name: string, fn: () => Promise<void>) => {
        try {
          await fn();
        } catch (e) {
          console.error(`[${name}] store init failed:`, e);
          setError(name, String(e));
        }
      };
      void Promise.allSettled([
        safeInit('finance', () => useFinanceStore.getState().init()),
        safeInit('tasks', () => useTasksStore.getState().init()),
        safeInit('habits', () => useHabitsStore.getState().init()),
        safeInit('journal', () => useJournalStore.getState().init()),
        safeInit('inbox', () => useInboxStore.getState().init()),
        safeInit('note', () => useNoteStore.getState().init()),
        safeInit('goal', () => useGoalStore.getState().init()),
        safeInit('settings', () => useSettingsStore.getState().init()),
        safeInit('debt', () => useDebtStore.getState().init()),
        safeInit('savings', () => useSavingsStore.getState().init()),
      ]).finally(() => {
        setAllInitAttempted(true);
      });
    }
  }, [initStarted]);

  const financeReady = useFinanceStore((s) => s.ready);
  const tasksReady = useTasksStore((s) => s.ready);
  const habitsReady = useHabitsStore((s) => s.ready);
  const journalReady = useJournalStore((s) => s.ready);
  const inboxReady = useInboxStore((s) => s.ready);
  const noteReady = useNoteStore((s) => s.ready);
  const goalReady = useGoalStore((s) => s.ready);
  const debtReady = useDebtStore((s) => s.ready);
  const savingsReady = useSavingsStore((s) => s.ready);

  const storesReady =
    financeReady &&
    tasksReady &&
    habitsReady &&
    journalReady &&
    inboxReady &&
    noteReady &&
    goalReady &&
    debtReady &&
    savingsReady;

  // Show the UI once fonts are loaded AND all stores have attempted init.
  // If a store's init() threw, its `ready` stays false but the app still
  // renders — the feature screen handles the "not ready" state gracefully.
  const ready = fontsLoaded && (storesReady || allInitAttempted);

  // ── Auto-backup (Phase 0) ──────────────────────────────────────────────
  // Back up on first ready, and whenever the app moves to background/inactive.
  // `autoBackup` is debounced + no-ops when Supabase is unconfigured, so this
  // is safe to fire liberally and never blocks the UI.
  const appState = useRef(AppState.currentState);
  const didInitialBackup = useRef(false);

  useEffect(() => {
    if (storesReady && !didInitialBackup.current) {
      didInitialBackup.current = true;
      void autoBackup();
    }
  }, [storesReady]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      const prev = appState.current;
      appState.current = next;
      // Going to background/inactive → snapshot current state.
      if (prev === 'active' && (next === 'background' || next === 'inactive')) {
        void autoBackup();
      }
    });
    return () => sub.remove();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <StatusBar style='light' />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 280,
            gestureEnabled: true,
            contentStyle: { backgroundColor: colors.screenBg },
          }}
        >
          <Stack.Screen name='(tabs)' />
        </Stack>
        <GlobalCapture />
        <SuperAppSheet />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
