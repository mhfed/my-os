# Lumina OS — Design Specification

> Single source of truth for the visual + interaction design of **my-os**, a personal
> life operating system. This document supersedes the stale `design-system` skill
> ("Sunny Farm Glass"), which describes a warm farm-game aesthetic that was **never
> built**. The shipped and intended direction is **Lumina OS**: a deep-charcoal,
> Material‑3 dark theme lit by neon "power-up" accents and frosted glass.

- **Audience:** one primary user — a Vietnamese power-user ("Minh Hiếu") managing tasks,
  money (₫ VND), health, habits, goals, journal and notes on iOS, one-handed.
- **Source of truth for tokens:** `src/theme/colors.ts`, `typography.ts`, `motion.ts`.
- **Source of truth for primitives:** `src/components/game`, `src/components/motion`.
- **Reference mockups:** `stitch/*/code.html` + `stitch/*/screen.png`.

---

## 0. What "expert-designed" means here (the bar)

Every screen must pass these five tests before it ships. They are the rubric this spec
is written against.

1. **Answer-first.** The top third of every screen answers the user's single most
   important question for that domain *without scrolling* (Today → "how is my day?",
   Finance → "how much do I have?", Health → "what's my next set?"). Detail comes after.
2. **State is legible at a glance.** Status is encoded in **form** (a ring, a stripe, a
   pill, a glow), not only in text or number. What needs attention pulls the eye.
3. **One accent per screen.** Each domain owns exactly one neon hue. Semantic colors
   (success / warning / danger) are separate and never borrowed as decoration.
4. **Every touch is rewarded.** Press = spring scale + light haptic. Completion = a
   glow/count-up moment. Nothing changes silently.
5. **Nothing is dead.** Empty, loading, and error states are designed, written in the
   user's voice, and offer the next action. No blank rectangles.

---

## 1. Brand & personality

Lumina OS turns life-admin into an immersive, rewarding **personal console**. The tone is
**playful, motivating, high-energy** — the opposite of clinical productivity apps.

- **Dark minimalism** — near-black charcoal ground so neon accents and ₫ values pop.
- **Glassmorphism** — frosted, translucent surfaces float above soft ambient glows.
- **Tactile / gamified** — squishy physics, glowing orbs, progress rings, streak flames.
  Progress is *felt*, not just displayed.
- **Soft geometry** — large radii and chunky rounded icons strip away OS "seriousness".

Design driver in one line: **"A handheld gaming console for your life."**

---

## 2. Foundations (design tokens)

All values below already live in `src/theme/`. Never inline a raw hex, shadow, or font
string in a component — import the token. If a token is missing, add it to the theme.

### 2.1 Color

**Ground & surfaces** (Material‑3 dark tonal ladder — hierarchy comes from *tone*, not shadow):

| Token | Hex | Role |
|---|---|---|
| `appBg` / `screenBg` | `#131313` | Level 0 — app background |
| `surfaceContainerLowest` `black` | `#0e0e0e` | Recessed wells, tab bar |
| `card` | `#1c1b1b` | Level 1 — solid card |
| `cardAlt` `surfaceContainer` | `#201f1f` | Nested / alt card |
| `track` `surfaceContainerHigh` | `#2a2a2a` | Progress tracks, inset fields |
| `surfaceContainerHighest` | `#353534` | Chips, highest surface |
| `border` | `rgba(255,255,255,0.08)` | Glass rim (1px) |

**Glass** (`glass` object) — the signature surface. `fill: rgba(26,26,26,0.6)` + `blur(12)` +
`1px rgba(255,255,255,0.08)` rim. Use `fillStrong` (0.8) over busy/glowing backgrounds,
`fillSoft` (0.4) for secondary layers. **Standardize blur to 12** everywhere (mockups drift
between 12 and 20 — pick 12 for perf and consistency; 20 only for full-screen modals).

**Text:** `text #e5e2e1` (primary) · `muted #b9cacb` (secondary / `on-surface-variant`) ·
`textOnDark #ffffff` (on filled accent). Never place body text below `muted` contrast.

**Domain accents** — each domain owns one hue (face + `*Deep` for 3D/borders + a soft tint):

