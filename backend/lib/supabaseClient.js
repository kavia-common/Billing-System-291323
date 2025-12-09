import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client for server-side usage.
 * Reads SUPABASE_URL and SUPABASE_KEY from environment.
 * Do not expose this client directly in frontend; the backend API will act as a proxy.
 */

// PUBLIC_INTERFACE
export function getSupabaseClient() {
  /** Returns a configured Supabase client using server env vars. */
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_KEY. Please set them in the environment.');
  }

  // Use service role key if provided, otherwise anon key.
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: { 'X-Client-Info': 'billing-system-backend' },
    },
  });
}
