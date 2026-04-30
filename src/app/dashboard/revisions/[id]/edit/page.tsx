'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { PdcRevisionesService, PdcRevision } from '@/services/pdc-revisiones.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { db } from '@/lib/database';

export default function FastEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [revision, setRevision] = useState<PdcRevision | null>(null);
    const [snapshot, setSnapshot] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadRevision();
    }, [id]);

    const loadRevision = async () => {
        try {
            setLoading(true);
            const { data, error } = await db
                .from('pdc_revisiones')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            setRevision(data);
            setSnapshot(data.pdc_snapshot);
        } catch (error) {
            console.error("Error loading revision:", error);
            toast.error("No se pudo cargar la revisión.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateField = (path: string, value: string) => {
        setSnapshot((prev: any) => ({
            ...prev,
            [path]: value
        }));
    };

    const handleResubmit = async () => {
        if (!confirm('¿Estás seguro de que quieres reenviar este PDC con las correcciones realizadas?')) {
            return;
        }

        try {
            setIsSaving(true);
            await PdcRevisionesService.resubmitCorrection(id, snapshot);
            toast.success("PDC reenviado con éxito. El director recibirá una notificación.");
            router.push('/dashboard/revisions');
        } catch (error) {
            console.error("Error resubmitting:", error);
            toast.error("Error al reenviar el PDC.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-4 bg-slate-950">
                <div className="size-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                <p className="text-amber-500 font-black animate-pulse uppercase tracking-widest text-xs">Cargando Editor Rápido...</p>
            </div>
        );
    }

    if (!revision || !snapshot) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Top Header Sticky */}
            <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => router.back()}
                            className="size-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors border border-slate-700"
                        >
                            <span className="material-symbols-rounded">arrow_back</span>
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="material-symbols-rounded text-amber-500 text-lg">edit_note</span>
                                <h1 className="text-xl font-black text-white uppercase tracking-tight">Fast Editor <span className="text-slate-500 font-medium">v{revision.version}</span></h1>
                            </div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Corrección Directa sobre el Documento Final</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => router.back()}
                            className="px-6 py-2.5 rounded-xl font-black text-xs text-slate-400 hover:text-white transition-colors"
                        >
                            CANCELAR
                        </button>
                        <button 
                            onClick={handleResubmit}
                            disabled={isSaving}
                            className={cn(
                                "px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl",
                                isSaving 
                                ? "bg-slate-800 text-slate-600" 
                                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 hover:scale-[1.02] active:scale-95"
                            )}
                        >
                            {isSaving ? (
                                <div className="size-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-rounded text-xl">send</span>
                            )}
                            {isSaving ? 'REENVIANDO...' : 'REENVIAR A REVISIÓN'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Panel de Observaciones (Sticky) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] p-8 sticky top-28">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-900/20">
                                <span className="material-symbols-rounded font-black">announcement</span>
                            </div>
                            <h3 className="text-xl font-black text-rose-400 uppercase tracking-tight">Observaciones</h3>
                        </div>
                        
                        <div className="space-y-6">
                            {revision.observaciones ? (
                                <div className="p-5 bg-black/40 rounded-3xl border border-white/5 space-y-3">
                                    <p className="text-slate-300 font-medium leading-relaxed italic">
                                        "{typeof revision.observaciones === 'string' ? revision.observaciones : JSON.stringify(revision.observaciones, null, 2)}"
                                    </p>
                                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                                        <div className="size-6 rounded-full bg-slate-800 flex items-center justify-center">
                                            <span className="material-symbols-rounded text-xs text-slate-400">person</span>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Director de Unidad</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-500 italic text-sm font-medium">No hay observaciones específicas detalladas.</p>
                            )}

                            <div className="bg-slate-900/50 rounded-3xl p-5 border border-slate-800">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Guía de Corrección</h4>
                                <ul className="space-y-2 text-xs text-slate-400 font-medium list-disc pl-4">
                                    <li>Edita solo lo que el director te ha señalado.</li>
                                    <li>Mantén la coherencia técnica del documento.</li>
                                    <li>Al terminar, pulsa el botón verde superior.</li>
                                    <li>Este cambio es inmediato y genera una nueva versión.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor Areas */}
                <div className="lg:col-span-8 space-y-10 pb-32">
                    
                    {/* Campo: Nombre */}
                    <section className="space-y-4">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-2">
                            <span className="material-symbols-rounded text-sm">badge</span>
                            Nombre del PDC
                        </label>
                        <input 
                            type="text"
                            value={snapshot.pdcName || snapshot.datosReferenciales?.materia || ''}
                            onChange={(e) => handleUpdateField('pdcName', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-[2rem] px-8 py-5 text-xl font-black text-white focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-inner"
                        />
                    </section>

                    {/* Campo: Objetivo Holístico */}
                    <section className="space-y-4">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-2">
                            <span className="material-symbols-rounded text-sm">psychology_alt</span>
                            Objetivo Holístico
                        </label>
                        <textarea 
                            rows={4}
                            value={snapshot.objetivoHolistico || ''}
                            onChange={(e) => handleUpdateField('objetivoHolistico', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 text-slate-300 font-medium leading-relaxed focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner custom-scrollbar"
                        />
                    </section>

                    {/* Momentos Metodológicos */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between ml-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="material-symbols-rounded text-sm">format_list_bulleted</span>
                                Momentos Metodológicos (Consolidado IA)
                            </label>
                            <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20 uppercase">Solo Lectura/Edición de Texto</span>
                        </div>
                        <textarea 
                            rows={12}
                            value={snapshot.momentos_ia || ''}
                            onChange={(e) => handleUpdateField('momentos_ia', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-8 text-slate-300 font-medium leading-relaxed focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner custom-scrollbar"
                        />
                    </section>

                    {/* Recursos y Fuentes */}
                    <section className="space-y-4">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-2">
                            <span className="material-symbols-rounded text-sm">menu_book</span>
                            Recursos y Fuentes
                        </label>
                        <textarea 
                            rows={5}
                            value={snapshot.recursos_fuentes_ia || ''}
                            onChange={(e) => handleUpdateField('recursos_fuentes_ia', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 text-slate-300 font-medium leading-relaxed focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner custom-scrollbar"
                        />
                    </section>

                    {/* Criterios de Evaluación */}
                    <section className="space-y-4">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-2">
                            <span className="material-symbols-rounded text-sm">verified</span>
                            Criterios de Evaluación
                        </label>
                        <textarea 
                            rows={8}
                            value={snapshot.criterios_evaluacion_ia || ''}
                            onChange={(e) => handleUpdateField('criterios_evaluacion_ia', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 text-slate-300 font-medium leading-relaxed focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-inner custom-scrollbar"
                        />
                    </section>

                </div>
            </div>
        </div>
    );
}
