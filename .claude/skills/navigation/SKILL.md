---
name: navigation
description: >
  Navigation and route-wiring workflow for this Expo Router app. Use when adding
  screens, changing entry points, or debugging why a module is unreachable.
---

# Navigation Workflow

## Current model

Visible bottom tabs:

- `/` via `app/(tabs)/index.tsx`
- `/tasks`
- `/health`
- `/finance`
- `magic` tab button opens `SuperAppSheet`, not a normal destination

Hidden module routes:

- `/inbox`
- `/journal`
- `/habits`
- `/notes`
- `/goals`
- `/more`

These are intentionally hidden from the tab bar and reached via Super App or other entry points.

## When adding or changing a screen

### 1. Decide its navigation class

Use one of these on purpose:

- main tab: only for truly top-level destinations
- hidden route: preferred for secondary modules
- modal/sheet/local UI: for actions that do not need a route

### 2. Wire the route file

Add or update the route under `app/(tabs)/` so Expo Router can resolve it.
Keep the route thin and render the feature screen from `src/features/...`.

### 3. Wire the entry point

Check the real way users should reach it:

- tab config in `app/(tabs)/_layout.tsx`
- `SuperAppSheet` item list
- `more` screen
- CTA/button inside another feature
- `GlobalCapture` behavior if quick capture should open it

### 4. Preserve shell behaviors

Watch for app-specific shell rules:

- `GlobalCapture` hides on tabs with their own FABs
- workout mode in `health` can hide the tab bar
- Super App uses pinned items from `settingsStore`

## Debugging unreachable screens

Check these in order:

1. route file exists in `app/(tabs)/`
2. pushed path matches the route exactly
3. if hidden, the screen has `href: null` only in tab options, not missing route registration
4. the intended launcher actually points to that path
5. no state condition is hiding the launcher or shell element

## Common repo-specific mistakes

- adding a new feature route but forgetting `SuperAppSheet`
- adding a screen as a visible tab when it should be hidden
- changing a path without updating `router.push(...)` call sites
- assuming `magic` is a screen instead of a custom tab action

## Validation

- verify the route renders from a cold app launch
- verify the intended entry point reaches it
- verify back navigation and shell visibility still feel correct
- run `npm run typecheck`
