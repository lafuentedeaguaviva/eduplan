'use client';

import React from 'react';
import { useStep2CronogramaFechas } from '@/hooks/useStep2CronogramaFechas';
import { TrimestreMesSelector } from './components/TrimestreMesSelector';
import { CronogramaConfig } from './components/CronogramaConfig';
import { WeekCardList } from './components/WeekCardList';

export function Step2CronogramaFechas() {
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
    } = useStep2CronogramaFechas();

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-in fade-in slide-in-from-right-6 duration-700">
            {/* Selectors */}
            <div className="xl:col-span-4">
                <TrimestreMesSelector
                    selectedTrimestre={selectedTrimestre}
                    setSelectedTrimestre={setSelectedTrimestre}
                    selectedMes={selectedMes}
                    setSelectedMes={setSelectedMes}
                />
            </div>

            {/* Schedule Preview */}
            <div className="xl:col-span-8 space-y-10">
                <CronogramaConfig
                    selectedMes={selectedMes}
                    selectedTrimestre={selectedTrimestre}
                    pdcWeeks={pdcWeeks}
                    pdcDates={pdcDates}
                    handlePdcDatesChange={handlePdcDatesChange}
                    addWeek={addWeek}
                    removeLastWeek={removeLastWeek}
                />

                <WeekCardList
                    pdcWeeks={pdcWeeks}
                    selectedTrimestre={selectedTrimestre}
                />
            </div>
        </div>
    );
}
