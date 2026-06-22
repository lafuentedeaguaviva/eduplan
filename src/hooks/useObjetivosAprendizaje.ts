'use client';

import { usePdcWizard } from '@/contexts/PdcWizardContext';

export function useObjetivosAprendizaje() {
    const {
        currentObjective,
        setCurrentObjective,
        sortedVerbos,
        hoveredVerb,
        setHoveredVerb,
        verbFilters,
        showFilters,
        setShowFilters,
        toggleNivelFilter,
        setVerbFilters,
        catalogoVerbos,
        filteredContentsForDesign,
        expandedTitles,
        setExpandedTitles,
        learningObjectives,
        complementCategories,
        selectedCompCategory,
        setSelectedCompCategory,
        complementFilters,
        setComplementFilters,
        complementSubCategories,
        allComplementLevels,
        showCompFilters,
        setShowCompFilters,
        filteredComplementos,
        hoveredComplement,
        setHoveredComplement,
        catalogoComplementos,
        complementSearch,
        setComplementSearch,
        addStrategicObjective,
        removeStrategicObjective,
        aiOptions,
        showError,
        loadObjectiveForEdit,
        isStep6Complete,
        pendingContentsCount,
        editingObjectiveIndex,
        toggleComplementNivelFilter
    } = usePdcWizard();

    const handleToggleVerb = (vId: number) => {
        setCurrentObjective((prev: any) => {
            const isSelected = prev.verboIds.includes(vId);
            let newVerbos = [...prev.verboIds];
            if (isSelected) {
                newVerbos = newVerbos.filter((id: number) => id !== vId);
            } else {
                if (newVerbos.length >= 2) {
                    newVerbos = [newVerbos[1], vId];
                } else {
                    newVerbos.push(vId);
                }
            }
            return { ...prev, verboIds: newVerbos, isManual: false };
        });
    };

    const handleToggleContent = (cId: number, isCovered: boolean) => {
        if (isCovered) return;
        
        if (currentObjective.verboIds.length === 0) {
            showError('Acción requerida', 'Primero debes seleccionar al menos un verbo para iniciar la construcción de tu objetivo pedagógico.');
            return;
        }

        const ids = currentObjective.contentIds.includes(cId)
            ? currentObjective.contentIds.filter((id: number) => id !== cId)
            : [...currentObjective.contentIds, cId];
        setCurrentObjective((prev: any) => ({ ...prev, contentIds: ids }));
    };

    const handleToggleComplement = (comp: any) => {
        if (currentObjective.verboIds.length === 0) {
            showError('Acción requerida', 'Primero debes seleccionar al menos un verbo para poder añadir complementos pedagógicos.');
            return;
        }

        setCurrentObjective((prev: any) => ({
            ...prev,
            complementId: prev.complementId === comp.id ? null : comp.id,
            complement: prev.complementId === comp.id ? '' : comp.complemento
        }));
    };

    const handleToggleExpanded = (tId: number) => {
        setExpandedTitles((prev: number[]) =>
            prev.includes(tId) ? prev.filter(id => id !== tId) : [...prev, tId]
        );
    };

    return {
        currentObjective,
        setCurrentObjective,
        sortedVerbos,
        hoveredVerb,
        setHoveredVerb,
        verbFilters,
        showFilters,
        setShowFilters,
        toggleNivelFilter,
        setVerbFilters,
        catalogoVerbos,
        filteredContentsForDesign,
        expandedTitles,
        learningObjectives,
        complementCategories,
        selectedCompCategory,
        setSelectedCompCategory,
        complementFilters,
        setComplementFilters,
        complementSubCategories,
        allComplementLevels,
        showCompFilters,
        setShowCompFilters,
        filteredComplementos,
        hoveredComplement,
        setHoveredComplement,
        catalogoComplementos,
        complementSearch,
        setComplementSearch,
        addStrategicObjective,
        removeStrategicObjective,
        aiOptions,
        handleToggleVerb,
        handleToggleContent,
        handleToggleComplement,
        handleToggleExpanded,
        loadObjectiveForEdit,
        isStep6Complete,
        pendingContentsCount,
        editingObjectiveIndex,
        toggleComplementNivelFilter
    };
}
