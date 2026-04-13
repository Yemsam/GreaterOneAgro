create extension if not exists pgcrypto;

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  company_name text,
  website_url text,
  project_type text,
  budget text,
  timeline text,
  message text not null,
  source text not null default 'website'
);

create index if not exists idx_contact_submissions_created_at
  on public.contact_submissions (created_at desc);

create index if not exists idx_contact_submissions_email
  on public.contact_submissions (email);

alter table public.contact_submissions enable row level security;

-- Public users cannot read/write directly from browser to this table.
create policy if not exists "deny_all_contact_submissions"
on public.contact_submissions
for all
to public
using (false)
with check (false);
