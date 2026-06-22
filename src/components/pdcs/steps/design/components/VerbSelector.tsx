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
                <div className="space-y-5 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-200/60 animate-in slide-in-from-top-4 duration-500 shadow-inner">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                            <span className="size-2 bg-blue-500 rounded-full animate-pulse"></span>
                            Taxonomía de Bloom
                        </h4>
                        <button 
                            onClick={() => setVerbFilters({ niveles: [], dominio: '', profundidad: '', detalle_tipo: '' })}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors"
                        >
                            Restablecer
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Dynamic Domains - Layout Reorganizado con mejor escala */}
                        {(() => {
                            const doms = Array.from(new Set(catalogoVerbos.map(v => v.dominio).filter(Boolean))).sort();
                            const cognitivo = doms.find(d => d?.toLowerCase().includes('cog'));
                            const otros = doms.filter(d => d !== cognitivo);

                            const renderCard = (dominio: string, isSmall = false) => {
                                const isCognitivo = dominio?.toLowerCase().includes('cog');
                                const isAfectivo = dominio?.toLowerCase().includes('afec');
                                const isPsicomotriz = dominio?.toLowerCase().includes('psic') || dominio?.toLowerCase().includes('mot');
                                
                                const colorClass = isCognitivo ? 'blue' : isAfectivo ? 'rose' : isPsicomotriz ? 'amber' : 'slate';
                                const icon = isCognitivo ? 'psychology' : isAfectivo ? 'favorite' : isPsicomotriz ? 'fitness_center' : 'category';
                                
                                const detalleTipos = Array.from(new Set(
                                    catalogoVerbos
                                        .filter(v => v.dominio === dominio)
                                        .map(v => v.detalle_tipo)
                                        .filter(Boolean)
                                )).sort();

                                return (
                                    <div key={dominio} className={`space-y-4 bg-white/70 ${isSmall ? 'p-4' : 'p-5'} rounded-2xl border border-${colorClass}-100/50 relative overflow-hidden group/dom h-full shadow-sm`}>
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className={`${isSmall ? 'size-6' : 'size-7'} rounded-xl bg-${colorClass}-600 flex items-center justify-center text-white shadow-lg shadow-${colorClass}-500/20`}>
                                                <span className="material-symbols-rounded text-base">{icon}</span>
                                            </div>
                                            <h5 className={`font-black text-${colorClass}-900 ${isSmall ? 'text-[10px]' : 'text-[11px]'} tracking-tight uppercase`}>{dominio}</h5>
                                        </div>
                                        
                                        {isCognitivo ? (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Niveles Básicos</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['Recordar', 'Comprender', 'Aplicar'].map(tipo => {
                                                            if (!detalleTipos.includes(tipo)) return null;
                                                            return (
                                                                <button
                                                                    key={tipo}
                                                                    onClick={() => setVerbFilters((prev: any) => ({ ...prev, detalle_tipo: tipo, dominio: dominio }))}
                                                                    className={`px-3.5 py-2 rounded-xl text-[10px] font-bold transition-all border-2 ${verbFilters.detalle_tipo === tipo && verbFilters.dominio === dominio 
                                                                        ? 'bg-blue-600 text-white border-transparent shadow-md' 
                                                                        : 'bg-white text-blue-700 border-blue-50 hover:border-blue-200'}`}
                                                                >
                                                                    {tipo}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Orden Superior</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['Analizar', 'Evaluar', 'Crear'].map(tipo => {
                                                            if (!detalleTipos.includes(tipo)) return null;
                                                            return (
                                                                <button
                                                                    key={tipo}
                                                                    onClick={() => setVerbFilters((prev: any) => ({ ...prev, detalle_tipo: tipo, dominio: dominio }))}
                                                                    className={`px-3.5 py-2 rounded-xl text-[10px] font-bold transition-all border-2 ${verbFilters.detalle_tipo === tipo && verbFilters.dominio === dominio 
                                                                        ? 'bg-indigo-700 text-white border-transparent shadow-md' 
                                                                        : 'bg-white text-indigo-700 border-indigo-50 hover:border-indigo-200'}`}
                                                                >
                                                                    {tipo}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {detalleTipos.map(tipo => (
                                                    <button
                                                        key={tipo as string}
                                                        onClick={() => setVerbFilters((prev: any) => ({ ...prev, detalle_tipo: tipo, dominio: dominio }))}
                                                        className={`px-3.5 py-2 rounded-xl text-[10px] font-bold transition-all border-2 ${verbFilters.detalle_tipo === tipo && verbFilters.dominio === dominio 
                                                            ? `bg-${colorClass}-600 text-white border-transparent shadow-md scale-105` 
                                                            : `bg-white text-${colorClass}-700 border-${colorClass}-50 hover:border-${colorClass}-200`}`}
                                                    >
                                                        {tipo as string}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            };

                            return (
                                <>
                                    {/* Columna Izquierda: Cognitivo */}
                                    <div className="md:col-span-7">
                                        {cognitivo && renderCard(cognitivo)}
                                    </div>
                                    {/* Columna Derecha: Otros (Afectivo y Psicomotor uno sobre otro) */}
                                    <div className="md:col-span-5 flex flex-col gap-4">
                                        {otros.map(dom => renderCard(dom, true))}
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    {/* Footer Filters: Mejor escala */}
                    <div className="pt-5 border-t border-slate-200/50 flex flex-wrap gap-x-10 gap-y-4">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profundidad Curricular:</span>
                            <div className="flex gap-2">
                                {['', 'Básico', 'Intermedio', 'Avanzado', 'Transversal', 'Práctico'].map(prof => (
                                    <button
                                        key={prof}
                                        onClick={() => setVerbFilters((prev: any) => ({ ...prev, profundidad: prof }))}
                                        className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border ${verbFilters.profundidad === prof ? 'bg-slate-900 text-white border-transparent shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:text-blue-600 hover:border-blue-200'}`}
                                    >
                                        {prof || 'Todas'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel Educativo:</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setVerbFilters((prev: any) => ({ ...prev, niveles: [] }))}
                                    className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border ${verbFilters.niveles.length === 0 ? 'bg-slate-900 text-white border-transparent shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:text-emerald-600 hover:border-emerald-200'}`}
                                >
                                    Todos
                                </button>
                                {['Inicial', 'Primaria', 'Secundaria'].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => toggleNivelFilter(n)}
                                        className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border ${verbFilters.niveles.includes(n) ? 'bg-slate-900 text-white border-transparent shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:text-emerald-600 hover:border-emerald-200'}`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
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
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Profundidad</span>
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
