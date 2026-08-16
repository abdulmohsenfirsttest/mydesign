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
- **Destination:** Google Drive → `My Drive/mydesign/Backups/` and `My Drive/mydesign/Code/` (synced locally by the Google Drive desktop app). The mount path is **not stable** — the desktop app has moved from `~/Google Drive` to `~/Library/CloudStorage/GoogleDrive-<account>`, so both the script and the wrapper **probe for whichever `My Drive/mydesign` actually exists** and abort loudly if neither does. Never hardcode the path, and never let `mkdir -p` invent it. (See the 2026-07-07 outage below.)

## The key (important)

The backup prefers `SUPABASE_SERVICE_ROLE_KEY` and falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Today only the anon key is in `.env.local`, and it works **only because RLS is disabled** (the anon key can read every table).

⚠️ **Before the Security Phase-2 RLS lockdown, add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`** — otherwise the nightly backup will silently capture 0 rows on RLS-protected tables. The manifest's `keyKind` records which key was used.

## Sensitivity

The JSON includes `clients` and `admins` with **plaintext passwords**. Keep the Drive `mydesign` folder private (same reason `.backups/` is gitignored).

## Verify it's healthy

Resolve the Drive folder first (it is not at a fixed path):

```bash
D=$(ls -d "$HOME"/Library/CloudStorage/GoogleDrive-*/"My Drive"/mydesign/Backups 2>/dev/null || echo "$HOME/Google Drive/My Drive/mydesign/Backups")
cat "$D/LATEST.txt"          # → recent timestamp + row count
tail "$D/backup.log"         # → last run `exit: 0`
launchctl list | grep mydesign   # → the job is loaded
tail ~/mydesign-backups/launchd.err.log   # → no recent "BACKUP ABORTED"
```

**Check `LATEST.txt` is actually recent.** A stale timestamp is the failure mode that hides — the job can look "loaded" while writing nothing.

## Outage — 2026-07-07 → 2026-07-25 (18 days, no backups)

- **Symptom:** last good snapshot `2026-07-05T23-00-05Z`; nothing after. `launchctl list` still showed the job loaded, so nothing looked wrong.
- **Root cause:** the Google Drive desktop app moved its mount to `~/Library/CloudStorage/GoogleDrive-<account>/My Drive` and left `~/Google Drive/My Drive` behind as an **empty stub**. Both scripts had the old path hardcoded. `mkdir -p` cheerfully recreated a local folder that Drive never synced, so the 2026-07-06 run wrote six tables into a dead directory before crashing on `manifest.json`; the job then stopped producing output entirely.
- **Fix:** both scripts now probe `~/Library/CloudStorage/GoogleDrive-*/My Drive/mydesign` then `~/Google Drive/My Drive/mydesign`, and **abort with a logged error** rather than backing up to a path nobody will ever read.
- **If it recurs:** check `LATEST.txt` against today's date first, then `~/mydesign-backups/launchd.err.log` for `BACKUP ABORTED` (means Drive is signed out or unsynced, not a path bug).

## 🟠 OPEN — snapshots truncated since 2026-08-02 (BUG-016)

The path fix above works — the job runs nightly and lands in the right folder — but since **2026-08-02** every snapshot contains **only `admins.json`**. Writes to the Drive FUSE mount intermittently fail with **`Resource deadlock avoided` (EDEADLK)** around the 02:00 run, apparently while DriveFS self-updates (two Drive versions were observed running). The process dies after the first table.

**Last complete snapshot: `2026-08-01T23-09-57Z`.** Treat everything after it as unusable.

The structural problem: **the backup writes straight to a network/FUSE mount**, so any hiccup corrupts the snapshot mid-write — and `backup.log`, which lives on that same mount, stops recording at exactly the moment you'd want it to shout. The fix is to stage the snapshot on local disk, verify it's complete, then copy it into Drive. See BUG-016.

**Completeness check — the one that actually catches this:**

```bash
D=$(ls -d "$HOME"/Library/CloudStorage/GoogleDrive-*/"My Drive"/mydesign/Backups)
for d in "$D"/2026-*; do echo "$(ls "$d" | wc -l) files — $(basename $d)"; done | tail -5
# 12 files = healthy · 1 file = BUG-016
```

## Restore

1. Recreate the schema on a fresh Supabase project from `supabase/migrations/` (+ `0000_baseline.sql` once generated).
2. For each `<table>.json` in the chosen snapshot, re-insert the rows with the **service-role** key, respecting FK order: `clients`/`projects` before `milestones`/`meetings`/`quotes`/`files`/`spaces`.
