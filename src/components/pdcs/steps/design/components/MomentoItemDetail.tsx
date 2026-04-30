'use client';

import React from 'react';
import { TabType } from '@/hooks/useMomentosProceso';

interface MomentoItemDetailProps {
    activeTab: TabType;
    // Práctica, Teoría, Producción, Valoración
    selectedLibraryItem: any;
    selectedTheoryLibraryItem: any;
    selectedProduccionLibraryItem: any;
    selectedValoracionLibraryItem: any;
    // Nuevas pestañas
    selectedAdaptacionLibraryItem: any;
    selectedRecursoLibraryItem: any;
    selectedFuenteLibraryItem: any;
    // Utils
    getExampleByLevel: (item: any) => string;
    onPushToEditor: (item: any) => void;
    /** Solo para Fuentes: carga el item al editor de biblioteca para edición */
    onEditFuenteInLibrary?: (item: any) => void;
}

const TAB_CONFIG: Record<string, { gradientStyle: string; border: string; iconBg: string; icon: string; label: string }> = {
    practica: { gradientStyle: 'linear-gradient(135deg, #f43f5e, #db2777)', border: 'border-rose-100', iconBg: 'bg-rose-50 text-rose-500', icon: 'auto_fix', label: 'Actividad' },
    teoria: { gradientStyle: 'linear-gradient(135deg, #3b82f6, #4f46e5)', border: 'border-blue-100', iconBg: 'bg-blue-50 text-blue-500', icon: 'menu_book', label: 'Estrategia' },
    produccion: { gradientStyle: 'linear-gradient(135deg, #f59e0b, #ea580c)', border: 'border-amber-100', iconBg: 'bg-amber-50 text-amber-500', icon: 'construction', label: 'Producto' },
    valoracion: { gradientStyle: 'linear-gradient(135deg, #10b981, #0d9488)', border: 'border-emerald-100', iconBg: 'bg-emerald-50 text-emerald-500', icon: 'verified', label: 'Valoración' },
    adaptaciones: { gradientStyle: 'linear-gradient(135deg, #6366f1, #7c3aed)', border: 'border-indigo-100', iconBg: 'bg-indigo-50 text-indigo-500', icon: 'accessibility_new', label: 'Adaptación' },
    recursos: { gradientStyle: 'linear-gradient(135deg, #06b6d4, #0284c7)', border: 'border-cyan-100', iconBg: 'bg-cyan-50 text-cyan-500', icon: 'inventory_2', label: 'Recurso' },
    fuentes: { gradientStyle: 'linear-gradient(135deg, #f97316, #d97706)', border: 'border-orange-100', iconBg: 'bg-orange-50 text-orange-500', icon: 'import_contacts', label: 'Fuente' },
};

