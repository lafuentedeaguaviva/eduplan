'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface VerbSelectorProps {
    sortedVerbos: any[];
    currentObjective: any;
    hoveredVerb: any;
    setHoveredVerb: (v: any) => void;
    showFilters: boolean;
    setShowFilters: (v: boolean) => void;
    verbFilters: any;
    setVerbFilters: (v: any) => void;
    toggleNivelFilter: (n: string) => void;
    catalogoVerbos: any[];
    onToggleVerb: (id: number) => void;
}

export function VerbSelector(props: VerbSelectorProps) {
    const {
        sortedVerbos, currentObjective, hoveredVerb, setHoveredVerb,
        showFilters, setShowFilters, verbFilters, setVerbFilters,
        toggleNivelFilter, catalogoVerbos, onToggleVerb
    } = props;

    return (
        <div className="space-y-8 relative">
            <div className="flex items-center justify-between px-1">
                <div className="space-y-1">
                    <label className="soft-label text-blue-600">Paso 3.1: Selección de Verbos</label>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Define la acción pedagógica principal</p>
                </div>
                <Button
                    variant={showFilters ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-10 px-5 gap-2"
                >
                    <span className="material-symbols-rounded text-lg">{showFilters ? 'filter_list_off' : 'filter_list'}</span>
                    {showFilters ? 'Ocultar' : 'Filtros'}
                </Button>
            </div>

            {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-5 rounded-3xl border border-slate-100 animate-in slide-in-from-top-4 duration-500">
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nivel</h4>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setVerbFilters((prev: any) => ({ ...prev, niveles: [] }))}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${verbFilters.niveles.length === 0 ? 'bg-blue-600 text-white border-transparent' : 'bg-white text-slate-500 border-slate-100'}`}
                            >
                                Todos
                            </button>
                            {['Inicial', 'Primaria', 'Secundaria'].map(n => (
                                <button
                                    key={n}
                                    onClick={() => toggleNivelFilter(n)}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${verbFilters.niveles.includes(n) ? 'bg-blue-600 text-white border-transparent' : 'bg-white text-slate-500 border-slate-100'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Dominio</h4>
                        <div className="flex flex-wrap gap-2">
                            {['', 'Cognitivo', 'Afectivo', 'Psicomotor'].map(dom => (
                                <button
                                    key={dom}
                                    onClick={() => setVerbFilters((prev: any) => ({ ...prev, dominio: dom }))}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${verbFilters.dominio === dom ? 'bg-indigo-600 text-white border-transparent' : 'bg-white text-slate-500 border-slate-100'}`}
                                >
                                    {dom || 'Todos'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Profundidad</h4>
                        <div className="flex flex-wrap gap-2">
                            {['', 'Básico', 'Intermedio', 'Avanzado', 'Transversal', 'Práctico'].map(prof => (
                                <button
                                    key={prof}
                                    onClick={() => setVerbFilters((prev: any) => ({ ...prev, profundidad: prof }))}
                                    className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border-2 ${verbFilters.profundidad === prof ? 'bg-amber-600 text-white border-transparent' : 'bg-white text-slate-500 border-slate-100'}`}
                                >
                                    {prof || 'Todos'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <div className="max-h-[500px] overflow-y-auto pr-3 custom-scrollbar content-start">
                        <div className="flex flex-wrap gap-3">
                            {sortedVerbos.length > 0 ? (
                                sortedVerbos.map(v => (
                                    <button
                                        key={v.id}
                                        onMouseEnter={() => setHoveredVerb(v)}
                                        onMouseLeave={() => setHoveredVerb(null)}
                                        onClick={() => onToggleVerb(v.id)}
                                        className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border flex items-center gap-3 group ${currentObjective.verboIds.includes(v.id)
                                            ? 'bg-blue-600 text-white border-transparent shadow-glow scale-[1.02]'
                                            : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200 hover:bg-blue-50/10'
                                            }`}
                                    >
                                        {v.verbo}
                                        {currentObjective.verboIds.includes(v.id) && (
                                            <span className="material-symbols-rounded text-lg font-bold animate-in zoom-in-50">check_circle</span>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="w-full py-16 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                                    <span className="material-symbols-rounded text-slate-200 text-5xl mb-4">filter_list_off</span>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No hay verbos que coincidan</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block sticky top-8">
                    <div className={`transition-all duration-500 ${hoveredVerb || currentObjective.verboIds.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4'}`}>
                        {(() => {
                            const lastVerboId = currentObjective.verboIds[currentObjective.verboIds.length - 1];
                            const activeVerb = hoveredVerb || catalogoVerbos.find(v => v.id === lastVerboId);

                            return activeVerb ? (
                                <Card className="bg-slate-900 border-none p-6 space-y-5 text-white overflow-hidden relative group rounded-[2rem]">
                                    <div className="absolute top-0 right-0 size-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                                    <div className="relative space-y-1 pt-2">
                                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] block mb-1">Pedagogía Activa</span>
                                        <h4 className="text-xl font-black text-white uppercase tracking-tight leading-none">{activeVerb.verbo}</h4>
                                    </div>
                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-3">
                                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block">Definición Estratégica</span>
                                        <p className="text-[11px] font-bold leading-relaxed text-slate-300 italic">
                                            "{activeVerb.descripcion || 'Sin descripción disponible.'}"
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Dominio</span>
                                            <Badge variant="default" className="bg-white/10 text-white border-none py-1 block text-center">{activeVerb.dominio || 'Cognitivo'}</Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Nivel</span>
                                            <Badge variant="accent" className="py-1 block text-center bg-blue-500 text-white border-none capitalize">{activeVerb.nivel_profundidad || 'Básico'}</Badge>
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <div className="bg-slate-50/50 p-10 rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center gap-4 py-20 grayscale opacity-40">
                                    <div className="size-16 bg-white rounded-3xl shadow-sm flex items-center justify-center rotate-3">
                                        <span className="material-symbols-rounded text-slate-300 text-3xl">lightbulb</span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6">Pasa el cursor sobre un verbo para fundamentar tu elección</p>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}
