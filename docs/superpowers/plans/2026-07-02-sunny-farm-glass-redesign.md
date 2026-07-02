# Sunny Farm Glass v2 — Implementation Plan

> **For agentic workers:** Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Transform Personal OS from "Magic Academy" glass theme into premium "Sunny Farm Glass" — a living farm-world UI with domain-colored Skia backgrounds, wood/fabric/stone material components, and gold/amber Finance theme.

**Architecture:** New `src/components/skia/farm/` directory for layered Skia backgrounds (sky → clouds → hills → trees → decor → vignette). Existing `src/components/game/` gets variant extensions (material props on GamePanel/GameButton). Finance palette changes from teal to gold/amber in `src/theme/colors.ts`. Each screen gets its own domain-colored Skia farm scene.

**Tech Stack:** Expo + React Native + Skia (@shopify/react-native-skia) + Reanimated + LinearGradient

**Plan phases:**
1. Foundation — colors, SKILL.md, FarmBackground
2. Components — GamePanel, GameButton, CurrencyChip material variants
3. Screens — Each screen gets domain-colored FarmBackground
4. Finance gold refresh
5. Polish — tab bar, micro-animations

---

### Task 1: Update theme colors — finance gold palette

**Files:**
- Modify: `src/theme/colors.ts`

**Changes:**
- Add `gold: '#FFD700'`, `goldDeep: '#B8860B'`, `amber: '#FF8C00'`, `copper: '#CD7F32'`, `goldSoft: '#FFF3C4'` to `colors` object
- Change `domains.finance` from teal to gold:
  ```ts
  finance: {
    accent: colors.gold,
    deep: colors.goldDeep,
    soft: tint(colors.gold),
    gradient: [colors.gold, colors.amber] as const,
  },
  ```
- Add `gradients.gold: ['#FFE87C', '#FF8C00'] as const`
- Add `ACCENT_FACES` entries for gold and amber
- Add `ACCENT_DEEP` entries for new colors
- Add `ACCENT_GRADIENT` entries for new colors

- [ ] **Step 1: Update `src/theme/colors.ts`**
  - Add gold palette constants
  - Update finance domain
  - Add gradients.gold
  - Update accent mappings

- [ ] **Step 2: Run typecheck**

  ```bash
  cd /Users/hieuminh/Documents/hieu/my-os && npx tsc --noEmit 2>&1 | head -30
  ```

  Expected: Zero TS errors.

---

### Task 2: Rewrite design system SKILL.md

**Files:**
- Modify: `.claude/skills/design-system/SKILL.md`

**Changes:**
- Replace "Magic Academy" title with "Sunny Farm Glass v2"
- Replace purple sky references with blue sky / rolling hills / golden sun
- Update all color tokens to match new `colors.ts`
- Update component documentation to reflect material variants
- Add section about FarmBackground component
- Update CurrencyChip documentation with `savings` kind
- Add "Farm UI Principles" section

- [ ] **Step 1: Rewrite `.claude/skills/design-system/SKILL.md`**
  Complete rewrite of the design system doc to reflect Sunny Farm Glass v2

- [ ] **Step 2: Verify no broken references**
  Check that all referenced tokens exist in `src/theme/colors.ts`

---

### Task 3: Create FarmBackground Skia component

**Files:**
- Create: `src/components/skia/farm/SkyGradient.tsx`
- Create: `src/components/skia/farm/CloudLayer.tsx`
- Create: `src/components/skia/farm/HillLayer.tsx`
- Create: `src/components/skia/farm/SunMoon.tsx`
- Create: `src/components/skia/farm/TreeLayer.tsx`
- Create: `src/components/skia/farm/AmbientParticles.tsx`
- Create: `src/components/skia/farm/FarmBackground.tsx`
- Create: `src/components/skia/farm/index.ts`
- Modify: `src/components/skia/index.ts`

**Domain → Scene mapping:**

