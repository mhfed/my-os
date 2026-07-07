---
name: design-system
description: >
  Premium Neon Finance — high-end dark-neon design system for Personal OS.
  Provides colors, typography, glassmorphic container cards, soft ambient glows,
  and animated background orbs.
---

# Premium Neon Finance Design System

A sophisticated, high-end **dark-neon** UI language for the Personal OS app.
The look is designed to feel luxurious, clean, and professional — avoiding cheap/raw neon gaming templates in favor of elegant glassmorphism, refined accent colors (Emerald Green, Cyber Cyan, Amethyst Purple, Champagne Gold), and extremely soft ambient glows.

> **Golden rule:** Never introduce raw hex, ad-hoc shadows, or one-off font
> strings in a component. Always pull from `src/theme/*` tokens and the
> reusable `@/components/game` kit.

---

## 1. Design Tokens

All tokens live in `src/theme/`. Import via the `@/theme/*` alias.

### 1.1 Colors — `src/theme/colors.ts`

**Surfaces & text**

| Token | Value | Use |
|---|---|---|
| `colors.appBg` | `#090A0F` | Deep dark cyber background |
| `colors.screenBg` | `#090A0F` | Main screen backdrop color |
| `colors.card` | `#12141C` | Premium slate-dark glass card background |
| `colors.cardAlt` | `#181A24` | Alternate card surface color |
| `colors.track` | `#1F2230` | Inset tracker/progress track |
| `colors.border` | `rgba(255,255,255,0.05)` | Thinned, clean glass border |
| `colors.text` | `#E2E8F0` | Primary slate-200 text |
| `colors.textOnDark` | `#FFFFFF` | Text on colored components |
| `colors.muted` | `#94A3B8` | Secondary slate-400 text |
| `colors.tabInactive` | `#64748B` | Inactive tab bar items |

**Accents** — each pairs a refined neon face with a darker `*Deep` for borders and 3D shadows:

| Accent | Face | Deep | Domain |
|---|---|---|---|
| purple | `#8B5CF6` | `#7C3AED` | Today, Inbox |
| gold | `#FBBF24` | `#D97706` | Finance |
| teal | `#06B6D4` | `#0891B2` | Today (fallback) |
| green | `#10B981` | `#059669` | Habits, Goals |
| orange | `#F59E0B` | `#D97706` | Habits |
| yellow | `#FBBF24` | `#D97706` | Notes |
| red | `#EF4444` | `#DC2626` | Health |
| blue | `#0EA5E9` | `#0284C7` | Tasks |
| pink | `#EC4899` | `#DB2777` | Journal |

**Gradients** — `src/theme/colors.ts` `gradients` object:

| Token | Stops | Use |
|---|---|---|
| `backdrop` | `#0F111A → #07080D` | Base screen backdrop |
| `warm` | `#181922 → #0F111A` | Secondary panels |
| `green` | `#34D399 → #10B981` | Emerald CTAs |
| `purple` | `#C084FC → #8B5CF6` | Today, Inbox |
| `gold` | `#FCD34D → #F59E0B` | Finance |
| `gem` | `#22D3EE → #06B6D4` | Cyber Cyan |
| `red` | `#F87171 → #EF4444` | Health |
| `blue` | `#38BDF8 → #0EA5E9` | Tasks |
| `pink` | `#F472B6 → #EC4899` | Journal |
| `gloss` | `rgba(255,255,255,0.03) → transparent` | Subtle button overlay |

### 1.2 Glassmorphism — `glass` object

```typescript
export const glass = {
  fill: 'rgba(18,20,28,0.7)',
  fillStrong: 'rgba(12,13,18,0.85)',
  fillSoft: 'rgba(24,26,36,0.5)',
  rim: 'rgba(255,255,255,0.05)',
  rimSoft: 'rgba(255,255,255,0.03)',
  dark: 'rgba(0,0,0,0.2)',
  darkRim: 'rgba(255,255,255,0.08)',
} as const;
```

---

## 2. Design Principles

1. **Ambient Lighting Glow:**
   Instead of high-contrast, glowing drop shadows under every button/card, use very soft, blurred ambient glows. The `glow(hex)` helper uses a wide radius (`24px`) and lower opacity (`0.15`) to achieve a high-end bloom effect.
2. **Backdrop Orbs:**
   The `SkiaBackground` component renders large, slow-moving orbs with a massive `BlurMask` (`130px`) and low opacity (`0.05 - 0.08`). This adds depth and moodiness without cluttering the screen or looking cheap.
3. **Thinner Borders:**
   Avoid heavy borders. Use thin, translucent glass rims (`rgba(255,255,255,0.05)`) with high backdrop blurs to define panels.
4. **Refined Typography:**
   Headings use `Quicksand` with a subtle, soft drop shadow (`textShadow.emboss`). Body text uses `Be Vietnam Pro` for crisp legibility and excellent Vietnamese support.
