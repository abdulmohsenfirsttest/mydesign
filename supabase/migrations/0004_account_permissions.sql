-- ============================================================================
-- Migration 0004 — Owner-configurable per-account permissions (v4.2.0)
-- ----------------------------------------------------------------------------
-- Each admin gets an optional `permissions` array of area keys (which admin
-- sections they can see). NULL = fall back to the role's default areas.
-- The owner sets these per account in the Staff page.
-- Additive & idempotent.
-- ============================================================================

alter table public.admins add column if not exists permissions jsonb;
