'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';

interface TrimestreMesSelectorProps {
    selectedTrimestre: number | null;
    setSelectedTrimestre: (t: number) => void;
    selectedMes: number | null;
    setSelectedMes: (m: number) => void;
}

export function TrimestreMesSelector({
    selectedTrimestre,
    setSelectedTrimestre,
    selectedMes,
    setSelectedMes
}: TrimestreMesSelectorProps) {
    return (
        <div className="space-y-10">
            <div className="space-y-6">
                <div className="space-y-1">
                    <Badge variant="accent" className="bg-blue-600/5 text-blue-600 border-blue-100/50 uppercase tracking-widest text-[10px] font-black">Paso 02: Calendario</Badge>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Trimestre</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(t => (
                        <button
                            key={t}
                            onClick={() => setSelectedTrimestre(t)}
                            className={`h-16 rounded-[1.5rem] font-black text-xl transition-all duration-300 border-2 ${selectedTrimestre === t
                                ? 'bg-blue-600 text-white border-transparent shadow-premium scale-[1.05]'
                                : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'
                                }`}
                        >
                            {t}°
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Distribución Mensual</h3>
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(m => (
                        <button
                            key={m}
                            onClick={() => setSelectedMes(m)}
                            className={`px-6 h-16 rounded-2xl font-black text-left flex items-center justify-between transition-all duration-300 border-2 ${selectedMes === m
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200'
                                }`}
                        >
                            <span className="uppercase text-xs tracking-widest">Mes {m}</span>
                            {selectedMes === m && (
                                <div className="size-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                                    <span className="material-symbols-rounded text-lg font-black">calendar_today</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
