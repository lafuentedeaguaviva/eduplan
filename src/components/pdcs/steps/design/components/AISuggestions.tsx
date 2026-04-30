'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface AISuggestionsProps {
    aiOptions: any[];
    onApply: (description: string) => void;
}

export function AISuggestions({ aiOptions, onApply }: AISuggestionsProps) {
    if (aiOptions.length === 0) return null;

    return (
        <Card className="bg-slate-900 p-8 text-white relative overflow-hidden group rounded-[2.5rem] border-none">
            <div className="absolute top-0 right-0 size-40 bg-blue-600/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative flex items-center gap-4 mb-8">
                <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <span className="material-symbols-rounded text-white text-2xl animate-pulse">auto_awesome</span>
                </div>
                <div className="space-y-1">
                    <h4 className="font-black text-xs text-blue-400 uppercase tracking-[0.2em] leading-none">Inteligencia Artificial</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sugerencias estratégicas generadas</p>
                </div>
            </div>
            <div className="relative space-y-4">
                {aiOptions.map(opt => (
                    <div key={opt.id} className="bg-white/5 hover:bg-white/10 p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 transition-all group/opt">
                        <p className="text-sm font-bold leading-relaxed text-slate-200">{opt.description}</p>
                        <Button
                            onClick={() => onApply(opt.description)}
                            variant="outline"
                            size="sm"
                            className="bg-white text-slate-900 border-none hover:bg-emerald-500 hover:text-white h-10 px-6 font-black uppercase text-[10px] tracking-widest shrink-0 rounded-xl"
                        >
                            Aplicar
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
    );
}
