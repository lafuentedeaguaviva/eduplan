'use client';

import React from 'react';
import { EvaluacionTab } from '@/hooks/useCriteriosEvaluacion';
import { TAB_CONFIG } from './CriteriosTabs';
import { 
    Tag, 
    Quote, 
    ClipboardCheck, 
    Package, 
    Zap,
    GraduationCap,
    ArrowRight,
    MousePointer2
} from 'lucide-react';

interface CriteriosItemDetailProps {
    tab: EvaluacionTab;
    item: any;
    onPush: (item: any) => void;
    selectedType?: number; // tipo_pdc_id
}

export const CriteriosItemDetail: React.FC<CriteriosItemDetailProps> = ({ tab, item, onPush, selectedType }) => {
    if (!item) return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
            <div className="size-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6 text-slate-200">
                <MousePointer2 className="w-10 h-10" />
            </div>
            <h4 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-2">Sin selección</h4>
            <p className="text-slate-400 font-medium text-xs max-w-[180px] mx-auto">Selecciona un elemento de la biblioteca para ver sus detalles específicos.</p>
        </div>
    );

    const config = TAB_CONFIG[tab];
    const Icon = config.icon;

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden flex flex-col h-full group/detail">
            {/* Header */}
            <div className={`px-8 py-7 flex items-center justify-between border-b border-slate-100 ${config.bg}`}>
                <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center shadow-sm border border-white`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">Ficha Técnica</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">Referencia Curricular</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Main Content */}
                <div className="space-y-5">
                    <div className="flex items-start gap-3">
                        <div className="size-8 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 mt-1 border border-slate-100">
                            <Tag className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre / Verbo</p>
                            <p className="text-base font-black text-slate-900 leading-tight">
                                {item.nombre_ser || item.verbo_saber || item.verbo || item.nombre_adaptacion}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 relative overflow-hidden group">
                        <Quote className="absolute -top-2 -right-2 w-12 h-12 text-slate-200 opacity-20 rotate-12 transition-transform group-hover:scale-110" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 relative z-10">
                            {tab === 'saber' ? 'Evidencia' : tab === 'hacer' ? 'Producto' : 'Descripción'}
                        </p>
                        <p className="text-sm text-slate-600 font-bold leading-relaxed italic relative z-10">
                            "{item.evidencia || item.producto || item.descripcion || item.redactado}"
                        </p>
                    </div>
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 gap-3">
                    {item.instrumento_sugerido && (
                        <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100/40 flex items-center gap-3">
                            <ClipboardCheck className="w-4 h-4 text-blue-500 shrink-0" />
                            <div>
                                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Instrumento</p>
                                <p className="text-xs font-black text-blue-700">{item.instrumento_sugerido}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Examples */}
                {(item.ejemplo_inicial || item.ejemplo_primaria || item.ejemplo_secundaria || item.ejemplo_multigrado) && (
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contextualización</h4>
                        </div>
                        <div className="space-y-3">
                            {selectedType === 1 && item.ejemplo_inicial && (
                                <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100/30">
                                    <span className="text-[10px] font-black text-pink-600 uppercase tracking-widest block mb-2">Nivel Inicial</span>
                                    <p className="text-xs text-slate-500 leading-relaxed font-bold italic">"{item.ejemplo_inicial}"</p>
                                </div>
                            )}
                            {selectedType === 2 && item.ejemplo_primaria && (
                                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/30">
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">Primaria</span>
                                    <p className="text-xs text-slate-500 leading-relaxed font-bold italic">"{item.ejemplo_primaria}"</p>
                                </div>
                            )}
                            {selectedType === 3 && item.ejemplo_secundaria && (
                                <div className="bg-violet-50/50 p-4 rounded-2xl border border-violet-100/30">
                                    <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest block mb-2">Secundaria</span>
                                    <p className="text-xs text-slate-500 leading-relaxed font-bold italic">"{item.ejemplo_secundaria}"</p>
                                </div>
                            )}
                            {selectedType === 4 && item.ejemplo_multigrado && (
                                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/30">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Multigrado</span>
                                    <p className="text-xs text-slate-500 leading-relaxed font-bold italic">"{item.ejemplo_multigrado}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / CTA */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto">
                <button
                    onClick={() => onPush(item)}
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 group/btn shadow-lg shadow-slate-200"
                >
                    <span>Llevar a mi Panel</span>
                    <div className="size-8 bg-white/10 rounded-xl flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </button>
            </div>
        </div>
    );
};
