# MyDesign — Product Requirements Document

| | |
|---|---|
| **Document** | Product Requirements Document |
| **Project** | MyDesign (brand: "My Design / Design & Build") |
| **Owner** | Abdulmohsen |
| **Date** | 2026-06-28 |
| **Live** | https://mydesign-blush.vercel.app |
| **Status** | Active — built 2026-06-02 to 2026-06-28; current working set v3.2.0 (deployed, pending commit) |

---

## 1. Vision & Problem

MyDesign is the digital platform for a Riyadh-based design-and-build firm — a single company that handles both interior design and the construction that follows it. The brand presents itself as "My Design / Design & Build" and is styled after mydesign.sa. The platform is owned and maintained by one person, Abdulmohsen.

A design-and-build engagement is long, visual, and full of approvals. A client commissions a space, and over weeks the firm moves through quotation, mood boards, 2D drawings, 3D renders, construction plans, payment, and final delivery. Each step produces files to share and decisions that need the client's sign-off. Run informally — over phone calls, WhatsApp, and scattered email attachments — this work leaves no single record of where a project stands, what was decided in the last meeting, or which quote and files are current.

MyDesign solves that operational problem by giving the firm one place to run its projects and giving each client one place to follow their own. The firm captures consultation requests, converts them into clients and projects, advances each project through a fixed 7-stage workflow, logs every meeting with its decisions and attached files, and issues quotes. The client logs in to a private portal, sees their project's progress, reads the meeting log, approves or comments on what was decided, and downloads the quotes and files prepared for them. The marketing site brings prospects in; the booking form turns a prospect into a portal account automatically; the admin dashboard is where the owner runs the business.

---

## 2. Personas

### (a) Firm owner / admin — "Abdulmohsen"
The sole operator of the firm and the only admin. He logs in at `/admin/login` with a phone number and password (seeded owner phone `0547080147`), and works inside the "Owner Dashboard". His goals:

- See incoming consultation requests and move them through their status, turning serious enquiries into clients.
- Maintain the client list and create projects for them.
- Drive each project forward through the 7 stages, keeping its progress bar and stage pipeline current.
- Document every client meeting — title, date, type, summary, the list of decisions taken, and any files shared — so there is a durable record.
- Build and send quotes, and upload files (renders, drawings, documents) for the client to download.
- Have all of this update live across the dashboard without manual refreshing.

### (b) Design client
A customer who has commissioned (or is enquiring about) a design-and-build project. The client first meets MyDesign through the public site or a booking. After booking they receive a portal account automatically and log in at `/auth/login` with their phone number and a default password (`123123`). Their goals:

- Book a consultation without friction.
- Log in and immediately see their own project(s) and how far each has progressed through the 7 stages.
- Read the meeting log as a timeline, understand what was decided, and respond — approve the meeting notes (or un-approve) and leave a comment.
- Find their quotes, financial information, and files in one place and download what they need.
- Leave a review.

---

## 3. Feature inventory

### Public marketing site
- **Landing page (`/`)** — the firm's home page in the black/white "Design & Build" luxury aesthetic (Playfair Display headings, Inter body).
- **Projects showcase (`/projects`)** — a dedicated page presenting the firm's work.
- **Consultation booking (`/book`)** — a form capturing name, phone, email, service, date, and time. Submitting it creates a `bookings` record and auto-creates a `clients` row (upsert on phone, default password `123123`) so the visitor can log into the portal immediately.
- **Client Login navigation link** — entry point from the marketing site into the portal.

### Client portal
- **Login (`/auth/login`)** — phone + password sign-in against the `clients` table; on success stores `client_id` / `client_name` in `localStorage`.
- **Dashboard home (`/dashboard`)** — the client's overview.
- **Projects list (`/dashboard/projects`)** — the client's projects with the 7-stage pipeline and progress shown.
- **Project detail (`/dashboard/projects/[id]`)** — the single dynamic route; full view of one project including its stage pipeline, milestones, and meeting log. The client can **approve / un-approve** meeting notes and add a **comment**.
- **Messages (`/dashboard/messages`)** — the meeting-log / communication surface.
- **Files (`/dashboard/files`)** — documents shared with the client, available to download.
- **Financials (`/dashboard/financials`)** — the client's financial information and quotes.
- **Reviews (`/dashboard/reviews`)** — where the client leaves a review.
- *(Legacy, superseded:* `/auth/signup` and `/auth/verify` predate the phone + password login and are no longer the path used.)*

### Admin / Owner dashboard
- **Admin login (`/admin/login`)** — phone + password against the `admins` table; session stored as `admin_session` in `localStorage`. The admin layout guards every `/admin/*` route, redirecting to login when no session is present. Sidebar label is "Owner Dashboard"; sign-out is supported.
- **Dashboard home (`/admin`)** — the owner's operational overview.
- **Clients (`/admin/clients`)** — the client list, with a client-creation form.
- **Projects (`/admin/projects`)** — manage projects, including the progress bar and 7-stage pipeline; create per-project milestones.
- **Bookings (`/admin/bookings`)** — incoming consultation requests with a live status dropdown, plus "+ Add to Clients" to register a booking as a client.
- **Messages (`/admin/messages`)** — log meetings (title, date, time, type, summary, decisions, attached files) and manage milestones.
- **Quotes (`/admin/quotes`)** — the quote builder: line items, status, and an attached file.
- **Uploads (`/admin/uploads`)** — upload files for clients/projects.
- **Realtime sync** — Supabase Realtime keeps all admin pages live-updating.