| Domain | Accent | Hex | Meaning |
|---|---|---|---|
| Tasks · system · nav | Electric Blue | `#00f0ff` | core OS actions |
| Today (home) | Teal | `#00dbe9` | the daily pulse |
| Habits | Neon Green | `#2ff801` | growth, streaks |
| Health / Gym | Hot Pink | `#ffccd6` → hot `#ff2d7a` | vitality, effort |
| Finance · Goals · Notes | Gold | `#FFD700` | wealth, rewards |
| Inbox | Purple | `#bb86fc` | unsorted / capture |
| Journal | Pink | `#ffccd6` | reflection |

Consumed via `domains[key]` → `{accent, deep, soft, gradient}`. **A screen uses its domain
accent for interactive/active elements only.** Everything else stays neutral charcoal + text.

**Semantic colors** (independent of accent — never used decoratively):
`green #2ff801` positive/income · `red #ff1744` / `error #ffb4ab` danger/expense ·
`orange #ff8c00` warning/overdue · `muted` neutral/disabled.

**Gradients** (`gradients`): `powerOrb` (blue→green, FAB only), `blue/gold/green/pink/purple`
(accent caps), `spend` (teal→green, progress), `gloss` (top sheen), `glassPanel` (panel wash).

### 2.2 Elevation & depth — glow, not drop-shadow

Depth is built with **tonal layering + luminescent blur**, not gray drop shadows.

- **Level 0** ground `#131313`. Global ambient: 2–3 large domain-tinted orbs, `blur ~80px`,
  opacity 10–15%, drifting slowly (respect reduced-motion). See `SkiaBackground` / `GlowOrb`.
- **Level 1** glass card: `glass.fill` + 1px rim. No shadow.
- **Level 2** modal/sheet: `glass.fillStrong` + `blur(20)` + `elevation.card` for lift off content.
- **Glow** for *active* state only: `glow(accent, 0.3, 15–18)` — a 15–20px colored halo at 30%.
  Reserve glow for things that are alive (active task, burning streak, focused input, the orb).

### 2.3 Typography

Dual-font system. Never introduce a third family.

- **Quicksand** (`fonts.display*`) — headlines, labels, **all numerals & currency**. Rounded
  terminals = the friendly, game-like voice.
- **Be Vietnam Pro** (`fonts.*`) — body, descriptions, long-form. Superior Vietnamese diacritics.

| Preset | Font / size / lh | Use |
|---|---|---|
| `headlineXl` | Quicksand 700 · 32/40 · -0.02em | screen title (hero) |
| `headlineLg` | Quicksand 700 · 24/30 | section on large screens |
| `headlineLgMobile` | Quicksand 700 · 22/28 | **default section heading** |
| `currencyDisplay` | Quicksand 700 · 28/34 | ₫ amounts, big metrics |
| `bodyLg` | Be Vietnam Pro 400 · 18/26 | lead paragraph |
| `bodyMd` | Be Vietnam Pro 400 · 16/24 | **default body** |
| `labelMd` | Quicksand 600 · 14/20 · +0.05em | labels, chips, tab labels (often UPPERCASE) |

Rules: headings get `text-wrap: balance` intent (keep short). Body ≤ ~65 chars/line.
Numbers that align in columns use `font-variant-numeric: tabular-nums` (RN: use Quicksand +
fixed width). `textShadow.emboss` only on headings sitting directly on the glowing ground.

### 2.4 Currency (₫) — house rules

- Symbol **follows** the amount with a non-breaking space: `500.000 ₫`, `12,5 Tr ₫`.
- Use `formatVND` (full) and `formatCompactVND` (Tr/Tỷ) from `utils/currency.ts`.
- Currency is **always Quicksand bold** — money should read as "wealth".
- Income/positive → `green`; expense/negative → `red`; neutral balance → domain accent or `text`.

### 2.5 Spacing, grid & radius

- **Baseline:** 4px. **Screen margin:** 20px (`margin-x`). **Gutter:** 16px. Stack rhythm:
  `stack-sm 8 · stack-md 16 · stack-lg 32`. Card internal padding: **16 or 24** (never < 12).
- **Grid:** single column of glass cards; **2-col bento** (`gap 16`) for scannable stat/metric
  tiles; horizontal scroll rows for carousels (PRs, filter pills).
