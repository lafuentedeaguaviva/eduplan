import { supabase } from '@/lib/supabase';
import { ValoracionItem, ValoracionLibraryItem, ServiceResponse } from '@/types';

let libraryCache: ValoracionLibraryItem[] | null = null;

export const ValoracionService = {
    /**
     * Obtiene todos los ítems de la biblioteca de valoración.
     */
    async getLibrary(): Promise<ServiceResponse<ValoracionLibraryItem[]>> {
        if (libraryCache) {
            return { data: libraryCache, error: null, success: true };
        }
        const { data, error } = await supabase
            .from('biblioteca_valoracion')
            .select('*')
            .order('categoria');

        if (!error && data) {
            libraryCache = data as ValoracionLibraryItem[];
        }

        return { data: data as ValoracionLibraryItem[], error, success: !error };
    },

    /**
     * Guarda o actualiza una valoración en la tabla 'valoracion'.
     */
    async upsertValoracion(item: Partial<ValoracionItem>): Promise<ServiceResponse<ValoracionItem>> {
        const { data, error } = await supabase
            .from('valoracion')
            .upsert(item)
            .select()
            .single();

        return { data: data as ValoracionItem, error, success: !error };
    },

    /**
     * Elimina una valoración de la tabla 'valoracion'.
     */
    async deleteValoracion(id: string | number): Promise<ServiceResponse<null>> {
        const { error } = await supabase
            .from('valoracion')
            .delete()
            .eq('id_valoracion', id);

        return { data: null, error, success: !error };
    },

    /**
     * Obtiene las valoraciones asociadas a múltiples IDs de planificación semanal.
     */
    async getByWeekIds(weekIds: string[]): Promise<ServiceResponse<ValoracionItem[]>> {
        const { data, error } = await supabase
            .from('valoracion')
            .select('*')
            .in('planificacion_semanal_id', weekIds);

        return { data: data as ValoracionItem[] || [], error, success: !error };
    }
};
