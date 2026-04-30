'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface AreaSelectorProps {
    filteredAreas: any[];
    selectedAreas: any[];
    onToggleArea: (id: string) => void;
}

export function AreaSelector({ filteredAreas, selectedAreas, onToggleArea }: AreaSelectorProps) {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <Badge variant="outline" className="opacity-50 uppercase tracking-widest text-[10px] font-black">Selección Múltiple</Badge>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Áreas de Trabajo</h3>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed">Selecciona una o más áreas para iniciar tu planificación.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAreas.map(area => {
                    const isSelected = selectedAreas.includes(area.id);
                    return (
                        <Card
                            key={area.id}
                            onClick={() => onToggleArea(area.id)}
                            className={`p-8 relative overflow-hidden group/area border-2 transition-all duration-500 cursor-pointer ${isSelected
                                ? 'border-blue-600 shadow-premium scale-[1.02] bg-white'
                                : 'border-slate-100 hover:border-blue-200 bg-white/50'
                                }`}
                        >
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center justify-between">
                                    <Badge
                                        variant={isSelected ? 'success' : 'outline'}
                                        className={isSelected ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-50 border-slate-100'}
                                    >
                                        {area.unidad_educativa?.nombre}
                                    </Badge>
                                    {isSelected && (
                                        <div className="size-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 animate-in zoom-in-75 duration-500">
                                            <span className="material-symbols-rounded text-2xl font-black">verified</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <h3 className={`text-xl font-black leading-tight tracking-tight ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                        {area.area_conocimiento?.nombre}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 bg-blue-500 rounded-full shadow-glow animate-pulse"></div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            {(area.area_conocimiento as any).grado?.nombre}
                                            <span className="size-1 bg-slate-200 rounded-full"></span>
                                            {area.turno?.nombre}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {filteredAreas.length === 0 && (
                <div className="py-24 text-center bg-slate-50 rounded-[3.5rem] border-2 border-dashed border-slate-100 animate-in fade-in duration-700">
                    <div className="size-28 bg-white rounded-[2.5rem] shadow-premium flex items-center justify-center mx-auto mb-6 rotate-6 transition-transform hover:rotate-0 duration-500">
                        <span className="material-symbols-rounded text-6xl text-slate-200">dashboard_customize</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">Carga Curricular no encontrada</h3>
                    <p className="text-slate-400 font-medium text-sm mt-2 max-w-[320px] mx-auto italic">
                        Selecciona primero una modalidad o verifica tus áreas configuradas desde el panel administrativo.
                    </p>
                </div>
            )}
        </div>
    );
}
