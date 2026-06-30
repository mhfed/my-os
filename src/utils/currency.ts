/**
 * VND (Vietnamese đồng) formatting helpers.
 * The design renders amounts in IBM Plex Mono with a "₫" prefix.
 */

const DONG = '₫';

/** "₫8,450,000" — full amount with thousands separators. */
export function formatVND(amount: number): string {
  const sign = amount < 0 ? '−' : '';
  const abs = Math.abs(Math.round(amount));
  return `${sign}${DONG}${abs.toLocaleString('en-US')}`;
}

/**
 * Signed amount for transaction rows: "+₫25,000,000" / "−₫65,000".
 * Uses the typographic minus (U+2212) to match the design.
 */
export function formatSignedVND(amount: number, type: 'income' | 'expense'): string {
  const sign = type === 'income' ? '+' : '−';
  const abs = Math.abs(Math.round(amount));
  return `${sign}${DONG}${abs.toLocaleString('en-US')}`;
}

/** Compact form for the stat cards: "₫25.0M", "₫8.45M", "₫16.5M". */
export function formatCompactVND(amount: number): string {
  const sign = amount < 0 ? '−' : '';
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    return `${sign}${DONG}${trim(abs / 1_000_000_000)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${DONG}${trim(abs / 1_000_000)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${DONG}${trim(abs / 1_000)}K`;
  }
  return `${sign}${DONG}${abs}`;
}

/**
 * Up to 2 dp, but always at least 1 — matching the design's "25.0M" /
 * "8.45M" / "16.5M" rendering. 25 -> "25.0", 8.45 -> "8.45", 16.5 -> "16.5".
 */
function trim(n: number): string {
  const two = parseFloat(n.toFixed(2));
  return Number.isInteger(two) ? two.toFixed(1) : two.toString();
}
