# MyDesign — Code Health

Maintainer: Abdulmohsen · Repo: `/Users/bsebsa/mydesign` · GitHub: `abdulmohsenfirsttest/mydesign` (private) · Live: https://mydesign-blush.vercel.app

Stack: Next.js 16.2.7 (App Router, Turbopack), React 19.2.4, Tailwind CSS v4, TypeScript 5.9, Supabase JS v2.107. 23 routes built.

This document covers the day-to-day health of the codebase: what the current state is, what is broken, and the checks we run so it stays healthy. Security findings are tracked separately in the security document in this folder; the high-level risks are referenced here where they intersect with code health.

---

## 1. Current health snapshot (2026-06-29)

| Check | Tool | Result | Notes |
|---|---|---|---|
| Build | `next build` | PASS | Compiles successfully. 23 routes. ~2.3s compile time. |
| Types | `tsc --noEmit` | PASS | Exits clean, no type errors. |
| Lint | `eslint` | WARN-only in changed files | The 3 documented `app/admin/messages/page.tsx` errors are **cleared** (v3.3.0). Remaining errors are pre-existing in `app/dashboard/*` (set-state-in-effect, two `any`); CI lint stays in warn mode until those are fixed. |
| Dependency audit | `npm audit` | 2 MODERATE | `postcss <8.5.10` (XSS via unescaped `</style>` in CSS stringify), pulled in transitively through Next.js's bundled postcss. Build-time only. Do NOT run `npm audit fix --force` (it downgrades Next to 9.x). |
| Outdated deps | `npm outdated` | Safe patch bumps available | `next 16.2.7 → 16.2.9`, `@supabase/supabase-js 2.107 → 2.108.2`, `tailwindcss 4.3.0 → 4.3.1`, `eslint-config-next 16.2.7 → 16.2.9`, plus `@types/react` / `@types/node` patches. HOLD majors: `eslint 9 → 10`, `typescript 5 → 6`, `@types/node 20 → 26`. |
| Version control | `git status` | CLEAN | Committed `7e3c7c8` (2026-06-29, tag `v3.3.0`), pushed to GitHub. v3.2.0 + Meeting-3 Increment 1 are now in git; production matches git. `.backups/` is now gitignored. The #1 health risk is closed. |
| Tests | — | NONE | No test runner configured. Zero automated tests. |
| CI | GitHub Actions | BEING ADDED | No CI before this session. A gate is added this session: typecheck + build blocking, lint in warn mode. See section 4. |

Overall: the application compiles, type-checks, and runs in production. The deployed-but-uncommitted-work problem is now **resolved** (committed as `v3.3.0` / `7e3c7c8`). The remaining gaps are the absence of automated tests, a few pre-existing lint errors in `app/dashboard/*` (keeping CI lint in warn mode), and the still-pending security hardening tracked in SECURITY.md.

---

## 2. Open issues & fixes

### 2.1 ESLint errors (3, all in `app/admin/messages/page.tsx`)

| # | Location | Rule | Fix |
|---|---|---|---|
| 1 | line 76:41 | `@typescript-eslint/no-explicit-any` | Replace the `any` with a real type. The value is a Supabase row / payload — type it explicitly (e.g. a `Meeting` / `Milestone` interface, or `Record<string, unknown>` if the shape is genuinely dynamic) instead of `any`. |
| 2 | line 90:5 | `react-hooks` (use-before-declare) | `fetchMeetings` is called inside a `useEffect` before it is declared. Move the function declaration above the `useEffect`, or wrap it in `useCallback` and declare it before the effect that calls it. |
| 3 | line 91:5 | `react-hooks` (use-before-declare) | Same as #2 for `fetchMilestones`. The new react-hooks rule flags function-hoisting that the effect relies on; declare both fetchers before the `useEffect` that invokes them (and add them to the dependency array). |

These are the **only** lint errors in the codebase. Clearing all three is the precondition for flipping CI lint from warn to blocking (section 4).

### 2.2 Uncommitted-work risk (the #1 health risk) — ✅ RESOLVED 2026-06-29

**Resolved:** committed as `7e3c7c8` (tag `v3.3.0`) and pushed to GitHub; `.backups/` is now gitignored (it held plaintext credentials). The analysis below is kept for the record.

The entire **v3.2.0** surface — quotes table + builder + quotes bucket, per-project milestones, the dedicated files page + files bucket, the meeting hub (file upload/download, client comments, approve/unapprove), Supabase Realtime live-sync across all admin pages, the `admins` table for phone-based admin login, and a local JSON account backup — is **deployed to production** (`vercel --prod`) but **not committed to git**. Last commit is `3af643c` from 2026-06-03; ~19 files / ~1,800 changed lines and the untracked `supabase/admins.sql` are sitting only in the working tree.

Risk: production is running code that exists in exactly one place — this laptop's working directory. A disk loss, a bad `git checkout`, or an accidental revert wipes ~3 weeks of shipped work with no recovery path. The repo no longer describes what is live.

Fix (Phase 1, do now): commit the v3.2.0 working set, including `supabase/admins.sql`; tag it `v3.2.0`; push to GitHub; write the session record (SES-2026-…) that documents it. Decide whether `.backups/` belongs in the repo or in `.gitignore` (it contains an account backup — keep it out of git and rely on the off-repo backup routine).

### 2.3 Missing tests

There is no test runner and zero automated tests. Every regression today is caught only by manual clicking or by a user noticing in production. There is no guard against, for example, the meeting approve/unapprove flow silently breaking, or a booking failing to write a row. See section 5 for what to add first.

### 2.4 Missing `migrations/`

