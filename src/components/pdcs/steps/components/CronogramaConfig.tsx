'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CronogramaConfigProps {
    selectedMes: number | null;
    selectedTrimestre: number | null;
    pdcWeeks: any[];
    pdcDates: { inicio: string; fin: string };
    handlePdcDatesChange: (type: 'inicio' | 'fin', val: string) => void;
    addWeek: () => void;
    removeLastWeek: () => void;
}

export function CronogramaConfig({
    selectedMes,
    selectedTrimestre,
    pdcWeeks,
    pdcDates,
    handlePdcDatesChange,
    addWeek,
    removeLastWeek
}: CronogramaConfigProps) {
    return (
        <Card className="p-10 space-y-10 overflow-hidden relative group bg-white border-2 border-slate-100 shadow-soft">
            <div className="absolute top-0 right-0 size-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight uppercase">Cronograma del Plan</h3>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed">Sincroniza tu planificación con las fechas del calendario escolar.</p>
                </div>

                {selectedMes && selectedTrimestre && (
                    <div className="flex items-center bg-slate-50/80 backdrop-blur-sm rounded-[1.5rem] p-2 border border-slate-100 shadow-inner">
                        <Button
                            variant="ghost"
                            onClick={removeLastWeek}
                            className="size-10 rounded-xl hover:bg-white hover:text-rose-600 shadow-sm transition-all text-slate-400 p-0"
                        >
                            <span className="material-symbols-rounded text-xl font-black">remove</span>
                        </Button>
                        <div className="px-6 flex flex-col items-center">
                            <span className="font-black text-slate-900 text-sm leading-none">{pdcWeeks.length}</span>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Semanas</span>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={addWeek}
                            className="size-10 rounded-xl hover:bg-white hover:text-blue-600 shadow-sm transition-all text-slate-400 p-0"
                        >
                            <span className="material-symbols-rounded text-xl font-black">add</span>
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-inner relative z-10">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Fecha de Inicio</label>
                    <input
                        type="date"
                        value={pdcDates.inicio}
                        onChange={(e) => handlePdcDatesChange('inicio', e.target.value)}
                        className="soft-input w-full h-16"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Fecha de Finalización</label>
                    <input
                        type="date"
                        value={pdcDates.fin}
                        onChange={(e) => handlePdcDatesChange('fin', e.target.value)}
                        className="soft-input w-full h-16"
                    />
                </div>
            </div>
        </Card>
    );
}
