#!/bin/bash
# Invoked daily by launchd (com.mydesign.backup). Runs the Supabase data backup
# into the Google Drive "mydesign/Backups" folder (cloud + on-Mac) and appends
# the result to a rolling log there.
#
# The Drive mount path is NOT stable: the desktop app used to mount at
# "$HOME/Google Drive" and now mounts under "$HOME/Library/CloudStorage/
# GoogleDrive-<account>". On 2026-07-07 that move silently broke this backup for
# 18 days — the old path was left behind as an empty stub, so `mkdir -p` happily
# recreated a local folder that never synced to Drive. So: resolve the mount,
# and REFUSE to run if the real "mydesign" Drive folder can't be found rather
# than writing a backup nobody will ever see.
FAIL_LOG="$HOME/mydesign-backups/launchd.err.log"

DRIVE_ROOT=""
for candidate in "$HOME"/Library/CloudStorage/GoogleDrive-*/"My Drive"/mydesign \
                 "$HOME/Google Drive/My Drive/mydesign"; do
  if [ -d "$candidate" ]; then DRIVE_ROOT="$candidate"; break; fi
done

if [ -z "$DRIVE_ROOT" ]; then
  echo "===== $(date '+%Y-%m-%d %H:%M:%S') ===== BACKUP ABORTED: no Google Drive 'mydesign' folder found. Checked \$HOME/Library/CloudStorage/GoogleDrive-*/My Drive/mydesign and \$HOME/Google Drive/My Drive/mydesign. Is Drive signed in and synced?" >> "$FAIL_LOG"
  exit 1
fi

BACKUP_DIR="$DRIVE_ROOT/Backups"
mkdir -p "$BACKUP_DIR"
LOG="$BACKUP_DIR/backup.log"
echo "===== $(date '+%Y-%m-%d %H:%M:%S') =====" >> "$LOG"
/usr/local/bin/node /Users/bsebsa/mydesign/scripts/backup-data.mjs "$BACKUP_DIR" >> "$LOG" 2>&1
echo "exit: $?" >> "$LOG"

# Refresh a clean source snapshot of the repo in Drive (tracked files only — no
# node_modules/.next). The code's live backup is GitHub; this is a bonus copy so
# everything MyDesign sits in one Drive folder.
CODE_DIR="$DRIVE_ROOT/Code"
mkdir -p "$CODE_DIR"
( cd /Users/bsebsa/mydesign && /usr/bin/git archive --format=zip -o "$CODE_DIR/mydesign-source-latest.zip" HEAD ) >> "$LOG" 2>&1
echo "code snapshot: $?" >> "$LOG"
