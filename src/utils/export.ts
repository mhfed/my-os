import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { allRows } from '@/db/database';

export async function exportAllData() {
  try {
    const tables = [
      'categories',
      'transactions',
      'budgets',
      'recurring',
      'tasks',
      'task_subtasks',
      'habits',
      'habit_logs',
      'journal_entries',
      'inbox_items',
      'workouts',
      'workout_exercises',
      'workout_sets',
      'notes',
      'goals',
      'milestones',
    ];

    const data: Record<string, any[]> = {};
    for (const t of tables) {
      data[t] = await allRows(`SELECT * FROM ${t};`);
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const fileName = `PersonalOS_Backup_${Date.now()}.json`;
    // @ts-ignore
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    // @ts-ignore
    await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
      // @ts-ignore
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Personal OS Backup',
      });
    } else {
      Alert.alert('Sharing not available', `Saved to ${fileUri}`);
    }
  } catch (error: any) {
    Alert.alert('Export Failed', error.message);
  }
}
