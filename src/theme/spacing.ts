/**
 * Lumina OS spacing scale — 4px baseline (DESIGN_SPEC §2.5).
 *
 * Replaces ad-hoc pixel values scattered across screen StyleSheets. Import via
 * `import { spacing } from '@/theme/spacing'`.
 */
export const spacing = {
  /** 4px unit — fine adjustments. */
  unit: 4,
  xs: 8, // stack-sm
  sm: 12,
  md: 16, // gutter / stack-md, default card padding
  lg: 20, // screen outer margin (margin-x)
  xl: 24, // generous card padding
  xxl: 32, // stack-lg, section separation
  /** Bottom padding so scroll content clears the floating tab bar + home indicator. */
  tabClear: 110,
} as const;

export type Spacing = typeof spacing;
