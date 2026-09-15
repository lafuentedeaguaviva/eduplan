'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface ProjectNameInputProps {
    pdcName: string;
    setPdcName: (name: string) => void;
}

export function ProjectNameInput({ pdcName, setPdcName }: ProjectNameInputProps) {
    return (
        <Card className="p-0 overflow-hidden border-none shadow-premium bg-white group relative">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 size-80 bg-blue-50/50 rounded-full blur-3xl -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 size-80 bg-indigo-50/50 rounded-full blur-3xl -ml-40 -mb-40 transition-transform duration-1000 group-hover:scale-110" />

            <div className="p-12 md:p-20 flex flex-col items-center text-center space-y-12 relative z-10">
                <div className="space-y-6">
                    <div className="relative inline-block">
                        <div className="size-32 bg-blue-600 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30 rotate-6 group-hover:rotate-0 transition-transform duration-700">
                            <span className="material-symbols-rounded text-6xl text-white">edit_calendar</span>
                        </div>
                        <Badge variant="success" className="absolute -top-3 -right-3 size-12 rounded-full border-4 border-white p-0 flex items-center justify-center shadow-xl animate-in zoom-in duration-700 delay-300">
                            <span className="material-symbols-rounded text-white text-2xl font-black">verified</span>
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        <Badge variant="accent" className="bg-blue-600/5 text-blue-600 border-blue-100/50 px-6 py-2 uppercase tracking-widest text-[10px] font-black">Paso 03: Identificación</Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight uppercase">
                            Nombre de tu Planificación
                        </h2>
                        <p className="text-slate-400 font-medium text-lg max-w-lg mx-auto leading-relaxed">
                            Asigna un título descriptivo que te permita identificar fácilmente este PDC en tu panel docente.
                        </p>
                    </div>
                </div>

                <div className="w-full max-w-2xl space-y-6">
                    <div className="relative group/input">
                        <input
                            value={pdcName}
                            onChange={(e) => setPdcName(e.target.value)}
                            className="h-24 px-12 text-3xl font-black text-center bg-slate-50/50 border-2 border-slate-100 focus:border-blue-400 focus:bg-white rounded-[2.5rem] transition-all outline-none shadow-inner placeholder:text-slate-200 w-full"
                            placeholder="Ej: Unidad 1 - El Cuerpo Humano"
                        />
                        <div className="absolute left-10 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none group-focus-within/input:text-blue-600 group-focus-within/input:opacity-100 transition-all">
                            <span className="material-symbols-rounded text-3xl">edit</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-100/50 animate-in slide-in-from-top-4 duration-500">
                            <span className="material-symbols-rounded text-amber-500 text-lg">lightbulb</span>
                            <p className="text-[10px] text-amber-700 font-black uppercase tracking-wider italic">
                                Tip: Usa nombres cortos y memorables.
                            </p>
                        </div>
                        <div className="h-px w-24 bg-slate-100"></div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] leading-none">Confirma para proceder al diseño pedagógico</p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
