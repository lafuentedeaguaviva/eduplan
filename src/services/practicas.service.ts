import { supabase } from '@/lib/supabase';
import { ServiceResponse } from '@/types';

export interface PracticaLibraryItem {
    id_practica: number;
    proposito: string;
    tipo: string;
    codigo_biblioteca_practica?: string;
    nombre_practica: string;
    descripcion_concreta: string;
    apto_para?: string;
    redactado?: string;
    preguntas: string;
    ejemplo_inicial: string;
    ejemplo_primaria: string;
    ejemplo_secundaria: string;
    ejemplo_multigrado: string;
}

let libraryCache: PracticaLibraryItem[] | null = null;

export const PracticasService = {
    /**
     * Obtiene todos los ítems de la biblioteca de prácticas.
     */
    async getLibrary(): Promise<ServiceResponse<PracticaLibraryItem[]>> {
        if (libraryCache) {
            return { data: libraryCache, error: null, success: true };
        }
        const { data, error } = await supabase
            .from('biblioteca_practica')
            .select('*')
            .order('proposito', { ascending: true });

        if (!error && data) {
            libraryCache = data as PracticaLibraryItem[];
        }

        return { data: data as PracticaLibraryItem[], error, success: !error };
    },

    /**
     * Guarda o actualiza una práctica en la tabla 'practica'.
     */
    async upsertPractica(practica: any): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('practica')
            .upsert(practica)
            .select()
            .single();

        return { data, error, success: !error };
    },

    /**
     * Elimina una práctica de la tabla 'practica'.
     */
    async deletePractica(id_practica: number | string): Promise<ServiceResponse<null>> {
        const { error } = await supabase
            .from('practica')
            .delete()
            .eq('id_practica', id_practica);

        return { data: null, error, success: !error };
    },

    /**
     * Obtiene las prácticas asociadas a múltiples IDs de planificación semanal.
     */
    async getByWeekIds(weekIds: string[]): Promise<ServiceResponse<any[]>> {
        const { data, error } = await supabase
            .from('practica')
            .select('*')
            .in('planificacion_semanal_id', weekIds);

        return { data: data || [], error, success: !error };
    }
};
