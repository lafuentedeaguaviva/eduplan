import { supabase } from '@/lib/supabase';
import { ProduccionItem, ProduccionLibraryItem, ServiceResponse } from '@/types';

export const ProduccionService = {
    /**
     * Obtiene todos los ítems de la biblioteca de producción.
     */
    async getLibrary(): Promise<ServiceResponse<ProduccionLibraryItem[]>> {
        const { data, error } = await supabase
            .from('biblioteca_produccion')
            .select('*')
            .order('nombre_produccion');

        return { data: data as ProduccionLibraryItem[], error, success: !error };
    },

    /**
     * Guarda o actualiza una producción en la tabla 'produccion'.
     */
    async upsertProduccion(item: Partial<ProduccionItem>): Promise<ServiceResponse<ProduccionItem>> {
        const { data, error } = await supabase
            .from('produccion')
            .upsert(item)
            .select()
            .single();

        return { data: data as ProduccionItem, error, success: !error };
    },

    /**
     * Elimina una producción de la tabla 'produccion'.
     */
    async deleteProduccion(id: string | number): Promise<ServiceResponse<null>> {
        const { error } = await supabase
            .from('produccion')
            .delete()
            .eq('id_produccion', id);

        return { data: null, error, success: !error };
    },

    /**
     * Obtiene las producciones asociadas a múltiples IDs de planificación semanal.
     */
    async getByWeekIds(weekIds: string[]): Promise<ServiceResponse<ProduccionItem[]>> {
        const { data, error } = await supabase
            .from('produccion')
            .select('*')
            .in('planificacion_semanal_id', weekIds);

        return { data: data as ProduccionItem[] || [], error, success: !error };
    }
};
