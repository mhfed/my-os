---
name: database
description: >
  Workflow for SQLite changes in this app. Use when adding tables, columns,
  indexes, or store-level persistence logic. Mirrors the current repo approach:
  centralized schema in `src/db/schema.ts`, generic helpers in `src/db/database.ts`,
  and per-module Zustand stores owning seed/init behavior.
---

# Database Workflow

## Current architecture

Source of truth:

- `src/db/schema.ts`: ordered `SCHEMA` array of idempotent SQL statements.
- `src/db/database.ts`: `initDatabase()`, `runSql()`, `allRows()`, `firstRow()`, `tableIsEmpty()`.
- `src/store/*Store.ts`: each module owns row mapping, seed data, and `init()` timing.

The repo is not using a formal migration folder yet. Schema evolution currently
happens by updating `SCHEMA` with additive, idempotent statements.

## Safe change order

1. Define or change SQL in `src/db/schema.ts`.
2. Update the owning TypeScript domain type in `src/types/`.
3. Update the owning store in `src/store/`.
4. Check seed/init behavior for first-run and existing users.
5. Run `npm run typecheck`.
6. Smoke-test the affected module in the app.

## Conventions already used here

### IDs and timestamps

- Primary keys are `TEXT` ids.
- Timestamps are usually `INTEGER` epoch-ms.
- Per-day journal/habit keys use `TEXT` dates like `YYYY-MM-DD` where that fits the feature.

### Optional values

- SQLite stores missing text/number values as `NULL`.
- Domain models often expose those as `undefined`.
- Normalize at the store boundary, not in UI code.

### Init behavior

- `initDatabase()` applies the full schema every time and is safe to call from multiple stores.
- Individual stores use their own `ready` flags and sometimes a module-level `initPromise`.
- Seed logic is store-owned. Do not move feature seeding into `database.ts` unless the repo already does that for the module.

## Adding a new table

Use this pattern inside `SCHEMA`:

```ts
`CREATE TABLE IF NOT EXISTS example_items (
  id TEXT PRIMARY KEY NOT NULL,
  userId TEXT,
  title TEXT NOT NULL,
  createdAt INTEGER NOT NULL
);`,
`CREATE INDEX IF NOT EXISTS idx_example_items_createdAt
  ON example_items (createdAt);`,
```

Then wire it through the owning store with typed row mapping and parameterized SQL.

## Adding a column to an existing table

Prefer additive statements in `SCHEMA`, for example:

```ts
`ALTER TABLE tasks ADD COLUMN source TEXT;`,
```

Only do this when the statement is safe for the app's current lifecycle. Since
plain `ALTER TABLE ... ADD COLUMN` is not idempotent by itself, do not drop it
blindly into `SCHEMA` unless you also gate it appropriately in code. If the
change is more than a trivial personal-app additive field, call that out and
consider introducing a real migration mechanism first.

In this repo, a safer default is:

- New tables: add directly to `SCHEMA`.
- New indexes: add directly to `SCHEMA` with `IF NOT EXISTS`.
- Existing-table column changes: inspect current app expectations carefully and
  document whether a one-off migration helper is needed.

## Store implementation rules

- Use parameterized SQL for values.
- Prefer shared helpers from `src/db/database.ts`.
- Keep row-to-domain mapping near the store that owns the feature.
- Preserve existing naming exactly. Some newer tables use `snake_case`, while
  older ones use `camelCase`; do not “clean this up” opportunistically.

## Review checklist

- SQL column names match store queries exactly.
- New fields are inserted, loaded, and updated consistently.
- Related indexes exist for real query patterns.
- Seed data still works on an empty DB.
- Existing-user behavior was considered, not just fresh install behavior.
- `npm run typecheck` passes.

## Avoid

- Inventing `src/db/migrations/` docs or code unless you are actually adding that system.
- Rewriting unrelated tables to a new naming convention.
- Reading/writing unbounded SQL strings with interpolated user data.
