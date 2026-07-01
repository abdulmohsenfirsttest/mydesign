# MyDesign — Documentation

This `docs/` folder is the operating manual and written memory for **MyDesign**, a Riyadh-based design-&-build (interior design + construction) firm platform styled after mydesign.sa. It records what was built, why, in what order, and the current health of the system, so the project can be understood and continued from the documents alone.

- **Owner / sole maintainer:** Abdulmohsen
- **Repo:** `/Users/bsebsa/mydesign` — GitHub `abdulmohsenfirsttest/mydesign` (private)
- **Live:** https://mydesign-blush.vercel.app (Vercel, auto-deploy on push to `main`; manual `vercel --prod`)
- **Stack:** Next.js 16.2.7 (App Router, Turbopack), React 19.2.4, Tailwind CSS v4, TypeScript 5.9, Supabase JS v2.107

---

## Folder structure

The folder is numbered so it reads in order: requirements → decisions → history → health.

| Folder | What it holds | Files |
|---|---|---|
| `01_Product_Requirements/` | What the product is meant to do — surfaces, routes, workflow model, data model. | Product requirements doc(s) |
| `02_Architecture_Decisions/` | One ADR per locked-in decision: the problem, the approach chosen, the consequences. | ADRs (e.g. custom phone+password auth, client-side Supabase access, 7-stage workflow) |
| `03_Version_History/` | The version log — every `vX.Y.Z` with its commit, plus per-session records under `session-records/`. | `CHANGELOG` / version log + `session-records/` (one `SES-YYYY-NNN` file per working session) |
| `04_Code_Health_&_Security/` | Build/typecheck/lint/dependency state, the security posture + roadmap, the bug log, and the backups routine. | CODE_HEALTH, SECURITY, BUGLOG, BACKUPS |

---

## The discipline

**Versioning — `vMAJOR.MINOR.PATCH`.**

- **MAJOR** = new era / breaking change (new product surface, rewrite, incompatible data model).
- **MINOR** = a feature or a batch of related work.
- **PATCH** = a fix or a small sub-step.
- **safe/risky split:** when a version has both a safe and a risky half, suffix them — `vX.Y.Za` = safe half (e.g. display only), `vX.Y.Zb` = risky half (writes data; run behind a test environment first).

**Life of a version:** question the requirement → simplify → write a version brief → get approval → build → verify against live → record.

*Version brief skeleton:* Version / Problem / Scope / Touches / Must not break / Verify.

**Two safety gates:**
1. A **test environment** before any risky change.
2. **WARN mode before you ENFORCE** — a new blocking rule (e.g. a CI gate) first runs in warn / continue-on-error mode before it is flipped to blocking.

**Every working session ends with a session record** in `03_Version_History/session-records/` (`SES-YYYY-NNN`): a Document Control block, then Summary, Versions shipped, Schema changes, Architectural decisions, Live test record, Health scan, Open items, and a version→commit appendix.

---

## When you ship a change

1. **Question and simplify** the requirement before writing code.
2. **Write a version brief** (Version / Problem / Scope / Touches / Must not break / Verify) and **get approval**.
3. Pick the version number — MAJOR / MINOR / PATCH, and split safe vs. risky (`a`/`b`) if both exist.
4. If risky: build and test it in a **test environment** first.
5. **Build**, then run the gates: `next build`, `tsc --noEmit`, lint.
6. **Verify against the live running system** (the items in the brief's Verify line).
7. Deploy (push to `main`, or `vercel --prod`).
8. **Commit to git** with the version number.
9. Update `03_Version_History` (version → commit) and `04_Code_Health_&_Security` if the build/security state changed.
10. **Write the session record** before you stop.
11. **Mirror `docs/` to Google Drive** (see below).

---

## Current status

- **Current version:** `v4.3.0` — hub polish: meetings are staff-internal (+ Drive link), the proposal carries a quotation **PDF with 15% VAT** to the client, milestones gain a **"Skipped"** status; removed the Quotes tab + manual stage dropdown. Committed `2d7fc72`, deployed. (On top of v4.2.0 permissions / v4.0.0 Meeting-3 workflow; enforcement client-side, Security Phase 2 pending — ADR-0010.)
- **Last session record:** `SES-2026-007`
- **Next session record:** `SES-2026-008`

---

## Mirror to Google Drive

This `docs/` tree is mirrored to Google Drive in the folder **"mydesign"**. Keep the two in sync — when you add or update a document here, copy it to the Drive mirror so the written record survives independently of the repo.