```ts
const DOMAIN_SCENES: Record<DomainKey, SceneConfig> = {
  today:    { sky: ['#D4A5F5', '#9B59B6', '#87CEEB'], sunColor: '#E8A5F5', hillColor: '#B889D4',  cloudColor: 'rgba(255,255,255,0.6)', particles: 'fireflies', trees: 2 },
  tasks:    { sky: ['#87CEEB', '#5BA3D9', '#B0E0E6'], sunColor: '#FFD700', hillColor: '#6B8E23',  cloudColor: 'rgba(255,255,255,0.8)', particles: 'none',     trees: 3 },
  finance:  { sky: ['#FFD700', '#FF8C00', '#87CEEB'], sunColor: '#FFD700', hillColor: '#B8860B',  cloudColor: 'rgba(255,200,100,0.5)', particles: 'sparkles', trees: 2 },
  health:   { sky: ['#FFB6C1', '#FF69B4', '#87CEEB'], sunColor: '#FF6B8A', hillColor: '#CD5C5C',  cloudColor: 'rgba(255,200,200,0.6)', particles: 'petals', trees: 3 },
  habits:   { sky: ['#FFA07A', '#FF7F50', '#87CEEB'], sunColor: '#FF8C00', hillColor: '#D2691E',  cloudColor: 'rgba(255,180,120,0.5)', particles: 'leaves', trees: 2 },
  goals:    { sky: ['#90EE90', '#32CD32', '#87CEEB'], sunColor: '#FFD700', hillColor: '#228B22',  cloudColor: 'rgba(200,255,200,0.6)', particles: 'fireflies', trees: 3 },
  journal:  { sky: ['#FFD1DC', '#FFB6C1', '#E0F0FF'], sunColor: '#FFB6C1', hillColor: '#DDA0DD',  cloudColor: 'rgba(255,220,240,0.5)', particles: 'petals', trees: 2 },
  notes:    { sky: ['#FFFACD', '#FFD700', '#87CEEB'], sunColor: '#FFD700', hillColor: '#DAA520',  cloudColor: 'rgba(255,250,200,0.6)', particles: 'leaves', trees: 2 },
  inbox:    { sky: ['#DDA0DD', '#9370DB', '#87CEEB'], sunColor: '#9370DB', hillColor: '#7B68AE',  cloudColor: 'rgba(200,180,255,0.5)', particles: 'fireflies', trees: 2 },
};
```

**FarmBackground usage:**
```tsx
<FarmBackground domain='finance' />
```
Replaces current `SkiaBackground` usage. Same position (absolutely filled behind content, `pointerEvents='none'`).

- [ ] **Step 1: Create `src/components/skia/farm/` components**
  Each layer component as a focused Skia path/shape

- [ ] **Step 2: Create `FarmBackground.tsx`** — orchestrator that composes layers

- [ ] **Step 3: Create `index.ts`** — barrel export

- [ ] **Step 4: Update `src/components/skia/index.ts`** — export new farm components

- [ ] **Step 5: Run typecheck**
  ```bash
  cd /Users/hieuminh/Documents/hieu/my-os && npx tsc --noEmit 2>&1 | head -30
  ```

---

### Task 4: GamePanel material variants (wood/fabric/stone)

**Files:**
- Modify: `src/components/game/GamePanel.tsx`
- Modify: `src/components/game/index.ts`

**Changes:**
- Add `variant` prop: `'wood' | 'fabric' | 'stone'` (default `'wood'`)
- **Wood**: brown background with wood grain pattern (Skia paths), dark brown border, rivet decorations
- **Fabric**: beige/twill texture, stitch border effect
- **Stone**: gray background, chiseled border, subtle shadow
- Common: 3D base shadow using domain's `deep` color, `borderRadius: radius.lg`
- Update exports/index

- [ ] **Step 1: Modify `GamePanel.tsx`** — add variant prop and material rendering

- [ ] **Step 2: Update exports in `index.ts`**

- [ ] **Step 3: Run typecheck**

---

### Task 5: GameButton new material variants (stone/gem/wood/metal)

**Files:**
- Modify: `src/components/game/GameButton.tsx`
- Modify: `src/components/game/GameIconButton.tsx`
- Modify: `src/components/game/index.ts`

**Changes:**
- Add `material` prop: `'gem' | 'stone' | 'wood' | 'metal'` (default `'gem'`)
- **Gem**: translucent gradient + sparkle highlight (current jelly look, keep it)
- **Stone**: matte gray/brown gradient, hard shadow
- **Wood**: warm brown/amber gradient, wood grain feel
- **Metal**: metallic gradient (silver/steel), high-contrast gloss
- Base/shadow stays 3D structured (base + cap + gloss)
- GameIconButton gets same material prop

- [ ] **Step 1: Modify `GameButton.tsx`** — add material prop

- [ ] **Step 2: Modify `GameIconButton.tsx`** — add material prop

- [ ] **Step 3: Update type exports in `index.ts`**

- [ ] **Step 4: Run typecheck**

---

### Task 6: CurrencyChip savings kind + farm icons

