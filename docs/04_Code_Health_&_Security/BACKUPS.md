# MyDesign — Backups

How MyDesign is backed up, where, on what schedule, and how to restore. Pair with `CODE_HEALTH.md` (health checks) and `SECURITY.md` (posture). Mirrors the Favor Plus backup routine.

## What is backed up

| Asset | Backup | Where |
|---|---|---|
| **Source code** | GitHub (authoritative) + a daily `git archive` zip | GitHub `abdulmohsenfirsttest/mydesign`; Drive `mydesign/Code/mydesign-source-latest.zip` |
| **Database (Supabase)** | Daily JSON export — one file per table + `manifest.json` | Drive `mydesign/Backups/<timestamp>/` |
| **Schema** | Tracked SQL migrations | repo `supabase/migrations/` (schema + data = full restore) |

## The routine

- **Script:** `scripts/backup-data.mjs` — pages every table to JSON, writes a `manifest.json` (timestamp, per-table row counts, which key was used), updates `LATEST.txt`, and prunes to the last **90** snapshots (`BACKUP_KEEP`). Tables are auto-discovered via PostgREST; if discovery is empty (the anon key returns no spec) it falls back to a known table list — **keep that list in sync with `supabase/migrations/`** when tables are added.
- **Wrapper:** `scripts/run-backup.sh` — runs the data backup + a `git archive` source zip, appending to `Backups/backup.log`.
- **Schedule:** launchd job `com.mydesign.backup` (`scripts/com.mydesign.backup.plist`, installed at `~/Library/LaunchAgents/`) runs **daily at 02:00** local; `RunAtLoad` also runs it on login. launchd logs: `~/mydesign-backups/launchd.{out,err}.log`.
- **Destination:** Google Drive → `My Drive/mydesign/Backups/` and `My Drive/mydesign/Code/` (synced locally by the Google Drive desktop app).

## The key (important)

The backup prefers `SUPABASE_SERVICE_ROLE_KEY` and falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Today only the anon key is in `.env.local`, and it works **only because RLS is disabled** (the anon key can read every table).

⚠️ **Before the Security Phase-2 RLS lockdown, add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`** — otherwise the nightly backup will silently capture 0 rows on RLS-protected tables. The manifest's `keyKind` records which key was used.

## Sensitivity

The JSON includes `clients` and `admins` with **plaintext passwords**. Keep the Drive `mydesign` folder private (same reason `.backups/` is gitignored).

## Verify it's healthy

- `cat "$HOME/Google Drive/My Drive/mydesign/Backups/LATEST.txt"` → recent timestamp + row count.
- `tail "$HOME/Google Drive/My Drive/mydesign/Backups/backup.log"` → last run `exit: 0`.
- `launchctl list | grep mydesign` → the job is loaded.

## Restore

1. Recreate the schema on a fresh Supabase project from `supabase/migrations/` (+ `0000_baseline.sql` once generated).
2. For each `<table>.json` in the chosen snapshot, re-insert the rows with the **service-role** key, respecting FK order: `clients`/`projects` before `milestones`/`meetings`/`quotes`/`files`/`spaces`.
