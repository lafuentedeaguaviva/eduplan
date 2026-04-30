'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';

interface WeekSelectorProps {
    sortedWeekKeys: string[];
    activeWeek: number;
    setActiveWeek: (week: number) => void;
    typeConfig: any;
}

export function WeekSelector({ sortedWeekKeys, activeWeek, setActiveWeek, typeConfig }: WeekSelectorProps) {
    return (
        <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-premium flex flex-col gap-6 sticky top-24">
            <div className="flex items-center gap-3 px-2">
                <div className={`size-8 rounded-xl bg-${typeConfig.light} text-${typeConfig.accent} flex items-center justify-center`}>
                    <span className="material-symbols-rounded text-lg font-black">calendar_view_week</span>
                </div>
                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Selector Temporal</h5>
            </div>

            <div className="grid grid-cols-4 gap-3">
                {sortedWeekKeys.map(weekNumStr => {
                    const num = Number(weekNumStr);
                    const isActive = activeWeek === num;
                    return (
                        <button
                            key={weekNumStr}
                            onClick={() => setActiveWeek(num)}
                            className={`h-12 rounded-xl font-black text-sm transition-all duration-500 flex flex-col items-center justify-center border-2 ${isActive
                                ? `bg-${typeConfig.accent} border-${typeConfig.accent} text-white shadow-lg shadow-${typeConfig.color}-500/20 scale-105`
                                : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200'
                                }`}
                            title={`Semana ${num}`}
                        >
                            <span className="text-[16px] leading-none">{num}</span>
                        </button>
                    );
                })}
            </div>

            <div className="p-4 rounded-[1.5rem] bg-slate-50/50 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</span>
                    <Badge variant="outline" className="bg-white text-[9px] font-black">Planificado</Badge>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed italic">
                    Selecciona una semana para ver los contenidos asociados a tu planificación.
                </p>
            </div>
        </div>
    );
}
