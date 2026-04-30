'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';

interface SemanasHeaderProps {
    typeConfig: any;
    pdcDates: { inicio: string; fin: string };
    formatDate: (date: string) => string;
}

export function SemanasHeader({ typeConfig, pdcDates, formatDate }: SemanasHeaderProps) {
    return (
        <div className="flex flex-col gap-2">
            <Badge variant="outline" className={`w-fit font-black uppercase tracking-[0.2em] text-[10px] text-${typeConfig.accent} bg-${typeConfig.light} border-${typeConfig.color}-100`}>
                Paso 7: Distribución de Contenidos por Semana
            </Badge>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                        Cronograma Pedagógico Semanal
                    </h1>
                    <p className="text-slate-500 font-medium">Asignación temporal de los contenidos académicos seleccionados.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="px-4 py-2 text-center border-r border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Inicia</p>
                        <p className={`text-sm font-black text-${typeConfig.accent}`}>{formatDate(pdcDates.inicio)}</p>
                    </div>
                    <div className="px-4 py-2 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Culmina</p>
                        <p className="text-sm font-black text-emerald-600">{formatDate(pdcDates.fin)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
