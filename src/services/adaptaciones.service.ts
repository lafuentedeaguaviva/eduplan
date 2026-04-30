import { supabase } from '@/lib/supabase';
import { AdaptacionBasicaLibraryItem, AdaptacionBasicaItem, ServiceResponse } from '@/types';

export const AdaptacionesService = {
    /**
     * Obtiene todos los items de biblioteca_adaptaciones_basicas.
     */
    async getLibrary(): Promise<ServiceResponse<AdaptacionBasicaLibraryItem[]>> {
        const { data, error } = await supabase
            .from('biblioteca_adaptaciones_basicas')
            .select('*')
            .order('tipo', { ascending: true });
        return { data, error, success: !error };
    },

    /**
     * Guarda o actualiza una adaptación en la tabla 'adaptaciones_basicas'.
     */
    async upsertAdaptacion(item: Partial<AdaptacionBasicaItem>): Promise<ServiceResponse<AdaptacionBasicaItem>> {
        const { data, error } = await supabase
            .from('adaptaciones_basicas')
            .upsert(item)
            .select()
            .single();
        return { data, error, success: !error };
    },

    /**
     * Elimina una adaptación de la tabla 'adaptaciones_basicas'.
     */
    async deleteAdaptacion(id: number | string): Promise<ServiceResponse<null>> {
        const { error } = await supabase
            .from('adaptaciones_basicas')
            .delete()
            .eq('id_adaptacion_basica', id);
        return { data: null, error, success: !error };
    },

    /**
     * Obtiene las adaptaciones asociadas a múltiples IDs de planificación semanal.
     */
    async getByWeekIds(weekIds: string[]): Promise<ServiceResponse<AdaptacionBasicaItem[]>> {
        const { data, error } = await supabase
            .from('adaptaciones_basicas')
            .select('*')
            .in('planificacion_semanal_id', weekIds);

        return { data: data as AdaptacionBasicaItem[] || [], error, success: !error };
    }
};