---

## 4. Core UX flows

### (a) Booking → auto-account → portal login
1. A visitor opens `/book` on the public site.
2. They submit the consultation form (name, phone, email, service, date, time).
3. The submission writes a `bookings` record.
4. The same submission auto-creates a `clients` row, upserting on phone with the default password `123123`.
5. The visitor goes to `/auth/login` and signs in with their phone number and `123123`.
6. The login page matches phone + password against the `clients` table and stores `client_id` / `client_name` in `localStorage`.
7. They land on `/dashboard`, already a registered client — no separate signup step.

### (b) Project lifecycle across the 7 stages
1. The owner converts a booking or creates a client at `/admin/clients`.
2. The owner creates a project for that client at `/admin/projects` (name, type, budget, etc.).
3. The project enters the pipeline at **Stage 1 — Quotation**.
4. The owner advances it through the fixed sequence: **Quotation → Mood Board → 2D → 3D → Plans → Payment → Delivery**, updating the stage and progress.
5. Per-project milestones are tracked alongside the stage pipeline.
6. The current stage and progress bar are shown on `/admin/projects`, on `/dashboard/projects`, and on the client's project detail page.
7. The project reaches **Delivery** as its final stage.

### (c) Meeting documentation → client approval / comment
1. After a meeting, the owner opens `/admin/messages` and logs the meeting against its project.
2. The owner records the title, date, time, type, summary, and the list of decisions, and attaches any files.
3. The meeting is saved to the `meetings` table (decisions and files stored as JSON; status, client comment, and approval timestamp fields included).
4. The client sees the meeting on their project as part of a timeline.
5. The client reads the summary and decisions.
6. The client **approves** the meeting notes (or **un-approves**) and may add a **comment**.
7. Approval and the comment are written back to the meeting record, giving both sides a confirmed account of what was agreed.

### (d) Quotes & files delivery
1. The owner builds a quote at `/admin/quotes` — line items, status, and an attached file — linked to the project/client.
2. The quote is saved to the `quotes` table; its attachment goes to the public `quotes` storage bucket.
3. The owner uploads project files at `/admin/uploads`; file metadata is stored in the `files` table and the file in the public `files` storage bucket. Meeting attachments use the `meetings` bucket.
4. The client opens `/dashboard/financials` to see their quotes and `/dashboard/files` to see their documents.
5. The client downloads the quotes and files prepared for them.

---

## 5. Operational goals & success criteria

- **One source of truth per project.** Every project's stage, progress, milestones, meetings, decisions, quotes, and files live in one record set, visible to both the owner and the client. *Success:* a client can answer "where is my project?" from `/dashboard` without contacting the firm.
- **Zero-friction onboarding.** A consultation booking creates a portal account automatically. *Success:* a client who has just booked can log in with their phone and the default password without any separate signup step.
- **Documented decisions with client sign-off.** Every meeting is logged with its decisions, and the client can approve or comment. *Success:* each completed meeting has a client approval state and an audit trail of what was agreed.
- **A single fixed workflow.** All projects move through the same 7 stages (Quotation → Delivery), shown identically on the admin and client sides. *Success:* the same stage label means the same thing to the owner and the client.
- **Live operations.** Supabase Realtime keeps admin pages current. *Success:* a status or stage change is reflected across the dashboard without a manual refresh.
- **Ship-ready builds.** *Success:* `next build` compiles all 23 routes and `tsc --noEmit` passes (both currently green).

---

## 6. Scope & non-goals

What MyDesign intentionally does **not** do yet:

- **No managed / hardened authentication.** Auth is a custom phone + password check against the database, not Supabase Auth. There is no password hashing (passwords are stored in plaintext, default `123123`), no rate limiting, and no real session expiry — the only session marker is a `localStorage` flag. *(Hardening is on the security roadmap, not in current scope.)*
- **No row-level access control yet.** Row Level Security is disabled on all data tables (`bookings`, `clients`, `projects`, `milestones`, `meetings`, `quotes`, `files`); the `admins` table has RLS on but with a permissive `select using (true)` policy. Per-row policies are planned for a later phase.
- **No private file storage.** The `files`, `meetings`, and `quotes` storage buckets are public; documents are reachable by URL. Private buckets with signed URLs are a future phase.
- **No server-side data layer.** All data access is client-side through a single shared Supabase browser client using the public anon/publishable key. There are no server-side keys and no API routes for validation.
- **No real-time chat.** The earlier mock chat UI was deliberately replaced by the structured meeting log with approvals and comments; free-form chat is not a goal.
- **Schema is not reproducible from the repo.** There is no `migrations/` directory; almost all schema was hand-typed into the Supabase SQL editor. Only `supabase/admins.sql` is committed. Reproducible migrations are not yet in scope.
- **No automated tests.** No test runner is configured. (A CI gate covering typecheck and build is being introduced this session; lint runs in warn mode pending fixes.)
- **Single firm, single admin.** The platform serves one design-and-build firm with one owner/admin account. It is not a multi-tenant product for multiple firms.
