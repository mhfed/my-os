/**
 * Vietnamese date labels for the Journal screen. The shared `utils/date`
 * formatter returns English ("Today" / "27 Jun"); the Journal screen is
 * Vietnamese-first (DESIGN_SPEC §7), so these helpers localise day keys.
 */
import { startOfDay, todayKey } from '@/utils/day';

const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;
const WEEKDAY_LONG = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
] as const;

const DAY_MS = 86_400_000;

/** "T2".."CN" for a "YYYY-MM-DD" key. */
export function vnWeekdayShort(key: string): string {
  return WEEKDAY_SHORT[new Date(startOfDay(key)).getDay()];
}

/** Zero-padded day of month ("01".."31"). */
export function vnDayOfMonth(key: string): string {
  const d = new Date(startOfDay(key)).getDate();
  return d < 10 ? `0${d}` : `${d}`;
}

/** Long header, e.g. "Thứ Hai, 30 Tháng 6, 2025". */
export function vnDateHeader(key: string): string {
  const d = new Date(startOfDay(key));
  return `${WEEKDAY_LONG[d.getDay()]}, ${d.getDate()} Tháng ${
    d.getMonth() + 1
  }, ${d.getFullYear()}`;
}

/** Relative label — "Hôm nay" / "Hôm qua" / "30 Tháng 6, 2025". */
export function vnRelativeDate(key: string): string {
  const today = todayKey();
  if (key === today) return 'Hôm nay';
  const diff = Math.round((startOfDay(today) - startOfDay(key)) / DAY_MS);
  if (diff === 1) return 'Hôm qua';
  const d = new Date(startOfDay(key));
  return `${d.getDate()} Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
}

/** Coarse "time ago" for the Time Capsule — "1 năm trước", "2 tuần trước"… */
export function vnTimeAgo(key: string): string {
  const diff = Math.round((startOfDay(todayKey()) - startOfDay(key)) / DAY_MS);
  if (diff >= 365) return `${Math.floor(diff / 365)} năm trước`;
  if (diff >= 30) return `${Math.floor(diff / 30)} tháng trước`;
  if (diff >= 7) return `${Math.floor(diff / 7)} tuần trước`;
  if (diff === 1) return 'Hôm qua';
  return `${diff} ngày trước`;
}
