---
name: review
description: >
  Code review workflow for this repo. Use when asked to review a diff, a feature,
  or another agent's work. Prioritizes bugs, regressions, state/persistence issues,
  and missing validation over style commentary.
---

# Review Workflow

## Review priorities

In this repo, focus on defects that change behavior:

1. Route wiring and navigation regressions
2. Zustand state consistency and stale derived values
3. SQLite schema/query mismatches
4. Hidden-route / Today / Super App integration gaps
5. Design-system breakage only when it causes inconsistent UX or maintainability issues

## What to inspect first

- `git diff --stat` and the actual changed files
- any touched route in `app/`
- the owning store in `src/store/`
- matching domain types in `src/types/`
- `src/db/schema.ts` if persistence changed
- `src/features/today/TodayScreen.tsx` if daily aggregates may be affected
- `src/components/GlobalCapture.tsx` or `src/components/SuperAppSheet.tsx` if entry points changed

## Repo-specific bug patterns

### 1. SQL and schema drift

Look for mismatches such as:

- querying `category_id` when the table column is `categoryId`
- adding a field to a type but not reading/writing it in SQL
- assuming `undefined` when SQLite returns `null`

### 2. Store init / readiness gaps

Look for:

- new persisted store added but never initialized from `app/_layout.tsx`
- screen reads from a store before its `ready` state is true
- duplicate init work causing unnecessary queries or racey UI

### 3. Hidden navigation regressions

This app has main tabs plus hidden module routes. Check whether a new or changed
module is reachable from the intended entry point:

- bottom tabs
- `SuperAppSheet`
- `GlobalCapture`
- `more`

### 4. Today integration gaps

If a feature changes daily data, check whether `TodayScreen` should reflect it.
A common miss is updating a module screen but forgetting aggregate counters or
quick actions on Today.

### 5. UI consistency defects

Flag when code bypasses the shared system with:

- raw hex colors
- ad-hoc button implementations instead of `GameButton` / `GameIconButton`
- new panel styles instead of `GamePanel`

## Validation during review

Run what exists today:

```bash
npm run typecheck
rg -n "console\.log|@ts-ignore|as any" src app
```

If review scope is narrow, smoke-check the changed flow instead of claiming whole-app QA.

## Output format

Report findings first, ordered by severity, with file references. Keep summary short.
If no findings are found, say that explicitly and mention any residual risk such as
"not runtime-tested" or "schema path not exercised on existing DB".
