import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let clientInstance: any = null;

function getClient() {
    if (!clientInstance) {
        const url = supabaseUrl || 'https://placeholder-url.supabase.co';
        const key = supabaseServiceRoleKey || 'placeholder-key';
        
        if (!supabaseServiceRoleKey) {
            console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Using placeholder client for build/initialization.');
        }
        
        clientInstance = createClient(url, key, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }
    return clientInstance;
}

/**
 * Cliente administrativo de Supabase (Lazy/Proxy).
 * Únicamente para uso en el servidor (API Routes / Server Actions).
 * Evita fallos de inicialización en compilación (build) si faltan las variables de entorno.
 */
export const supabaseAdmin = new Proxy({} as any, {
    get(target, prop) {
        const client = getClient();
        const value = client[prop];
        if (typeof value === 'function') {
            return value.bind(client);
        }
        return value;
    }
});