export function MomentoItemDetail(props: MomentoItemDetailProps) {
    const {
        activeTab,
        selectedLibraryItem, selectedTheoryLibraryItem,
        selectedProduccionLibraryItem, selectedValoracionLibraryItem,
        selectedAdaptacionLibraryItem, selectedRecursoLibraryItem, selectedFuenteLibraryItem,
        getExampleByLevel, onPushToEditor, onEditFuenteInLibrary
    } = props;

    const libraryItem =
        activeTab === 'practica' ? selectedLibraryItem :
            activeTab === 'teoria' ? selectedTheoryLibraryItem :
                activeTab === 'produccion' ? selectedProduccionLibraryItem :
                    activeTab === 'valoracion' ? selectedValoracionLibraryItem :
                        activeTab === 'adaptaciones' ? selectedAdaptacionLibraryItem :
                            activeTab === 'recursos' ? selectedRecursoLibraryItem :
                                activeTab === 'fuentes' ? selectedFuenteLibraryItem : null;

    const config = TAB_CONFIG[activeTab] || TAB_CONFIG.practica;

    // ── Estado vacío ──────────────────────────────────────────────────────────
    if (!libraryItem) return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center bg-gradient-to-b from-slate-50 to-white rounded-2xl border-2 border-dashed border-slate-100">
            <div className="size-14 rounded-2xl bg-white shadow-soft flex items-center justify-center">
                <span className="material-symbols-rounded text-3xl text-slate-200">search_off</span>
            </div>
            <div>
                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Sin Selección</p>
                <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">Usa los selectores superiores<br />para explorar la biblioteca</p>
            </div>
        </div>
    );

    // ── Derivar campos según pestaña ──────────────────────────────────────────
    const name =
        libraryItem.nombre_practica || libraryItem.nombre_estrategia_teorica ||
        libraryItem.nombre_produccion || libraryItem.nombre_adaptacion ||
        libraryItem.recursos || libraryItem.titulo_fuente ||
        libraryItem.categoria || '—';

    const description =
        libraryItem.descripcion_concreta || libraryItem.descripcion_situacion ||
        libraryItem.descripcion || libraryItem.detalle || libraryItem.redactado || '';

    const example = getExampleByLevel(libraryItem);

    return (
        <div className="flex flex-col gap-4 animate-in slide-in-from-left-4 duration-500">
            {/* Header colorido */}
            <div
                style={{ background: config.gradientStyle }}
                className="relative rounded-2xl overflow-hidden p-5 text-white shadow-lg"
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-rounded text-lg text-white/80">{config.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">{config.label} Seleccionado</span>
                    </div>
                    <h3 className="text-sm font-black leading-snug tracking-tight line-clamp-3 uppercase">{name}</h3>
                </div>
            </div>

            {/* Descripción / Detalle */}
            {description && (
                <div className={`bg-white rounded-2xl p-4 border ${config.border} shadow-soft space-y-2`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {activeTab === 'fuentes' ? 'Detalle' : 'Descripción'}
                    </p>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">{description}</p>
                </div>
            )}

            {/* Metadatos específicos por pestaña */}
            {libraryItem.proposito && (
                <div className={`bg-white rounded-2xl p-4 border ${config.border} shadow-soft space-y-2`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Propósito Pedagógico</p>
                    <p className="text-xs text-slate-700 font-bold">{libraryItem.proposito}</p>
                </div>
            )}
            
            {libraryItem.apto_para && (
                <div className={`bg-white rounded-2xl p-4 border ${config.border} shadow-soft space-y-2`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Nivel Sugerido (Apto para)</p>
                    <p className="text-xs text-slate-700 font-bold">{libraryItem.apto_para}</p>
                </div>
            )}

            {activeTab === 'fuentes' && libraryItem && (
                <div className={`bg-white rounded-2xl p-4 border ${config.border} shadow-soft space-y-3`}>
                    {libraryItem.tipo_fuente_obj?.tipo_fuente && (
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-rounded text-sm text-orange-500">category</span>
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-full">
                                {libraryItem.tipo_fuente_obj.tipo_fuente}
                            </span>
                        </div>
                    )}
                    {libraryItem.autor && <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Autor</p><p className="text-xs text-slate-700 font-bold">{libraryItem.autor}</p></div>}
                    {libraryItem.anio && <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Año</p><p className="text-xs text-slate-700">{libraryItem.anio}</p></div>}
                    {libraryItem.url && <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">URL / Enlace</p><a href={libraryItem.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 underline break-all font-medium">{libraryItem.url}</a></div>}
                </div>
            )}

            {activeTab === 'valoracion' && (libraryItem.preguntas || libraryItem.instrumento) && (
                <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 space-y-3">
                    {libraryItem.preguntas && (
                        <div>
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Preguntas de Reflexión</p>
                            <p className="text-xs text-slate-600 leading-relaxed">{libraryItem.preguntas}</p>
                        </div>
                    )}
                    {libraryItem.instrumento && (
                        <div>
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Instrumento Sugerido</p>
                            <p className="text-xs font-black text-slate-700">{libraryItem.instrumento}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Ejemplo por nivel (para tabs que lo tienen) */}
            {example && activeTab !== 'fuentes' && (
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/60 space-y-3">
                    <div className="flex items-center gap-2.5">
                        <div className={`size-7 rounded-lg flex items-center justify-center ${config.iconBg.replace(' text-', ' bg-')}`}>
                            <span className="material-symbols-rounded text-base">lightbulb</span>
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${config.iconBg.split(' ')[1]}`}>Ejemplo Contextualizado</p>
                    </div>
                    <div className="bg-white/50 rounded-xl p-4 border border-white">
                        <p className="text-xs font-medium text-slate-600 leading-relaxed italic whitespace-pre-wrap">{example}</p>
                    </div>
                </div>
            )}

            {/* CTA Buttons */}
            {activeTab === 'fuentes' ? (
                <div className="flex gap-2">
                    <button
                        onClick={() => onEditFuenteInLibrary?.(libraryItem)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all duration-200"
                    >
                        <span className="material-symbols-rounded text-base">edit</span>
                        Editar
                    </button>
                    <button
                        onClick={() => onPushToEditor(libraryItem)}
                        style={{ background: config.gradientStyle }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        <span className="material-symbols-rounded text-base">bookmark_add</span>
                        Llevar a Plan
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => onPushToEditor(libraryItem)}
                    style={{ background: config.gradientStyle }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                    <span>Llevar a Panel</span>
                    <span className="material-symbols-rounded text-base">arrow_forward</span>
                </button>
            )}
        </div>
    );
}
