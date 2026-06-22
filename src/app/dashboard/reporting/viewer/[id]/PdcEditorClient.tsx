'use client';

import React, { useState, useEffect } from 'react';
import { Pdc, FullReportData } from '@/types';
import ReportHeader from './components/ReportHeader';
import ReferenceData from './components/ReferenceData';
import CurricularTable from './components/CurricularTable';
import PDFPreview from './components/PDFPreview';
import RevisionTab from './components/RevisionTab';
import { PdcRevisionesService } from '@/services/pdc-revisiones.service';
import { useProfile } from '@/contexts/ProfileContext';

/**
 * PdcEditorClient - Container Component
 * Rule: Separation of Concerns (Sections extracted to components)
 */
export default function PdcEditorClient({
    pdcId,
    initialPdc,
    fullReportData,
}: {
    pdcId: string,
    initialPdc: Pdc,
    fullReportData: FullReportData,
}) {
    const { activeRole } = useProfile();
    const [viewMode, setViewMode] = useState<'ia' | 'original'>('ia');
    const [activeTab, setActiveTab] = useState<'report' | 'revision'>('report');
    const [revisionStatus, setRevisionStatus] = useState<string | null>(null);
    
    const isProfesor = activeRole === 'Profesor';

    useEffect(() => {
        async function checkRevision() {
            try {
                const { data: userRes } = await (await import('@/lib/database')).db.auth.getUser();
                if (!userRes.user) return;

                // Intentar obtener la revisión para este PDC
                const revisions = await PdcRevisionesService.getTeacherSubmissions(userRes.user.id);
                const current = revisions.find(r => r.pdc_origen_id === pdcId);
                if (current) {
                    setRevisionStatus(current.estado);
                }
            } catch (e) {
                console.error("Error checking revision status:", e);
            }
        }
        checkRevision();
    }, [pdcId]);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
            {/* Mesh Gradients & Patterns */}
            <div className="absolute inset-0 bg-dot-pattern opacity-[0.1] pointer-events-none"></div>
            <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-400/10 blur-[120px] rounded-full animate-pulse-slow"></div>
            <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-indigo-400/10 blur-[120px] rounded-full animate-float"></div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8 animate-fade-in-up">
                <ReportHeader
                    initialPdc={initialPdc}
                    fullReportData={fullReportData}
                    viewMode={viewMode}
                    revisionStatus={revisionStatus}
                />

                {/* Selector de Modo de Vista y Pestañas */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
                {!isProfesor && (
                    <div className="bg-white/50 backdrop-blur-xl p-1.5 rounded-[2rem] border border-slate-200/60 shadow-luxe flex gap-2">
                        <button
                            onClick={() => setActiveTab('report')}
                            className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'report'
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 scale-105'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <span className="material-symbols-rounded text-lg">description</span>
                            Vista de Reporte
                        </button>
                        <button
                            onClick={() => setActiveTab('revision')}
                            className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'revision'
                                    ? 'bg-amber-600 text-white shadow-xl shadow-amber-500/30 scale-105'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <span className="material-symbols-rounded text-lg">fact_check</span>
                            Revisión Pedagógica
                        </button>
                    </div>
                )}

                    {activeTab === 'report' && (
                        <div className="bg-white/50 backdrop-blur-xl p-1.5 rounded-[2rem] border border-slate-200/60 shadow-luxe flex gap-2">
                            <button
                                onClick={() => setViewMode('ia')}
                                className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${viewMode === 'ia'
                                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-105'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <div className={`size-2 rounded-full ${viewMode === 'ia' ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
                                Optimización IA
                            </button>
                            <button
                                onClick={() => setViewMode('original')}
                                className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${viewMode === 'original'
                                        ? 'bg-slate-800 text-white shadow-xl shadow-slate-900/30 scale-105'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <div className={`size-2 rounded-full ${viewMode === 'original' ? 'bg-white' : 'bg-slate-300'}`} />
                                Datos Originales
                            </button>
                        </div>
                    )}
                </div>

                <main className="max-w-6xl mx-auto space-y-20 pb-20 mt-12">
                    {activeTab === 'report' ? (
                        <>
                            <ReferenceData initialPdc={initialPdc} fullReportData={fullReportData} viewMode={viewMode} />

                            <CurricularTable fullReportData={fullReportData} initialPdc={initialPdc} viewMode={viewMode} />

                            <section className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-20 border-t border-slate-200">
                                <SignatureBlock name={fullReportData.director} role="Director de Unidad Educativa" />
                                <SignatureBlock name={fullReportData.docente} role="Firma del Maestro/a" />
                            </section>
                        </>
                    ) : (
                        <RevisionTab
                            pdcId={pdcId}
                            initialPdc={initialPdc}
                            fullReportData={fullReportData}
                        />
                    )}
                </main>
            </div>

            {/* Hidden Preview Section for PDF */}
            <PDFPreview initialPdc={initialPdc} fullReportData={fullReportData} viewMode={viewMode} />
        </div>
    );
}

function SignatureBlock({ name, role }: { name: string, role: string }) {
    return (
        <div className="text-center pt-8 border-t border-slate-300">
            <div className="w-48 h-1 bg-slate-200 mx-auto mb-4 rounded-full"></div>
            <p className="text-sm font-black text-slate-800 mb-1">{name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{role}</p>
        </div>
    );
}
