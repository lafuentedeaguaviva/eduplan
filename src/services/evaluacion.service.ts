import { db } from '@/lib/database';
import {
    ServiceResponse,
    SerLibraryItem, SerItem,
    SaberLibraryItem, SaberItem,
    HacerLibraryItem, HacerItem,
    AdaptacionEvaluacionLibraryItem, AdaptacionEvaluacionItem
} from '@/types';

/**
 * Model: EvaluacionService
 * 
 * Gestiona el acceso a datos para los Criterios de Evaluación.
 * Incluye acceso a bibliotecas y persistencia por PDC.
 */
export const EvaluacionService = {

    // ─── BIBLIOTECAS ─────────────────────────────────────────────────────────

    async getBibliotecaSer(): Promise<ServiceResponse<SerLibraryItem[]>> {
        const { data, error } = await db.from('biblioteca_ser').select('*').order('id_ser');
        return { data: data as SerLibraryItem[], error, success: !error };
    },

    async getBibliotecaSaber(): Promise<ServiceResponse<SaberLibraryItem[]>> {
        const { data, error } = await db.from('biblioteca_saber').select('*').order('id_saber');
        return { data: data as SaberLibraryItem[], error, success: !error };
    },

    async getBibliotecaHacer(): Promise<ServiceResponse<HacerLibraryItem[]>> {
        const { data, error } = await db.from('biblioteca_hacer').select('*').order('id_hacer');
        return { data: data as HacerLibraryItem[], error, success: !error };
    },

    async getBibliotecaAdaptacion(): Promise<ServiceResponse<AdaptacionEvaluacionLibraryItem[]>> {
        const { data, error } = await db.from('biblioteca_evaluacion_adaptaciones_especiales').select('*').order('id_adaptacion_evaluacion');
        return { data: data as AdaptacionEvaluacionLibraryItem[], error, success: !error };
    },

    // ─── PERSISTENCIA POR PDC ────────────────────────────────────────────────

    // -- SER --
    async getSerByPdcArea(pdcAreaId: string): Promise<ServiceResponse<SerItem[]>> {
        const { data, error } = await db.from('ser').select('*').eq('pdc_area_trabajo_id', pdcAreaId);
        return { data: data as SerItem[], error, success: !error };
    },

    async saveSer(item: Partial<SerItem>): Promise<ServiceResponse<SerItem>> {
        const isNew = !item.id_ser || item.id_ser === 0;
        const payload = { ...item };
        
        if (isNew) {
            delete (payload as any).id_ser;
            const { data, error } = await db.from('ser').insert(payload).select().single();
            return { data: data as SerItem, error, success: !error };
        } else {
            const id = item.id_ser;
            delete (payload as any).id_ser;
            const { data, error } = await db.from('ser').update(payload).eq('id_ser', id).select().single();
            return { data: data as SerItem, error, success: !error };
        }
    },

    async deleteSer(id: number): Promise<ServiceResponse<null>> {
        const { error } = await db.from('ser').delete().eq('id_ser', id);
        return { data: null, error, success: !error };
    },

    // -- SABER --
    async getSaberByPdcArea(pdcAreaId: string): Promise<ServiceResponse<SaberItem[]>> {
        const { data, error } = await db.from('saber').select('*').eq('pdc_area_trabajo_id', pdcAreaId);
        return { data: data as SaberItem[], error, success: !error };
    },

    async saveSaber(item: Partial<SaberItem>): Promise<ServiceResponse<SaberItem>> {
        const isNew = !item.id_saber || item.id_saber === 0;
        const payload = { ...item };
        
        if (isNew) {
            delete (payload as any).id_saber;
            const { data, error } = await db.from('saber').insert(payload).select().single();
            return { data: data as SaberItem, error, success: !error };
        } else {
            const id = item.id_saber;
            delete (payload as any).id_saber;
            const { data, error } = await db.from('saber').update(payload).eq('id_saber', id).select().single();
            return { data: data as SaberItem, error, success: !error };
        }
    },

    async deleteSaber(id: number): Promise<ServiceResponse<null>> {
        const { error } = await db.from('saber').delete().eq('id_saber', id);
        return { data: null, error, success: !error };
    },

    // -- HACER --
    async getHacerByPdcArea(pdcAreaId: string): Promise<ServiceResponse<HacerItem[]>> {
        const { data, error } = await db.from('hacer').select('*').eq('pdc_area_trabajo_id', pdcAreaId);
        return { data: data as HacerItem[], error, success: !error };
    },

    async saveHacer(item: Partial<HacerItem>): Promise<ServiceResponse<HacerItem>> {
        const isNew = !item.id_hacer || item.id_hacer === 0;
        const payload = { ...item };
        
        if (isNew) {
            delete (payload as any).id_hacer;
            const { data, error } = await db.from('hacer').insert(payload).select().single();
            return { data: data as HacerItem, error, success: !error };
        } else {
            const id = item.id_hacer;
            delete (payload as any).id_hacer;
            const { data, error } = await db.from('hacer').update(payload).eq('id_hacer', id).select().single();
            return { data: data as HacerItem, error, success: !error };
        }
    },

    async deleteHacer(id: number): Promise<ServiceResponse<null>> {
        const { error } = await db.from('hacer').delete().eq('id_hacer', id);
        return { data: null, error, success: !error };
    },

    // -- ADAPTACIÓN EVALUACIÓN --
    async getAdaptacionByPdcArea(pdcAreaId: string): Promise<ServiceResponse<AdaptacionEvaluacionItem[]>> {
        const { data, error } = await db.from('evaluacion_adaptaciones_especiales').select('*').eq('pdc_area_trabajo_id', pdcAreaId);
        return { data: data as AdaptacionEvaluacionItem[], error, success: !error };
    },

    async saveAdaptacion(item: Partial<AdaptacionEvaluacionItem>): Promise<ServiceResponse<AdaptacionEvaluacionItem>> {
        const isNew = !item.id_adaptacion_evaluacion || item.id_adaptacion_evaluacion === 0;
        const payload = { ...item };
        
        if (isNew) {
            delete (payload as any).id_adaptacion_evaluacion;
            const { data, error } = await db.from('evaluacion_adaptaciones_especiales').insert(payload).select().single();
            return { data: data as AdaptacionEvaluacionItem, error, success: !error };
        } else {
            const id = item.id_adaptacion_evaluacion;
            delete (payload as any).id_adaptacion_evaluacion;
            const { data, error } = await db.from('evaluacion_adaptaciones_especiales').update(payload).eq('id_adaptacion_evaluacion', id).select().single();
            return { data: data as AdaptacionEvaluacionItem, error, success: !error };
        }
    },

    async deleteAdaptacion(id: number): Promise<ServiceResponse<null>> {
        const { error } = await db.from('evaluacion_adaptaciones_especiales').delete().eq('id_adaptacion_evaluacion', id);
        return { data: null, error, success: !error };
    },

    /**
     * Guarda un snapshot de los criterios consolidados en la tabla pdcs_area_trabajo.
     * Optimiza el JSONB eliminando campos pesados (ejemplos, descripciones teóricas) para ahorrar tokens.
     */
    async saveEvaluationSnapshot(pdcAreaId: string, data: { criterios: any[], adaptaciones: any[] }): Promise<ServiceResponse<any>> {
        
        // Limpieza de Criterios (Ser, Saber, Hacer)
        const cleanedCriterios = data.criterios.map(item => {
            if (item.id_ser) {
                return {
                    id: item.id_ser,
                    type: 'ser',
                    categoria: item.categoria,
                    subcategoria: item.subcategoria,
                    redactado: item.redactado,
                    instrumento: item.instrumento_sugerido || item.instrumento
                };
            }
            if (item.id_saber) {
                return {
                    id: item.id_saber,
                    type: 'saber',
                    nivel: item.nivel,
                    subnivel: item.subnivel,
                    verbo: item.verbo_saber,
                    redactado: item.redactado,
                    evidencia: item.evidencia,
                    instrumento: item.instrumento_sugerido || item.instrumento
                };
            }
            if (item.id_hacer) {
                return {
                    id: item.id_hacer,
                    type: 'hacer',
                    nivel: item.nivel,
                    subnivel: item.subnivel,
                    verbo: item.verbo,
                    redactado: item.redactado,
                    producto: item.producto,
                    instrumento: item.instrumento_sugerido || item.instrumento
                };
            }
            return item; // Fallback
        });

        // Limpieza de Adaptaciones
        const cleanedAdaptaciones = data.adaptaciones.map(item => ({
            id: item.id_adaptacion_evaluacion,
            nombre: item.nombre_adaptacion,
            redactado: item.redactado,
            condicion: item.condicion
        }));

        const { error } = await db.from('pdcs_area_trabajo')
            .update({
                criterios_evaluacion: cleanedCriterios,
                criterio_adptacion_evaluacion: cleanedAdaptaciones
            })
            .eq('id', pdcAreaId);
            
        return { data: null, error, success: !error };
    }
};
