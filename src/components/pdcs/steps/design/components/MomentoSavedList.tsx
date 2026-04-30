'use client';

import React from 'react';
import { TabType } from '@/hooks/useMomentosProceso';
import { 
    Edit3, 
    Trash2, 
    Inbox,
    Activity,
    BookOpen,
    Layout,
    Target,
    Accessibility,
    Box,
    Link,
    ListTodo
} from 'lucide-react';

interface MomentoSavedListProps {
    activeTab: TabType;
    currentMomentos: Record<string, any>;
    momentos: readonly any[];
    activeAccentColor: string;
    onEdit: (item: any) => void;
    onDelete: (id: any) => void;
}

const ACCENT_STRIP: Record<string, string> = {
    'rose-600': 'bg-rose-500',
    'indigo-600': 'bg-indigo-500',
    'amber-600': 'bg-amber-500',
    'emerald-600': 'bg-emerald-500',
    'violet-600': 'bg-violet-500',
    'sky-600': 'bg-sky-500',
    'orange-600': 'bg-orange-500',
};

const TAB_ICONS: Record<string, any> = {
    practica: Activity,
    teoria: BookOpen,
    produccion: Layout,
    valoracion: Target,
    adaptaciones: Accessibility,
    recursos: Box,
    fuentes: Link,
    proceso: ListTodo
};

function getItemId(p: any): any {
    return p.id_practica ?? p.id_teoria ?? p.id_produccion ?? p.id_valoracion ??
        p.id_adaptacion_basica ?? p.id_recursos ?? p.id_fuente ?? p.id;
}

function getItemName(p: any, activeTab: string): string {
    switch (activeTab) {
        case 'practica': return p.nombre_practica || '—';
        case 'teoria': return p.nombre_estrategia_teorica || p.nombre_estrategia_teoria || '—';
        case 'produccion': return p.nombre_produccion || '—';
        case 'valoracion': return p.categoria || '—';
        case 'adaptaciones': return p.nombre_adaptacion || '—';
        case 'recursos': return p.recursos || '—';
        case 'fuentes': return p.titulo_fuente || '—';
        default: return '—';
    }
}

export function MomentoSavedList({ activeTab, currentMomentos, momentos, activeAccentColor, onEdit, onDelete }: MomentoSavedListProps) {
    const rawList = currentMomentos[activeTab];
    const list = Array.isArray(rawList) ? rawList : [];
    const activeConfig = momentos.find(m => m.id === activeTab);
    const stripColor = ACCENT_STRIP[activeAccentColor] || 'bg-slate-400';
    const Icon = TAB_ICONS[activeTab] || Box;

    return (
        <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Header */}
            <div className={`flex items-center gap-4 px-5 py-4 rounded-[1.5rem] ${activeConfig?.bg || 'bg-slate-50'} border border-white shadow-sm`}>
                <div className={`size-10 rounded-xl ${activeConfig?.bg || 'bg-slate-50'} flex items-center justify-center shadow-inner border border-white/40`}>
                    <Icon className={`w-5 h-5 ${activeConfig?.text || 'text-slate-500'}`} />
                </div>
                <div>
                    <h5 className={`text-[11px] font-black uppercase tracking-[0.2em] ${activeConfig?.text || 'text-slate-500'}`}>
                        {activeTab === 'fuentes' ? 'Fuentes Guardadas' : 'Guardados esta semana'}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-bold">{list.length} elemento{list.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3 overflow-y-auto max-h-[580px] pr-2 custom-scrollbar">
                {list.length > 0 ? (
                    list.map((p: any, index: number) => (
                        <div
                            key={getItemId(p) || `${activeTab}-${index}`}
                            className="group/card relative bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden flex items-center gap-4 p-4 animate-in slide-in-from-right-4 duration-500"
                        >
                            <div className={`w-1.5 h-10 rounded-full shrink-0 ${stripColor} opacity-20 group-hover/card:opacity-100 transition-opacity`} />
                            <div className="flex-1 min-w-0">
                                <p className={`text-[9px] font-bold uppercase tracking-widest ${activeConfig?.text || 'text-slate-400'} mb-1`}>
                                    {activeConfig?.label}
                                </p>
                                <h6 className="text-sm font-bold text-slate-900 tracking-tight leading-tight truncate">
                                    {getItemName(p, activeTab)}
                                </h6>
                            </div>
                            <div className="flex gap-2 shrink-0 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEdit(p)}
                                    className="size-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                    title="Editar"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(getItemId(p))}
                                    className="size-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-16 px-6 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200/50">
                        <div className="size-16 rounded-3xl bg-white shadow-sm mx-auto flex items-center justify-center text-slate-200 mb-4 border border-slate-100">
                            <Inbox className="w-8 h-8" />
                        </div>
                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Lista vacía</p>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            Añade contenido a tu planificación<br />para verlo aquí.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
