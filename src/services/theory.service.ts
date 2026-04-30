/**
 * Model: TheoryService
 * 
 * Este servicio gestiona el acceso a la Biblioteca de Teoría.
 * Proporciona métodos para recuperar estrategias teóricas desde Supabase.
 */

import { supabase } from '@/lib/supabase';
import { ServiceResponse, TheoryLibraryItem } from '@/types';

export const TheoryService = {
    /**
     * Obtiene todos los ítems de la biblioteca de teoría.
     * @returns {Promise<ServiceResponse<TheoryLibraryItem[]>>} Lista de estrategias teóricas.
     */
    async getLibrary(): Promise<ServiceResponse<TheoryLibraryItem[]>> {
        const { data, error } = await supabase
            .from('biblioteca_teoria')
            .select('*')
            .order('nombre_estrategia_teorica', { ascending: true });

        if (error) {
            console.error('TheoryService Error [getLibrary]:', error);
        }

        return {
            data: data as TheoryLibraryItem[],
            error,
            success: !error
        };
    },

    /**
     * Busca estrategias teóricas por nombre o propósito.
     * @param {string} query - Término de búsqueda.
     */
    async searchLibrary(query: string): Promise<ServiceResponse<TheoryLibraryItem[]>> {
        const { data, error } = await supabase
            .from('biblioteca_teoria')
            .select('*')
            .or(`nombre_estrategia_teorica.ilike.%${query}%,proposito.ilike.%${query}%`)
            .order('nombre_estrategia_teorica', { ascending: true });

        return {
            data: data as TheoryLibraryItem[],
            error,
            success: !error
        };
    },

    /**
     * Guarda o actualiza una estrategia teórica en la tabla 'teoria'.
     */
    async upsertTheory(theory: any): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('teoria')
            .upsert(theory)
            .select()
            .single();

        return { data, error, success: !error };
    },

    /**
     * Elimina una estrategia teórica de la tabla 'teoria'.
     */
    async deleteTheory(id_teoria: number | string): Promise<ServiceResponse<null>> {
        const { error } = await supabase
            .from('teoria')
            .delete()
            .eq('id_teoria', id_teoria);

        return { data: null, error, success: !error };
    },

    /**
     * Obtiene las teorías asociadas a múltiples IDs de planificación semanal.
     */
    async getByWeekIds(weekIds: string[]): Promise<ServiceResponse<any[]>> {
        const { data, error } = await supabase
            .from('teoria')
            .select('*')
            .in('planificacion_semanal_id', weekIds);

        return { data: data || [], error, success: !error };
    }
};
