'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PdcRevisionesService, PdcRevision } from '@/services/pdc-revisiones.service';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function DirectorRevisionsPage() {
    const { user } = useAuth();
    const [revisions, setRevisions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Estadísticas
    const stats = {
        total: revisions.length,
        pendientes: revisions.filter(r => r.estado === 'enviado').length,
        observados: revisions.filter(r => r.estado === 'observado').length,
        aprobados: revisions.filter(r => r.estado === 'aprobado').length,
    };

    useEffect(() => {
        loadRevisions();
    }, []);

    const loadRevisions = async () => {
        try {
            setLoading(true);
            const data = await PdcRevisionesService.getDirectorInbox();
            setRevisions(data);
        } catch (error) {
            console.error("Error loading director inbox:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-8 flex items-center justify-center bg-slate-950">
                <div className="size-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-10 space-y-10">
            {/* Header & Stats Grid */}
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase mb-2">Panel de <span className="text-emerald-500">Supervisión</span></h1>
                    <p className="text-slate-400 font-medium">Bandeja de entrada centralizada para la revisión y validación de PDCs institucionales.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard label="Total Recibidos" value={stats.total} color="blue" icon="inbox" />
                    <StatCard label="Pendientes" value={stats.pendientes} color="amber" icon="pending" pulse />
                    <StatCard label="Observados" value={stats.observados} color="rose" icon="error" />
                    <StatCard label="Aprobados" value={stats.aprobados} color="emerald" icon="check_circle" />
                </div>
            </div>

            {/* Tabla de PDCs */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                    <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-rounded text-emerald-500">list</span>
                        Lista de PDCs por Revisar
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Profesor</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">PDC / Materia</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Grado/Nivel</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Estado</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Fecha</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {revisions.map((rev) => (
                                <tr key={rev.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                {rev.perfiles?.nombres?.[0] || 'P'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white">{rev.perfiles?.nombres} {rev.perfiles?.apellidos}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Maestro</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-200 line-clamp-1">{rev.materia}</p>
                                        <p className="text-[10px] text-slate-500 font-medium italic">Versión {rev.version}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-medium text-slate-400">{rev.grado}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-black">{rev.nivel}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        {getStatusBadge(rev.estado)}
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-medium text-slate-400">{new Date(rev.updated_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Link 
                                            href={`/dashboard/director/revisions/${rev.id}`}
                                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                                        >
                                            REVISAR PDC
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color, icon, pulse }: any) {
    const colors = {
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        rose: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    } as any;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 hover:border-slate-700 transition-colors">
            <div className={cn("size-12 rounded-2xl flex items-center justify-center", colors[color])}>
                <span className={cn("material-symbols-rounded text-2xl", pulse && "animate-pulse")}>{icon}</span>
            </div>
            <div>
                <p className="text-3xl font-black text-white">{value}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{label}</p>
            </div>
        </div>
    );
}

const getStatusBadge = (estado: string) => {
    switch (estado) {
        case 'enviado':
            return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-wider rounded-md border border-amber-500/20">Pendiente</span>;
        case 'observado':
            return <span className="px-2.5 py-1 bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-wider rounded-md border border-rose-500/20">Observado</span>;
        case 'aprobado':
            return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-wider rounded-md border border-emerald-500/20">Aprobado</span>;
        default:
            return null;
    }
};
