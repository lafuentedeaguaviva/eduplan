import { db } from "@/lib/database";
import { MaterialContenido } from "@/types";
import { AiOptimizationService } from "./aiOptimization.service";
import { SYSTEM_PROMPT_CONTENT_GENERATOR } from "@/lib/ai/promptTemplates";
import { AdminService } from "./admin.service";

export const ContentService = {
    /**
     * Guarda el contenido generado o actualizado en la base de datos.
     */
    async saveContent(data: Partial<MaterialContenido>): Promise<MaterialContenido> {
        if (data.id) {
            const { data: updated, error } = await db
                .from('material_contenido')
                .update({
                    ...data,
                    updated_at: new Date().toISOString()
                })
                .eq('id', data.id)
                .select()
                .single();

            if (error) throw error;
            return updated as MaterialContenido;
        } else {
            const { data: inserted, error } = await db
                .from('material_contenido')
                .insert({
                    ...data,
                    estado: data.estado || 'Borrador',
                })
                .select()
                .single();

            if (error) throw error;
            return inserted as MaterialContenido;
        }
    },

    /**
     * Obtiene el material de contenido por ID
     */
    async getContentById(id: string): Promise<MaterialContenido> {
        const { data, error } = await db
            .from('material_contenido')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as MaterialContenido;
    },

    /**
     * Obtiene todos los contenidos generados por un docente
     */
    async getTeacherContents(docenteId: string): Promise<MaterialContenido[]> {
        const { data, error } = await db
            .from('material_contenido')
            .select('*')
            .eq('docente_id', docenteId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as MaterialContenido[];
    },

    /**
     * Elimina un contenido generado
     */
    async deleteContent(id: string): Promise<boolean> {
        const { error } = await db
            .from('material_contenido')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    },

    /**
     * Obtiene el snapshot del PDC asociado a un área y los subtemas hijos de un tema padre
     */
    async getContextForGeneration(areaTrabajoId: string, temaPadreId: number) {
        // 1. Obtener los subtemas del tema padre
        const { data: subtemasData, error: subtemasError } = await db
            .from('contenidos_usuario')
            .select('titulo')
            .eq('padre_id', temaPadreId)
            .eq('area_trabajo_id', areaTrabajoId)
            .order('orden', { ascending: true });

        if (subtemasError) console.error("Error fetching subtemas:", subtemasError);
        const subtemas = (subtemasData || []).map(s => s.titulo);

        // 2. Encontrar el PDC asociado a esta área
        const { data: areaData } = await db
            .from('pdcs_area_trabajo')
            .select('pdc_id')
            .eq('area_trabajo_id', areaTrabajoId)
            .limit(1)
            .single();

        let pdcSnapshot = null;
        let pdcRevisionId = null;

        if (areaData?.pdc_id) {
            // Buscar en revisiones el último enviado
            const { data: revision } = await db
                .from('pdc_revisiones')
                .select('id, pdc_snapshot')
                .eq('pdc_origen_id', areaData.pdc_id)
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (revision) {
                pdcSnapshot = revision.pdc_snapshot;
                pdcRevisionId = revision.id;
            }
        }

        return { subtemas, pdcSnapshot, pdcRevisionId };
    },

    /**
     * Genera el contenido interactuando con la IA
     */
    async generateContent(
        temaPadre: string,
        subtemas: string[],
        pdcSnapshot: any,
        pdfContext: string,
        estructura: string,
        componentes: string[],
        extras: string[],
        profundidad: string,
        cursoInfo: string
    ) {
        // 1. Preparar el Prompt
        let template = SYSTEM_PROMPT_CONTENT_GENERATOR;
        try {
            const res = await AdminService.getGlobalSettings();
            if (res.success && res.data?.ia_config?.prompts?.content_generator) {
                template = res.data.ia_config.prompts.content_generator;
            }
        } catch (e) {
            console.warn("Could not fetch dynamic prompt, using default.");
        }

        // 2. Extraer contexto del snapshot
        let contextoMomentos = 'No se encontró planificación detallada (PDC) para este tema.';
        if (pdcSnapshot && pdcSnapshot.semanas) {
            const momParts = [];
            for (const semana of pdcSnapshot.semanas) {
                if (semana.temas && semana.temas.includes(temaPadre)) {
                    if (semana.momentos_ia) momParts.push(semana.momentos_ia);
                }
            }
            if (momParts.length > 0) {
                contextoMomentos = momParts.join('\n\n');
            } else {
                // Si no hay macheo exacto de temas, usar las primeras semanas como inspiración didáctica
                const randomSemana = pdcSnapshot.semanas[0];
                if (randomSemana && randomSemana.momentos_ia) {
                    contextoMomentos = `Inspiración didáctica del docente:\n${randomSemana.momentos_ia}`;
                }
            }
        }

        let instruccionProfundidad = 'Profundidad estándar, desarrolla las ideas con ejemplos. Longitud: 1000-1500 palabras.';
        if (profundidad === 'Corto') instruccionProfundidad = 'Sé muy conciso y directo al punto. Resume los conceptos principales de forma estructurada. Longitud aproximada: 500-800 palabras.';
        if (profundidad === 'Largo/Profundo') instruccionProfundidad = 'Extenso y profundo, detalla minuciosamente los conceptos teóricos, proporciona múltiples ejemplos, analogías complejas y contexto histórico si aplica. Longitud: 2000+ palabras.';

        const prompt = template
            .replace('[ESTRUCTURA_SELECCIONADA]', estructura || 'Clásica (Teoría, Ejemplos, Ejercicios)')
            .replace('[COMPONENTES_PEDAGOGICOS]', componentes.length > 0 ? componentes.join(', ') : 'Ninguno adicional')
            .replace('[EXTRAS_SELECCIONADOS]', extras.length > 0 ? extras.join(', ') : 'Ninguno adicional')
            .replace('[PROFUNDIDAD]', instruccionProfundidad)
            .replace('[CURSO]', cursoInfo || 'Estudiantes en general')
            .replace('[CONTEXTO_MOMENTOS_PDC]', contextoMomentos)
            .replace('[CONTEXTO_EXTRA_PDF]', pdfContext || 'Sin documento base proporcionado.')
            .replace('[TEMA_PADRE]', temaPadre)
            .replace('[LISTA_SUBTEMAS]', subtemas.join(', ') || 'No hay subtemas específicos.');

        console.log("Generating Content with prompt:\n", prompt);

        // 3. Llamar a la IA
        const generatedText = await AiOptimizationService._callProxy(prompt, 3, 10000);
        return generatedText;
    }
};
