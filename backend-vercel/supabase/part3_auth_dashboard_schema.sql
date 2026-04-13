create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  company_name text,
  phone text
);

create or replace function public.set_updated_at_profile()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at_profile();

-- Create profile row automatically when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

-- Users can view and edit only their own profile.
create policy if not exists "profile_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy if not exists "profile_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Authenticated users can insert only their own row (rare manual cases).
create policy if not exists "profile_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- Allow users to view only their own payment orders.
alter table public.payment_orders enable row level security;

create policy if not exists "payment_orders_select_own"
on public.payment_orders
for select
to authenticated
using (lower(customer_email) = lower(auth.jwt() ->> 'email'));

-- Allow users to view only events tied to their own references.
alter table public.payment_events enable row level security;

create policy if not exists "payment_events_select_own"
on public.payment_events
for select
to authenticated
using (
  exists (
    select 1
    from public.payment_orders po
    where po.reference = payment_events.reference
      and lower(po.customer_email) = lower(auth.jwt() ->> 'email')
  )
);
