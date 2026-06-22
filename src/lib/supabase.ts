import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Creates a unified Supabase Browser Client.
 * 
 * This client is SSR-compatible and uses cookies to persist the session.
 * We use a factory function so `createBrowserClient` can handle internal
 * memoization correctly, reducing orphaned locks in React Strict Mode.
 */
export const createSupabaseBrowserClient = () => {
    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    );
};

// For backwards compatibility where a single export was used.
// NOTE: Prefer using `createClient()` from `@/utils/supabase/client` in components.
export const supabase = createSupabaseBrowserClient();
