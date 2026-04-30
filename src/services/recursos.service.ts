import { supabase } from '@/lib/supabase';
import { RecursoLibraryItem, RecursoItem, ServiceResponse } from '@/types';

export const RecursosService = {
    /**
     * Obtiene todos los items de biblioteca_recursos.
     */
    async getLibrary(): Promise<ServiceResponse<RecursoLibraryItem[]>> {
        const { data, error } = await supabase
            .from('biblioteca_recursos')
            .select('*')
            .order('tipo', { ascending: true });
        return { data, error, success: !error };
    },

    /**
     * Guarda o actualiza un recurso en la tabla 'recursos'.
     */
    async upsertRecurso(item: Partial<RecursoItem>): Promise<ServiceResponse<RecursoItem>> {
        const { data, error } = await supabase
            .from('recursos')
            .upsert(item)
            .select()
            .single();
        return { data, error, success: !error };
    },

    /**
     * Elimina un recurso de la tabla 'recursos'.
     */
    async deleteRecurso(id: number | string): Promise<ServiceResponse<null>> {
        const { error } = await supabase
            .from('recursos')
            .delete()
            .eq('id_recursos', id);
        return { data: null, error, success: !error };
    },

    /**
     * Obtiene los recursos asociados a múltiples IDs de planificación semanal.
     */
    async getByWeekIds(weekIds: string[]): Promise<ServiceResponse<RecursoItem[]>> {
        const { data, error } = await supabase
            .from('recursos')
            .select('*')
            .in('planificacion_semanal_id', weekIds);

        return { data: data as RecursoItem[] || [], error, success: !error };
    }
};
