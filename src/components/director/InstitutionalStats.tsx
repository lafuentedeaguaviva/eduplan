'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface InstitutionalStatsProps {
    planningRate: number;
    executionRate: number;
    totalContents: number;
    distribution: {
        completado: number;
        en_progreso: number;
        planificado: number;
    };
}

export function InstitutionalStats({ 
    planningRate, 
    executionRate, 
    totalContents, 
    distribution 
}: InstitutionalStatsProps) {
    
    // Calculate simple SVG paths for progress
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    
    const executionOffset = circumference - (executionRate / 100) * circumference;
    const planningOffset = circumference - (planningRate / 100) * circumference;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Progress Hub */}
            <Card className="lg:col-span-4 p-8 border-none shadow-premium bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                    <span className="material-symbols-rounded text-9xl">analytics</span>
                </div>

                <div className="relative size-48">
                    {/* Background Tracks */}
                    <svg className="size-full -rotate-90">
                        <circle stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" r={radius} cx="96" cy="96" />
                        
                        {/* Planning Track (Outer) */}
                        <circle 
                            stroke="rgba(59, 130, 246, 0.3)" 
                            strokeWidth="10" 
                            strokeDasharray={circumference} 
                            strokeDashoffset={planningOffset} 
                            strokeLinecap="round" 
                            fill="transparent" 
                            r={radius} cx="96" cy="96" 
                            className="transition-all duration-1000 ease-out"
                        />

                        {/* Execution Track (Inner) */}
                        <circle 
                            stroke="#10b981" 
                            strokeWidth="10" 
                            strokeDasharray={circumference} 
                            strokeDashoffset={executionOffset} 
                            strokeLinecap="round" 
                            fill="transparent" 
                            r={radius - 12} cx="96" cy="96" 
                            className="transition-all duration-1000 ease-out delay-300"
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0">
                         <span className="text-4xl font-black">{executionRate}%</span>
                         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Ejecución</span>
                    </div>
                </div>

                <div className="mt-8 flex gap-8">
                    <div className="text-center">
                        <p className="text-2xl font-black text-blue-400">{planningRate}%</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Planificado</p>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="text-center">
                        <p className="text-2xl font-black text-emerald-400">{executionRate}%</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Ejecutado</p>
                    </div>
                </div>
            </Card>

            {/* Distribution Metrics */}
            <Card className="lg:col-span-8 p-8 border-none shadow-soft bg-white flex flex-col justify-between">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Audit Curricular Institucional</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gestión 2026 • Estado General</p>
                    </div>
                    <Badge variant="accent" className="h-8 px-4 rounded-full font-black text-[10px] uppercase">Normal</Badge>
                </div>

                <div className="space-y-6">
                    {/* Execution Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <span className="size-2 rounded-full bg-emerald-500" />
                                Contenidos Completados
                            </span>
                            <span className="text-sm font-black text-slate-900">{distribution.completado} / {totalContents}</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500 transition-all duration-1000" 
                                style={{ width: `${(distribution.completado / totalContents) * 100}%` }} 
                            />
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <span className="size-2 rounded-full bg-blue-500" />
                                En Desarrollo
                            </span>
                            <span className="text-sm font-black text-slate-900">{distribution.en_progreso} / {totalContents}</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-1000 delay-150" 
                                style={{ width: `${(distribution.en_progreso / totalContents) * 100}%` }} 
                            />
                        </div>
                    </div>

                    {/* Pending Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <span className="size-2 rounded-full bg-slate-200" />
                                Planificado (Sin inicio)
                            </span>
                            <span className="text-sm font-black text-slate-900">{distribution.planificado} / {totalContents}</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-slate-200 transition-all duration-1000 delay-300" 
                                style={{ width: `${(distribution.planificado / totalContents) * 100}%` }} 
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-50 mt-4 flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest italic group">
                    <span className="material-symbols-rounded text-lg text-emerald-500 animate-pulse">check_circle</span>
                    Basado en el reporte semanal de {totalContents} unidades de contenido registradas.
                </div>
            </Card>
        </div>
    );
}
