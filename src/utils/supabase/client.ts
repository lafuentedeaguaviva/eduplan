import { createSupabaseBrowserClient } from '@/lib/supabase';

/**
 * Proxy for the unified Supabase Browser Client.
 * Creates a client using `@supabase/ssr` to prevent React Strict Mode lock issues.
 */
export function createClient() {
    return createSupabaseBrowserClient();
}
