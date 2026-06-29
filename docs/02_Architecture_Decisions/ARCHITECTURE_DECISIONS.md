# Architecture Decision Records — MyDesign

This is the running Architecture Decision Record (ADR) log for MyDesign, the Riyadh-based design-&-build platform (live at https://mydesign-blush.vercel.app). Each entry captures one significant architectural choice: the problem it solved, the exact approach taken, and the consequences — including the tradeoffs and known debt we accepted. The goal is a single honest record of *why* the system is the way it is, so that future work (especially the security and migration roadmap) starts from facts rather than guesswork. Entries are numbered in the order they were locked in, never renumbered. When a decision is replaced, the old ADR stays in place and is marked **Superseded**, with a pointer to its replacement. Several of these records are deliberately uncomfortable: they document choices that were right for shipping a demo fast but carry real security and reproducibility debt, and they name that debt plainly so it can be paid down in order.

---

## ADR-0001: Custom phone + password auth instead of Supabase Auth

**Status:** Accepted
**Date:** 2026-06-03

### Context

The portal needed a login for two audiences — clients and the owner — keyed off the phone number, since that is what the firm already collects at consultation booking. The firm and its clients are Riyadh-based and the business identifies people by phone, not email; email verification flows and Supabase's hosted auth UI added friction and a second identity (email) that the business does not actually use as the primary key. An earlier attempt at email/password and a phone+OTP flow (v2.2.0) proved fragile and was simplified.

### Decision

We use a fully custom auth scheme, not Supabase Auth. The client login page (`/auth/login`) takes a phone and password, queries the `clients` table directly with `.eq('phone', …).eq('password', …)`, and on a match writes `client_id` and `client_name` into `localStorage`. The admin login (`/admin/login`) does the same against the `admins` table (owner phone `0547080147`); on success it sets `localStorage.admin_session`, and the admin layout guards every `/admin/*` route by redirecting to `/admin/login` when that flag is absent. New clients get a default password of `123123`. The older `/auth/signup` and `/auth/verify` routes remain in the tree but are legacy and superseded by this flow.

### Consequences

- Onboarding is trivial: a client can log in with their phone and a known default password immediately after booking, with no email step.
- We own the entire auth surface, which is simple to reason about but carries the full security burden ourselves. There is **no password hashing** (passwords are compared in plaintext, see ADR-0002), **no rate limiting**, and **no real session expiry** — the session is just a `localStorage` flag, so it never times out and is trivially forgeable client-side.
- Because matching happens in the browser against the raw table, the security of login depends entirely on table access control, which is currently absent (RLS disabled — see ADR-0002).
- This is a known-debt decision. Phase 2 of the security roadmap is to move validation server-side (an API route or Postgres RPC) and hash passwords, or to adopt Supabase Auth outright; Phase 3 adds rate limiting, real session expiry, and audit logging.

---

## ADR-0002: Single shared browser Supabase client on the anon key, with RLS disabled

**Status:** Accepted (known debt)
**Date:** 2026-06-03

### Context

The v3.0.0 rewrite replaced all mock/localStorage data with a real Supabase Postgres backend across the client portal and every admin page. We needed a fast path to wire ~70 data references (across 8 tables) to the database without standing up a backend tier. The project is a solo build by one maintainer optimizing for shipping speed.

### Decision

There is exactly one Supabase client, created in `lib/supabase.ts` in the browser using the **public anon/publishable key** (`NEXT_PUBLIC_*`). Every page imports that same client. **All data access is client-side** — there are no server-side keys, no service-role key in use, and no server API layer between the browser and Postgres. To make this work without an auth layer enforcing access, **Row Level Security is currently disabled** on all data tables: `bookings`, `clients`, `projects`, `milestones`, `meetings`, `quotes`, and `files`. (`admins` is the one exception: RLS is enabled, but with a permissive `using (true)` select policy — see its note below.)

### Consequences

- Development is fast and the data layer is uniform: one client, one key, direct queries everywhere.
- **This is the single largest security liability in the system.** With RLS off and only the anon key in play, anyone who holds that public key — which ships to every browser — can read and write `clients`, `projects`, `meetings`, `quotes`, `files`, `bookings`, and `milestones` directly. There is no per-row ownership check; a client could read another client's data, and an outsider with the key could read or modify everything.
- Compounding this, the `admins` table's `using (true)` select policy means the anon key can read admin name, phone, **and plaintext password** — so the "protected" admin login is itself readable. Passwords in both `clients` and `admins` are stored in plaintext.
- The anon key and project ref (`ijtgwmqrxminwypracei`) were pasted in plaintext in a prior chat session and should be treated as exposed; rotation is required.
- Remediation is phased to match the rest of the security roadmap: Phase 1 rotate the Supabase keys and lock the `admins` table to service-role only; Phase 2 enable RLS with proper per-row policies on every table and move writes behind a server-side API/RPC; later phases add the remaining controls. We are recording this as accepted debt, not as a finished design.

---

## ADR-0003: Black/white + Playfair/Inter luxury design system

**Status:** Accepted
**Date:** 2026-06-02

### Context

The first release (v1.0.0) was a dark-neutral/indigo single-page portfolio. It read as a generic developer template and did not match the firm's brand or the reference site, mydesign.sa, which presents as a high-end "Design & Build" studio. The visual identity needed to signal craft and restraint, not software.

### Decision

We replaced the original palette with a pure black-and-white luxury system (v1.1.0): black on white, no accent color. Typography pairs **Playfair Display** (serif) for headings with **Inter** (sans) for body text. The layout uses a fixed navbar and a dedicated `/projects` page, deliberately mirroring the structure and tone of mydesign.sa.

### Consequences

- The brand reads as an interior-design studio rather than a tech demo, which is the intended positioning.
- The two-typeface, monochrome system is a tight constraint that keeps every new page consistent and cheap to design — there is no color system to maintain.
- The original indigo portfolio palette is fully retired; any older screenshots or references to it are out of date.
- The serif-heading / sans-body split is now a load-bearing brand rule: future surfaces (admin and portal included) are expected to follow it rather than introduce new fonts or colors.

---

## ADR-0004: Seven-stage project workflow model

**Status:** Accepted
**Date:** 2026-06-02

### Context

A design-&-build project moves through a predictable sequence, and both the client and the owner need a shared, legible view of where any given project stands. We needed one canonical model of "stages" that the portal and the admin dashboard could both render, rather than ad-hoc status strings.

### Decision

Every project advances through a fixed, ordered pipeline of seven stages: **Quotation → Mood Board → 2D → 3D → Plans → Payment → Delivery.** This pipeline is the backbone of the UI: it drives the progress bar and stage indicator on `/dashboard/projects`, the project detail page (`/dashboard/projects/[id]`), and `/admin/projects`. The current stage and a numeric progress value live on the `projects` row.

### Consequences

- Clients and the owner share one vocabulary for status; "where is my project" has a single, unambiguous answer.
- The fixed seven-stage order is now baked into multiple views. Changing the stage list (adding, removing, or reordering) is a cross-cutting change that touches the portal, the detail page, and the admin pipeline together.
- The model assumes a single linear path. Projects that skip a stage or run stages in parallel don't map cleanly and would need an explicit modeling decision later.

---

## ADR-0005: Meeting-log + milestone + client approval/comment model

**Status:** Accepted
**Date:** 2026-06-02

### Context

The early portal carried a mock chat UI for client/owner interaction. It implied real-time messaging the business does not actually run, and it produced no durable record of what was decided. What the firm needs is an auditable log of meetings and decisions, plus an explicit way for the client to sign off on what was agreed.

### Decision

We replaced the mock chat with a structured meeting log. The admin logs each meeting into the `meetings` table — title, date, time, type, summary, a `decisions` list (jsonb), and attached `files` (jsonb). The client sees these as a timeline and can **Approve / Unapprove** the meeting notes (recorded via `approved_at`) and leave a `client_comment`. Per-project **milestones** (the `milestones` table, ordered by `sort_order`) and **quotes** were layered on top of this same model.

### Consequences

- Every meeting and decision is persisted and reviewable, and client sign-off is captured as data (`approved_at`, `client_comment`) rather than implied — far more useful for a build firm than a chat transcript.
- We deliberately do **not** offer free-form real-time chat; client input is scoped to approving notes and commenting. This is simpler to maintain and avoids promising a channel the firm won't staff.
- Storing `decisions` and `files` as jsonb keeps the schema flexible and the meeting record self-contained, at the cost of those fields not being individually queryable or constrained by the database.
- The `meetings` table is now central (12 code references) and ties together the timeline, approvals, and file attachments; changes to its shape ripple across the portal and admin.

---

## ADR-0006: Document delivery via public Supabase Storage buckets

**Status:** Accepted (known debt)
**Date:** 2026-06-03

### Context

The portal needs to deliver real documents — quote PDFs, meeting attachments, and general project files — to clients, and let the owner upload them. We needed file hosting wired into the same Supabase backend without building a separate file service or signing infrastructure.

### Decision

Files are stored in three Supabase Storage buckets — **`files`**, **`meetings`**, and **`quotes`** — and all three are configured as **public**. Upload happens from the admin side (the files page, the meeting hub, and the quote builder); the client downloads by URL. File metadata is tracked in the `files` table and inside the jsonb `files` field on `meetings`.

### Consequences

- File upload and download work with plain public URLs — no signing step, no token handling, simple to build and debug.
- **Because the buckets are public, every client document is reachable by anyone who has (or can guess/obtain) its URL.** There is no access check at download time; a leaked or shared link exposes the file to the open internet. For a firm handling client floor plans, quotes, and contracts, this is a real confidentiality risk.
- This pairs with ADR-0002: with RLS off, the `files` table that holds the metadata (and therefore the paths) is itself readable via the anon key, which makes enumerating the public URLs easier.
- Remediation is in Phase 2 of the security roadmap: make the buckets **private** and serve files through **signed URLs** with expiry. Recorded here as accepted debt for now.

---

## ADR-0007: Supabase Realtime for live admin multi-session sync

**Status:** Accepted
**Date:** 2026-06-21

### Context

The owner may have the dashboard open in more than one place (multiple tabs or devices), and admin actions — changing a booking status, advancing a project stage, logging a meeting — should be reflected without a manual refresh. We wanted live updates without polling or building a websocket layer ourselves.

### Decision

We use **Supabase Realtime** to subscribe to changes on the underlying tables and push live updates into the admin pages, giving multi-session sync across the admin dashboard. This was added as part of the v3.2.0 working set, alongside quotes, milestones, the files page, and the meeting hub.

### Consequences

- Admin views stay current automatically; concurrent sessions converge without refreshes, which matters when the owner works across devices.
- Realtime rides on the same anon-key, RLS-disabled posture as the rest of the data layer (ADR-0002). Until RLS is enabled, Realtime change streams inherit the same exposure — anyone with the key could in principle subscribe to table changes, not just the owner. Tightening this is part of the Phase 2 RLS work.
- This adds a live dependency on Supabase's Realtime service; if it is unavailable, the UI falls back to whatever was last fetched rather than failing, but live sync simply stops.

---

## ADR-0008: Booking auto-creates a client account (upsert on phone)

**Status:** Accepted
**Date:** 2026-06-03

### Context

There was a gap between a prospect requesting a consultation and that person becoming a portal user. Asking clients to book and then separately register was friction we wanted to remove, and it left bookings disconnected from accounts.

### Decision

When a consultation is submitted at `/book`, the system **upserts a `clients` row keyed on the phone number**, creating the account if the phone is new (with the default password `123123`) and reusing it if the phone already exists. The result is that a client can log in immediately after booking, using the phone they just entered and the default password. The phone column on `clients` is `UNIQUE`, which is what makes the upsert safe. The admin side also exposes an explicit "+ Add to Clients" action on bookings for the manual case.

### Consequences

- Zero-friction onboarding: booking and account creation are one step, and the new client is instantly able to enter the portal.
- The `UNIQUE` phone constraint is now load-bearing — it both prevents duplicate clients and is the key the upsert relies on. The same phone identity links a booking to a client and to that client's login (ties into ADR-0001).
- Every auto-created account starts with the **same well-known default password (`123123`)**. Combined with phone numbers being relatively easy to guess or obtain, and with RLS disabled (ADR-0002), this means freshly booked accounts are weakly protected until the client changes the password — which nothing currently forces them to do.
- Bookings and clients can drift if a phone is later edited in one place but not the other; the upsert only reconciles at booking time.

---

## ADR-0009: Adopt a `migrations/` directory as the single source of schema truth

**Status:** Proposed
**Date:** 2026-06-28

### Context

Today the database schema is **not reproducible from the repository.** Almost all DDL — the eight tables (`bookings`, `clients`, `admins`, `projects`, `milestones`, `meetings`, `quotes`, `files`), their columns, constraints, the storage buckets, and the RLS settings — was hand-typed directly into the Supabase SQL editor. The only schema artifact tracked in git is `supabase/admins.sql`. There is no `migrations/` directory. If the Supabase project were lost, or if a second environment (a test/staging project) were needed, the schema could not be recreated from the repo. This also makes the security roadmap harder: enabling RLS and adding per-row policies across every table is exactly the kind of change that needs to be reviewable and replayable, which an ad-hoc SQL editor cannot provide.

### Decision

Adopt a tracked `migrations/` directory in the repository as the **single source of truth for the schema.** Every schema change — including a baseline migration that captures the current tables, constraints, buckets, and RLS state — is written as an ordered, committed SQL migration and applied through a migration tool rather than typed into the SQL editor. The forthcoming RLS-enable and policy work (Phase 2 of the security roadmap) would be the first changes authored this way.

### Consequences

- The schema becomes reproducible: a fresh Supabase project (for example, the test environment the versioning rules call for before any risky change) can be rebuilt from the repo, and schema changes go through review like code.
- The security migration work gains a safe home — RLS policies can be staged in a test environment and replayed against production, matching the "warn before you enforce" and "test before risky changes" gates.
- There is one-time cost: writing an accurate baseline migration that reflects the hand-typed current state, and the discipline of never again editing schema only in the SQL editor.
- Until this is adopted, the repo remains an incomplete record of the system — code is versioned, schema is not — which is currently the project's top reproducibility risk alongside the large uncommitted v3.2.0 working set.

> **Status note:** Proposed, not yet adopted. As of 2026-06-28 the only committed DDL remains `supabase/admins.sql`, and the v3.2.0 schema work (quotes, milestones, the files table, storage buckets) is deployed to production but lives only in the Supabase SQL editor, not in the repo.
