'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface ObjectiveDraftProps {
    currentObjective: any;
    setCurrentObjective: (v: any) => void;
    addStrategicObjective: () => void;
}

export function ObjectiveDraft({ currentObjective, setCurrentObjective, addStrategicObjective }: ObjectiveDraftProps) {
    return (
        <div className="space-y-6 pt-6 border-t border-slate-50">
            <div className="flex items-center gap-4">
                <div className="size-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                    <span className="material-symbols-rounded text-2xl font-bold">edit_note</span>
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Borrador Final del Objetivo</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Puedes editar el resultado manualmente si es necesario</p>
                </div>
            </div>
            <textarea
                id="objective-draft-textarea"
                value={currentObjective.draft}
                onChange={(e) => setCurrentObjective((prev: any) => ({ ...prev, draft: e.target.value, isManual: true }))}
                className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-3xl p-6 text-lg font-bold min-h-[140px] focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-200 transition-all placeholder:text-slate-300 shadow-inner outline-none"
                placeholder="El objetivo se construye automáticamente con tu selección..."
            />
            <div className="flex justify-end gap-5 items-center">
                {currentObjective.contentIds.length === 0 && currentObjective.draft && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100">
                        <span className="material-symbols-rounded text-amber-500 text-lg font-bold">warning</span>
                        <p className="text-[10px] text-amber-600 font-black uppercase tracking-wider">Vincular contenido</p>
                    </div>
                )}
                <Button
                    onClick={addStrategicObjective}
                    disabled={currentObjective.contentIds.length === 0 || !currentObjective.draft}
                    variant="primary"
                    size="lg"
                    className="h-14 px-10 gap-3 text-sm rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest"
                >
                    <span className="material-symbols-rounded text-xl font-bold">save_as</span>
                    Guardar Objetivo
                </Button>
            </div>
        </div>
    );
}
