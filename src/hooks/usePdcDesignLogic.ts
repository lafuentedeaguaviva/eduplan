'use client';

import { db } from '@/lib/database';
import { PdcService, PdcDesignService, PdcScheduleService } from '@/services/pdc.service';
import { PlanningService } from '@/services/planning.service';
import { AreasService } from '@/services/areas.service';
import { CatalogService } from '@/services/catalog.service';
import { UserContent, LearningObjective, WeekDesign, CatalogoVerbo, CatalogoComplemento } from '@/types';

/**
 * Hook: usePdcDesignLogic
 * 
 * Gestiona la lógica de diseño curricular del Wizard (Objetivos, Momentos, IA).
 */
export function usePdcDesignLogic(state: any, helpers: any) {
    const {
        catalogoVerbos, availableContents, catalogoComplementos,
        currentObjective, setCurrentObjective,
        setAiOptions, learningObjectives, 
        selectedAreas, currentAreaIndex, currentPdcId,
        setAvailableContents, setWeekContentsMap,
        setWeekDesignState, setWeekPlanningIds,
        setLearningObjectives,
        setPeriodsPerWeek, setMainAreaDetails,
        areasDesignState,
        editingObjectiveIndex, setEditingObjectiveIndex,
        originalObjectiveText, setOriginalObjectiveText
    } = state;

    const { showSuccess, showError } = helpers;

    const synthesizeObjective = () => {
        const selectedVerbs = catalogoVerbos
            .filter((v: CatalogoVerbo) => currentObjective.verboIds.map(Number).includes(Number(v.id)))
            .map((v: CatalogoVerbo) => v.verbo);

        const selectedContents = availableContents
            .filter((c: UserContent) => currentObjective.contentIds.map(Number).includes(Number(c.id)))
            .map((c: UserContent) => c.titulo || '');

        const complementText = currentObjective.complement ||
            (currentObjective.complementId ? catalogoComplementos.find((c: CatalogoComplemento) => Number(c.id) === Number(currentObjective.complementId))?.complemento : '');

        const verbsPart = selectedVerbs.length > 0 ? selectedVerbs.join(' y ') : '';
        const contentsPart = selectedContents.length > 0 ? `${verbsPart ? ' ' : ''}${selectedContents.join(', ')}` : '';
        const complementPart = complementText ? ` ${complementText}` : '';

        const fullDraft = (verbsPart + contentsPart + complementPart).trim();
        
        if (!fullDraft) {
            setCurrentObjective((prev: any) => ({ ...prev, draft: '' }));
            return;
        }

        const formattedDraft = fullDraft.charAt(0).toUpperCase() + fullDraft.slice(1);
        setCurrentObjective((prev: any) => ({ ...prev, draft: formattedDraft }));
    };

    const generateAIObjective = () => {
        const selectedVerbs = catalogoVerbos
            .filter((v: CatalogoVerbo) => currentObjective.verboIds.includes(v.id))
            .map((v: CatalogoVerbo) => v.verbo)
            .join(' y ');

        const selectedContentsArr = availableContents
            .filter((c: UserContent) => currentObjective.contentIds.includes(c.id))
            .map((c: UserContent) => c.titulo.toLowerCase());

        const selectedContents = selectedContentsArr.join(', ');
        const catalogComplement = catalogoComplementos.find((c: CatalogoComplemento) => c.id === currentObjective.complementId)?.complemento || '';
        const finalComplement = catalogComplement || currentObjective.complement;

        if (!selectedVerbs || selectedContentsArr.length === 0) return;

        const baseDraft = `${selectedVerbs} ${selectedContents} ${finalComplement}`.trim();
        const capitalized = baseDraft.charAt(0).toUpperCase() + baseDraft.slice(1);

        const options = [
            { id: 1, title: '🔥 OPCIÓN 1 (MÁS USADA)', description: `${capitalized} de manera integral para fortalecer el desarrollo de capacidades creativas...`, style: 'MÁS USADA' },
            { id: 2, title: '🚀 OPCIÓN 2 (RECOMENDADA)', description: `Desarrollar y ${baseDraft} mediante el uso de herramientas tecnológicas...`, style: 'RECOMENDADA' }
        ];

        setAiOptions(options);
        setCurrentObjective((prev: any) => ({ ...prev, draft: options[0].description + '.', isManual: false }));
    };

    const addStrategicObjective = async () => {
        if (!currentObjective.draft) return;

        const newObjective: LearningObjective = {
            text: currentObjective.draft,
            contentIds: currentObjective.contentIds
        };

        const isEditing = editingObjectiveIndex !== null;
        
        if (isEditing) {
            const updated = [...learningObjectives];
            updated[editingObjectiveIndex] = newObjective;
            setLearningObjectives(updated);
        } else {
            setLearningObjectives((prev: any) => [...prev, newObjective]);
        }

        // Reset Form
        setCurrentObjective({
            verboIds: [],
            contentIds: [],
            complementId: null,
            complement: '',
            draft: '',
            isManual: false
        });
        setEditingObjectiveIndex(null);
        setOriginalObjectiveText(null);

        if (currentPdcId && selectedAreas.length > 0) {
            try {
                const currentAreaId = selectedAreas[currentAreaIndex];
                const junctionRes = await PdcDesignService.getPdcAreaJunctionId(currentPdcId, currentAreaId);
                const pdcAreaTrabajoId = junctionRes.data;

                if (pdcAreaTrabajoId) {
                    if (isEditing && originalObjectiveText) {
                        await PdcDesignService.deleteStrategicObjective(pdcAreaTrabajoId, originalObjectiveText);
                    }
                    await PdcDesignService.addStrategicObjective(pdcAreaTrabajoId, newObjective);
                }
            } catch (error) {
                console.error('Design Logic Error [addStrategicObjective]:', error);
            }
        }
    };

    const loadObjectiveForEdit = (index: number) => {
        const obj = learningObjectives[index];
        if (!obj) return;

        // Restaurar selección de contenidos
        // Intentar detectar verbos (heurística por texto)
        const matchedVerbIds = catalogoVerbos
            .filter((v: CatalogoVerbo) => 
                obj.text.toLowerCase().includes(v.verbo.toLowerCase())
            )
            .map((v: CatalogoVerbo) => v.id);

        // Intentar detectar complementos
        const matchedComp = catalogoComplementos.find((c: CatalogoComplemento) => 
            obj.text.toLowerCase().includes(c.complemento.toLowerCase())
        );

        setCurrentObjective({
            verboIds: matchedVerbIds,
            contentIds: obj.contentIds,
            complementId: matchedComp?.id || null,
            complement: '',
            draft: obj.text,
            isManual: true
        });

        setEditingObjectiveIndex(index);
        setOriginalObjectiveText(obj.text);
        showSuccess('Modo Edición', 'Objetivo cargado para ajustes.');
    };


    const removeStrategicObjective = async (index: number) => {
        const objectiveToRemove = learningObjectives[index];
        if (!objectiveToRemove) return;

        setLearningObjectives((prev: any) => prev.filter((_: any, i: number) => i !== index));

        if (currentPdcId && selectedAreas.length > 0) {
            try {
                const currentAreaId = selectedAreas[currentAreaIndex];
                const junctionRes = await PdcDesignService.getPdcAreaJunctionId(currentPdcId, currentAreaId);
                const pdcAreaTrabajoId = junctionRes.data;

                if (pdcAreaTrabajoId) {
                    await PdcDesignService.deleteStrategicObjective(pdcAreaTrabajoId, objectiveToRemove.text);
                }
            } catch (error) {
                console.error('Design Logic Error [removeStrategicObjective]:', error);
            }
        }
    };

    const loadStep3Data = async (areaId: string, trimestre: number, mes: number) => {
        if (!areaId) return;

        try {
            const details = await AreasService.getAreaById(areaId);
            if (details.success && details.data) setMainAreaDetails(details.data);

            const currentYear = new Date().getFullYear();
            const resSchedule = await PdcScheduleService.getAreaSchedule(areaId, currentYear, trimestre);
            const planningHeaders = resSchedule.data || [];

            // 1. Cargar TODOS los contenidos del área (Mejora: Asegura disponibilidad en el diseño de objetivos)
            const { data: allContents } = await AreasService.getAreaContents(areaId);
            if (allContents) {
                setAvailableContents(allContents);
            }

            if (planningHeaders.length > 0) {
                // Filtrar solo las semanas que pertenecen al MES seleccionado
                const monthHeaders = planningHeaders.filter(h => h.mes === mes);
                
                const newWeekPlanningIds: Record<number, string> = {};
                monthHeaders.forEach(h => { newWeekPlanningIds[h.semana] = h.id; });
                setWeekPlanningIds({ ...newWeekPlanningIds });

                // Fallback: Asegurar que todos los contenidos referenciados en las semanas existan en allContents
                const currentAllContents = [...(allContents || [])];
                const allReferencedIds = monthHeaders.flatMap(h => 
                    (h.semana_contenido || []).map((sc: any) => String(sc.contenido_usuario_id))
                );
                
                const missingIds = [...new Set(allReferencedIds)].filter(id => 
                    !currentAllContents.some(c => String(c.id) === id)
                );

                if (missingIds.length > 0) {
                    console.log(`Paso 7: Cargando ${missingIds.length} contenidos faltantes por ID`);
                    const { data: missingData } = await AreasService.getContentsByIds(missingIds.map(Number));
                    if (missingData) currentAllContents.push(...missingData);
                }

                // 1. Población del Paso 6: IDs de contenido programados para el mes
                state.setScheduledMonthContentIds([...new Set(allReferencedIds)]);

                // 2. Población del Paso 7: Mapa de contenidos por semana
                const grouped: Record<number, UserContent[]> = {};
                monthHeaders.forEach((header: any) => {
                    const semanalContents = (header.semana_contenido || [])
                        .map((sc: any) => currentAllContents.find((c: any) => String(c.id) === String(sc.contenido_usuario_id)))
                        .filter((c): c is UserContent => !!c);
                    
                    grouped[header.semana] = semanalContents;
                });
                
                setWeekContentsMap(grouped);

                // 3. Inicializar estado de diseño por semana (si no existe)
                if (!areasDesignState[areaId] || Object.keys(areasDesignState[areaId].weekDesignState || {}).length === 0) {
                    const newWeekDesignState: Record<number, WeekDesign> = {};
                    await Promise.all(monthHeaders.map(async (header: any) => {
                        const detailsRes = await PlanningService.getDetailsByWeeklyPlanId(header.id);
                        newWeekDesignState[header.semana] = {
                            momentos: detailsRes.success && detailsRes.data ? {
                                practica: detailsRes.data.practica || [],
                                teoria: detailsRes.data.teoria || [],
                                produccion: detailsRes.data.produccion || [],
                                valoracion: detailsRes.data.valoracion || [],
                                adaptaciones: detailsRes.data.adaptaciones || [],
                                recursos: detailsRes.data.recursos || [],
                                fuentes: detailsRes.data.fuentes || [],
                            } : {
                                practica: [], teoria: [], produccion: [], valoracion: [],
                                adaptaciones: [], recursos: [], fuentes: []
                            },
                            momentos_json: detailsRes.data?.momentos_json || [],
                            recursos_json: detailsRes.data?.recursos_json || [],
                            fuentes_json: detailsRes.data?.fuentes_json || [],
                            adaptaciones_json: detailsRes.data?.adaptaciones_json || [],
                            adaptacion_especial: detailsRes.data?.adaptacion_especial || [],
                            consolidado: detailsRes.data?.consolidado || 0,
                            criterios: detailsRes.success && detailsRes.data?.criterios ? detailsRes.data.criterios : { ser: '', saber: '', hacer: '', decidir: '' }
                        };
                    }));
                    setWeekDesignState(newWeekDesignState);
                }
            }

            // RECUPERACIÓN DE DATOS PERSISTENTES (Objetivos y Carga Horaria)
            if (currentPdcId) {
                const junctionRes = await PdcDesignService.getPdcAreaJunctionId(currentPdcId, areaId);
                if (junctionRes.success && junctionRes.data) {
                    const pdcAreaId = junctionRes.data;
                    
                    // 2. Recuperar Objetivos Estratégicos (si el estado local está vacío)
                    const needsObjectivesFetch = !areasDesignState[areaId] || !areasDesignState[areaId].learningObjectives || areasDesignState[areaId].learningObjectives.length === 0;
                    if (needsObjectivesFetch) {
                        const savedObjectives = await PdcDesignService.getStrategicObjectives(pdcAreaId);
                        if (savedObjectives.success && savedObjectives.data && savedObjectives.data.length > 0) {
                            console.log(`Cargando ${savedObjectives.data.length} objetivos desde DB para área ${areaId}`);
                            setLearningObjectives(savedObjectives.data);
                        }
                    }

                    // 3. Recuperar Carga Horaria (Siempre, si no tenemos un valor mayor a 0 en el estado actual)
                    if (state.periodsPerWeek === 0) {
                        const areaDataRes = await PdcDesignService.getPeriods(pdcAreaId);
                        if (areaDataRes.success && areaDataRes.data) {
                            console.log('Cargando carga horaria desde DB:', areaDataRes.data);
                            setPeriodsPerWeek(areaDataRes.data);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Design Logic Error [loadStep3Data]:', error);
        }
    };

    const savePeriods = async () => {
        if (!currentPdcId || selectedAreas.length === 0) return;
        try {
            const currentAreaId = selectedAreas[currentAreaIndex];
            const junctionRes = await PdcDesignService.getPdcAreaJunctionId(currentPdcId, currentAreaId);
            const pdcAreaTrabajoId = junctionRes.data;
            
            if (pdcAreaTrabajoId) {
                const updateRes = await PdcDesignService.updatePeriods(pdcAreaTrabajoId, state.periodsPerWeek);
                if (updateRes.success) {
                    showSuccess('Guardado', 'Carga horaria guardada exitosamente.');
                }
            }
        } catch (error: any) {
            console.error('Save Periods Error:', error);
            showError('Error', 'No se pudo guardar la carga horaria.');
        }
    };

    return {
        synthesizeObjective,
        generateAIObjective,
        addStrategicObjective,
        removeStrategicObjective,
        loadStep3Data,
        savePeriods,
        loadObjectiveForEdit
    };
}
