# supabase/migrations

The single source of truth for the MyDesign database schema, going forward.

Until now the schema was hand-typed into the Supabase SQL editor and was **not
reproducible from the repo** — only `supabase/admins.sql` was tracked (see
**ADR-0009**). This directory starts paying that debt down: every schema change
from here on is written as an ordered, committed `.sql` file and applied through
a migration step — never hand-typed-only again.

## Files

| File | What it does | Status |
|---|---|---|
| `0000_baseline.sql` | Snapshot of the **current live schema** (the 8 tables, constraints, storage buckets, RLS posture). | **TODO** — generate from the live DB, don't hand-fabricate (see below). |
| `0001_meeting3_foundation.sql` | Meeting-3 Phase-1 intake: `spaces` table + `milestones.start_date/end_date`. Additive & idempotent. | Authored — **not yet applied to prod** (awaiting owner approval). |

## Generating the baseline (do this once)

Do **not** hand-write `0000_baseline.sql` — reconstructing 8 tables by hand risks
drifting from the real database. Dump the live schema instead:

```bash
# from the repo root, with the project linked (supabase link --project-ref ijtgwmqrxminwypracei)
supabase db dump --schema public -f supabase/migrations/0000_baseline.sql
```

That gives an exact, replayable baseline so a fresh Supabase project (e.g. the
**test environment** the versioning rules require before any risky change) can be
rebuilt from the repo.

## Applying a migration

```bash
supabase db push          # applies any unapplied migrations to the linked project
```

…or paste the file into the Supabase SQL editor for a one-off. Per the project's
**warn-before-enforce / test-before-risky** discipline, apply to a test/branch
environment first, watch it, then run it against production.
