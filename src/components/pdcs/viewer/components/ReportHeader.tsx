'use client';

import Link from 'next/link';
import { Pdc, FullReportData } from '@/types';
import { exportToWord, exportToPDF } from '@/lib/exportService';
import { useReviewFeatureAccess } from '@/hooks/useReviewFeatureAccess';
import { PdcRevisionesService } from '@/services/pdc-revisiones.service';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReportHeaderProps {
    initialPdc: Pdc;
    fullReportData: FullReportData;
    viewMode: 'ia' | 'original';
    revisionStatus?: string | null;
}

export default function ReportHeader({ initialPdc, fullReportData, viewMode, revisionStatus }: ReportHeaderProps) {
    const { hasAccess, isDirector } = useReviewFeatureAccess();
    
    // Heurística para saber si la IA sigue procesando:
    // Si estamos en modo IA, y la IA fue habilitada, pero todavía hay semanas sin momentos_ia
    const isIAPending = viewMode === 'ia' && initialPdc.ia_habilitado === 1 && fullReportData.areas_trabajo.some(area => 
        area.semanas?.some(s => s.momentos_original && !s.momentos_ia)
    );
    
    const handlePrepareSubmission = () => {
        window.open(`/dashboard/pdcs/submit/${initialPdc.id}?mode=${viewMode}`, '_blank');
    };

    return (
        <header className="glass-premium rounded-[1.5rem] md:rounded-[2.5rem] p-6 lg:p-8 border-white/50 shadow-luxe flex flex-wrap xl:flex-nowrap justify-between items-center gap-6 lg:gap-8 sticky top-4 z-50 animate-fade-in-up overflow-hidden">
            <div className="flex flex-col gap-2">
                <Link href="/dashboard/pdcs" className="text-slate-400 hover:text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] transition-all inline-flex items-center gap-2 group mb-2">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver a mis PDCs
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-12 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">
                            Verificación <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">PDC</span>
                        </h1>
                        <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest opacity-70">
                            {initialPdc.nombre_pdc} • {initialPdc.gestion}
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap md:flex-row gap-4 w-full xl:w-auto items-center justify-end shrink-0">
                <button
                    onClick={() => exportToWord(initialPdc, fullReportData, viewMode)}
                    disabled={isIAPending}
                    className={`flex-1 md:flex-none px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl group bg-white border ${isIAPending ? 'border-slate-300 text-slate-400 cursor-not-allowed opacity-70' : 'hover:bg-slate-50 border-slate-100 text-slate-700 shadow-blue-900/5 hover:scale-105 active:scale-95'}`}
                >
                    {isIAPending ? (
                        <>
                            <span className="material-symbols-rounded animate-spin">sync</span> Procesando IA...
                        </>
                    ) : (
                        <>
                            <span className="text-lg transition-transform text-blue-500 group-hover:rotate-12">📄</span> Microsoft Word
                        </>
                    )}
                </button>
                
                <button
                    onClick={() => {
                        toast.promise(
                            exportToPDF('pdc-preview', `PDC_VERIF_${initialPdc.nombre_pdc || 'report'}`, 'l'),
                            {
                                loading: 'Generando PDF... por favor espera',
                                success: 'PDF generado correctamente',
                                error: 'Error al generar el PDF'
                            }
                        );
                    }}
                    disabled={isIAPending}
                    className={`flex-1 md:flex-none px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 group ${isIAPending ? 'bg-slate-400 text-white/70 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 hover:shadow-2xl hover:scale-[1.02] active:scale-95'}`}
                >
                    {isIAPending ? (
                        <>
                            <span className="material-symbols-rounded animate-spin">sync</span> Procesando IA...
                        </>
                    ) : (
                        <>
                            <span className="text-lg transition-transform text-white group-hover:scale-110">📥</span> Exportar PDF
                        </>
                    )}
                </button>
            </div>
        </header>
    );
}
