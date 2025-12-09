# Supabase Integration Guide

This project uses Supabase (Postgres) instead of MongoDB for persistence.

## Environment Variables (Backend)

Set these in Billing-System-291323/backend/.env (or provide in deployment environment):

- PORT: The port for Express to listen on. Defaults to 3001 if not set.
- SUPABASE_URL: Supabase project URL (Settings -> API -> Project URL)
- SUPABASE_KEY: Supabase service role key (recommended for server-side) or anon key

Never commit your real .env. See backend/.env.example for the template.

## Initial Database Setup

Run the SQL in backend/scripts/supabase_init.sql in the Supabase SQL editor:

- Creates tables:
  - public.products
  - public.billing_history
- Ensures useful indexes

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
