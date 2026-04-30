'use client';

/**
 * Controller: useLibraryController
 * 
 * Este hook actúa como el Controlador para la Biblioteca.
 * Centraliza la lógica de negocio, manejo de estado y comunicación con los Modelos (servicios).
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LibraryService } from '@/services/library.service';
import { AreasService } from '@/services/areas.service';
import { AuthService } from '@/services/auth.service';
import { ProfileService } from '@/services/profile.service';
import { ContentItem, AreaTrabajo } from '@/types';
import { useFeedback } from './useFeedback';

export function useLibraryController() {
    const { feedback, showError, hideFeedback } = useFeedback();
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlAreaId = searchParams.get('areaId');

    // --- Estado (State) ---
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ContentItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [areas, setAreas] = useState<AreaTrabajo[]>([]);
    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(urlAreaId);
    const [isAdmin, setIsAdmin] = useState(false);

    // --- Ciclo de Vida (Life Cycle) ---
    useEffect(() => {
        loadUserContext();
        if (urlAreaId) {
            executeSearch(query, urlAreaId);
        }
    }, [urlAreaId]);

    // --- Acciones de Negocio (Business Actions) ---

    /**
     * Carga las áreas de trabajo disponibles para el usuario actual.
     */
    const loadUserContext = async () => {
        try {
            const { data: sessionData } = await AuthService.getSession();
            const session = sessionData.session;
            if (session?.user) {
                const [resAreas, resProfile] = await Promise.all([
                    AreasService.getAreas(session.user.id),
                    ProfileService.getProfile(session.user.id)
                ]);
                if (resAreas.success && resAreas.data) setAreas(resAreas.data);
                if (resProfile.success && resProfile.data?.roles?.includes('Administrador')) {
                    setIsAdmin(true);
                }
            }
        } catch (error) {
            showError('Error al cargar el contexto del usuario.', error);
        }
    };

    /**
     * Ejecuta la búsqueda de contenidos basada en query y área opcional.
     */
    const executeSearch = async (searchQuery: string = query, areaId: string | null = selectedAreaId) => {
        setIsSearching(true);
        try {
            const res = await LibraryService.searchContents(
                searchQuery,
                areaId ? parseInt(areaId) : undefined
            );
            if (res.success && res.data) {
                setResults(res.data);
            } else if (res.error) {
                showError('Error al realizar la búsqueda de contenidos.', res.error);
            }
        } catch (error) {
            showError('Error al realizar la búsqueda de contenidos.', error);
        } finally {
            setIsSearching(false);
        }
    };

    /**
     * Maneja el cambio en el input de búsqueda.
     */
    const handleQueryChange = (value: string) => {
        setQuery(value);
    };

    /**
     * Maneja el envío del formulario de búsqueda.
     */
    const handleSearchSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        executeSearch();
    };

    /**
     * Selecciona o deselecciona un área de trabajo.
     */
    const toggleAreaSelection = (areaConocimientoId: string) => {
        const newAreaId = selectedAreaId === areaConocimientoId ? null : areaConocimientoId;
        setSelectedAreaId(newAreaId);
        executeSearch(query, newAreaId);
    };

    /**
     * Copia un contenido de la biblioteca al contexto de trabajo seleccionado.
     */
    const useContentInWorkArea = async (baseContentId: number) => {
        if (!selectedAreaId) {
            showError('Por favor, selecciona una clase (contexto activo) primero para usar este contenido.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const activeArea = areas.find(a => String(a.area_conocimiento.id) === String(selectedAreaId));
        if (!activeArea) {
            showError('El área de trabajo seleccionada no es válida.');
            return;
        }

        setIsSearching(true);
        try {
            const result = await LibraryService.copyContentToUser(baseContentId, activeArea.id);
            if (result.success) {
                router.push(`/dashboard/areas/${activeArea.id}`);
            } else {
                showError('Error al copiar contenido: ' + (result.error?.message || result.error));
            }
        } catch (error) {
            showError('Error al usar el contenido en el área de trabajo.', error);
        } finally {
            setIsSearching(false);
        }
    };

    const navigateToArea = (areaId: string) => {
        router.push(`/dashboard/areas/${areaId}`);
    };

    return {
        // Estado
        query,
        results,
        isSearching,
        areas,
        selectedAreaId,
        isAdmin,
        feedback,

        // Handlers
        handleQueryChange,
        handleSearchSubmit,
        toggleAreaSelection,
        useContentInWorkArea,
        navigateToArea,
        hideFeedback
    };
}
