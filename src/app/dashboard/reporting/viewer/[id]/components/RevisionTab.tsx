'use client';

import React, { useState, useEffect } from 'react';
import { Pdc, FullReportData } from '@/types';
import { PdcRevisionesService, PdcRevision } from '@/services/pdc-revisiones.service';
import { useReviewFeatureAccess } from '@/hooks/useReviewFeatureAccess';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const COMPONENTS = [
    { id: 'aprendizaje', label: 'Objetivos de aprendizaje' },
    { id: 'contenidos', label: 'Contenidos' },
    { id: 'practica', label: 'Momento de Aprendizaje Práctica' },
    { id: 'teoria', label: 'Momento de Aprendizaje Teoría' },
    { id: 'produccion', label: 'Momento de Aprendizaje Producción' },
    { id: 'valoracion', label: 'Momento de Aprendizaje Valorar' },
    { id: 'criterio_ser', label: 'Criterio de Evaluación Ser' },
    { id: 'criterio_saber', label: 'Criterio de Evaluación Saber' },
    { id: 'criterio_hacer', label: 'Criterio de Evaluación Hacer' },
    { id: 'recursos', label: 'Recursos' },
    { id: 'fuentes', label: 'Fuentes' },
    { id: 'adaptaciones_gral', label: 'Adaptaciones generales' },
    { id: 'adaptaciones_esp', label: 'Adaptaciones especiales' },
    { id: 'presentacion', label: 'Presentación general' },
];

interface RevisionTabProps {
    pdcId: string;
    initialPdc: Pdc;
    fullReportData: FullReportData;
}

