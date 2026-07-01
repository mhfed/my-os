---
name: feature
description: >
  Feature-delivery workflow for this app. Use when building a screen, module,
  or substantial UX change. It reflects the current Expo Router + Zustand +
  SQLite architecture instead of a generic template.
---

# Feature Workflow

## App shape to respect

Routing and shell:

- `app/_layout.tsx`: font bootstrap + module store initialization.
- `app/(tabs)/_layout.tsx`: visible tabs are `Today`, `Tasks`, `Health`, `Finance`, plus the magic button.
- Hidden routes such as `inbox`, `journal`, `habits`, `notes`, and `goals` are reached through the Super App / More flows.

Feature structure already in use:

- `src/features/<domain>/...` for screens and feature-specific components.
- `src/store/*Store.ts` for state + persistence.
- `src/types/*` for domain contracts.
- `src/components/game` and `src/theme/*` for the shared visual system.

## Preferred implementation order

### 1. Start from the user flow

Define exactly which route or entry point changes:

- new visible tab
- hidden module screen
- sheet/modal launched from an existing screen
- shared component used by multiple features

### 2. Update types before UI

Add or adjust the domain types in `src/types/*` first when data shape changes.
This keeps stores and screens aligned while you implement.

### 3. Decide whether persistence is needed

- Pure presentation/state-local change: keep it inside the feature/screen.
- Cross-screen or durable state: update the owning Zustand store.
- New durable entity: update schema + store together.

### 4. Fit into existing initialization

If you add a new persisted store, make sure it is initialized from
`app/_layout.tsx` with the same idempotent pattern other stores use.

### 5. Route integration

For a new screen:

- add `app/(tabs)/<route>.tsx` when it is a router destination
- expose it from Super App / More if it is meant to be hidden from the main tab bar
- update tab config only if it is truly a top-level destination

### 6. Reuse the design system

Use existing tokens/components first:

- `GameButton`, `GameIconButton`, `GamePanel`, `IconBadge`, `CurrencyChip`
- `colors`, `fonts`, `textShadow`, `base3D`, motion helpers

Do not introduce raw hex colors, ad-hoc font names, or one-off button systems.

## Repo-specific heuristics

### Today screen integration

If the feature affects daily state, check whether `src/features/today/TodayScreen.tsx`
should reflect it. This app already aggregates multiple modules there.

### Hidden-module pattern

Not every feature belongs in the bottom tab bar. Several modules are intentionally
hidden routes and surfaced through `GlobalCapture`, `SuperAppSheet`, or `more`.
Match that pattern unless there is a clear navigation reason not to.

### Store discipline

- Keep store APIs task-focused and small.
- Preserve current `ready` / `init()` behavior.
- Prefer updating the owning store over scattering SQL in screens.

## Delivery checklist

- Route or entry point identified.
- Types updated if data shape changed.
- Store/schema updated if persistence changed.
- Screen/components follow current game UI tokens.
- `app/_layout.tsx` updated if a new persisted store was added.
- Relevant navigation entry updated.
- Today/Super App integration reviewed if applicable.
- `npm run typecheck` passes.
- Touched flow manually smoke-tested.

## Avoid

- Adding a new tab just because a feature is new.
- Creating a parallel design language beside `src/components/game`.
- Writing a generic feature template that ignores the current hidden-route architecture.