- **Radius** (`radius`): chips/buttons/inputs → `pill` (9999). Cards → `xl` (32) primary,
  `lg` (24) nested. Icon tiles → `lg`/`md`. Rings: thick stroke (8px+) with round caps.
- **Tap targets ≥ 44×44.** Bottom content padding ≥ **110** to clear the floating tab bar +
  home indicator; FABs sit `bottom ≥ 96`.

### 2.6 Motion (`motion.ts`)

- **Ease:** `easeOut` = cubic-bezier(0.22, 1, 0.36, 1) for entrances/reveals.
- **Durations:** `fast 160` (press/tap), `base 280` (transitions), `slow 460` (sheets),
  `reveal 900` (hero count-ups). **Springs:** `press` (tap squish), `smooth` (layout), `bouncy` (rewards).
- **Signatures:** press → scale 0.92–0.95 spring + `Haptics.selection`. Card entrance →
  `AnimatedCard` staggered translate-up (`staggerDelay(i)`). Number changes → `Counter` count-up.
  Completion → bouncy scale + brief accent glow bloom.
- **Always** gate ambient/loop animation behind `useReducedMotion()`.

---

## 3. Component library (`@/components/game`, `@/components/motion`)

Build only from these. Extend the kit rather than one-off styling a screen.

| Component | Spec | Rules |
|---|---|---|
| **GamePanel** | The core card. `variant: glass \| elevated \| inset`; optional `title` + `headerRight`. `radius.xl`, `glass.fill`, 1px rim, `pad 16/20`. | Every content block is a GamePanel. `inset` for wells/tracks; `elevated` for modals. |
| **GameButton** | Gradient **pill** (accent cap + gloss + `deep` base). `variant` = domain hue; `size sm40/md52/lg62`; `icon?`, `fullWidth?`, `haptic`. | Primary actions only. One primary button per view. |
| **GameIconButton** | Square/round gradient icon button, same variants. | Secondary icon actions (bell, filter, add-in-header). |
| **IconBadge / Unicon3D** | Glossy 3D "clay" chip for one icon; auto-resolves accent+deep+gloss. | Category/module glyphs. Pass a theme accent, never a raw deep shade. |
| **CurrencyChip** | HUD pill: `coins \| gems \| xp \| savings`, gold rim, glowing ₫. | Score/resource HUD; not for transaction amounts. |
| **StarRating** | Gold glowing ★ strip. | Levels, ratings. |
| **ProgressRing** *(add)* | Concentric ring, `track` = white 10%, fill = accent gradient, **stroke ≥ 8, round caps**, optional center label + glow when active. | Daily score, goal %, workout set progress. Standardize the many one-off rings into this. |
| **StreakFlame** *(add)* | Flame icon + count; color **orange → hot pink** as streak grows; `flame-glow`. | Habits, journal, today streak. |
| **StatTile** *(add)* | Bento square: 3D icon top-left, trend/nav glyph top-right, label + big Quicksand value bottom. `aspect 1:1`. | Today bento, finance stats, "next up". |
| **SegmentedPills / FilterPills** | Horizontal-scroll pill row; active = filled `secondaryContainer`/accent, rest = `surfaceContainer`. | Filters, tabs-within-screen. |
| **ListRow** *(standardize)* | 44px+ row: leading `IconBadge`, title + subtitle, trailing value/chevron; inset 1px dividers that don't touch card edges. | Transactions, notes, history, settings. |
| **EmptyState** *(add)* | Centered 3D icon/orb + one-line headline + subline + optional CTA button. | Every list's zero state. |
| **Skeleton** (`ShimmerView`) | Shimmering glass placeholders matching final layout. | Loading state before store `ready`. |
| **AnimatedCard / PressableScale / Counter / GlowOrb** | Motion primitives (§2.6). | Wrap sections, pressables, numbers, decorative halos. |

**Backgrounds:** every screen = `FarmBackground domain={key}` (dark charcoal gradient +
domain ambient glow) as the base layer; content in a `SafeAreaView` above it. `SkiaBackground`
is the heavier animated variant (drifting orbs) — use for hero/immersive screens (Today) if perf allows.
*(Rename note: `FarmBackground` is a misnomer inherited from the old farm concept — treat it as
`AmbientBackground`; a rename is a nice-to-have cleanup, not required.)*

