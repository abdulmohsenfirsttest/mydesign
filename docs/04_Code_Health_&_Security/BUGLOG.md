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

## BUG-007 — A proposal can be sent to the client blank 🟠 (v4.0.0)
- **Symptom:** the designer can click "Send to client" with all four proposal sections (Scope/Stages/Pricing/T&C) empty; the client then sees a proposal card with only Approve/Reject.
- **Root cause:** the four builder textareas aren't required and `saveProposal` coerces empty strings to null.
- **Fix (planned):** require at least Scope + Pricing to be non-empty before enabling "Send", mirroring the existing manager-approval gate. `app/admin/messages/page.tsx` proposal builder.

## BUG-008 — A "sent" proposal can't be withdrawn or edited 🟠 (v4.0.0)
- **Symptom:** once sent, the proposal is read-only until the client rejects it; a designer who sent a typo (or after a manager re-price) is stuck waiting on the client.
- **Root cause:** `proposalEditable` is true only for null/draft/rejected status.
- **Fix (planned):** add a "Withdraw / edit" action that reverts a sent-but-undecided proposal to editable. `app/admin/messages/page.tsx`.

## BUG-009 — "Delivered together" bundle tag not shown to the client 🟠 (v4.0.0)
- **Symptom:** the Mood Board + 2D "delivered together" signal shows only in the admin hub (and only by exact name match), never on the client portal.
- **Root cause:** the tag renders from an exact milestone-name match, not from `milestones.bundle`; the client milestone list has no bundle badge.
- **Fix (planned):** render the badge from `milestones.bundle` on both the hub and the client project page. (Approval now seeds Mood Board + 2D with `bundle='moodboard_2d'`.)

## BUG-010 — File uploads silently failed: `files` table RLS deny-all ✅ (v4.6.1)
- **Symptom:** during team testing, uploading on the admin **Upload Files** page appeared to do nothing — files never showed up, and the client Files page / project Files list were empty. No error was shown.
- **Root cause:** `public.files` had **RLS enabled with zero policies** (deny-all), applied **out-of-band in the Supabase dashboard** (in no migration; every sibling table has RLS off). The physical upload to the `files` storage bucket succeeded, but the follow-up `insert into public.files` — and all three `select`s — were rejected by RLS. The upload code made it invisible: `app/admin/uploads/page.tsx` guarded only the storage step with `if (!error)` and **never read the insert error**.
- **Fix:** `alter table public.files disable row level security;` (migration `0007_files_rls_restore.sql`), restoring parity with all other tables; and the upload handler now captures both the storage error and the insert error and renders a red message on failure. Verified the anon role can insert+read again (rolled-back probe).
- **If it recurs:** first check live RLS drift — `select relname, relrowsecurity from pg_class where relnamespace='public'::regnamespace order by 1;` — `files` (and every data table) should read `false` until Security Phase 2. Never leave a `supabase…insert()` result unread; always destructure and surface `error` (same lesson as BUG-004). Watch for **untracked schema changes made directly in the dashboard** — they don't appear in `supabase/migrations/` and drift silently.

## BUG-011 — "Have to log in again when returning to the main page" ✅ (v4.7.0)
- **Symptom:** testers reported that after returning to the marketing homepage they had to log in again to reach the dashboard.
- **Root cause:** **not** an actual session loss — the `localStorage` session persists across navigation. The public navbar (`app/components/Navbar.tsx`) was session-blind and only ever showed a "Client Login" link, with no "Dashboard"/"Admin" entry anywhere on the marketing site; the only visible way forward was Login, so users re-authenticated. The login page also didn't short-circuit an existing session.
- **Fix:** made the navbar session-aware (shows "My Dashboard"/"Admin Panel" when a session exists, behind a mounted-default that matches the server render to avoid hydration mismatch) and made `/auth/login` redirect an already-logged-in visitor to their portal.
- **If it recurs:** confirm it's affordance, not auth — check `localStorage` still holds `client_id` / `admin_session` after navigating to `/`; the fix lives in `Navbar.tsx` (session read) and `app/auth/login/page.tsx` (redirect). Note there is still **no session expiry** (localStorage never expires) — a real timeout only arrives with Security Phase 2 / Supabase Auth.

