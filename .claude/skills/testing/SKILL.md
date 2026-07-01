---
name: testing
description: >
  Validation workflow for this Expo/TypeScript app. Use after any code change and
  before any commit. Focuses on the checks this repo actually supports today:
  TypeScript, targeted search for regressions, and smoke-checking the touched
  screen/store flow.
---

# Testing & Validation Workflow

This repo does not currently have an automated test suite or lint script in
`package.json`. The hard gate today is `npm run typecheck`, plus focused manual
validation for the area you changed.

## Run this when

- You changed any `.ts` or `.tsx` file.
- You touched `src/db/schema.ts`, any store, routing, or shared UI.
- You are about to use the checkpoint skill / commit.

## Required checks

### 1. TypeScript gate

```bash
npm run typecheck
```

This must pass before commit unless the failure is clearly pre-existing and
unrelated to your diff.

### 2. Search for common regressions in changed files

Use `rg`, not broad grep:

```bash
rg -n "console\.log|TODO|FIXME|@ts-ignore|as any" src app
```

Review hits in files you touched. Remove accidental debug code. Keep an ignore
only when there is a documented reason.

### 3. Import/path hygiene

Prefer the repo alias:

```ts
import { colors } from '@/theme/colors';
import { useTasksStore } from '@/store/tasksStore';
```

Avoid deep relative imports when an `@/` path exists.

### 4. Manual smoke test for the touched flow

This app is an Expo Router mobile app with Zustand stores initialized in
`app/_layout.tsx`. For UI or state changes, verify the exact route/module you
edited actually boots and the relevant interaction works.

Typical examples:

- `tasks`: add/edit/complete a task and verify Today reflects it if expected.
- `finance`: add/edit/delete a transaction and verify month-derived widgets.
- `habits` / `journal` / `inbox` / `notes` / `goals`: verify create/update flow.
- `health`: verify active workout flow and tab-bar hiding behavior.
- shared UI: verify at least one real screen using the component.

If you cannot run the app in a simulator/device, say so explicitly in the final
report.

## Schema-related validation

If you changed `src/db/schema.ts`:

1. Confirm the table/column names exactly match the SQL used by stores.
2. Confirm any new optional DB fields are normalized consistently (`null` in SQL,
   `undefined` in domain types where the repo already follows that pattern).
3. Check whether first-run seed/init logic needs updating in the owning store.
4. Verify `initDatabase()` can apply the statements idempotently.

## Suggested command set

```bash
npm run typecheck
rg -n "console\.log|TODO|FIXME|@ts-ignore|as any" src app
rg -n "from '../|from '../../|from '../../../" src app
```

## What not to assume

- Do not claim lint/tests passed: there is no lint/test script in `package.json` today.
- Do not require `src/db/migrations/`: that directory does not exist in this repo yet.
- Do not block on whole-app manual QA when the change is narrow; validate the touched flow.
