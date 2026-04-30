import { db } from '@/lib/database';
import {
    PracticaItem,
    TeoriaItem,
    ProduccionItem,
    ValoracionItem,
    AdaptacionBasicaItem,
    RecursoItem,
    MiFuenteItem
} from '@/types';

export const PlanningService = {
    async upsertDetail<T extends { planificacion_semanal_id: string }>(table: string, detail: T) {
        const { data, error } = await db.from(table)
            .upsert(detail)
            .single();
        return { data, error };
    },

    /**
     * Update header fields of planificacion_semanal
     */
    async updateHeader(weekId: string, data: any) {
        const { data: result, error } = await db.from('planificacion_semanal')
            .update(data)
            .eq('id', weekId)
            .select()
            .single();
        return { data: result, error };
    },

    /**
     * Fetch all details for a specific planificacion_semanal
     */
    async getDetailsByWeeklyPlanId(weekId: string): Promise<any> {
        const [
            header, practica, teoria, produccion, valoracion,
            adaptaciones, recursos_list, fuentes
        ] = await Promise.all([
            db.from('planificacion_semanal').select('*').eq('id', weekId).single(),
            db.from('practica').select('*').eq('planificacion_semanal_id', weekId),
            db.from('teoria').select('*').eq('planificacion_semanal_id', weekId),
            db.from('produccion').select('*').eq('planificacion_semanal_id', weekId),
            db.from('valoracion').select('*').eq('planificacion_semanal_id', weekId),
            db.from('adaptaciones_basicas').select('*').eq('planificacion_semanal_id', weekId),
            db.from('recursos').select('*').eq('planificacion_semanal_id', weekId),
            db.from('mi_fuente').select('*').eq('planificacion_semanal_id', weekId),
        ]);

        const data = {
            header: header.data,
            practica: (practica.data || []) as PracticaItem[],
            teoria: (teoria.data || []) as TeoriaItem[],
            produccion: (produccion.data || []) as ProduccionItem[],
            valoracion: (valoracion.data || []) as ValoracionItem[],
            adaptaciones: (adaptaciones.data || []) as AdaptacionBasicaItem[],
            recursos: (recursos_list.data || []) as RecursoItem[], // Note: renamed key to match controller expectations
            fuentes: (fuentes.data || []) as MiFuenteItem[],
            momentos_json: header.data?.momentos || [],
            recursos_json: header.data?.recursos || [],
            fuentes_json: header.data?.fuentes || [],
            consolidado: header.data?.consolidado || 0,
            adaptaciones_json: header.data?.adaptaciones_basicas || [],
            adaptacion_especial: header.data?.adaptacion_especial || []
        };

        const error = header.error || practica.error || teoria.error || produccion.error || valoracion.error;
        return { success: !error, data, error };
    },

    /**
     * Delete a detail by its ID and table name
     */
    async deleteDetail(table: string, idField: string, id: number | string) {
        return await db.from(table)
            .delete()
            .eq(idField, id);
    }
};
