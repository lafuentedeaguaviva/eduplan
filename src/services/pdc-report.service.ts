import { db } from '@/lib/database';
import { 
    FullReportData, 
    FullReportArea, 
    HierarchyRoot, 
    PlanificacionSemanal,
    UserContent,
    PDC
} from '@/types';

/**
 * Service: PdcReportService
 * Focus: Formatting and hierarchy construction for pedagogical reports.
 * 
 * Este servicio implementa la lógica de agregación de datos para el reporte maestro.
 * Se encarga de transformar datos planos de la DB en estructuras jerárquicas legibles.
 */
export const PdcReportService = {

    /**
     * Obtiene y procesa todos los datos necesarios para el reporte completo del PDC.
     */
    async getFullReportData(pdcId: string, mode: 'ia' | 'original' = 'original', forceLive = false, customDb?: any): Promise<FullReportData | null> {
        const client = customDb || db;
        try {
            // 0. Estrategia "Snapshot First": Verificar si existe una revisión guardada (JSON congelado)
            // Solo si NO estamos forzando datos en vivo (necesario para el Wizard)
            if (!forceLive) {
                console.log("[PdcReportService] Buscando snapshot para ID:", pdcId);
                
                // Intento 1: Buscar por ID directo de la revisión
                let { data: snap } = await client
                    .from('pdc_revisiones')
                    .select('pdc_snapshot')
                    .eq('id', pdcId)
                    .maybeSingle();

                // Intento 2: Buscar por ID del PDC origen (la versión más reciente)
                if (!snap) {
                    console.log("[PdcReportService] No se encontró por ID de revisión. Probando por pdc_origen_id...");
                    const { data: latestSnap } = await client
                        .from('pdc_revisiones')
                        .select('pdc_snapshot')
                        .eq('pdc_origen_id', pdcId)
                        .order('version', { ascending: false })
                        .limit(1)
                        .maybeSingle();
                    snap = latestSnap;
                }

            if (snap?.pdc_snapshot) {
                console.log("[PdcReportService] Snapshot encontrado satisfactoriamente.");
                const snapshot = snap.pdc_snapshot as FullReportData;

                // HIDRATACIÓN DE EMERGENCIA: Si el snapshot no tiene distrito o unidad (por ser antiguo), lo buscamos
                if (!snapshot.distritos || !snapshot.unidades || snapshot.distritos === 'N/A') {
                    console.log("[PdcReportService] Hidratando metadatos faltantes en el snapshot...");
                    try {
                        const { data: geoData } = await client
                            .from('pdcs')
                            .select(`
                                pdcs_area_trabajo (
                                    areas_trabajo (
                                        nombre,
                                        unidades_educativas (
                                            nombre,
                                            distritos (nombre)
                                        )
                                    )
                                )
                            `)
                            .eq('id', snapshot.gestion ? pdcId : (snapshot as any).id || pdcId)
                            .maybeSingle();

                        if (geoData?.pdcs_area_trabajo?.[0]?.areas_trabajo) {
                            const at = geoData.pdcs_area_trabajo[0].areas_trabajo as any;
                            snapshot.unidades = at.unidades_educativas?.nombre || snapshot.unidades;
                            const ue = at.unidades_educativas;
                            const d = Array.isArray(ue?.distritos) ? ue.distritos[0] : ue?.distritos;
                            snapshot.distritos = d?.nombre || snapshot.distritos;
                            console.log("[PdcReportService] Hidratación completada:", { distrito: snapshot.distritos });
                        }
                    } catch (e) {
                        console.error("[PdcReportService] Error en hidratación:", e);
                    }
                }
                
                return snapshot;
            }
        }
            
        console.log("[PdcReportService] Continuando con consulta en vivo (Agregación dinámica)...");

            // 1. Fallback: Consulta en vivo (Agregación dinámica)
            const { data: pdcRaw, error: pdcError } = await client
                .from('pdcs')
                .select(`
                    *,
                    docente:perfiles!docente_id (*),
                    director:perfiles!director_id (*),
                    pdcs_area_trabajo (
                        *,
                        areas_trabajo (
                            *,
                            unidad_educativa:unidades_educativas (*, distrito:distritos (nombre)),
                            areas_conocimiento (
                                *,
                                grados (
                                    *,
                                    niveles (*)
                                )
                            ),
                            planificacion_semanal (
                                *,
                                practica (*),
                                teoria (*),
                                produccion (*),
                                valoracion (*),
                                recursos (*),
                                mi_fuente (*),
                                adaptaciones_basicas (*),
                                semana_contenido (
                                    *,
                                    contenidos_usuario (
                                        *,
                                        padre:padre_id (titulo)
                                    )
                                )
                            )
                        )
                    )
                `)
                .eq('id', pdcId)
                .maybeSingle(); // Usamos maybeSingle para evitar el error PGRST116 si no se encuentra

            if (pdcError) {
                console.error("[PdcReportService] Error fetching PDC live data:", pdcError.message, pdcError.code);
                throw new Error(pdcError.message);
            }

            if (!pdcRaw) {
                console.warn("[PdcReportService] PDC no encontrado en la DB (ID buscado):", pdcId);
                return null;
            }

            console.log("[PdcReportService] Datos en vivo recuperados para PDC:", pdcId);
            const pdc = pdcRaw as any; // Cast temporal para acceso dinámico seguro tras validación

            const formatName = (p: any) => p ? `${p.titulo || ''} ${p.nombres || ''} ${p.apellidos || ''}`.trim() : 'N/A';

            const distritos = new Set<string>();
            const unidades = new Set<string>();
            const niveles = new Set<string>();
            const gradosMap = new Map<string, Set<string>>();
            const areasSet = new Set<string>();
            const periodosList: string[] = [];
            const areasTrabajoFull: FullReportArea[] = [];
            let objetivoHolisticoNivel = "";
            const allBibliographies = new Set<string>();

            if (pdc.pdcs_area_trabajo) {
                // Ordenar para mantener el orden de inserción (orden de selección del usuario)
                pdc.pdcs_area_trabajo.sort((a: any, b: any) => {
                    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
                    if (timeA && timeB && timeA !== timeB) return timeA - timeB;
                    const idA = a.id || '';
                    const idB = b.id || '';
                    return idA.toString().localeCompare(idB.toString());
                });

                for (const pat of pdc.pdcs_area_trabajo) {
                    // ... (rest of the logic remains same until processedWeeks)
                    const at = Array.isArray(pat.areas_trabajo) ? pat.areas_trabajo[0] : pat.areas_trabajo;
                    if (!at) continue;

                        // Extraer distrito de manera segura (maneja objetos y arrays de Supabase)
                        const ue = at.unidad_educativa;
                        if (ue) {
                            unidades.add(ue.nombre);
                            const d = Array.isArray(ue.distrito) ? ue.distrito[0] : ue.distrito;
                            if (d?.nombre) distritos.add(d.nombre);
                        }

                    // Grados, Niveles y Objetivos Holísticos
                    let currentGradoName = "N/A";
                    if (at.areas_conocimiento) {
                        areasSet.add(at.areas_conocimiento.nombre);
                        if (at.areas_conocimiento.grados) {
                            currentGradoName = at.areas_conocimiento.grados.nombre;
                            if (!gradosMap.has(currentGradoName)) gradosMap.set(currentGradoName, new Set());
                            
                            if (at.areas_conocimiento.grados.niveles) {
                                niveles.add(at.areas_conocimiento.grados.niveles.nombre);
                                objetivoHolisticoNivel = at.areas_conocimiento.grados.niveles.objetivo_holistico || objetivoHolisticoNivel;
                            }
                        }
                    }

                    // Paralelos vinculados
                    if (at.area_trabajo_paralelo && Array.isArray(at.area_trabajo_paralelo)) {
                        at.area_trabajo_paralelo.forEach((atp: any) => {
                            if (atp.paralelos) {
                                if (!gradosMap.has(currentGradoName)) gradosMap.set(currentGradoName, new Set());
                                gradosMap.get(currentGradoName)?.add(atp.paralelos.nombre);
                            }
                        });
                    }

                    // Filtrar semanas que corresponden a la gestión, trimestre y mes del PDC
                    const filteredWeeks = (at.planificacion_semanal || [])
                        .filter((s: any) => 
                            Number(s.trimestre) === Number(pdc.trimestre) && 
                            Number(s.gestion) === Number(pdc.gestion) &&
                            Number(s.mes) === Number(pdc.mes)
                        )
                        .sort((a: any, b: any) => {
                            if (a.mes !== b.mes) return a.mes - b.mes;
                            return a.semana - b.semana;
                        });

                    if (filteredWeeks.length > 0) {
                        const globalHierarchy = this._buildGlobalHierarchy(filteredWeeks);
                        
                        // Recuperar Objetivos Estratégicos (Paso 4-7)
                        const { data: objData } = await client
                            .from('objetivo_estrategico')
                            .select(`
                                id,
                                descripcion,
                                descripcion_ia,
                                objetivo_estrategico_contenido (
                                    contenido_usuario_id
                                )
                            `)
                            .eq('pdc_area_trabajo_id', pat.id);
                        
                        const processedWeeks = filteredWeeks.map((s: any) => {
                            const weekScIds = new Set<number>((s.semana_contenido || [])
                                .map((sc: any) => sc.contenidos_usuario?.id)
                                .filter(Boolean)
                            );
                            const weekHierarchy = this._formatHierarchy(globalHierarchy, weekScIds);
                            
                            // Versión Original (Sin IA) - Fallback a tablas relacionales y diferentes nombres de campos
                            const parseJsonField = (field: any) => {
                                if (Array.isArray(field)) return field;
                                if (typeof field === 'string' && field.trim().startsWith('[')) {
                                    try { return JSON.parse(field); } catch (e) { return []; }
                                }
                                return [];
                            };

                            const allRecs = [
                                ...(Array.isArray(s.recursos) ? s.recursos : []),
                                ...parseJsonField(s.recursos_json),
                                ...(Array.isArray(s.recursos_rel) ? s.recursos_rel : [])
                            ];
                            const recs = allRecs.map((r: any) => 
                                typeof r === 'string' ? r : (r.redactado || r.recursos || r.nombre || '')
                            ).filter(Boolean);

                            const allFts = [
                                ...(Array.isArray(s.fuentes) ? s.fuentes : []),
                                ...parseJsonField(s.fuentes_json),
                                ...(Array.isArray(s.mi_fuente) ? s.mi_fuente : [])
                            ];
                            const fts = allFts.map((f: any) => {
                                if (typeof f === 'string') return f;
                                const parts = [
                                    f.autor,
                                    f.anio || f.detalle ? `(${f.anio || f.detalle})` : '',
                                    f.titulo_fuente || f.titulo || ''
                                ].filter(Boolean);
                                return parts.join(' ');
                            }).filter(Boolean);

                            const recursosFuentesOriginal = [...new Set([...recs, ...fts])].join("; ") || "No definido";
                            
                            const rawAdapt = s.adaptaciones_basicas_rel || [];
                            const adaptBasicasOriginal = (Array.isArray(s.adaptaciones_basicas) && s.adaptaciones_basicas.length > 0)
                                ? s.adaptaciones_basicas.map((a: any) => `- ${a.nombre_adaptacion || ''}: ${a.redactado || ''}`).join('\n') || "No definido"
                                : rawAdapt.length > 0 ? rawAdapt.map((a: any) => `- ${a.nombre_adaptacion || ''}: ${a.redactado || ''}`).join('\n') : "No definido";
                                
                            const adaptEspecialesOriginal = (Array.isArray(s.adaptacion_especial) && s.adaptacion_especial.length > 0)
                                ? s.adaptacion_especial.map((a: any) => `- ${a.nombre_adaptacion || ''}: ${a.redactado || ''}`).join('\n') || "No definido"
                                : "No definido";

                            const weekObjectives = (objData || []).filter((obj: any) => 
                                obj.objetivo_estrategico_contenido?.some((rel: any) => weekScIds.has(rel.contenido_usuario_id))
                            );
                            const weekObjectivesText = weekObjectives.map((o: any) => o.descripcion).join("\n") || "No definido";
                            const weekObjectivesTextIA = weekObjectives.map((o: any) => o.descripcion_ia || o.descripcion).join("\n") || weekObjectivesText;

                            return {
                                ...s,
                                momentos_original: this._formatOriginalMoments(s),
                                recursos_fuentes_original: recursosFuentesOriginal,
                                adaptaciones_basicas_original: adaptBasicasOriginal,
                                adaptaciones_especiales_original: adaptEspecialesOriginal,
                                semana_contenido_hier: weekHierarchy,
                                objetivos_aprendizaje: weekObjectivesText,
                                objetivos_aprendizaje_ia: weekObjectivesTextIA
                            } as PlanificacionSemanal;
                        });

                        const joinedObjectives = (objData || [])
                            .map((o: any) => o.descripcion)
                            .filter(Boolean)
                            .join("\n");

                        // Consolidar adaptaciones especiales de todas las semanas
                        const adaptacionesEspeciales = filteredWeeks
                            .map((s: any) => s.adaptaciones_especiales_ia)
                            .filter(Boolean)
                            .join("\n");

                        areasTrabajoFull.push({
                            id: pat.id,
                            nombre: at.nombre || at.areas_conocimiento?.nombre || "Área",
                            grado_nombre: currentGradoName,
                            objetivos_aprendizaje: pat.objetivo_estrategico || (objData || []).map((o: any) => o.descripcion).filter(Boolean).join("\n") || "No definido",
                            objetivos_aprendizaje_ia: pat.objetivo_estrategico_ia || pat.objetivo_estrategico || (objData || []).map((o: any) => o.descripcion).filter(Boolean).join("\n") || "No definido",
                            criterios_evaluacion: this._formatEvaluationCriterias(pat.criterios_evaluacion),
                            criterios_evaluacion_ia: (pat.criterios_evaluacion_ia || this._formatEvaluationCriterias(pat.criterios_evaluacion)),
                            adaptaciones_no_significativas: (pat.adaptaciones_no_significativas || "Ninguna"),
                            adaptaciones_no_significativas_ia: (pat.adaptaciones_no_significativas_ia || "Ninguna"),
                            adaptaciones_especiales_original: filteredWeeks.map((s: any) => (s.adaptacion_especial || []).map((a: any) => a.nombre_adaptacion).join(", ")).filter(Boolean).join("\n") || "Ninguna",
                            adaptaciones_especiales_ia: adaptacionesEspeciales || "Ninguna",
                            criterios_evaluacion_adaptaciones: this._formatAdaptationCriterias(pat.criterio_adptacion_evaluacion),
                            criterios_evaluacion_adaptaciones_ia: (pat.criterios_evaluacion_adaptaciones_ia || this._formatAdaptationCriterias(pat.criterio_adptacion_evaluacion)),
                            periodo_semanal: pat.periodo_semanal || 0,
                            semanas: processedWeeks
                        });
                    }

                    if (pat.periodo_semanal) {
                        periodosList.push(pat.periodo_semanal.toString());
                    }
                }
            }

            const formattedGrados = Array.from(gradosMap.entries())
                .map(([grado, paras]) => paras.size > 0 ? `${grado} (${Array.from(paras).sort().join(", ")})` : grado)
                .join(" / ");

            return {
                gestion: pdc.gestion,
                trimestre: pdc.trimestre,
                mes: pdc.mes,
                distritos: Array.from(distritos).join(" / ") || "N/A",
                unidades: Array.from(unidades).join(" / ") || "N/A",
                niveles: Array.from(niveles).join(" / ") || "N/A",
                grados: formattedGrados || "N/A",
                areas: Array.from(areasSet).join(" / ") || "N/A",
                docente: formatName(pdc.docente),
                docente_id: pdc.docente_id || '',
                director: formatName(pdc.director),
                director_id: pdc.director_id || '',
                objetivo_holistico_nivel: objetivoHolisticoNivel || "No definido",
                areas_trabajo: areasTrabajoFull,
                bibliografia_global: Array.from(allBibliographies).sort().join("\n") || "No definido"
            };

        } catch (error: any) {
            console.error("[PdcReportService] Error in getFullReportData:", error);
            throw error;
        }
    },

    /**
     * Helper Internal: Construye la jerarquía global de contenidos para las semanas.
     */
    _buildGlobalHierarchy(weeks: any[]): HierarchyRoot[] {
        const hierarchy: HierarchyRoot[] = [];
        const rootsMap = new Map<number, HierarchyRoot>();

        weeks.forEach(s => {
            const scs = (s.semana_contenido || [])
                .filter((sc: any) => sc.contenidos_usuario)
                .sort((a: any, b: any) => (a.contenidos_usuario.orden || 0) - (b.contenidos_usuario.orden || 0));

            scs.forEach((sc: any) => {
                const cu = sc.contenidos_usuario as UserContent;
                if (!cu.padre_id) {
                    if (!rootsMap.has(cu.id)) {
                        const newRoot: HierarchyRoot = { 
                            ...cu, 
                            children: [], 
                            global_index: 0, 
                            present_as_root: false 
                        };
                        hierarchy.push(newRoot);
                        rootsMap.set(cu.id, newRoot);
                    }
                } else {
                    let root = rootsMap.get(cu.padre_id);
                    if (!root) {
                        const newRoot: HierarchyRoot = { 
                            id: cu.padre_id, 
                            titulo: (cu as any).padre?.titulo || "Tema", 
                            orden: 1, 
                            children: [], 
                            global_index: 0, 
                            present_as_root: false 
                        };
                        hierarchy.push(newRoot);
                        rootsMap.set(cu.padre_id, newRoot);
                        root = newRoot;
                    }
                    if (!root.children.find(c => c.id === cu.id)) {
                        root.children.push({ ...cu, global_sub_index: 0 });
                    }
                }
            });
        });

        // Ordenar y asignar índices globales
        hierarchy.sort((a,b) => (a.orden || 0) - (b.orden || 0));
        hierarchy.forEach((root, idx) => {
            root.global_index = idx + 1;
            root.children.sort((a, b) => (a.orden || 0) - (b.orden || 0));
            root.children.forEach((child, cidx) => {
                child.global_sub_index = cidx + 1;
            });
        });

        return hierarchy;
    },

    /**
     * Helper Internal: Filtra la jerarquía para una semana específica basándose en IDs planificados.
     */
    _formatHierarchy(globalHierarchy: HierarchyRoot[], weekScIds: Set<number>): HierarchyRoot[] {
        return globalHierarchy.map(root => {
            const rootInWeek = weekScIds.has(root.id);
            const childrenInWeek = root.children.filter(c => weekScIds.has(c.id));
            if (rootInWeek || childrenInWeek.length > 0) {
                return { ...root, children: childrenInWeek, present_as_root: rootInWeek } as HierarchyRoot;
            }
            return null;
        }).filter((item): item is HierarchyRoot => item !== null);
    },

    /**
     * Helper Internal: Formatea los momentos originales de una semana en texto legible.
     */
    _formatOriginalMoments(semana: any): string {
        let momentosJson: any[] = [];
        
        if (Array.isArray(semana.momentos)) {
            momentosJson = semana.momentos;
        } else if (typeof semana.momentos === 'string' && semana.momentos.trim().startsWith('[')) {
            try {
                momentosJson = JSON.parse(semana.momentos);
            } catch (e) {
                console.error("[PdcReportService] Error parsing momentos JSON string:", e);
            }
        }
        
        // Si el JSONB está vacío, intentamos reconstruir desde tablas relacionadas (Manual Mode)
        if (momentosJson.length === 0) {
            const p = (semana.practica || []).map((i: any) => ({ ...i, type: 'practica' }));
            const t = (semana.teoria || []).map((i: any) => ({ ...i, type: 'teoria' }));
            const pr = (semana.produccion || []).map((i: any) => ({ ...i, type: 'produccion' }));
            const v = (semana.valoracion || []).map((i: any) => ({ ...i, type: 'valoracion' }));
            momentosJson = [...p, ...t, ...pr, ...v];
        }

        const formatItem = (i: any) => [
            i.nombre_practica || i.nombre_estrategia_teorica || i.nombre_produccion || i.categoria || i.titulo || 'Actividad',
            i.proposito ? `Propósito: ${i.proposito}` : '',
            i.preguntas ? `Preguntas: ${i.preguntas}` : '',
            i.redactado || i.descripcion_concreta || i.descripcion || i.detalle || i.contenido || ''
        ].filter(Boolean).join(' | ');

        const practicaList = momentosJson.filter((m: any) => m.type === 'practica' || m.tipo === 'practica');
        const teoriaList = momentosJson.filter((m: any) => m.type === 'teoria' || m.tipo === 'teoria');
        const produccionList = momentosJson.filter((m: any) => m.type === 'produccion' || m.tipo === 'produccion');
        const valoracionList = momentosJson.filter((m: any) => m.type === 'valoracion' || m.tipo === 'valoracion');

        return [
            `PRÁCTICA: ${practicaList.map(formatItem).join('; ') || 'No definido'}`,
            `TEORÍA: ${teoriaList.map(formatItem).join('; ') || 'No definido'}`,
            `PRODUCCIÓN: ${produccionList.map(formatItem).join('; ') || 'No definido'}`,
            `VALORACIÓN: ${valoracionList.map(formatItem).join('; ') || 'No definido'}`
        ].join('\n\n');
    },

    /**
     * Helper Internal: Formatea el snapshot JSONB de criterios de evaluación en texto.
     */
    _formatEvaluationCriterias(json: any): string {
        let data = json;
        if (typeof json === 'string' && json.trim().startsWith('[')) {
            try { data = JSON.parse(json); } catch(e) {}
        }
        if (!data || !Array.isArray(data) || data.length === 0) return "No definido";
        return data.map((i: any) => {
            const parts = [
                i.categoria || i.verbo || i.nombre_ser || i.verbo_saber || i.redactado || 'Criterio',
                i.subcategoria || i.nivel || '',
                i.instrumento ? `[${i.instrumento}]` : ''
            ].filter(Boolean).join(' ');
            return parts;
        }).join(' / ');
    },

    /**
     * Helper Internal: Formatea el snapshot JSONB de adaptaciones en texto.
     */
    _formatAdaptationCriterias(json: any): string {
        let data = json;
        if (typeof json === 'string' && json.trim().startsWith('[')) {
            try { data = JSON.parse(json); } catch(e) {}
        }
        if (!data || !Array.isArray(data) || data.length === 0) return "No definido";
        return data.map((i: any) => {
            return `${i.nombre || i.condicion || 'Adaptación'}: ${i.redactado || ''}`;
        }).join(' / ');
    }
};
