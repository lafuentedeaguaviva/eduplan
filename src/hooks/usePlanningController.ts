'use client';

import { useState, useEffect, useCallback } from 'react';
import { AreasService } from '@/services/areas.service';
import { AreaTrabajo, UserContent, PlanificacionSemanal, PlanificacionGeneral } from '@/types';
import { LibraryService } from '@/services/library.service';
import { PdcService } from '@/services/pdc.service';
import { stableSortByOrden } from '@/utils/sorting';

import { useFeedback } from './useFeedback';

/**
 * Controller: usePlanningController
 * 
 * Gestiona el estado y la lógica de negocio para la planificación semanal de un área.
 * Centraliza la carga de datos, la gestión del cronograma y la configuración.
 */
export function usePlanningController(areaId: string) {
    const [area, setArea] = useState<AreaTrabajo | null>(null);
    const [userContents, setUserContents] = useState<UserContent[]>([]);
    const [areaSchedule, setAreaSchedule] = useState<PlanificacionSemanal[]>([]);
    const [globalSchedule, setGlobalSchedule] = useState<PlanificacionGeneral[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [showConfig, setShowConfig] = useState(false);
    const [currentTrimestre, setCurrentTrimestre] = useState(1);
    const [currentMes, setCurrentMes] = useState<number | null>(null);
    const [gestion] = useState(new Date().getFullYear());
    const [allAssignments, setAllAssignments] = useState<any[]>([]);
    
    // UI State for Editing & Adding
    const [editingContentId, setEditingContentId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [isAddingSubthemeTo, setIsAddingSubthemeTo] = useState<number | null>(null);
    const [newSubthemeTitle, setNewSubthemeTitle] = useState('');
    const { feedback, showSuccess, showError, showConfirm, hideFeedback } = useFeedback();

    const refreshScheduleOnly = useCallback(async () => {
        try {
            const [resSchedule, resPlanned] = await Promise.all([
                PdcService.getAreaSchedule(areaId, gestion, currentTrimestre),
                PdcService.getAllPlannedContents(areaId, gestion)
            ]);
            if (resSchedule.success && resSchedule.data) setAreaSchedule(resSchedule.data);
            if (resPlanned.success && resPlanned.data) setAllAssignments(resPlanned.data);
        } catch (error) {
            console.error('Controller Error [refreshScheduleOnly]:', error);
        }
    }, [areaId, gestion, currentTrimestre]);

    const loadData = useCallback(async (isInitial = true, filterMes?: number) => {
        if (isInitial) setLoading(true);
        if (filterMes) setCurrentMes(filterMes);
        
        try {
            // Cargar datos del área
            const resArea = await AreasService.getAreaById(areaId);
            const areaData = resArea.data;
            setArea(areaData);

            if (areaData) {
                const [resUser, resSchedule, resGlobal, resPlanned] = await Promise.all([
                    LibraryService.getUserContents(areaId),
                    PdcService.getAreaSchedule(areaId, gestion, currentTrimestre),
                    PdcService.getGlobalSchedule(gestion, currentTrimestre),
                    PdcService.getAllPlannedContents(areaId, gestion)
                ]);

                if (resUser.success && resUser.data) setUserContents(resUser.data);
                if (resGlobal.success && resGlobal.data) setGlobalSchedule(resGlobal.data);
                if (resPlanned.success && resPlanned.data) setAllAssignments(resPlanned.data);

                const scheduleData = resSchedule.data || [];
                const globalData = resGlobal.data || [];

                // El cronograma se carga directamente. Si está vacío, la UI mostrará el botón de IMPORTAR.
                setAreaSchedule(scheduleData);
            }
        } catch (error) {
            console.error('Controller Error [loadData]:', error);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [areaId, gestion, currentTrimestre, currentMes]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleConfigSuccess = (t: number) => {
        setShowConfig(false);
        setCurrentTrimestre(t);
        loadData(false);
    };

    const handleAssign = async (planId: string, contentId: number) => {
        const selectedContent = userContents.find((c: UserContent) => c.id === contentId);
        if (!selectedContent) return;

        const idsToAssign: number[] = [contentId];
        const contentItemsToUpdate: { id: number; titulo: string }[] = [{ id: contentId, titulo: selectedContent.titulo }];

        if (!selectedContent.padre_id) {
            // Incluir todos los subtemas del padre, incluso los ya planificados en otras semanas.
            // El guard de duplicado en la misma semana lo maneja existingIds en el optimistic update.
            const subthemes = userContents.filter((c: UserContent) => c.padre_id === contentId);
            subthemes.forEach((sub: UserContent) => {
                idsToAssign.push(sub.id);
                contentItemsToUpdate.push({ id: sub.id, titulo: sub.titulo });
            });
        } else {
            const parentTheme = userContents.find((t: UserContent) => t.id === selectedContent.padre_id && !t.padre_id);
            if (parentTheme) {
                idsToAssign.push(parentTheme.id);
                contentItemsToUpdate.push({ id: parentTheme.id, titulo: parentTheme.titulo });
            }
        }

        // Optimistic Update
        setAreaSchedule((prev: PlanificacionSemanal[]) => prev.map((week: PlanificacionSemanal) => {
            if (week.id === planId) {
                const existingIds = new Set(week.semana_contenido?.map((sc): number => sc.contenido_usuario_id) || []);
                const newItems = contentItemsToUpdate
                    .filter(item => !existingIds.has(item.id))
                    .map(item => ({
                        id: `temp-${item.id}-${Date.now()}`,
                        contenido_usuario_id: item.id,
                        orden: 0,
                        estado: 'planificado' as const,
                        contenido_usuario: {
                            titulo: item.titulo,
                            padre_id: userContents.find((c: UserContent) => c.id === item.id)?.padre_id || null
                        } as UserContent
                    }));

                if (newItems.length === 0) return week;
                return {
                    ...week,
                    semana_contenido: [...(week.semana_contenido || []), ...newItems]
                };
            }
            return week;
        }));

        setIsProcessing(planId);
        try {
            const result = await PdcService.assignMultipleContentsToWeek(planId, idsToAssign);
            if (!result.success) {
                refreshScheduleOnly();
                alert('No se pudieron asignar algunos contenidos.');
            } else {
                refreshScheduleOnly();
            }
        } catch (error) {
            console.error('Assignment error:', error);
            refreshScheduleOnly();
        } finally {
            setIsProcessing(null);
        }
    };

    const handleRemoveAssignment = async (planId: string, contentId: number) => {
        const week = areaSchedule.find((w: PlanificacionSemanal) => w.id === planId);
        const contentToRemove = userContents.find((c: UserContent) => c.id === contentId);
        const idsToRemove: number[] = [contentId];

        if (week && contentToRemove && !contentToRemove.padre_id) {
            const assignedSubthemeIds = week.semana_contenido
                ?.filter((sc) => {
                    const subContent = userContents.find((uc: UserContent) => uc.id === sc.contenido_usuario_id);
                    return subContent?.padre_id === contentId;
                })
                .map((sc) => sc.contenido_usuario_id) || [];
            idsToRemove.push(...assignedSubthemeIds);
        }

        // Optimistic Remove
        setAreaSchedule((prev: PlanificacionSemanal[]) => prev.map((w: PlanificacionSemanal) => {
            if (w.id === planId) {
                return {
                    ...w,
                    semana_contenido: w.semana_contenido?.filter((sc: { contenido_usuario_id: number }) => !idsToRemove.includes(sc.contenido_usuario_id))
                };
            }
            return w;
        }));

        setIsProcessing(`${planId}-${contentId}`);
        try {
            const result = await PdcService.removeMultipleContentsFromWeek(planId, idsToRemove);
            if (!result.success) {
                refreshScheduleOnly();
            } else {
                refreshScheduleOnly();
            }
        } catch (error) {
            console.error('Removal error:', error);
            refreshScheduleOnly();
        } finally {
            setIsProcessing(null);
        }
    };

    // --- NUEVA LÓGICA DE EDICIÓN Y REORDENAMIENTO ---

    const startEditing = (content: UserContent) => {
        setEditingContentId(content.id);
        setEditingTitle(content.titulo);
    };

    const cancelEditing = () => {
        setEditingContentId(null);
        setEditingTitle('');
    };

    const updateContent = async (contentId: number) => {
        if (!editingTitle.trim()) return;
        
        try {
            const result = await LibraryService.updateUserContent(contentId, { titulo: editingTitle });
            if (result.success) {
                // Actualizar estado local de contenidos
                setUserContents(prev => prev.map(c => c.id === contentId ? { ...c, titulo: editingTitle } : c));
                
                // Actualizar estado local del cronograma (para que se vea el cambio en las semanas)
                setAreaSchedule(prev => prev.map(week => ({
                    ...week,
                    semana_contenido: week.semana_contenido?.map(sc => 
                        sc.contenido_usuario_id === contentId 
                            ? { ...sc, contenido_usuario: { ...sc.contenido_usuario!, titulo: editingTitle } } 
                            : sc
                    )
                })));

                setEditingContentId(null);
            }
        } catch (error) {
            console.error('Error updating content:', error);
        }
    };

    const isRootTheme = (c: UserContent, all: UserContent[]) => 
        !c.padre_id || !all.find((t: UserContent) => t.id === c.padre_id);

    const reorderContent = async (content: UserContent, direction: 'up' | 'down') => {
        const isRoot = isRootTheme(content, userContents);
        
        const siblings = isRoot 
            ? stableSortByOrden(userContents.filter(c => isRootTheme(c, userContents)))
            : stableSortByOrden(userContents.filter(c => c.padre_id === content.padre_id));

        const currentIndex = siblings.findIndex((s: UserContent) => s.id === content.id);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex >= 0 && targetIndex < siblings.length) {
            const target = siblings[targetIndex];
            
            let newOrderForContent = target.orden;
            let newOrderForTarget = content.orden;

            if (newOrderForContent === newOrderForTarget) {
                if (direction === 'up') {
                    newOrderForContent = Math.max(0, target.orden - 1);
                    newOrderForTarget = target.orden;
                } else {
                    newOrderForContent = target.orden + 1;
                    newOrderForTarget = target.orden;
                }
            }

            const result = await LibraryService.reorderUserContent(content.id, newOrderForContent, target.id, newOrderForTarget);
            if (result.success) {
                const resUser = await LibraryService.getUserContents(areaId);
                if (resUser.success && resUser.data) setUserContents(resUser.data);
            }
        }
    };

    const createNewTheme = async (titulo?: string, shouldClose = true) => {
        const titleToUse = typeof titulo === 'string' ? titulo : newTitle;
        
        if (!titleToUse.trim()) {
            if (shouldClose) setIsAddingNew(false);
            return;
        }

        setSaving(true);
        try {
            const result = await LibraryService.createCustomContent(areaId, titleToUse);
            if (result.success) {
                const resUser = await LibraryService.getUserContents(areaId);
                if (resUser.success && resUser.data) setUserContents(resUser.data);
                if (shouldClose) {
                    setIsAddingNew(false);
                    setNewTitle('');
                }
                showSuccess('Nuevo tema creado.');
            } else {
                showError('Error al crear tema', result.error);
            }
        } finally {
            setSaving(false);
        }
    };

    const createNewSubtheme = async (padreId: number, titulo?: string) => {
        const titleToUse = typeof titulo === 'string' ? titulo : newSubthemeTitle;

        if (!titleToUse.trim()) {
            setIsAddingSubthemeTo(null);
            return;
        }

        setSaving(true);
        try {
            const result = await LibraryService.createCustomSubtheme(areaId, padreId, titleToUse);
            if (result.success) {
                const resUser = await LibraryService.getUserContents(areaId);
                if (resUser.success && resUser.data) setUserContents(resUser.data);
                setIsAddingSubthemeTo(null);
                setNewSubthemeTitle('');
                showSuccess('Subtema añadido.');
            } else {
                showError('Error al crear subtema', result.error);
            }
        } finally {
            setSaving(false);
        }
    };

    return {
        area,
        userContents,
        areaSchedule,
        globalSchedule,
        loading,
        saving,
        isProcessing,
        showConfig,
        currentTrimestre,
        gestion,
        allAssignments,
        editingContentId,
        editingTitle,
        isAddingNew,
        newTitle,
        isAddingSubthemeTo,
        newSubthemeTitle,
        feedback,

        setEditingTitle,
        setIsAddingNew,
        setNewTitle,
        setIsAddingSubthemeTo,
        setNewSubthemeTitle,
        setShowConfig,
        setCurrentTrimestre,
        setAreaSchedule,
        hideFeedback,

        loadData,
        refreshScheduleOnly,
        handleConfigSuccess,
        handleAssign,
        handleRemoveAssignment,
        startEditing,
        cancelEditing,
        updateContent,
        reorderContent,
        createNewTheme,
        createNewSubtheme
    };
}
