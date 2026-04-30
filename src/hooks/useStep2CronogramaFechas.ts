'use client';

import { usePdcWizard } from '@/contexts/PdcWizardContext';

export function useStep2CronogramaFechas() {
    const {
        selectedTrimestre,
        setSelectedTrimestre,
        selectedMes,
        setSelectedMes,
        pdcDates,
        handlePdcDatesChange,
        pdcWeeks,
        addWeek,
        removeLastWeek,
    } = usePdcWizard();

    return {
        selectedTrimestre,
        setSelectedTrimestre,
        selectedMes,
        setSelectedMes,
        pdcDates,
        handlePdcDatesChange,
        pdcWeeks,
        addWeek,
        removeLastWeek,
    };
}
