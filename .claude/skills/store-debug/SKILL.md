---
name: store-debug
description: >
  Zustand/store debugging workflow for this app. Use when UI is stale, data does
  not persist, init timing is suspect, or a screen and store disagree.
---

# Store Debug Workflow

## What this repo uses

- Zustand stores in `src/store`
- most persisted modules expose `ready` and `init()`
- SQLite-backed modules call into `src/db/database.ts`
- several screens compute derived values directly from store state and selectors

## Debug order

### 1. Confirm the screen subscribes to the right slice

Common bug: the screen reads a selector through `getState()` for derivation but
is not subscribed to the raw state that should trigger re-render.

Check whether the component subscribes to the data arrays/flags it depends on.
`TodayScreen` is a good reference pattern: it subscribes to raw slices, then
computes derived values below.

### 2. Confirm `init()` actually runs

Check:

- the store is initialized from `app/_layout.tsx` if it must be app-global
- or the owning screen calls `init()` if it is feature-scoped
- the store sets `ready: true` on the successful path
- any `initPromise` guard does not leave the store stuck

### 3. Confirm persistence path

For create/update/delete issues, inspect all three layers:

- input shape from screen/component
- store mutation SQL
- reload or in-memory state update after write

A common failure mode is successful SQL with stale in-memory arrays, or vice versa.

### 4. Confirm DB naming consistency

This repo mixes `camelCase` and `snake_case` column names across tables. Match the
real schema exactly in queries.

### 5. Confirm aggregate screens are updated

For state that appears in multiple places, check secondary readers:

- `TodayScreen`
- widgets/cards derived from the same store
- `SuperAppSheet` or settings-backed entry points when relevant

## Useful searches

```bash
rg -n "ready:|init: async|initPromise|getState\(\)|use[A-Z].*Store" src
rg -n "runSql\(|allRows\(|firstRow\(|tableIsEmpty\(" src/store src/db
rg -n "router.push|href: null|Tabs.Screen" app src
```

## Fix patterns

- subscribe to raw state in the screen, not only derived snapshots
- move persistence into the owning store instead of screen-level SQL
- normalize `null` to `undefined` at the store boundary
- make init idempotent and explicit
- update aggregate readers when module semantics change

## Validation

- run `npm run typecheck`
- exercise one real mutation path in the app
- if persistence changed, retest after app restart when possible
