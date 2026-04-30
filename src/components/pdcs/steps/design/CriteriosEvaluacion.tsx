'use client';

import React, { useState } from 'react';
import { usePdcWizard } from '@/contexts/PdcWizardContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function CriteriosEvaluacion() {
    const {
        weekContentsMap,
        weekDesignState,
        setWeekDesignState,
        selectedType,
        updatePlanningHeader,
        weekPlanningIds
    } = usePdcWizard();

    const typeConfig = {
        1: { color: 'rose', accent: 'rose-600', light: 'rose-50' },
        2: { color: 'amber', accent: 'amber-600', light: 'amber-50' },
        3: { color: 'indigo', accent: 'indigo-600', light: 'indigo-50' },
        4: { color: 'emerald', accent: 'emerald-600', light: 'emerald-50' },
    }[selectedType || 2] || { color: 'slate', accent: 'slate-600', light: 'slate-50' };

    const sortedWeekKeys = Object.keys(weekContentsMap).sort((a, b) => Number(a) - Number(b));
    const [activeWeek, setActiveWeek] = useState<number>(
        sortedWeekKeys.length > 0 ? Number(sortedWeekKeys[0]) : 1
    );
    const [activeDimension, setActiveDimension] = useState<string>('ser');
    const [isSaving, setIsSaving] = useState(false);

    const dimensions = [
        { id: 'ser', label: 'SER (Actitudes)', icon: 'favorite', gradient: 'from-rose-500 to-pink-500', color: 'rose-500', bg: 'bg-rose-50', text: 'text-rose-600' },
        { id: 'saber', label: 'SABER (Conocimientos)', icon: 'psychology', gradient: 'from-blue-500 to-indigo-500', color: 'blue-500', bg: 'bg-blue-50', text: 'text-blue-600' },
        { id: 'hacer', label: 'HACER (Habilidades)', icon: 'construction', gradient: 'from-emerald-500 to-teal-500', color: 'emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
        { id: 'decidir', label: 'DECIDIR (Impacto)', icon: 'gavel', gradient: 'from-amber-500 to-orange-500', color: 'amber-500', bg: 'bg-amber-50', text: 'text-amber-600' }
    ];

    const currentCriterios = weekDesignState[activeWeek]?.criterios || { ser: '', saber: '', hacer: '', decidir: '' };

    const handleUpdate = (dim: string, value: string) => {
        setWeekDesignState((prev: any) => ({
            ...prev,
            [activeWeek]: {
                ...(prev[activeWeek] || {}),
                criterios: {
                    ...(prev[activeWeek]?.criterios || { ser: '', saber: '', hacer: '', decidir: '' }),
                    [dim]: value
                }
            }
        }));
    };

    const handleSave = async () => {
        const weekPlanId = weekPlanningIds?.[activeWeek];
        if (!weekPlanId || !updatePlanningHeader) return;

        setIsSaving(true);
        try {
            const fieldName = `criterio_${activeDimension}`;
            const value = (currentCriterios as any)[activeDimension];

            await updatePlanningHeader(weekPlanId, { [fieldName]: value });
            alert('¡Criterio guardado en planificación con éxito!');
        } catch (error) {
            console.error('Error al guardar criterio:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const currentActiveDimension = dimensions.find(d => d.id === activeDimension);

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            {/* 1. Header Area */}
            <div className="flex flex-col gap-2">
                <Badge variant="outline" className={`w-fit font-black uppercase tracking-[0.2em] text-[10px] text-${typeConfig.accent} bg-${typeConfig.light} border-${typeConfig.color}-100`}>
                    Paso 9: Criterios de Evaluación
                </Badge>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                            Dimensiones del Desarrollo Integral
                        </h1>
                        <p className="text-slate-500 font-medium">Define los indicadores de logro para evaluar cada dimensión.</p>
                    </div>
                </div>
            </div>

            {/* 2. Top Controls (Weeks & Dimensions) */}
            <div className="w-full space-y-4">
                <div className="flex flex-col lg:flex-row items-center gap-4">
                    {/* Weeks */}
                    <div className="p-2 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
                        {sortedWeekKeys.map(week => (
                            <button
                                key={week}
                                onClick={() => setActiveWeek(Number(week))}
                                className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all duration-300 whitespace-nowrap ${activeWeek === Number(week)
                                    ? `bg-slate-900 text-white shadow-xl`
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                                    }`}
                            >
                                Semana {week}
                            </button>
                        ))}
                    </div>

                    {/* Dimensions */}
                    <div className="flex-1 p-2 bg-white rounded-2xl border border-slate-200/50 shadow-soft flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full">
                        {dimensions.map(dim => (
                            <button
                                key={dim.id}
                                onClick={() => setActiveDimension(dim.id)}
                                className={`px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 group whitespace-nowrap ${activeDimension === dim.id ? 'bg-slate-50 text-slate-900 border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <div className={`size-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${activeDimension === dim.id ? `${dim.bg} ${dim.text}` : 'bg-slate-100 text-slate-300'}`}>
                                    <span className="material-symbols-rounded text-base">{dim.icon}</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">{dim.id}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Main Card with Grid */}
                <Card className="p-0 border-none shadow-premium bg-white min-h-[600px] overflow-hidden rounded-[2.5rem]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px] w-full">

                        {/* Info Column (4/12) */}
                        <div className={`lg:col-span-4 p-10 bg-gradient-to-br ${currentActiveDimension?.gradient} text-white relative overflow-hidden group flex flex-col`}>
                            <div className="absolute -top-12 -left-12 size-48 bg-white/10 rounded-full blur-3xl" />
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="size-16 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl">
                                        <span className="material-symbols-rounded text-4xl">{currentActiveDimension?.icon}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <Badge variant="outline" className="text-[9px] border-white/30 text-white font-black uppercase tracking-widest">Criterio de Evaluación</Badge>
                                        <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">{currentActiveDimension?.label}</h2>
                                    </div>
                                    <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 shadow-inner">
                                        <p className="text-sm font-medium leading-relaxed italic text-white/90">
                                            {currentActiveDimension?.id === 'ser' && "Se evalúan las actitudes y valores desarrollados en el proceso comunitario."}
                                            {currentActiveDimension?.id === 'saber' && "Se evalúa la comprensión teórica y crítica de los contenidos académicos."}
                                            {currentActiveDimension?.id === 'hacer' && "Se evalúa la aplicación práctica de habilidades y destrezas técnicas."}
                                            {currentActiveDimension?.id === 'decidir' && "Se evalúa el impacto transformador y la toma de decisiones en la realidad."}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/60">Semana {activeWeek} activa</p>
                                </div>
                            </div>
                        </div>

                        {/* Editor Column (8/12) */}
                        <div className="lg:col-span-8 p-12 flex flex-col gap-8 bg-white">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                    <span className="material-symbols-rounded text-blue-500">edit_note</span>
                                    Definición del Criterio
                                </h4>
                                <Badge variant="outline" className="font-black text-[9px] tracking-widest italic opacity-40">AUTO-GUARDADO</Badge>
                            </div>

                            <textarea
                                value={(currentCriterios as any)[activeDimension] || ''}
                                onChange={(e) => handleUpdate(activeDimension, e.target.value)}
                                className="flex-1 w-full bg-slate-50/50 border-2 border-slate-100 focus:border-blue-400 focus:bg-white rounded-[2.5rem] p-8 text-lg font-bold text-slate-700 transition-all outline-none shadow-inner resize-none leading-relaxed placeholder:text-slate-300"
                                placeholder={`Redacta el criterio de evaluación aquí...`}
                            />

                            <div className="flex flex-col md:flex-row items-center gap-6 mt-auto">
                                <div className="flex-1 p-5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
                                    <span className="material-symbols-rounded text-blue-400 text-lg">help</span>
                                    <p className="text-[11px] text-blue-700/70 font-bold italic leading-tight">
                                        Recuerda que los criterios deben ser medibles, observables y estar alineados al objetivo de la semana.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleSave}
                                    className="h-14 px-10 bg-slate-900 text-white rounded-2xl shadow-premium hover:shadow-xl active:scale-95 transition-all flex items-center gap-4 group uppercase tracking-[0.2em] font-black text-[10px]"
                                    disabled={isSaving}
                                >
                                    <span className="material-symbols-rounded">{isSaving ? 'sync' : 'done_all'}</span>
                                    {isSaving ? 'Guardando...' : 'Sincronizar'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
