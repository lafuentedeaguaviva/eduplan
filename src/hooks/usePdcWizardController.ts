'use client';

import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AreasService } from '@/services/areas.service';
import { AuthService } from '@/services/auth.service';
import { PdcService, PdcScheduleService, PdcDesignService } from '@/services/pdc.service';
import { PlanningService } from '@/services/planning.service';
import { CatalogService } from '@/services/catalog.service';
import { useFeedback } from './useFeedback';
import { usePdcWizardState } from './usePdcWizardState';
import { usePdcWizardNavigation } from './usePdcWizardNavigation';
import { usePdcDesignLogic } from './usePdcDesignLogic';
import { CatalogoVerbo, CatalogoComplemento, AreaConocimiento, AreaTrabajo } from '@/types';

export const PDC_TYPES = [
    { id: 1, name: 'Inicial', icon: 'child_care', color: 'rose-600', bgColor: 'bg-rose-50', textColor: 'text-rose-600', borderColor: 'border-rose-100', shadowColor: 'shadow-rose-500/10' },
    { id: 2, name: 'Primaria', icon: 'school', color: 'amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-500', borderColor: 'border-amber-100', shadowColor: 'shadow-amber-500/10' },
    { id: 3, name: 'Secundaria', icon: 'menu_book', color: 'indigo-600', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600', borderColor: 'border-indigo-100', shadowColor: 'shadow-indigo-500/10' },
    { id: 4, name: 'Multigrado', icon: 'group_work', color: 'emerald-600', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600', borderColor: 'border-emerald-100', shadowColor: 'shadow-emerald-500/10' },
];

import { getMesInTrimester } from '@/lib/utils';

export function usePdcWizardController() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { feedback, showError, showSuccess, showConfirm, hideFeedback } = useFeedback();
    
    // Refs to prevent double-resuming
    const hasResumed = useRef(false);
    const state = usePdcWizardState();

    // 2. Helpers internal to the Facade
    const saveCurrentAreaState = useCallback(() => {
        const areaId = state.selectedAreas[state.currentAreaIndex];
        if (!areaId) return;

        state.setAreasDesignState(prev => ({
            ...prev,
            [areaId]: {
                learningObjectives: [...state.learningObjectives],
                generatorMode: state.generatorMode,
                currentObjective: { ...state.currentObjective },
                manualObjective: { ...state.manualObjective },
                weekContentsMap: { ...state.weekContentsMap },
                availableContents: [...state.availableContents],
                weekDesignState: { ...state.weekDesignState },
                weekPlanningIds: { ...state.weekPlanningIds },
                periodo_semanal: state.periodsPerWeek
            }
        }));
    }, [state]);

    // 3. Logic Hooks
    const designLogic = usePdcDesignLogic(state, { showSuccess, showError });
    
    const coveredContentIds = useMemo(() => 
        Array.from(new Set(state.learningObjectives.flatMap(obj => obj.contentIds.map(id => String(id))))),
    [state.learningObjectives]);
    
    const isContentCovered = useCallback((id: string | number): boolean => {
        const strId = String(id);
        if (coveredContentIds.includes(strId)) return true;
        
        // Buscar el contenido en el repertorio
        const content = state.availableContents.find((c: any) => String(c.id) === strId);
        if (!content) return false;

        // Caso 1: Mi padre está cubierto (yo estoy cubierto por herencia)
        if (content.padre_id && isContentCovered(String(content.padre_id))) return true;

        // Caso 2: Alguno de mis hijos está cubierto (yo estoy "representado" en el diseño)
        const hasCoveredChild = state.availableContents.some((child: any) => 
            String(child.padre_id) === strId && 
            coveredContentIds.includes(String(child.id))
        );
        
        return hasCoveredChild;
    }, [coveredContentIds, state.availableContents]);

    const isStep6Complete = useMemo(() => 
        state.scheduledMonthContentIds.length === 0 || 
        state.scheduledMonthContentIds.every(id => isContentCovered(id)),
    [state.scheduledMonthContentIds, isContentCovered]);
    
    const pendingContentsCount = useMemo(() => 
        state.scheduledMonthContentIds.filter(id => {
            const content = state.availableContents.find(c => String(c.id) === String(id));
            return content?.padre_id === null && !isContentCovered(id);
        }).length,
    [state.scheduledMonthContentIds, state.availableContents, isContentCovered]);

    // Contenidos filtrados para el Paso 6 (Diseño de Objetivos).
    const filteredContentsForDesign = useMemo(() => 
        state.availableContents.filter(c => {
            const isScheduled = state.scheduledMonthContentIds.includes(String(c.id));
            if (isScheduled) return true;
            // También incluir los temas padres cuyos hijos están programados (para mantener jerarquía visual)
            const hasScheduledChild = state.availableContents.some(child =>
                String(child.padre_id) === String(c.id) &&
                state.scheduledMonthContentIds.includes(String(child.id))
            );
            return hasScheduledChild;
        }),
    [state.availableContents, state.scheduledMonthContentIds]);

    const navigationHandlers = usePdcWizardNavigation(state, {
        saveCurrentAreaState,
        loadStep3Data: designLogic.loadStep3Data,
        setMainAreaDetails: state.setMainAreaDetails,
        showSuccess,
        showError,
        showConfirm,
        isStep6Complete,
        pendingContentsCount
    });

    // --- Data Fetching logic kept in Facade for Lifecycle management ---

    const loadInitialData = async () => {
        try {
            const { data: { session } } = await AuthService.getSession();
            if (session?.user) {
                const { data: profile } = await PdcService.getUserProfile(session.user.id);
                if (profile) {
                    const fullName = `${profile.nombres || ''} ${profile.apellidos || ''}`.trim();
                    state.setUserProfile({
                        nombre_completo: fullName || profile.email.split('@')[0] || 'Docente'
                    });
                }

                const results = await AreasService.getAreas(session.user.id);
                if (results.success && results.data) state.setAreas(results.data);

                const pdcs = await PdcService.getPDCs(session.user.id);
                if (pdcs.success && pdcs.data) state.setRecentPdcs(pdcs.data);

                const [verbsRes, compsRes] = await Promise.all([
                    CatalogService.getVerbos(),
                    CatalogService.getComplementos()
                ]);

                if (verbsRes.success && verbsRes.data) state.setCatalogoVerbos(verbsRes.data);
                if (compsRes.success && compsRes.data) state.setCatalogoComplementos(compsRes.data);
            }
        } catch (error) {
            console.error('Facade Error [loadInitialData]:', error);
        } finally {
            state.setLoading(false);
        }
    };

    const loadGlobalSchedule = async () => {
        if (!state.selectedTrimestre || !state.selectedMes) return;
        try {
            const gestion = new Date().getFullYear();
            const { data, success } = await PdcScheduleService.getGlobalSchedule(gestion, state.selectedTrimestre);
            const relativeMes = getMesInTrimester(state.selectedMes);
            const filtered = (data || []).filter(w => w.mes === relativeMes);

            if (success && filtered.length > 0) {
                state.setPdcWeeks(filtered.map((w: any) => ({
                    ...w,
                    fecha_inicio: w.fecha_inicio_trimestre || '',
                    fecha_fin: w.fecha_fin_trimestre || ''
                })));

                const starts = filtered.filter(w => w.fecha_inicio_trimestre).map(w => w.fecha_inicio_trimestre!);
                const ends = filtered.filter(w => w.fecha_fin_trimestre).map(w => w.fecha_fin_trimestre!);
                
                if (starts.length > 0 && ends.length > 0) {
                    state.setPdcDates({
                        inicio: [...starts].sort()[0],
                        fin: [...ends].sort().reverse()[0]
                    });
                }
            }
        } catch (error) {
            console.error('Facade Error [loadGlobalSchedule]:', error);
        }
    };

    // --- Lifecycle Effects ---

    useEffect(() => { loadInitialData(); }, []);

    useEffect(() => {
        if (state.selectedType && state.step === 1 && !state.saving) {
            state.setSelectedAreas([]);
        }
    }, [state.selectedType, state.step, state.saving]);

    useEffect(() => {
        if (state.step === 2 && state.selectedTrimestre && state.selectedMes) {
            loadGlobalSchedule();
        }
    }, [state.step, state.selectedTrimestre, state.selectedMes]);
    
    // --- Auto-sync Holistic Objective from Level ---
    useEffect(() => {
        if (state.mainAreaDetails?.area_conocimiento?.grado?.nivel?.objetivo_holistico) {
            const objective = state.mainAreaDetails.area_conocimiento.grado.nivel.objetivo_holistico;
            if (!state.objetivoNivel) {
                console.log('Auto-filling Holistic Objective from Level hierarchy');
                state.setObjetivoNivel(objective);
            }
        }
    }, [state.mainAreaDetails]);

    useEffect(() => {
        console.log(`[DEBUG_EFFECT] useEffect triggered. step: ${state.step}, selectedAreas: ${state.selectedAreas.length}, trimestre: ${state.selectedTrimestre}, mes: ${state.selectedMes}, currentPdcId: ${state.currentPdcId}`);
        if (state.step >= 4 && state.selectedAreas.length > 0 && state.selectedTrimestre && state.selectedMes) {
            const areaId = state.selectedAreas[state.currentAreaIndex];
            if (areaId) {
                // Restore state if cached
                if (state.areasDesignState[areaId]) {
                    const cached = state.areasDesignState[areaId];
                    state.setLearningObjectives(cached.learningObjectives || []);
                    state.setGeneratorMode(cached.generatorMode || 'auto');
                    state.setCurrentObjective(cached.currentObjective || { verboIds: [], contentIds: [], complementId: null, complement: '', draft: '', isManual: false });
                    state.setManualObjective(cached.manualObjective || { quiero: '', paraQue: '', medire: '' });
                    state.setWeekContentsMap(cached.weekContentsMap || {});
                    state.setAvailableContents(cached.availableContents || []);
                    state.setWeekDesignState(cached.weekDesignState || {});
                    state.setWeekPlanningIds(cached.weekPlanningIds || {});
                    state.setPeriodsPerWeek(cached.periodo_semanal || 0);
                } else {
                    // Resetear estados al cambiar a un área que no tiene caché todavía
                    state.setLearningObjectives([]);
                    state.setGeneratorMode('auto');
                    state.setCurrentObjective({ verboIds: [], contentIds: [], complementId: null, complement: '', draft: '', isManual: false });
                    state.setManualObjective({ quiero: '', paraQue: '', medire: '' });
                    state.setWeekContentsMap({});
                    state.setAvailableContents([]); // Limpiar mientras carga la nueva área
                    state.setWeekDesignState({});
                    state.setWeekPlanningIds({});
                    state.setPeriodsPerWeek(0);
                }
                designLogic.loadStep3Data(areaId, state.selectedTrimestre, state.selectedMes, state.currentPdcId || undefined);
            }
        }
    }, [state.step, state.currentAreaIndex, state.selectedAreas, state.selectedTrimestre, state.selectedMes, state.currentPdcId]);

    useEffect(() => {
        if (!state.currentObjective.isManual) {
            designLogic.synthesizeObjective();
        }
    }, [state.currentObjective.verboIds, state.currentObjective.contentIds, state.currentObjective.complementId, state.currentObjective.complement, state.catalogoVerbos, state.availableContents, state.catalogoComplementos]);
    
    // --- URL Auto-resume Effect ---
    useEffect(() => {
        const pdcId = searchParams.get('id');
        if (pdcId && !state.loading && state.recentPdcs.length > 0 && !hasResumed.current) {
            const pdc = state.recentPdcs.find(p => p.id === pdcId);
            if (pdc) {
                console.log('Auto-resuming PDC from URL:', pdcId);
                hasResumed.current = true;
                const targetStep = searchParams.get('step');
                resumePdc(pdc, targetStep ? parseInt(targetStep) : undefined);
            }
        }
    }, [searchParams, state.loading, state.recentPdcs]);

    // --- Business Actions ---

    const toggleAreaSelection = (id: string) => {
        state.setSelectedAreas(prev => {
            let next: string[];
            if (state.selectedType === 3) {
                next = prev.includes(id) ? [] : [id];
            } else {
                next = prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id];
            }
            // Ensure they are sorted in the same order as they appear in the main `areas` array
            return next.sort((a, b) => {
                const idxA = state.areas.findIndex(area => area.id === a);
                const idxB = state.areas.findIndex(area => area.id === b);
                return idxA - idxB;
            });
        });
    };

    const addWeek = () => {
        const lastWeek = state.pdcWeeks.length > 0 ? state.pdcWeeks[state.pdcWeeks.length - 1] : null;
        const newWeekNumber = (lastWeek?.semana || 0) + 1;
        state.setPdcWeeks(prev => [...prev, {
            id: `temp-${Date.now()}`,
            semana: newWeekNumber,
            mes: state.selectedMes ?? undefined,
            trimestre: state.selectedTrimestre ?? undefined,
            gestion: new Date().getFullYear(),
            fecha_inicio: '',
            fecha_fin: ''
        }]);
    };

    const removeLastWeek = () => {
        if (state.pdcWeeks.length > 1) {
            state.setPdcWeeks(prev => prev.slice(0, -1));
        }
    };

    const toggleNivelFilter = (nivel: string) => {
        state.setVerbFilters((prev: any) => ({
            ...prev,
            niveles: prev.niveles.includes(nivel)
                ? prev.niveles.filter((n: string) => n !== nivel)
                : [...prev.niveles, nivel]
        }));
    };

    const resumePdc = async (pdc: any, targetStep?: number) => {
        state.setSaving(true);
        try {
            state.setCurrentPdcId(pdc.id);
            state.setSelectedType(pdc.tipo_pdc_id);
            state.setSelectedTrimestre(pdc.trimestre || null);
            state.setSelectedMes(pdc.mes || null);
            state.setPdcDates({ inicio: pdc.fecha_inicio || '', fin: pdc.fecha_fin || '' });
            
            // Cargar preferencias de IA si existen
            if (pdc.escritura_tipo_ia) state.setSelectedTone(pdc.escritura_tipo_ia);
            if (pdc.correccion_profundidad_ia) state.setCorrectionDepth(pdc.correccion_profundidad_ia);
            if (pdc.evaluacion_tipo_ia) state.setSelectedEvaluationType(pdc.evaluacion_tipo_ia);
            if (pdc.producto_final) state.setFinalProductState(pdc.producto_final);

            if (pdc.areas_trabajo && pdc.areas_trabajo.length > 0) {
                const areaIds = pdc.areas_trabajo.map((a: any) => a.id);
                // Ensure they are sorted
                areaIds.sort((a: string, b: string) => {
                    const idxA = state.areas.findIndex(area => area.id === a);
                    const idxB = state.areas.findIndex(area => area.id === b);
                    return idxA - idxB;
                });
                state.setSelectedAreas(areaIds);
                const details = await AreasService.getAreaById(areaIds[0]);
                if (details.success && details.data) state.setMainAreaDetails(details.data);
                await designLogic.loadStep3Data(areaIds[0], pdc.trimestre || 1, pdc.mes || 1, pdc.id);
            }
            state.setStep(targetStep || 4);
        } catch (error) {
            alert('No se pudo reanudar el PDC.');
        } finally {
            state.setSaving(false);
        }
    };

    const sortedVerbos = [...state.catalogoVerbos].filter((v: any) => {
        if (state.verbFilters.niveles.length > 0) {
            if (!v.niveles_educativos) return false;
            if (!state.verbFilters.niveles.some((n: string) => v.niveles_educativos?.includes(n))) return false;
        }
        if (state.verbFilters.dominio && v.dominio !== state.verbFilters.dominio) return false;
        if (state.verbFilters.profundidad && v.nivel_profundidad !== state.verbFilters.profundidad) return false;
        if (state.verbFilters.detalle_tipo && v.detalle_tipo !== state.verbFilters.detalle_tipo) return false;
        return true;
    }).sort((a, b) => a.verbo.localeCompare(b.verbo));

    const filteredAreas = state.areas.filter((area: AreaTrabajo) => {
        if (!state.selectedType) return true;
        const nivelNombre = (area.area_conocimiento as AreaConocimiento).grado?.nivel?.nombre?.toLowerCase() || '';
        if (state.selectedType === 1) return nivelNombre.includes('inicial');
        if (state.selectedType === 2) return nivelNombre.includes('primaria');
        if (state.selectedType === 3) return nivelNombre.includes('secundaria');
        return true;
    });

    const complementCategories = Array.from(
        new Set(
            state.catalogoComplementos
                .map((c: any) => c.categoria)
                .filter(Boolean)
        )
    ).sort() as string[];

    const complementSubCategories = Array.from(
        new Set(
            state.catalogoComplementos
                .filter((c: any) => !state.complementFilters.categoria || c.categoria === state.complementFilters.categoria)
                .map((c: any) => c.subcategoria)
                .filter(Boolean)
        )
    ).sort() as string[];

    const allComplementLevels = Array.from(
        new Set(
            state.catalogoComplementos
                .flatMap((c: any) => c.niveles_sugeridos || [])
                .filter(Boolean)
        )
    ).sort() as string[];

    const filteredComplementos = state.catalogoComplementos.filter((c: any) => {
        // Búsqueda
        if (state.complementSearch && !c.complemento.toLowerCase().includes(state.complementSearch.toLowerCase())) return false;
        
        // Filtro de categoría vieja (mantenido por compatibilidad si es necesario)
        if (state.selectedCompCategory && c.categoria !== state.selectedCompCategory) return false;

        // Nuevos filtros
        if (state.complementFilters.categoria && c.categoria !== state.complementFilters.categoria) return false;
        if (state.complementFilters.subcategoria && c.subcategoria !== state.complementFilters.subcategoria) return false;
        
        if (state.complementFilters.niveles.length > 0) {
            if (!c.niveles_sugeridos) return false;
            if (!state.complementFilters.niveles.some((n: string) => c.niveles_sugeridos?.includes(n))) return false;
        }

        return true;
    }).sort((a, b) => a.complemento.localeCompare(b.complemento));

    // Log para depuración interna (visible en consola del navegador)
    if (state.step === 6) {
        console.log('Validación Paso 6:', {
            objetivoIds: state.scheduledMonthContentIds,
            cubiertosIds: coveredContentIds,
            estaCompleto: isStep6Complete,
            pendientes: pendingContentsCount
        });
    }

    const getStepName = () => {
        const steps: Record<number, string> = {
            1: 'Modalidad y Áreas', 2: 'Cronograma y Fechas', 3: 'Confirmación y Nombre',
            4: 'Datos Referenciales', 5: 'Objetivo Holístico de Nivel', 6: 'Objetivos de Aprendizaje',
            7: 'Semanas y Contenidos', 8: 'Momentos del proceso formativo', 9: 'Criterios de Evaluación',
            10: 'Carga Horaria Semanal', 
            11: 'Optimización Pedagógica (IA)', 
            12: 'Configuración de Evaluación IA',
        };
        return steps[state.step] || 'Asistente';
    };

    // --- Return unified API (backward compatibility) ---

    return {
        ...feedback,
        ...state,
        ...navigationHandlers,
        ...designLogic,
        pdcTypes: PDC_TYPES,
        filteredAreas,
        sortedVerbos,
        complementCategories,
        complementSubCategories,
        allComplementLevels,
        filteredComplementos,
        filteredContentsForDesign,
        isStep6Complete,
        isContentCovered,
        pendingContentsCount,
        feedback,
        showError, showSuccess, showConfirm, hideFeedback,
        toggleAreaSelection,
        addWeek,
        removeLastWeek,
        toggleNivelFilter,
        toggleComplementNivelFilter: (nivel: string) => {
            state.setComplementFilters((prev: any) => ({
                ...prev,
                niveles: prev.niveles.includes(nivel)
                    ? prev.niveles.filter((n: string) => n !== nivel)
                    : [...prev.niveles, nivel]
            }));
        },
        resumePdc,
        getStepName,
        getTotalSteps: () => 12,
        handlePdcDatesChange: (field: 'inicio' | 'fin', value: string) => state.setPdcDates(prev => ({ ...prev, [field]: value })),
        updatePlanningHeader: (weekId: string, data: Record<string, any>) => PlanningService.updateHeader(weekId, data),
        improveManualWithAI: async () => {
            const text = `Mejorando con IA: Desarrollar ${state.manualObjective.quiero} con el fin de que ${state.manualObjective.paraQue} a través de ${state.manualObjective.medire}.`;
            state.setAiOptions([{ id: 1, title: 'IA MEJORADO', description: text, style: 'RECOMENDADA' }]);
        }
    };
}
