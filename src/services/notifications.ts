import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Schedule a local notification if permissions are granted.
 * Idempotent: scheduling with the same `id` overrides any existing notification with that id.
 *
 * @param id Unique identifier (e.g. 'debt-123-t3' or 'task-abc')
 * @param title Notification title
 * @param body Notification body text
 * @param timestamp Epoch ms when it should trigger
 */
export async function scheduleNotification(
  id: string,
  title: string,
  body: string,
  timestamp: number,
): Promise<void> {
  const { notificationsEnabled } = useSettingsStore.getState();

  if (Platform.OS === 'web' || !notificationsEnabled) {
    return;
  }

  // Don't schedule in the past
  if (timestamp <= Date.now()) {
    return;
  }

  // Cancel any existing so we can purely override
  await cancelNotification(id);

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(timestamp),
      },
    });
  } catch (err) {
    console.error(`Failed to schedule notification ${id}:`, err);
  }
}

/**
 * Cancels a previously scheduled local notification.
 *
 * @param id Unique identifier mapping to the notification
 */
export async function cancelNotification(id: string): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (err) {
    // If it's already cancelled or doesn't exist, we can ignore
  }
}
