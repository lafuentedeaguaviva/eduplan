import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Unified Supabase Browser Client.
 * 
 * This client is SSR-compatible and uses cookies to persist the session.
 * By unifying the client here, we ensure that both Auth pages and 
 * Data services (Profile, Pdc, etc.) share the same authentication state.
 */
export const supabase = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
);
