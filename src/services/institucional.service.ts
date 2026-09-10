import { supabase } from '@/lib/supabase';
import { ServiceResponse } from '@/types';

export const InstitucionalService = {
    /**
     * Obtiene el listado del personal asociado a la escuela (docentes y secretarios)
     */
    async getPersonalEscuela(unidadId: number): Promise<ServiceResponse<any[]>> {
        try {
            const res = await fetch(`/api/director/personal?unidadId=${unidadId}`);
            if (!res.ok) throw new Error('Error al obtener personal');
            const result = await res.json();
            return { data: result.data || [], error: null, success: true };
        } catch (error: any) {
            console.error('Error in getPersonalEscuela:', error);
            return { data: [], error: error?.message || 'Ocurrió un error', success: false };
        }
    },

    /**
     * Obtiene los horarios de todas las áreas de trabajo de los docentes de la unidad educativa.
     * Esto permite armar la tabla de horarios unificada.
     */
    async getHorariosGenerales(unidadId: number): Promise<ServiceResponse<any[]>> {
        try {
            const res = await fetch(`/api/director/horarios?unidadId=${unidadId}`);
            if (!res.ok) throw new Error('Error al obtener horarios');
            const result = await res.json();
            return { data: result.data || [], error: null, success: true };
        } catch (error: any) {
            console.error('Error in getHorariosGenerales:', error);
            return { data: [], error: error?.message || 'Ocurrió un error', success: false };
        }
    },

    /**
     * Obtiene el ID de la unidad educativa asociada al usuario actual.
     * Busca primero si es director, sino busca en personal (Docente/Secretario).
     */
    async getMiUnidadEducativa(perfilId: string): Promise<ServiceResponse<number | null>> {
        try {
            const res = await fetch(`/api/director/unidad?perfilId=${perfilId}`);
            if (!res.ok) throw new Error('Error al obtener unidad educativa');
            const result = await res.json();
            return { data: result.data || null, error: null, success: true };
        } catch (error: any) {
            console.error('Error in getMiUnidadEducativa:', error);
            return { data: null, error: error?.message || 'Ocurrió un error', success: false };
        }
    },

    /**
     * Obtiene los recursos institucionales (normativas, bienes) de una escuela
     */
    async getRecursosInstitucionales(unidadId: number): Promise<ServiceResponse<any[]>> {
        try {
            const res = await fetch(`/api/director/recursos?unidadId=${unidadId}`);
            if (!res.ok) throw new Error('Error al obtener recursos');
            
            const result = await res.json();
            if (!result.success) throw new Error(result.error);

            return { data: result.data || [], error: null, success: true };
        } catch (error: any) {
            console.error('Error in getRecursosInstitucionales:', error);
            return { data: [], error: error?.message || 'Ocurrió un error', success: false };
        }
    },

    /**
     * Crea o actualiza un recurso institucional (Normativa o Bien)
     */
    async upsertRecursoInstitucional(data: any): Promise<ServiceResponse<any>> {
        try {
            const res = await fetch('/api/director/recursos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (!result.success) throw new Error(result.error);
            return { data: result.data, error: null, success: true };
        } catch (error: any) {
            console.error('Error in upsertRecursoInstitucional:', error);
            return { data: null, error: error?.message || 'Error al guardar el recurso', success: false };
        }
    },

    /**
     * Elimina un recurso institucional
     */
    async deleteRecursoInstitucional(id: string): Promise<ServiceResponse<boolean>> {
        try {
            const res = await fetch(`/api/director/recursos?id=${id}`, {
                method: 'DELETE'
            });
            const result = await res.json();
            if (!result.success) throw new Error(result.error);
            return { data: true, error: null, success: true };
        } catch (error: any) {
            console.error('Error in deleteRecursoInstitucional:', error);
            return { data: false, error: error?.message || 'Error', success: false };
        }
    }
};
