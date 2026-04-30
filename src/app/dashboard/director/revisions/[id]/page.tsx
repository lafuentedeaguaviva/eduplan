'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { PdcRevisionesService, PdcRevision } from '@/services/pdc-revisiones.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { db } from '@/lib/database';
import { useAuth } from '@/hooks/useAuth';

export default function DirectorReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();
    const [revision, setRevision] = useState<any>(null);
    const [snapshot, setSnapshot] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [observaciones, setObservaciones] = useState("");

    useEffect(() => {
        loadRevision();
    }, [id]);

    const loadRevision = async () => {
        try {
            setLoading(true);
            const { data, error } = await db
                .from('pdc_revisiones')
                .select('*, perfiles!profesor_id(nombres, apellidos)')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            setRevision(data);
            setSnapshot(data.pdc_snapshot);
            setObservaciones(data.observaciones || "");
        } catch (error) {
            console.error("Error loading revision:", error);
            toast.error("No se pudo cargar la revisión.");
        } finally {
            setLoading(false);
        }
    };

    const handleReviewAction = async (estado: 'aprobado' | 'observado') => {
        if (!user) return;
        if (estado === 'observado' && !observaciones) {
            toast.error("Por favor escribe una observación antes de devolver el PDC.");
            return;
        }

        try {
            setIsSaving(true);
            await PdcRevisionesService.updateReviewStatus(id, user.id, estado, observaciones);
            toast.success(estado === 'aprobado' ? "PDC Aprobado con éxito." : "PDC devuelto con observaciones.");
            router.push('/dashboard/director/revisions');
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Error al actualizar el estado.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-4 bg-slate-950">
                <div className="size-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-emerald-500 font-black animate-pulse uppercase tracking-widest text-xs">Cargando PDC para Revisión...</p>
            </div>
        );
    }

    if (!revision || !snapshot) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
            {/* Top Bar Header */}
            <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 px-6 py-4 shrink-0">
                <div className="max-w-[1600px] mx-auto flex justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.back()}
                            className="size-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors border border-slate-700"
                        >
                            <span className="material-symbols-rounded">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                                Revisión de PDC: <span className="text-emerald-500">{revision.materia}</span>
                            </h1>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Maestro: {revision.perfiles?.nombres} {revision.perfiles?.apellidos} • Versión {revision.version}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => handleReviewAction('observado')}
                            disabled={isSaving}
                            className="px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-black text-xs uppercase tracking-widest rounded-2xl border border-rose-500/20 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-rounded">report</span>
                            Observar y Devolver
                        </button>
                        <button 
                            onClick={() => handleReviewAction('aprobado')}
                            disabled={isSaving}
                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-900/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95"
                        >
                            <span className="material-symbols-rounded">check_circle</span>
                            Aprobar PDC
                        </button>
                    </div>
                </div>
            </div>

            {/* Split Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Side: PDC Viewer (Read Only) */}
                <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-slate-950 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-16">
                        {/* Seccion: Referenciales */}
                        <section>
                            <SectionTitle icon="info" label="Datos Referenciales" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800">
                                <InfoItem label="Unidad Educativa" value={snapshot.datosReferenciales?.unidadEducativa || '-'} />
                                <InfoItem label="Grado" value={snapshot.datosReferenciales?.grado || '-'} />
                                <InfoItem label="Trimestre" value={snapshot.datosReferenciales?.trimestre || '-'} />
                                <InfoItem label="Gestión" value={snapshot.datosReferenciales?.gestion || '-'} />
                            </div>
                        </section>

                        {/* Seccion: Objetivo Holistico */}
                        <section>
                            <SectionTitle icon="psychology_alt" label="Objetivo Holístico" />
                            <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800 leading-relaxed text-slate-300 font-medium">
                                {snapshot.objetivoHolistico || 'No definido'}
                            </div>
                        </section>

                        {/* Seccion: Momentos */}
                        <section>
                            <SectionTitle icon="format_list_bulleted" label="Momentos Metodológicos" />
                            <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800 leading-relaxed text-slate-300 whitespace-pre-wrap font-medium">
                                {snapshot.momentos_ia || 'No definidos'}
                            </div>
                        </section>

                        {/* Seccion: Recursos */}
                        <section>
                            <SectionTitle icon="menu_book" label="Recursos y Fuentes" />
                            <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800 leading-relaxed text-slate-300 whitespace-pre-wrap font-medium">
                                {snapshot.recursos_fuentes_ia || 'No definidos'}
                            </div>
                        </section>

                        {/* Seccion: Criterios */}
                        <section>
                            <SectionTitle icon="verified" label="Criterios de Evaluación" />
                            <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800 leading-relaxed text-slate-300 whitespace-pre-wrap font-medium">
                                {snapshot.criterios_evaluacion_ia || 'No definidos'}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Right Side: Observation Panel */}
                <div className="w-[450px] bg-slate-900 border-l border-slate-800 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
                    <div className="p-8 border-b border-slate-800 bg-slate-950/30">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="material-symbols-rounded text-rose-500">rate_review</span>
                            Panel de Evaluación
                        </h3>
                    </div>

                    <div className="flex-1 p-8 space-y-6 overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Observaciones y Retroalimentación</label>
                            <textarea 
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                placeholder="Ej: Por favor mejorar la redacción del objetivo holístico, le falta el 'decidir'..."
                                className="w-full h-80 bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-sm text-slate-300 font-medium leading-relaxed focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner custom-scrollbar"
                            />
                        </div>

                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 space-y-3">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Consejo de Calidad</p>
                            <p className="text-xs text-slate-400 font-medium italic leading-relaxed">
                                "Tus observaciones serán visibles de inmediato para el maestro en su 'Fast Editor'. Sé específico para facilitar la corrección."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionTitle({ icon, label }: { icon: string, label: string }) {
    return (
        <div className="flex items-center gap-3 mb-6 ml-2">
            <div className="size-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <span className="material-symbols-rounded text-lg text-slate-400">{icon}</span>
            </div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">{label}</h3>
        </div>
    );
}

function InfoItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-black text-white truncate">{value}</p>
        </div>
    );
}
