# MyDesign — Bug Log

A running record of bugs/issues hit (or caught in review) for MyDesign — root cause, fix, and **how to recognise + where to look if it recurs**. Append newest at the bottom. Status: ✅ Fixed · 🟠 Open · ⚙️ Config/data (no code bug) · 🔭 Watch (risk).

> Keep this updated on every bug fix. Pair with `../03_Version_History/CHANGELOG.md` (what shipped) + `../03_Version_History/session-records/` (session records).

---

## BUG-001 — Homepage "Our Services" didn't match the booking catalog ✅ (v3.3.0)
- **Symptom:** the landing page advertised generic services ("Designing", "3D Modeling", "Renovation", "Construction", "Engineering") while `/book` offered a different set — a visible branding inconsistency.
- **Root cause:** v3.3.0 made `/book` the canonical Meeting-3 catalog but `app/components/Services.tsx` still held the old hardcoded list.
- **Fix:** aligned `Services.tsx` to the canonical 6-service catalog.
- **If it recurs:** keep the homepage list and the `/book` list in step (ideally a shared constant); grep the service strings in `app/components/Services.tsx` and `app/book/page.tsx`.

## BUG-002 — Booking date saved one day behind in the early morning ✅ (v3.3.0)
- **Symptom:** a consultation booked in the early local morning (00:00–02:59 AST) could save a `bookings.date` one calendar day earlier than the day the client tapped.
- **Root cause:** `app/book/page.tsx` displayed the day from local components but stored `d.toISOString().split('T')[0]` (UTC); in UTC+3 that rolls back across midnight.
- **Fix:** build the stored date from local Y/M/D components instead of `toISOString()`.
- **If it recurs:** never persist a calendar date via `toISOString()`; derive it from `getFullYear()/getMonth()/getDate()`.

## BUG-003 — New `spaces` table missing from Realtime → live-sync silently dead ✅ (v3.3.0)
- **Symptom:** the admin SPACES tab would not live-update across tabs/devices (single-user still worked via the initial fetch).
- **Root cause:** Supabase Realtime only streams tables in the `supabase_realtime` publication, and a table created via SQL is not auto-added; the migration created `spaces` but didn't add it to the publication.
- **Fix:** the migration now `alter publication supabase_realtime add table public.spaces` (idempotent). Caught in adversarial review before deploy.
- **If it recurs:** any new table the UI subscribes to must be in the publication — check `select * from pg_publication_tables where pubname = 'supabase_realtime';`.

## BUG-004 — Admin saves silently no-op'd when the insert errored ✅ (v3.3.0)
- **Symptom:** adding a milestone or space when the DB rejected it (e.g. a missing column/table before the migration) made the form just close — looking like success — with no row saved.
- **Root cause:** inserts destructured only `{ data }` and ignored `error`; `if (data)` was simply false on failure.
- **Fix:** `handleAddMilestone` / `handleAddSpace` now capture `error`, surface it in the form, and don't close on failure.
- **If it recurs:** every user-facing `supabase…insert()` should read `error` and show it; don't trust `if (data)` alone.

## BUG-005 — Stale milestone error / sqm total lingered on project switch ✅ (v3.3.0)
- **Symptom:** a milestone validation error stayed on a fresh/other project's form; the prominent SPACES "TOTAL AREA" briefly showed the previous project's number after switching.
- **Root cause:** `milestoneError`/`spaceError` weren't cleared on cancel/open/switch, and the per-project arrays weren't reset before the new fetch resolved.
- **Fix:** clear the errors on cancel/open/project-switch; reset the per-project arrays in the project-switch handler.
- **If it recurs:** when adding a per-project tab to `app/admin/messages/page.tsx`, reset its state + error in the sidebar project-switch `onClick`.

## BUG-006 — Some clients couldn't log in (phone-string mismatch) ✅ (v3.1.1)
- **Symptom:** a client with a valid phone + password couldn't sign in at `/auth/login`.
- **Root cause:** the phone comparison didn't normalise the stored vs entered phone string.
- **Fix:** normalised the phone comparison on login (v3.1.1, commit `3af643c`).
- **If it recurs:** check how `/auth/login` matches `clients.phone`; normalise both sides before `.eq('phone', …)`.

---

## 🔭 Watch / risks (not bugs)
- **RLS disabled** on the data tables + the anon key ships to every browser → anyone with the key can read/write all rows (see SECURITY.md). Top risk; Phase 2 closes it.
- **Plaintext passwords** in `clients`/`admins`; **public storage buckets**; **anon key was pasted in chat** (rotate pending — Security Phase 1).
- **Backups use the anon key** (works only because RLS is off). Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` **before** the RLS Phase-2 lockdown, or the nightly backup will silently capture 0 rows on RLS-protected tables. See BACKUPS.md.
- **No `0000_baseline.sql`** yet → schema not fully reproducible from the repo (generate via `supabase db dump`).
- **No automated tests** → regressions are caught only by manual use or review.
