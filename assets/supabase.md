# Supabase Integration Guide

This project uses Supabase (Postgres) instead of MongoDB for persistence.

## Environment Variables (Backend)

Set these in Billing-System-291323/backend/.env (or provide in deployment environment):

- PORT: The port for Express to listen on. Defaults to 3001 if not set.
- SUPABASE_URL: Supabase project URL (Settings → API → Project URL)
- SUPABASE_KEY: Supabase service role key (recommended for server-side) or anon key

Never commit your real .env. See backend/.env.example for the template.

## Initial Database Setup

You must apply the SQL from `backend/scripts/supabase_init.sql` in your Supabase project:

Option A – Supabase SQL Editor (recommended)
1. Open Supabase Dashboard → SQL Editor.
2. Copy the full contents of `backend/scripts/supabase_init.sql`.
3. Execute the script.
4. You should see:
   - Tables created (if not already present):
     - public.products
     - public.billing_history
   - Indexes created on the above tables
   - Extension `uuid-ossp` enabled

Option B – psql
- If you have a direct Postgres connection string, run each statement in `supabase_init.sql` using psql, one at a time. Ensure you run CREATE EXTENSION and each CREATE TABLE/INDEX individually.

SQL to run (for convenience; identical to backend/scripts/supabase_init.sql):
- Enable extension:
  - create extension if not exists "uuid-ossp";
- Create tables:
  - public.products (id uuid default uuid_generate_v4(), name, description, cp, sp, created_at)
  - public.billing_history (id uuid default uuid_generate_v4(), bill_no, customer_name, bill_from, items jsonb default '[]', total, paid, balance, savings, notes, created_at)
- Create indexes:
  - idx_products_created_at, idx_products_name, idx_products_description
  - idx_bh_created_at, idx_bh_customer_name, idx_bh_bill_no, idx_bh_items_gin

## Optional: Helper RPC for automation

If you want tool-based automation via PostgREST (used by setup tools), create the following helper function once in your project (run in SQL Editor):

create or replace function public.run_sql(sql text)
returns json
language plpgsql
as $$
begin
  execute sql;
  return json_build_object('ok', true);
exception when others then
  return json_build_object('ok', false, 'error', SQLERRM);
end;
$$;

This enables automated tooling to execute SQL statements on your project.

## Row Level Security (RLS)

This backend uses the service role key server-side and does not rely on RLS for public access. If you enable RLS, ensure appropriate policies for `products` and `billing_history` for your service role or specific roles as needed.

## Health and Diagnostics

- GET /health — readiness check; reports:
  - status: ok
  - port
  - supabaseEnv: { hasUrl, hasKey }
  - warnings: array of non-fatal warnings

- GET /api/meta/config — non-sensitive flags:
  - supabaseConfigured: boolean (true if both env vars present)

- GET /api/product/ping and GET /api/billinghistory/ping — validate router mount

- POST /api/admin/db/check — probes that tables exist; returns hints to run backend/scripts/supabase_init.sql if missing.

If API responses indicate relation “products” or “billing_history” does not exist, you likely need to run the SQL above.

## Notes

- The backend acts as a proxy to Supabase; do not use Supabase client from frontend.
- Prefer service role key with RLS configured in Supabase.
- The controllers return messages compatible with existing frontend expectations.

## Verifying Backend Health

- Ensure you’ve set environment variables in Billing-System-291323/backend/.env:
  - PORT=3001
  - SUPABASE_URL="https://<your-project>.supabase.co"
  - SUPABASE_KEY="<service-role-or-anon-key>"

- Start backend (from Billing-System-291323/backend):
  - npm install
  - npm run start

- Check:
  - GET http://localhost:3001/health should return JSON with status: "ok".
  - POST http://localhost:3001/api/admin/db/check should return ok: true when tables exist.
