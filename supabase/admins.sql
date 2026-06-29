-- MyDesign: admins table for phone-based admin login
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query -> Run).

create table if not exists public.admins (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null unique,
  password   text not null,
  created_at timestamptz not null default now()
);

-- Allow the anon key to validate logins (mirrors the existing clients table).
alter table public.admins enable row level security;

drop policy if exists "admins_select" on public.admins;
create policy "admins_select" on public.admins
  for select using (true);

-- Seed the owner admin account.
insert into public.admins (name, phone, password)
values ('Owner', '0547080147', '123123')
on conflict (phone) do update set password = excluded.password, name = excluded.name;
