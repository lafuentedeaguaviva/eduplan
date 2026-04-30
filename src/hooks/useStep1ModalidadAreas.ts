'use client';

import { usePdcWizard } from '@/contexts/PdcWizardContext';

export function useStep1ModalidadAreas() {
    const {
        pdcTypes,
        selectedType,
        setSelectedType,
        filteredAreas,
        selectedAreas,
        toggleAreaSelection,
        currentPdcId,
    } = usePdcWizard() as any;

    const handleSelectType = (id: number) => {
        if (currentPdcId) return;
        setSelectedType(id);
    };

    const handleToggleArea = (id: string) => { // ID de área es string (UUID)
        if (currentPdcId) return;
        toggleAreaSelection(id);
    };

    return {
        pdcTypes,
        selectedType,
        handleSelectType,
        filteredAreas,
        selectedAreas,
        handleToggleArea,
        currentPdcId,
    };
}