---

## 4. Information architecture & navigation

**Bottom tab bar** — 5 slots, floating frosted bar (`surfaceContainerLowest/90` + blur, top
hairline, 78px), active tab = neon green pill + filled icon:

`Today` · `Tasks` · **Power Orb (center)** · `Health` · `Finance`

- **Power Orb (center FAB):** 64px, `powerOrb` gradient, 25px blue glow, spring on press.
  Opens the **SuperAppSheet** — the launcher for all secondary modules.
- **SuperAppSheet ("Super Menu"):** bento grid of modules — **Inbox** (wide, shows unread
  count), **Habits**, **Journal**, **Notes**, **Goals**, + utility rows (Settings, Profile,
  Backup) and a "Memory Utilization" footer stat. This is the `more` screen's content; unify
  `more.tsx` and `SuperAppSheet` into one component so the grid never drifts.
- **Secondary screens** (`inbox/journal/habits/notes/goals/more`) are `href:null` — reached via
  the orb sheet, Today shortcuts, or `router.push`. Each has a back affordance in its header.

**Global patterns**
- **GlobalCapture:** a global quick-capture available everywhere it won't collide with a
  screen's own FAB (hidden on tasks/finance/notes/goals). Writes to Inbox. Keep this — frictionless
  capture is core to a life-OS.
- **Per-screen FAB:** domain-colored, `bottom ≥ 96`, right `20`. One primary create action per screen.
- **Sheets/modals:** bottom sheets (`glass.fillStrong` + blur 20, drag handle, `radius.xl` top
  corners). Full-screen modal only for immersive create/edit (workout, note editor).

**Consistency fixes to apply (IA-level)**
1. **One language.** The app is mixed (Finance = Vietnamese, others = English). Standardize **all
   UI copy to Vietnamese** for the primary user (see §7). Keep code identifiers English.
2. **One header pattern.** Every screen: left (avatar on tabs / back chevron on pushed screens),
   centered or left title (`headlineXl`/`headlineLgMobile`), right action(s). No bespoke headers.
3. **Retire dead code.** `features/today/components/widgets/*` (12 unused widgets + WidgetGrid/
   LifeRing) is a legacy dashboard not wired in — remove or fold intentionally, don't leave it.

---

## 5. Screen specifications

Each screen: **Job → Layout (top-to-bottom) → Key components → UX upgrades → States.**
Layouts obey §0 (answer-first, one accent, legible state).

### 5.1 Today — home dashboard · accent **Teal `#00dbe9`**

**Job:** "How is my life today, and what's the one thing to do next?"

**Layout**
1. **App bar** — avatar (level badge) + greeting `Chào buổi sáng, Minh Hiếu` · streak flame · bell.
2. **Daily Score hero** — big **ProgressRing** (score 0–100) with pulsing teal glow; center =
   score + `ĐIỂM HÔM NAY`. This is the thesis of the screen; give it air (py 24).
3. **Habit streak pills** — horizontal StreakFlame pills (tap → toggle/that habit).
4. **Today's tasks** — a GamePanel list (3–5), inline check with squish + strike-through on done;
   "Xem tất cả" → Tasks.
5. **Quick reflection** — Journal shortcut card (left accent stripe, edit orb).
6. **Bento grid (2-col)** — StatTiles: Finance (balance), Health (steps/next), Goals (%), Notes (recent).

**Key components:** `ProgressRing`, `StreakFlame`, `StatTile`, task ListRows, `Counter`, `AnimatedCard`.

**UX upgrades:** derive score transparently (tooltip breakdown on tap); make every bento tile a
real deep-link; count-up the score on load; pull-to-refresh with a satisfying spring. Kill the
unused widget system — this is the one dashboard.

**States:** first-run → friendly empty ("Bắt đầu ngày mới ✨" + add-task CTA). Loading → skeleton
ring + skeleton tiles.

### 5.2 Tasks — accent **Electric Blue `#00f0ff`**

**Job:** "What must I do, in priority order, and let me close things fast."