export default function RevisionTab({ pdcId, initialPdc, fullReportData }: RevisionTabProps) {
    const { hasAccess, isDirector } = useReviewFeatureAccess();
    const [revision, setRevision] = useState<PdcRevision | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Auto-Evaluación State
    const [evaluations, setEvaluations] = useState<Record<string, { status: 'observado' | 'aceptado' | null, comment: string }>>(
        COMPONENTS.reduce((acc, comp) => ({ ...acc, [comp.id]: { status: null, comment: '' } }), {})
    );

    useEffect(() => {
        loadRevision();
        // Cargar auto-evaluación de localStorage si existe
        const saved = localStorage.getItem(`self_eval_${pdcId}`);
        if (saved) {
            try {
                setEvaluations(JSON.parse(saved));
            } catch (e) {
                console.error("Error parsing saved self-evaluation");
            }
        }
    }, [pdcId]);

    async function loadRevision() {
        try {
            setLoading(true);
            const { data: userRes } = await (await import('@/lib/database')).db.auth.getUser();
            if (!userRes.user) return;

            const revisions = await PdcRevisionesService.getTeacherSubmissions(userRes.user.id);
            const current = revisions.find(r => r.pdc_origen_id === pdcId);
            setRevision(current || null);
        } catch (error) {
            console.error("Error loading revision:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleUpdateSelfEval = (compId: string, status: 'observado' | 'aceptado', comment?: string) => {
        const newEvals = {
            ...evaluations,
            [compId]: { 
                status: status === evaluations[compId].status ? null : status, 
                comment: comment !== undefined ? comment : evaluations[compId].comment 
            }
        };
        setEvaluations(newEvals);
        localStorage.setItem(`self_eval_${pdcId}`, JSON.stringify(newEvals));
    };

    const handleUpdateComment = (compId: string, comment: string) => {
        const newEvals = {
            ...evaluations,
            [compId]: { ...evaluations[compId], comment }
        };
        setEvaluations(newEvals);
        localStorage.setItem(`self_eval_${pdcId}`, JSON.stringify(newEvals));
    };

    const handleSendToReview = async () => {
        setIsSubmitting(true);
        try {
            const { data: userRes } = await (await import('@/lib/database')).db.auth.getUser();
            if (!userRes.user) throw new Error("No autenticado");

            const dir = await PdcRevisionesService.previewDirector(pdcId, (initialPdc as any).nivel);
            
            if (!confirm(`El sistema enviará tu PDC para revisión oficial al director: ${dir.nombre}. ¿Deseas proceder?`)) {
                setIsSubmitting(false);
                return;
            }

            await PdcRevisionesService.submitForReview(
                pdcId,
                userRes.user.id,
                initialPdc.nombre_pdc || 'Sin Nombre',
                (initialPdc as any).grado || 'No especificado',
                (initialPdc as any).nivel || 'No especificado',
                fullReportData
            );
            toast.success("PDC enviado a revisión correctamente.");
            await loadRevision();
        } catch (error: any) {
            console.error("Error al enviar a revisión:", error);
            toast.error(error.message || "Error al enviar a revisión.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="size-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando estado de revisión...</p>
            </div>
        );
    }

    const completedCount = Object.values(evaluations).filter(e => e.status !== null).length;

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up">
            {/* Status & Action Card */}
            <div className="glass-premium rounded-[3rem] p-10 border-white/50 shadow-luxe relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl -mr-32 -mt-32"></div>
                
                <div className="relative z-10 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Estado del Trámite</h3>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    !revision ? "bg-slate-100 text-slate-500 border-slate-200" :
                                    revision.pdc_estado === 'Finalizado' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    revision.estado === 'enviado' ? "bg-blue-50 text-blue-600 border-blue-100 animate-pulse" :
                                    revision.estado === 'revisado' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    "bg-rose-50 text-rose-600 border-rose-100"
                                )}>
                                    {!revision ? 'Pendiente de Envío' : 
                                     revision.pdc_estado === 'Finalizado' ? 'Finalizado' :
                                     revision.estado === 'enviado' ? 'En Revisión (Director)' :
                                     revision.estado === 'revisado' ? 'Revisado' : 'Observado'}
                                </div>
                                {revision && (
                                    <span className="text-[10px] text-slate-400 font-bold">Versión {revision.version}</span>
                                )}
                            </div>
                        </div>

                        {!revision && (
                            <button
                                onClick={handleSendToReview}
                                disabled={isSubmitting || completedCount < COMPONENTS.length}
                                className={cn(
                                    "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl",
                                    completedCount < COMPONENTS.length 
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
                                )}
                            >
                                {isSubmitting ? (
                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-rounded text-lg">send</span>
                                )}
                                {isSubmitting ? 'Enviando...' : 'Enviar al Director'}
                            </button>
                        )}
                    </div>

                    <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100/50 flex items-start gap-4">
                        <span className="material-symbols-rounded text-amber-500 mt-0.5">info</span>
                        <div className="space-y-1">
                            <p className="text-xs font-black text-amber-700 uppercase">Instrucciones de Auto-Revisión</p>
                            <p className="text-[11px] text-amber-600 font-medium leading-relaxed">
                                Antes de enviar el PDC, realiza una revisión exhaustiva de cada componente pedagógico. 
                                Marca como <b>Aceptado</b> si cumple con los estándares o <b>Observado</b> si crees que requiere mejoras. 
                                {completedCount < COMPONENTS.length && (
                                    <span className="block mt-2 font-black">Faltan {COMPONENTS.length - completedCount} componentes por revisar.</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Self-Evaluation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {COMPONENTS.map((comp) => (
                    <div key={comp.id} className="glass-premium rounded-[2rem] p-6 border-white/50 shadow-soft space-y-4 hover:shadow-premium transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest truncate pr-4">{comp.label}</h4>
                            <div className={cn(
                                "size-5 rounded flex items-center justify-center border transition-all",
                                evaluations[comp.id].status === 'aceptado' ? "bg-emerald-500 border-emerald-500 text-white" :
                                evaluations[comp.id].status === 'observado' ? "bg-rose-500 border-rose-500 text-white" :
                                "border-slate-200 bg-slate-50"
                            )}>
                                {evaluations[comp.id].status && (
                                    <span className="material-symbols-rounded text-[14px] font-black">
                                        {evaluations[comp.id].status === 'aceptado' ? 'check' : 'priority_high'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => handleUpdateSelfEval(comp.id, 'aceptado')}
                                className={cn(
                                    "flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                                    evaluations[comp.id].status === 'aceptado' 
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                                    : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                                )}
                            >
                                <span className="material-symbols-rounded text-sm">done_all</span>
                                Aceptado
                            </button>
                            <button 
                                onClick={() => handleUpdateSelfEval(comp.id, 'observado')}
                                className={cn(
                                    "flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                                    evaluations[comp.id].status === 'observado' 
                                    ? "bg-rose-50 text-rose-600 border-rose-200" 
                                    : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                                )}
                            >
                                <span className="material-symbols-rounded text-sm">visibility</span>
                                Observado
                            </button>
                        </div>

                        <textarea 
                            placeholder="Tu observación o nota interna..."
                            value={evaluations[comp.id].comment}
                            onChange={(e) => handleUpdateComment(comp.id, e.target.value)}
                            className="w-full h-20 bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-600 focus:bg-white focus:border-blue-300 transition-all outline-none resize-none italic font-medium"
                        />
                    </div>
                ))}
            </div>

            {/* Final Footer for help */}
            <div className="bg-blue-50/50 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 border border-blue-100/50 items-center justify-between">
                <div className="flex gap-6 items-start">
                    <div className="size-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-blue-500/20">
                        <span className="material-symbols-rounded text-3xl font-bold">assignment_turned_in</span>
                    </div>
                    <div className="space-y-1">
                        <h5 className="font-black text-slate-800 tracking-tight">Progreso de Auto-Revisión</h5>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            Has revisado <b>{completedCount} de {COMPONENTS.length}</b> componentes críticos. 
                            La auto-revisión te ayuda a garantizar la calidad pedagógica antes de la fiscalización institucional.
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-blue-600 transition-all duration-1000" 
                            style={{ width: `${(completedCount / COMPONENTS.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-black text-blue-600">{Math.round((completedCount / COMPONENTS.length) * 100)}%</span>
                </div>
            </div>
        </div>
    );
}

