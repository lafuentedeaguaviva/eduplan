'use client';

import React from 'react';
import { EvaluacionTab } from '@/hooks/useCriteriosEvaluacion';
import { TAB_CONFIG } from './CriteriosTabs';
import { 
    Inbox, 
    Edit, 
    Trash2, 
    ChevronRight 
} from 'lucide-react';

interface CriteriosSavedListProps {
    tab: EvaluacionTab;
    items: any[];
    onEdit: (item: any) => void;
    onDelete: (id: number) => void;
}

export const CriteriosSavedList: React.FC<CriteriosSavedListProps> = ({ tab, items, onEdit, onDelete }) => {

    if (items.length === 0) return (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] opacity-50 h-full">
            <div className="size-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                <Inbox className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">No hay evaluaciones guardadas todavía</p>
        </div>
    );

    const config = TAB_CONFIG[tab];
    const Icon = config.icon;

    return (
        <div className="space-y-3">
            {items.map((item, idx) => {
                const id = item.id_ser ?? item.id_saber ?? item.id_hacer ?? item.id_adaptacion_evaluacion ?? `saved-${idx}`;
                
                // Get title based on tab specification
                let title = '—';
                if (tab === 'ser') title = item.nombre_ser;
                else if (tab === 'saber') title = item.verbo_saber;
                else if (tab === 'hacer') title = item.verbo;
                else if (tab === 'adaptacion') title = item.nombre_adaptacion;

                title = title || '—';

                return (
                    <div
                        key={id}
                        className="group bg-white/80 backdrop-blur-sm rounded-[2rem] border-2 border-slate-50 p-5 flex items-center justify-between gap-5 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-slate-200 hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <div className={`size-12 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center shrink-0 shadow-sm border border-white group-hover:scale-110 transition-transform duration-500`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase truncate mb-1.5">
                                    {title}
                                </h4>
                                <p className="text-[11px] text-slate-500 font-bold truncate italic leading-relaxed opacity-60">
                                    {item.redactado}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 transition-all duration-300">
                            <button
                                onClick={() => onEdit(item)}
                                className="size-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-95 flex items-center justify-center shadow-sm"
                                title="Editar"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(id)}
                                className="size-10 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center shadow-sm"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
