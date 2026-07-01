---
name: planning
description: >
  Planning workflow for this repo. Use when a task is large, cross-cutting, or
  likely to touch multiple routes/stores. Helps split work into safe chunks that
  map to this app's architecture and reduce merge/regression risk.
---

# Planning Workflow

## When to use

Use this before implementation when the task:

- spans multiple features or modules
- changes both UI and persistence
- affects navigation and store behavior together
- is large enough that it should be delivered in more than one commit
- may be split across worktrees or multiple agents

## First-pass scoping

Identify the exact surfaces involved:

- route files in `app/`
- feature screens/components in `src/features/`
- owning stores in `src/store/`
- domain types in `src/types/`
- persistence in `src/db/schema.ts` and `src/db/database.ts`
- aggregate readers like `TodayScreen`
- launch points like `SuperAppSheet`, `GlobalCapture`, or `more`

## Preferred split strategy

Split by dependency order, not by arbitrary file groups.

### Good chunk order

1. data contract and schema
2. store logic and persistence
3. screen/component integration
4. navigation wiring
5. aggregate follow-ups like Today/Super App
6. validation and checkpoint

### Bad split examples

- one agent edits UI while another simultaneously renames fields in the same store
- separate agents both edit `app/_layout.tsx`
- one chunk changes route paths while another updates launchers later

## Safe chunk templates

### Schema-backed feature

1. types + schema
2. owning store init/load/mutations
3. feature screen/components
4. route/launcher integration
5. Today or hidden-route follow-up if needed

### Existing-screen UX refactor

1. reusable component/token changes
2. screen adoption
3. downstream screens using the same shared component

### Navigation change

1. route file/path changes
2. launcher updates
3. shell behavior check (`tabs`, `magic`, `GlobalCapture`, workout mode)

## Worktree guidance

If parallelizing, assign ownership by architectural boundary:

- Agent A: schema/types/store
- Agent B: feature screen/components
- Agent C: navigation/Today integration only after A and B stabilize

Avoid parallel edits to:

- `app/_layout.tsx`
- `app/(tabs)/_layout.tsx`
- `src/db/schema.ts`
- the same store file
- the same shared UI component

## Definition of a good plan

A good plan for this repo should answer:

- what user flow changes
- which store owns the behavior
- whether persistence changes
- whether a route or launcher changes
- whether Today or Super App must reflect it
- what validation proves the change works

## Exit criteria per chunk

Each chunk should be independently reviewable and preferably shippable:

- coherent diff
- `npm run typecheck` passes
- touched flow is smoke-testable
- commit message can describe one real unit of behavior
