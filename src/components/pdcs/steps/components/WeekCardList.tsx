'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';

interface WeekCardListProps {
    pdcWeeks: any[];
    selectedTrimestre: number | null;
}

export function WeekCardList({ pdcWeeks, selectedTrimestre }: WeekCardListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pdcWeeks.length > 0 ? pdcWeeks.map((week, idx) => (
                <div
                    key={week.id}
                    className="p-5 bg-white rounded-3xl border border-slate-100 flex items-center gap-6 shadow-soft group hover:border-blue-100 hover:shadow-premium transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    <div className="size-16 bg-blue-600 text-white rounded-[1.5rem] flex flex-col items-center justify-center shrink-0 shadow-xl shadow-blue-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                        <span className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-80">SEM</span>
                        <span className="text-2xl font-black leading-none">{week.semana}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                        <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">Periodo Lectivo</h4>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[8px] opacity-60 bg-slate-50 border-slate-100">Mes {week.mes} del Trim. {selectedTrimestre}</Badge>
                        </div>
                    </div>
                    <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all shrink-0 border border-transparent group-hover:border-blue-100">
                        <span className="material-symbols-rounded text-xl font-black">arrow_forward</span>
                    </div>
                </div>
            )) : (
                <div className="md:col-span-2 py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100 opacity-60">
                    <div className="size-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-200">
                        <span className="material-symbols-rounded text-4xl">event_upcoming</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Esperando configuración</h4>
                    <p className="text-xs text-slate-300 font-bold max-w-[240px] mx-auto mt-2 italic">Define el trimestre y mes para generar las semanas de trabajo.</p>
                </div>
            )}
        </div>
    );
}
