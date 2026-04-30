import { db } from '@/lib/database';
import { 
    PlanificacionGeneral, 
    PlanificacionSemanal, 
    ServiceResponse 
} from '@/types';
import { getMesInTrimester } from '@/lib/utils';

/**
 * Service: PdcScheduleService
 * Focus: Weekly planning schedules, content assignments, and week synchronization.
 */
export const PdcScheduleService = {

    /**
     * Obtiene el cronograma general (feriados, eventos).
     */
    async getGlobalSchedule(gestion: number, trimestre: number): Promise<ServiceResponse<PlanificacionGeneral[]>> {
        const { data, error } = await db
            .from('planificacion_semanal_general')
            .select('*')
            .eq('gestion', gestion)
            .eq('trimestre', trimestre)
            .order('mes', { ascending: true })
            .order('semana', { ascending: true });

        return { data: data as PlanificacionGeneral[], error, success: !error };
    },

    /**
     * Obtiene la planificación semanal específica para un área de trabajo.
     */
    async getAreaSchedule(areaId: string, gestion: number, trimestre: number): Promise<ServiceResponse<PlanificacionSemanal[]>> {
        const { data, error } = await db
            .from('planificacion_semanal')
            .select(`
                *,
                semana_contenido (
                    id,
                    contenido_usuario_id,
                    estado,
                    contenido_usuario:contenidos_usuario (
                        titulo,
                        padre_id
                    )
                )
            `)
            .eq('area_trabajo_id', areaId)
            .eq('gestion', gestion)
            .eq('trimestre', trimestre)
            .order('mes', { ascending: true })
            .order('semana', { ascending: true });

        return { data: data as unknown as PlanificacionSemanal[], error, success: !error };
    },

    /**
     * Crea un conjunto de semanas de planificación.
     */
    async createAreaSchedule(weeks: PlanificacionSemanal[]): Promise<ServiceResponse<PlanificacionSemanal[]>> {
        const { data, error } = await db
            .from('planificacion_semanal')
            .insert(weeks)
            .select();

        return { data: data as PlanificacionSemanal[], error, success: !error };
    },

    /**
     * Elimina el cronograma de un área para una gestión y trimestre específicos.
     */
    async deleteAreaSchedule(areaId: string, gestion: number, trimestre: number): Promise<ServiceResponse<any>> {
        const { data, error } = await db
            .from('planificacion_semanal')
            .delete()
            .eq('area_trabajo_id', areaId)
            .eq('gestion', gestion)
            .eq('trimestre', trimestre)
            .select();

        return { data, error, success: !error };
    },

    /**
     * Asocia un contenido de usuario a una semana.
     */
    async assignContentToWeek(planId: string, contentId: number): Promise<ServiceResponse<any>> {
        const { data, error } = await db
            .from('semana_contenido')
            .insert({
                planificacion_semanal_id: planId,
                contenido_usuario_id: contentId
            })
            .select();

        return { data, error, success: !error };
    },

    async assignMultipleContentsToWeek(planId: string, contentIds: number[]): Promise<ServiceResponse<any>> {
        const inserts = contentIds.map(id => ({
            planificacion_semanal_id: planId,
            contenido_usuario_id: id
        }));

        const { data, error } = await db
            .from('semana_contenido')
            .upsert(inserts, {
                onConflict: 'planificacion_semanal_id,contenido_usuario_id',
                ignoreDuplicates: true
            })
            .select();

        return { data, error, success: !error };
    },

    /**
     * Elimina todos los contenidos de múltiples semanas para un área.
     */
    async removeMultipleContentsFromWeeks(weekIds: string[], contentIds: number[]): Promise<ServiceResponse<any>> {
        const { data, error } = await db
            .from('semana_contenido')
            .delete()
            .in('planificacion_semanal_id', weekIds)
            .in('contenido_usuario_id', contentIds)
            .select();

        return { data, error, success: !error };
    },

    /**
     * Elimina múltiples contenidos de una semana específica.
     */
    async removeMultipleContentsFromWeek(planId: string, contentIds: number[]): Promise<ServiceResponse<any>> {
        const { data, error } = await db
            .from('semana_contenido')
            .delete()
            .eq('planificacion_semanal_id', planId)
            .in('contenido_usuario_id', contentIds)
            .select();

        return { data, error, success: !error };
    },

    /**
     * Asegura que existan las semanas de planificación para las áreas dadas.
     */
    async ensureAreaWeeksExist(areaIds: string[], gestion: number, trimestre: number, mes: number): Promise<ServiceResponse<any>> {
        try {
            const relativeMes = getMesInTrimester(mes);
            const { data: templateWeeks, error: templateError } = await db
                .from('planificacion_semanal_general')
                .select('*')
                .eq('gestion', gestion)
                .eq('trimestre', trimestre)
                .eq('mes', relativeMes);

            if (templateError) throw templateError;
            if (!templateWeeks || templateWeeks.length === 0) return { data: [], error: null, success: true };

            const results = [];
            for (const areaId of areaIds) {
                const { data: existingWeeks, error: checkError } = await db
                    .from('planificacion_semanal')
                    .select('semana')
                    .eq('area_trabajo_id', areaId)
                    .eq('gestion', gestion)
                    .eq('trimestre', trimestre)
                    .eq('mes', relativeMes);

                if (checkError) throw checkError;

                const existingWeekNums = new Set(existingWeeks?.map(w => w.semana) || []);
                const toInsert = templateWeeks
                    .filter(w => !existingWeekNums.has(w.semana))
                    .map(w => ({
                        area_trabajo_id: areaId,
                        gestion: gestion,
                        trimestre: trimestre,
                        mes: relativeMes,
                        semana: w.semana,
                        fecha_inicio_trimestre: w.fecha_inicio_trimestre,
                        fecha_fin_trimestre: w.fecha_fin_trimestre
                    }));

                if (toInsert.length > 0) {
                    const { data: inserted, error: insertError } = await db
                        .from('planificacion_semanal')
                        .insert(toInsert)
                        .select();
                    if (insertError) throw insertError;
                    results.push(...(inserted || []));
                }
            }
            return { data: results, error: null, success: true };
        } catch (error: any) {
            return { data: null, error, success: false };
        }
    },

    /**
     * Obtiene los contenidos asociados a las semanas dadas.
     */
    async getWeekContents(weekIds: string[]): Promise<ServiceResponse<any[]>> {
        const { data, error } = await db
            .from('semana_contenido')
            .select('contenido_usuario_id, planificacion_semanal_id')
            .in('planificacion_semanal_id', weekIds);
        return { data: data || [], error, success: !error };
    },

    /**
     * Obtiene todos los IDs de contenidos que ya han sido asignados a alguna semana
     * en el área y gestión especificadas.
     */
    async getAllPlannedContents(areaId: string, gestion: number): Promise<ServiceResponse<any[]>> {
        const { data, error } = await db
            .from('semana_contenido')
            .select('contenido_usuario_id, planificacion_semanal!inner(area_trabajo_id, gestion, trimestre, mes, semana)')
            .eq('planificacion_semanal.area_trabajo_id', areaId)
            .eq('planificacion_semanal.gestion', gestion);

        if (error) return { data: [], error, success: false };
        return { data: data || [], error: null, success: true };
    }
};
