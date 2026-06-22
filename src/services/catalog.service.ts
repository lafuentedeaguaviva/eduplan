import { supabase } from '@/lib/supabase';
import { ServiceResponse } from '@/types';

/**
 * Model: CatalogService
 * 
 * Proporciona acceso a catálogos estáticos y dinámicos del sistema,
 * como niveles, grados, áreas, turnos, paralelos y geografía (deptos/distritos).
 */
let verbosCache: any[] | null = null;
let complementosCache: any[] | null = null;

export const CatalogService = {
    /**
     * Obtiene la lista de niveles educativos.
     */
    async getNiveles(): Promise<ServiceResponse<any[]>> {
        const { data, error } = await supabase
            .from('niveles')
            .select('id, nombre')
            .order('nombre');
        return { data: data || [], error, success: !error };
    },

    /**
     * Obtiene los grados asociados a un nivel educativo.
     */
    async getGrados(nivelId: number): Promise<ServiceResponse<any[]>> {
        const { data, error } = await supabase
            .from('grados')
            .select('id, nombre')
            .eq('nivel_id', nivelId)
            .order('nombre');
        return { data: data || [], error, success: !error };
    },

    /**
     * Obtiene las áreas de conocimiento de un grado específico.
     */
    async getAreasByGrado(gradoId: number): Promise<ServiceResponse<any[]>> {
        const { data, error } = await supabase
            .from('areas_conocimiento')
            .select('id, nombre')
            .eq('grado_id', gradoId)
            .order('nombre');
        return { data: data || [], error, success: !error };
    },

    async getTurnos(): Promise<ServiceResponse<any[]>> {
        const { data, error } = await supabase
            .from('turnos')
            .select('id, nombre')
            .order('nombre');
        return { data: data || [], error, success: !error };
    },

    async getParalelos(): Promise<ServiceResponse<any[]>> {
        const { data, error } = await supabase
            .from('paralelos')
            .select('id, nombre')
            .order('nombre');
        return { data: data || [], error, success: !error };
    },

    async getDepartamentos(): Promise<ServiceResponse<any[]>> {
        const { data, error } = await supabase
            .from('departamentos')
            .select('id, nombre')
            .order('nombre');
        return { data: data || [], error, success: !error };
    },

    async getDistritos(departamentoId: number): Promise<ServiceResponse<any[]>> {
        const { data, error } = await supabase
            .from('distritos')
            .select('id, nombre')
            .eq('departamento_id', departamentoId)
            .order('nombre');
        return { data: data || [], error, success: !error };
    },

    /**
     * Obtiene las unidades educativas, opcionalmente filtradas por distrito.
     */
    async getUnidades(distritoId?: number): Promise<ServiceResponse<any[]>> {
        let query = supabase
            .from('unidades_educativas')
            .select('id, nombre')
            .order('nombre');

        if (distritoId) {
            query = query.eq('distrito_id', distritoId);
        }

        const { data, error } = await query;
        return { data: data || [], error, success: !error };
    },

    async getVerbos(): Promise<ServiceResponse<any[]>> {
        if (verbosCache) {
            return { data: verbosCache, error: null, success: true };
        }
        const { data, error } = await supabase
            .from('catalogo_verbos')
            .select('*')
            .order('tipo_verbo_id')
            .order('verbo');
        
        if (!error && data) {
            verbosCache = data;
        }
        return { data: data || [], error, success: !error };
    },

    async getComplementos(): Promise<ServiceResponse<any[]>> {
        if (complementosCache) {
            return { data: complementosCache, error: null, success: true };
        }
        const { data, error } = await supabase
            .from('catalogo_complementos')
            .select('*')
            .order('tipo_complemento_id')
            .order('complemento');
        
        if (!error && data) {
            complementosCache = data;
        }
        return { data: data || [], error, success: !error };
    },

    /**
     * Obtiene el objetivo holístico de un nivel por su nombre.
     */
    async getObjetivoHolisticoByNivelName(nivelNombre: string): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('niveles')
            .select('objetivo_holistico')
            .eq('nombre', nivelNombre)
            .single();
        return { data: error ? null : data, error, success: !error };
    }
};
