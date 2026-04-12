create extension if not exists pgcrypto;

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reference text not null unique,
  status text not null default 'pending',
  customer_email text not null,
  customer_name text not null,
  package_id text not null,
  package_title text not null,
  amount_ngn integer not null,
  amount_paid_kobo bigint,
  notes text,
  paid_at timestamptz,
  gateway_status text,
  gateway_channel text,
  gateway_access_code text,
  gateway_authorization_url text,
  gateway_error text
);

create index if not exists idx_payment_orders_status_created
  on public.payment_orders (status, created_at desc);

create index if not exists idx_payment_orders_email
  on public.payment_orders (customer_email);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_id text not null unique,
  event_type text not null,
  reference text not null,
  raw_payload jsonb not null,
  constraint fk_payment_events_reference
    foreign key (reference)
    references public.payment_orders(reference)
    on delete cascade
);

create index if not exists idx_payment_events_reference
  on public.payment_events (reference, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_payment_orders_updated_at on public.payment_orders;
create trigger trg_payment_orders_updated_at
before update on public.payment_orders
for each row
execute function public.set_updated_at();

alter table public.payment_orders enable row level security;
alter table public.payment_events enable row level security;

-- Public clients cannot directly access payment tables.
create policy if not exists "deny_all_payment_orders"
on public.payment_orders
for all
to public
using (false)
with check (false);

create policy if not exists "deny_all_payment_events"
on public.payment_events
for all
to public
using (false)
with check (false);
