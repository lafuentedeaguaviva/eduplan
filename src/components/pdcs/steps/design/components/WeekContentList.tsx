'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface WeekContentListProps {
    activeWeek: number;
    weekContents: any[];
    learningObjectives: any[];
    typeConfig: any;
}

export function WeekContentList({
    activeWeek,
    weekContents,
    learningObjectives,
    typeConfig
}: WeekContentListProps) {
    const rootContents = weekContents.filter(c => {
        const isTheme = !c.padre_id;
        if (isTheme) return true;
        return !weekContents.find(p => p.id === c.padre_id);
    });

    return (
        <Card className="p-0 overflow-hidden border-none shadow-premium bg-white w-full">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-5">
                    <div className={`size-14 rounded-3xl bg-${typeConfig.accent} text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-${typeConfig.color}-500/20`}>
                        {activeWeek}
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Contenidos Académicos</h3>
                        <div className="flex items-center gap-2">
                            <span className="size-2 bg-emerald-500 rounded-full" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {weekContents.length} Elementos identificados para esta semana
                            </span>
                        </div>
                    </div>
                </div>
                <div className="hidden md:block">
                    <Badge variant="outline" className="font-black text-[10px] tracking-widest opacity-40 italic bg-white border-slate-100">SOLO LECTURA</Badge>
                </div>
            </div>

            <div className="p-8 space-y-4">
                {rootContents.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                        <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                            <span className="material-symbols-rounded text-3xl">inbox_customize</span>
                        </div>
                        <p className="text-slate-400 font-bold italic">No se han asignado contenidos específicos para esta semana.</p>
                    </div>
                ) : (
                    rootContents.map(content => {
                        const isTheme = !content.padre_id;
                        const subthemes = weekContents.filter(c => String(c.padre_id) === String(content.id));
                        const isCovered = learningObjectives.some(obj => 
                            (obj.contentIds || []).map(String).includes(String(content.id))
                        );

                        return (
                            <div key={content.id} className="space-y-3 group/content animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Main Content Card */}
                                <div className={`p-6 rounded-[2rem] border-2 transition-all duration-500 relative overflow-hidden ${isCovered
                                    ? 'bg-emerald-50 border-emerald-100/50 shadow-sm'
                                    : 'bg-white border-slate-100 hover:border-slate-200 shadow-soft'
                                    }`}>
                                    <div className="relative z-10 flex items-center justify-between gap-6">
                                        <div className="flex items-center gap-5 flex-1 min-w-0">
                                            <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${isTheme ? `bg-${typeConfig.accent} text-white` : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                <span className="material-symbols-rounded text-2xl font-black">{isTheme ? 'folder_open' : 'description'}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCovered ? 'text-emerald-500' : `text-${typeConfig.accent}`}`}>
                                                        {isTheme ? 'Tema Central' : 'Contenido Temático'}
                                                    </span>
                                                    {isCovered && (
                                                        <Badge variant="default" className="bg-emerald-500 text-white border-none text-[8px] font-black tracking-widest py-0.5 shadow-lg shadow-emerald-500/20">VINCULADO</Badge>
                                                    )}
                                                </div>
                                                <h4 className={`text-lg font-black tracking-tight leading-tight truncate ${isCovered ? 'text-emerald-900' : 'text-slate-800'}`}>
                                                    {content.titulo}
                                                </h4>
                                            </div>
                                        </div>

                                        <div className={`size-10 rounded-full flex items-center justify-center shrink-0 transition-all ${isCovered ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-50 text-slate-200'
                                            }`}>
                                            <span className="material-symbols-rounded text-xl font-bold">{isCovered ? 'check' : 'circle'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Subthemes List */}
                                {subthemes.length > 0 && (
                                    <div className="ml-12 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {subthemes.map(sub => {
                                            const isSubCovered = learningObjectives.some(obj => 
                                                (obj.contentIds || []).map(String).includes(String(sub.id))
                                            );
                                            return (
                                                <div key={sub.id} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${isSubCovered ? 'bg-emerald-50/30 border-emerald-50 text-emerald-700/80 shadow-inner' : 'bg-slate-50/50 border-slate-50 text-slate-500 hover:border-slate-100'
                                                    }`}>
                                                    <div className={`size-2 rounded-full shrink-0 ${isSubCovered ? 'bg-emerald-400 animate-pulse' : 'bg-slate-200'}`} />
                                                    <p className="text-sm font-bold tracking-tight truncate flex-1">
                                                        {sub.titulo}
                                                    </p>
                                                    {isSubCovered && (
                                                        <span className="material-symbols-rounded text-emerald-500 text-sm font-black">verified</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-8 bg-slate-50/30 border-t border-slate-100 flex items-center gap-3">
                <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-200">
                    <span className="material-symbols-rounded text-lg font-black">info</span>
                </div>
                <p className="text-[11px] font-bold text-slate-400 italic">
                    Los contenidos marcados con verde ya han sido seleccionados en el generador de objetivos estratégicos (Paso 6).
                </p>
            </div>
        </Card>
    );
}
