'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ModalidadSelectorProps {
    pdcTypes: any[];
    selectedType: number | null;
    onSelectType: (id: number) => void;
}

export function ModalidadSelector({ pdcTypes, selectedType, onSelectType }: ModalidadSelectorProps) {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Badge variant="accent" className="bg-blue-600/5 text-blue-600 border-blue-100/50 uppercase tracking-widest text-[10px] font-black">Paso 01: Estructura</Badge>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Modalidad</h3>
                <p className="text-slate-400 font-medium text-sm leading-relaxed">Configura el nivel educativo y la estructura base de tu PDC.</p>
            </div>

            <div className="flex flex-col gap-4">
                {pdcTypes.map(type => (
                    <Card
                        key={type.id}
                        onClick={() => onSelectType(type.id)}
                        className={`p-6 flex items-center gap-6 relative overflow-hidden transition-all duration-500 cursor-pointer border-2 group ${selectedType === type.id
                            ? 'border-blue-600 shadow-premium scale-[1.02] bg-white'
                            : 'border-slate-100 hover:border-blue-200 bg-white/50'
                            }`}
                    >
                        <div className={`size-14 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-xl relative z-10 ${selectedType === type.id
                            ? 'bg-blue-600 text-white shadow-blue-500/20 rotate-3'
                            : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
                            }`}>
                            <span className="material-symbols-rounded text-2xl font-black">{type.icon}</span>
                        </div>

                        <div className="relative z-10 flex-1">
                            <span className={`text-lg font-black block tracking-tight leading-none ${selectedType === type.id ? 'text-slate-900' : 'text-slate-500'}`}>
                                {type.name}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 block opacity-80">
                                Educación Regular
                            </span>
                        </div>

                        {selectedType === type.id && (
                            <div className="ml-auto size-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 animate-in zoom-in-50 duration-500 relative z-10">
                                <span className="material-symbols-rounded text-2xl font-black">check</span>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
