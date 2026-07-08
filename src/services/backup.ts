import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import {
  BACKUP_BUCKET,
  getSupabase,
  isSupabaseConfigured,
} from '@/lib/supabase';
import {
  createSnapshot,
  restoreSnapshot,
  serializeSnapshot,
  type BackupPayload,
} from '@/utils/backupData';

/**
 * Phase 0 backup service — pushes a full JSON snapshot of the local SQLite DB
 * to a **private** Supabase Storage bucket so data survives a rebuild /
 * reinstall. There is no auth yet (that arrives in Phase 1), so backups are
 * scoped by a stable per-install device id used as the storage path prefix.
 */

const DEVICE_ID_KEY = 'personalos.deviceId';
const LAST_BACKUP_KEY = 'personalos.lastBackupAt';

let cachedDeviceId: string | null = null;

/** Get (or lazily create) a stable device id for this install. */
export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = generateId();
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  cachedDeviceId = id;
  return id;
}

function generateId(): string {
  // RFC4122-ish v4 without a crypto dependency; uniqueness here only needs to
  // avoid path collisions across a user's own devices.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface BackupFileInfo {
  /** Full storage path, e.g. "<deviceId>/backup-1720000000000.json". */
  path: string;
  name: string;
  createdAt: number;
}

/** Storage folder for this device. */
async function deviceFolder(): Promise<string> {
  return getDeviceId();
}

/**
 * Create a snapshot and upload it to Storage. Returns the storage path.
 * Throws if Supabase is not configured or the upload fails.
 */
export async function backupToCloud(): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình (app.json → expo.extra).');
  }
  const appVersion = Constants.expoConfig?.version;
  const payload = await createSnapshot(appVersion);
  const json = serializeSnapshot(payload);

  const folder = await deviceFolder();
  const path = `${folder}/backup-${payload.createdAt}.json`;

  const supabase = getSupabase();
  const { error } = await supabase.storage
    .from(BACKUP_BUCKET)
    .upload(path, json, {
      contentType: 'application/json',
      upsert: true,
    });

  if (error) throw error;

  await AsyncStorage.setItem(LAST_BACKUP_KEY, String(payload.createdAt));
  return path;
}

/** List this device's backups, newest first. */
export async function listBackups(): Promise<BackupFileInfo[]> {
  if (!isSupabaseConfigured) return [];
  const folder = await deviceFolder();
  const supabase = getSupabase();

  const { data, error } = await supabase.storage
    .from(BACKUP_BUCKET)
    .list(folder, { limit: 100, sortBy: { column: 'name', order: 'desc' } });

  if (error) throw error;

  return (data ?? [])
    .filter((f) => f.name.endsWith('.json'))
    .map((f) => ({
      path: `${folder}/${f.name}`,
      name: f.name,
      createdAt: parseTimestampFromName(f.name),
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

function parseTimestampFromName(name: string): number {
  const m = name.match(/backup-(\d+)\.json/);
  return m ? Number(m[1]) : 0;
}

/** Download and parse a backup payload by storage path. */
export async function downloadBackup(path: string): Promise<BackupPayload> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình.');
  }
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(BACKUP_BUCKET)
    .download(path);

  if (error) throw error;
  if (!data) throw new Error('Không tải được file backup.');

  const text = await data.text();
  return JSON.parse(text) as BackupPayload;
}

/**
 * Restore the latest cloud backup for this device into SQLite (full replace).
 * Returns the restored payload, or null if there are no backups.
 */
export async function restoreLatestFromCloud(): Promise<BackupPayload | null> {
  const backups = await listBackups();
  if (backups.length === 0) return null;
  const payload = await downloadBackup(backups[0].path);
  await restoreSnapshot(payload);
  return payload;
}

/** Restore a specific backup path into SQLite (full replace). */
export async function restoreFromCloud(path: string): Promise<BackupPayload> {
  const payload = await downloadBackup(path);
  await restoreSnapshot(payload);
  return payload;
}

/** Epoch-ms of the last successful backup on this device, or null. */
export async function getLastBackupAt(): Promise<number | null> {
  const v = await AsyncStorage.getItem(LAST_BACKUP_KEY);
  return v ? Number(v) : null;
}

// ---------------------------------------------------------------------------
// Auto-backup (debounced) — called from app lifecycle in app/_layout.tsx.
// ---------------------------------------------------------------------------

/** Minimum interval between automatic backups (ms). */
const AUTO_BACKUP_MIN_INTERVAL = 5 * 60 * 1000; // 5 minutes
let inFlight: Promise<void> | null = null;

/**
 * Best-effort automatic backup. Silently no-ops when Supabase is unconfigured,
 * when a backup ran recently (unless `force`), or when one is already running.
 * Never throws — failures are logged only, so app lifecycle is never blocked.
 */
export async function autoBackup(force = false): Promise<void> {
  if (!isSupabaseConfigured) return;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      if (!force) {
        const last = await getLastBackupAt();
        if (last && Date.now() - last < AUTO_BACKUP_MIN_INTERVAL) return;
      }
      await backupToCloud();
    } catch (e) {
      // Non-fatal: log and move on.
      console.warn('[backup] autoBackup failed:', (e as Error)?.message ?? e);
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}
