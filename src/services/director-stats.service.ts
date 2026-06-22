import { db } from '@/lib/database';
import { ServiceResponse } from '@/types';

export const DirectorStatsService = {
    _extractVerb(objective: string): string {
        // Remover viñetas, guiones, números y espacios al inicio
        const cleanText = objective.replace(/^[-*0-9.)\s]+/, '').trim();
        const words = cleanText.split(/\s+/);
        if (words.length === 0) return 'desconocido';
        return words[0].replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').toLowerCase();
    },

    _mapToBloom(verb: string, dynamicMap: Map<string, string>): string {
        const v = verb.toLowerCase();
        
        // Exact match
        if (dynamicMap.has(v)) return dynamicMap.get(v)!;

        // Stem matching (raíz del verbo)
        for (const [key, category] of dynamicMap.entries()) {
            const stem = key.slice(0, -2); // remover ar/er/ir
            if (stem.length > 2 && v.startsWith(stem)) {
                return category;
            }
        }
        
        // Verbos muy comunes en el contexto educativo de Bolivia (Dimensiones)
        if (v.startsWith('fortalec') || v.startsWith('asum') || v.startsWith('valor') || v.startsWith('respet') || v.startsWith('reflexion')) {
            return 'Evaluar'; // En Bloom encaja en el dominio afectivo / evaluación
        }
        if (v.startsWith('desarroll') || v.startsWith('promov') || v.startsWith('foment') || v.startsWith('contribuy') || v.startsWith('transform')) {
            return 'Crear'; 
        }
        if (v.startsWith('utiliz')) {
            return 'Aplicar';
        }
        if (v.startsWith('particip')) {
            return 'Crear';
        }

        return 'Otros / No clasificado';
    },

    _incrementCounter(map: Map<string, number>, key: string | null | undefined, defaultKey: string = 'Sin Tipo Específico') {
        const finalKey = (key && key.trim() !== '') ? key.trim() : defaultKey;
        map.set(finalKey, (map.get(finalKey) || 0) + 1);
    },

    async getPedagogicalStats(directorId: string, client: any = db): Promise<ServiceResponse<any>> {
        try {
            // 1. Identificar PDCs correspondientes desde pdc_revisiones (aprobados)
            const { data: revisiones, error: revError } = await client
                .from('pdc_revisiones')
                .select('pdc_origen_id')
                .eq('director_id', directorId)
                .eq('estado', 'aprobado');

            if (revError) throw revError;

            if (!revisiones || revisiones.length === 0) {
                return { data: null, error: "No hay PDCs aprobados para generar estadísticas.", success: false };
            }

            const pdcIds = Array.from(new Set(revisiones.map((r: any) => r.pdc_origen_id).filter(Boolean)));

            if (pdcIds.length === 0) {
                 return { data: null, error: "No se pudieron resolver los identificadores de PDCs de las revisiones aprobadas.", success: false };
            }

            // 2. Extraer TODA la estructura relacional de los PDCs
            const { data: pdcs, error: pdcError } = await client
                .from('pdcs')
                .select(`
                    id,
                    pdcs_area_trabajo (
                        id,
                        criterios_evaluacion,
                        planificacion_semanal (
                            id,
                            momentos,
                            momentos_ia,
                            practica (*),
                            teoria (*),
                            produccion (*),
                            valoracion (*)
                        ),
                        areas_trabajo (
                            id,
                            planificacion_semanal (
                                id,
                                momentos,
                                momentos_ia,
                                practica (*),
                                teoria (*),
                                produccion (*),
                                valoracion (*)
                            )
                        ),
                        objetivo_estrategico (descripcion, descripcion_ia)
                    )
                `)
                .in('id', pdcIds);

            if (pdcError) throw pdcError;

            // Contadores
            let totalObjectives = 0;
            const bloomCounts = new Map<string, number>();
            const practicaCounts = new Map<string, number>();
            const teoriaCounts = new Map<string, number>();
            const produccionCounts = new Map<string, number>();
            const valoracionCounts = new Map<string, number>();
            const serCounts = new Map<string, number>();
            const saberCounts = new Map<string, number>();
            const hacerCounts = new Map<string, number>();

            // Construir Map dinámico desde catalogo_verbos
            const dynamicBloomMap = new Map<string, string>();
            try {
                const { data: verbosData } = await client.from('catalogo_verbos').select('verbo, detalle_tipo');
                if (verbosData) {
                    verbosData.forEach((v: any) => {
                        if (v.verbo && v.detalle_tipo) {
                            dynamicBloomMap.set(v.verbo.toLowerCase(), v.detalle_tipo);
                        }
                    });
                }
            } catch (e) {
                console.warn("[DirectorStats] Error al obtener catalogo_verbos", e);
            }

            // 4. Clasificar Objetivos, Criterios y Momentos
            const pdcAreaIds: string[] = [];
            const semanaIds: string[] = [];

            (pdcs || []).forEach((pdc: any) => {
                const pdcAreas = Array.isArray(pdc.pdcs_area_trabajo) ? pdc.pdcs_area_trabajo : (pdc.pdcs_area_trabajo ? [pdc.pdcs_area_trabajo] : []);
                pdcAreas.forEach((pat: any) => {
                    if (pat.id) pdcAreaIds.push(pat.id);

                    // Objetivos
                    const objetivos = pat.objetivo_estrategico || [];
                    objetivos.forEach((obj: any) => {
                        const txt = obj.descripcion_ia || obj.descripcion || '';
                        if (txt.length > 5) {
                            const verb = this._extractVerb(txt);
                            this._incrementCounter(bloomCounts, this._mapToBloom(verb, dynamicBloomMap));
                            totalObjectives++;
                        }
                    });

                    // Semanas (Momentos)
                    const areasTrabajo = Array.isArray(pat.areas_trabajo) ? pat.areas_trabajo : (pat.areas_trabajo ? [pat.areas_trabajo] : []);
                    const patSemanas = Array.isArray(pat.planificacion_semanal) ? pat.planificacion_semanal : (pat.planificacion_semanal ? [pat.planificacion_semanal] : []);
                    const atSemanas = areasTrabajo.flatMap((at: any) => Array.isArray(at.planificacion_semanal) ? at.planificacion_semanal : []);
                    const semanas = [...patSemanas, ...atSemanas];
                    
                    semanas.forEach((sem: any) => {
                        if (sem.id) semanaIds.push(sem.id);
                    });
                });
            });

            if (pdcAreaIds.length > 0) {
                const [resSer, resSaber, resHacer] = await Promise.all([
                    client.from('ser').select('categoria, subcategoria, biblioteca_ser(categoria)').in('pdc_area_trabajo_id', pdcAreaIds),
                    client.from('saber').select('nivel, subnivel, biblioteca_saber(nivel)').in('pdc_area_trabajo_id', pdcAreaIds),
                    client.from('hacer').select('nivel, subnivel, biblioteca_hacer(nivel)').in('pdc_area_trabajo_id', pdcAreaIds),
                ]);
                (resSer.data || []).forEach((s: any) => {
                    const cat = s.biblioteca_ser?.categoria || s.categoria || s.subcategoria;
                    this._incrementCounter(serCounts, cat, 'Ser General');
                });
                (resSaber.data || []).forEach((s: any) => {
                    const n = s.biblioteca_saber?.nivel || s.nivel || s.subnivel;
                    this._incrementCounter(saberCounts, n, 'Saber General');
                });
                (resHacer.data || []).forEach((h: any) => {
                    const n = h.biblioteca_hacer?.nivel || h.nivel || h.subnivel;
                    this._incrementCounter(hacerCounts, n, 'Hacer General');
                });
            }

            if (semanaIds.length > 0) {
                const [resPrac, resTeo, resProd, resVal] = await Promise.all([
                    client.from('practica').select('proposito, tipo, biblioteca_practica(proposito)').in('planificacion_semanal_id', semanaIds),
                    client.from('teoria').select('tipo, biblioteca_teoria(tipo)').in('planificacion_semanal_id', semanaIds),
                    client.from('produccion').select('nivel, biblioteca_produccion(nivel)').in('planificacion_semanal_id', semanaIds),
                    client.from('valoracion').select('categoria, biblioteca_valoracion(categoria)').in('planificacion_semanal_id', semanaIds),
                ]);
                
                (resPrac.data || []).forEach((p: any) => {
                    const val = p.biblioteca_practica?.proposito || p.proposito || p.tipo;
                    this._incrementCounter(practicaCounts, val, 'Práctica General');
                });
                (resTeo.data || []).forEach((t: any) => {
                    const val = t.biblioteca_teoria?.tipo || t.tipo;
                    this._incrementCounter(teoriaCounts, val, 'Teoría General');
                });
                (resProd.data || []).forEach((p: any) => {
                    const val = p.biblioteca_produccion?.nivel || p.nivel;
                    this._incrementCounter(produccionCounts, val, 'Producción General');
                });
                (resVal.data || []).forEach((v: any) => {
                    const val = v.biblioteca_valoracion?.categoria || v.categoria;
                    this._incrementCounter(valoracionCounts, val, 'Valoración General');
                });
            }

            // Convertir a data chart
            const mapToChartData = (map: Map<string, number>) => {
                const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
                return Array.from(map.entries())
                    .map(([name, value]) => ({
                        name,
                        value,
                        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0'
                    }))
                    .sort((a, b) => b.value - a.value);
            };

            return {
                data: {
                    totalApprovedPDCs: pdcIds.length,
                    totalObjectives,
                    bloomTaxonomy: mapToChartData(bloomCounts),
                    momentos: {
                        practica: mapToChartData(practicaCounts),
                        teoria: mapToChartData(teoriaCounts),
                        produccion: mapToChartData(produccionCounts),
                        valoracion: mapToChartData(valoracionCounts),
                    },
                    criterios: {
                        ser: mapToChartData(serCounts),
                        saber: mapToChartData(saberCounts),
                        hacer: mapToChartData(hacerCounts),
                    }
                },
                error: null,
                success: true
            };
        } catch (error: any) {
            console.error('Error in getPedagogicalStats:', error);
            return { data: null, error: error.message, success: false };
        }
    }
};
