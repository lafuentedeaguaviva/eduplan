'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { 
    Save, ArrowLeft, Loader2, CheckCircle2, BookOpen, Layers, 
    Target, Wrench, Award, AlertCircle, FileText, Download, 
    Send, Check, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import { PdcRevisionesService } from '@/services/pdc-revisiones.service';
import { exportToWord, exportToPDF, exportEvaluationToWord } from '@/lib/exportService';
import { cn } from '@/lib/utils';
import PDFPreview from '../PDFPreview';
import { DirectorEvaluationPanel, COMPONENTS } from './DirectorEvaluationPanel';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface RevisionFormEditorProps {
    revision: any;
    onBack: () => void;
    onSaveSuccess?: () => void;
    onProgressSaved?: () => void;
    isDirectorView?: boolean;
}

export function RevisionFormEditor({ revision, onBack, onSaveSuccess, onProgressSaved, isDirectorView = false }: RevisionFormEditorProps) {
    const [snapshot, setSnapshot] = useState(revision.pdc_snapshot || {});
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [evaluations, setEvaluations] = useState<Record<string, { level: number, status: 'aprobado' | 'observado' | null, comment: string, useCustomComment: boolean }>>(() => {
        const initial: any = {};
        COMPONENTS.forEach(c => {
            initial[c.id] = { level: 0, status: null, comment: '', useCustomComment: false };
        });
        return revision.observaciones?.evaluations || initial;
    });

    const evaluationStats = React.useMemo(() => {
        const total = COMPONENTS.length;
        let evaluated = 0;
        let observedCount = 0;
        let sum = 0;

        Object.values(evaluations).forEach(e => {
            if (e.level > 0) {
                evaluated++;
                sum += e.level;
                if (e.level <= 2) observedCount++;
            }
        });

        const isComplete = evaluated === total;
        const dictamen = isComplete ? (observedCount === 0 ? "Aprobado sin observaciones" : `Observado (${observedCount} hallazgos)`) : "Evaluación Incompleta";
        const average = evaluated > 0 ? (sum / evaluated).toFixed(2) : "0.00";

        return { total, evaluated, observedCount, isComplete, dictamen, average };
    }, [evaluations]);

    const [isSavingEvaluation, setIsSavingEvaluation] = useState(false);
    const [isSavingProgress, setIsSavingProgress] = useState(false);
    const [confirmReturnOpen, setConfirmReturnOpen] = useState(false);

    const handleSaveEvaluationProgress = async () => {
        setIsSavingProgress(true);
        try {
            const payload = {
                evaluations,
                stats: evaluationStats
            };
            
            await PdcRevisionesService.updateReviewStatus(revision.id, revision.director_id, revision.estado, payload);
            
            // Also update the local revision object to avoid stale state if opened again without list refresh
            revision.observaciones = payload;

            toast.success("Progreso de evaluación guardado");
            if (onProgressSaved) {
                onProgressSaved();
            }
        } catch (error: any) {
            toast.error("Error al guardar el progreso", { description: error.message });
        } finally {
            setIsSavingProgress(false);
        }
    };

    const handleSaveEvaluation = async () => {
        setIsSavingEvaluation(true);
        try {
            const payload = {
                evaluations,
                stats: evaluationStats
            };
            const nuevoEstado = evaluationStats.observedCount === 0 ? 'aprobado' : 'observado';
            
            await PdcRevisionesService.updateReviewStatus(revision.id, revision.director_id, nuevoEstado, payload);
            toast.success("Evaluación guardada y PDC retornado exitosamente");
            setIsPanelOpen(false);
            setConfirmReturnOpen(false);
            onSaveSuccess?.();
        } catch (error: any) {
            toast.error("Error al guardar la evaluación", { description: error.message });
        } finally {
            setIsSavingEvaluation(false);
        }
    };
    
    useEffect(() => {
        console.log("[RevisionFormEditor] Snapshot loaded:", snapshot);
    }, [snapshot]);

    const isReadOnly = isDirectorView ? (revision.estado !== 'enviado') : (revision.estado === 'enviado' || revision.estado === 'revisado' || revision.estado === 'aprobado');

    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [confirmSendOpen, setConfirmSendOpen] = useState(false);
    const [sending, setSending] = useState(false);

    // ─── AUTO-GUARDADO (Debounce 2s) ───
    useEffect(() => {
        if (!isDirty || isReadOnly) return;

        const timer = setTimeout(async () => {
            await handleSave(true); // Guardado silencioso
        }, 2000);

        return () => clearTimeout(timer);
    }, [snapshot, isDirty, isReadOnly]);

    const handleUpdateField = (path: string, value: any) => {
        if (isReadOnly) return;
        setSnapshot((prev: any) => ({ ...prev, [path]: value }));
        setIsDirty(true);
    };

    const handleUpdateArea = (idx: number, field: string, value: any) => {
        if (isReadOnly) return;
        const newAreas = [...snapshot.areas_trabajo];
        newAreas[idx][field] = value;
        handleUpdateField('areas_trabajo', newAreas);
    };

    const handleUpdateSemana = (areaIdx: number, semIdx: number, field: string, value: any) => {
        if (isReadOnly) return;
        const newAreas = [...snapshot.areas_trabajo];
        newAreas[areaIdx].semanas[semIdx][field] = value;
        handleUpdateField('areas_trabajo', newAreas);
    };

    const handleUpdateContenido = (areaIdx: number, semIdx: number, contIdx: number, field: string, value: any) => {
        if (isReadOnly) return;
        const newAreas = [...snapshot.areas_trabajo];
        newAreas[areaIdx].semanas[semIdx].semana_contenido_hier[contIdx][field] = value;
        handleUpdateField('areas_trabajo', newAreas);
    };

    const handleUpdateContenidoChild = (areaIdx: number, semIdx: number, contIdx: number, childIdx: number, field: string, value: any) => {
        if (isReadOnly) return;
        const newAreas = [...snapshot.areas_trabajo];
        newAreas[areaIdx].semanas[semIdx].semana_contenido_hier[contIdx].children[childIdx][field] = value;
        handleUpdateField('areas_trabajo', newAreas);
    };

    const handleSave = async (silent = false) => {
        if ((!isDirty && silent) || isReadOnly) return;
        setSaving(true);
        try {
            await PdcRevisionesService.updateSnapshotByPdcId(revision.pdc_origen_id, snapshot);
            setIsDirty(false);
            if (!silent) toast.success("¡Snapshot Guardado!");
        } catch (error: any) {
            toast.error("Error al guardar", { description: error.message });
        } finally {
            setSaving(false);
        }
    };

    const [directorPreview, setDirectorPreview] = useState<{ id: string, nombre: string } | null>(null);

    const handlePreviewSend = async () => {
        if (isReadOnly) return;
        setSending(true); // show loader on button
        try {
            const dir = await PdcRevisionesService.previewDirector(revision.pdc_origen_id, revision.nivel);
            setDirectorPreview(dir);
            setConfirmSendOpen(true);
        } catch (error: any) {
            toast.error("Error al buscar director", { description: error.message });
        } finally {
            setSending(false);
        }
    };

    const handleSendToDirector = async () => {
        if (isReadOnly || !directorPreview) return;
        
        setSending(true);
        try {
            // Primero guardamos cualquier cambio pendiente
            await handleSave(true);
            // Luego enviamos oficialmente
            await PdcRevisionesService.sendToDirector(revision.id);
            toast.success("¡PDC Enviado con éxito!", { description: "El director ha sido notificado para su revisión." });
            setConfirmSendOpen(false);
            onSaveSuccess?.();
        } catch (error: any) {
            toast.error("Error al enviar", { description: error.message });
        } finally {
            setSending(false);
        }
    };

    const mockPdc = {
        ...revision,
        ...(revision.pdcs || {}),
        mes: snapshot.mes || revision.pdcs?.mes || revision.mes || 1,
        trimestre: snapshot.trimestre || revision.pdcs?.trimestre || revision.trimestre || 1,
        fecha_inicio: snapshot.fecha_inicio || revision.pdcs?.fecha_inicio || revision.fecha_inicio || '____',
        fecha_fin: snapshot.fecha_fin || revision.pdcs?.fecha_fin || revision.fecha_fin || '____',
    };

    // Aseguramos que el exportador lea el 'director' correctamente, ya que en el form se edita 'director_nombre'
    const snapshotForExport = {
        ...snapshot,
        director: snapshot.director_nombre || snapshot.director
    };

    const handleExportWord = async () => {
        const nameWithoutPdcPrefix = `Mes${snapshot.mes}_Trim${snapshot.trimestre}_${snapshot.grados}_${snapshot.niveles}_${snapshot.areas}_Oficial`.replace(/[\s\/]/g, '_');
        const wordMockPdc = { ...mockPdc, nombre_pdc: nameWithoutPdcPrefix };

        toast.promise(exportToWord(wordMockPdc, snapshotForExport), {
            loading: 'Generando documento Word...',
            success: 'Word generado con éxito',
            error: 'Error al generar Word'
        });
    };

    const handleExportPDF = async () => {
        try {
            const fullPdcName = `PDC_Mes${snapshot.mes}_Trim${snapshot.trimestre}_${snapshot.grados}_${snapshot.niveles}_${snapshot.areas}_Oficial`.replace(/[\s\/]/g, '_');
            
            // Usamos pdc-preview en lugar de pdc-official-report para que el PDF sea igual al Word
            await toast.promise(exportToPDF('pdc-preview-revision', fullPdcName, 'l'), {
                loading: 'Generando PDF de alta calidad...',
                success: 'PDF generado con éxito',
                error: (err: any) => `Error: ${err?.message || 'al generar PDF'}`
            });
        } catch (error: any) {
            console.error('Export PDF error:', error);
            toast.error(`Error crítico: ${error.message}`);
        }
    };

    const handleExportEvaluation = async () => {
        try {
            toast.promise(exportEvaluationToWord(revision, evaluations, evaluationStats), {
                loading: 'Generando documento Word...',
                success: 'Reporte de evaluación generado con éxito',
                error: 'Error al generar reporte de evaluación'
            });
        } catch (error: any) {
            toast.error('Error al generar el reporte');
        }
    };

    return (
        <div 
            className={`animate-in fade-in slide-in-from-right-8 duration-700 space-y-10 pb-40 rounded-[4rem] transition-all ease-in-out ${isPanelOpen ? 'bg-transparent' : 'p-8 bg-slate-50/30'}`}
            style={{ 
                marginRight: isPanelOpen ? 'calc(600px - 2rem)' : '0',
                marginLeft: isPanelOpen ? '-2rem' : '0'
            }}
        >
            {/* Componente Oculto para Exportación PDF (Diseño igual al Word) */}
            <PDFPreview id="pdc-preview-revision" pdc={mockPdc as any} data={snapshotForExport as any} />

            {/* Toolbar Superior Luxe con Exportaciones */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white/90 backdrop-blur-2xl p-5 rounded-[2.5rem] border border-slate-200 shadow-premium sticky top-6 z-50 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Button variant="ghost" onClick={onBack} className="gap-3 text-slate-500 font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 rounded-2xl px-6">
                        <ArrowLeft className="size-5" />
                        Atrás
                    </Button>
                    
                    <div className="h-8 w-px bg-slate-200 hidden md:block" />

                    {/* Botones de Exportación */}
                        <button
                            onClick={handleExportWord}
                            className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl group bg-white border hover:bg-slate-50 border-slate-100 text-slate-700 shadow-blue-900/5 hover:scale-105 active:scale-95"
                        >
                            <span className="text-base transition-transform text-blue-500 group-hover:rotate-12">📄</span> Microsoft Word
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 hover:shadow-2xl hover:scale-[1.02] active:scale-95"
                        >
                            <span className="text-base transition-transform text-white group-hover:scale-110">📥</span> Exportar PDF
                        </button>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    {!isReadOnly && (
                        <>
                            {/* Indicador de Auto-guardado */}
                            <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-slate-100">
                                {saving ? (
                                    <>
                                        <Loader2 className="size-3 animate-spin text-blue-500" />
                                        <span>Sincronizando...</span>
                                    </>
                                ) : isDirty ? (
                                    <>
                                        <div className="size-2 bg-amber-400 rounded-full animate-pulse" />
                                        <span>Cambios pendientes</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="size-3 text-emerald-500" />
                                        <span>Guardado</span>
                                    </>
                                )}
                            </div>

                            <Button 
                                onClick={isDirectorView ? () => {
                                    if (!evaluationStats.isComplete) {
                                        toast.error("Completa el Formulario de Evaluación antes de enviar al profesor.");
                                        setIsPanelOpen(true);
                                    } else {
                                        setConfirmReturnOpen(true);
                                    }
                                } : handlePreviewSend} 
                                disabled={sending}
                                className="bg-emerald-600 text-white rounded-[1.5rem] px-10 h-14 hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 font-black text-xs uppercase tracking-[0.3em] gap-4 transition-all active:scale-95 group"
                            >
                                {sending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                {isDirectorView ? 'Enviar al Profesor' : 'Enviar al Director'}
                            </Button>
                        </>
                    )}
                    {isDirectorView ? (
                        revision.estado !== 'revisado' && (
                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={() => setIsPanelOpen(true)}
                                    className="bg-blue-600 text-white rounded-[1.5rem] px-8 h-14 hover:bg-blue-500 shadow-xl shadow-blue-500/20 font-black text-xs uppercase tracking-[0.2em] gap-3 transition-all active:scale-95 group"
                                >
                                    <FileText className="size-5 group-hover:scale-110 transition-transform" />
                                    Formulario de Evaluación
                                </Button>
                            </div>
                        )
                    ) : (
                        ['observado', 'revisado', 'aprobado', 'verificado'].includes((revision.pdc_estado || '').toLowerCase()) && (
                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={() => setIsPanelOpen(true)}
                                    className="bg-blue-600 text-white rounded-[1.5rem] px-8 h-14 hover:bg-blue-500 shadow-xl shadow-blue-500/20 font-black text-xs uppercase tracking-[0.2em] gap-3 transition-all active:scale-95 group"
                                >
                                    <FileText className="size-5 group-hover:scale-110 transition-transform" />
                                    Ver Observaciones
                                </Button>
                            </div>
                        )
                    )}
                    {(isReadOnly && revision.estado === 'revisado') && (
                        <div className="px-6 py-2.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border border-indigo-100 flex items-center gap-2">
                            <CheckCircle2 className="size-4" />
                            Documento Evaluado
                        </div>
                    )}
                </div>
            </div>

            {/* Documento de Alta Fidelidad */}
            <div id="pdc-official-report" className="max-w-[1500px] mx-auto bg-white rounded-[5rem] border border-slate-200 shadow-luxe overflow-hidden relative">
                <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600" />
                
                <div className={`transition-all duration-500 space-y-24 ${isPanelOpen ? 'p-8 lg:p-12' : 'p-16 md:p-32'}`}>
                    {/* (Contenido del Reporte - Se mantiene igual que antes para no repetir código innecesario) */}
                    <div className="text-center space-y-10">
                        <div className="inline-flex items-center gap-4 px-8 py-3 bg-slate-50 rounded-full border border-slate-100 shadow-inner">
                            <span className="size-2 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Estado Plurinacional de Bolivia</span>
                        </div>
                        <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8] mb-4">
                            Planificación <span className="text-blue-600">Curricular</span>
                        </h2>
                        <div className="flex items-center justify-center gap-4">
                            <div className="h-px w-20 bg-slate-200" />
                            <p className="text-slate-400 font-black text-xs uppercase tracking-[0.6em]">Desarrollo Pedagógico (PDC)</p>
                            <div className="h-px w-20 bg-slate-200" />
                        </div>
                    </div>

                    {/* 1. Datos Referenciales */}
                    <div className="space-y-10">
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-4 mb-10">
                            <span className="w-12 h-1 bg-blue-600 rounded-full"></span>
                            1. Datos Referenciales
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { label: 'Distrito Educativo', value: snapshot.distritos, field: 'distritos', icon: '📍' },
                                { label: 'Unidad Educativa', value: snapshot.unidades, field: 'unidades', icon: '🏛️' },
                                { label: 'Nivel', value: snapshot.niveles, field: 'niveles', icon: '🎓' },
                                { label: 'Año de escolaridad', value: snapshot.grados, field: 'grados', icon: '📚' },
                                { label: 'Director/a', value: snapshot.director_nombre || '', field: 'director_nombre', icon: '👤', fullWidth: true },
                                { label: 'Maestro/a', value: snapshot.docente, field: 'docente', icon: '👨‍🏫', fullWidth: true },
                                { label: 'Áreas', value: snapshot.areas || '', field: 'areas', icon: '🧩', fullWidth: true },
                            ].map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className={`glass-premium rounded-[2rem] p-6 border-white/50 hover:border-blue-400 transition-all duration-500 group hover:-translate-y-2 shadow-luxe ${item.fullWidth ? 'lg:col-span-2' : ''}`}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-3xl group-hover:scale-125 transition-transform duration-500 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100">{item.icon}</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{item.label}</span>
                                    </div>
                                    <input 
                                        type="text"
                                        readOnly={isReadOnly}
                                        value={item.value || ''}
                                        onChange={(e) => handleUpdateField(item.field, e.target.value)}
                                        className="w-full bg-transparent text-sm font-black text-slate-800 tracking-tight leading-tight group-hover:text-blue-600 transition-colors uppercase outline-none placeholder-slate-300 disabled:opacity-80"
                                        placeholder="N/A"
                                    />
                                </div>
                            ))}
                            
                            {/* Time Period Luxe Card */}
                            <div className="lg:col-span-2 glass-premium rounded-[2.5rem] p-8 border-white/50 shadow-luxe flex items-center justify-between relative overflow-hidden group transition-all duration-500 hover:-translate-y-2">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl text-white shadow-xl shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                                        📅
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black text-blue-600/70 uppercase tracking-[0.3em] block mb-1">Periodo Escolar</span>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="text"
                                                readOnly={isReadOnly}
                                                value={snapshot.trimestre || ''}
                                                onChange={(e) => handleUpdateField('trimestre', e.target.value)}
                                                className="w-12 bg-transparent text-3xl font-black text-slate-900 tracking-tighter outline-none disabled:opacity-80"
                                                placeholder="1"
                                            />
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Trimestre</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right relative z-10">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-2">Vigencia Curricular</span>
                                    <div className="text-[10px] font-black tracking-[0.1em] flex items-center gap-3 justify-end">
                                        <input 
                                            type="text"
                                            readOnly={isReadOnly}
                                            value={snapshot.fecha_inicio || ''}
                                            onChange={(e) => handleUpdateField('fecha_inicio', e.target.value)}
                                            className="w-24 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 outline-none text-center disabled:opacity-80"
                                            placeholder="____-__-__"
                                        />
                                        <span className="opacity-20">→</span>
                                        <input 
                                            type="text"
                                            readOnly={isReadOnly}
                                            value={snapshot.fecha_fin || ''}
                                            onChange={(e) => handleUpdateField('fecha_fin', e.target.value)}
                                            className="w-24 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 outline-none text-center disabled:opacity-80"
                                            placeholder="____-__-__"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Desarrollo Curricular y Objetivo Holístico */}
                    <div className="space-y-16">
                        <header className="flex items-center justify-between pb-8">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-4">
                                <span className="w-12 h-1 bg-indigo-600 rounded-full"></span>
                                2. Desarrollo Curricular
                            </h2>
                            <div className="glass-premium text-indigo-600 text-[10px] font-black px-6 py-2.5 rounded-2xl border-white/50 uppercase tracking-[0.2em] shadow-luxe">
                                Reporte Analítico Digital
                            </div>
                        </header>

                        <div className="glass-premium rounded-[2.5rem] p-10 border-white/50 shadow-luxe relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></span>
                                Objetivo Holístico de Nivel
                            </h3>
                            
                            <div className="relative group/textarea z-10">
                                <AutoResizeTextarea 
                                    value={snapshot.objetivo_holistico_nivel || ''}
                                    readOnly={isReadOnly}
                                    onChange={(val: string) => handleUpdateField('objetivo_holistico_nivel', val)}
                                    className="w-full bg-slate-50/50 backdrop-blur-sm px-8 py-6 rounded-[1.5rem] border border-slate-100 italic text-slate-800 leading-relaxed text-sm font-semibold shadow-inner-white focus:outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none disabled:opacity-80"
                                    placeholder="Redacta el objetivo holístico aquí..."
                                />
                                {!isReadOnly && (
                                    <div className="absolute top-4 right-4 opacity-0 group-hover/textarea:opacity-100 transition-opacity pointer-events-none">
                                        <span className="material-symbols-rounded text-indigo-400 text-lg bg-white rounded-full p-1 shadow-sm border border-slate-100">edit_note</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 4. Desarrollo Curricular por Área */}
                        <div className="space-y-32">
                            {snapshot.areas_trabajo?.map((area: any, aIdx: number) => (
                                <div key={aIdx} className="space-y-10">
                                    <div className="relative overflow-hidden rounded-[2.5rem] border-white/50 bg-white/70 backdrop-blur-xl shadow-luxe group">
                                        {/* Area Header with Luxe Gradient */}
                                        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-10 py-8 border-b border-white/10 flex items-center justify-between relative overflow-hidden">
                                            <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none"></div>
                                            <h4 className="text-2xl font-black text-white flex items-center gap-6 relative z-10 tracking-tight uppercase">
                                                <span className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-xl text-[10px] uppercase font-black border border-white/20 shadow-inner-white tracking-widest">Área Curricular</span>
                                                {snapshot.unidades ? `${snapshot.unidades} - ` : ''}{area.nombre}
                                            </h4>
                                            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/70 relative z-10">
                                                <span>Carga Horaria: <b className="text-white bg-blue-800/40 px-3 py-1 rounded-lg ml-2">{area.periodo_semanal} hrs</b></span>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs text-left border-separate border-spacing-y-2 px-6 pb-6">
                                                <thead>
                                                    <tr className="text-slate-400 font-black uppercase text-[9px] tracking-[0.3em]">
                                                        <th className="px-6 py-6 w-[15%]">Misión / Objetivos</th>
                                                        <th className="px-6 py-6 w-[15%]">Estructura Temática</th>
                                                        <th className="px-6 py-6 w-[25%]">Momentos del Proceso Formativo</th>
                                                        <th className="px-6 py-6 w-[20%]">Recursos y Fuentes</th>
                                                        <th className="px-6 py-6 w-[25%] text-right">Resultados Esperados</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-slate-600">
                                                    {area.semanas?.length > 0 ? area.semanas.map((sem: any, sIdx: number) => (
                                                        <tr key={sIdx} className="group/row transition-all duration-500">
                                                            {sIdx === 0 && (
                                                                <td rowSpan={area.semanas.length} className="px-8 py-8 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 align-top group-hover/row:bg-white transition-all shadow-sm">
                                                                    <AutoResizeTextarea 
                                                                        value={area.objetivos_aprendizaje_ia || area.objetivos_aprendizaje || ''}
                                                                        readOnly={isReadOnly}
                                                                        onChange={(val: string) => handleUpdateArea(aIdx, 'objetivos_aprendizaje_ia', val)}
                                                                        className="w-full h-full bg-transparent text-[11px] font-bold text-slate-800 leading-relaxed italic resize-none focus:outline-none disabled:opacity-80"
                                                                        placeholder="Objetivos de aprendizaje..."
                                                                    />
                                                                </td>
                                                            )}

                                                            <td className="px-8 py-8 align-top">
                                                                <div className="inline-flex items-center px-4 py-1.5 rounded-xl bg-blue-600 text-white font-black text-[9px] mb-6 uppercase tracking-[0.2em] shadow-lg shadow-blue-500/30">
                                                                    Mes {sem.mes} - Semana {sem.semana}
                                                                </div>
                                                                <div className="space-y-6">
                                                                    {sem.semana_contenido_hier?.map((root: any, cIdx: number) => (
                                                                        <div key={cIdx} className="space-y-3">
                                                                            <div className="flex font-black text-slate-900 text-[11px] tracking-tight border-l-2 border-blue-500 pl-3">
                                                                                <span className="mr-1">{root.global_index || cIdx + 1}.</span>
                                                                                <AutoResizeTextarea 
                                                                                    value={root.titulo}
                                                                                    readOnly={isReadOnly}
                                                                                    onChange={(val: string) => handleUpdateContenido(aIdx, sIdx, cIdx, 'titulo', val)}
                                                                                    className="w-full bg-transparent outline-none resize-none disabled:opacity-80"
                                                                                />
                                                                            </div>
                                                                            {root.children?.map((child: any, childIdx: number) => (
                                                                                <div key={child.id || childIdx} className="pl-6 flex gap-2 items-start text-[10px] text-slate-500 font-medium">
                                                                                    <span className="text-blue-300 font-black opacity-40 shrink-0 mt-0.5">└</span>
                                                                                    <span className="shrink-0 mt-0.5">{root.global_index || cIdx + 1}.{child.global_sub_index}.</span>
                                                                                    <AutoResizeTextarea 
                                                                                        value={child.titulo}
                                                                                        readOnly={isReadOnly}
                                                                                        onChange={(val: string) => handleUpdateContenidoChild(aIdx, sIdx, cIdx, childIdx, 'titulo', val)}
                                                                                        className="w-full bg-transparent outline-none resize-none disabled:opacity-80 hover:text-slate-700 focus:text-slate-900 transition-colors"
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </td>

                                                            <td className="px-8 py-8 align-top bg-white/40 group-hover/row:bg-white rounded-[1.5rem] border border-transparent group-hover/row:border-blue-100 transition-all">
                                                                <AutoResizeTextarea 
                                                                    value={sem.momentos_ia || sem.momentos_original || ''}
                                                                    readOnly={isReadOnly}
                                                                    onChange={(val: string) => handleUpdateSemana(aIdx, sIdx, 'momentos_ia', val)}
                                                                    className="w-full bg-transparent text-[11px] leading-relaxed font-semibold text-slate-700 italic resize-none focus:outline-none focus:text-indigo-600 disabled:opacity-80"
                                                                    placeholder="Redacta los momentos metodológicos..."
                                                                />
                                                            </td>

                                                            <td className="px-8 py-8 align-top bg-slate-50/30 group-hover/row:bg-white rounded-[1.5rem] border border-transparent group-hover/row:border-blue-50 transition-all">
                                                                <AutoResizeTextarea 
                                                                    value={sem.recursos_fuentes_ia || sem.recursos_fuentes_original || ''}
                                                                    readOnly={isReadOnly}
                                                                    onChange={(val: string) => handleUpdateSemana(aIdx, sIdx, 'recursos_fuentes_ia', val)}
                                                                    className="w-full bg-transparent text-[11px] leading-relaxed font-semibold text-slate-500 italic resize-none focus:outline-none disabled:opacity-80"
                                                                    placeholder="Listado de recursos..."
                                                                />
                                                            </td>

                                                            {sIdx === 0 && (
                                                                <td rowSpan={area.semanas.length} className="px-8 py-8 align-top text-right">
                                                                    <div className="inline-block flex-col bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-[2rem] p-8 h-full shadow-2xl shadow-slate-900/10 max-w-[280px]">
                                                                        <span className="text-blue-400 text-[9px] font-black mb-3 block uppercase tracking-widest text-left">Criterios de Evaluación</span>
                                                                        <AutoResizeTextarea 
                                                                            value={area.criterios_evaluacion_ia || area.criterios_evaluacion || ''}
                                                                            readOnly={isReadOnly}
                                                                            onChange={(val: string) => handleUpdateArea(aIdx, 'criterios_evaluacion_ia', val)}
                                                                            className="w-full flex-1 bg-transparent text-[11px] font-bold text-white leading-relaxed text-right resize-none focus:outline-none disabled:opacity-80"
                                                                            placeholder="Resultados esperados..."
                                                                        />
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan={5} className="py-12 text-center text-slate-400 text-[10px] uppercase tracking-widest font-black">
                                                                No hay semanas registradas
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Non-Significative Adaptations Block */}
                                    {(() => {
                                        const adaptNoSig = area.adaptaciones_no_significativas_ia || area.adaptaciones_no_significativas;
                                        if (!adaptNoSig || adaptNoSig === 'No definido' || adaptNoSig === 'Ninguna') return null;
                                        
                                        return (
                                            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-900/5">
                                                <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                                    Adaptaciones Curriculares
                                                </h5>
                                                <AutoResizeTextarea 
                                                    value={adaptNoSig}
                                                    readOnly={isReadOnly}
                                                    onChange={(val: string) => handleUpdateArea(aIdx, 'adaptaciones_no_significativas_ia', val)}
                                                    className="w-full bg-transparent text-xs text-slate-600 italic font-medium leading-relaxed outline-none resize-none disabled:opacity-80"
                                                />
                                            </div>
                                        );
                                    })()}

                                    <SignificativeAdaptationsEditor 
                                        area={area} 
                                        areaIdx={aIdx} 
                                        isReadOnly={isReadOnly}
                                        onUpdateSemana={handleUpdateSemana}
                                        onUpdateArea={handleUpdateArea}
                                        onUpdateContenido={handleUpdateContenido}
                                        onUpdateContenidoChild={handleUpdateContenidoChild}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* ─── DIÁLOGO DE CONFIRMACIÓN DE ENVÍO ─── */}
            <Dialog open={confirmSendOpen} onOpenChange={setConfirmSendOpen} className="max-w-[500px] h-auto">
                <DialogContent className="rounded-[2.5rem] border-none shadow-premium p-0 overflow-hidden">
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-10 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            <Send className="size-24" />
                        </div>
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="text-3xl font-black uppercase tracking-tight">Confirmar Envío</DialogTitle>
                            <DialogDescription className="text-emerald-50 font-medium text-lg leading-relaxed mt-4">
                                ¿Estás seguro de enviar este PDC para su revisión oficial? 
                                El sistema lo enviará directamente a: <strong className="text-white block mt-2 text-xl">{directorPreview?.nombre || 'Buscando director...'}</strong>
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-10 space-y-8 bg-white">
                        <div className="flex items-start gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="size-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                                <Award className="size-7" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Director Destinatario</p>
                                <p className="text-lg font-black text-slate-900">{directorPreview?.nombre}</p>
                                <p className="text-xs text-slate-500 font-medium italic">Se enviará una notificación institucional inmediata.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-6 bg-amber-50 rounded-3xl border border-amber-100 text-amber-700">
                            <AlertTriangle className="size-6 shrink-0" />
                            <p className="text-xs font-bold leading-relaxed">
                                Una vez enviado, el documento quedará bloqueado para edición hasta que el director emita sus observaciones o aprobación.
                            </p>
                        </div>

                        <DialogFooter className="gap-4">
                            <Button variant="ghost" onClick={() => setConfirmSendOpen(false)} className="rounded-2xl font-black uppercase tracking-widest text-[10px] px-8">
                                Cancelar
                            </Button>
                            <Button 
                                onClick={handleSendToDirector} 
                                disabled={sending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-10 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20"
                            >
                                {sending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Check className="size-4 mr-2" />}
                                Sí, Enviar Ahora
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ─── DIÁLOGO DE CONFIRMACIÓN PARA DEVOLVER AL PROFESOR ─── */}
            <Dialog open={confirmReturnOpen} onOpenChange={setConfirmReturnOpen} className="max-w-[500px] h-auto">
                <DialogContent className="rounded-[2.5rem] border-none shadow-premium p-0 overflow-hidden">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            <CheckCircle2 className="size-24" />
                        </div>
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="text-3xl font-black uppercase tracking-tight">Confirmar Dictamen</DialogTitle>
                            <DialogDescription className="text-blue-50 font-medium text-lg leading-relaxed mt-4">
                                Estás a punto de enviar los resultados de la evaluación al profesor.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-10 space-y-8 bg-white">
                        <div className="flex items-start gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="size-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                                <FileText className="size-7" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dictamen Final</p>
                                <p className={cn("text-lg font-black", evaluationStats.observedCount === 0 ? "text-emerald-600" : "text-rose-600")}>
                                    {evaluationStats.dictamen}
                                </p>
                                <p className="text-xs text-slate-500 font-medium italic">
                                    Se le notificará al maestro en su bandeja de entrada.
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="gap-4">
                            <Button variant="ghost" onClick={() => setConfirmReturnOpen(false)} className="rounded-2xl font-black uppercase tracking-widest text-[10px] px-8">
                                Cancelar
                            </Button>
                            <Button 
                                onClick={handleSaveEvaluation} 
                                disabled={isSavingEvaluation}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-10 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20"
                            >
                                {isSavingEvaluation ? <Loader2 className="size-4 animate-spin mr-2" /> : <Send className="size-4 mr-2" />}
                                Enviar al Profesor
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            <DirectorEvaluationPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                evaluations={evaluations}
                setEvaluations={setEvaluations}
                isReadOnly={isReadOnly || !isDirectorView}
                onSaveAction={() => setConfirmReturnOpen(true)}
                onSaveProgress={handleSaveEvaluationProgress}
                onExport={handleExportEvaluation}
                isSaving={isSavingEvaluation}
                isSavingProgress={isSavingProgress}
                stats={evaluationStats}
            />
        </div>
    );
}

/** Componentes Internos - Se mantienen iguales **/
function SectionTitle({ icon: Icon, title, color }: { icon: any, title: string, color: string }) {
    return (
        <div className="flex items-center gap-4 mb-10">
            <div className={`size-14 rounded-2xl bg-white shadow-luxe border border-slate-100 flex items-center justify-center ${color}`}>
                <Icon className="size-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest">{title}</h3>
        </div>
    );
}

function FormField({ label, value, onChange, icon: Icon }: { label: string, value: string, onChange: (v: string) => void, icon: any }) {
    return (
        <div className="space-y-3 group/field">
            <div className="flex items-center gap-2 pl-2">
                <Icon className="size-3 text-slate-300 group-hover/field:text-blue-500 transition-colors" />
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] group-hover/field:text-slate-600 transition-colors">{label}</label>
            </div>
            <input 
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-6 bg-white rounded-3xl border-2 border-slate-100 text-sm font-black text-slate-800 shadow-sm focus:border-blue-500/30 focus:ring-8 focus:ring-blue-500/5 transition-all outline-none"
            />
        </div>
    );
}

function SignificativeAdaptationsEditor({ area, areaIdx, onUpdateSemana, onUpdateArea, onUpdateContenido, onUpdateContenidoChild, isReadOnly }: any) {
    const weeksWithAdaptations = area.semanas || [];

    const filteredWeeks = weeksWithAdaptations.filter((s:any) => {
        const val = s.adaptaciones_especiales_ia || s.adaptaciones_especiales_original;
        return val && val.trim().length > 0 && val.toLowerCase() !== 'ninguna' && val.toLowerCase() !== 'no definido' && val !== 'Sin datos previos.';
    });

    if (filteredWeeks.length === 0) return null;

    const globalEspecialAdaps = area.semanas.flatMap((w: any) => Array.isArray(w.adaptaciones_basicas) ? w.adaptaciones_basicas.filter((a: any) => a.tipo?.toLowerCase() === 'especial') : []);
    const globalSituacionEspecial = [...new Set(globalEspecialAdaps.map((a: any) => a.situacion).filter(Boolean))].join('\n\n');

    return (
        <div className="mt-8 overflow-x-auto rounded-3xl border border-emerald-200 bg-white shadow-xl shadow-emerald-900/5">
            <table className="w-full text-xs text-left border-collapse">
                <thead>
                    <tr>
                        <th colSpan={4} className="px-8 py-4 bg-emerald-600 text-white text-center font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-emerald-600/20">
                            ADAPTACIONES CURRICULARES SIGNIFICATIVAS
                        </th>
                    </tr>
                    <tr className="bg-emerald-50 text-emerald-700 font-black text-center text-[10px] uppercase tracking-widest">
                        <th className="px-4 py-4 border border-emerald-100 w-1/4">Contenidos</th>
                        <th className="px-4 py-4 border border-emerald-100 w-1/4">Discapacidad/TDH/TEA y otros</th>
                        <th className="px-4 py-4 border border-emerald-100 w-1/4">Adaptación</th>
                        <th className="px-4 py-4 border border-emerald-100 w-1/4">Criterio de evaluación</th>
                    </tr>
                </thead>
                <tbody className="text-slate-600">
                    {filteredWeeks.map((s: any, idx: number) => {
                        const sIdx = area.semanas.findIndex((orig: any) => orig.id === s.id);
                        
                        let discapacidadName = "N/A";
                        if (area.criterios_evaluacion_adaptaciones_ia || area.criterios_evaluacion_adaptaciones) {
                            const match = (area.criterios_evaluacion_adaptaciones_ia || area.criterios_evaluacion_adaptaciones).match(/Discapacidad:\s*([^\n]+)/i);
                            if (match) discapacidadName = match[1].trim();
                        }
                        if (discapacidadName === "N/A" && Array.isArray(s.adaptacion_especial) && s.adaptacion_especial.length > 0) {
                            discapacidadName = s.adaptacion_especial[0].nombre_adaptacion || s.adaptacion_especial[0].condicion || "Discapacidad";
                        }
                        const displayDiscapacidad = s.situacion_especial_ia ?? (globalSituacionEspecial || discapacidadName);

                        return (
                            <tr key={s.id} className="border-b border-emerald-50 hover:bg-emerald-50/30 transition-colors">
                                <td className="px-6 py-6 border border-emerald-100 align-top">
                                    <span className="font-black text-slate-800 block mb-2 tracking-tighter">Semana {s.semana}</span>
                                    <div className="space-y-2">
                                        {s.semana_contenido_hier?.map((root: any, cIdx: number) => (
                                            <div key={cIdx}>
                                                <div className="flex items-start font-black text-[10px] text-slate-800">
                                                    <span className="mr-1 mt-0.5">{root.global_index || cIdx + 1}.</span>
                                                    <AutoResizeTextarea 
                                                        value={root.titulo}
                                                        readOnly={isReadOnly}
                                                        onChange={(val: string) => onUpdateContenido(areaIdx, sIdx, cIdx, 'titulo', val)}
                                                        className="w-full bg-transparent outline-none resize-none hover:text-slate-600 focus:text-blue-600 transition-colors disabled:opacity-80"
                                                    />
                                                </div>
                                                {root.children?.map((child: any, childIdx: number) => (
                                                    <div key={child.id || childIdx} className="pl-3 flex items-start text-[9px] font-medium text-slate-500">
                                                        <span className="mr-1 mt-0.5">{root.global_index || cIdx + 1}.{child.global_sub_index}.</span>
                                                        <AutoResizeTextarea 
                                                            value={child.titulo}
                                                            readOnly={isReadOnly}
                                                            onChange={(val: string) => onUpdateContenidoChild(areaIdx, sIdx, cIdx, childIdx, 'titulo', val)}
                                                            className="w-full bg-transparent outline-none resize-none hover:text-slate-700 focus:text-blue-600 transition-colors disabled:opacity-80"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-6 border border-emerald-100 align-top text-[11px] font-medium">
                                    <AutoResizeTextarea 
                                        value={displayDiscapacidad || ''}
                                        readOnly={isReadOnly}
                                        onChange={(val: string) => onUpdateSemana(areaIdx, sIdx, 'situacion_especial_ia', val)}
                                        className="w-full outline-none resize-none bg-transparent italic whitespace-pre-wrap focus:text-emerald-700 disabled:opacity-80"
                                    />
                                </td>
                                <td className="px-6 py-6 border border-emerald-100 align-top text-[11px] font-medium">
                                    <AutoResizeTextarea 
                                        value={s.adaptaciones_especiales_ia || s.adaptaciones_especiales_original || ''}
                                        readOnly={isReadOnly}
                                        onChange={(val: string) => onUpdateSemana(areaIdx, sIdx, 'adaptaciones_especiales_ia', val)}
                                        className="w-full outline-none resize-none bg-transparent whitespace-pre-wrap focus:text-emerald-700 disabled:opacity-80"
                                    />
                                </td>
                                {idx === 0 && (
                                    <td rowSpan={filteredWeeks.length} className="px-6 py-6 border border-emerald-100 align-top text-slate-700 text-[11px] font-bold italic bg-emerald-50/30">
                                        <AutoResizeTextarea 
                                            value={area.criterios_evaluacion_adaptaciones_ia || area.criterios_evaluacion_adaptaciones || ''}
                                            readOnly={isReadOnly}
                                            onChange={(val: string) => onUpdateArea(areaIdx, 'criterios_evaluacion_adaptaciones_ia', val)}
                                            className="w-full bg-transparent outline-none resize-none whitespace-pre-wrap focus:text-emerald-800 disabled:opacity-80"
                                            placeholder="Describa el criterio de evaluación especial..."
                                        />
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function AutoResizeTextarea({ value, onChange, className, placeholder, ...props }: any) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`overflow-hidden ${className}`}
            placeholder={placeholder}
            rows={1}
            {...props}
        />
    );
}
