/**
 * Month/date helpers for the Finance screen.
 *
 * A "month key" is the canonical "YYYY-MM" string used by `Budget.month` and
 * by the store's `activeMonth`. All epoch values are milliseconds.
 */

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** Zero-pads a 1- or 2-digit number to width 2. */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Parses "YYYY-MM" into its numeric year/month (month is 1–12). */
function parseMonthKey(monthKey: string): { year: number; month: number } {
  const [yearStr, monthStr] = monthKey.split('-');
  return { year: Number(yearStr), month: Number(monthStr) };
}

/** "YYYY-MM" for today, in local time. */
export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
}

/** "June 2025" for a "YYYY-MM" key. */
export function monthLabel(monthKey: string): string {
  const { year, month } = parseMonthKey(monthKey);
  return `${MONTH_NAMES[month - 1].slice(0, 3)} ${year}`;
}

/** Shifts a month key by `delta` months (can be negative). Returns "YYYY-MM". */
export function addMonths(monthKey: string, delta: number): string {
  const { year, month } = parseMonthKey(monthKey);
  // Date month is 0-based; (month - 1 + delta) normalizes across year bounds.
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

/**
 * Epoch-ms bounds for a month: `start` inclusive (00:00:00.000 on day 1),
 * `end` exclusive (00:00:00.000 on day 1 of the next month).
 */
export function monthRange(monthKey: string): { start: number; end: number } {
  const { year, month } = parseMonthKey(monthKey);
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0).getTime();
  const end = new Date(year, month, 1, 0, 0, 0, 0).getTime();
  return { start, end };
}

/** True when both timestamps fall on the same local calendar day. */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Relative transaction date label: "Today" / "Yesterday", otherwise "27 Jun".
 * Computed against the real current date.
 */
export function formatTxnDate(epochMs: number): string {
  const date = new Date(epochMs);
  const now = new Date();
  if (isSameDay(date, now)) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Yesterday';

  const shortMonth = MONTH_NAMES[date.getMonth()].slice(0, 3);
  return `${date.getDate()} ${shortMonth}`;
}
