-- ============================================================================
-- Migration 0005 — Proposal PDF + meeting Drive link (v4.3.0)
-- ----------------------------------------------------------------------------
-- proposals.pdf_url  — a generated quotation PDF (with 15% VAT) attached to the
--                      proposal, downloadable by the client alongside approve/reject.
-- meetings.drive_link — a Google Drive link on an internal meeting note (staff-only).
-- Additive & idempotent.
-- ============================================================================

alter table public.proposals add column if not exists pdf_url    text;
alter table public.meetings  add column if not exists drive_link text;
