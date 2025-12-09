-- Supabase/Postgres initialization for Billing System

-- Enable extensions if not already available
create extension if not exists "uuid-ossp";

-- PRODUCTS TABLE
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text,
  description text,
  cp numeric(12,2) default 0,
  sp numeric(12,2) default 0,
  created_at timestamptz default now()
);

create index if not exists idx_products_created_at on public.products (created_at);
create index if not exists idx_products_name on public.products (name);
create index if not exists idx_products_description on public.products using gin (to_tsvector('english', coalesce(description,'')));

-- BILLING HISTORY TABLE
create table if not exists public.billing_history (
  id uuid primary key default uuid_generate_v4(),
  bill_no text,
  customer_name text,
  bill_from text,
  items jsonb not null default '[]'::jsonb,
  total numeric(12,2) default 0,
  paid numeric(12,2),
  balance numeric(12,2),
  savings numeric(12,2) default 0,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_bh_created_at on public.billing_history (created_at);
create index if not exists idx_bh_customer_name on public.billing_history (customer_name);
create index if not exists idx_bh_bill_no on public.billing_history (bill_no);
create index if not exists idx_bh_items_gin on public.billing_history using gin (items);

-- Optional: RLS can be configured in Supabase dashboard if needed.
