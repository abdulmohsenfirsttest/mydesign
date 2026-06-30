#!/bin/bash
# Invoked daily by launchd (com.mydesign.backup). Runs the Supabase data backup
# into the Google Drive "mydesign/Backups" folder (cloud + on-Mac) and appends
# the result to a rolling log there.
BACKUP_DIR="$HOME/Google Drive/My Drive/mydesign/Backups"
mkdir -p "$BACKUP_DIR"
LOG="$BACKUP_DIR/backup.log"
echo "===== $(date '+%Y-%m-%d %H:%M:%S') =====" >> "$LOG"
/usr/local/bin/node /Users/bsebsa/mydesign/scripts/backup-data.mjs "$BACKUP_DIR" >> "$LOG" 2>&1
echo "exit: $?" >> "$LOG"

# Refresh a clean source snapshot of the repo in Drive (tracked files only — no
# node_modules/.next). The code's live backup is GitHub; this is a bonus copy so
# everything MyDesign sits in one Drive folder.
CODE_DIR="$HOME/Google Drive/My Drive/mydesign/Code"
mkdir -p "$CODE_DIR"
( cd /Users/bsebsa/mydesign && /usr/bin/git archive --format=zip -o "$CODE_DIR/mydesign-source-latest.zip" HEAD ) >> "$LOG" 2>&1
echo "code snapshot: $?" >> "$LOG"