**Layout**
1. **Header** — "Công việc" + "X đang mở · Y quá hạn" subtitle.
2. **FilterPills** — Hôm nay / Sắp tới / Dự án (scrollable).
3. **Sectioned list** (FlashList) — **QUÁ HẠN → HÔM NAY → HOÀN THÀNH**. Each `TaskCard`:
   priority left-stripe (P0 red glow / P1 blue / P2 gray), round checkbox, title + time, priority
   badge, optional subtask sub-list + thin gradient progress bar (done/total).
4. **Quick-add** inline field at bottom of Today section ("Tôi muốn…") with date/priority chips.
5. **Blue FAB** → AddTaskModal.

**Key components:** `FilterPills`, `SectionHeader`, `TaskCard`, quick-add row, `AddTaskModal`.

**UX upgrades:** high-priority active card gets the subtle pulse glow (from mockup); completing a
task animates opacity/scale down + haptic; overdue count in header is tappable → filters to overdue;
swipe actions (complete / reschedule) as a fast path.

**States:** all-done → "Sạch việc hôm nay 🎉". Empty → quick-add focused.

### 5.3 Health / Gym — accent **Hot Pink `#ff2d7a`**

Two modes off one tab (`gymStore.isWorkoutActive`).

**Dashboard (`HealthDashboard`)** — Job: "Start training / see my progress."
1. Header "Sức khỏe" + subtitle.
2. **Start Workout** hero card — pink gradient, dumbbell, "Bắt đầu buổi tập" → starts session.
3. **Weekly activity** — area sparkline (pink gradient fill, faint grid, emphasized endpoint).
4. **Personal Records** — horizontal StatTile carousel (exercise, best, date; today's PR glows).
5. **Workout history** — ListRows (name, date, #exercises, duration).

**Active workout (`GymScreen`)** — Job: "Log this set with zero friction." Tab bar hidden.
1. **Immersive app bar** — "BUỔI TẬP" label + live **timer** (pink gradient text) + kcal chip.
2. **Current exercise** GamePanel — name, "Set 3/4" + set dots; **big weight/reps inputs**
   (recessed, 2px pink border that glows on focus, Quicksand currency-size numerals); "Nghỉ (60s)"
   + glowing "Hoàn thành set".
3. **Logged exercises** list + "Next in line" bento.
4. **Sticky FinishBar** (glass, pink) — Kết thúc / Hủy.

**Key components:** `WorkoutHeader`, `ActiveExerciseCard`, `LoggedExerciseCard`, `FinishBar`,
glowing numeric inputs, `ProgressRing`/set-dots, sparkline.

**UX upgrades:** big thumb-friendly steppers on inputs; rest timer with haptic on finish;
Complete-Set = bouncy + haptic; keep screen awake during a session.

**States:** no history → "Chưa có buổi tập nào — bắt đầu buổi đầu tiên." Strava row → clearly "Sắp có".

### 5.4 Finance — accent **Gold `#FFD700`** (already the most complete; polish to spec)

**Job:** "How much do I have, where did it go, who owes whom?"

**Layout**
1. **App bar** — ₫ avatar (gold ring) + "Tài chính" + bell.
2. **FinanceHero** — `Tổng số dư` label + big `currencyDisplay` balance (gold) + income/expense
   mini-cards (green/red). Add a decorative gold glow blob.
3. **Bento row** — category **donut** (top-3 + Khác, month center, legend) · **6-month bar
   trend** (current month = gold, rest muted). Give both `overflow` care and consistent height.
4. **Savings goals** — up to 2 active, progress bars (goal color), "Thêm".
5. **Debt ledger "Sổ nợ"** — "Ai nợ tôi" (green stripe) / "Tôi nợ ai" (red stripe) with stacked
   initial-avatars → DebtLedgerSheet.
6. **Recent transactions** — ListRows (icon chip, name/date, signed amount), "Tất cả" → history.
7. **Gold FAB** → AddTransactionSheet.

**Key components:** `FinanceHero`, donut (SVG), trend chart (SVG), goal bars, debt cards,
transaction ListRows, sheets (Add/History/Debt/Goal/Budget/Categories/Recurring).

**UX upgrades:** month selector in the bar (scope everything to a month); tap donut slice →
filter transactions by category; count-up the balance; budget-over-limit categories flash the
warning color. Consolidate the 23 finance components — the screen composes sections inline while
many standalone components duplicate them; pick one implementation per section.

**States:** no transactions → the existing designed empty state (keep it).

### 5.5 Habits — accent **Neon Green `#2ff801`**

**Job:** "Keep my streaks alive; check off today."
1. Header "Thói quen" + month subtitle + completion % box + add.
2. **WeeklyGrid** — 7-day × habits check matrix; today's column highlighted; done cells = filled
   green with subtle glow.
3. **Habit list** — `HabitCard`: 3D icon, name, StreakFlame (orange→pink by length), a chunky
   "Complete" tap (haptic pulse) + a mini ProgressRing for the week.
4. `AddHabitModal`.

**UX upgrades:** completing today's cell fires the flame-grow + bounce + haptic; long streaks earn
a hotter flame + gold star; restore the intended gradient title properly (install masked-view or
use a LinearGradient text mask) instead of the solid-purple fallback.

**States:** no habits → "Tạo thói quen đầu tiên" with a green CTA.

### 5.6 Goals — accent **Gold `#FFD700`**

**Job:** "Am I on track to my milestones?"
1. Centered header "Mục tiêu" + back.
2. **GoalCard** list — title, optional deadline (countdown pill; turns orange when near, red when
   overdue), completion % (ring or box), description, **milestone checklist** (tap to toggle,
   satisfying check).
3. Target-icon FAB → GoalCreatorModal.

**UX upgrades:** progress derived from milestones; celebrate 100% (confetti/gold bloom + StarRating);
sort by soonest deadline; show "N cột mốc còn lại".

**States:** empty → "Đặt mục tiêu lớn đầu tiên 🎯".

### 5.7 Journal — accent **Pink `#ffccd6`**

**Job:** "Reflect today; revisit the past."
1. Header "Nhật ký" + StreakFlame ("N ngày").
2. **Search** — magnify field; typing → results mode (date + 4-line preview cards).
3. **CalendarStrip** — week scroller; days with entries dotted; today emphasized.
4. **Today's EntryCard** — MoodSelector (emoji row, selected glows) + free-form entry (tap → editor).
5. **TimeCapsule** — "On this day" / a past entry resurfaced.

**UX upgrades:** mood sets a subtle ambient tint for the card; autosave; streak celebrates milestones;
gentle daily reminder prompt copy.

**States:** no entry today → prompt card "Hôm nay thế nào?" + mood row. No results → "Không tìm thấy".

### 5.8 Notes / Second Brain — accent **Gold/Yellow**

**Job:** "Capture and find ideas fast."
1. Centered header "Bộ não thứ hai" + back.
2. **Search / tag filter** row.
3. **Note cards** (FlatList / masonry feel) — title, updated date, 2-line preview, #tag pills.
4. FAB → NoteEditorModal (distraction-free editor, autosave, tag input).

**UX upgrades:** tag chips filter in place; sort by recently-updated; pin important notes;
markdown-ish preview. **States:** empty → "Ghi lại ý tưởng đầu tiên".

### 5.9 Inbox — accent **Purple `#bb86fc`**

**Job:** "Triage everything I dumped, to zero."
1. Header — back + "Hộp thư" + open-count chip.
2. **InboxItemRow** list — captured text, source glyph, quick-triage actions (→ Task / → Note /
   → Goal / Xong / Xóa) as trailing chips or swipe.
3. Fed by GlobalCapture / QuickCapture.

**UX upgrades:** swipe-to-triage; "convert to…" turns an item into the right domain object;
bulk-clear. **States:** empty → "Hộp thư trống ✨" (the reward for reaching inbox-zero).

### 5.10 More / Super Menu — neutral + multi-accent

Unify `more.tsx` with **SuperAppSheet**. Bento launcher (Inbox wide + Habits/Journal/Notes/Goals),
utility ListRows (Cài đặt, Hồ sơ, Sao lưu dữ liệu → `exportAllData`), "Memory Utilization" footer
stat. Edit-mode toggles which tiles pin into the orb sheet.

---

## 6. States, feedback & edge cases (applies to all screens)

- **Loading:** while a store's `ready` is false → `Skeleton` matching the final layout (not a spinner).
- **Empty:** designed `EmptyState` — 3D icon/orb + Vietnamese one-liner + primary CTA.
- **Error / offline:** inline glass banner, plain-language cause + fix, retry action. No raw errors.
- **Success/completion:** spring + haptic + brief accent glow; destructive actions confirm (sheet),
  and offer **undo** (toast) rather than a scary dialog where possible.
- **Overflow:** long names `numberOfLines` + ellipsize; wide charts/tables scroll inside their own
  container; the screen body never scrolls sideways.

---

## 7. Content & voice (Vietnamese-first)

- **Language:** all user-facing copy in **Vietnamese**, warm and encouraging ("Bắt đầu ngày mới",
  "Sạch việc rồi 🎉"). Standardize the currently-English screens.
- **Buttons say what happens:** "Thêm giao dịch", then a toast "Đã thêm". Active voice.
- **Errors** explain + fix, no apologies. **Labels** name things the user recognizes (a person has
  "Thông báo", not "webhook config").
- **Numbers:** VND per §2.4; dates via `utils/date` (T2–CN, "Tháng N"); relative where friendly ("2 giờ trước").

---

## 8. Accessibility

- **Contrast:** body text ≥ `muted` on charcoal (AA). Never rely on a neon hue alone to convey
  state — pair with icon/label (accent + shape, per §0.2).
- **Tap targets ≥ 44×44**; spacing prevents mis-taps.
- **Reduced motion:** `useReducedMotion()` disables ambient orb drift, count-ups, and big springs
  (fall back to instant/fade). Already wired in motion + skia primitives — honor it in new work.
- **Dynamic type:** presets should scale; test at large text. **VoiceOver:** meaningful
  `accessibilityLabel`s on icon-only buttons (bell, FAB, checkboxes), `accessibilityRole` on pressables.
- **Focus:** visible focus/pressed state on every interactive element.

---

## 9. Migration plan (spec → shipped)

Order chosen for lowest risk + fastest visible payoff. Commit per screen (repo convention).

1. **Foundations first.** Add missing primitives to `@/components/game`: `ProgressRing`,
   `StreakFlame`, `StatTile`, `EmptyState`, standardized `ListRow`. Standardize glass blur to 12.
   Add a `spacing` scale module to replace ad-hoc numbers.
2. **Finance** — already closest; polish to §5.4, wire month selector, consolidate duplicate components.
3. **Tasks** — apply TaskCard/priority/pulse spec, quick-add, swipe actions.
4. **Today** — rebuild on ProgressRing hero + bento StatTiles; delete unused widget system.
5. **Health/Gym** — glowing inputs, sparkline, PR carousel, finish bar.
6. **Habits · Goals · Journal · Notes · Inbox** — apply the per-screen specs; fix habit gradient title.
7. **More/SuperApp** — unify into one launcher component.
8. **Global** — Vietnamese copy pass; header pattern pass; a11y pass; retire the stale
   `design-system` (farm) skill so this file is the only source of truth.

**Definition of done (per screen):** matches its §5 spec · uses only §3 components + §2 tokens
(no raw hex/shadow/font) · designed empty+loading+error states · one accent · a11y labels present ·
`npm run typecheck` clean · verified on device.

---

## 10. Consistency checklist (run before finishing any UI change)

- [ ] No raw hex / inline shadow / literal font — all from `@/theme/*`.
- [ ] Content in `GamePanel`; primary action = `GameButton`; icons = `GameIconButton`/`IconBadge`.
- [ ] Exactly one domain accent used for interactive/active elements; semantics separate.
- [ ] Background = `FarmBackground domain={key}`; glow only on *active* elements.
- [ ] Headings Quicksand (`headline*`); body Be Vietnam Pro (`body*`); ₫ Quicksand bold, symbol trailing.
- [ ] Radius from scale (cards `xl`, chips/buttons `pill`); tap targets ≥ 44; bottom pad ≥ 110.
- [ ] Press = spring + haptic; entrances via `AnimatedCard`; numbers via `Counter`; reduced-motion honored.
- [ ] Empty / loading / error states designed and written in Vietnamese.
- [ ] `npm run typecheck` passes with zero errors.
