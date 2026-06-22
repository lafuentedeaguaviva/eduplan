
import { createClient } from '@/utils/supabase/server';

/**
 * Wrapper de Supabase - Interfaz agnóstica para operaciones de Base de Datos.
 * 
 * PROPÓSITO: Implementar la "Agnosticismo de Dependencias" (Sección I, buenaspracticas.md).
 * Si en el futuro cambiamos Supabase por otra base de datos, solo editamos este archivo.
 * El resto de la aplicación no necesita saber que usamos Supabase específicamente.
 */
export async function getDb() {
    // Inicializa el cliente de Supabase (Server Component)
    const supabase = await createClient();

    return {
        /**
         * Obtiene un único registro de una tabla.
         * @param table Nombre de la tabla
         * @param query String de selección (ej: '*', 'id, nombre')
         * @param filter Objeto con pares llave-valor para filtrar (WHERE)
         */
        async fetchSingle<T>(table: string, query: string, filter: Record<string, any>) {
            let request = supabase.from(table).select(query);

            // Aplica los filtros dinámicamente
            for (const [key, value] of Object.entries(filter)) {
                request = request.eq(key, value);
            }

            const { data, error } = await request.single();
            if (error) {
                console.error(`Error en fetchSingle (${table}):`, error.message, error.code, error.details);
                throw error;
            }
            return data as unknown as T;
        },

        /**
         * Obtiene múltiples registros de una tabla.
         * @param table Nombre de la tabla
         * @param query String de selección (soporta joins de Supabase)
         * @param filter Objeto con pares llave-valor para filtrar
         */
        async fetchMany<T>(table: string, query: string, filter: Record<string, any>) {
            let request = supabase.from(table).select(query);

            for (const [key, value] of Object.entries(filter)) {
                request = request.eq(key, value);
            }

            const { data, error } = await request;
            if (error) {
                console.error(`Error en fetchMany (${table}):`, error);
                throw error;
            }
            return data as unknown as T[];
        },

        /**
         * Obtiene la sesión del usuario actual.
         */
        async auth() {
            return supabase.auth.getUser();
        }
    };
}
