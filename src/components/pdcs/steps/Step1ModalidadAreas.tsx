'use client';

import React from 'react';
import { useStep1ModalidadAreas } from '@/hooks/useStep1ModalidadAreas';
import { ModalidadSelector } from './components/ModalidadSelector';
import { AreaSelector } from './components/AreaSelector';

export function Step1ModalidadAreas() {
    const {
        pdcTypes,
        selectedType,
        handleSelectType,
        filteredAreas,
        selectedAreas,
        handleToggleArea,
        currentPdcId,
    } = useStep1ModalidadAreas();

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {currentPdcId && (
                <div className="bg-blue-50/50 border border-blue-100/50 p-5 rounded-[2rem] flex items-center gap-5 text-blue-900/80 shadow-sm backdrop-blur-sm animate-in zoom-in-95 duration-500">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                        <span className="material-symbols-rounded text-2xl font-black">info</span>
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-sm">PDC en modo edición</p>
                        <p className="text-xs opacity-70">Para garantizar la integridad de tu planificación, la modalidad y áreas seleccionadas no pueden cambiarse una vez creado el PDC.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Left: Modalidad */}
                <div className="xl:col-span-4">
                    <ModalidadSelector
                        pdcTypes={pdcTypes}
                        selectedType={selectedType}
                        onSelectType={handleSelectType}
                    />
                </div>

                {/* Right: Areas */}
                <div className="xl:col-span-8">
                    <AreaSelector
                        filteredAreas={filteredAreas}
                        selectedAreas={selectedAreas}
                        onToggleArea={handleToggleArea}
                    />
                </div>
            </div>
        </div>
    );
}
