import { db } from "../lib/database";
import { AiService } from "./ai.service";
import {
    TonoRedaccion,
    SYSTEM_PROMPT_BATCH_CRITERIOS,
    SYSTEM_PROMPT_STRATEGIC_OBJECTIVE,
    SYSTEM_PROMPT_WEEKLY_BATCH,
    TONOS_INSTRUCTION
} from "../lib/ai/promptTemplates";

/**
 * Servicio de Optimización IA Batch.
 * Centraliza la reformulación del PDC en campos espejo (_ia).
 */
export const AiOptimizationService = {
    async _callProxy(prompt: string, retries = 5, backoff = 5000): Promise<string> {
        // Intentar primero con DeepSeek como proveedor principal (según solicitud del usuario)
        try {
            console.log('[AiOptimization] Usando DeepSeek como proveedor principal...');
            return await this._executeWithProvider('/api/deepseek', prompt, retries, backoff);
        } catch (deepseekError: any) {
            console.warn('[AiOptimization] DeepSeek falló, intentando failover a Gemini:', deepseekError.message);

            // Failover a Gemini si DeepSeek falla
            try {
                console.log('[AiOptimization] Activando failover Gemini...');
                return await this._executeWithProvider('/api/gemini', prompt, 3, 8000);
            } catch (geminiError: any) {
                console.error('[AiOptimization] Ambos proveedores fallaron:', geminiError.message);
                throw new Error(`Servicios de IA no disponibles. DeepSeek reportó: ${deepseekError.message}`);
            }
        }
    },

    /**
     * Obtiene la configuración dinámica guardada por el administrador.
     */
    async _getDynamicConfig() {
        try {
            const { AdminService } = await import("./admin.service");
            const res = await AdminService.getGlobalSettings();
            return res.success && res.data?.ia_config ? res.data.ia_config : null;
        } catch (e) {
            console.error("[AiOptimization] Error fetching dynamic config:", e);
            return null;
        }
    },

    /**
     * Construye el string de contexto basado en la configuración del administrador.
     */
    _buildContextStr(ctx: any, contentsStr?: string, config?: any) {
        if (!ctx) return 'Contexto no disponible';
        
        const fields = config?.context_fields || { nivel: true, grado: true, area: true, temas: true };
        const parts = [];
        
        if (fields.nivel && ctx.areas_conocimiento?.grados?.niveles?.nombre) 
            parts.push(`Nivel: ${ctx.areas_conocimiento.grados.niveles.nombre}`);
        
        if (fields.grado && ctx.areas_conocimiento?.grados?.nombre) 
            parts.push(`Grado: ${ctx.areas_conocimiento.grados.nombre}`);
            
        if (fields.area && ctx.areas_conocimiento?.nombre) 
            parts.push(`Área: ${ctx.areas_conocimiento.nombre}`);
            
        if (fields.temas && contentsStr) 
            parts.push(`Temas: ${contentsStr}`);
            
        return parts.join(', ') || 'Información básica del PDC';
    },


    /**
     * Ejecutor genérico para llamadas a proxies de IA con reintentos y Smart Backoff.
     */
    async _executeWithProvider(endpoint: string, prompt: string, retries: number, backoff: number): Promise<string> {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });

                const responseText = await response.text();

                if (!response.ok) {
                    // Si es un error 503 (Unavailable) o 429 (Too Many Requests), intentar de nuevo localmente
                    if ((response.status === 503 || response.status === 429) && i < retries - 1) {
                        let dynamicBackoff = backoff;
                        const retryMatch = responseText.match(/retry in (\d+(?:\.\d+)?)s/i);
                        if (retryMatch && retryMatch[1]) {
                            dynamicBackoff = Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1000;
                        }
                        await new Promise(resolve => setTimeout(resolve, dynamicBackoff));
                        continue;
                    }
                    throw new Error(`Error de la API (${response.status}): ${responseText}`);
                }

                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    throw new Error(`La API devolvió un formato no válido (no es JSON). Respuesta: ${responseText.substring(0, 200)}...`);
                }

                return data.text;
            } catch (error: any) {
                if (i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, backoff * (i + 1)));
                } else {
                    throw error;
                }
            }
        }
        throw new Error(`Máximo de reintentos alcanzado en ${endpoint}`);
    },

    _cleanMomentos(text: string): string {
        if (!text) return '';
        const regex = /(?:^|\n)\s*(?:\d*\.?\s*|\-\s*|\*\s*)*(?:PRÁCTICA|TEORÍA|PRODUCCIÓN|VALORACIÓN)/i;
        const match = text.match(regex);
        if (match && match.index !== undefined) {
            return text.substring(match.index).trim();
        }
        return text.replace(/^(?:Por supuesto|A continuación|Aquí tienes|Claro|En este caso|Para la).*?\n/gi, '').trim();
    },

    /**
     * Limpia los campos generados por IA previamente para evitar duplicaciones o inconsistencias.
     */
    async clearAiFields(pdcId: string) {
        try {
            const { data: areas } = await db.from('pdcs_area_trabajo').select('id, area_trabajo_id').eq('pdc_id', pdcId);
            if (!areas) return;

            for (const area of areas) {
                await db.from('pdcs_area_trabajo')
                    .update({
                        objetivo_estrategico_ia: null,
                        criterios_evaluacion_ia: null,
                        adaptaciones_no_significativas_ia: null,
                        criterios_evaluacion_adaptaciones_ia: null
                    })
                    .eq('id', area.id);

                await db.from('objetivo_estrategico')
                    .update({ descripcion_ia: null })
                    .eq('pdc_area_trabajo_id', area.id);

                if (area.area_trabajo_id) {
                    const { data: pdc } = await db.from('pdcs').select('gestion, trimestre').eq('id', pdcId).single();
                    if (pdc) {
                        await db.from('planificacion_semanal')
                            .update({
                                momentos_ia: null,
                                recursos_fuentes_ia: null,
                                adaptaciones_basicas_ia: null,
                                adaptaciones_especiales_ia: null
                            })
                            .eq('area_trabajo_id', area.area_trabajo_id)
                            .eq('gestion', pdc.gestion)
                            .eq('trimestre', pdc.trimestre);
                    }
                }
            }
        } catch (e) {
            console.error('[AiOptimization] Error al limpiar campos IA previos:', e);
        }
    },

    /**
     * Procesa todo el PDC para optimizarlo según el tono seleccionado.
     */
    async refineFullPdc(
        pdcId: string,
        tone: TonoRedaccion,
        depth: string,
        userId: string,
        accessToken: string,
        onProgress?: (msg: string, stepProgress?: number) => void
    ) {
        // 1. Obtener áreas de trabajo vinculadas al PDC (incluyendo area_trabajo_id directamente)
        const { data: areas, error: areaError } = await db
            .from('pdcs_area_trabajo')
            .select('id, area_trabajo_id')
            .eq('pdc_id', pdcId);

        if (areaError) throw areaError;
        if (!areas) return;

        const areaPromises = areas.map(async (area) => {
            const areaTrabajoId = area.area_trabajo_id;
            if (!areaTrabajoId) {
                console.warn(`[AiOptimizationService] No hay area_trabajo_id en pdcs_area_trabajo: ${area.id}`);
                return;
            }
            onProgress?.(`Optimizando área: ${area.id}...`, 5);
            await this.refineArea(area.id, areaTrabajoId, tone, depth, userId, accessToken, onProgress);
        });
        
        await Promise.all(areaPromises);
    },

    /**
     * Refina una área específica del PDC.
     */
    async refineArea(pdcAreaId: string, areaTrabajoId: string, tone: TonoRedaccion, depth: string, userId: string, accessToken: string, onProgress?: (msg: string, stepProgress?: number) => void) {
        onProgress?.(`Iniciando optimización secuencial del área...`, 5);
        // Ejecutar refinamientos secuencialmente para evitar cuellos de botella y errores 429
        await this._refineObjectives(pdcAreaId, tone, depth, userId, accessToken, onProgress);
        await this._refineCriteria(pdcAreaId, tone, depth, userId, accessToken, onProgress);
        await this._refineWeeklyData(pdcAreaId, areaTrabajoId, tone, depth, userId, accessToken, onProgress);
    },

    /**
     * Refina los objetivos estratégicos de un área.
     */
    async _refineObjectives(pdcAreaId: string, tone: TonoRedaccion, depth: string, userId: string, accessToken: string, onProgress?: (msg: string, stepProgress?: number) => void) {
        onProgress?.(`Refinando objetivos estratégicos...`, 2);

        // Obtener contexto real del área, grado y contenidos planificados
        const { data: areaContext } = await db
            .from('pdcs_area_trabajo')
            .select(`
                pdc_id,
                areas_trabajo (
                    areas_conocimiento (
                        nombre,
                        grados (
                            nombre,
                            niveles (nombre)
                        )
                    ),
                    planificacion_semanal (
                        semana_contenido (
                            contenidos_usuario (titulo, padre_id)
                        )
                    )
                )
            `)
            .eq('id', pdcAreaId)
            .single();

        const ctxArray = areaContext?.areas_trabajo as any;
        const ctx = Array.isArray(ctxArray) ? ctxArray[0] : ctxArray;
        
        // Extraer solo los títulos principales (padres) para ahorrar tokens
        const allContents = (ctx?.planificacion_semanal as any[])?.flatMap(w => 
            (w.semana_contenido as any[])?.map(sc => 
                (!sc.contenidos_usuario?.padre_id) ? sc.contenidos_usuario?.titulo : null
            )
        ).filter(Boolean);
        const uniqueContents = [...new Set(allContents)].join(', ');

        // Obtener configuración dinámica
        const dynamicConfig = await this._getDynamicConfig();
        
        const { data: objetivosOriginales, error } = await db
            .from('objetivo_estrategico')
            .select('id, descripcion')
            .eq('pdc_area_trabajo_id', pdcAreaId);

        let objetivosPasar = objetivosOriginales || [];
        if (objetivosPasar.length === 0) {
            if (depth.includes('ampliamente') || depth.includes('profundamente')) {
                objetivosPasar = [{ id: 'nuevo_1', descripcion: 'Generar sugerencia de objetivo estratégico para esta área.' }];
            } else {
                return;
            }
        }

        const contextStr = this._buildContextStr(ctx, uniqueContents, dynamicConfig);
        const template = dynamicConfig?.prompts?.strategic_objective || SYSTEM_PROMPT_STRATEGIC_OBJECTIVE;

        const objetivosDatos = JSON.stringify(objetivosPasar);

        const prompt = template
            .replace('[TONO_SELECCIONADO]', TONOS_INSTRUCTION[tone as TonoRedaccion] || tone)
            .replace('[CORRECCION_PROFUNDIDAD]', depth)
            .replace('[DATOS_OBJETIVOS]', objetivosDatos)
            .replace('[CONTEXTO_PDC]', contextStr);

        try {
            // console.log(`\n\n========== PROMPT ENVIADO A IA (OBJETIVOS) ==========\n${prompt}\n====================================================\n`);
            const rawResponse = await this._callProxy(prompt);
            const extractJsonArray = (text: string) => {
                const start = text.indexOf('[');
                const end = text.lastIndexOf(']');
                if (start !== -1 && end !== -1 && end > start) {
                    return text.substring(start, end + 1);
                }
                return text.replace(/```json/g, '').replace(/```/g, '').trim();
            };

            let parsed: any[] = [];
            try {
                parsed = JSON.parse(extractJsonArray(rawResponse));
                // Ensure first letter is capitalized, ignoring leading symbols like hyphens
                parsed = parsed.map(obj => ({
                    ...obj,
                    descripcion_ia: obj.descripcion_ia ? obj.descripcion_ia.replace(/^([^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]*)([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ])/, (m: string, p: string, l: string) => p + l.toUpperCase()) : obj.descripcion_ia
                }));
            } catch (e) {
                console.warn(`[AiOptimization] JSON.parse falló para objetivos array.`, e);
            }
            
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Actualizar individualmente cada objetivo
                const updatePromises = parsed.map(async (obj) => {
                    if (obj.descripcion_ia) {
                        if (obj.id === 'nuevo_1') {
                            return db.from('objetivo_estrategico').insert({
                                pdc_area_trabajo_id: pdcAreaId,
                                descripcion: '',
                                descripcion_ia: obj.descripcion_ia
                            });
                        } else if (obj.id) {
                            return db.from('objetivo_estrategico')
                                .update({ descripcion_ia: obj.descripcion_ia })
                                .eq('id', obj.id);
                        }
                    }
                });
                await Promise.all(updatePromises);
                
                // Actualizar campo global con la unión para consistencia heredada
                const finalIaText = parsed.map(o => o.descripcion_ia).filter(Boolean).join("\n");
                if (finalIaText) {
                    await db.from('pdcs_area_trabajo')
                        .update({ objetivo_estrategico_ia: finalIaText })
                        .eq('id', pdcAreaId);
                }
                onProgress?.(`✅ Objetivos estratégicos procesados.`, 15);
            }
        } catch (e) {
            console.error(`Error refinando objetivos en lote para área ${pdcAreaId}:`, e);
        }
    },

    /**
     * Refina y consolida los criterios de evaluación.
     */
    async _refineCriteria(pdcAreaId: string, tone: TonoRedaccion, depth: string, userId: string, accessToken: string, onProgress?: (msg: string, stepProgress?: number) => void) {
        onProgress?.(`Consolidando criterios y adaptaciones...`, 2);
        
        // 1. Obtener contexto del PDC y contenidos del mes
        const { data: areaContext } = await db
            .from('pdcs_area_trabajo')
            .select(`
                pdc_id,
                areas_trabajo (
                    areas_conocimiento (
                        nombre,
                        grados (
                            nombre,
                            niveles (nombre)
                        )
                    ),
                    planificacion_semanal (
                        id,
                        semana_contenido (
                            contenidos_usuario (titulo, padre_id)
                        )
                    )
                )
            `)
            .eq('id', pdcAreaId)
            .single();

        const ctxArray = areaContext?.areas_trabajo as any;
        const ctx = Array.isArray(ctxArray) ? ctxArray[0] : ctxArray;
        
        const allContents = (ctx?.planificacion_semanal as any[])?.flatMap(w => 
            (w.semana_contenido as any[])?.map(sc => 
                (!sc.contenidos_usuario?.padre_id) ? sc.contenidos_usuario?.titulo : null
            )
        ).filter(Boolean);
        const uniqueContents = [...new Set(allContents)].join(', ');

        // Configuración dinámica
        const dynamicConfig = await this._getDynamicConfig();
        const contextStr = this._buildContextStr(ctx, uniqueContents, dynamicConfig);
        
        // 2. Obtener Datos de Criterios (Ser, Saber, Hacer)
        const [ser, saber, hacer, evalAdapt] = await Promise.all([
            db.from('ser').select('redactado').eq('pdc_area_trabajo_id', pdcAreaId),
            db.from('saber').select('verbo_saber, redactado').eq('pdc_area_trabajo_id', pdcAreaId),
            db.from('hacer').select('verbo, redactado').eq('pdc_area_trabajo_id', pdcAreaId),
            db.from('evaluacion_adaptaciones_especiales').select('nombre_adaptacion, redactado').eq('pdc_area_trabajo_id', pdcAreaId)
        ]);

        const criteriosParts = [];
        if (ser.data?.length) {
            criteriosParts.push(`SER: ${ser.data.map(i => i.redactado).join('; ')}`);
        }
        if (saber.data?.length) {
            criteriosParts.push(`SABER: ${saber.data.map(i => i.redactado).join('; ')}`);
        }
        if (hacer.data?.length) {
            criteriosParts.push(`HACER: ${hacer.data.map(i => i.redactado).join('; ')}`);
        }
        if (evalAdapt.data?.length) {
            criteriosParts.push(`EVALUACIÓN ADAPTACIONES: ${evalAdapt.data.map(i => `${i.nombre_adaptacion}: ${i.redactado}`).join('; ')}`);
        }

        let dataCriteriosStr = criteriosParts.length > 0 ? criteriosParts.join('\n') : '';
        if (!dataCriteriosStr && (depth.includes('ampliamente') || depth.includes('profundamente'))) {
            dataCriteriosStr = 'Sin datos previos. (La IA debe generar criterios de evaluación SER, SABER y HACER creativos y coherentes basándose en el contexto del PDC).';
        }

        // 3. Obtener Adaptaciones Planificadas (de las semanas) para generar el resumen "No Significativa" y "Discapacidad"
        const weekIds = (ctx?.planificacion_semanal || []).map((w: any) => w.id);
        const { data: adaptBasicas } = weekIds.length > 0 ? await db.from('adaptaciones_basicas').select('nombre_adaptacion, redactado, situacion, tipo').in('planificacion_semanal_id', weekIds) : { data: [] };
        
        let dataAdaptStr = '';
        let situacionGlobal = '';
        if (adaptBasicas?.length) {
            const basicas = adaptBasicas.filter(a => a.tipo?.toLowerCase() !== 'especial');
            const especiales = adaptBasicas.filter(a => a.tipo?.toLowerCase() === 'especial');
            situacionGlobal = [...new Set(especiales.map(a => a.situacion).filter(Boolean))].join(' / ');
            
            dataAdaptStr = `ADAPTACIONES BÁSICAS EN SEMANAS: ${basicas.map(i => `${i.nombre_adaptacion}: ${i.redactado}`).join('; ')}`;
            if (situacionGlobal) {
                dataAdaptStr += `\nDISCAPACIDAD GLOBAL IDENTIFICADA: ${situacionGlobal}`;
            }
        }

        const template = dynamicConfig?.prompts?.criteria_batch || SYSTEM_PROMPT_BATCH_CRITERIOS;

        const prompt = template
            .replace('[TONO_SELECCIONADO]', TONOS_INSTRUCTION[tone as TonoRedaccion] || tone)
            .replace('[CORRECCION_PROFUNDIDAD]', depth)
            .replace('[CONTEXTO_PDC]', contextStr)
            .replace('[DATOS_CRITERIOS]', dataCriteriosStr)
            .replace('[DATOS_ADAPTACIONES]', dataAdaptStr);

        try {
            // console.log(`\n\n========== PROMPT ENVIADO A IA (CRITERIOS) ==========\n${prompt}\n====================================================\n`);
            const rawResponse = await this._callProxy(prompt);
            
            // Parsear JSON robusto
            const extractJson = (text: string) => {
                const start = text.indexOf('{');
                const end = text.lastIndexOf('}');
                if (start !== -1 && end !== -1 && end > start) {
                    return text.substring(start, end + 1);
                }
                return text.replace(/```json/g, '').replace(/```/g, '').trim();
            };

            try {
                const parsed = JSON.parse(extractJson(rawResponse));
                await db.from('pdcs_area_trabajo')
                    .update({ 
                        criterios_evaluacion_ia: parsed.criterios_evaluacion_ia || '',
                        adaptaciones_no_significativas_ia: parsed.adaptaciones_no_significativas_ia || '',
                        criterios_evaluacion_adaptaciones_ia: situacionGlobal ? (parsed.criterios_evaluacion_adaptaciones_ia || '') : ''
                    })
                    .eq('id', pdcAreaId);
            } catch (parseErr) {
                console.error(`Error parseando respuesta de criterios:`, rawResponse);
                
                // Fallback: Si falla el JSON por truncamiento, intentar extraer con Regex
                const extractSectionRegex = (text: string, jsonKey: string) => {
                    const regex = new RegExp(`"${jsonKey}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)`, 'i');
                    const match = text.match(regex);
                    if (match && match[1]) return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                    return '';
                };

                let crit = extractSectionRegex(rawResponse, 'criterios_evaluacion_ia');
                let adapNoSig = extractSectionRegex(rawResponse, 'adaptaciones_no_significativas_ia');
                let adapCrit = extractSectionRegex(rawResponse, 'criterios_evaluacion_adaptaciones_ia');

                if (!crit && !adapNoSig) {
                    // Si regex falla, guardar el texto crudo limpio
                    crit = rawResponse.replace(/```json/g, '').replace(/```/g, '').replace(/^{/, '').replace(/}$/, '').trim();
                }

                await db.from('pdcs_area_trabajo')
                    .update({ 
                        criterios_evaluacion_ia: crit,
                        adaptaciones_no_significativas_ia: adapNoSig,
                        criterios_evaluacion_adaptaciones_ia: situacionGlobal ? adapCrit : ''
                    })
                    .eq('id', pdcAreaId);
            }
            onProgress?.(`✅ Criterios y adaptaciones procesados.`, 15);
        } catch (e) {
            console.error(`Error refinando criterios área ${pdcAreaId}:`, e);
        }
    },

    /**
     * Refina y consolida toda la información semanal (Momentos, Recursos, Fuentes, Adaptaciones) en una sola llamada.
     */
    async _refineWeeklyData(pdcAreaId: string, areaTrabajoId: string, tone: TonoRedaccion, depth: string, userId: string, accessToken: string, onProgress?: (msg: string, stepProgress?: number) => void) {
        // 1. Obtener contexto del PDC (gestion y trimestre) para no mezclar semanas de otros años
        const { data: areaDesign } = await db
            .from('pdcs_area_trabajo')
            .select('pdc_id')
            .eq('id', pdcAreaId)
            .single();
        
        const { data: pdc } = await db
            .from('pdcs')
            .select('gestion, trimestre, mes')
            .eq('id', areaDesign?.pdc_id)
            .single();

        // 2. Obtener las semanas vinculadas al área maestra, filtrando por el tiempo del PDC
        const { data: weeks, error } = await db
            .from('planificacion_semanal')
            .select(`
                *,
                momentos,
                semana_contenido (
                    contenidos_usuario (
                        titulo,
                        padre_id
                    )
                )
            `)
            .eq('area_trabajo_id', areaTrabajoId)
            .eq('gestion', pdc?.gestion)
            .eq('trimestre', pdc?.trimestre)
            .order('semana', { ascending: true });

        if (error) {
            console.error(`[AiOptimization] Error buscando semanas por area_trabajo_id:`, error.message || error);
        }

        const finalWeeks = (weeks || []) as any[];

        if (finalWeeks.length === 0) {
            console.warn(`[AiOptimization] No se encontraron semanas para areaTrabajoId: ${areaTrabajoId} en ${pdc?.gestion}-T${pdc?.trimestre}`);
            return;
        }

        const weekIds = finalWeeks.map(w => w.id);
        const { data: adaptBasicasGlobales } = weekIds.length > 0 ? await db.from('adaptaciones_basicas').select('situacion, tipo').in('planificacion_semanal_id', weekIds) : { data: [] };
        const especialesGlobales = (adaptBasicasGlobales || []).filter(a => a.tipo?.toLowerCase() === 'especial');
        const situacionGlobal = [...new Set(especialesGlobales.map(a => a.situacion).filter(Boolean))].join(' / ');

        onProgress?.(`Recolectando datos de todas las semanas...`, 5);
        const weekDataStrings = await Promise.all(finalWeeks.map(async (week) => {
            // --- 1. Recolectar datos de Momentos ---
            const [practicaDb, teoriaDb, produccionDb, valoracionDb] = await Promise.all([
                db.from('practica').select('nombre_practica, redactado, descripcion_concreta, proposito, preguntas').eq('planificacion_semanal_id', week.id),
                db.from('teoria').select('nombre_estrategia_teorica, redactado, descripcion_concreta, proposito').eq('planificacion_semanal_id', week.id),
                db.from('produccion').select('nombre_produccion, redactado, descripcion_concreta, proposito, instrumento').eq('planificacion_semanal_id', week.id),
                db.from('valoracion').select('categoria, subcategoria, redactado, preguntas, instrumento, proposito').eq('planificacion_semanal_id', week.id)
            ]);

            const momentosJson = Array.isArray(week.momentos) ? week.momentos : [];
            const practicaList = (practicaDb.data && practicaDb.data.length > 0) ? practicaDb.data : momentosJson.filter((m: any) => m.type === 'practica' || m.tipo === 'practica');
            const teoriaList = (teoriaDb.data && teoriaDb.data.length > 0) ? teoriaDb.data : momentosJson.filter((m: any) => m.type === 'teoria' || m.tipo === 'teoria');
            const produccionList = (produccionDb.data && produccionDb.data.length > 0) ? produccionDb.data : momentosJson.filter((m: any) => m.type === 'produccion' || m.tipo === 'produccion');
            const valoracionList = (valoracionDb.data && valoracionDb.data.length > 0) ? valoracionDb.data : momentosJson.filter((m: any) => m.type === 'valoracion' || m.tipo === 'valoracion');

            const momParts = [];
            if (practicaList.length) momParts.push(`PRÁCTICA: ${practicaList.map((i: any) => [i.nombre_practica || i.titulo || 'Actividad', i.proposito ? `Propósito: ${i.proposito}` : '', i.preguntas ? `Preguntas: ${i.preguntas}` : '', i.redactado || i.descripcion_concreta || i.descripcion || i.detalle || i.contenido || ''].filter(Boolean).join(' | ')).join('; ')}`);
            if (teoriaList.length) momParts.push(`TEORÍA: ${teoriaList.map((i: any) => [i.nombre_estrategia_teorica || i.titulo || 'Análisis', i.proposito ? `Propósito: ${i.proposito}` : '', i.redactado || i.descripcion_concreta || i.descripcion || i.detalle || i.contenido || ''].filter(Boolean).join(' | ')).join('; ')}`);
            if (produccionList.length) momParts.push(`PRODUCCIÓN: ${produccionList.map((i: any) => [i.nombre_produccion || i.titulo || 'Producto', i.proposito ? `Propósito: ${i.proposito}` : '', i.instrumento ? `Instrumento: ${i.instrumento}` : '', i.redactado || i.descripcion_concreta || i.descripcion || i.detalle || i.contenido || ''].filter(Boolean).join(' | ')).join('; ')}`);
            if (valoracionList.length) momParts.push(`VALORACIÓN: ${valoracionList.map((i: any) => [i.categoria || i.titulo || 'Reflexión', i.subcategoria ? `(${i.subcategoria})` : '', i.proposito ? `Propósito: ${i.proposito}` : '', i.instrumento ? `Instrumento: ${i.instrumento}` : '', i.redactado || i.preguntas || i.descripcion || i.detalle || i.contenido || ''].filter(Boolean).join(' | ')).join('; ')}`);
            let momentosStr = momParts.length > 0 ? `Momentos:\n${momParts.join('\n')}` : '';
            if (!momentosStr && week.momentos_original) {
                momentosStr = `Momentos:\n${week.momentos_original}`;
            }

            // --- 2. Recolectar Recursos y Fuentes ---
            const [recursosDb, fuentesDb] = await Promise.all([
                db.from('recursos').select('recursos, redactado').eq('planificacion_semanal_id', week.id),
                db.from('mi_fuente').select('titulo_fuente, autor, detalle').eq('planificacion_semanal_id', week.id)
            ]);
            const recList = (recursosDb.data && recursosDb.data.length > 0) ? recursosDb.data : (Array.isArray(week.recursos) ? week.recursos : []);
            const fteList = (fuentesDb.data && fuentesDb.data.length > 0) ? fuentesDb.data : (Array.isArray(week.fuentes) ? week.fuentes : []);
            let recursosFuentesStr = '';
            if (recList.length) {
                const rStr = `Recursos: ${recList.map((r: any) => r.redactado || r.recursos || '').join(', ')}`;
                recursosFuentesStr = `Recursos:\n${rStr}`;
            } else if (week.recursos_fuentes_original) {
                // If there's original mixed text, pass it but call it only Recursos
                recursosFuentesStr = `Recursos:\n${week.recursos_fuentes_original}`;
            }

            // --- 3. Recolectar Adaptaciones ---
            const { data: basicasDb } = await db.from('adaptaciones_basicas').select('nombre_adaptacion, redactado').eq('planificacion_semanal_id', week.id);
            const basicasList = (basicasDb && basicasDb.length > 0) ? basicasDb : (Array.isArray(week.adaptaciones_basicas) ? week.adaptaciones_basicas : []);
            const especialesList = Array.isArray(week.adaptacion_especial) ? week.adaptacion_especial : [];
            const adaptParts = [];
            if (basicasList.length) adaptParts.push(`Básicas: ${basicasList.map((a: any) => `${a.nombre_adaptacion || ''}: ${a.redactado || ''}`).join('; ')}`);
            if (especialesList.length) adaptParts.push(`Especiales: ${especialesList.map((a: any) => `${a.nombre_adaptacion || ''}: ${a.redactado || ''}`).join('; ')}`);
            if (situacionGlobal) adaptParts.push(`DISCAPACIDAD GLOBAL IDENTIFICADA: ${situacionGlobal}`);
            
            let adaptacionesStr = adaptParts.length > 0 ? `Adaptaciones:\n${adaptParts.join('\n')}` : '';
            if (!adaptacionesStr) {
                if (week.adaptaciones_basicas_original || week.adaptaciones_especiales_original) {
                    adaptacionesStr = `Adaptaciones:\n${[
                        week.adaptaciones_basicas_original ? `Básicas: ${week.adaptaciones_basicas_original}` : '',
                        week.adaptaciones_especiales_original ? `Especiales: ${week.adaptaciones_especiales_original}` : ''
                    ].filter(Boolean).join('\n')}`;
                }
            }

            const validSections = [momentosStr, recursosFuentesStr, adaptacionesStr].filter(Boolean);
            let contentStr = validSections.length > 0 ? validSections.join('\n\n') : '';
            
            if (!contentStr) {
                if (depth.includes('ampliamente') || depth.includes('profundamente')) {
                    contentStr = 'Sin datos previos. (La IA debe generar propuestas metodológicas creativas para esta semana basándose en el contexto).';
                } else {
                    return '';
                }
            }
            
            return `--- SEMANA_ID: ${week.id} ---\n${contentStr}`;
        }));

        const finalWeekDataStrings = weekDataStrings.filter(Boolean);
        if (finalWeekDataStrings.length === 0) return;
        
        const datosSemanasStr = finalWeekDataStrings.join('\n\n====================\n\n');

        // --- 4. Armar Contexto y Prompt ---
        const { data: areaContext } = await db
            .from('pdcs_area_trabajo')
            .select(`
                areas_trabajo (
                    areas_conocimiento (
                        nombre,
                        grados (
                            nombre,
                            niveles (nombre)
                        )
                    )
                )
            `)
            .eq('id', pdcAreaId)
            .single();

        const ctxArray = areaContext?.areas_trabajo as any;
        const ctxCrit = Array.isArray(ctxArray) ? ctxArray[0] : ctxArray;
        const allContents = finalWeeks.flatMap(w => (w.semana_contenido || []).map((sc: any) => 
            (!sc.contenidos_usuario?.padre_id) ? sc.contenidos_usuario?.titulo : null
        )).filter(Boolean);
        const contentTitles = [...new Set(allContents)].join(', ');

        const dynamicConfig = await this._getDynamicConfig();
        const contextStr = this._buildContextStr(ctxCrit, contentTitles, dynamicConfig);

        const template = dynamicConfig?.prompts?.weekly_batch || SYSTEM_PROMPT_WEEKLY_BATCH;

        // --- 5. Llamar a la IA y Parsear JSON (Por Chunks Secuenciales) ---
        const CHUNK_SIZE = 1; // Mantenemos en 1 para robustez y ejecutamos secuencialmente
        const totalChunks = Math.ceil(finalWeekDataStrings.length / CHUNK_SIZE);

        for (let i = 0; i < finalWeekDataStrings.length; i += CHUNK_SIZE) {
            const chunkIndex = Math.floor(i / CHUNK_SIZE) + 1;
            const chunkStrings = finalWeekDataStrings.slice(i, i + CHUNK_SIZE);
            const datosSemanasStr = chunkStrings.join('\n\n====================\n\n');
            
            const prompt = template
                .replace('[TONO_SELECCIONADO]', TONOS_INSTRUCTION[tone as TonoRedaccion] || tone)
                .replace('[CORRECCION_PROFUNDIDAD]', depth)
                .replace('[CONTEXTO_PDC]', contextStr)
                .replace('[DATOS_SEMANAS]', datosSemanasStr);

            onProgress?.(`Refinando semanas secuencialmente (Semana ${chunkIndex} de ${totalChunks})...`);
            
            try {
                // console.log(`\n\n========== PROMPT ENVIADO A IA (SEMANAS BATCH CHUNK ${chunkIndex}) ==========\n${prompt}\n========================================================\n`);
                const rawResponse = await this._callProxy(prompt);
                
                const extractJsonArray = (text: string) => {
                    const start = text.indexOf('[');
                    const end = text.lastIndexOf(']');
                    if (start !== -1 && end !== -1 && end > start) {
                        return text.substring(start, end + 1);
                    }
                    return text.replace(/```json/g, '').replace(/```/g, '').trim();
                };

                let parsedArray: any = null;
                try {
                    parsedArray = JSON.parse(extractJsonArray(rawResponse));
                } catch (e) {
                    console.warn(`[AiOptimization] JSON.parse falló para lote de semanas (Chunk ${chunkIndex}). Aplicando fallback...`);
                    console.warn(`RAW RESPONSE FAILED TO PARSE:`, rawResponse);
                }

                if (parsedArray) {
                    const items = Array.isArray(parsedArray) ? parsedArray : (parsedArray.semanas || [parsedArray]);
                    const updatePromises = items.map(async (weekResult: any) => {
                        if (!weekResult.semana_id) return;
                        
                        // IF situacionGlobal is empty, force adaptaciones_especiales_ia to empty
                        const finalAdaptacionesEspeciales = situacionGlobal ? (weekResult.adaptaciones_especiales_ia || '') : '';
                        
                        const originalWeek = finalWeeks.find(w => w.id === weekResult.semana_id);
                        const fuentesDb = await db.from('mi_fuente').select('titulo_fuente, autor, detalle').eq('planificacion_semanal_id', weekResult.semana_id);
                        const fteList = (fuentesDb.data && fuentesDb.data.length > 0) ? fuentesDb.data : (Array.isArray(originalWeek?.fuentes) ? originalWeek.fuentes : []);
                        
                        let finalRecursosFuentes = weekResult.recursos_fuentes_ia || '';
                        // Eliminar cualquier sección de "Fuentes de Apoyo" que la IA haya alucinado
                        finalRecursosFuentes = finalRecursosFuentes.replace(/\n*?\**Fuentes(?: de [Aa]poyo)?\**:(?:\n|.)*$/i, '').trim();
                        
                        if (fteList && fteList.length > 0) {
                            const fStr = fteList.map((f: any) => `- ${f.titulo_fuente || ''} (${f.autor || ''})`).join('\n');
                            if (finalRecursosFuentes) finalRecursosFuentes += `\n\nFuentes de Apoyo:\n${fStr}`;
                            else finalRecursosFuentes = `Fuentes de Apoyo:\n${fStr}`;
                        }
                        
                        await db.from('planificacion_semanal')
                            .update({
                                momentos_ia: this._cleanMomentos(weekResult.momentos_ia || ''),
                                recursos_fuentes_ia: finalRecursosFuentes,
                                adaptaciones_basicas_ia: weekResult.adaptaciones_basicas_ia || '',
                                adaptaciones_especiales_ia: finalAdaptacionesEspeciales
                            })
                            .eq('id', weekResult.semana_id);
                    });
                    await Promise.all(updatePromises);
                } else if (chunkStrings.length === 1) {
                    // Fallback si el chunk tiene 1 sola semana y la IA mandó texto raw
                    const weekIdMatch = chunkStrings[0].match(/--- SEMANA_ID: (.*?) ---/);
                    if (weekIdMatch && weekIdMatch[1]) {
                        const weekId = weekIdMatch[1].trim();
                        
                        const extractSection = (text: string, jsonKey: string, spanishTitle: string, backupTitle: string, backupTitle2: string) => {
                            const regex = new RegExp(`"${jsonKey}"\\s*:\\s*"([^"]*)"`, 'i');
                            const match = text.match(regex);
                            if (match && match[1]) return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
                            
                            const regexStr = new RegExp(`(?:${spanishTitle}|${backupTitle}|${backupTitle2}):?\\s*\\n?([\\s\\S]*?)(?:\\n\\n[A-Z]|$)`, 'i');
                            const matchStr = text.match(regexStr);
                            if (matchStr && matchStr[1]) return matchStr[1].trim();
                            
                            return '';
                        };

                        let momentosIa = extractSection(rawResponse, 'momentos_ia', 'Momentos', 'Momentos_IA', 'momentos_ia');
                        if (!momentosIa) {
                            const cleanText = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                            if (!cleanText.includes('{') && !cleanText.includes('}')) {
                                momentosIa = cleanText;
                            }
                        }

                        let extractedRecursos = extractSection(rawResponse, 'recursos_fuentes_ia', 'Recursos y Fuentes', 'Recursos_Fuentes_IA', 'recursos_fuentes_ia');
                        // Eliminar cualquier sección de "Fuentes de Apoyo" que la IA haya alucinado
                        extractedRecursos = extractedRecursos.replace(/\n*?\**Fuentes(?: de [Aa]poyo)?\**:(?:\n|.)*$/i, '').trim();
                        
                        const originalWeek = finalWeeks.find(w => w.id === weekId);
                        const fuentesDb = await db.from('mi_fuente').select('titulo_fuente, autor, detalle').eq('planificacion_semanal_id', weekId);
                        const fteList = (fuentesDb.data && fuentesDb.data.length > 0) ? fuentesDb.data : (Array.isArray(originalWeek?.fuentes) ? originalWeek.fuentes : []);
                        
                        if (fteList && fteList.length > 0) {
                            const fStr = fteList.map((f: any) => `- ${f.titulo_fuente || ''} (${f.autor || ''})`).join('\n');
                            if (extractedRecursos) extractedRecursos += `\n\nFuentes de Apoyo:\n${fStr}`;
                            else extractedRecursos = `Fuentes de Apoyo:\n${fStr}`;
                        }

                        await db.from('planificacion_semanal')
                            .update({
                                momentos_ia: this._cleanMomentos(momentosIa),
                                recursos_fuentes_ia: extractedRecursos,
                                adaptaciones_basicas_ia: extractSection(rawResponse, 'adaptaciones_basicas_ia', 'Adaptaciones Básicas', 'Adaptaciones_Básicas_IA', 'adaptaciones_basicas_ia'),
                                adaptaciones_especiales_ia: situacionGlobal ? extractSection(rawResponse, 'adaptaciones_especiales_ia', 'Adaptaciones Especiales', 'Adaptaciones_Especiales_IA', 'adaptaciones_especiales_ia') : ''
                            })
                            .eq('id', weekId);
                    }
                }
                onProgress?.(`✅ Semanas procesadas (Semana ${chunkIndex}).`, 40 / totalChunks);
            } catch (e) {
                console.error(`Error procesando lote de semanas (Chunk ${chunkIndex}) para area ${pdcAreaId}:`, e);
            }
        }
    },

    /**
     * Genera un log/preview de los prompts finales que se enviarían a la IA sin ejecutar el llamado real.
     * Útil para el módulo administrador de visualización de prompts.
     */
    async getCompiledPromptsForPreview(pdcAreaId: string, areaTrabajoId: string, tone: string = 'Formal', depth: string = 'Media'): Promise<any> {
        const preview = {
            objetivos: [] as { tipo: string, prompt: string }[],
            criterios: null as { tipo: string, prompt: string } | null,
            semanal: [] as { semana: number, prompt: string }[]
        };

        try {
            // --- Contexto General y Config ---
            const dynamicConfig = await this._getDynamicConfig();
            
            // 1. OBJETIVOS
            const { data: areaContext } = await db.from('pdcs_area_trabajo')
                .select(`
                    pdc_id,
                    areas_trabajo (
                        areas_conocimiento (nombre, grados (nombre, niveles (nombre))),
                        planificacion_semanal (
                            semana_contenido (
                                contenidos_usuario (titulo, padre_id)
                            )
                        )
                    )
                `)
                .eq('id', pdcAreaId).single();
            
            const ctxArrayObj = areaContext?.areas_trabajo as any;
            const ctxObj = Array.isArray(ctxArrayObj) ? ctxArrayObj[0] : ctxArrayObj;
            
            const allContentsObj = (ctxObj?.planificacion_semanal as any[])?.flatMap(w => 
                (w.semana_contenido as any[])?.map(sc => 
                    (!sc.contenidos_usuario?.padre_id) ? sc.contenidos_usuario?.titulo : null
                )
            ).filter(Boolean);
            const uniqueContentsObj = [...new Set(allContentsObj)].join(', ');
            
            const contextStrObj = this._buildContextStr(ctxObj, uniqueContentsObj, dynamicConfig);
            const { data: areaDataObj } = await db.from('pdcs_area_trabajo').select('objetivo_estrategico').eq('id', pdcAreaId).single();
            
            const templateObj = dynamicConfig?.prompts?.strategic_objective || SYSTEM_PROMPT_STRATEGIC_OBJECTIVE;
            if (areaDataObj && areaDataObj.objetivo_estrategico?.trim()) {
                preview.objetivos.push({
                    tipo: 'Objetivo Estratégico',
                    prompt: templateObj.replace('[TONO_SELECCIONADO]', TONOS_INSTRUCTION[tone as TonoRedaccion] || tone).replace('[CORRECCION_PROFUNDIDAD]', depth)
                        .replace('[DATOS_OBJETIVOS]', areaDataObj.objetivo_estrategico).replace('[CONTEXTO_PDC]', contextStrObj)
                });
            }

            // 2. CRITERIOS
            const { data: areaContextCrit } = await db.from('pdcs_area_trabajo')
                .select(`
                    pdc_id,
                    areas_trabajo (
                        areas_conocimiento (nombre, grados (nombre, niveles (nombre))),
                        planificacion_semanal (
                            id,
                            semana_contenido (
                                contenidos_usuario (titulo, padre_id)
                            )
                        )
                    )
                `)
                .eq('id', pdcAreaId).single();
            
            const ctxArrayCrit = areaContextCrit?.areas_trabajo as any;
            const ctxCrit = Array.isArray(ctxArrayCrit) ? ctxArrayCrit[0] : ctxArrayCrit;
            
            const allContents = (ctxCrit?.planificacion_semanal as any[])?.flatMap(w => (w.semana_contenido as any[])?.map(sc => (!sc.contenidos_usuario?.padre_id) ? sc.contenidos_usuario?.titulo : null)).filter(Boolean);
            const uniqueContents = [...new Set(allContents)].join(', ');
            const contextStrCrit = this._buildContextStr(ctxCrit, uniqueContents, dynamicConfig);

            const [ser, saber, hacer, evalAdapt] = await Promise.all([
                db.from('ser').select('redactado').eq('pdc_area_trabajo_id', pdcAreaId),
                db.from('saber').select('verbo_saber, redactado').eq('pdc_area_trabajo_id', pdcAreaId),
                db.from('hacer').select('verbo, redactado').eq('pdc_area_trabajo_id', pdcAreaId),
                db.from('evaluacion_adaptaciones_especiales').select('nombre_adaptacion, redactado').eq('pdc_area_trabajo_id', pdcAreaId)
            ]);

            const criteriosParts = [];
            if (ser.data?.length) criteriosParts.push("SER: " + ser.data.map(i => i.redactado).join("; "));
            if (saber.data?.length) criteriosParts.push("SABER: " + saber.data.map(i => i.redactado).join("; "));
            if (hacer.data?.length) criteriosParts.push("HACER: " + hacer.data.map(i => i.redactado).join("; "));
            if (evalAdapt.data?.length) criteriosParts.push("EVALUACIÓN ADAPTACIONES: " + evalAdapt.data.map(i => i.nombre_adaptacion + ": " + i.redactado).join("; "));
            const dataCriteriosStr = criteriosParts.length > 0 ? criteriosParts.join("\n") : "";

            const weekIds = (ctxCrit?.planificacion_semanal || []).map((w: any) => w.id);
            const { data: adaptBasicas } = weekIds.length ? await db.from('adaptaciones_basicas').select('nombre_adaptacion, redactado').in('planificacion_semanal_id', weekIds) : { data: null };
            const dataAdaptStr = adaptBasicas?.length ? "ADAPTACIONES BÁSICAS EN SEMANAS: " + adaptBasicas.map(i => i.nombre_adaptacion + ": " + i.redactado).join("; ") : "";

            const templateCrit = dynamicConfig?.prompts?.criteria_batch || SYSTEM_PROMPT_BATCH_CRITERIOS;
            preview.criterios = {
                tipo: 'Consolidación de Criterios Batch',
                prompt: templateCrit.replace('[TONO_SELECCIONADO]', TONOS_INSTRUCTION[tone as TonoRedaccion] || tone).replace('[CORRECCION_PROFUNDIDAD]', depth)
                    .replace('[CONTEXTO_PDC]', contextStrCrit).replace('[DATOS_CRITERIOS]', dataCriteriosStr).replace('[DATOS_ADAPTACIONES]', dataAdaptStr)
            };

            // 3. SEMANAL
            const { data: pdc } = await db.from('pdcs').select('gestion, trimestre').eq('id', areaContextCrit?.pdc_id).single();
            const { data: weeks } = await db.from('planificacion_semanal')
                .select('*, momentos, semana_contenido (contenidos_usuario (titulo, padre_id))')
                .eq('area_trabajo_id', areaTrabajoId).eq('gestion', pdc?.gestion).eq('trimestre', pdc?.trimestre).order('semana', { ascending: true });

            const finalWeeks = (weeks || []) as any[];
            const templateWeek = dynamicConfig?.prompts?.weekly_batch || SYSTEM_PROMPT_WEEKLY_BATCH;

            for (const week of finalWeeks) {
                const [practicaDb, teoriaDb, produccionDb, valoracionDb] = await Promise.all([
                    db.from('practica').select('nombre_practica, redactado, descripcion_concreta, proposito, preguntas').eq('planificacion_semanal_id', week.id),
                    db.from('teoria').select('nombre_estrategia_teorica, redactado, descripcion_concreta, proposito').eq('planificacion_semanal_id', week.id),
                    db.from('produccion').select('nombre_produccion, redactado, descripcion_concreta, proposito, instrumento').eq('planificacion_semanal_id', week.id),
                    db.from('valoracion').select('categoria, subcategoria, redactado, preguntas, instrumento, proposito').eq('planificacion_semanal_id', week.id)
                ]);

                const momentosJson = Array.isArray(week.momentos) ? week.momentos : [];
                const practicaList = practicaDb.data?.length ? practicaDb.data : momentosJson.filter((m: any) => m.type === 'practica' || m.tipo === 'practica');
                const teoriaList = teoriaDb.data?.length ? teoriaDb.data : momentosJson.filter((m: any) => m.type === 'teoria' || m.tipo === 'teoria');
                const produccionList = produccionDb.data?.length ? produccionDb.data : momentosJson.filter((m: any) => m.type === 'produccion' || m.tipo === 'produccion');
                const valoracionList = valoracionDb.data?.length ? valoracionDb.data : momentosJson.filter((m: any) => m.type === 'valoracion' || m.tipo === 'valoracion');

                const momParts = [];
                if (practicaList.length) momParts.push("PRÁCTICA: " + practicaList.map((i: any) => [i.nombre_practica || i.titulo, i.redactado || i.descripcion_concreta || i.descripcion].filter(Boolean).join(" | ")).join("; "));
                if (teoriaList.length) momParts.push("TEORÍA: " + teoriaList.map((i: any) => [i.nombre_estrategia_teorica || i.titulo, i.redactado || i.descripcion_concreta || i.descripcion].filter(Boolean).join(" | ")).join("; "));
                if (produccionList.length) momParts.push("PRODUCCIÓN: " + produccionList.map((i: any) => [i.nombre_produccion || i.titulo, i.redactado || i.descripcion_concreta || i.descripcion].filter(Boolean).join(" | ")).join("; "));
                if (valoracionList.length) momParts.push("VALORACIÓN: " + valoracionList.map((i: any) => [i.categoria || i.titulo, i.redactado || i.preguntas || i.descripcion].filter(Boolean).join(" | ")).join("; "));
                let momentosStr = momParts.length > 0 ? `Momentos:\n${momParts.join('\n')}` : '';
                if (!momentosStr && week.momentos_original) {
                    momentosStr = `Momentos:\n${week.momentos_original}`;
                }

                const [recursosDb, fuentesDb] = await Promise.all([
                    db.from('recursos').select('recursos, redactado').eq('planificacion_semanal_id', week.id),
                    db.from('mi_fuente').select('titulo_fuente, autor, detalle').eq('planificacion_semanal_id', week.id)
                ]);
                const recList = recursosDb.data?.length ? recursosDb.data : (Array.isArray(week.recursos) ? week.recursos : []);
                const fteList = fuentesDb.data?.length ? fuentesDb.data : (Array.isArray(week.fuentes) ? week.fuentes : []);
                let recursosFuentesStr = '';
                if (recList.length || fteList.length) {
                    const rStr = recList.length ? "Recursos: " + recList.map((r: any) => r.redactado || r.recursos || "").join(", ") : "";
                    const fStr = fteList.length ? "Fuentes: " + fteList.map((f: any) => (f.titulo_fuente || "") + " (" + (f.autor || "") + ")").join("; ") : "";
                    recursosFuentesStr = `Recursos y Fuentes:\n${[rStr, fStr].filter(Boolean).join("\n")}`;
                } else if (week.recursos_fuentes_original) {
                    recursosFuentesStr = `Recursos y Fuentes:\n${week.recursos_fuentes_original}`;
                }

                const { data: basicasDb } = await db.from('adaptaciones_basicas').select('nombre_adaptacion, redactado').eq('planificacion_semanal_id', week.id);
                const basicasList = basicasDb?.length ? basicasDb : (Array.isArray(week.adaptaciones_basicas) ? week.adaptaciones_basicas : []);
                const especialesList = Array.isArray(week.adaptacion_especial) ? week.adaptacion_especial : [];
                const adaptParts = [];
                if (basicasList.length) adaptParts.push("Básicas: " + basicasList.map((a: any) => (a.nombre_adaptacion || "") + ": " + (a.redactado || "")).join("; "));
                if (especialesList.length) adaptParts.push("Especiales: " + especialesList.map((a: any) => (a.nombre_adaptacion || "") + ": " + (a.redactado || "")).join("; "));
                let adaptacionesStr = adaptParts.length > 0 ? `Adaptaciones:\n${adaptParts.join('\n')}` : '';
                if (!adaptacionesStr) {
                    if (week.adaptaciones_basicas_original || week.adaptaciones_especiales_original) {
                        adaptacionesStr = `Adaptaciones:\n${[
                            week.adaptaciones_basicas_original ? `Básicas: ${week.adaptaciones_basicas_original}` : '',
                            week.adaptaciones_especiales_original ? `Especiales: ${week.adaptaciones_especiales_original}` : ''
                        ].filter(Boolean).join('\n')}`;
                    }
                }

                const contentTitles = (week.semana_contenido || []).map((sc: any) => (!sc.contenidos_usuario?.padre_id) ? sc.contenidos_usuario?.titulo : null).filter(Boolean).join(', ');
                const contextStrW = this._buildContextStr(ctxCrit, contentTitles, dynamicConfig);

                const validSections = [momentosStr, recursosFuentesStr, adaptacionesStr].filter(Boolean);
                if (validSections.length === 0) continue;
                
                const datosSemanasStr = `--- SEMANA_ID: ${week.id} ---\n${validSections.join('\n\n')}`;

                preview.semanal.push({
                    semana: week.semana,
                    prompt: templateWeek.replace('[TONO_SELECCIONADO]', TONOS_INSTRUCTION[tone as TonoRedaccion] || tone).replace('[CORRECCION_PROFUNDIDAD]', depth)
                        .replace('[CONTEXTO_PDC]', contextStrW).replace('[DATOS_SEMANAS]', datosSemanasStr)
                });
            }
        } catch (error) {
            console.error('[AiOptimization] Error generating preview prompts:', error);
            throw error;
        }

        return preview;
    }
};
