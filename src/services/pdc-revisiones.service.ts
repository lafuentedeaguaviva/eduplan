import { db } from "../lib/database";

export interface PdcRevision {
    id: string;
    pdc_origen_id: string;
    profesor_id: string;
    director_id: string | null;
    materia: string;
    grado: string;
    nivel: string;
    estado: 'enviado' | 'observado' | 'aprobado';
    pdc_snapshot: any; // El JSON completo (el reporte final)
    observaciones: any; // Comentarios del director
    version: number;
    created_at: string;
    updated_at: string;
}

/**
 * Servicio para gestionar el flujo de Aprobación de PDCs (Director <-> Maestro)
 * Implementa el Patrón Snapshot (Opción B).
 */
export const PdcRevisionesService = {
    /**
     * Maestro: Enviar PDC original a revisión.
     * Toma el documento final (snapshot) y lo congela en la v1.
     */
    async submitForReview(
        pdcId: string, 
        profesorId: string, 
        materia: string, 
        grado: string, 
        nivel: string, 
        snapshot: any
    ) {
        // 1. Verificar si ya existe una revisión en curso para no duplicar
        const { data: existing } = await db
            .from('pdc_revisiones')
            .select('id')
            .eq('pdc_origen_id', pdcId)
            .single();

        if (existing) {
            throw new Error("Este PDC ya se encuentra en el circuito de revisión.");
        }

        // 2. Insertar el Snapshot
        const { data, error } = await db
            .from('pdc_revisiones')
            .insert({
                pdc_origen_id: pdcId,
                profesor_id: profesorId,
                materia,
                grado,
                nivel,
                estado: 'enviado',
                version: 1,
                pdc_snapshot: snapshot,
                observaciones: null
            })
            .select()
            .single();

        if (error) throw error;
        return data as PdcRevision;
    },

    /**
     * Maestro: Obtener su Bandeja de PDCs enviados (Para la nueva pestaña)
     */
    async getTeacherSubmissions(profesorId: string) {
        const { data, error } = await db
            .from('pdc_revisiones')
            .select('*')
            .eq('profesor_id', profesorId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as PdcRevision[];
    },

    /**
     * Director: Obtener su Bandeja de Entrada (Todos los PDCs enviados)
     * En el futuro se puede filtrar por unidad_educativa_id si el director administra una escuela específica.
     */
    async getDirectorInbox() {
        const { data, error } = await db
            .from('pdc_revisiones')
            .select('*, perfiles!profesor_id(nombres, apellidos)') // Traemos datos del profesor
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    /**
     * Director: Cambiar estado del PDC (Aprobar o Devolver con observaciones)
     */
    async updateReviewStatus(
        revisionId: string, 
        directorId: string, 
        estado: 'observado' | 'aprobado', 
        observaciones?: any
    ) {
        const { data, error } = await db
            .from('pdc_revisiones')
            .update({
                estado,
                director_id: directorId,
                observaciones: observaciones || null
            })
            .eq('id', revisionId)
            .select()
            .single();

        if (error) throw error;
        return data as PdcRevision;
    },

    /**
     * Maestro: Reenviar corrección usando el "Fast Editor" sobre el JSON (Opción B)
     * Sube la versión e inicializa el estado a enviado.
     */
    async resubmitCorrection(revisionId: string, newSnapshot: any) {
        // Obtener la versión actual para incrementarla atómicamente
        const { data: current } = await db
            .from('pdc_revisiones')
            .select('version')
            .eq('id', revisionId)
            .single();

        const currentVersion = current?.version || 1;

        const { data, error } = await db
            .from('pdc_revisiones')
            .update({
                pdc_snapshot: newSnapshot, // El JSON modificado
                estado: 'enviado',
                version: currentVersion + 1,
                observaciones: null // Limpiamos la pizarra para el director
            })
            .eq('id', revisionId)
            .select()
            .single();

        if (error) throw error;
        return data as PdcRevision;
    }
};
