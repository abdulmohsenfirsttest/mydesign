-- ============================================================================
-- Migration 0002 — Meeting-3 full workflow (v4.0.0)
-- ----------------------------------------------------------------------------
-- Staff roles + assignment, the internal-vs-client quote split, the client
-- proposal, and milestone delivery. All additive & idempotent (new nullable
-- columns / new tables), so it cannot break the live app or existing data.
--
-- NOTE on RLS: the new tables are created with RLS disabled to match the
-- existing data tables (ADR-0002 / SECURITY.md known debt). In particular
-- `internal_quotes` holds the staff-only price/sqm — it is hidden in the UI,
-- but truly hiding it from a client requires the Phase-2 RLS/server-side work.
-- Add per-row policies for internal_quotes/proposals in Security Phase 2.
-- ============================================================================

-- 1. Staff roles ------------------------------------------------------------
-- 'manager' (owner), 'designer', 'project_manager'
alter table public.admins add column if not exists role text not null default 'manager';

-- 2. Project service, track, and assignment ---------------------------------
alter table public.projects add column if not exists service     text;
alter table public.projects add column if not exists track       text not null default 'design'; -- 'design' | 'management'
alter table public.projects add column if not exists designer_id uuid references public.admins(id) on delete set null;
alter table public.projects add column if not exists pm_id       uuid references public.admins(id) on delete set null;

-- 3. Internal quotes (staff-only: price/sqm + Manager approval) --------------
create table if not exists public.internal_quotes (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  sqm_total     numeric(10,2) not null default 0,
  price_per_sqm numeric(10,2) not null default 0,
  total         numeric(12,2) not null default 0,
  status        text not null default 'pending',   -- 'pending' | 'approved'
  requested_by  uuid references public.admins(id) on delete set null,
  approved_by   uuid references public.admins(id) on delete set null,
  created_at    timestamptz not null default now(),
  approved_at   timestamptz
);
create index if not exists internal_quotes_project_id_idx on public.internal_quotes (project_id);
-- One internal quote per project (prevents duplicate/racing pending rows; the hub
-- gate and the pricing queue then agree on a single canonical row).
create unique index if not exists internal_quotes_project_uniq on public.internal_quotes (project_id);

-- 4. Proposals (client-facing: Scope / Stages / Pricing / T&C + decision) ----
create table if not exists public.proposals (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  scope          text,
  stages         text,
  pricing        text,
  terms          text,
  status         text not null default 'draft',     -- 'draft' | 'sent' | 'approved' | 'rejected'
  client_comment text,
  sent_at        timestamptz,
  decided_at     timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists proposals_project_id_idx on public.proposals (project_id);

-- 5. Milestone delivery: attachments + bundle grouping ----------------------
alter table public.milestones add column if not exists files  jsonb not null default '[]'::jsonb;
alter table public.milestones add column if not exists bundle text; -- e.g. 'moodboard-2d' groups Mood Board + 2D into one gate

-- 6. Seed the owner as a manager --------------------------------------------
update public.admins set role = 'manager' where phone = '0547080147';

-- 7. Realtime for the new tables --------------------------------------------
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='internal_quotes') then
    alter publication supabase_realtime add table public.internal_quotes;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='proposals') then
    alter publication supabase_realtime add table public.proposals;
  end if;
end $$;
