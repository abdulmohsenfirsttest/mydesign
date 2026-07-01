# MyDesign — Changelog

MyDesign is a Riyadh-based design-and-build (interior design + construction) platform, styled after mydesign.sa, built and maintained by Abdulmohsen. It runs on Next.js 16 (App Router), React 19, Tailwind v4, TypeScript, and a Supabase Postgres backend, deployed on Vercel at https://mydesign-blush.vercel.app.

The project follows **vMAJOR.MINOR.PATCH** versioning per the team's versioning guide: **MAJOR** marks a new era or breaking change (a new product surface, a rewrite, or an incompatible data model); **MINOR** marks a feature or a batch of related work; **PATCH** marks a fix or a small sub-step. The build arc covered here runs from 2026-06-02 to 2026-06-28.

Ordering convention: the glance table below is **newest-first**; the detailed entries that follow are **oldest-first (chronological)**.

---

## Version history at a glance

| Version | Date | Type | Summary |
|---------|------|------|---------|
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
```

Compact form: `v1.0.0 5bed8f2 · v1.1.0 c5bcbe2 · v1.1.1 8c8315f · v2.0.0 4d010cc · v2.1.0 dd0e38f · v2.2.0 accaf55 · v2.2.1 1ebc525 · v3.0.0 8011ae3 · v3.1.0 9a952a0 · v3.1.1 3af643c · v3.2.0 7e3c7c8 · v3.3.0 7e3c7c8 · v3.4.0 08e9958 · v4.0.0 de19920 · v4.1.0 1df2d06`
