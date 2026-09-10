import { supabase } from '@/lib/supabase';
import { ServiceResponse } from '@/types';

export interface RecursoInstitucional {
    id: string;
    unidad_educativa_id: number;
    tipo: 'normativa' | 'bien';
    titulo_nombre: string;
    descripcion?: string;
    archivo_url?: string;
    cantidad?: number;
    estado_bien?: string;
    creado_por?: string;
    created_at?: string;
}

export const RecursosInstitucionalesService = {
    /**
     * Obtiene los recursos (normativas o bienes) de una escuela
     */
    async getRecursosPorEscuela(unidadId: number, tipo: 'normativa' | 'bien'): Promise<ServiceResponse<RecursoInstitucional[]>> {
        try {
            const { data, error } = await supabase
                .from('recursos_institucionales')
                .select('*')
                .eq('unidad_educativa_id', unidadId)
                .eq('tipo', tipo)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data: data || [], error: null, success: true };
        } catch (error: any) {
            console.error(`Error in getRecursosPorEscuela (${tipo}):`, error);
            return { data: [], error, success: false };
        }
    },

    /**
     * Añade un recurso institucional (Secretario)
     */
    async addRecurso(recurso: Omit<RecursoInstitucional, 'id' | 'created_at'>): Promise<ServiceResponse<any>> {
        try {
            const { data, error } = await supabase
                .from('recursos_institucionales')
                .insert([recurso])
                .select();

            if (error) throw error;
            return { data, error: null, success: true };
        } catch (error: any) {
            console.error('Error in addRecurso:', error);
            return { data: null, error, success: false };
        }
    },

    /**
     * Elimina un recurso institucional (Secretario)
     */
    async deleteRecurso(id: string): Promise<ServiceResponse<any>> {
        try {
            const { data, error } = await supabase
                .from('recursos_institucionales')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { data, error: null, success: true };
        } catch (error: any) {
            console.error('Error in deleteRecurso:', error);
            return { data: null, error, success: false };
        }
    }
};
