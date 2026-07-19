# MyDesign — Changelog

MyDesign is a Riyadh-based design-and-build (interior design + construction) platform, styled after mydesign.sa, built and maintained by Abdulmohsen. It runs on Next.js 16 (App Router), React 19, Tailwind v4, TypeScript, and a Supabase Postgres backend, deployed on Vercel at https://mydesign-blush.vercel.app.

The project follows **vMAJOR.MINOR.PATCH** versioning per the team's versioning guide: **MAJOR** marks a new era or breaking change (a new product surface, a rewrite, or an incompatible data model); **MINOR** marks a feature or a batch of related work; **PATCH** marks a fix or a small sub-step. The build arc covered here runs from 2026-06-02 to 2026-07-05.

Ordering convention: the glance table below is **newest-first**; the detailed entries that follow are **oldest-first (chronological)**.

---

## Version history at a glance

| Version | Date | Type | Summary |
|---------|------|------|---------|
| v4.9.0 | 2026-07-19 | MINOR | **Upload Files in the Project Hub + light/dark for the designer (admin) dashboard.** A per-project **Upload Files** tab in the hub (shared to the client's portal; drag/drop, error surfacing, file count, **"Sent <date, time>"** under each file). The **whole admin panel** now supports light/dark via the shared tokens, with a clearly-labeled **"Light mode / Dark mode"** button in the sidebar; **raised the dark muted-text contrast** floor for readability; native date/time pickers follow the theme |
| v4.8.2 | 2026-07-19 | PATCH | **Fix: couldn't add/edit staff** — `admins` had RLS on with only a read policy, so the Staff & Permissions page failed with "new row violates row-level security policy for table admins." Added anon INSERT/UPDATE/DELETE policies (migration `0009`) so staff management works. ⚠️ Escalates security debt (public key can now write staff) — flagged in SECURITY.md; Security Phase 2 must move this server-side |
| v4.8.1 | 2026-07-19 | PATCH | **Fix: couldn't sign in as owner with a leftover client session** (regression from v4.7.0). The login page force-redirected anyone with an existing session away from the form, so a stale *client* session bounced you to the client dashboard before you could enter owner credentials. Now it shows a non-blocking "already signed in — continue / or switch account" note and keeps the form usable; a fresh sign-in also clears any other-role session so it can't shadow the new one |
| v4.8.0 | 2026-07-19 | MINOR | **Light/dark display modes** (team request): semantic 12-token theme system; toggle in the marketing navbar + client dashboard sidebar, persisted, no flash-on-load; light = warm off-white with **higher-contrast** text (the sunlight-readability fix); photographic overlays stay dark in both modes; **admin panel deliberately stays dark**; owner-approved via Vercel branch preview before merge |
| v4.7.1 | 2026-07-19 | PATCH | **Storage DELETE/UPDATE policies** (migration `0008`): the three buckets only ever had INSERT+SELECT, so the app's file-delete silently failed with a 400 and left orphaned objects; verified uploads themselves healthy end-to-end (live anon probe: storage 200, insert 201) — the team's "still can't upload" report reached zero requests server-side, pointing at stale browser tabs/cache, not the app |
| v4.7.0 | 2026-07-13 | MINOR | **Testing-feedback UX**: the marketing navbar is now **session-aware** (shows "My Dashboard"/"Admin Panel" when logged in; already-logged-in visitors skip the login form) so returning users stop re-authenticating; and the **New Milestone form takes a deliverable** so a milestone can be created **Completed in one step** — "Completed" is greyed out with inline guidance until a file is attached (no more post-submit red wall) |
| v4.6.1 | 2026-07-13 | PATCH | **Fix broken file uploads**: `public.files` had RLS enabled with no policy (out-of-band change) → uploads silently failed; re-disabled RLS to match every sibling table (migration `0007`), and the Upload page now surfaces any storage/insert error instead of swallowing it |
| v4.6.0 | 2026-07-05 | MINOR | Approving a price **auto-fills the client proposal** (+ reopens it to draft) so the client sees the new number in one Send; builder pre-fills pricing |
| v4.5.3 | 2026-07-05 | PATCH | **Re-price after a spaces change** ("Re-request pricing" + "spaces changed" warning) + **"Revise"** a sent/approved proposal |
| v4.5.2 | 2026-07-05 | PATCH | Quotation PDF: **company logo** + clear **Subtotal / VAT (15%) / Total** table + long-text page overflow |
| v4.5.1 | 2026-07-04 | PATCH | **"Generate quotation PDF"** button on the proposal (works on any status; for proposals that predate Send-time generation) |
| v4.5.0 | 2026-07-02 | MINOR | **Fully customizable milestones**: inline edit + reorder; proposal approval no longer auto-seeds milestones |
| v4.4.0 | 2026-07-02 | MINOR | **Staff-only internal notes** beside the proposal (never shown to the client); reverted the meeting Drive link |
| v4.3.0 | 2026-07-01 | MINOR | Hub polish: meetings staff-internal + Drive link; proposal PDF (15% VAT) to the client; milestone "Skipped"; removed Quotes tab + stage dropdown |
| v4.2.0 | 2026-07-01 | MINOR | Owner-configurable per-account permissions (what each account can see); Staff → Staff & Permissions |
| v4.1.0 | 2026-07-01 | MINOR | Email-or-phone login (one portal for clients + team); team staff accounts (Tuqa manager + 4 designers) |
| v4.0.0 | 2026-07-01 | MAJOR — new era | Meeting-3 full workflow: staff roles, internal price/sqm + manager approval, client proposal (approve/reject), milestone delivery rules |
| v3.4.0 | 2026-06-30 | MINOR | Operational backbone: automated nightly Supabase backups (→ Drive) + bug log + backups doc |
| v3.3.0 | 2026-06-29 | MINOR | Meeting-3 Increment 1: 6-service catalog, spaces/sqm capture, milestone start+end dates, first `migrations/` |
| v3.2.0 | 2026-06-03 → 2026-06-21 | MINOR | Quotes, milestones, files & realtime expansion (committed 2026-06-29 with v3.3.0) |
| v3.1.1 | 2026-06-03 | PATCH | Fix client login phone-matching; "+ Add to Clients" on bookings (last commit in git) |
| v3.1.0 | 2026-06-03 | MINOR | Admin operations & auth: booking status, client creation, booking→client auto-register, /admin route protection |
| v3.0.0 | 2026-06-03 | MAJOR | New era — Supabase backend replaces mock/localStorage data across portal + admin |
| v2.2.1 | 2026-06-03 | PATCH | Login stabilization: reverted accidental portal deletion; phone + fixed password (123123) |
| v2.2.0 | 2026-06-02/03 | MINOR | Portal workflow model: message attachments, phone+OTP login, 7-stage workflow, meeting-log + milestones with approval |
| v2.1.0 | 2026-06-02 | MINOR | Admin/owner dashboard: clients, projects, bookings, messages, quotes, uploads |
| v2.0.0 | 2026-06-02 | MAJOR | New era — client portal platform: auth + /book + /dashboard surface |
| v1.1.1 | 2026-06-02 | PATCH | Real photography sub-steps: references → next/image fix → Unsplash stock photos |
| v1.1.0 | 2026-06-02 | MINOR | Brand redesign to black/serif "Design & Build" luxury; fixed navbar; /projects page |
| v1.0.0 | 2026-06-02 | MAJOR | Initial portfolio: Hero, Projects, About, Contact; single-page, dark/indigo |

---

## Detailed entries

Each entry uses the same four-line format as the session record's "Versions shipped" section: **What / Why / Schema / Decision**.

### v1.0.0 · Initial portfolio
- **What:** First release. A single-page portfolio site with Hero, Projects, About, and Contact sections, in a dark-neutral/indigo palette.
- **Why:** Establish a first public presence and a working Next.js/Vercel deploy pipeline.
- **Schema:** None — static site, no backend.
- **Decision:** Ship a minimal one-page site first; treat it as the baseline to iterate on.

### v1.1.0 · Brand redesign to black/serif luxury
- **What:** Redesigned the brand to a pure black/white "Design & Build" luxury aesthetic (Playfair Display headings + Inter body), added a fixed navbar and a dedicated `/projects` page.
- **Why:** Match the look and feel of the reference firm site (mydesign.sa); the original dark/indigo palette did not read as a premium design firm.
- **Schema:** None.
- **Decision:** Adopt black/white + Playfair/Inter as the permanent design system; retire the dark-neutral/indigo palette.

### v1.1.1 · Real photography
- **What:** Replaced placeholder visuals with real photography across three sub-steps: added reference screenshots, fixed an image-rendering bug, then settled on Unsplash stock photos.
- **Why:** Stock and placeholder imagery undercut the luxury redesign; the site needed real interiors.
- **Schema:** None.
- **Decision:** When `next/image` with `fill` failed to render, switch to a plain `<img>` tag rather than fight the component; standardize on Unsplash photography for now.

### v2.0.0 · New era — client portal platform
- **What:** Turned the marketing site into a SaaS surface: a full client portal with authentication, a `/book` consultation booking flow, and a `/dashboard` area (projects, messages, files, financials, reviews).
- **Why:** Move from a brochure site to a platform clients can log into and use to follow their projects.
- **Schema:** Introduced the first data structures behind bookings and dashboard content (initially mock/localStorage-backed).
- **Decision:** A new product surface and a new audience (logged-in clients) = MAJOR. The marketing site is now one surface of a larger app.

### v2.1.0 · Admin/owner dashboard
- **What:** Added the admin/owner side: pages for clients, projects, bookings, messages, quotes, and uploads.
- **Why:** The owner needs a back office to manage the clients and projects exposed in the portal.
- **Schema:** Admin views read the same booking/project/client structures as the portal.
- **Decision:** Keep admin and client surfaces in one app under an `/admin` prefix rather than splitting into a separate project.

### v2.2.0 · Portal workflow model
- **What:** Built the core workflow model: message file attachments; phone + OTP login (replacing email/password); the 7-stage project workflow (Quotation → Mood Board → 2D → 3D → Plans → Payment → Delivery); and a meeting-log + milestone system where the client can approve meeting notes — this replaced an earlier mock chat UI.
- **Why:** A design-build project is a sequence of meetings and stage gates, not a chat thread; the portal needed to mirror how the firm actually works.
- **Schema:** Project records gained a `stage`/`progress` model; meeting and milestone structures were introduced.
- **Decision:** Replace the mock chat with a meeting log + client approval as the primary client↔firm interaction; lock in the 7 stages as the canonical pipeline.

### v2.2.1 · Login stabilization
- **What:** Stabilized login after an accidental full-portal deletion was reverted; added a "Client Login" nav link; wired the booking flow through to login; simplified auth to phone + a fixed password (123123).
- **Why:** OTP login was fragile and a destructive change had to be undone; clients needed a dead-simple way back into the portal after booking.
- **Schema:** None (auth still client-side against the clients data).
- **Decision:** Drop OTP in favor of phone + a known default password (123123) for now; prioritize a working login over a secure one at this stage.

### v3.0.0 · New era — Supabase backend
- **What:** Replaced all mock/localStorage data with a real Supabase Postgres database across the client portal and every admin page; cleared the fake seeded meeting data.
- **Why:** Mock data could not support real clients, multiple devices, or the owner and client seeing the same records.
- **Schema:** Stood up the live Postgres tables behind bookings, clients, projects, and meetings. Schema was hand-typed into the Supabase SQL editor — there is no `migrations/` directory, so the schema is not reproducible from the repo. (The `milestones`, `quotes`, `files`, and `admins` tables came later, in v3.2.0.)
- **Decision:** An incompatible data model (mock → real DB) = MAJOR. Use a single shared browser Supabase client (`lib/supabase.ts`) with the public anon key; all data access is client-side, no server keys.

### v3.1.0 · Admin operations & auth
- **What:** Added operational admin features and admin auth: a live booking-status dropdown, a client-creation form, automatic client registration when a booking comes in, and admin login with `/admin` route protection and sign-out.
- **Why:** The owner needed to act on bookings and onboard clients without touching the database, and the admin area needed to be gated.
- **Schema:** Bookings carry a `status`; a booking upserts a `clients` row (on phone, default password 123123) so a client can log in immediately after booking.
- **Decision:** Guard `/admin/*` via a `localStorage.admin_session` flag checked in the admin layout; auto-create a client at booking time so booking and portal access are one step.

### v3.1.1 · Login & bookings fix
- **What:** Fixed client-login phone matching and added a "+ Add to Clients" action on the bookings page. **This is the last commit in git** (3af643c).
- **Why:** Some clients could not log in due to a phone-string mismatch; the owner wanted to promote a booking to a client in one click.
- **Schema:** None.
- **Decision:** Normalize the phone comparison on login; keep booking→client promotion as an explicit one-click action in addition to the automatic path.

### v3.2.0 · Quotes, milestones, files & realtime expansion
- **What:** A large feature batch: a quotes table + quote builder + a `quotes` storage bucket; per-project milestones; a dedicated files page + a `files` storage bucket; a meeting "hub" with file upload/download, client comments, and approve/unapprove; Supabase Realtime live-sync across all admin pages; an `admins` table for phone-based admin login; and a local JSON account backup (`.backups/accounts-backup-20260621-153014.json`). Roughly 1,800 line changes across 19 files plus `supabase/admins.sql`.
- **Why:** Bring the portal up to a usable operational standard — real quotes, real documents, live updates between owner and client, and admin login backed by a table rather than a hardcoded password.
- **Schema:** Added the `quotes`, `milestones`, `files`, and `admins` tables, and the `files`, `meetings`, and `quotes` storage buckets (all PUBLIC). The pre-existing `meetings` table (created in v3.0.0) gained `client_comment` and `approved_at` columns. The `admins` table is defined in `supabase/admins.sql` — the only committed/tracked DDL in the repo. RLS is enabled on `admins` but with a permissive `select using (true)` policy; the owner row is seeded as name 'Owner', phone '0547080147'. All other tables have RLS DISABLED.
- **Decision:** Was deployed via `vercel --prod` but left uncommitted for ~3 weeks (the #1 health risk). **Committed 2026-06-29 as part of `7e3c7c8` (alongside v3.3.0)** — it shares files with the Meeting-3 increment, so the two could not be cleanly split. The deployed surface now matches git.

### v3.3.0 · Meeting-3 Increment 1
- **What:** First slice of the expanded Meeting-3 workflow: the canonical **6-service catalog** on `/book` (5 design + 1 management, the management service flagged as the Project-Management track) with the homepage `Services` list aligned to it; a new **SPACES** tab in the admin project hub (rooms + sqm, live total, realtime, delete); milestones now require a **Start and End date** (`start <= end`, with surfaced insert errors) rendered as a date range; and the first file-based migration starting the `migrations/` directory. Also cleared the 3 documented `app/admin/messages` lint errors and fixed a pre-existing UTC booking-date bug.
- **Why:** Begin building Meeting 3 into the product, starting with the role-independent Phase-1 intake that doesn't depend on the still-open decisions.
- **Schema:** New `spaces` table (FK → projects on delete cascade, `sqm numeric(10,2)`, RLS disabled to match siblings); `milestones.start_date`/`end_date` (nullable); `spaces` added to the realtime publication. Applied to prod as migration `meeting3_foundation` and tracked as `supabase/migrations/0001_meeting3_foundation.sql`.
- **Decision:** MINOR — a faithful feature batch, not a new era. Roles, internal pricing, the proposal builder, bundling, and attachment-enforcement were **deferred** pending the owner's §6 decisions. Adopted the `migrations/` directory (advances ADR-0009).

### v3.4.0 · Operational backbone — backups + bug log
- **What:** Automated nightly Supabase backups (`scripts/backup-data.mjs` + `run-backup.sh` + launchd `com.mydesign.backup`, daily 02:00 → Google Drive `mydesign/Backups` + a `git archive` source zip in `mydesign/Code`); a seeded `BUGLOG.md`; a `BACKUPS.md`; and the CODE_HEALTH weekly routine now verifies the backup + records bugs.
- **Why:** Bring MyDesign to the same operational maturity as Favor Plus / PHSN (versioning + session records already existed).
- **Schema:** None.
- **Decision:** MINOR — operational tooling, no runtime change. The backup uses the anon key for now (works only because RLS is off); add a service-role key before the RLS Phase-2 lockdown.

### v4.0.0 · Meeting-3 full workflow — roles, internal pricing, proposals, delivery *(NEW ERA)*
- **What:** Staff **roles** (manager/designer/project_manager) + role-aware login + a role-scoped sidebar + a manager-only **Staff** page; `/admin/projects` gains a **service picker** + **designer/PM assignment** + management-track routing + a role-scoped list; the **Project Hub** gains "Request pricing" (Spaces), a gated **Proposal builder** (Scope/Stages/Pricing/T&C), and milestone **delivery rules** (attach deliverables, can't-complete-without-a-file, Mood Board+2D "delivered together"); a new manager-only **Pricing queue** (`/admin/pricing`); the **client portal** gains the proposal **approve/reject** card (approval advances the project to Mood Board + seeds the first milestones), a spaces summary, and dated milestones + downloadable deliverables. Built with a 4-agent workflow + a 3-agent adversarial review (2 HIGH + key MEDIUM findings fixed).
- **Why:** Turn the full Meeting-3 طريقة العمل into the product (Increment 1 shipped the role-independent foundation in v3.3.0).
- **Schema:** migration `0002_meeting3_workflow` — `admins.role`; `projects.service/track/designer_id/pm_id`; `internal_quotes` (staff-only, unique per project) + `proposals` tables; `milestones.files/bundle`; realtime for the two new tables. Applied to prod.
- **Decision:** **MAJOR** — new roles + data model = a new era. Enforcement is client-side (localStorage roles), matching ADR-0001; true server-side/RLS hiding of the internal price is Security Phase 2 (see **ADR-0010**).

### v4.1.0 · Email-or-phone login + team staff accounts
- **What:** `/auth/login` matches by **email OR phone** for both staff and clients (two safe `.eq()` lookups, not a string-built `.or()`); `admins` gains `email` and `phone` becomes optional; the Staff page captures email. Seeded the team — **Tuqa** (manager/team-lead), **Hiba · Mohammed · Esra · Raneem** (designers) `@mysaudi.co`, default password `123123`.
- **Why:** the team signs in with work emails; clients keep phone — one portal, either identifier.
- **Schema:** migration `0003_staff_email_login` (`admins.email`; `admins.phone` nullable; unique `lower(email)`).
- **Decision:** MINOR. (Tuqa mapped to `manager` — the app's only oversight role; a dedicated `team_leader` role is a future option.)

### v4.2.0 · Owner-configurable per-account permissions
- **What:** `admins.permissions` (jsonb) lets the owner set exactly which admin **areas** each account can see (Projects, Hub, Pricing, Clients, Bookings, Quotes, Uploads, Staff); `NULL` = role defaults. The sidebar + the Pricing and Staff pages gate on the effective areas (`canSee`). The Staff page becomes **Staff & Permissions** — create with per-area toggles + a per-row editor for any account's role + access; the owner row (`0547080147`) is protected (full access, not editable/deletable).
- **Why:** the owner wanted to run access control directly (make accounts, set what each sees) ahead of a review meeting.
- **Schema:** migration `0004_account_permissions` (`admins.permissions jsonb`).
- **Decision:** MINOR. Enforcement is client-side (ADR-0001/0010) — the UI access control is real; the security boundary is Phase 2.

### v4.3.0 · Hub polish — meetings internal, proposal PDF, milestone Skipped
- **What:** Meetings are now **staff-internal** (client no longer sees/approves them; client Messages page + nav removed) with an optional **Google Drive link**. Sending a proposal generates a **quotation PDF with 15% VAT** (jsPDF) attached to the proposal for the client to download alongside Approve/Reject. Milestones gain a **"Skipped"** status. Removed the **Quotes tab** and the manual **stage dropdown** (stage badge is read-only; advances on proposal approval).
- **Why:** the owner's annotated review screenshots.
- **Schema:** migration `0005_proposal_pdf_meeting_drive` (`proposals.pdf_url`, `meetings.drive_link`); added `jspdf`.
- **Decision:** MINOR. Built with two parallel agents (hub + client-side).

### v4.4.0 · Staff-only internal notes on the proposal
- **What:** Reverted the v4.3.0 meeting Google Drive link. Added an **INTERNAL NOTES** section at the bottom of the Proposal tab in the Project Hub — staff add private notes (author + timestamp, delete), realtime, scoped to whoever can open the project. **Never rendered on the client portal.**
- **Why:** the owner clarified review screenshot #1 — not a Drive link on the meeting, but a private notes space beside the proposal that only chosen staff can see.
- **Schema:** migration `0006_project_notes` (`project_notes` table + index + realtime).
- **Decision:** MINOR. Hiding is client-side (the client UI never queries/renders it); true hiding is Security Phase 2 (ADR-0010).

### v4.5.0 · Fully customizable milestones — edit + reorder, no auto-seed
- **What:** Staff can **edit an existing milestone inline** (name / description / start+end dates) and **reorder** milestones with move up/down (persists `sort_order`). On proposal approval the project still advances to Mood Board, but **no milestones are auto-seeded** — the plan is entirely staff-built.
- **Why:** the owner wanted the project manager to shape the milestone plan freely, not inherit a fixed template.
- **Schema:** none — reorder uses the existing `milestones.sort_order` column (from migration 0001).
- **Decision:** MINOR. Locks in "the milestone plan is authored by staff, never generated."

### v4.5.1 · "Generate quotation PDF" button (any status)
- **What:** Extracted the jsPDF quotation builder into `buildQuotationPdfUrl` and added a **Generate/Regenerate PDF** button on the proposal display, so staff can produce the PDF for proposals that were **sent/approved before** Send-time generation existed — without re-sending. `saveProposal` reuses the helper.
- **Why:** the villa/penthouse proposals predated the PDF feature and were read-only, so the client had no PDF to download.
- **Schema:** none.
- **Decision:** PATCH — a sub-step of the v4.3.0 PDF feature.

### v4.5.2 · Quotation PDF — company logo + 15% VAT table
- **What:** Added the **company logo** (`public/logo.png`, converted from `logo.pdf`) to the top of the quotation PDF, and rebuilt the pricing block as a right-aligned table: **Subtotal / VAT (15%) / Total (incl. VAT)** with a divider. Added page-overflow handling for long Scope/Terms text.
- **Why:** the owner reported the client's PDF showed prices with no visible 15% tax and no branding.
- **Schema:** none (`jspdf` already present; logo is a static asset).
- **Decision:** PATCH — same feature, clearer output.

### v4.5.3 · Re-price after a spaces change + revise a sent/approved proposal
- **What:** Editing spaces used to leave the internal quote **and** the proposal locked at the old sqm, so the client saw nothing new. Added a **"Re-request pricing"** button (Spaces tab) that resets the quote to *pending* at the current sqm total for the Manager to re-approve; a **"spaces changed"** warning when the priced sqm no longer matches the current total; and a **"Revise"** button on a sent/approved proposal that reopens it as a draft to edit + resend.
- **Why:** the owner: "when i made another space and makes pricing nothing show in fahad account."
- **Schema:** none.
- **Decision:** PATCH — shipped under a patch number (v4.5.2 → v4.5.3) as a sub-step that closes a real workflow gap (no re-pricing path after approval); the v4.6.0 minor completes the loop.

### v4.6.0 · Approving a price auto-fills the proposal (one-click Send)
- **What:** When the Manager **approves** an internal quote, the client-facing proposal's **pricing is set to the approved total and the proposal reopens as a draft** — so the designer just clicks **Send** once (regenerating the PDF) and the client sees the new number. The proposal builder also **pre-fills pricing** from the approved quote for first-time proposals.
- **Why:** the owner chose (over showing raw pricing on the client project) to keep the proposal as the single client-facing document but stop making staff retype the price the manager already set.
- **Schema:** none.
- **Decision:** MINOR. Locks in: the proposal is the only place the client sees price; the internal price/sqm stays staff-only; approving a price *is* the pricing. Completes the re-pricing loop from v4.5.3.

### v4.6.1 · Fix broken file uploads (files-table RLS restore)
- **What:** File uploads on the admin **Upload Files** page had stopped working during team testing — files landed in the storage bucket but their metadata row was rejected, so they "vanished" and every file list (admin recently-uploaded, client Files page, project detail Files) rendered empty. Root cause: `public.files` had **Row-Level Security enabled with zero policies** (deny-all), applied out-of-band directly in the Supabase dashboard — it is in no migration and every sibling data table runs with RLS off. Re-disabled RLS on `public.files` to restore parity, recorded as migration **`0007_files_rls_restore.sql`**, and hardened `app/admin/uploads/page.tsx` to capture and display any storage/insert error instead of the previous `if (!error)` swallow. (Confirmed the milestone-deliverable, meeting-attachment, quote-file and proposal-PDF paths were unaffected — they write file info to a jsonb column on their own RLS-off row, never to `public.files`.)
- **Why:** the deny-all state broke the entire file-sharing feature for testers, and the silent-failure code hid it — a report of "we can't upload anything."
- **Schema:** `alter table public.files disable row level security;` (migration 0007). No table/column change.
- **Decision:** PATCH — a revert of an accidental change back to the documented baseline (ADR-0002: anon key, RLS off on all data tables; true per-row hiding is Security Phase 2). Also added the tracked migration so live-DB schema drift stops going unrecorded, and surfaced upload errors so this silent-failure class can't recur.

### v4.7.0 · Testing-feedback UX: session-aware navbar + one-step milestone deliverable
- **What:** Two fixes from the team's testing round. (1) **Session-aware navbar** — the public marketing header (`Navbar.tsx`) read no session and always showed "Client Login," so returning-but-still-logged-in users clicked it and re-entered credentials. It now shows **"My Dashboard"** (client) or **"Admin Panel"** (staff) linking straight into the portal when a `localStorage` session exists, and `/auth/login` now **redirects an already-logged-in visitor** to their portal instead of showing the form. (2) **One-step milestone deliverable** — the New Milestone form gained an optional **Deliverable** file field, so a milestone can be created **Completed in a single save**; the Status dropdown **greys out "Completed" with inline guidance** ("attach a deliverable first") until a file is chosen, replacing the old post-submit red-error wall. Clearing the file steps a Completed selection back to In Progress. The existing per-milestone attach-then-complete flow is unchanged.
- **Why:** testers reported "we have to log in again when we return to the main page" (the session was never actually lost — it was a navbar affordance gap) and hit the milestone "can't start as Completed" wall when trying to post a finished moodboard.
- **Schema:** none — the deliverable writes to the existing `milestones.files` jsonb (migration 0002); the navbar reads the existing `localStorage` session.
- **Decision:** MINOR. The "re-login" complaint is fixed as UX, not auth — the localStorage model is unchanged (client-side enforcement, Security Phase 2 still pending). The milestone form now supports create-and-complete-in-one-step while preserving the deliverable-before-Completed rule, just enforced *before* submit rather than after.

### v4.7.1 · Storage DELETE/UPDATE policies + upload-report verification
- **What:** Investigating the team's follow-up "still unable to upload" report: verified **v4.7.0 is live** (new navbar + milestone strings present in the served JS), the `files` table is still RLS-off (the v4.6.1 fix held), and a live anon probe — the browser's exact calls — succeeded (storage upload HTTP 200, `public.files` insert HTTP 201). **Zero upload requests reached Supabase after 2026-07-13**, so the reported failures never left the testers' browsers (most likely stale tabs/cached pre-fix JS). The probe surfaced a real adjacent gap: the buckets had **no DELETE/UPDATE policies**, so the app's file-delete silently 400'd and orphaned objects (BUG-012). Added `Public delete`/`Public update` policies for `files`/`meetings`/`quotes` via migration `0008`.
- **Why:** keep the repo in lockstep with the live DB (the 0008 policies were applied in production during diagnosis) and close the orphaned-objects gap found on 2026-07-13.
- **Schema:** migration `0008_storage_delete_update_policies.sql` (idempotent policy creation; no table changes).
- **Decision:** PATCH — permissive-parity fix, same posture as INSERT/SELECT until Security Phase 2 replaces all bucket policies with scoped ones. Light/dark mode was **not** part of any deploy yet (team expectation gap) — it now begins on its own branch.

### v4.8.0 · Light/dark display modes (marketing + client portal; admin stays dark)
- **What:** The team's light-mode request, built as a real theme system rather than a bolt-on: `globals.css` now defines a **12-token semantic palette** (background/foreground/surface/surface-2/border-strong/border/border-soft/muted-1..4/fill) — dark is the default and matches the existing look; `[data-theme="light"]` switches to a **warm off-white (#faf9f7)** whose muted-text ladder is deliberately **higher-contrast** than a naive inversion (the direct-sunlight readability complaint). A **ThemeToggle** (sun/moon) sits in the marketing navbar and the client dashboard sidebar; choice persists to `localStorage` and an inline pre-paint script prevents any flash of the wrong theme. ~36 files across the marketing site, client portal (`app/dashboard/**`), and entry pages (`/book`, `/projects`, `/auth/*`) migrated from hardcoded `white/NN`-style utilities to the semantic tokens. **Photographic overlays** (hero + category scrims, text over photos, the homepage navbar while unscrolled over the hero) intentionally stay dark-scrim/white-text in both themes. **`app/admin/**` is untouched and stays dark** in both modes (opaque wrapper verified).
- **Why:** team testing feedback — text was hard to read in direct sunlight; they asked for light and dark display modes. Owner scoped it to marketing + client portal (the surfaces read in sunlight), leaving the staff admin dark.
- **Schema:** none — purely presentation. (The build surfaced an ops gap instead: the first-ever *preview* deployment failed with "supabaseUrl is required" because `NEXT_PUBLIC_SUPABASE_*` existed only for Production; both were added to the Preview environment scoped to the branch.)
- **Decision:** MINOR, built per the guide on a **branch with a Vercel preview** reviewed by the owner before merge. Notable build lesson: in Tailwind v4, `border-soft`/`border-strong` utilities resolve via `--color-soft`/`--color-strong` — without those aliases in `@theme` the classes silently emit no CSS (caught in adversarial verify, fixed in `globals.css`).

### v4.9.0 · Upload Files tab + light/dark for the designer (admin) dashboard
- **What:** Two operator-facing additions from the team's testing round. (1) **Upload Files tab in the Project Hub** — select a project → new **UPLOAD FILES** tab: drag/drop or browse, files are shared to that client's portal (`public.files` with the project's `client_id`), with error surfacing, a file **count**, a friendly empty state, accessible ~44px tap targets, and **"Sent <date, time>"** shown under each file's delete button (from `files.created_at`, local time). (2) **Light/dark across the entire admin/designer dashboard** — migrated all of `app/admin/**` + `AdminSidebar` from hardcoded colors to the shared semantic tokens (the same system the marketing site + client portal use), so every admin page (Overview, Projects, Project Hub, Pricing, Clients, Bookings, Quotes, Upload Files, Staff) flips together. A clearly-labeled **"Light mode / Dark mode"** button sits in the admin sidebar. Also **raised the dark muted-text contrast** floor globally (muted-1 .82 / -2 .60 / -3 .46 / -4 .34) — fixes the low-contrast admin text and improves every dark surface — and made native **date/time pickers follow the theme** (`color-scheme`) instead of a hardcoded dark picker.
- **Why:** testers wanted to send files to a client from within the project (not a separate page) and to see when each was sent; and asked for light/dark in the designer dashboard (readability in the studio/on-site).
- **Schema:** none — `files.created_at` already existed; theming is presentation-only. (The `admins` write policies and storage delete policies from v4.8.2/v4.7.1 are the only recent DB changes.)
- **Decision:** MINOR — a batch of related operator UX. Built on a **branch with a Vercel preview** reviewed by the owner before merge, per the guide's test-environment gate. The admin is the same `/admin` surface for all staff roles, so "designer dashboard" = the whole admin panel. UI/UX pass (contrast, tap targets, labeled control, empty/loading states) applied using the interface-design priority rules.

---

## Version → commit map

```
v1.0.0  5bed8f2
v1.1.0  c5bcbe2
v1.1.1  6bb7bfc → 3dfdc13 → 8c8315f
v2.0.0  4d010cc
v2.1.0  dd0e38f
v2.2.0  4c3257c → 94b303c → a6b3ec2 → accaf55
v2.2.1  c0d91fa → fc6362a → 8388e16 → a9c23ce → 1ebc525
v3.0.0  52d83b4 → d867265 → 8011ae3
v3.1.0  ab1c97b → 4c60527 → 48a24c8 → 9a952a0
v3.1.1  3af643c
v3.2.0  7e3c7c8   (committed 2026-06-29, together with v3.3.0)
v3.3.0  7e3c7c8   (tag v3.3.0 — Meeting-3 Increment 1)
v3.4.0  08e9958   (tag v3.4.0 — operational backbone: backups + bug log)
v4.0.0  de19920   (tag v4.0.0 — Meeting-3 full workflow: roles/pricing/proposals/delivery)
v4.1.0  1df2d06   (tag v4.1.0 — email-or-phone login + team staff accounts)
v4.2.0  7fec31f   (tag v4.2.0 — owner-configurable per-account permissions)
v4.3.0  2d7fc72   (tag v4.3.0 — hub polish: meetings internal, proposal PDF w/ VAT, milestone Skipped)
v4.4.0  fe1c14c   (tag v4.4.0 — staff-only internal notes; revert meeting Drive link)
v4.5.0  afaa7cd   (tag v4.5.0 — fully customizable milestones: edit + reorder; drop auto-seed)
v4.5.1  249675d   (tag v4.5.1 — Generate quotation PDF button, any status)
v4.5.2  d0e790c   (tag v4.5.2 — quotation PDF: logo + 15% VAT table)
v4.5.3  e958a65   (tag v4.5.3 — re-price after spaces change + revise a sent/approved proposal)
v4.6.0  1c474fc   (tag v4.6.0 — approving a price auto-fills the proposal; one-click Send)
v4.6.1  5bb893d   (tag v4.6.1 — fix broken file uploads: files-table RLS restore + surface upload errors)
v4.7.0  4422d09   (tag v4.7.0 — testing-feedback UX: session-aware navbar + one-step milestone deliverable)
v4.7.1  465b6d0   (tag v4.7.1 — storage delete/update policies + upload-report verification)
v4.8.0  f352918   (tag v4.8.0 — light/dark display modes; admin stays dark)
v4.8.1  c0d8d4d   (tag v4.8.1 — fix owner login trapped by a leftover client session)
v4.8.2  a91c3eb   (tag v4.8.2 — fix staff management blocked by admins RLS)
v4.9.0  da27b3b   (tag v4.9.0 — Upload Files tab + light/dark for the admin dashboard)
```

Compact form: `v1.0.0 5bed8f2 · v1.1.0 c5bcbe2 · v1.1.1 8c8315f · v2.0.0 4d010cc · v2.1.0 dd0e38f · v2.2.0 accaf55 · v2.2.1 1ebc525 · v3.0.0 8011ae3 · v3.1.0 9a952a0 · v3.1.1 3af643c · v3.2.0 7e3c7c8 · v3.3.0 7e3c7c8 · v3.4.0 08e9958 · v4.0.0 de19920 · v4.1.0 1df2d06 · v4.2.0 7fec31f · v4.3.0 2d7fc72 · v4.4.0 fe1c14c · v4.5.0 afaa7cd · v4.5.1 249675d · v4.5.2 d0e790c · v4.5.3 e958a65 · v4.6.0 1c474fc · v4.6.1 5bb893d · v4.7.0 4422d09 · v4.7.1 465b6d0 · v4.8.0 f352918 · v4.8.1 c0d8d4d · v4.8.2 a91c3eb · v4.9.0 da27b3b`
