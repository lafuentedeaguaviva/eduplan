'use client';

import React from 'react';
import { useSemanasContenidos } from '@/hooks/useSemanasContenidos';
import { SemanasHeader } from './components/SemanasHeader';
import { WeekSelector } from './components/WeekSelector';
import { WeekContentList } from './components/WeekContentList';
import { Card } from '@/components/ui/Card';

export function SemanasContenidos() {
    const {
        pdcDates,
        weekContentsMap,
        learningObjectives,
        typeConfig,
        hasWeeks,
        sortedWeekKeys,
        activeWeek,
        setActiveWeek,
        formatDate
    } = useSemanasContenidos();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <SemanasHeader
                typeConfig={typeConfig}
                pdcDates={pdcDates}
                formatDate={formatDate}
            />

            {!hasWeeks ? (
                <Card className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50/30 rounded-[3rem]">
                    <div className="size-20 bg-white rounded-[2rem] shadow-premium flex items-center justify-center text-slate-200 rotate-6 mb-6">
                        <span className="material-symbols-rounded text-5xl">event_busy</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Sin Planificación Semanal Detectada</h3>
                    <p className="text-slate-400 font-medium mt-2">Vuelve al paso del Cronograma para configurar las semanas de trabajo.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start min-w-0">
                    {/* COLUMNA 1: Selector Temporal (1/3) */}
                    <div className="lg:col-span-1">
                        <WeekSelector
                            sortedWeekKeys={sortedWeekKeys}
                            activeWeek={activeWeek}
                            setActiveWeek={setActiveWeek}
                            typeConfig={typeConfig}
                        />
                    </div>

                    {/* COLUMNA 2-3: Contenidos Académicos (2/3) */}
                    <div className="lg:col-span-2 min-w-0">
                        <WeekContentList
                            activeWeek={activeWeek}
                            weekContents={weekContentsMap[activeWeek] || []}
                            learningObjectives={learningObjectives}
                            typeConfig={typeConfig}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
