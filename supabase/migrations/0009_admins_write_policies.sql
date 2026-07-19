-- ============================================================================
-- Migration 0009 — Write policies on public.admins (staff management) — v4.8.2
-- ----------------------------------------------------------------------------
-- The admins table had RLS ON with only a SELECT policy (admins_select using
-- true) — login (a read) worked, but the Staff & Permissions page could not
-- INSERT / UPDATE / DELETE staff: "new row violates row-level security policy
-- for table admins". Existing staff had to be seeded directly via SQL.
--
-- Owner chose (2026-07-19) to unblock self-service staff management now, matching
-- the app's current pre-launch anon-key posture. These policies allow the anon
-- role to write admins.
--
-- ⚠️ SECURITY DEBT (tracked in SECURITY.md): the public anon key ships in every
-- browser, so with these policies anyone holding it can create/modify a staff
-- (incl. manager) account. Acceptable ONLY for this pre-launch/demo build.
-- Security Phase 2 MUST replace this with server-side (service-role) staff
-- management + hashed credentials and remove the anon read/write on admins.
-- Idempotent.
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='admins' and policyname='admins_insert') then
    create policy admins_insert on public.admins for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='admins' and policyname='admins_update') then
    create policy admins_update on public.admins for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='admins' and policyname='admins_delete') then
    create policy admins_delete on public.admins for delete using (true);
  end if;
end $$;
