-- ============================================================================
-- Migration 0001 — Meeting-3 foundation (Phase 1 intake)
-- ----------------------------------------------------------------------------
-- Adds the schema for the first Meeting-3 increment:
--   1. spaces            — per-project rooms/areas with square-meter (sqm) sizes
--   2. milestones.start_date / end_date — every milestone gets a Start + End date
--
-- This change is PURELY ADDITIVE and idempotent:
--   * a brand-new table (touches no existing data)
--   * two new NULLABLE columns on milestones (existing rows stay valid)
-- So it cannot break the live app or any existing read/write.
--
-- NOTE on RLS: like every other data table in this project today, `spaces`
-- is created with Row Level Security DISABLED, so the anon key can read/write
-- it — matching the current architecture (see ADR-0002 / SECURITY.md). This is
-- known debt; `spaces` must get proper per-row policies in Security Phase 2
-- alongside the other tables. It is called out here so it is not forgotten.
--
-- Apply with the Supabase CLI (`supabase db push`) or paste into the SQL editor.
-- Do NOT apply to production until the owner has approved this increment.
-- ============================================================================

-- 1. Spaces -----------------------------------------------------------------
create table if not exists public.spaces (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  name        text not null,                 -- e.g. "Majlis", "Kitchen", "Exterior façade"
  sqm         numeric(10,2) not null default 0 check (sqm >= 0),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists spaces_project_id_idx on public.spaces (project_id);

-- 2. Milestone Start + End dates --------------------------------------------
-- Meeting-3 rule: every milestone must have a clearly defined Start and End date.
-- Kept nullable so existing milestones (which only have due_date) remain valid;
-- the admin form enforces both on new milestones. due_date is left in place and
-- is now set equal to end_date on new inserts for backward-compatible displays.
alter table public.milestones add column if not exists start_date date;
alter table public.milestones add column if not exists end_date   date;

-- 3. Realtime ---------------------------------------------------------------
-- The admin hub subscribes to postgres_changes on `spaces`. Supabase Realtime
-- only streams tables that belong to the `supabase_realtime` publication, and a
-- table created via SQL is NOT auto-added — so without this the spaces live-sync
-- channel would silently never fire. Added idempotently to match the sibling
-- tables (meetings / milestones / quotes) the hub already subscribes to.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'spaces'
  ) then
    alter publication supabase_realtime add table public.spaces;
  end if;
end $$;
