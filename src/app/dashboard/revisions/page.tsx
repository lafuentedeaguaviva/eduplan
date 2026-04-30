'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { PdcRevisionesService, PdcRevision } from '@/services/pdc-revisiones.service';
import { cn } from '@/lib/utils';

export default function RevisionsPage() {
    const { user } = useAuth();
    const [revisions, setRevisions] = useState<PdcRevision[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        loadRevisions();
    }, [user]);

    const loadRevisions = async () => {
        try {
            setLoading(true);
            const data = await PdcRevisionesService.getTeacherSubmissions(user!.id);
            setRevisions(data);
        } catch (error) {
            console.error("Error loading revisions:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case 'enviado':
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
                        <span className="material-symbols-rounded text-[14px]">hourglass_top</span>
                        <span className="text-xs font-black uppercase tracking-wider">En Revisión</span>
                    </div>
                );
            case 'observado':
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                        <span className="material-symbols-rounded text-[14px]">error</span>
                        <span className="text-xs font-black uppercase tracking-wider">Observado</span>
                    </div>
                );
            case 'aprobado':
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                        <span className="material-symbols-rounded text-[14px]">task_alt</span>
                        <span className="text-xs font-black uppercase tracking-wider">Aprobado</span>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-8 flex items-center justify-center">
                <div className="size-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-10 space-y-8">
            {/* Encabezado */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <span className="material-symbols-rounded text-[150px]">rate_review</span>
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-4">
                            <span className="material-symbols-rounded text-sm">workspace_premium</span>
                            <span className="text-xs font-black uppercase tracking-widest">Función Pro</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
                            Mis <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Revisiones</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl font-medium">
                            Aquí puedes hacer seguimiento a los PDCs que has enviado al Director. Los PDCs observados requieren tu atención para ser corregidos y reenviados.
                        </p>
                    </div>
                </div>
            </div>

            {/* Lista de PDCs */}
            {revisions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900/50 rounded-3xl border border-slate-800/50 border-dashed">
                    <span className="material-symbols-rounded text-6xl text-slate-700 mb-4">inbox</span>
                    <h3 className="text-xl font-bold text-slate-300 mb-2">Bandeja Vacía</h3>
                    <p className="text-slate-500">Aún no has enviado ningún PDC a revisión.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {revisions.map((rev) => (
                        <div 
                            key={rev.id}
                            className="group relative bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 hover:shadow-xl transition-all duration-300 flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-slate-700 transition-colors">
                                    <span className="material-symbols-rounded text-slate-400 group-hover:text-white transition-colors">description</span>
                                </div>
                                {getStatusBadge(rev.estado)}
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-black text-white mb-2 line-clamp-2">
                                    {rev.pdc_snapshot?.datosReferenciales?.materia || rev.materia}
                                </h3>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <span className="material-symbols-rounded text-[16px] text-slate-500">school</span>
                                        <span>{rev.grado} - {rev.nivel}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <span className="material-symbols-rounded text-[16px] text-slate-500">history</span>
                                        <span>Versión {rev.version}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <span className="material-symbols-rounded text-[16px] text-slate-500">schedule</span>
                                        <span>{new Date(rev.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {rev.estado === 'observado' && (
                                <Link 
                                    href={`/dashboard/revisions/${rev.id}/edit`}
                                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-black rounded-2xl transition-colors border border-rose-500/20"
                                >
                                    <span className="material-symbols-rounded text-lg">edit_note</span>
                                    VER OBSERVACIONES Y CORREGIR
                                </Link>
                            )}
                            
                            {rev.estado === 'enviado' && (
                                <div className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-slate-800/50 text-slate-500 font-bold rounded-2xl cursor-not-allowed border border-slate-700/30">
                                    <span className="material-symbols-rounded text-lg">lock</span>
                                    ESPERANDO AL DIRECTOR
                                </div>
                            )}

                            {rev.estado === 'aprobado' && (
                                <button className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-black rounded-2xl transition-colors border border-emerald-500/20">
                                    <span className="material-symbols-rounded text-lg">print</span>
                                    IMPRIMIR PDC
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
