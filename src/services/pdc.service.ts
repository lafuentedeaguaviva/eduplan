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
        // 1. Obtener la información del PDC y sus áreas de trabajo asociadas
        const { data: pdc } = await db
            .from('pdcs')
            .select(`
                gestion,
                trimestre,
                pdcs_area_trabajo (
                    area_trabajo_id
                )
            `)
            .eq('id', id)
            .single();

        if (pdc) {
            // Extraer los IDs de las áreas de trabajo
            const areaTrabajoIds = (pdc.pdcs_area_trabajo || [])
                .map((pat: any) => pat.area_trabajo_id)
                .filter(Boolean);

            if (areaTrabajoIds.length > 0) {
                // Limpiar campos de IA en planificacion_semanal para las áreas y periodo del PDC
                await db.from('planificacion_semanal')
                    .update({
                        momentos_ia: null,
                        recursos_fuentes_ia: null,
                        adaptaciones_basicas_ia: null,
                        adaptaciones_especiales_ia: null,
                        discapacidad_ia: null,
                        adaptaciones_curriculares_ia: null
                    })
                    .in('area_trabajo_id', areaTrabajoIds)
                    .eq('gestion', pdc.gestion)
                    .eq('trimestre', pdc.trimestre);
            }
        }

        // 2. Eliminar el PDC (el CASCADE eliminará pdcs_area_trabajo y otros datos directamente vinculados)
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
                const areas = pat.areas_trabajo;
                if (!areas) return [];
                
                // Asegurar que siempre sea un array para evitar errores de .map
                const areasArray = Array.isArray(areas) ? areas : [areas];
                
                return areasArray.map((area: any) => ({
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
        // 1. Obtener PDCs vinculados directamente por director_id (Nuevo Estándar)
        const { data: directPdcs, error: directError } = await db
            .from('pdcs')
            .select(`
                *,
                docente:perfiles!pdcs_docente_id_fkey (nombres, apellidos, foto_url),
                pdcs_area_trabajo (
                    id,
                    areas_trabajo (
                        id,
                        unidad_educativa_id,
                        area_conocimiento:areas_conocimiento (nombre)
                    )
                )
            `)
            .eq('director_id', directorId)
            .order('updated_at', { ascending: false });

        if (directError) return { data: [], error: directError, success: false };

        // 2. Obtener Unidades Educativas que gestiona este director
        const [gestiones, legacyUnits] = await Promise.all([
            db.from('gestion_directores').select('unidad_id').eq('perfil_id', directorId),
            db.from('unidades_educativas').select('id').eq('director_id', directorId)
        ]);

        const unidadIds = Array.from(new Set([
            ...(gestiones.data || []).map(g => g.unidad_id),
            ...(legacyUnits.data || []).map(u => u.id)
        ]));
        
        // Unificar resultados
        let allPdcs = [...(directPdcs || [])];
        const directIds = new Set(allPdcs.map(p => p.id));

        if (unidadIds.length > 0) {
            // Obtener PDCs de profesores que trabajan en estas unidades
            // PERO filtrando para que el PDC realmente tenga un área en esa unidad
            const { data: unitPdcs } = await db
                .from('pdcs')
                .select(`
                    *,
                    docente:perfiles!pdcs_docente_id_fkey (nombres, apellidos, foto_url),
                    pdcs_area_trabajo (
                        id,
                        areas_trabajo (
                            id,
                            unidad_educativa_id,
                            area_conocimiento:areas_conocimiento (nombre)
                        )
                    )
                `)
                .order('updated_at', { ascending: false });

            if (unitPdcs) {
                unitPdcs.forEach(p => {
                    if (directIds.has(p.id)) return;
                    
                    // Verificar si el PDC tiene al menos un área en las unidades del director
                    const hasAreaInUnit = p.pdcs_area_trabajo?.some((pat: any) => {
                        const areas = pat.areas_trabajo;
                        if (!areas) return false;
                        return (Array.isArray(areas) ? areas : [areas]).some((at: any) => unidadIds.includes(at.unidad_educativa_id));
                    });

                    if (hasAreaInUnit) {
                        allPdcs.push(p);
                    }
                });
            }
        }

        return { data: allPdcs as PDCMaster[], error: null, success: true };
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
            // Obtener Unidades que gestiona (Nuevo + Legacy)
            const [gestiones, legacyUnits] = await Promise.all([
                db.from('gestion_directores').select('unidad_id').eq('perfil_id', directorId),
                db.from('unidades_educativas').select('id').eq('director_id', directorId)
            ]);

            const unidadIds = Array.from(new Set([
                ...(gestiones.data || []).map(g => g.unidad_id),
                ...(legacyUnits.data || []).map(u => u.id)
            ]));

            if (unidadIds.length === 0) return { data: null, error: null, success: false };

            const { data: profesores } = await db
                .from('perfiles')
                .select('id')
                .in('unidad_educativa_id', unidadIds);

            const profesorIds = (profesores || []).map(p => p.id);
            
            if (profesorIds.length === 0) return { data: null, error: null, success: false };

            const { data: pdcs } = await db
                .from('pdcs')
                .select(`
                    id,
                    estado,
                    pdcs_area_trabajo (
                        areas_trabajo (unidad_educativa_id)
                    )
                `)
                .in('docente_id', profesorIds);

            if (!pdcs) return { data: null, error: null, success: false };

            let totalPdcs = 0;
            let completado = 0;
            let en_progreso = 0;
            let planificado = 0;

            pdcs.forEach((pdc: any) => {
                const isManagedUnit = pdc.pdcs_area_trabajo?.some((pat: any) => {
                    const areas = pat.areas_trabajo;
                    return (Array.isArray(areas) ? areas : [areas]).some((at: any) => unidadIds.includes(at.unidad_educativa_id));
                });
                
                if (!isManagedUnit) return;

                totalPdcs++;
                const estado = (pdc.estado || '').toLowerCase();
                
                if (estado === 'aprobado') {
                    completado++;
                } else if (['en revisión', 'observado', 'enviado'].includes(estado)) {
                    en_progreso++;
                } else {
                    planificado++;
                }
            });

            const analyticsData = {
                planningRate: totalPdcs > 0 ? 100 : 0, // 100% de los PDCs se cuentan como planificados
                executionRate: totalPdcs > 0 ? Math.round((completado / totalPdcs) * 100) : 0,
                totalContents: totalPdcs,
                distribution: {
                    completado,
                    en_progreso,
                    planificado
                }
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
            // Obtener Unidades que gestiona (Nuevo + Legacy)
            const [gestiones, legacyUnits] = await Promise.all([
                db.from('gestion_directores').select('unidad_id').eq('perfil_id', directorId),
                db.from('unidades_educativas').select('id').eq('director_id', directorId)
            ]);

            const unidadIds = Array.from(new Set([
                ...(gestiones.data || []).map(g => g.unidad_id),
                ...(legacyUnits.data || []).map(u => u.id)
            ]));

            if (unidadIds.length === 0) return { data: [], error: null, success: true };

            const { data: perfiles, error } = await db
                .from('perfiles')
                .select('id, nombres, apellidos, foto_url, email')
                .in('unidad_educativa_id', unidadIds);

            if (error || !perfiles) return { data: [], error, success: !error };

            // Enrich with PDC count per teacher
            const enriched = await Promise.all(
                perfiles.map(async (p: any) => {
                    const { data: teacherPdcs } = await db
                        .from('pdcs')
                        .select(`
                            id,
                            pdcs_area_trabajo (
                                areas_trabajo (unidad_educativa_id)
                            )
                        `)
                        .eq('docente_id', p.id);
                    
                    // Contar solo PDCs que tienen al menos un área en las unidades gestionadas
                    const relevantCount = (teacherPdcs || []).filter(pdc => 
                        pdc.pdcs_area_trabajo?.some((pat: any) => {
                            const areas = pat.areas_trabajo;
                            if (!areas) return false;
                            return (Array.isArray(areas) ? areas : [areas]).some((at: any) => unidadIds.includes(at.unidad_educativa_id));
                        })
                    ).length;

                    return { ...p, pdcCount: relevantCount || 0 };
                })
            );

            return { data: enriched, error: null, success: true };
        } catch (e: any) {
            console.error('getStaffPerformance error:', e);
            return { data: [], error: e, success: false };
        }
    }
};
