import { db } from '@/lib/database';
import { ServiceResponse, LearningObjective } from '@/types';

/**
 * Service: PdcDesignService
 * Focus: Curricular design logic (Step 8/9), strategic objectives, and area associations.
 */
export const PdcDesignService = {

    /**
     * Vincula áreas de trabajo a un PDC, manejando la instancia de diseño (pdcs_area_trabajo).
     */
    async associateAreasToPdc(pdcId: string, areaIds: string[], sharedDesign: boolean = false): Promise<ServiceResponse<any>> {
        const cleanAreaIds = (areaIds || []).filter(id => !!id && typeof id === 'string');
        
        if (cleanAreaIds.length === 0) return { data: [], error: null, success: true };

        try {
            const results = [];
            let sharedPdcAreaId: string | null = null;

            if (sharedDesign) {
                const { data, error: patError } = await db
                    .from('pdcs_area_trabajo')
                    .insert({ pdc_id: pdcId })
                    .select('id')
                    .single();

                if (patError) throw patError;
                sharedPdcAreaId = (data as { id: string }).id;
            }

            for (const areaId of cleanAreaIds) {
                let currentPdcAreaId = sharedPdcAreaId;

                if (!sharedDesign) {
                    const { data, error: patError } = await db
                        .from('pdcs_area_trabajo')
                        .insert({ pdc_id: pdcId })
                        .select('id')
                        .single();

                    if (patError) throw patError;
                    currentPdcAreaId = (data as { id: string }).id;
                }

                await db.from('areas_trabajo')
                    .update({ pdc_area_trabajo_id: currentPdcAreaId })
                    .eq('id', areaId);

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
                .insert(objectives.map(obj => ({ pdc_area_trabajo_id: pdcAreaId, descripcion: obj.text })))
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
     * Obtiene el ID de la tabla de unión pdcs_area_trabajo para un área dada.
     */
    async getPdcAreaJunctionId(pdcId: string, areaId: string): Promise<ServiceResponse<string | null>> {
        try {
            // 1. Intento por área de trabajo (si ya está vinculada)
            const { data: areaData } = await db
                .from('areas_trabajo')
                .select('pdc_area_trabajo_id')
                .eq('id', areaId)
                .maybeSingle();

            if (areaData?.pdc_area_trabajo_id) {
                return { data: areaData.pdc_area_trabajo_id, error: null, success: true };
            }

            // 2. Intento por tabla de unión (relación PDC-Area)
            const { data: patData } = await db
                .from('pdcs_area_trabajo')
                .select('id')
                .eq('pdc_id', pdcId)
                .limit(1)
                .maybeSingle();

            if (patData?.id) return { data: patData.id, error: null, success: true };

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
            .insert({ pdc_area_trabajo_id: pdcAreaId, descripcion: objective.text })
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
    }
};
