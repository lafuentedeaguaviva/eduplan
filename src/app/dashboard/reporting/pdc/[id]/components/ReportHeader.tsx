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
}

export default function ReportHeader({ initialPdc, fullReportData }: ReportHeaderProps) {
    const { hasAccess, isDirector } = useReviewFeatureAccess();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSendToReview = async () => {
        if (!confirm('¿Estás seguro de enviar este PDC a revisión? Se guardará una versión actual y no podrás editarla en el wizard hasta que sea observada.')) {
            return;
        }

        try {
            setIsSubmitting(true);
            await PdcRevisionesService.submitForReview(
                initialPdc.id,
                initialPdc.docente_id,
                initialPdc.nombre_pdc || 'Sin Nombre',
                (initialPdc as any).grado || 'No especificado',
                (initialPdc as any).nivel || 'No especificado',
                fullReportData
            );
            toast.success("PDC enviado a revisión correctamente.");
        } catch (error: any) {
            console.error("Error al enviar a revisión:", error);
            toast.error(error.message || "Error al enviar a revisión.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <header className="glass-premium rounded-[1.5rem] md:rounded-[2.5rem] p-6 lg:p-8 border-white/50 shadow-luxe flex flex-col md:flex-row justify-between items-center gap-8 sticky top-4 z-50 animate-fade-in-up">
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
            
            <div className="flex gap-4 w-full md:w-auto">
                <button
                    onClick={() => exportToWord(initialPdc, fullReportData)}
                    className="flex-1 md:flex-none px-8 py-4 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-blue-900/5 group"
                >
                    <span className="text-blue-500 text-lg group-hover:rotate-12 transition-transform">📄</span> Microsoft Word
                </button>
                
                {hasAccess && !isDirector && (
                    <button
                        onClick={handleSendToReview}
                        disabled={isSubmitting}
                        className={cn(
                            "flex-1 md:flex-none px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group shadow-xl",
                            isSubmitting 
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                            : "bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-95"
                        )}
                    >
                        {isSubmitting ? (
                            <div className="size-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <span className="text-white text-lg group-hover:rotate-12 transition-transform">send</span>
                        )}
                        {isSubmitting ? 'Enviando...' : 'Enviar a Revisión'}
                    </button>
                )}

                <button
                    onClick={() => exportToPDF('pdc-preview', `PDC_VERIF_${initialPdc.nombre_pdc || 'report'}`, 'l')}
                    className="flex-1 md:flex-none px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:scale-[1.02] active:scale-95 group"
                >
                    <span className="text-white text-lg group-hover:scale-110 transition-transform">📥</span> Exportar PDF
                </button>
            </div>
        </header>
    );
}
