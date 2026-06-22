import { db } from "@/lib/database";

export interface PdcRevision {
    id: string;
    pdc_origen_id: string;
    profesor_id: string;
    director_id: string | null;
    materia: string;
    grado: string;
    nivel: string;
    estado: 'enviado' | 'observado' | 'aprobado' | 'revisado' | 'finalizado';
    pdc_estado: string;
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
    async previewDirector(pdcId: string, pdcNivel: string): Promise<{ id: string, nombre: string }> {
        const { data: pdcData, error: pdcError } = await db
            .from('pdcs')
            .select(`
                id,
                pdcs_area_trabajo (
                    areas_trabajo ( unidad_educativa_id )
                )
            `)
            .eq('id', pdcId)
            .single();

        if (pdcError || !pdcData) throw new Error("PDC no encontrado.");

        let ueId = null;
        const pdcsAreaTrabajo = pdcData.pdcs_area_trabajo as any[];
        if (pdcsAreaTrabajo && pdcsAreaTrabajo.length > 0) {
            const at = pdcsAreaTrabajo[0].areas_trabajo;
            if (at) ueId = Array.isArray(at) ? at[0]?.unidad_educativa_id : at.unidad_educativa_id;
        }

        if (!ueId) throw new Error("No se pudo identificar la Unidad Educativa asociada a este PDC.");

        let nivelKeyword = 'General';
        const nivel = (pdcNivel || '').toLowerCase();
        if (nivel.includes('inicial')) nivelKeyword = 'Inicial';
        else if (nivel.includes('primaria')) nivelKeyword = 'Primaria';
        else if (nivel.includes('secundaria')) nivelKeyword = 'Secundaria';

        const { data: dirs, error: dirError } = await db
            .from('gestion_directores')
            .select('perfil_id, nivel')
            .eq('unidad_id', ueId)
            .in('nivel', [nivelKeyword, 'General']);

        if (dirError) throw new Error("Error al buscar directores.");

        if (!dirs || dirs.length === 0) {
            throw new Error(`No se encontró ningún director asociado a tu colegio para el nivel ${nivelKeyword} o General.`);
        }

        const specificDir = dirs.find(d => d.nivel === nivelKeyword);
        const dirId = specificDir ? specificDir.perfil_id : dirs[0].perfil_id;

        const { data: perfil } = await db.from('perfiles').select('nombres, apellidos').eq('id', dirId).single();
        const nombre = perfil ? `${perfil.nombres} ${perfil.apellidos}`.trim() : "Director";

        return { id: dirId, nombre };
    },

