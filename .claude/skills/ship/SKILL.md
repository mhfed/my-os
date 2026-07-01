---
name: ship
description: >
  Final pre-ship workflow for this repo. Use before checkpointing, committing,
  or asking for sign-off on completed work. Focuses on scoped validation instead
  of vague claims that the whole app was tested.
---

# Ship Workflow

## Goal

Before a change is considered done, confirm the exact user-facing flow works,
not just that the code compiles.

## Required baseline

```bash
npm run typecheck
```

If this fails because of your diff, fix it. If the failure is clearly pre-existing,
call that out explicitly.

## Scope-based validation

Choose the checks that match the change.

### UI-only change

- verify the touched screen renders
- verify the modified interaction still works
- verify the design system was not bypassed

### Store/state change

- verify one real mutation path in the app
- verify the screen re-renders with the new state
- verify any dependent widget or aggregate view still updates

### Persistence change

- verify create/read/update/delete path relevant to the diff
- if possible, restart the app and confirm data still reads correctly
- check for schema/query naming mismatches

### Navigation change

- verify the intended entry point reaches the route
- verify back navigation and shell visibility
- verify hidden-route vs visible-tab behavior is still correct

## Repo-specific ship checklist

- `app/_layout.tsx` updated if a new persisted store was introduced
- `TodayScreen` reviewed if daily aggregates may have changed
- `SuperAppSheet`, `GlobalCapture`, or `more` reviewed if discoverability changed
- shared game UI components/tokens reused where appropriate
- no stray debug code in touched files

## Useful checks

```bash
rg -n "console\.log|TODO|FIXME|@ts-ignore|as any" src app
git diff --stat
git diff
```

## What to report when done

A good ship summary for this repo should say:

- what user-visible behavior changed
- what validation actually ran
- what did not run, if anything
- any residual risk such as "not tested on existing DB" or "no simulator run"

## Do not say

- "tested everything"
- "all good" without naming checks
- "lint passed" or "tests passed" unless those scripts actually exist and were run
