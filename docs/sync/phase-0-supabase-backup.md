# Phase 0 — Auto-backup to Supabase Storage

Goal: protect local SQLite data from being lost on rebuild / reinstall by
uploading a full JSON snapshot to a **private** Supabase Storage bucket.

There is **no auth yet** in Phase 0 (that arrives in Phase 1). Backups are
scoped by a stable per-install **device id** used as the storage path prefix:

```
backups/<deviceId>/backup-<epochMs>.json
```

---

## 1. Put your credentials in `app.json`

Open [`app.json`](../../app.json) → `expo.extra` and replace the placeholders
with your real project values:

```json
"extra": {
  "supabaseUrl": "https://YOUR_PROJECT.supabase.co",
  "supabaseAnonKey": "YOUR_ANON_KEY",
  "backupBucket": "backups"
}
```

- The **anon key** is safe to ship in a client build — it only grants what your
  RLS / Storage policies allow.
- Alternatively set env vars (override `extra`): `EXPO_PUBLIC_SUPABASE_URL`,
  `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_BACKUP_BUCKET`.
- The app treats `YOUR_PROJECT` / `YOUR_ANON_KEY` as "not configured" and
  silently disables auto-backup, so the app still runs before you fill these in.

> You must **rebuild** the app after editing `app.json` (extra is baked into the
> JS bundle at build time).

---

## 2. Create the private bucket

Supabase Dashboard → **Storage** → **New bucket**:

- Name: `backups`
- **Public: OFF** (private)

Or via SQL (Dashboard → SQL Editor):

```sql
insert into storage.buckets (id, name, public)
values ('backups', 'backups', false)
on conflict (id) do nothing;
```

---

## 3. Storage RLS policies

Phase 0 has **no signed-in user**, so requests hit Storage with the **anon**
role. Because the bucket is private, we grant the `anon` role scoped access to
just the `backups` bucket. This is deliberately permissive for a solo app during
Phase 0 and will be **tightened in Phase 1** once Sign in with Apple is wired up
(policies will switch to `auth.uid()`-scoped folders).

Run this in the SQL Editor:

```sql
-- Allow anon to read/list/upload/update/delete objects in the 'backups' bucket.
-- Scoped to the single bucket; no other bucket is exposed.

create policy "phase0 anon read backups"
on storage.objects for select
to anon
using (bucket_id = 'backups');

create policy "phase0 anon insert backups"
on storage.objects for insert
to anon
with check (bucket_id = 'backups');

create policy "phase0 anon update backups"
on storage.objects for update
to anon
using (bucket_id = 'backups')
with check (bucket_id = 'backups');

create policy "phase0 anon delete backups"
on storage.objects for delete
to anon
using (bucket_id = 'backups');
```

> ⚠️ Security note: with these policies, anyone holding the anon key can
> read/write the `backups` bucket. That is acceptable only while this is a
> private solo project. **Phase 1** replaces `to anon` with `to authenticated`
> and adds a folder check like
> `(storage.foldername(name))[1] = auth.uid()::text` so each user can only touch
> their own folder.

---

## 4. How it behaves in the app

- **Auto-backup** ([`app/_layout.tsx`](../../app/_layout.tsx)): runs once after
  stores are ready, and again whenever the app goes to background/inactive.
  Debounced to at most once per 5 minutes; never blocks or crashes the app on
  failure (logs a warning only).
- **Manual Backup / Restore** (More → Data):
  - **Backup to Cloud** → [`backupToCloud()`](../../src/services/backup.ts:66)
    uploads a fresh snapshot.
  - **Restore from Cloud** →
    [`restoreLatestFromCloud()`](../../src/services/backup.ts:139) downloads the
    newest backup for this device and **replaces** all local tables in a
    transaction. After restore you must **restart the app** so Zustand stores
    reload from SQLite.

## 5. What gets backed up

The canonical, FK-ordered table list lives in
[`BACKUP_TABLES`](../../src/utils/backupData.ts:11) (22 tables). When you add a
new persisted table to [`schema.ts`](../../src/db/schema.ts), append it there in
FK-safe order so it is included in backups.
