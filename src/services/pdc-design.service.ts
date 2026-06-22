import { db } from '@/lib/database';
import { ServiceResponse, LearningObjective } from '@/types';
import { getMesInTrimester } from '@/lib/utils';
import { PdcScheduleService } from './pdc-schedule.service';

const capitalizeObjective = (text: string | null | undefined) => {
    if (!text) return "";
    return text.replace(/^([^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]*)([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ])/, (m, p, l) => p + l.toUpperCase());
};

/**
 * Service: PdcDesignService
 * Focus: Curricular design logic (Step 8/9), strategic objectives, and area associations.
 */
export const PdcDesignService = {

    /**
     * Vincula áreas de trabajo a un PDC, manejando la instancia de diseño (pdcs_area_trabajo).
     */
    async associateAreasToPdc(
        pdcId: string, 
        areaIds: string[], 
        sharedDesign: boolean = false,
        pdcWeeks?: any[]
    ): Promise<ServiceResponse<any>> {
        const cleanAreaIds = (areaIds || []).filter(id => !!id && typeof id === 'string');
        
        if (cleanAreaIds.length === 0) return { data: [], error: null, success: true };

        try {
            // Obtener contexto temporal del PDC para vincular las planificaciones semanales
            const { data: pdcData, error: pdcError } = await db
                .from('pdcs')
                .select('gestion, trimestre, mes')
                .eq('id', pdcId)
                .single();
                
            if (pdcError || !pdcData) {
                console.warn('[PdcDesignService] No se pudo obtener contexto temporal del PDC:', pdcError);
            }
            const relativeMes = pdcData?.mes ? getMesInTrimester(pdcData.mes) : null;

            // Asegurar que existan las semanas de planificación en la base de datos
            if (pdcData?.gestion && pdcData?.trimestre && pdcData?.mes) {
                await PdcScheduleService.ensureAreaWeeksExist(cleanAreaIds, pdcData.gestion, pdcData.trimestre, pdcData.mes);
            }

            const results = [];
            let sharedPdcAreaId: string | null = null;

            if (sharedDesign) {
                const { data, error: patError } = await db
                    .from('pdcs_area_trabajo')
                    .insert({ 
                        pdc_id: pdcId,
                        area_trabajo_id: cleanAreaIds[0] // Vincular al primer área como referencia primaria
                    })
                    .select('id')
                    .single();

                if (patError) throw patError;
                sharedPdcAreaId = (data as { id: string }).id;
            }

            for (const areaId of cleanAreaIds) {
                let currentPdcAreaId = sharedPdcAreaId;

                if (!sharedDesign) {
                    // Verificar si ya existe la relación para evitar duplicados
                    const { data: existing } = await db
                        .from('pdcs_area_trabajo')
                        .select('id')
                        .eq('pdc_id', pdcId)
                        .eq('area_trabajo_id', areaId)
                        .limit(1)
                        .maybeSingle();

                    if (existing) {
                        currentPdcAreaId = existing.id;
                    } else {
                        const { data, error: patError } = await db
                            .from('pdcs_area_trabajo')
                            .insert({ 
                                pdc_id: pdcId,
                                area_trabajo_id: areaId 
                            })
                            .select('id')
                            .single();

                        if (patError) throw patError;
                        currentPdcAreaId = (data as { id: string }).id;
                    }
                }

                // Mantener el vínculo inverso en areas_trabajo para compatibilidad con consultas existentes
                await db.from('areas_trabajo')
                    .update({ pdc_area_trabajo_id: currentPdcAreaId })
                    .eq('id', areaId);

                // Vincular las planificaciones semanales de esta área y periodo con el pdc_area_trabajo_id
                if (pdcWeeks && pdcWeeks.length > 0) {
                    for (const week of pdcWeeks) {
                        const weekSemana = week.semana;
                        const weekMes = week.mes; // relative mes
                        const weekTrimestre = week.trimestre;
                        const weekGestion = week.gestion;

                        if (weekSemana !== undefined && weekMes !== undefined && weekTrimestre !== undefined && weekGestion !== undefined) {
                            await db.from('planificacion_semanal')
                                .update({ pdc_area_trabajo_id: currentPdcAreaId })
                                .eq('area_trabajo_id', areaId)
                                .eq('gestion', weekGestion)
                                .eq('trimestre', weekTrimestre)
                                .eq('mes', weekMes)
                                .eq('semana', weekSemana);
                        }
                    }
                } else if (pdcData?.gestion && pdcData?.trimestre && relativeMes) {
                    await db.from('planificacion_semanal')
                        .update({ pdc_area_trabajo_id: currentPdcAreaId })
                        .eq('area_trabajo_id', areaId)
                        .eq('gestion', pdcData.gestion)
                        .eq('trimestre', pdcData.trimestre)
                        .eq('mes', relativeMes);
                }

                results.push({ areaId, pdcAreaTrabajoId: currentPdcAreaId });
            }

            return { data: results, error: null, success: true };

        } catch (error: any) {
            console.error('[PdcDesignService] Error associating areas:', error);
            return { data: null, error, success: false };
        }
    },

    /**
     * Guarda los objetivos estratégicos de un área.
     */
    async saveStrategicObjectives(pdcAreaId: string, objectives: LearningObjective[]): Promise<ServiceResponse<any>> {
        try {
            await db.from('objetivo_estrategico').delete().eq('pdc_area_trabajo_id', pdcAreaId);

            if (!objectives || objectives.length === 0) return { data: null, error: null, success: true };

            const { data: insertedObj, error: insertError } = await db
                .from('objetivo_estrategico')
                .insert(objectives.map(obj => ({ pdc_area_trabajo_id: pdcAreaId, descripcion: capitalizeObjective(obj.text) })))
                .select();

            if (insertError) throw insertError;

            const relaciones: any[] = [];
            insertedObj?.forEach((obj, i) => {
                objectives[i].contentIds?.forEach(cId => {
                    relaciones.push({ objetivo_estrategico_id: obj.id, contenido_usuario_id: cId });
                });
            });

            if (relaciones.length > 0) {
                const { error: relError } = await db.from('objetivo_estrategico_contenido').insert(relaciones);
                if (relError) throw relError;
            }

            return { data: insertedObj, error: null, success: true };
        } catch (error: any) {
            return { data: null, error, success: false };
        }
    },

    /**
     * Recupera los objetivos estratégicos.
     */
    async getStrategicObjectives(pdcAreaId: string): Promise<ServiceResponse<LearningObjective[]>> {
        const { data, error } = await db
            .from('objetivo_estrategico')
            .select(`
                id,
                descripcion,
                objetivo_estrategico_contenido (
                    contenido_usuario_id
                )
            `)
            .eq('pdc_area_trabajo_id', pdcAreaId)
            .order('created_at', { ascending: true });

        if (error) return { data: [], error, success: false };

        const mapped = (data || []).map((row: any) => ({
            text: row.descripcion,
            contentIds: (row.objetivo_estrategico_contenido || []).map((rel: any) => rel.contenido_usuario_id)
        }));

        return { data: mapped, error: null, success: true };
    },

    /**
     * Une todos los objetivos estratégicos de un área y los guarda en pdcs_area_trabajo
     */
    async consolidateStrategicObjectives(pdcAreaId: string): Promise<ServiceResponse<string>> {
        try {
            // 1. Obtener objetivos
            const { data: objectives, error: objError } = await db
                .from('objetivo_estrategico')
                .select('descripcion')
                .eq('pdc_area_trabajo_id', pdcAreaId)
                .order('created_at', { ascending: true });

            if (objError) throw objError;

            // 2. Concatenar
            const consolidatedText = capitalizeObjective((objectives || [])
                .map(obj => obj.descripcion?.trim())
                .filter(Boolean)
                .join('. '));

            // 3. Guardar en pdcs_area_trabajo (Asegurarse que el usuario crea las columnas en Supabase)
            const { error: updError } = await db
                .from('pdcs_area_trabajo')
                .update({ 
                    objetivo_estrategico: consolidatedText
                })
                .eq('id', pdcAreaId);

            if (updError) throw updError;

            return { data: consolidatedText, error: null, success: true };
        } catch (error: any) {
            console.error('[PdcDesignService] Error consolidating objectives:', error);
            return { data: '', error, success: false };
        }
    },

    /**
     * Obtiene el ID de la tabla de unión pdcs_area_trabajo para un área dada.
     */
    async getPdcAreaJunctionId(pdcId: string, areaId: string): Promise<ServiceResponse<string | null>> {
        console.log(`[DEBUG] getPdcAreaJunctionId called with pdcId: ${pdcId}, areaId: ${areaId}`);
        try {
            // 1. Buscar en la tabla de unión explícita pdcs_area_trabajo
            const { data: patDataList, error: patError } = await db
                .from('pdcs_area_trabajo')
                .select('id')
                .eq('pdc_id', pdcId)
                .eq('area_trabajo_id', areaId);

            if (patDataList && patDataList.length > 0) {
                if (patDataList.length === 1) {
                    console.log(`[DEBUG] Found via pdcs_area_trabajo: ${patDataList[0].id}`);
                    return { data: patDataList[0].id, error: null, success: true };
                }

                console.warn(`[DEBUG] ATENCIÓN: Se encontraron ${patDataList.length} registros duplicados en pdcs_area_trabajo para pdcId: ${pdcId} y areaId: ${areaId}. Buscando el que tiene datos...`);
                
                // Si hay duplicados, buscamos el que tenga objetivos guardados
                for (const pat of patDataList) {
                    const { count } = await db
                        .from('objetivo_estrategico')
                        .select('id', { count: 'exact', head: true })
                        .eq('pdc_area_trabajo_id', pat.id);
                        
                    if (count && count > 0) {
                        console.log(`[DEBUG] Se eligió el registro ${pat.id} porque contiene objetivos estratégicos.`);
                        return { data: pat.id, error: null, success: true };
                    }
                }
                
                // Si ninguno tiene objetivos, devolvemos el más antiguo
                console.log(`[DEBUG] Ningún duplicado tiene objetivos, se usará el primero: ${patDataList[0].id}`);
                return { data: patDataList[0].id, error: null, success: true };
            }

            // 2. Fallback: buscar si por compatibilidad legacy está en areas_trabajo
            // Solo usar si el pdc_area_trabajo_id allí guardado realmente pertenece a este PDC
            const { data: areaData } = await db
                .from('areas_trabajo')
                .select('pdc_area_trabajo_id')
                .eq('id', areaId)
                .maybeSingle();

            if (areaData?.pdc_area_trabajo_id) {
                const { data: verifyData } = await db
                    .from('pdcs_area_trabajo')
                    .select('id')
                    .eq('id', areaData.pdc_area_trabajo_id)
                    .eq('pdc_id', pdcId)
                    .limit(1)
                    .maybeSingle();
                    
                if (verifyData?.id) {
                    console.log(`[DEBUG] Found via fallback areas_trabajo: ${verifyData.id}`);
                    return { data: verifyData.id, error: null, success: true };
                }
            }

            console.log(`[DEBUG] No junction found for pdcId: ${pdcId}, areaId: ${areaId}`);
            return { data: null, error: null, success: true };
        } catch (err: any) {
            console.error('[PdcDesignService] Error en getPdcAreaJunctionId:', err);
            return { data: null, error: err, success: false };
        }
    },

    /**
     * Añade un único objetivo estratégico.
     */
    async addStrategicObjective(pdcAreaId: string, objective: LearningObjective): Promise<ServiceResponse<any>> {
        const { data, error } = await db
            .from('objetivo_estrategico')
            .insert({ pdc_area_trabajo_id: pdcAreaId, descripcion: capitalizeObjective(objective.text) })
            .select()
            .single();

        if (error) return { data: null, error, success: false };

        if (objective.contentIds && objective.contentIds.length > 0) {
            const relaciones = objective.contentIds.map(cId => ({
                objetivo_estrategico_id: data.id,
                contenido_usuario_id: cId
            }));
            await db.from('objetivo_estrategico_contenido').insert(relaciones);
        }

        return { data, error: null, success: true };
    },

    /**
     * Elimina un objetivo estratégico específico por su descripción.
     */
    async deleteStrategicObjective(pdcAreaId: string, description: string): Promise<ServiceResponse<any>> {
        const { data, error } = await db
            .from('objetivo_estrategico')
            .delete()
            .eq('pdc_area_trabajo_id', pdcAreaId)
            .eq('descripcion', description)
            .select();

        return { data, error, success: !error };
    },

    /**
     * Actualiza los periodos de carga horaria.
     */
    async updatePeriods(pdcAreaId: string, periods: number): Promise<ServiceResponse<any>> {
        try {
            const { error } = await db
                .from('pdcs_area_trabajo')
                .update({ 
                    periodo_semanal: periods
                })
                .eq('id', pdcAreaId);

            return { data: null, error, success: !error };
        } catch (err: any) {
            return { data: null, error: err, success: false };
        }
    },

    /**
     * Obtiene los periodos de carga horaria semanal.
     */
    async getPeriods(pdcAreaId: string): Promise<ServiceResponse<number>> {
        const { data, error } = await db
            .from('pdcs_area_trabajo')
            .select('periodo_semanal')
            .eq('id', pdcAreaId)
            .maybeSingle();

        return { data: data?.periodo_semanal || 0, error, success: !error };
    },

    /**
     * Obtiene la adaptación no significativa (Paso 9).
     */
    async getAdaptacionNoSig(pdcAreaId: string): Promise<ServiceResponse<string>> {
        const { data, error } = await db
            .from('pdcs_area_trabajo')
            .select('adaptaciones_no_significativas')
            .eq('id', pdcAreaId)
            .maybeSingle();
        return { data: data?.adaptaciones_no_significativas || '', error, success: !error };
    },

    /**
     * Actualiza la adaptación no significativa.
     */
    async updateAdaptacionNoSig(pdcAreaId: string, text: string): Promise<ServiceResponse<any>> {
        const { error } = await db
            .from('pdcs_area_trabajo')
            .update({ adaptaciones_no_significativas: text })
            .eq('id', pdcAreaId);
        return { data: null, error, success: !error };
    }
};
