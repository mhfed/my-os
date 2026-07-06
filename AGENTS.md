# AGENTS.md

## Purpose

This file gives AI coding agents the minimum operating rules needed to work
quickly and safely in this repo.

## Issue tracking (beads / bd)

This project uses **bd (beads)** for issue tracking.

- Run `bd prime` for workflow context and command guidance.
- Use `bd ready`, `bd show <id>`, `bd update <id> --claim`, and `bd close <id>`.
- Use `bd remember "insight"` for persistent project memory; do not create MEMORY.md files.
- Do not use markdown TODO lists for task tracking; create beads issues instead (`bd create "Title" -p <0-3>`).
- Issue IDs are prefixed `my-os-` (e.g. `my-os-a3f2dd`).

## Project shape

- App type: Expo + React Native + Expo Router
- State: Zustand stores in `src/store`
- Persistence: SQLite via `expo-sqlite`
- DB schema: `src/db/schema.ts`
- Shared DB helpers: `src/db/database.ts`
- UI system: `src/components/game` and `src/theme/*`
- Main visible tabs: `Today`, `Tasks`, `Health`, `Finance`
- Hidden modules: `Inbox`, `Journal`, `Habits`, `Notes`, `Goals` via Super App / More flows

## Working rules

1. Read existing code before changing architecture.
2. Prefer extending the owning store over adding duplicate local state.
3. Keep imports on the `@/` alias when possible.
4. Use shared game UI components/tokens instead of ad-hoc styles.
5. Do not invent a formal DB migration framework unless the task requires adding one.
6. Treat `.claude/worktrees/` as agent scratch space; do not rely on it for app behavior.
7. Never revert unrelated user changes.

## Standard workflow

1. Inspect the touched route, feature, store, and relevant types.
2. If persistence changes, update `schema.ts`, types, and the owning store together.
3. If a new persisted store is introduced, initialize it from `app/_layout.tsx`.
4. If navigation changes, update the appropriate route and tab/hidden-entry wiring.
5. Run `npm run typecheck`.
6. Manually smoke-test the exact flow changed if runtime validation is possible.

## Repo-specific cautions

- `initDatabase()` applies the full schema idempotently; several stores call it.
- Some DB tables use `camelCase` columns, some newer ones use `snake_case`. Match existing names exactly.
- `TodayScreen` is an aggregate surface. Feature work may need a follow-up update there.
- The visible tab bar is intentionally small. New modules usually should not become tabs by default.

## Useful files

- `app/_layout.tsx`
- `app/(tabs)/_layout.tsx`
- `src/features/today/TodayScreen.tsx`
- `src/db/schema.ts`
- `src/db/database.ts`
- `src/store/financeStore.ts`
- `src/store/tasksStore.ts`
- `.claude/skills/design-system/SKILL.md`
- `.claude/skills/testing/SKILL.md`
- `.claude/skills/database/SKILL.md`
- `.claude/skills/feature/SKILL.md`
- `.claude/skills/checkpoint/SKILL.md`

## Release to iPhone

- Build Release mode (JS bundle embedded, no WiFi/dev server needed):
  `cd ios && xcodebuild -workspace PersonalOS.xcworkspace -scheme PersonalOS -configuration Release -destination "id=00008120-000A68982208201E" -allowProvisioningUpdates build`
- Install via ios-deploy:
  `npx ios-deploy --id "00008120-000A68982208201E" --bundle ~/Library/Developer/Xcode/DerivedData/PersonalOS-*/Build/Products/Release-iphoneos/PersonalOS.app`
- Device: iPhone 14 Pro Max ("iPhone của Hiếu 🍭"), iOS 18.7.7
- UDID (ios-deploy): `00008120-000A68982208201E`
- UDID (devicectl): `2FCAE322-7871-5D3B-97E8-0B7CCA0CDD0F`
- ⚠️ Current signing uses Development Provisioning Profile → expires in 7 days, must rebuild after expiry.
- For permanent standalone builds, need Apple Developer account ($99/yr) + EAS Build.

## AI gotchas — lessons learned

### 1. Zustand selectors vs `getState()`

**Don't use function selectors** for derived values that return new object/array references:

```
// ❌ BAD — creates infinite re-render loop
const overview = useFinanceStore((s) => s.getOverview());
const habitViews = useHabitsStore((s) => s.views());

// ✅ GOOD — read plain state properties via hooks
const tasks = useTasksStore((s) => s.tasks);
const ready = useTasksStore((s) => s.ready);

// ✅ GOOD — derived functions via getState() (place after early returns)
const overview = useFinanceStore.getState().getOverview();
const habitViews = useHabitsStore.getState().views();
```

**Why:** Zustand selectors run on every store state change and compare results via `Object.is`. Functions that return new `{}` or `[]` every call are always "changed" → infinite re-render.

### 2. Rules of Hooks — don't put selectors after early return

```
// ❌ BAD — hooks after conditional return
if (!ready) return null;
const tasks = useTasksStore((s) => s.tasks);  // Crash: "Rendered more hooks"

// ✅ GOOD — all store hooks before any return
const tasks = useTasksStore((s) => s.tasks);
const ready = useTasksStore((s) => s.ready);
if (!ready) return null;
// ... use tasks here
```

**Why:** React requires hooks to run in the same order every render. When the component returns early on first render but doesn't on the second, the hook count changes → error.

### 3. When to use what pattern

| Data type                                               |       Hook selector        |       `getState()`        |
| ------------------------------------------------------- | :------------------------: | :-----------------------: |
| Plain state (`tasks[]`, `items[]`, `notes[]`)           |   ✅ before early return   | ✅ if behind early return |
| Function returning new ref (`getOverview()`, `views()`) |          ❌ never          |         ✅ always         |
| Stable function reference (`sectionOf`, `toggleTask`)   | ✅ safe (reference stable) |          ✅ safe          |
| Booleans/strings (`ready`, `isWorkoutActive`)           |          ✅ best           |           ✅ OK           |
