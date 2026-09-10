import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Custom fetch implementation with a global timeout (15 seconds).
 * This prevents the application from hanging indefinitely if the network drops or Supabase stalls.
 */
const fetchWithTimeout = async (url: RequestInfo | URL, options?: RequestInit) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 15000); // 15 seconds global timeout
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (err: any) {
        clearTimeout(id);
        if (err.name === 'AbortError') {
            console.error('[Supabase Timeout] Fetch aborted due to 15s timeout:', url);
            throw new Error('La conexión ha tardado demasiado. Por favor, verifica tu internet o intenta de nuevo.');
        }
        throw err;
    }
};

/**
 * Creates a unified Supabase Browser Client.
 * 
 * Uses a singleton pattern to prevent HMR and React Strict Mode
 * from creating multiple instances that deadlock on `navigator.locks.request`.
 */
export const createSupabaseBrowserClient = () => {
    if (typeof window === 'undefined') {
        // En el servidor (ej. SSR), siempre crear una nueva instancia limpia
        return createBrowserClient(supabaseUrl, supabaseAnonKey, {
            global: { fetch: fetchWithTimeout }
        });
    }
    
    // En el cliente, usar un singleton atado al objeto window
    if (!(window as any)._supabaseBrowserClient) {
        (window as any)._supabaseBrowserClient = createBrowserClient(
            supabaseUrl,
            supabaseAnonKey,
            { 
                isSingleton: true,
                global: { fetch: fetchWithTimeout }
            }
        );
    }
    
    return (window as any)._supabaseBrowserClient;
};

// For backwards compatibility where a single export was used.
// NOTE: Prefer using `createClient()` from `@/utils/supabase/client` in components.
export const supabase = createSupabaseBrowserClient();
