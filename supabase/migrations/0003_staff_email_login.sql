-- ============================================================================
-- Migration 0003 — Staff email + email-or-phone login (v4.1.0)
-- ----------------------------------------------------------------------------
-- Staff (admins) get an email and can sign in by email OR phone from the same
-- /auth/login portal as clients. Phone becomes optional (email-only staff).
-- Additive & idempotent.
-- ============================================================================

alter table public.admins add column if not exists email text;

-- Staff may sign in by email only, so phone is no longer required.
-- (Unique still allows multiple NULLs in Postgres, so email-only rows are fine.)
alter table public.admins alter column phone drop not null;

-- One admin per email (case-insensitive); multiple NULL emails are allowed.
create unique index if not exists admins_email_uniq on public.admins (lower(email));
