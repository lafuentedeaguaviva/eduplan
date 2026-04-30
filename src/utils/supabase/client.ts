import { supabase } from '@/lib/supabase';

/**
 * Proxy for the unified Supabase Browser Client.
 * Kept for backward compatibility with components using @/utils/supabase/client.
 */
export function createClient() {
    return supabase;
}
