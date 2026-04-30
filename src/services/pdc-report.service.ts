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
    async getFullReportData(pdcId: string, customDb?: any): Promise<FullReportData | null> {
        const client = customDb || db;
        try {
            // Consulta optimizada con joins profundos según BasedeDatos.md
            const { data: pdcRaw, error: pdcError } = await client
                .from('pdcs')
                .select(`
                    *,
                    docente:perfiles!pdcs_docente_id_fkey (*),
                    director:perfiles!pdcs_director_id_fkey (*),
                    pdcs_area_trabajo (
                        *,
                        areas_trabajo:areas_trabajo (
                            *,
                            unidades_educativas (
                                *, 
                                distritos (*)
                            ),
                            area_trabajo_paralelo (
                                paralelos (*)
                            ),
                            areas_conocimiento (
                                *,
                                grados:grados (
                                    *,
                                    niveles:niveles (*)
                                )
                            ),
                            planificacion_semanal (
                                *,
                                semana_contenido (
                                    *,
                                    contenidos_usuario:contenidos_usuario (
                                        *,
                                        padre:padre_id (titulo)
                                    )
                                )
                            )
                        )
                    )
                `)
                .eq('id', pdcId)
                .single();

            if (pdcError || !pdcRaw) {
                console.error("[PdcReportService] Error fetching PDC for report:", JSON.stringify(pdcError, null, 2), pdcError?.message, pdcError?.details, pdcError?.hint);
                return null;
            }

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
                for (const pat of pdc.pdcs_area_trabajo) {
                    // ... (rest of the logic remains same until processedWeeks)
                    const at = Array.isArray(pat.areas_trabajo) ? pat.areas_trabajo[0] : pat.areas_trabajo;
                    if (!at) continue;

                    // Unidades Educativas y Distritos
                    if (at.unidades_educativas) {
                        unidades.add(at.unidades_educativas.nombre);
                        if (at.unidades_educativas.distritos) {
                            distritos.add(at.unidades_educativas.distritos.nombre);
                        }
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

                    // Filtrar semanas que corresponden a la gestión y trimestre del PDC
                    const filteredWeeks = (at.planificacion_semanal || [])
                        .filter((s: any) => 
                            Number(s.trimestre) === Number(pdc.trimestre) && 
                            Number(s.gestion) === Number(pdc.gestion)
                        )
                        .sort((a: any, b: any) => a.semana - b.semana);

                    if (filteredWeeks.length > 0) {
                        const globalHierarchy = this._buildGlobalHierarchy(filteredWeeks);
                        
                        const processedWeeks: PlanificacionSemanal[] = filteredWeeks.map((s: any) => {
                            const weekScIds = new Set<number>((s.semana_contenido || [])
                                .map((sc: any) => sc.contenidos_usuario?.id)
                                .filter(Boolean)
                            );
                            const weekHierarchy = this._formatHierarchy(globalHierarchy, weekScIds);
                            
                            // FALLBACK para Recursos y Fuentes si no hay IA
                            let recursosFuentesFallback = s.recursos_fuentes_ia;
                            if (!recursosFuentesFallback || recursosFuentesFallback === 'No definido' || recursosFuentesFallback === 'N/A') {
                                const recs = (s.recursos || []).map((r: any) => r.redactado || r.recursos).filter(Boolean);
                                const fts = (s.fuentes || []).map((f: any) => `${f.autor || ''} (${f.anio || ''}). ${f.titulo_fuente || ''}`).filter(Boolean);
                                recursosFuentesFallback = [...recs, ...fts].join("; ") || "No definido";
                            }

                            // Coleccionar para Bibliografía Global
                            (s.fuentes || []).forEach((f: any) => {
                                const cite = `${f.autor || 'S/A'} (${f.anio || 's.f.'}). ${f.titulo_fuente || 'Sin título'}. ${f.url || ''}`.trim();
                                allBibliographies.add(cite);
                            });

                            return {
                                ...s,
                                recursos_fuentes_ia: recursosFuentesFallback,
                                semana_contenido_hier: weekHierarchy
                            } as PlanificacionSemanal;
                        });

                        // Recuperar Objetivos Estratégicos (Paso 4-7)
                        const { data: objData } = await client
                            .from('objetivo_estrategico')
                            .select('descripcion, descripcion_ia')
                            .eq('pdc_area_trabajo_id', pat.id);
                        
                        const joinedObjectives = (objData || [])
                            .map(o => o.descripcion_ia || o.descripcion)
                            .filter(Boolean)
                            .join(" / ");

                        // Consolidar adaptaciones especiales de todas las semanas
                        const adaptacionesEspeciales = filteredWeeks
                            .map((s: any) => s.adaptaciones_especiales_ia)
                            .filter(Boolean)
                            .join(" / ");

                        areasTrabajoFull.push({
                            id: pat.id,
                            nombre: at.nombre || at.areas_conocimiento?.nombre || "Área",
                            grado_nombre: currentGradoName,
                            objetivos_aprendizaje: joinedObjectives || "No definido",
                            criterios_evaluacion: (pat.criterios_evaluacion_ia || pat.criterios_evaluacion || "No definido"),
                            adaptaciones_no_significativas: (pat.adaptaciones_no_significativas_ia || "Ninguna"),
                            adaptaciones_especiales_ia: adaptacionesEspeciales || "Ninguna",
                            criterios_evaluacion_adaptaciones: (pat.criterios_evaluacion_adaptaciones_ia || "No definido"),
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
                distritos: Array.from(distritos).join(" / ") || "N/A",
                unidades: Array.from(unidades).join(" / ") || "N/A",
                niveles: Array.from(niveles).join(" / ") || "N/A",
                grados: formattedGrados || "N/A",
                areas: Array.from(areasSet).join(" / ") || "N/A",
                docente: formatName(pdc.docente),
                director: formatName(pdc.director),
                objetivo_holistico_nivel: objetivoHolisticoNivel || "No definido",
                areas_trabajo: areasTrabajoFull,
                bibliografia_global: Array.from(allBibliographies).sort().join(" / ") || "No definido"
            };

        } catch (error) {
            console.error("[PdcReportService] Error in getFullReportData:", error);
            return null;
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
    }
};
