import { db } from "../lib/database";
import { AiService } from "./ai.service";
import {
    TonoRedaccion,
    SYSTEM_PROMPT_BATCH_MOMENTOS,
    SYSTEM_PROMPT_BATCH_CRITERIOS,
    SYSTEM_PROMPT_STRATEGIC_OBJECTIVE,
    SYSTEM_PROMPT_RECURSOS_FUENTES,
    SYSTEM_PROMPT_ADAPTACIONES
} from "../lib/ai/promptTemplates";

/**
 * Servicio de Optimización IA Batch.
 * Centraliza la reformulación del PDC en campos espejo (_ia).
 */
export const AiOptimizationService = {
    async _callProxy(prompt: string, retries = 5, backoff = 8000): Promise<string> {
        // Intentar con Gemini (más reintentos y más paciencia para 503 transitorios)
        try {
            return await this._executeWithProvider('/api/gemini', prompt, retries, backoff);
        } catch (geminiError: any) {
            console.warn('[AiOptimization] Gemini falló definitivamente:', geminiError.message);

            // Solo activar failover a DeepSeek si la key está configurada
            const hasDeepseekKey = typeof process !== 'undefined' && !!process.env.DEEPSEEK_API_KEY;
            if (!hasDeepseekKey) {
                throw new Error(`Gemini no disponible temporalmente. Por favor intenta de nuevo en unos minutos. (${geminiError.message})`);
            }

            try {
                console.log('[AiOptimization] Activando failover DeepSeek...');
                return await this._executeWithProvider('/api/deepseek', prompt, 2, 3000);
            } catch (deepseekError: any) {
                console.error('[AiOptimization] DeepSeek también falló:', deepseekError.message);
                throw new Error(`Servicio de IA temporalmente no disponible. Intenta nuevamente en unos minutos.`);
            }
        }
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

                if (!response.ok) {
                    const errText = await response.text();

                    // Si es un error 503 (Unavailable) o 429 (Too Many Requests), intentar de nuevo localmente
                    if ((response.status === 503 || response.status === 429) && i < retries - 1) {
                        let dynamicBackoff = backoff;
                        const retryMatch = errText.match(/retry in (\d+(?:\.\d+)?)s/i);
                        if (retryMatch && retryMatch[1]) {
                            dynamicBackoff = Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1000;
                        }
                        await new Promise(resolve => setTimeout(resolve, dynamicBackoff));
                        continue;
                    }
                    throw new Error(errText);
                }

                const data = await response.json();
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

    /**
     * Procesa todo el PDC para optimizarlo según el tono seleccionado.
     */
    async refineFullPdc(
        pdcId: string,
        tone: TonoRedaccion,
        depth: string,
        userId: string,
        accessToken: string,
        onProgress?: (msg: string) => void
    ) {
        // 1. Obtener áreas de trabajo vinculadas al PDC
        const { data: areas, error: areaError } = await db
            .from('pdcs_area_trabajo')
            .select('id')
            .eq('pdc_id', pdcId);

        if (areaError) throw areaError;
        if (!areas) return;

        for (const area of areas) {
            onProgress?.(`Optimizando área: ${area.id}...`);
            // Buscar el area_trabajo_id maestro asociado a este pdcs_area_trabajo.id
            const { data: at } = await db.from('areas_trabajo').select('id').eq('pdc_area_trabajo_id', area.id).limit(1).single();
            const areaTrabajoId = at?.id;

            if (areaTrabajoId) {
                await this.refineArea(area.id, areaTrabajoId, tone, depth, userId, accessToken, onProgress);
            } else {
                console.warn(`No se encontró areas_trabajo para pdc_area_trabajo_id: ${area.id}`);
            }
        }
    },

    /**
     * Refina una área específica del PDC.
     */
    async refineArea(pdcAreaId: string, areaTrabajoId: string, tone: TonoRedaccion, depth: string, userId: string, accessToken: string, onProgress?: (msg: string) => void) {
        // 1. Refinar Objetivos Estratégicos
        await this._refineObjectives(pdcAreaId, tone, depth, userId, accessToken, onProgress);

        // 2. Refinar Criterios de Evaluación
        await this._refineCriteria(pdcAreaId, tone, depth, userId, accessToken, onProgress);

        // 3. Refinar Momentos Metodológicos (Semanales)
        await this._refineWeeklyData(pdcAreaId, areaTrabajoId, tone, depth, userId, accessToken, onProgress);
    },

    /**
     * Refina los objetivos estratégicos de un área.
     */
    async _refineObjectives(pdcAreaId: string, tone: TonoRedaccion, depth: string, userId: string, accessToken: string, onProgress?: (msg: string) => void) {
        onProgress?.(`Refinando objetivos estratégicos...`);

        // Obtener contexto real del área y grado
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

        const ctx = areaContext?.areas_trabajo as any;
        const contextStr = ctx ?
            `Nivel: ${ctx.areas_conocimiento?.grados?.niveles?.nombre}, Grado: ${ctx.areas_conocimiento?.grados?.nombre}, Área: ${ctx.areas_conocimiento?.nombre}` :
            'Contexto no disponible';

        const { data: objectives, error } = await db
            .from('objetivo_estrategico')
            .select('*')
            .eq('pdc_area_trabajo_id', pdcAreaId);

        if (error || !objectives) return;

        for (const obj of objectives) {
            const prompt = SYSTEM_PROMPT_STRATEGIC_OBJECTIVE
                .replace('[TONO_SELECCIONADO]', tone)
                .replace('[CORRECCION_PROFUNDIDAD]', depth)
                .replace('[DESCRIPCION_OBJETIVO]', obj.descripcion)
                .replace('[CONTEXTO_PDC]', contextStr);

            try {
                const refined = await this._callProxy(prompt);
                await db.from('objetivo_estrategico')
                    .update({ descripcion_ia: refined })
                    .eq('id', obj.id);
            } catch (e) {
                console.error(`Error refinando objetivo ${obj.id}:`, e);
            }
        }
    },

    /**
     * Refina y consolida los criterios de evaluación.
     */
    async _refineCriteria(pdcAreaId: string, tone: TonoRedaccion, depth: string, userId: string, accessToken: string, onProgress?: (msg: string) => void) {
        onProgress?.(`Consolidando criterios de evaluación (Ser, Saber, Hacer)...`);
        
        // 1. Obtener contexto del PDC y contenidos del mes
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
                ),
                planificacion_semanal (
                    semana_contenido (
                        contenido_usuario (titulo)
                    )
                )
            `)
            .eq('id', pdcAreaId)
            .single();

        const ctx = areaContext?.areas_trabajo as any;
        const allContents = (areaContext?.planificacion_semanal as any[])?.flatMap(w => 
            (w.semana_contenido as any[])?.map(sc => sc.contenido_usuario?.titulo)
        ).filter(Boolean);
        const uniqueContents = [...new Set(allContents)].join(', ');

        const contextStr = ctx ? 
            `Nivel: ${ctx.areas_conocimiento?.grados?.niveles?.nombre}, Grado: ${ctx.areas_conocimiento?.grados?.nombre}, Área: ${ctx.areas_conocimiento?.nombre}${uniqueContents ? `, Temas del mes: ${uniqueContents}` : ''}` : 
            'Contexto no disponible';

        const [ser, saber, hacer] = await Promise.all([
            db.from('ser').select('redactado').eq('pdc_area_trabajo_id', pdcAreaId),
            db.from('saber').select('verbo_saber, redactado').eq('pdc_area_trabajo_id', pdcAreaId),
            db.from('hacer').select('verbo, redactado').eq('pdc_area_trabajo_id', pdcAreaId)
        ]);

        const dataStr = `
        SER: ${ser.data?.map(i => i.redactado).join('; ') || 'No definido'}
        SABER: ${saber.data?.map(i => i.redactado).join('; ') || 'No definido'}
        HACER: ${hacer.data?.map(i => i.redactado).join('; ') || 'No definido'}
        `;

        const prompt = SYSTEM_PROMPT_BATCH_CRITERIOS
            .replace('[TONO_SELECCIONADO]', tone)
            .replace('[CORRECCION_PROFUNDIDAD]', depth)
            .replace('[CONTEXTO_PDC]', contextStr)
            .replace('[DATOS_CRITERIOS]', dataStr);

        try {
            const refined = await this._callProxy(prompt);
            await db.from('pdcs_area_trabajo')
                .update({ criterios_evaluacion_ia: refined })
                .eq('id', pdcAreaId);
        } catch (e) {
            console.error(`Error refinando criterios área ${pdcAreaId}:`, e);
        }
    },

    /**
     * Refina y consolida toda la información semanal (Momentos, Recursos, Fuentes, Adaptaciones) en una sola llamada.
     */
    async _refineWeeklyData(pdcAreaId: string, areaTrabajoId: string, tone: TonoRedaccion, depth: string, userId: string, accessToken: string, onProgress?: (msg: string) => void) {
        // 1. Obtener las semanas vinculadas a este diseño de PDC (prioridad pdcAreaId)
        const { data: weeks, error } = await db
            .from('planificacion_semanal')
            .select(`
                *,
                momentos,
                semana_contenido (
                    contenido_usuario (
                        titulo,
                        padre_id
                    )
                )
            `)
            .eq('pdc_area_trabajo_id', pdcAreaId)
            .order('semana', { ascending: true });

        let finalWeeks = weeks as any[];
        
        // Fallback al área maestra si no hay semanas en el diseño (raro en este flujo)
        if (!finalWeeks || finalWeeks.length === 0) {
            const { data: altWeeks } = await db
                .from('planificacion_semanal')
                .select(`
                    *,
                    momentos,
                    semana_contenido (
                        contenido_usuario (
                            titulo,
                            padre_id
                        )
                    )
                `)
                .eq('area_trabajo_id', areaTrabajoId)
                .order('semana', { ascending: true });
            finalWeeks = altWeeks as any[];
        }

        if (error || !finalWeeks || finalWeeks.length === 0) {
            console.warn(`[AiOptimization] No se encontraron semanas para pdcAreaId: ${pdcAreaId}`);
            return;
        }

        for (const week of finalWeeks) {
            onProgress?.(`Optimizando datos semana ${week.semana}...`);

            try {
                // --- 1. Recolectar datos de Momentos ---
                const [practicaDb, teoriaDb, produccionDb, valoracionDb] = await Promise.all([
                    db.from('practica').select('nombre_practica, redactado, descripcion_concreta, proposito, preguntas').eq('planificacion_semanal_id', week.id),
                    db.from('teoria').select('nombre_estrategia_teorica, redactado, descripcion_concreta, proposito').eq('planificacion_semanal_id', week.id),
                    db.from('produccion').select('nombre_produccion, redactado, descripcion_concreta, proposito, instrumento').eq('planificacion_semanal_id', week.id),
                    db.from('valoracion').select('categoria, subcategoria, redactado, preguntas, instrumento, proposito').eq('planificacion_semanal_id', week.id)
                ]);

                const momentosJson = Array.isArray(week.momentos) ? week.momentos : [];
                
                // Consolidar Práctica
                const practicaList = (practicaDb.data && practicaDb.data.length > 0) 
                    ? practicaDb.data 
                    : momentosJson.filter((m: any) => m.type === 'practica' || m.tipo === 'practica');
                
                // Consolidar Teoría
                const teoriaList = (teoriaDb.data && teoriaDb.data.length > 0) 
                    ? teoriaDb.data 
                    : momentosJson.filter((m: any) => m.type === 'teoria' || m.tipo === 'teoria');
                
                // Consolidar Producción
                const produccionList = (produccionDb.data && produccionDb.data.length > 0) 
                    ? produccionDb.data 
                    : momentosJson.filter((m: any) => m.type === 'produccion' || m.tipo === 'produccion');
                
                // Consolidar Valoración
                const valoracionList = (valoracionDb.data && valoracionDb.data.length > 0) 
                    ? valoracionDb.data 
                    : momentosJson.filter((m: any) => m.type === 'valoracion' || m.tipo === 'valoracion');

                console.log(`[AiOptimization] Semana ${week.semana}: Encontrados ${practicaList.length} Practica, ${teoriaList.length} Teoria, ${produccionList.length} Produccion, ${valoracionList.length} Valoracion`);

                const momentosStr = [
                    `PRÁCTICA: ${practicaList.map((i: any) => [
                        i.nombre_practica || i.titulo || 'Actividad',
                        i.proposito ? `Propósito: ${i.proposito}` : '',
                        i.preguntas ? `Preguntas: ${i.preguntas}` : '',
                        i.redactado || i.descripcion_concreta || i.descripcion || i.detalle || i.contenido || ''
                    ].filter(Boolean).join(' | ')).join('; ') || 'No definido'}`,
                    `TEORÍA: ${teoriaList.map((i: any) => [
                        i.nombre_estrategia_teorica || i.titulo || 'Análisis',
                        i.proposito ? `Propósito: ${i.proposito}` : '',
                        i.redactado || i.descripcion_concreta || i.descripcion || i.detalle || i.contenido || ''
                    ].filter(Boolean).join(' | ')).join('; ') || 'No definido'}`,
                    `PRODUCCIÓN: ${produccionList.map((i: any) => [
                        i.nombre_produccion || i.titulo || 'Producto',
                        i.proposito ? `Propósito: ${i.proposito}` : '',
                        i.instrumento ? `Instrumento: ${i.instrumento}` : '',
                        i.redactado || i.descripcion_concreta || i.descripcion || i.detalle || i.contenido || ''
                    ].filter(Boolean).join(' | ')).join('; ') || 'No definido'}`,
                    `VALORACIÓN: ${valoracionList.map((i: any) => [
                        i.categoria || i.titulo || 'Reflexión',
                        i.subcategoria ? `(${i.subcategoria})` : '',
                        i.proposito ? `Propósito: ${i.proposito}` : '',
                        i.instrumento ? `Instrumento: ${i.instrumento}` : '',
                        i.redactado || i.preguntas || i.descripcion || i.detalle || i.contenido || ''
                    ].filter(Boolean).join(' | ')).join('; ') || 'No definido'}`
                ].join('\n');

                // --- 2. Recolectar Recursos y Fuentes ---
                const [recursosDb, fuentesDb] = await Promise.all([
                    db.from('recursos').select('recursos, redactado').eq('planificacion_semanal_id', week.id),
                    db.from('mi_fuente').select('titulo_fuente, autor, detalle').eq('planificacion_semanal_id', week.id)
                ]);

                const recList = (recursosDb.data && recursosDb.data.length > 0) ? recursosDb.data : (Array.isArray(week.recursos) ? week.recursos : []);
                const fteList = (fuentesDb.data && fuentesDb.data.length > 0) ? fuentesDb.data : (Array.isArray(week.fuentes) ? week.fuentes : []);

                const recursosFuentesStr = `Recursos: ${recList.map((r: any) => r.redactado || r.recursos || '').join(', ') || 'No definido'}
                Fuentes: ${fteList.map((f: any) => `${f.titulo_fuente || ''} (${f.autor || ''}): ${f.detalle || ''}`).join('; ') || 'No definido'}`;

                // --- 3. Recolectar Adaptaciones ---
                const { data: basicasDb } = await db.from('adaptaciones_basicas').select('nombre_adaptacion, redactado').eq('planificacion_semanal_id', week.id);
                const basicasList = (basicasDb && basicasDb.length > 0) ? basicasDb : (Array.isArray(week.adaptaciones_basicas) ? week.adaptaciones_basicas : []);
                const especialesList = Array.isArray(week.adaptacion_especial) ? week.adaptacion_especial : [];

                const adaptacionesStr = `
                Básicas: ${basicasList.map((a: any) => `${a.nombre_adaptacion || ''}: ${a.redactado || ''}`).join('; ') || 'No definido'}
                Especiales: ${especialesList.map((a: any) => `${a.nombre_adaptacion || ''}: ${a.redactado || ''}`).join('; ') || 'No definido'}
                `;

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

                const ctx = areaContext?.areas_trabajo as any;
                const contentTitles = (week.semana_contenido || [])
                    .map((sc: any) => sc.contenido_usuario?.titulo)
                    .filter(Boolean)
                    .join(', ');

                const contextStr = ctx
                    ? `Nivel: ${ctx.areas_conocimiento?.grados?.niveles?.nombre}, Grado: ${ctx.areas_conocimiento?.grados?.nombre}, Área: ${ctx.areas_conocimiento?.nombre}${contentTitles ? `, Temas semana ${week.semana}: ${contentTitles}` : ''}`
                    : 'Contexto no disponible';

                const prompt = SYSTEM_PROMPT_WEEKLY_BATCH
                    .replace('[TONO_SELECCIONADO]', tone)
                    .replace('[CORRECCION_PROFUNDIDAD]', depth)
                    .replace('[CONTEXTO_PDC]', contextStr)
                    .replace('[DATOS_MOMENTOS]', momentosStr)
                    .replace('[DATOS_RECURSOS_FUENTES]', recursosFuentesStr)
                    .replace('[DATOS_ADAPTACIONES]', adaptacionesStr);


                // --- 5. Llamar a la IA ---
                const rawResponse = await this._callProxy(prompt);

                // --- 6. Parsear JSON y Guardar ---
                try {
                    const cleanJsonStr = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                    const parsed = JSON.parse(cleanJsonStr);

                    await db.from('planificacion_semanal')
                        .update({
                            momentos_ia: parsed.momentos_ia || '',
                            recursos_fuentes_ia: parsed.recursos_fuentes_ia || '',
                            adaptaciones_basicas_ia: parsed.adaptaciones_basicas_ia || '',
                            adaptaciones_especiales_ia: parsed.adaptaciones_especiales_ia || ''
                        })
                        .eq('id', week.id);

                } catch (parseError) {
                    console.error(`Error parseando JSON de semana ${week.id}:`, rawResponse, parseError);
                    // Fallback de seguridad por si la IA se olvida de devolver JSON
                    await db.from('planificacion_semanal')
                        .update({ momentos_ia: rawResponse })
                        .eq('id', week.id);
                }

            } catch (e) {
                console.error(`Error procesando semana ${week.id}:`, e);
            }
        }
    }
};
