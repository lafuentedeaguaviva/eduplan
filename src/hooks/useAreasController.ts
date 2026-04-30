'use client';

/**
 * Controller: useAreasController
 * 
 * Gestiona la lógica de negocio para el Dashboard de un Área específica.
 * Maneja la sincronización entre los contenidos base oficiales y los contenidos editables del usuario.
 */

import { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AreasService } from '@/services/areas.service';
import { LibraryService } from '@/services/library.service';
import { useFeedback } from './useFeedback';
import { AreaTrabajo, ContentItem, UserContent } from '@/types';
import { stableSortByOrden } from '@/utils/sorting';

export function useAreasController(params: Promise<{ id: string }>) {
    const { id } = use(params);
    const router = useRouter();

    // --- Estado: Datos (Models) ---
    const [area, setArea] = useState<AreaTrabajo | null>(null);
    const [baseContents, setBaseContents] = useState<ContentItem[]>([]);
    const [userContents, setUserContents] = useState<UserContent[]>([]);

    // --- Estado: UI & Loading ---
    const [loading, setLoading] = useState(true);
    const [copyingId, setCopyingId] = useState<number | null>(null);
    const [isCopyingAll, setIsCopyingAll] = useState(false);
    const [isSaving, setIsSaving] = useState<number | 'new' | null>(null);
    const { feedback, showSuccess, showError, showConfirm, hideFeedback } = useFeedback();

    // --- Estado: Interacción ---
    const [expandedThemes, setExpandedThemes] = useState<Set<number>>(new Set());
    const [expandedUserThemes, setExpandedUserThemes] = useState<Set<number>>(new Set());
    const [editingContentId, setEditingContentId] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [isAddingSubthemeTo, setIsAddingSubthemeTo] = useState<number | null>(null);
    const [newSubthemeTitle, setNewSubthemeTitle] = useState('');

    // --- Ciclo de Vida ---
    useEffect(() => {
        loadData();
    }, [id]);

    useEffect(() => {
        if (!editingContentId) {
            setEditingTitle('');
        }
    }, [editingContentId]);

    // --- Selectores (Computed State) ---
    const rootBaseThemes = useMemo(() =>
        baseContents.filter((c: ContentItem) => !c.padre_id),
        [baseContents]);

    const getBaseSubthemes = (parentId: number) =>
        baseContents.filter((c: ContentItem) => c.padre_id === parentId);

    /**
     * Determina si un contenido es considerado "Raíz" (Tema Central).
     * Un contenido es raíz si no tiene padre_id O si su padre_id no existe en la lista actual (huérfano).
     */
    const isRootTheme = (c: UserContent, all: UserContent[]) => 
        !c.padre_id || !all.find((t: UserContent) => t.id === c.padre_id);

    const userThemes = useMemo(() =>
        stableSortByOrden(
            userContents.filter((c: UserContent) => isRootTheme(c, userContents))
        ),
        [userContents]);

    const getUserSubthemes = (parentId: number) =>
        stableSortByOrden(
            userContents.filter((c: UserContent) => c.padre_id === parentId)
        );

    // --- Acciones de Orquestación ---

    const loadData = async () => {
        setLoading(true);
        try {
            const resArea = await AreasService.getAreaById(id);
            const areaData = resArea.data;
            if (areaData) {
                setArea(areaData);
                const [resBase, resUser] = await Promise.all([
                    LibraryService.getBaseContentsByArea(areaData.area_conocimiento.id),
                    LibraryService.getUserContents(id)
                ]);
                if (resBase.success && resBase.data) setBaseContents(resBase.data);
                if (resUser.success && resUser.data) setUserContents(resUser.data);
            }
        } catch (err) {
            console.error('Controller Error [loadData]:', err);
            showError('No se pudo cargar la información del área.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyManual = async (baseId: number) => {
        setCopyingId(baseId);
        try {
            const result = await LibraryService.copyContentToUser(baseId, id);
            if (result.success) {
                const resUser = await LibraryService.getUserContents(id);
                if (resUser.success && resUser.data) setUserContents(resUser.data);
                showSuccess('Contenido copiado correctamente.');
            } else {
                showError('Error al copiar contenido');
            }
        } finally {
            setCopyingId(null);
        }
    };

    const handleCopyAllOfficial = async () => {
        if (userContents.length > 0) {
            showConfirm({
                title: '¿Reemplazar contenidos actuales?',
                description: `Atención: Ya tienes ${userContents.length} contenidos en tu lista. Si continúas, SE BORRARÁN todos tus contenidos actuales de esta área y se reemplazarán por los oficiales del currículo base.`,
                variant: 'error',
                confirmText: 'Sí, reemplazar todo',
                onConfirm: async () => {
                    setIsCopyingAll(true);
                    const resClear = await LibraryService.clearUserContents(id);
                    if (!resClear.success) {
                        showError('Error al limpiar los contenidos previos.');
                        setIsCopyingAll(false);
                        return;
                    }
                    await proceedWithCopy();
                }
            });
        } else {
            showConfirm({
                title: '¿Copiar contenidos base?',
                description: '¿Deseas copiar todos los contenidos base oficiales a tu lista de contenidos editables?',
                onConfirm: async () => {
                    setIsCopyingAll(true);
                    await proceedWithCopy();
                }
            });
        }
    };

    const proceedWithCopy = async () => {
        const result = await LibraryService.copyAllBaseContentsToUser(area!.area_conocimiento.id, id);
        if (result.success) {
            const resUser = await LibraryService.getUserContents(id);
            if (resUser.success && resUser.data) {
                setUserContents(resUser.data);
                showSuccess('Contenidos base sincronizados.');
            }
        } else {
            showError('Error al copiar contenidos base.');
        }
        setIsCopyingAll(false);
    };

    const updateContent = async (contentId: number, shouldClose = true) => {
        if (!editingTitle.trim()) return;
        if (isSaving === contentId) return;

        setIsSaving(contentId);
        try {
            const result = await LibraryService.updateUserContent(contentId, { titulo: editingTitle });
            if (result.success) {
                setUserContents((prev: UserContent[]) => prev.map((c: UserContent) => c.id === contentId ? {
                    ...c,
                    titulo: editingTitle,
                    updated_at: new Date().toISOString()
                } : c));

                if (shouldClose) {
                    setEditingContentId(null);
                }
                showSuccess('Cambios guardados.');
            } else {
                showError(result.error?.message || 'Error al guardar cambios.');
            }
        } catch (err) {
            showError('Error de conexión al intentar guardar.');
        } finally {
            setIsSaving(null);
        }
    };

    const createNewTheme = async (titulo: string, shouldClose = true) => {
        if (!titulo.trim()) {
            if (shouldClose) setIsAddingNew(false);
            return;
        }

        setIsSaving('new');
        try {
            const result = await LibraryService.createCustomContent(id, titulo);
            if (result.success) {
                const resUser = await LibraryService.getUserContents(id);
                if (resUser.success && resUser.data) setUserContents(resUser.data);
                if (shouldClose) {
                    setIsAddingNew(false);
                    setNewTitle('');
                }
                showSuccess('Nuevo tema creado.');
            } else {
                showError(result.error?.message || 'Error al crear el tema.');
            }
        } finally {
            setIsSaving(null);
        }
    };

    const createNewSubtheme = async (padreId: number, titulo: string) => {
        if (!titulo.trim()) {
            setIsAddingSubthemeTo(null);
            return;
        }

        setIsSaving('new');
        const result = await LibraryService.createCustomSubtheme(id, padreId, titulo);
        if (result.success) {
            const resUser = await LibraryService.getUserContents(id);
            if (resUser.success && resUser.data) setUserContents(resUser.data);
            const nextExpanded = new Set(expandedUserThemes);
            nextExpanded.add(padreId);
            setExpandedUserThemes(nextExpanded);
            showSuccess('Subtema creado.');
            setIsAddingSubthemeTo(null);
            setNewSubthemeTitle('');
        } else {
            showError(result.error?.message || 'Error al crear subtema.');
        }
        setIsSaving(null);
    };

    const reorderContent = async (content: UserContent, direction: 'up' | 'down') => {
        // Obtenemos los hermanos usando la misma lógica que en la visualización
        const isRoot = isRootTheme(content, userContents);
        
        let siblings: UserContent[];
        if (isRoot) {
            siblings = userContents.filter(c => isRootTheme(c, userContents));
        } else {
            siblings = userContents.filter(c => c.padre_id === content.padre_id);
        }

        const currentIndex = siblings.findIndex((s: UserContent) => s.id === content.id);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex >= 0 && targetIndex < siblings.length) {
            const target = siblings[targetIndex];
            
            // Calculamos nuevos órdenes. 
            // Si son idénticos, forzamos un desplazamiento para asegurar que el swap sea efectivo en DB.
            let newOrderForContent = target.orden;
            let newOrderForTarget = content.orden;

            if (newOrderForContent === newOrderForTarget) {
                // Si tienen el mismo orden, la base de datos no cambiaría nada con un swap 1:1.
                // Forzamos que el que sube tenga un orden menor.
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
                const resUser = await LibraryService.getUserContents(id);
                if (resUser.success && resUser.data) setUserContents(resUser.data);
            } else {
                showError('Error al reordenar contenidos.');
            }
        }
    };

    const handleDeleteArea = async (id: string, name: string) => {
        showConfirm(
            'Confirmar Eliminación',
            `¿Estás seguro de que deseas eliminar el área "${name}"? Esta acción borrará PERMANENTEMENTE todos los contenidos, planificaciones y diseños asociados. No se puede deshacer.`,
            async () => {
                try {
                    const result = await AreasService.deleteArea(id);
                    if (result.success) {
                        setUserContents(prev => prev.filter(c => c.area_trabajo_id !== id));
                        showSuccess('Área Eliminada', 'El área y todos sus vínculos han sido borrados con éxito.');
                        router.refresh();
                    } else {
                        throw result.error;
                    }
                } catch (error: any) {
                    showError('Error de Eliminación', `No se pudo borrar el área: ${error.message || 'Error desconocido'}`);
                }
            }
        );
    };

    const deleteContent = async (contentId: number) => {
        showConfirm({
            title: '¿Eliminar contenido?',
            description: '¿Estás seguro de eliminar este contenido? Esta acción no se puede deshacer.',
            variant: 'error',
            onConfirm: async () => {
                const res = await LibraryService.deleteUserContent(contentId);
                if (res.success) {
                    setUserContents(userContents.filter((c: UserContent) => c.id !== contentId));
                    showSuccess('Contenido eliminado.');
                } else {
                    showError('Error al eliminar contenido.');
                }
            }
        });
    };

    // --- Helpers de UI ---

    const toggleBaseTheme = (themeId: number) => {
        const next = new Set(expandedThemes);
        if (next.has(themeId)) next.delete(themeId);
        else next.add(themeId);
        setExpandedThemes(next);
    };

    const toggleUserTheme = (themeId: number) => {
        const next = new Set(expandedUserThemes);
        if (next.has(themeId)) next.delete(themeId);
        else next.add(themeId);
        setExpandedUserThemes(next);
    };

    const startEditing = (content: UserContent) => {
        setEditingContentId(content.id);
        setEditingTitle(content.titulo);
        setIsAddingNew(false);
    };

    const cancelEditing = () => {
        setEditingContentId(null);
        setIsAddingNew(false);
    };

    const goBack = () => router.back();

    return {
        // Data
        area,
        baseContents,
        userContents,
        rootBaseThemes,
        userThemes,

        // UI State
        loading,
        copyingId,
        isCopyingAll,
        isSaving,
        feedback,
        hideFeedback,
        expandedThemes,
        expandedUserThemes,
        editingContentId,
        editingTitle,
        isAddingNew,
        newTitle,
        isAddingSubthemeTo,
        newSubthemeTitle,

        // Setters
        setEditingTitle,
        setNewTitle,
        setIsAddingNew,
        setIsAddingSubthemeTo,
        setNewSubthemeTitle,

        // Actions
        getBaseSubthemes,
        getUserSubthemes,
        handleCopyManual,
        handleCopyAllOfficial,
        updateContent,
        createNewTheme,
        createNewSubtheme,
        reorderContent,
        deleteContent,
        toggleBaseTheme,
        toggleUserTheme,
        startEditing,
        cancelEditing,
        handleDeleteArea,
        goBack
    };
}
