/**
 * Local day helpers. Days are keyed "YYYY-MM-DD" in local time so calendar
 * grouping (today / overdue / streaks) matches what the user sees on screen.
 */

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** "YYYY-MM-DD" for the given Date (default now), in LOCAL time. */
export function dayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Today's "YYYY-MM-DD". */
export function todayKey(): string {
  return dayKey();
}

/** "YYYY-MM-DD" for an epoch-ms instant. */
export function dayKeyOf(epochMs: number): string {
  return dayKey(new Date(epochMs));
}

/** Epoch-ms at local midnight of the given day key. */
export function startOfDay(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
}

/** Epoch-ms at local midnight today. */
export function startOfToday(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

/** Shift a day key by `delta` days (negative = past). */
export function addDays(key: string, delta: number): string {
  const at = startOfDay(key);
  return dayKey(new Date(at + delta * 86_400_000));
}

/** The last `n` day keys ending today, oldest → newest (length n). */
export function lastNDays(n: number, endKey: string = todayKey()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(endKey, i - (n - 1)));
}

/** Short weekday letter for a day key, e.g. "M","T","W". */
export function weekdayLetter(key: string): string {
  const at = startOfDay(key);
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(at).getDay()];
}

/** Time of day greeting based on current hour. */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}
