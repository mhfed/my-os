# AGENTS.md

## Purpose

This file gives AI coding agents the minimum operating rules needed to work
quickly and safely in this repo.

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