**Files:**
- Modify: `src/components/game/CurrencyChip.tsx`
- Modify: `src/components/game/index.ts`

**Changes:**
- Add `'savings'` to `CurrencyKind` type
- Savings: gold/amber gradient, treasure chest icon (`treasure-chest` or `safe` MCI)
- Update icon mapping for each kind:
  - `coins`: `cash-multiple` or `currency-usd`
  - `gems`: `diamond`
  - `xp`: `star`
  - `savings`: `treasure-chest` or `safe-square`

- [ ] **Step 1: Modify `CurrencyChip.tsx`** — add savings kind + icon mapping

- [ ] **Step 2: Update type exports in `index.ts`**

- [ ] **Step 3: Run typecheck**

---

### Task 7: Update TodayScreen with FarmBackground

**Files:**
- Modify: `src/features/today/TodayScreen.tsx`

**Changes:**
- Replace `SkiaBackground` import with `FarmBackground` from `@/components/skia`
- Replace `<SkiaBackground domain='today' intensity={0.42} />` with `<FarmBackground domain='today' />`

- [ ] **Step 1: Modify `TodayScreen.tsx`**

- [ ] **Step 2: Run typecheck**

---

### Task 8: Update TasksScreen with FarmBackground

**Files:**
- Modify: `src/features/tasks/TasksScreen.tsx`

**Changes:**
- Replace `SkiaBackground` → `FarmBackground`, domain 'tasks'

- [ ] **Step 1: Modify `TasksScreen.tsx`**

- [ ] **Step 2: Run typecheck**

---

### Task 9: Update FinanceScreen — Gold/treasure complete refresh

**Files:**
- Modify: `src/features/finance/FinanceScreen.tsx`
- Modify: `src/features/finance/components/FinanceHero.tsx` (if exists)
- Modify: `src/features/finance/components/FinanceHeroWidget.tsx` (in today widgets)

**Changes:**
- Replace `<SkiaBackground domain='finance' intensity={0.38} />` with `<FarmBackground domain='finance' />`
- Change all teal references to gold/amber:
  - FAB gradient: teal gradients → `gradients.gold`
  - CurrencyChip in HUD: use `kind='savings'` for savings
  - Avatar: gold gradient instead of gem gradient
  - `seeAllChip` background: `colors.gold` instead of `colors.teal`
  - Coin effects, treasure theme vibe

- [ ] **Step 1: Modify `FinanceScreen.tsx`** — FarmBackground + gold palette

- [ ] **Step 2: Update Finance sub-components** — any remaining teal refs

- [ ] **Step 3: Run typecheck**

---

### Task 10: Update remaining screens with FarmBackground

**Files:**
- Modify: (`app/(tabs)/health.tsx` →) `src/features/gym/HealthDashboard.tsx`
- Modify: `src/features/habits/HabitsScreen.tsx`
- Modify: `src/features/journal/JournalScreen.tsx`
- Modify: `src/features/notes/NotesScreen.tsx`
- Modify: `src/features/goals/GoalsScreen.tsx`
- Modify: `src/features/inbox/InboxScreen.tsx`

**Changes per screen:**
- Replace `SkiaBackground` import with `FarmBackground`
- Use respective domain key: health, habits, journal, notes, goals, inbox

- [ ] **Step 1: Update HealthDashboard** — FarmBackground domain='health'

- [ ] **Step 2: Update HabitsScreen** — FarmBackground domain='habits'

- [ ] **Step 3: Update JournalScreen** — FarmBackground domain='journal'

- [ ] **Step 4: Update NotesScreen** — FarmBackground domain='notes'

- [ ] **Step 5: Update GoalsScreen** — FarmBackground domain='goals'

- [ ] **Step 6: Update InboxScreen** — FarmBackground domain='inbox'

- [ ] **Step 7: Run typecheck**

---

### Task 11: Tab bar polish — gold magic button

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

**Changes:**
- Update `MagicTabButton` — when finance domain is active, use gold gradient
- Or simply: keep purple magic button but add a subtle gold ring when Finance tab is active
- Minor: update tab bar shadow color to warmer brown

- [ ] **Step 1: Modify `_layout.tsx`** — update magic button / tab bar glow

- [ ] **Step 2: Run typecheck**

---

### Task 12: Final typecheck and verify

- [ ] **Step 1: Full typecheck**

  ```bash
  cd /Users/hieuminh/Documents/hieu/my-os && npx tsc --noEmit 2>&1
  ```

  Expected: Zero errors.

- [ ] **Step 2: Verify import chains** — all new components properly exported

