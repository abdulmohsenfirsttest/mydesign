-- ============================================================================
-- Migration 0008 — Storage DELETE/UPDATE policies for the three buckets
-- ----------------------------------------------------------------------------
-- Discovered while re-verifying the team's "still can't upload" report
-- (2026-07-19): storage.objects only ever had INSERT + SELECT policies for the
-- files/meetings/quotes buckets. DELETE (and UPDATE) were never granted, so
-- every storage.remove() in the app — the Upload Files page's delete button —
-- failed with a 400 that the code discards, leaving orphaned objects in the
-- bucket while the metadata row was removed. (This is why orphans accumulated;
-- see BUG-012.) Uploads themselves were unaffected: verified live that anon
-- INSERT to storage and INSERT to public.files both succeed.
--
-- This adds the missing DELETE + UPDATE policies, matching the existing
-- permissive "Public insert/read" posture until Security Phase 2 tightens all
-- storage access together (private buckets + signed URLs). Idempotent.
-- ============================================================================

do $$
declare b text;
begin
  foreach b in array array['files','meetings','quotes'] loop
    if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Public delete '||b) then
      execute format('create policy %I on storage.objects for delete using (bucket_id = %L)', 'Public delete '||b, b);
    end if;
    if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Public update '||b) then
      execute format('create policy %I on storage.objects for update using (bucket_id = %L) with check (bucket_id = %L)', 'Public update '||b, b, b);
    end if;
  end loop;
end $$;