## BUG-012 — File deletion silently failed: no DELETE policy on storage buckets ✅ (v4.7.1)
- **Symptom:** deleting a file removed it from the list but the object stayed in the bucket (still downloadable by URL) — the source of the orphaned objects noticed on 2026-07-13.
- **Root cause:** `storage.objects` only ever had **INSERT + SELECT** policies for the `files`/`meetings`/`quotes` buckets. Every `storage.remove()` returned a 400 the code discards (`app/admin/uploads/page.tsx` deleteFile ignores the remove result), so deletes half-worked: metadata row gone, object left behind.
- **Fix:** added `Public delete` + `Public update` policies for all three buckets (migration `0008_storage_delete_update_policies.sql`), matching the existing permissive posture until Security Phase 2. Verified live: an anon Storage-API delete now returns 200.
- **If it recurs:** check `select policyname, cmd from pg_policies where schemaname='storage' and tablename='objects';` — each bucket needs INSERT/SELECT/DELETE/UPDATE until Phase 2 replaces them with scoped policies. And surface the `remove()` error in deleteFile rather than discarding it.
- **Related finding (same investigation, 2026-07-19):** the team re-reported "still unable to upload," but **zero upload requests reached Supabase after 2026-07-13** while a live anon probe (the browser's exact calls) succeeded — storage 200, `files` insert 201 — and v4.7.0 was confirmed live in the served JS. Conclusion: the failures never left their browsers; most likely stale tabs/cached pre-fix JS. Ask for a hard refresh + the exact page/error before reopening BUG-010.

## BUG-013 — Couldn't sign in as owner when a client session was left over ✅ (v4.8.1)
- **Symptom:** owner reported the sign-in page wouldn't log them into the owner dashboard — it kept landing on the (empty) client dashboard.
- **Root cause:** the v4.7.0 login convenience — `useEffect` that `router.replace()`d anyone with an existing session straight to their portal — **trapped the form**. A leftover `client_id` in `localStorage` (from earlier client-login testing) bounced the user to `/dashboard` on mount, so the owner login form was never reachable. Compounded by logins not clearing the other role's keys, so a client + admin session could coexist.
- **Fix (`app/auth/login/page.tsx`):** replaced the forced redirect with a **non-blocking banner** ("You're already signed in as X — Continue → / or sign in below to switch account") while keeping the form usable; and added `clearSession()` so a fresh sign-in wipes all session keys before setting the new role's — no more dual/shadowing sessions. The navbar's session-aware link (v4.7.0) still gives returning users their one-click way back in, so no convenience is lost.
- **If it recurs:** never force-redirect away from the login form based solely on a stored session; check `app/auth/login/page.tsx` still renders the form when `existing` is set. Workaround for a stuck user: Sign Out from the dashboard (clears the session) or use a private window, then sign in.

---

## 🔭 Watch / risks (not bugs)
- **Internal price is UI-hidden, not secured (v4.0.0).** `internal_quotes` (the price/sqm) is readable via the anon key with RLS off; roles are client-side/forgeable. The only true fix is **Security Phase 2** (RLS + server-side role checks). See ADR-0010.
- **RLS disabled** on the data tables + the anon key ships to every browser → anyone with the key can read/write all rows (see SECURITY.md). Top risk; Phase 2 closes it.
- **Plaintext passwords** in `clients`/`admins`; **public storage buckets**; **anon key was pasted in chat** (rotate pending — Security Phase 1).
- **Backups use the anon key** (works only because RLS is off). Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` **before** the RLS Phase-2 lockdown, or the nightly backup will silently capture 0 rows on RLS-protected tables. See BACKUPS.md.
- **No `0000_baseline.sql`** yet → schema not fully reproducible from the repo (generate via `supabase db dump`).
- **No automated tests** → regressions are caught only by manual use or review.
