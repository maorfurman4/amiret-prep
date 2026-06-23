import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Returns both an auth client (reads user session from cookies)
 * and an admin client (service role, bypasses RLS — safe to use only in server routes).
 * Pattern: use authClient only for getUser(), use supabase (admin) for all DB queries.
 */
export async function getServerClients() {
  const [authClient, adminClient] = await Promise.all([
    createServerSupabaseClient(),
    createAdminSupabaseClient(),
  ]);
  return { authClient, supabase: adminClient };
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export async function createAdminSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-service-key',
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
