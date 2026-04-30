'use client';

import React from 'react';
import { useStep9PeriodsWorkload } from '@/hooks/useStep9PeriodsWorkload';
import { WorkloadCards } from './components/WorkloadCards';
import { Badge } from '@/components/ui/Badge';

export function Step9PeriodsWorkload() {
    const {
        periodsPerWeek,
        setPeriodsPerWeek,
        savePeriods,
        typeConfig
    } = useStep9PeriodsWorkload();

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
            {/* Header section consistent with other steps */}
            <div className="flex flex-col gap-2">
                <Badge variant="outline" className={`w-fit font-black uppercase tracking-[0.2em] text-[10px] text-${typeConfig.accent} bg-${typeConfig.light} border-${typeConfig.color}-100`}>
                    Paso 10: Carga Horaria
                </Badge>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                            Carga Horaria Semanal
                        </h1>
                        <p className="text-slate-500 font-medium">Configura los periodos pedagógicos dedicados a esta área de trabajo.</p>
                    </div>
                </div>
            </div>

            <WorkloadCards
                periodsPerWeek={periodsPerWeek}
                setPeriodsPerWeek={setPeriodsPerWeek}
                savePeriods={savePeriods}
            />

            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row items-center gap-6 shadow-soft">
                <div className="size-14 bg-white rounded-2xl shadow-soft flex items-center justify-center shrink-0 text-slate-400 rotate-6 group-hover:rotate-0 transition-transform">
                    <span className="material-symbols-rounded text-3xl font-black">info</span>
                </div>
                <div className="space-y-1 text-center md:text-left">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Impacto en la Planificación Semanal</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl italic">
                        Esta información es esencial para distribuir los contenidos pedagógicos y asegurar que la carga horaria sea adecuada para el tiempo disponible en el aula.
                    </p>
                </div>
                <div className="md:ml-auto">
                    <Badge variant="outline" className="font-black text-[9px] tracking-widest uppercase opacity-40 bg-white border-slate-100">Sincronización Automática</Badge>
                </div>
            </div>
        </div>
    );
}
