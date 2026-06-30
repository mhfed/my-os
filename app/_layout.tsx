import { useCallback, useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from '@expo-google-fonts/ibm-plex-sans';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from '@expo-google-fonts/ibm-plex-mono';
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
import { GlobalCapture } from '@/components/GlobalCapture';
import { SuperAppSheet } from '@/components/SuperAppSheet';

// Keep the splash screen visible while we bootstrap fonts + every module store.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  const financeReady = useFinanceStore((s) => s.ready);
  const tasksReady = useTasksStore((s) => s.ready);
  const habitsReady = useHabitsStore((s) => s.ready);
  const journalReady = useJournalStore((s) => s.ready);
  const inboxReady = useInboxStore((s) => s.ready);
  const [initStarted, setInitStarted] = useState(false);

  // Kick off every module store's (idempotent) initialization exactly once.
  useEffect(() => {
    if (!initStarted) {
      setInitStarted(true);
      void Promise.all([
        useFinanceStore.getState().init(),
        useTasksStore.getState().init(),
        useHabitsStore.getState().init(),
        useJournalStore.getState().init(),
        useInboxStore.getState().init(),
        useNoteStore.getState().init(),
        useGoalStore.getState().init(),
        useSettingsStore.getState().init(),
        useDebtStore.getState().init(),
        useSavingsStore.getState().init(),
      ]);
    }
  }, [initStarted]);

  const noteReady = useNoteStore((s) => s.ready);
  const goalReady = useGoalStore((s) => s.ready);

  const storesReady =
    financeReady &&
    tasksReady &&
    habitsReady &&
    journalReady &&
    inboxReady &&
    noteReady &&
    goalReady;
  const ready = fontsLoaded && storesReady;

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
