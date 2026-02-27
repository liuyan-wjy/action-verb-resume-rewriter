import { createServerClient } from '@supabase/ssr';
import { createClient as createServiceSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA ?? 'avr';

function getServiceConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, serviceRole };
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore cookie mutation failures in readonly contexts.
        }
      }
    },
    db: { schema: SCHEMA }
  });
}

export function createServiceClient() {
  const { url, serviceRole } = getServiceConfig();

  if (!url || !serviceRole) {
    return null;
  }

  return createServiceSupabaseClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    db: { schema: SCHEMA }
  });
}

export function hasServiceClientConfig() {
  const { url, serviceRole } = getServiceConfig();
  return Boolean(url && serviceRole);
}

export function createServiceClientOrThrow() {
  const client = createServiceClient();
  if (!client) {
    throw new Error('Supabase service role is not configured.');
  }
  return client;
}
