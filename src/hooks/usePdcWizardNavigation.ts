'use client';

import { useRouter } from 'next/navigation';
import { PdcService, PdcDesignService } from '@/services/pdc.service';
import { PdcReportService } from '@/services/pdc-report.service';
import { PdcRevisionesService } from '@/services/pdc-revisiones.service';
import { AreasService } from '@/services/areas.service';
import { db } from '@/lib/database';
import { PlanningService } from '@/services/planning.service';
import { EvaluacionService } from '@/services/evaluacion.service';
import { PDCMaster } from '@/types';

/**
 * Hook: usePdcWizardNavigation
 * 
 * Centraliza la lógica de navegación entre pasos y la persistencia intermedia.
 */
export function usePdcWizardNavigation(state: any, helpers: any) {
    const router = useRouter();

    const {
        step, setStep,
        saving, setSaving,
        currentPdcId, setCurrentPdcId,
        pdcName, setPdcName,
        currentAreaIndex, setCurrentAreaIndex,
        selectedType,
        selectedAreas,
        selectedTrimestre,
        selectedMes,
        pdcDates,
        recentPdcs,
        areas,
        learningObjectives,
        areasDesignState,
        weekPlanningIds,
        setWeekDesignState,
        pdcWeeks
    } = state;

    const {
        saveCurrentAreaState,
        loadStep3Data,
        setMainAreaDetails,
        showSuccess,
        showError,
        showConfirm,
        isStep6Complete,
        pendingContentsCount
    } = helpers;

    const handleNext = async () => {
        if (step === 1) {
            if (selectedType && selectedAreas.length > 0) setStep(2);
        } else if (step === 2) {
            if (selectedTrimestre && selectedMes) {
                const currentYear = new Date().getFullYear();

                // Validación de duplicados
                let duplicatedAreaName = null;
                for (const areaId of selectedAreas) {
                    const isDuplicated = recentPdcs.some((pdc: PDCMaster) =>
                        pdc.id !== currentPdcId &&
                        pdc.gestion === currentYear &&
                        pdc.trimestre === selectedTrimestre &&
                        pdc.mes === selectedMes &&
                        pdc.areas_trabajo?.some(a => a.id === areaId)
                    );

                    if (isDuplicated) {
                        const areaData = areas.find((a: any) => a.id === areaId);
                        duplicatedAreaName = areaData?.area_conocimiento?.nombre || 'Un área seleccionada';
                        break;
                    }
                }

                if (duplicatedAreaName) {
                    showError('PDC Duplicado', `El área "${duplicatedAreaName}" ya tiene un PDC planificado para el Trimestre ${selectedTrimestre}, Mes ${selectedMes}. Elige otro mes o trimestre.`);
                    return;
                }

                // Generar nombre automático
                const allAreaNames = selectedAreas
                    .map((areaId: string) => areas.find((a: any) => a.id === areaId)?.area_conocimiento?.nombre)
                    .filter(Boolean)
                    .join(' / ') || 'PDC';

                const selectedGrades = Array.from(new Set(selectedAreas
                    .map((areaId: string) => areas.find((a: any) => a.id === areaId)?.area_conocimiento?.grado?.nombre)
                    .filter(Boolean)
                )) as string[];

                const selectedNiveles = Array.from(new Set(selectedAreas
                    .map((areaId: string) => areas.find((a: any) => a.id === areaId)?.area_conocimiento?.grado?.nivel?.nombre)
                    .filter(Boolean)
                )) as string[];

                const gradesStr = selectedGrades.length > 0 ? ` - GRADO ${selectedGrades.join(', ').toUpperCase()}` : '';
                const nivelesStr = selectedNiveles.length > 0 ? ` - NIVEL ${selectedNiveles.join(', ').toUpperCase()}` : '';

                const generatedName = `PDC ${allAreaNames.toUpperCase()}${gradesStr}${nivelesStr} - MES ${selectedMes} - TRIM ${selectedTrimestre} - ${currentYear}`;
                if (!pdcName) setPdcName(generatedName);

                setStep(3);
            }
        } else if (step === 3) {
            setSaving(true);
            try {
                const { data: userRes } = await db.auth.getUser();
                if (!userRes.user) throw new Error('No auth user');

                let pdcId = currentPdcId;
                const currentYear = new Date().getFullYear();
                let directorId = state.mainAreaDetails?.director_id;

                // Si no tenemos detalles del área principal aún, intentamos cargarlos del primer área seleccionada
                if (!directorId && selectedAreas.length > 0) {
                    const details = await AreasService.getAreaById(selectedAreas[0]);
                    if (details.success && details.data) {
                        setMainAreaDetails(details.data);
                        directorId = details.data.director_id;
                    }
                }

                const pdcData: Partial<PDCMaster> = {
                    docente_id: userRes.user.id,
                    tipo_pdc_id: selectedType || 2,
                    gestion: currentYear,
                    trimestre: selectedTrimestre || 1,
                    mes: selectedMes || 1,
                    fecha_inicio: pdcDates.inicio,
                    fecha_fin: pdcDates.fin,
                    estado: 'Pendiente',
                    nombre_pdc: pdcName || 'Nuevo PDC',
                    director_id: directorId || null
                };

                if (!pdcId) {
                    const result = await PdcService.createPdcMaster(pdcData);
                    if (result.error) throw result.error;
                    pdcId = result.data?.id || null;
                    if (!pdcId) throw new Error('No se recibió ID del PDC creado');
                    setCurrentPdcId(pdcId);
                } else {
                    const result = await PdcService.updatePdcMaster(pdcId, pdcData);
                    if (result.error) throw result.error;
                }

                if (pdcId) {
                    const result = await PdcService.associateAreasToPdc(pdcId, selectedAreas, false, pdcWeeks);
                    if (result.error) throw result.error;

                    const details = await AreasService.getAreaById(selectedAreas[0]);
                    setMainAreaDetails(details.data);
                    setStep(4);
                }
            } catch (error: any) {
                console.error('Persistence Error [Step 3]:', error);
                alert(`Error: ${error.message || 'No se pudo crear el PDC.'}`);
            } finally {
                setSaving(false);
            }
        } else if (step === 6) {
            if (state.learningObjectives.length === 0) {
                showError('Sin Objetivos', 'Debe crear al menos un objetivo de aprendizaje asociado a sus contenidos.');
                return;
            }
            if (!isStep6Complete) {
                showError('Cobertura insuficiente', 'Aún faltan contenidos del mes por asociar a un objetivo de aprendizaje en el área actual.');
                return;
            }

            saveCurrentAreaState();
            setStep(7);
        } else if (step === 10) {
            setSaving(true);
            try {
                saveCurrentAreaState();

                // Consolidar objetivos para el área actual
                const currentAreaId = selectedAreas[currentAreaIndex];
                const currentJunctionRes = await PdcService.getPdcAreaJunctionId(currentPdcId!, currentAreaId);
                if (currentJunctionRes.data) {
                    await PdcDesignService.consolidateStrategicObjectives(currentJunctionRes.data);
                }

                if (currentAreaIndex < selectedAreas.length - 1) {
                    // Mover a la siguiente área y volver al paso 6
                    setCurrentAreaIndex(currentAreaIndex + 1);
                    setStep(6);
                    showSuccess('Área completada', 'Continuemos con el diseño de la siguiente área.');
                    setSaving(false);
                    return;
                }

                // Si es la última área, validar que TODAS las áreas anteriores también estén completas
                // (por si el usuario navegó por pestañas saltándose validaciones)
                for (let i = 0; i < selectedAreas.length; i++) {
                    const areaId = selectedAreas[i];
                    const cache = state.areasDesignState[areaId];
                    if (!cache || cache.isStep6Complete === false) {
                        showError('Área incompleta', `Falta completar la configuración para el área ${i + 1}. Volviendo a ese paso.`);
                        setCurrentAreaIndex(i);
                        setStep(6);
                        setSaving(false);
                        return;
                    }
                    
                    const cachedDesignState = cache.weekDesignState || {};
                    const cachedPlanningIds = cache.weekPlanningIds || {};
                    for (const weekNum of Object.keys(cachedPlanningIds)) {
                        const weekDesign = cachedDesignState[Number(weekNum)];
                        if (weekDesign && weekDesign.consolidado !== 1) {
                            showError('Momentos sin consolidar', `Falta consolidar momentos en la semana ${weekNum} del área ${i + 1}.`);
                            setCurrentAreaIndex(i);
                            setStep(8);
                            setSaving(false);
                            return;
                        }
                    }
                }

                // Si todas las áreas pasaron la validación, consolidar objetivos globalmente por si acaso
                for (const areaId of selectedAreas) {
                    if (areaId !== currentAreaId) {
                        const junctionRes = await PdcService.getPdcAreaJunctionId(currentPdcId!, areaId);
                        if (junctionRes.data) {
                            await PdcDesignService.consolidateStrategicObjectives(junctionRes.data);
                        }
                    }
                }
                
                // Habilitar IA (Paso 11/12) globalmente
                try {
                    await PdcService.updatePdcMaster(currentPdcId!, { ia_habilitado: 1 });
                } catch (e) {
                    console.warn('No se pudo actualizar ia_habilitado. ¿Falta la migración?', e);
                }
                
                setStep(11);
                setCurrentAreaIndex(0);
            } catch (error: any) {
                console.error('Error in step 10:', error);
                showError('Error', 'No se pudo guardar o avanzar.');
            } finally {
                setSaving(false);
            }
        } else if (step === 11) {
            saveCurrentAreaState();
            setStep(12);
        } else if (step === 12) {
            setSaving(true);
            try {
                saveCurrentAreaState();
                const reportData = await PdcReportService.getFullReportData(currentPdcId!, 'original', true);

                if (reportData) {
                    const { data: userRes } = await db.auth.getUser();
                    if (userRes.user) {
                        const existingRevision = await PdcRevisionesService.getRevisionByPdcId(currentPdcId!);
                        const performSubmit = async (isUpdate = false) => {
                            setSaving(true);
                            try {
                                if (isUpdate) {
                                    await PdcRevisionesService.updateSnapshotByPdcId(currentPdcId!, reportData, false);
                                    showSuccess('PDC Finalizado', 'Tu planificación ha sido guardada en la Bandeja de Salida.');
                                } else {
                                    await PdcRevisionesService.submitForReview(
                                        currentPdcId!,
                                        userRes.user!.id,
                                        reportData.areas || 'Varias Áreas',
                                        reportData.grados || '',
                                        reportData.niveles || '',
                                        reportData,
                                        false
                                    );
                                    showSuccess('PDC Finalizado', 'Tu planificación ha sido guardada en la Bandeja de Salida.');
                                }
                                router.push('/dashboard/pdcs');
                            } catch (err: any) {
                                showError('Error al guardar', err.message);
                            } finally {
                                setSaving(false);
                            }
                        };

                        if (existingRevision) {
                            setSaving(false);
                            showConfirm({
                                title: 'Reemplazar Archivo',
                                description: 'Ya existe una versión guardada de este PDC en revisión. ¿Deseas reemplazarla con los datos actuales del formulario?',
                                onConfirm: () => performSubmit(true),
                                onCancel: () => { /* Cancelado */ },
                                confirmText: 'Reemplazar y Finalizar',
                                cancelText: 'Cancelar'
                            });
                            return;
                        } else {
                            await performSubmit(false);
                        }
                    }
                } else {
                    router.push('/dashboard/pdcs');
                }
            } catch (error: any) {
                console.error('Finalization Error [Step 12]:', error);
                showError('Error al finalizar', error.message || 'Error desconocido');
            } finally {
                setSaving(false);
            }
        } else if (step === 8) {
            setSaving(true);
            try {
                const areaId = selectedAreas[currentAreaIndex];
                const areaData = state.areas?.find((a: any) => a.id === areaId);
                const areaName = areaData?.area_conocimiento?.nombre || 'esta Área';

                // Validación estricta: Solo permitir avanzar si TODAS las semanas están consolidadas
                const designState = state.weekDesignState || {};

                for (const weekNum of Object.keys(state.weekPlanningIds || {})) {
                    const weekDesign = designState[Number(weekNum)];
                    if (weekDesign && weekDesign.consolidado !== 1) {
                        showError('Consolidación Pendiente', `Falta consolidar momentos en la Semana ${weekNum} para ${areaName}`);
                        setSaving(false);
                        return;
                    }
                }

                for (const [weekNum, weekId] of Object.entries(weekPlanningIds || {})) {
                    const weekDesign = designState[Number(weekNum)];
                    if (weekDesign && weekId) {
                        // 1. Limpieza de Momentos (Práctica, Teoría, Producción, Valoración)
                        const rawMomentos = weekDesign.momentos_json || [];
                        const cleanedMomentos = rawMomentos.map((m: any) => {
                            const type = m.type?.toLowerCase();
                            if (type === 'practica') {
                                return {
                                    type: 'practica',
                                    id: m.id_practica,
                                    nombre_practica: m.nombre_practica,
                                    redactado: m.redactado,
                                    preguntas: m.preguntas,
                                    tipo: m.tipo
                                };
                            }
                            if (type === 'teoria') {
                                return {
                                    type: 'teoria',
                                    id: m.id_teoria,
                                    nombre_estrategia_teorica: m.nombre_estrategia_teorica,
                                    redactado: m.redactado,
                                    tipo: m.tipo
                                };
                            }
                            if (type === 'produccion') {
                                return {
                                    type: 'produccion',
                                    id: m.id_produccion,
                                    nombre_produccion: m.nombre_produccion,
                                    redactado: m.redactado,
                                    instrumento: m.instrumento,
                                    nivel: m.nivel,
                                    subnivel: m.subnivel
                                };
                            }
                            if (type === 'valoracion') {
                                return {
                                    type: 'valoracion',
                                    id: m.id_valoracion,
                                    categoria: m.categoria,
                                    subcategoria: m.subcategoria,
                                    redactado: m.redactado,
                                    preguntas: m.preguntas,
                                    instrumento: m.instrumento
                                };
                            }
                            return m;
                        });

                        // 2. Limpieza de Recursos y Fuentes
                        const cleanedRecursos = (weekDesign.momentos?.recursos || []).map((r: any) => ({
                            id: r.id_recursos,
                            tipo: r.tipo,
                            recursos: r.recursos,
                            redactado: r.redactado
                        }));

                        const cleanedFuentes = (weekDesign.momentos?.fuentes || []).map((f: any) => ({
                            id: f.id_fuente,
                            tipo: f.tipo,
                            autor: f.autor,
                            anio: f.anio,
                            titulo_fuente: f.titulo_fuente,
                            detalle: f.detalle,
                            url: f.url
                        }));

                        const allAdaptations = weekDesign.momentos?.adaptaciones || [];
                        const basicas = allAdaptations
                            .filter((a: any) => a.tipo?.toLowerCase() !== 'especial')
                            .map((a: any) => ({
                                id: a.id_adaptacion_basica,
                                nombre: a.nombre_adaptacion,
                                redactado: a.redactado,
                                situacion: a.situacion
                            }));
                        const especial = allAdaptations
                            .filter((a: any) => a.tipo?.toLowerCase() === 'especial')
                            .map((a: any) => ({
                                id: a.id_adaptacion_basica,
                                nombre: a.nombre_adaptacion,
                                redactado: a.redactado
                            }));

                        const payload = {
                            momentos: cleanedMomentos,
                            recursos: cleanedRecursos,
                            fuentes: cleanedFuentes,
                            adaptaciones_basicas: basicas,
                            adaptacion_especial: especial
                        };
                        const res = await PlanningService.updateHeader(weekId as string, payload);
                        if (res.error) throw res.error;

                        // Actualizar cache local con los datos limpios
                        setWeekDesignState((prev: any) => ({
                            ...prev,
                            [Number(weekNum)]: {
                                ...prev[Number(weekNum)],
                                momentos_json: payload.momentos,
                                recursos_json: payload.recursos,
                                fuentes_json: payload.fuentes,
                                adaptaciones_json: basicas,
                                adaptacion_especial: especial
                            }
                        }));
                    }
                }

                saveCurrentAreaState();
                setStep(9);
            } catch (error: any) {
                console.error('Error syncing Step 8 data:', error);
                showError('Error de sincronización', 'No se pudieron guardar los recursos y fuentes.');
            } finally {
                setSaving(false);
            }
        } else if (step === 9) {
            setSaving(true);
            try {
                // 1. Obtener el pdcAreaId actual
                const areaId = selectedAreas[currentAreaIndex];
                const junctionRes = await PdcService.getPdcAreaJunctionId(currentPdcId!, areaId);
                const pdcAreaId = junctionRes.data;

                if (pdcAreaId) {
                    // 2. Recuperar todos los registros actuales de evaluación
                    const [ser, saber, hacer, adapt] = await Promise.all([
                        EvaluacionService.getSerByPdcArea(pdcAreaId),
                        EvaluacionService.getSaberByPdcArea(pdcAreaId),
                        EvaluacionService.getHacerByPdcArea(pdcAreaId),
                        EvaluacionService.getAdaptacionByPdcArea(pdcAreaId)
                    ]);

                    // 3. Consolidar en snapshots
                    const criterios = [
                        ...(ser.data || []),
                        ...(saber.data || []),
                        ...(hacer.data || [])
                    ];
                    const adaptaciones = adapt.data || [];

                    // 4. Guardar snapshot en la tabla maestra pdcs_area_trabajo
                    const res = await EvaluacionService.saveEvaluationSnapshot(pdcAreaId, {
                        criterios,
                        adaptaciones
                    });

                    if (res.error) throw res.error;
                }

                saveCurrentAreaState();
                setStep(10);
            } catch (error: any) {
                console.error('Error syncing Step 9 data:', error);
                showError('Error de sincronización', 'No se pudieron consolidar los criterios de evaluación.');
            } finally {
                setSaving(false);
            }
        } else {
            if (step >= 4) saveCurrentAreaState();
            if (step === 4) setCurrentAreaIndex(0);
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 4) {
            saveCurrentAreaState();
            if (step === 6 && currentAreaIndex > 0) {
                setCurrentAreaIndex(currentAreaIndex - 1);
                setStep(10);
            } else if (step === 11) {
                setCurrentAreaIndex(selectedAreas.length - 1);
                setStep(10);
            } else {
                setStep(step - 1);
            }
        } else if (step === 4) {
            setStep(3);
        } else if (step > 1) {
            setStep(step - 1);
        } else {
            router.back();
        }
    };

    const jumpToArea = (index: number) => {
        if (index === currentAreaIndex) return;

        // Si intenta avanzar a una materia posterior mediante las pestañas
        if (index > currentAreaIndex) {
            // Verificar si el área actual está completada
            const currentAreaId = selectedAreas[currentAreaIndex];
            const cache = state.areasDesignState[currentAreaId];
            
            // Verificación básica: al menos debe tener objetivos y estado de semanas
            if (!cache || cache.isStep6Complete === false) {
                showError('Área incompleta', 'Debes completar el diseño del área actual antes de avanzar.');
                return;
            }
            
            // Verificar consolidación de semanas
            const cachedDesignState = cache.weekDesignState || {};
            const cachedPlanningIds = cache.weekPlanningIds || {};
            for (const weekNum of Object.keys(cachedPlanningIds)) {
                const weekDesign = cachedDesignState[Number(weekNum)];
                if (weekDesign && weekDesign.consolidado !== 1) {
                    showError('Área incompleta', `Debes consolidar todas las semanas (paso 8) del área actual antes de saltar.`);
                    return;
                }
            }
        }

        saveCurrentAreaState();
        setCurrentAreaIndex(index);
    };

    return {
        handleNext,
        handleBack,
        jumpToArea
    };
}
