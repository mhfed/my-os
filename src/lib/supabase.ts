import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client (Phase 0: backup/restore to Storage).
 *
 * Credentials are read from `expo.extra` in app.json, with optional override
 * via EXPO_PUBLIC_* env vars. No secrets are hardcoded in source. The anon key
 * is safe to ship in a client build (it only grants access allowed by RLS /
 * Storage policies).
 */

const extra =
  (Constants.expoConfig?.extra as Record<string, string> | undefined) ??
  (Constants.manifest as any)?.extra ??
  {};

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.supabaseUrl ?? '';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.supabaseAnonKey ?? '';

export const BACKUP_BUCKET =
  process.env.EXPO_PUBLIC_BACKUP_BUCKET ?? extra.backupBucket ?? 'backups';

/**
 * True only when real (non-placeholder) credentials are present. Callers should
 * check this before attempting any network operation so the app degrades
 * gracefully when Supabase is not yet configured.
 */
export const isSupabaseConfigured =
  !!SUPABASE_URL &&
  !!SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('YOUR_PROJECT') &&
  !SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY');

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Set supabaseUrl / supabaseAnonKey in app.json (expo.extra) or EXPO_PUBLIC_SUPABASE_* env vars.',
    );
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // No URL-based session detection in a native app.
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
