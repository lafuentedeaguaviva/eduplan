'use client';

import React from 'react';
import { useStep2CronogramaFechas } from '@/hooks/useStep2CronogramaFechas';
import { TrimestreMesSelector } from './components/TrimestreMesSelector';

export function Step2CronogramaFechas() {
    const {
        selectedTrimestre,
        setSelectedTrimestre,
        selectedMes,
        setSelectedMes,
    } = useStep2CronogramaFechas();

    return (
        <div className="max-w-2xl mx-auto p-10 bg-white rounded-[3rem] border border-slate-100 shadow-soft animate-in fade-in slide-in-from-right-6 duration-700">
            <TrimestreMesSelector
                selectedTrimestre={selectedTrimestre}
                setSelectedTrimestre={setSelectedTrimestre}
                selectedMes={selectedMes}
                setSelectedMes={setSelectedMes}
            />
        </div>
    );
}
