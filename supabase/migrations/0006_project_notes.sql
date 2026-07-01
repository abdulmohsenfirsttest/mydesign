-- ============================================================================
-- Migration 0006 — Internal project notes (staff-only) — v4.4.0
-- ----------------------------------------------------------------------------
-- A staff-only notes thread shown beside the proposal in the Project Hub. Never
-- surfaced on the client portal. (Like the rest of the app it lives on the anon
-- key with RLS off — the client UI simply never renders it; true hiding is
-- Security Phase 2.)  Additive & idempotent.
-- ============================================================================

create table if not exists public.project_notes (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  author_id   uuid references public.admins(id) on delete set null,
  author_name text,
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists project_notes_project_id_idx on public.project_notes (project_id);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='project_notes') then
    alter publication supabase_realtime add table public.project_notes;
  end if;
end $$;