    async submitForReview(
        pdcId: string, 
        profesorId: string, 
        materia: string, 
        grado: string, 
        nivel: string, 
        snapshot: any,
        isDraft: boolean = true,
        isSending: boolean = false
    ) {
        const { data: existing } = await db
            .from('pdc_revisiones')
            .select('id, director_id')
            .eq('pdc_origen_id', pdcId)
            .maybeSingle();

        let assignedDirectorId = existing ? existing.director_id : snapshot.director_id || null;
        if (isSending && !assignedDirectorId) {
            const dir = await this.previewDirector(pdcId, nivel);
            assignedDirectorId = dir.id;
        }

        if (existing) {
            const { data, error } = await db
                .from('pdc_revisiones')
                .update({
                    materia,
                    grado,
                    nivel,
                    director_id: assignedDirectorId,
                    estado: isSending ? 'enviado' : (isDraft ? 'borrador' : 'finalizado'),
                    pdc_estado: isSending ? 'Enviado' : (isDraft ? 'Borrador' : 'Finalizado'),
                    pdc_snapshot: snapshot,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            return data as PdcRevision;
        }

        const { data, error } = await db
            .from('pdc_revisiones')
            .insert({
                pdc_origen_id: pdcId,
                profesor_id: profesorId,
                director_id: assignedDirectorId,
                materia,
                grado,
                nivel,
                estado: isSending ? 'enviado' : (isDraft ? 'borrador' : 'finalizado'),
                pdc_estado: isSending ? 'Enviado' : (isDraft ? 'Borrador' : 'Finalizado'),
                version: 1,
                pdc_snapshot: snapshot,
                observaciones: null
            })
            .select()
            .single();

        if (error) throw error;

        // CRITICAL: Backfill the director_id into the original pdcs table
        // This ensures Row Level Security (RLS) grants the director access to the PDC.
        if (assignedDirectorId) {
            await db.from('pdcs').update({ director_id: assignedDirectorId }).eq('id', pdcId);
        }

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
    async getDirectorInbox(directorId: string) {
        // 1. Obtener Revisiones vinculadas directamente por director_id (Nuevo Estándar)
        const { data: directRevisions, error: directError } = await db
            .from('pdc_revisiones')
            .select('*, perfiles!profesor_id(nombres, apellidos)')
            .eq('director_id', directorId)
            .neq('pdc_estado', 'Borrador')
            .order('updated_at', { ascending: false });

        if (directError) throw directError;

        // 2. Obtener Revisiones de los profesores de las Unidades Educativas que gestiona (Fallback)
        const [gestiones, legacyUnits] = await Promise.all([
            db.from('gestion_directores').select('unidad_id').eq('perfil_id', directorId),
            db.from('unidades_educativas').select('id').eq('director_id', directorId)
        ]);

        const unidadIds = Array.from(new Set([
            ...(gestiones.data || []).map(g => g.unidad_id),
            ...(legacyUnits.data || []).map(u => u.id)
        ]));
        let allRevisions = [...(directRevisions || [])];
        const directIds = new Set(allRevisions.map(r => r.id));

        if (unidadIds.length > 0) {
            const { data: unitRevisions, error: unitError } = await db
                .from('pdc_revisiones')
                .select(`
                    *,
                    perfiles!profesor_id(nombres, apellidos),
                    pdcs!pdc_origen_id (
                        pdcs_area_trabajo (
                            areas_trabajo ( unidad_educativa_id )
                        )
                    )
                `)
                .neq('pdc_estado', 'Borrador')
                .order('updated_at', { ascending: false });

            if (unitError) throw unitError;

            // Combinar sin duplicados y filtrando por pertenencia a Unidad
            (unitRevisions || []).forEach((rev: any) => {
                if (directIds.has(rev.id)) return;

                // Verificar pertenencia usando las relaciones de base de datos
                let belongsToUnit = false;
                const pdcRel = rev.pdcs;
                if (pdcRel && pdcRel.pdcs_area_trabajo) {
                    belongsToUnit = pdcRel.pdcs_area_trabajo.some((pat: any) => {
                        const at = pat.areas_trabajo;
                        if (!at) return false;
                        if (Array.isArray(at)) {
                            return at.some((a: any) => unidadIds.includes(a.unidad_educativa_id));
                        }
                        return unidadIds.includes(at.unidad_educativa_id);
                    });
                }

                if (belongsToUnit) {
                    // Limpiamos la relación anidada para no afectar el resto del sistema
                    const { pdcs, ...cleanRev } = rev;
                    allRevisions.push(cleanRev);
                }
            });
        }
        
        return allRevisions.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    },

    /**
     * Director: Cambiar estado del PDC (Aprobar o Devolver con observaciones)
     */
    async updateReviewStatus(
        revisionId: string, 
        directorId: string, 
        estado: 'observado' | 'aprobado' | 'revisado', 
        observaciones?: any
    ) {
        // Usamos una API route con Service Role para saltarnos el RLS 
        // ya que el Director a veces no está formalmente asignado aún en la BD.
        const res = await fetch('/api/pdc/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                revisionId,
                directorId,
                estado,
                observaciones: observaciones || null
            })
        });

        const json = await res.json();
        if (!res.ok) {
            throw new Error(json.error || "No se pudo actualizar la revisión (Error de API)");
        }
        
        return json.data as PdcRevision;
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
                pdc_estado: 'Enviado',
                version: currentVersion + 1,
                observaciones: null // Limpiamos la pizarra para el director
            })
            .eq('id', revisionId)
            .select()
            .single();

        if (error) {
            console.error("[PdcRevisionesService] Error en submitForReview:", error);
            throw error;
        }
        console.log("[PdcRevisionesService] Snapshot insertado exitosamente:", data?.id);
        return data as PdcRevision;
    },
    
    /**
     * Maestro: Actualizar el snapshot de una revisión existente.
     * Útil cuando el maestro "Finaliza" el wizard por segunda vez.
     */
    async updateSnapshotByPdcId(pdcId: string, snapshot: any, isDraft: boolean = true) {
        const { data, error } = await db
            .from('pdc_revisiones')
            .update({
                materia: snapshot.areas || 'Varias Áreas',
                grado: snapshot.grados || '',
                nivel: snapshot.niveles || '',
                pdc_estado: isDraft ? 'Borrador' : 'Finalizado',
                pdc_snapshot: snapshot,
                updated_at: new Date().toISOString()
            })
            .eq('pdc_origen_id', pdcId)
            .select()
            .maybeSingle();

        if (error) {
            console.error("[PdcRevisionesService] Error en updateSnapshotByPdcId:", error);
            throw error;
        }
        console.log("[PdcRevisionesService] Snapshot actualizado exitosamente para PDC:", pdcId);
        return data;
    },

    /**
     * Verificar si existe una revisión para un PDC.
     */
    async getRevisionByPdcId(pdcId: string) {
        const { data, error } = await db
            .from('pdc_revisiones')
            .select('*')
            .eq('pdc_origen_id', pdcId)
            .maybeSingle();

        if (error) throw error;
        return data as PdcRevision | null;
    },

    /**
     * Maestro: Cambiar estado de 'listo' a 'enviado'.
     * Efectiviza el envío al Director.
     */
    async sendToDirector(revisionId: string) {
        const { data: rev } = await db.from('pdc_revisiones').select('pdc_origen_id, nivel').eq('id', revisionId).single();
        if (!rev) throw new Error("Revisión no encontrada");

        const dir = await this.previewDirector(rev.pdc_origen_id, rev.nivel);

        const { data, error } = await db
            .from('pdc_revisiones')
            .update({ 
                estado: 'enviado',
                pdc_estado: 'Enviado',
                director_id: dir.id,
                updated_at: new Date().toISOString() 
            })
            .eq('id', revisionId)
            .select()
            .single();

        if (error) throw error;
        return data as PdcRevision;
    }
};