There is **no `migrations/` directory**. Almost all schema (bookings, clients, projects, milestones, meetings, quotes, files, and all RLS posture) was hand-typed directly into the Supabase SQL editor. The **only** committed DDL is `supabase/admins.sql`. Consequence: the database schema is **not reproducible from the repo** — if the Supabase project were lost, the schema could not be rebuilt from source control.

Fix: start a `supabase/migrations/` directory (or at minimum a `supabase/schema.sql` snapshot). Going forward, every schema change is written as a `.sql` file in the repo first, then applied — never hand-typed-only again. Backfill the current live schema into one baseline snapshot file so the repo finally describes the real database.

---

## 3. Standing checks to run on every change

Run these before considering any change done. The first four are fast and should be automatic; the last two are discipline.

1. **Static analysis & linting** — `npm run lint` (`eslint`). Must be clean. While the 3 known errors in `app/admin/messages/page.tsx` are still open, lint is allowed to fail in CI (warn mode) but **do not add new lint errors** on top of the known three.
2. **Type check** — `tsc --noEmit`. Must pass. This is currently green; keep it green.
3. **Dependency audit** — `npm audit`. Review new findings. **Hard rules:** never run `npm audit fix --force` (it would downgrade Next to 9.x and break the app); never downgrade Next to satisfy the audit. The current `postcss` moderate is build-time only and is accepted — same posture as the sibling Favor Plus project. Apply only the safe patch/minor bumps listed in section 1; hold all majors.
4. **Production build** — `next build`. Must compile, and the route count should stay at 23 unless a route was intentionally added or removed (a change in route count is a signal — confirm it's intended).
5. **Performance** — sanity-check before shipping anything user-facing: run a Lighthouse pass on the landing page and `/dashboard`, confirm the route count hasn't ballooned, and check that any newly added images are reasonably sized (the site is a black/white luxury aesthetic with photography — oversized images are the main weight risk; keep them compressed).
6. **Version-control discipline** — commit each version with its `vX.Y.Z` tag, and write a session record for the work. Nothing ships to production that isn't in git. This is the rule that section 2.2 exists because we broke; it is non-negotiable going forward.

---

## 4. CI/CD

### GitHub Actions gate (added this session)

A GitHub Actions workflow runs on every push and pull request. It applies the guide's **"warn before you enforce"** gate — a new blocking rule starts in warn mode and is promoted to blocking only once the codebase is clean enough to pass it.

| Job | Mode | Behaviour |
|---|---|---|
| Type check (`tsc --noEmit`) | **BLOCKING** | A type error fails the build and blocks the merge/deploy. |
| Production build (`next build`) | **BLOCKING** | A build failure fails the build and blocks the merge/deploy. |
| Lint (`eslint`) | **WARN** (`continue-on-error: true`) | Runs and reports, but does **not** fail the build — because the 3 known errors in `app/admin/messages/page.tsx` would otherwise block everything. |

**Promotion path:** once the 3 lint errors in section 2.1 are fixed and lint is clean, remove `continue-on-error` from the lint job so lint becomes **BLOCKING** like the other two. That flip is the whole point of warn mode — we warn first, clean up, then enforce.

### Auto-deploy

Vercel is connected to the GitHub repo and **auto-deploys on every push to `main`**. Manual production deploys are available via `~/.npm-global/bin/vercel --prod`. Because the GitHub gate runs on the push, the typecheck + build gate sits in front of what reaches production once both run on `main`.

---

## 5. Testing guidelines

There are no tests yet. When tests are introduced, write them for the **critical paths first** — the flows where a silent break costs a real client or a real booking. UI polish and edge cases come later. Start here:

1. **Booking writes a row.** Submitting `/book` inserts a `bookings` row with the entered name/phone/email/service/date/time, and (per the auto-register flow) upserts a `clients` row on that phone with the default password. If this breaks, the firm silently loses leads.
2. **Login matches a client.** `/auth/login` with a valid phone + password finds the matching `clients` row and stores `client_id` / `client_name`; a wrong password does **not** match. This is the gate to the entire portal.
3. **Meeting approve / unapprove persists.** From the project detail page, a client approving a meeting sets `status` / `approved_at` on the `meetings` row, and unapproving clears it — and the change survives a reload (it's a real DB write, not local state). This is the core of the client-facing workflow.
4. **File upload / download.** A file uploaded in the meeting hub or files page lands in the correct storage bucket (files / meetings / quotes) and its metadata row is written, and the resulting URL actually downloads the file. This is where client documents live.

Practical first step: add a lightweight runner (Vitest) and write these four as integration tests against a **test** Supabase context, never against production data. Risky/write tests follow the safe/risky split — display-only assertions first, write-path tests behind a test environment.

---

## 6. Recurring health-check routine

A lighter-cadence mirror of the Favor Plus daily check, sized for a single-maintainer hobby-scale project. The Favor Plus rhythm is daily; MyDesign runs **weekly**, plus an always-on rule for any session that touches code.

**Every coding session (always):**
- Run the section 3 standing checks (lint, types, audit, build) before calling the work done.
- Commit and tag every version; write or update the session record. Never leave deployed work uncommitted (the section 2.2 lesson).

**Weekly health check:**
- `git status` — confirm the working tree is clean and `main` matches production. If there's uncommitted deployed work, that's the first thing to fix.
- `next build` + `tsc --noEmit` — confirm both still pass.
- `npm audit` and `npm outdated` — review new findings; apply only the safe bumps from section 1, hold majors, never `--force`.
- Confirm the off-repo account/data backup is current (the `.backups/` JSON export and any Supabase export), the same way Favor Plus verifies its daily backup.
- Glance at the security roadmap (Phase 1 → 2 → 3 in the security doc) and the open items in the latest session record — re-date or close anything that's slipped.

The goal of the routine is the same as Favor Plus's: nothing silently rots, nothing ships that isn't in git, and the documents keep describing the real system.
