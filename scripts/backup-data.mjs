// Full Supabase data backup for MyDesign. Auto-discovers every table via
// PostgREST and writes one JSON file per table + a manifest, into a timestamped
// folder under Google Drive (cloud + on-Mac).
//
// Usage:  node scripts/backup-data.mjs [outputDir]
// Reads NEXT_PUBLIC_SUPABASE_URL and a key from the environment / .env.local.
//
// KEY: prefers SUPABASE_SERVICE_ROLE_KEY (bypasses RLS — captures every row).
// Falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY, which works *today* only because
// RLS is disabled on the data tables (see SECURITY.md). IMPORTANT: once the
// Phase-2 RLS lockdown lands, add SUPABASE_SERVICE_ROLE_KEY to .env.local or the
// backup will silently miss rows on RLS-protected tables.
//
// Restore: each <table>.json is an array of rows; re-insert with the service
// role. Schema lives in supabase/migrations/ (in git), so schema + data = full
// restore.

import { createClient } from '@supabase/supabase-js';
import { readFileSync, mkdirSync, writeFileSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

function loadEnv() {
  const e = { ...process.env };
  try {
    const path = new URL('../.env.local', import.meta.url);
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const i = line.indexOf('=');
      if (i > 0 && !line.trim().startsWith('#')) {
        const k = line.slice(0, i).trim();
        if (!e[k]) e[k] = line.slice(i + 1).trim();
      }
    }
  } catch {
    /* no .env.local — rely on process.env */
  }
  return e;
}

const env = loadEnv();
const BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const KEY_KIND = env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon';
if (!BASE || !KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or a Supabase key (SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const db = createClient(BASE, KEY, { auth: { persistSession: false } });

// Timestamped output folder, e.g. 2026-06-30T14-20-05Z
const stamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, 'Z');
// Default to the Google Drive "mydesign/Backups" folder so backups live on the
// cloud AND on the Mac. Override with an arg or BACKUP_DIR.
const root = process.argv[2] || env.BACKUP_DIR || join(homedir(), 'Google Drive', 'My Drive', 'mydesign', 'Backups');
const outDir = join(root, stamp);
mkdirSync(outDir, { recursive: true });

// Discover every table from the PostgREST OpenAPI spec.
async function discoverTables() {
  const res = await fetch(`${BASE}/rest/v1/`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  const spec = await res.json();
  const defs = spec.definitions || spec.components?.schemas || {};
  return Object.keys(defs).sort();
}

// Page through a table in chunks so large tables are captured fully.
async function dumpTable(table) {
  const rows = [];
  const size = 1000;
  for (let from = 0; ; from += size) {
    const { data, error } = await db.from(table).select('*').range(from, from + size - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < size) break;
  }
  writeFileSync(join(outDir, `${table}.json`), JSON.stringify(rows, null, 2));
  return rows.length;
}

// PostgREST's OpenAPI spec only lists what the current key can see; the anon key
// returns an empty spec, so fall back to the known MyDesign table list. (Keep
// this list in sync with supabase/migrations/ when tables are added.)
const KNOWN_TABLES = ['admins', 'bookings', 'clients', 'files', 'meetings', 'milestones', 'projects', 'quotes', 'spaces'];
let tables = await discoverTables();
if (!tables.length) {
  console.log('  (table discovery empty for this key — using the known MyDesign table list)');
  tables = KNOWN_TABLES;
}
const manifest = { takenAt: new Date().toISOString(), supabase: BASE, keyKind: KEY_KIND, tables: {} };
let total = 0;
for (const t of tables) {
  try {
    const n = await dumpTable(t);
    manifest.tables[t] = n;
    total += n;
    console.log(`  ✓ ${t}: ${n} rows`);
  } catch (err) {
    manifest.tables[t] = `ERROR: ${err.message}`;
    console.log(`  ✗ ${t}: ${err.message}`);
  }
}
manifest.totalRows = total;
manifest.tableCount = tables.length;
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

// Maintain a stable "latest" pointer for easy access.
writeFileSync(join(root, 'LATEST.txt'), `${stamp}\n${total} rows across ${tables.length} tables (key: ${KEY_KIND})\n`);

// Prune old snapshots — keep the most recent KEEP (default 90 days of dailies).
const KEEP = Number(env.BACKUP_KEEP || 90);
try {
  const dirs = readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d{4}-\d{2}-\d{2}T/.test(d.name))
    .map((d) => d.name)
    .sort();
  const remove = dirs.slice(0, Math.max(0, dirs.length - KEEP));
  for (const d of remove) rmSync(join(root, d), { recursive: true, force: true });
  if (remove.length) console.log(`Pruned ${remove.length} old snapshot(s); keeping last ${KEEP}.`);
} catch {
  /* prune is best-effort */
}

console.log(`\nBackup complete → ${outDir}`);
console.log(`${total} rows across ${tables.length} tables (key: ${KEY_KIND}).`);
