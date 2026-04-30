'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

interface ComplementSelectorProps {
    complementCategories: string[];
    selectedCompCategory: string;
    setSelectedCompCategory: (v: string) => void;
    filteredComplementos: any[];
    complementSearch: string;
    setComplementSearch: (v: string) => void;
    currentObjective: any;
    hoveredComplement: any;
    setHoveredComplement: (v: any) => void;
    catalogoComplementos: any[];
    onToggleComplement: (comp: any) => void;
}

export function ComplementSelector(props: ComplementSelectorProps) {
    const {
        complementCategories,
        selectedCompCategory,
        setSelectedCompCategory,
        filteredComplementos,
        complementSearch,
        setComplementSearch,
        currentObjective,
        hoveredComplement,
        setHoveredComplement,
        catalogoComplementos,
        onToggleComplement
    } = props;

    // Obtener el complemento actual (hover o seleccionado)
    const activeComp = hoveredComplement || catalogoComplementos.find(c => c.id === currentObjective.complementId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 px-1">
                    <label className="soft-label text-blue-600">Paso 3.3: Sentido Crítico (Finalidad)</label>
                    <div className="h-px w-8 bg-slate-50"></div>
                </div>

                {/* Buscador de Complementos */}
                <div className="relative group flex-1 max-w-md">
                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por propósito o palabras clave..."
                        value={complementSearch}
                        onChange={(e) => setComplementSearch(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-2.5 pl-12 pr-4 text-[11px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCompCategory('')}
                    className={`px-6 py-2.5 rounded-full text-[10px] font-black transition-all border uppercase tracking-widest ${!selectedCompCategory ? 'bg-blue-600 text-white border-transparent shadow-glow' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                >
                    Todos
                </button>
                {complementCategories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCompCategory(cat)}
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black transition-all border uppercase tracking-widest ${selectedCompCategory === cat ? 'bg-blue-600 text-white border-transparent shadow-glow' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                    {filteredComplementos.length > 0 ? (
                        filteredComplementos.map(comp => (
                            <button
                                key={comp.id}
                                onMouseEnter={() => setHoveredComplement(comp)}
                                onMouseLeave={() => setHoveredComplement(null)}
                                onClick={() => onToggleComplement(comp)}
                                className={`p-4 rounded-2xl text-left border text-[11px] font-bold leading-relaxed transition-all ${currentObjective.complementId === comp.id ? 'bg-blue-600 text-white border-transparent shadow-glow scale-[1.02]' : 'bg-white border-slate-100 hover:border-blue-100 hover:bg-blue-50/10 text-slate-600'}`}
                            >
                                <div className="flex flex-col gap-1.5">
                                    {comp.subcategoria && (
                                        <span className={`text-[8px] uppercase tracking-tighter font-black ${currentObjective.complementId === comp.id ? 'text-blue-200' : 'text-blue-500/70'}`}>
                                            {comp.subcategoria}
                                        </span>
                                    )}
                                    {comp.complemento}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                            <span className="material-symbols-rounded text-slate-300 text-4xl mb-2">search_off</span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">No hay complementos que coincidan</p>
                        </div>
                    )}
                </div>

                <div className="hidden lg:block sticky top-8">
                    {activeComp ? (
                        <Card className="bg-blue-600 border-none p-6 space-y-5 rounded-[2rem] shadow-premium text-white relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 size-24 bg-white/10 rounded-full blur-2xl"></div>
                            
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 bg-white/20 rounded-xl flex items-center justify-center">
                                            <span className="material-symbols-rounded text-white text-lg">info</span>
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-100">Detalles Pedagógicos</h4>
                                    </div>
                                    <div className="bg-white/20 px-3 py-1 rounded-full border border-white/10">
                                        <span className="text-[8px] font-black uppercase text-white">{activeComp.categoria}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <p className="text-[12px] font-bold leading-relaxed italic border-l-2 border-white/30 pl-4 py-1">
                                        "{activeComp.complemento}"
                                    </p>
                                    
                                    {activeComp.ejemplo_uso && (
                                        <div className="bg-black/10 rounded-2xl p-4 border border-white/5 space-y-2">
                                            <span className="text-[8px] font-black uppercase text-blue-200 tracking-wider">Ejemplo Sugerido:</span>
                                            <p className="text-[10px] font-medium leading-relaxed text-blue-50">
                                                {activeComp.ejemplo_uso}
                                            </p>
                                        </div>
                                    )}

                                    {activeComp.niveles_sugeridos && activeComp.niveles_sugeridos.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {activeComp.niveles_sugeridos.map((n: string) => (
                                                <span key={n} className="bg-white/10 text-[8px] font-black px-2 py-0.5 rounded-md border border-white/5">
                                                    {n}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="bg-slate-50/50 p-8 rounded-[2rem] border-2 border-dashed border-slate-100 text-center py-20 opacity-40">
                            <span className="material-symbols-rounded text-4xl text-slate-300 mb-4">analytics</span>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                                Selecciona un propósito para ver su aplicación pedagógica
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
