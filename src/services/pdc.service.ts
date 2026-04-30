/**
 * Model: PdcService (Refactored MVC)
 * 
 * Este servicio centraliza la gestión básica de los PDCs.
 * La lógica compleja ha sido delegada a servicios especializados:
 * - PdcReportService: Generación de reportes y jerarquías.
 * - PdcScheduleService: Gestión de cronogramas y semanas.
 * - PdcDesignService: Diseño curricular y objetivos.
 */

import { db } from '@/lib/database';
import { 
    PDCMaster, 
    ServiceResponse 
} from '@/types';

// Importación para composición del objeto global
import { PdcReportService } from './pdc-report.service';
import { PdcScheduleService } from './pdc-schedule.service';
import { PdcDesignService } from './pdc-design.service';

// Exportación de tipos y servicios para conveniencia (Named Exports)
export * from './pdc-report.service';
export * from './pdc-schedule.service';
export * from './pdc-design.service';

export const PdcService = {
    ...PdcReportService,
    ...PdcScheduleService,
    ...PdcDesignService,

    /**
     * Crea un Plan de Desarrollo Curricular (Maestro).
     */
    async createPdcMaster(data: Partial<PDCMaster>): Promise<ServiceResponse<PDCMaster>> {
        const { data: pdc, error } = await db
            .from('pdcs')
            .insert({
                ...data,
                gestion: data.gestion || new Date().getFullYear(),
                estado: 'Pendiente'
            })
            .select()
            .single();

        return { data: pdc as PDCMaster, error, success: !error };
    },

    /**
     * Actualiza un PDC Maestro.
     */
    async updatePdcMaster(id: string, data: Partial<PDCMaster>): Promise<ServiceResponse<PDCMaster>> {
        const { data: pdc, error } = await db
            .from('pdcs')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        return { data: pdc as PDCMaster, error, success: !error };
    },

    /**
     * Elimina un PDC Maestro y sus relaciones (mediante CASCADE en DB).
     */
    async deletePDC(id: string): Promise<ServiceResponse<any>> {
        const { data, error } = await db
            .from('pdcs')
            .delete()
            .eq('id', id)
            .select();

        return { data, error, success: !error };
    },

    /**
     * Obtiene la lista de PDCs de un docente.
     */
    async getPDCs(userId: string): Promise<ServiceResponse<PDCMaster[]>> {
        const { data, error } = await db
            .from('pdcs')
            .select(`
                *,
                pdcs_area_trabajo (
                    id,
                    areas_trabajo (
                        id,
                        pdc_area_trabajo_id,
                        unidad_educativa:unidades_educativas (id, nombre),
                        area_conocimiento:areas_conocimiento (id, nombre),
                        turno:turnos (id, nombre)
                    )
                )
            `)
            .eq('docente_id', userId)
            .order('updated_at', { ascending: false });

        if (error) return { data: [], error, success: false };

        // Mapeo para aplanar la estructura de áreas vinculadas
        const mappedData = (data || []).map((pdc: any) => {
            const allAreas = (pdc.pdcs_area_trabajo || []).flatMap((pat: any) => {
                return (pat.areas_trabajo || []).map((area: any) => ({
                    ...area,
                    pdc_area_trabajo_id: pat.id 
                }));
            });

            return {
                ...pdc,
                areas_trabajo: allAreas
            };
        });

        return { data: mappedData as PDCMaster[], error: null, success: true };
    },

    /**
     * Obtiene los PDCs para supervisión del Director.
     */
    async getPDCsForDirector(directorId: string): Promise<ServiceResponse<PDCMaster[]>> {
        const { data: ue, error: ueError } = await db
            .from('unidades_educativas')
            .select('id')
            .eq('director_id', directorId)
            .single();

        if (ueError || !ue) return { data: [], error: ueError, success: false };

        const { data, error } = await db
            .from('pdcs')
            .select(`
                *,
                docente:perfiles!pdcs_docente_id_fkey (nombres, apellidos, foto_url),
                pdcs_area_trabajo (
                    id,
                    areas_trabajo (
                        id,
                        area_conocimiento:areas_conocimiento (nombre)
                    )
                )
            `)
            .eq('director_id', directorId)
            .order('updated_at', { ascending: false });

        return { data: data as PDCMaster[], error, success: !error };
    },

    /**
     * Obtiene los datos básicos del perfil de un usuario.
     */
    async getUserProfile(userId: string): Promise<ServiceResponse<any>> {
        const { data, error } = await db
            .from('perfiles')
            .select('nombres, apellidos, email')
            .eq('id', userId)
            .single();
        return { data, error, success: !error };
    },

    async updateObservations(pdcId: string, observations: string): Promise<ServiceResponse<any>> {
        const { data, error } = await db
            .from('pdcs')
            .update({ observaciones_director: observations })
            .eq('id', pdcId)
            .select();
        
        return { data, error, success: !error };
    },

    /**
     * Director: Estadísticas institucionales de planificación y ejecución.
     * Analiza las semanas planificadas vs las que tienen momentos registrados.
     */
    async getUEAnalytics(directorId: string): Promise<ServiceResponse<any>> {
        try {
            const { data: pdcs } = await db
                .from('pdcs')
                .select(`
                    id,
                    pdcs_area_trabajo (
                        id,
                        planificacion_semanal (
                            id,
                            semana,
                            momentos
                        )
                    )
                `)
                .eq('director_id', directorId);

            if (!pdcs) return { data: null, error: null, success: false };

            let totalWeeks = 0;
            let weeksWithMomentos = 0;
            const distribution: Record<string, number> = {};

            pdcs.forEach((pdc: any) => {
                pdc.pdcs_area_trabajo?.forEach((pat: any) => {
                    pat.planificacion_semanal?.forEach((week: any) => {
                        totalWeeks++;
                        const momentos = Array.isArray(week.momentos) ? week.momentos : [];
                        if (momentos.length > 0) weeksWithMomentos++;
                        momentos.forEach((m: any) => {
                            const tipo = m.type || 'otro';
                            distribution[tipo] = (distribution[tipo] || 0) + 1;
                        });
                    });
                });
            });

            const analyticsData = {
                planningRate: totalWeeks > 0 ? Math.round((totalWeeks / Math.max(totalWeeks, 1)) * 100) : 0,
                executionRate: totalWeeks > 0 ? Math.round((weeksWithMomentos / totalWeeks) * 100) : 0,
                totalContents: totalWeeks,
                distribution: Object.entries(distribution).map(([name, value]) => ({ name, value }))
            };

            return { data: analyticsData, error: null, success: true };
        } catch (e: any) {
            console.error('getUEAnalytics error:', e);
            return { data: null, error: e, success: false };
        }
    },

    /**
     * Director: Rendimiento del equipo docente (PDCs por maestro).
     */
    async getStaffPerformance(directorId: string): Promise<ServiceResponse<any[]>> {
        try {
            const { data: ue } = await db
                .from('unidades_educativas')
                .select('id')
                .eq('director_id', directorId)
                .single();

            if (!ue) return { data: [], error: null, success: true };

            const { data: perfiles, error } = await db
                .from('perfiles')
                .select('id, nombres, apellidos, foto_url, email')
                .eq('unidad_educativa_id', ue.id);

            if (error || !perfiles) return { data: [], error, success: !error };

            // Enrich with PDC count per teacher
            const enriched = await Promise.all(
                perfiles.map(async (p: any) => {
                    const { count } = await db
                        .from('pdcs')
                        .select('id', { count: 'exact', head: true })
                        .eq('docente_id', p.id);
                    return { ...p, pdcCount: count || 0 };
                })
            );

            return { data: enriched, error: null, success: true };
        } catch (e: any) {
            console.error('getStaffPerformance error:', e);
            return { data: [], error: e, success: false };
        }
    }
};
