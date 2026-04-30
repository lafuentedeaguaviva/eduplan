import { supabase } from './supabase';

/**
 * Database Wrapper (Agnosticism Layer)
 * 
 * Clean Code: This layer abstracts the database provider (Supabase).
 * Services should use this wrapper instead of importing @supabase directly.
 * If we change the DB provider, we only update this file.
 */

export const db = {
    /**
     * Proxied from method to keep original types and behavior
     * but centralized through this wrapper.
     */
    from: (table: string) => supabase.from(table),

    /**
     * Specialized RPC calls
     */
    async rpc(fn: string, params?: any) {
        return await supabase.rpc(fn, params);
    },

    /**
     * Auth Proxy (Agnosticism layer for Auth)
     */
    get auth() {
        return supabase.auth;
    }
};
