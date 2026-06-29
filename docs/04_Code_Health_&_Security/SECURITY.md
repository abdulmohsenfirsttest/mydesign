# SECURITY.md — MyDesign

| | |
|---|---|
| **Document** | Security Posture & Remediation |
| **Project** | MyDesign (My Design / Design & Build) |
| **Owner** | Abdulmohsen |
| **Date** | 2026-06-29 |
| **Status** | Early-stage build — active security debt, not yet client-ready |
| **Live** | https://mydesign-blush.vercel.app |
| **Supabase ref** | ijtgwmqrxminwypracei |

## 1. Summary of current posture

MyDesign is an early-stage build, and it currently carries real, unresolved security debt that must be closed before any real client data lives on it. All data access runs client-side through a single shared Supabase browser client using the public anon key, and Row Level Security is disabled on every data table — so anyone who holds that anon key (which is shipped to every browser, and was additionally pasted in plaintext in a prior chat) can read and write clients, projects, meetings, quotes, files, bookings, milestones, and spaces at will. Passwords for both clients and admins are stored in plaintext, the admins table is readable by the anon key through a `using (true)` policy, the storage buckets holding client documents are public, and the custom auth does its phone+password check in the browser with no hashing, no rate limiting, and no real session expiry. None of this is acceptable for production use with paying clients. The good news is that the failure mode is consistent and well-understood, the fixes are standard Supabase hardening, and they are sequenced below into three phases applying warn-before-enforce so nothing breaks the live portal during the lockdown. Treat the platform as a demo/internal build until at least Phase 2 is complete.

## 2. Findings

| # | Severity | Finding | Impact |
|---|----------|---------|--------|
| 1 | **CRITICAL** | RLS disabled on all data tables (bookings, clients, projects, milestones, meetings, quotes, files, spaces). | Anyone holding the public anon key can read **and write** every row in every table — full read/write of all client and project data with no per-row restriction. |
| 2 | **CRITICAL** | Passwords stored in plaintext in `clients` and `admins` (client default `123123`; owner seeded in `admins`). | Any read of these tables exposes usable login credentials directly. No hashing means a single table leak hands over every account. |
| 3 | **CRITICAL** | `admins` table RLS policy is `admins_select for select using (true)`. | RLS is technically enabled but the policy lets the anon key read admin `name` / `phone` / **plaintext password** — i.e. owner credentials are exposed to any browser. |
| 4 | **HIGH** | Anon/publishable key + project ref were pasted in plaintext in a prior chat session. | The key is already outside its intended boundary and should be assumed compromised; it must be rotated and the project locked down so the key alone grants no useful access. |
| 5 | **HIGH** | Storage buckets `files`, `meetings`, `quotes` are public. | Client documents (uploads, meeting attachments, quote PDFs) are reachable by anyone with the URL — no auth, no signing, no expiry. |
| 6 | **HIGH** | Custom auth compares phone+password client-side; no hashing, no rate limiting, no real session expiry. | Credentials are checked in the browser (`.eq('phone').eq('password')`); brute force is unthrottled and "logged in" is just a `localStorage` flag (`client_id` / `admin_session`) that never expires and can be set by hand. |

## 3. Remediation roadmap (warn before you enforce)

The order matters: stop the bleeding and get the code under version control first, then enforce RLS and proper auth, then add the operational hardening. Each enforcing change (RLS, private buckets) should be applied in a test environment first and watched in a non-breaking mode before it is flipped on in production, mirroring the warn-before-enforce gate used on Favor Plus and PHSN.

### Phase 1 — Now (stop the bleeding, get under control)

- [x] **Done (2026-06-29).** Committed the v3.2.0 working set (plus Meeting-3 Increment 1) as `7e3c7c8`, tagged `v3.3.0`, pushed to GitHub. The deployed surface now matches git; the #1 health risk is closed.
- [ ] Rotate the Supabase anon/publishable key (assume it is compromised after the plaintext chat paste) and update `NEXT_PUBLIC_*` in `.env.local` and Vercel.
- [ ] Restrict the `admins` table so the anon key cannot read it. Drop the `using (true)` select policy; admin reads move to service-role / server-side only. The anon key must never be able to read admin credentials.

### Phase 2 — Enforce (the actual lockdown)

- [ ] Enable RLS on **every** data table (bookings, clients, projects, milestones, meetings, quotes, files, **spaces**) with proper per-row policies so a client can only see their own rows and the anon key can write nothing it shouldn't. Test in a branch/test environment before flipping in production.
- [ ] Move validation server-side — replace the direct client-side table queries with an API route or Postgres RPC so credential checks and writes no longer happen in the browser.
- [ ] Hash passwords (bcrypt/argon2 via the server path) or, preferably, adopt Supabase Auth and retire the custom phone+password table lookup. Stop storing any plaintext credential.
- [ ] Make the `files`, `meetings`, and `quotes` buckets private and serve documents through short-lived signed URLs. No client document should be reachable by raw public URL.

### Phase 3 — Harden (operational maturity)

- [ ] Add rate limiting to the auth path (per-phone / per-IP) so brute force is throttled.
- [ ] Implement real session expiry — replace the bare `localStorage` flag with expiring tokens (a natural outcome of adopting Supabase Auth).
- [ ] Add audit logging for admin actions and sensitive writes (who changed what, when).

## 4. Security baseline to maintain going forward

This is what "good" looks like once Phase 2 is complete, and the bar every future change must clear:

- **RLS on every table.** Every data table has Row Level Security enabled with explicit per-row policies. No table is ever left open; a new table is not "done" until its policies exist. The anon key can do only what an unauthenticated visitor is allowed to do.
- **Server-side validation.** All credential checks and sensitive writes go through an API route or Postgres RPC. The browser never queries tables directly for auth, and never trusts client-supplied identity.
- **Hashed credentials or Supabase Auth.** No plaintext passwords anywhere. Either credentials are hashed server-side (bcrypt/argon2) or the app uses Supabase Auth and stores no passwords of its own.
- **Private buckets + signed URLs.** Storage buckets are private; client documents are served only via short-lived signed URLs. No document is reachable by a guessable or shared public URL.
- **Secrets only in env / rotated.** Keys live in `.env.local` and Vercel environment variables, never in source, chat, or commits. Any key that has leaked is rotated. The service-role key is never exposed to the browser.
- **HTTPS via Vercel.** All traffic is served over HTTPS through Vercel; no plaintext transport.
