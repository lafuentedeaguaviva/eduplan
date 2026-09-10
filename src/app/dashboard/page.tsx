'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { useProfile } from '@/contexts/ProfileContext';
import { useEffect, useState } from 'react';
import { PdcService } from '@/services/pdc.service';
import { AuthService } from '@/services/auth.service';
import { PDCMaster } from '@/types';
import { PdcCard } from '@/components/ui/PdcCard';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/Atoms';

const QUICK_ACTIONS = [
    { icon: 'add_circle', label: 'Nuevo PDC', href: '/dashboard/pdcs/new', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { icon: 'menu_book', label: 'Nuevo Contenido', href: '/dashboard/content/new', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { icon: 'calendar_month', label: 'Planificar', href: '/dashboard/planning', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { icon: 'school', label: 'Mis Áreas', href: '/dashboard/areas', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { icon: 'collections_bookmark', label: 'Biblioteca', href: '/dashboard/library', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
];

export default function DashboardPage() {
    const router = useRouter();
    const { profile, loading: profileLoading } = useProfile();
    const [pdcs, setPdcs] = useState<PDCMaster[]>([]);
    const [loadingPdcs, setLoadingPdcs] = useState(true);
    const [observedCount, setObservedCount] = useState(0);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (profileLoading) return;
            if (!profile?.id) {
                setLoadingPdcs(false);
                return;
            }

            try {
                const userId = profile.id;

                // --- Fetch PDCs (critical) ---
                const pdcRes = await PdcService.getPDCs(userId);
                if (pdcRes.success && pdcRes.data) {
                    setPdcs(pdcRes.data);
                }

                // --- Fetch Revisions (non-critical: silently fails if unavailable) ---
                try {
                    const { PdcRevisionesService } = await import('@/services/pdc-revisiones.service');
                    const revisionRes = await PdcRevisionesService.getTeacherSubmissions(userId);
                    const observedCount = revisionRes.filter(r => r.estado === 'observado').length;
                    setObservedCount(observedCount);
                } catch (revisionError) {
                    // Non-blocking: revision feature may not be active yet
                    console.warn('Revision inbox not available:', revisionError);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoadingPdcs(false);
            }
        };
        fetchDashboardData();
    }, [profile, profileLoading]);

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este PDC permanentemente?')) return;
        try {
            const res = await PdcService.deletePDC(id);
            if (!res.success) throw res.error;
            setPdcs(prev => prev.filter(p => p.id !== id));
        } catch (err: any) {
            console.error('Error deleting PDC:', err);
            alert(err.message || 'Error al eliminar PDC');
        }
    };

    const handleResume = (id: string, step?: number) => {
        if (step) {
            router.push(`/dashboard/pdcs/new?id=${id}&step=${step}`);
        } else {
            router.push(`/dashboard/pdcs/new?id=${id}`);
        }
    };

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Buenos días';
        if (h < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    return (
        <div className="relative min-h-screen space-y-8 animate-in fade-in duration-700">
            {/* Background Mesh Decor */}
            <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[30%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* ─── WELCOME HEADER ─── */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/60 shadow-soft">
                <div className="flex items-center gap-6">
                    {profile?.foto_url ? (
                        <div className="size-20 rounded-[2rem] border-4 border-white shadow-luxe overflow-hidden bg-slate-100 shrink-0">
                            <img src={profile.foto_url} alt="Profile" className="size-full object-cover" />
                        </div>
                    ) : (
                        <div className="size-20 rounded-[2rem] border-4 border-white shadow-luxe bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shrink-0">
                            {profile?.nombres?.[0] || 'U'}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{greeting()}</span>
                            <span className="size-1 bg-slate-300 rounded-full" />
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Docente Verificado</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">
                            {profileLoading ? (
                                <div className="h-10 w-64 bg-slate-200 animate-pulse rounded-xl" />
                            ) : (
                                <>Hola, <span className="text-gradient-blue">{profile?.nombres || 'Docente'}</span> 👋</>
                            )}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">Gestiona tu planificación curricular con el poder de la IA.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link href="/dashboard/pdcs/new" className="flex-1 md:flex-none">
                        <Button className="w-full h-14 px-8 rounded-[1.5rem] shadow-glow-blue font-black gap-2 hover:scale-[1.02] active:scale-95 transition-all duration-300">
                            <span className="material-symbols-rounded text-xl">add_circle</span>
                            Crear PDC
                        </Button>
                    </Link>
                </div>
            </div>

            {/* ─── STATS GRID ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    { label: 'PDCs Activos', value: loadingPdcs ? '—' : pdcs.length.toString(), icon: 'description', color: 'text-blue-600', bg: 'bg-blue-50', shadow: 'shadow-blue-100', glow: 'bg-blue-600' },
                    { label: 'Cuota IA Hoy', value: profileLoading ? '—' : `${profile?.solicitudes_ia_hoy || 0} / 1500`, icon: 'auto_awesome', color: 'text-purple-600', bg: 'bg-purple-50', shadow: 'shadow-purple-100', glow: 'bg-purple-600' },
                    { label: 'PDCs Observados', value: loadingPdcs ? '—' : observedCount.toString(), icon: 'notifications', color: observedCount > 0 ? 'text-rose-600' : 'text-amber-600', bg: observedCount > 0 ? 'bg-rose-50' : 'bg-amber-50', shadow: observedCount > 0 ? 'shadow-rose-100' : 'shadow-amber-100', glow: observedCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500' },
                ].map((stat, i) => (
                    <div key={i} className="group relative bg-white rounded-[2rem] border border-slate-100 p-7 shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-0.5 overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full opacity-40 -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-700`} />
                        <div className="relative z-10 flex items-center gap-5">
                            <div className={`size-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                <span className="material-symbols-rounded text-2xl font-black">{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                                <p className="text-4xl font-black text-slate-900 tracking-tighter mt-0.5">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ─── QUICK ACTIONS ─── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {QUICK_ACTIONS.map((action) => (
                    <Link key={action.href} href={action.href}>
                        <div className={`group flex items-center gap-4 p-5 bg-white border-2 ${action.border} rounded-[1.5rem] hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5 cursor-pointer`}>
                            <div className={`size-11 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                <span className="material-symbols-rounded font-black">{action.icon}</span>
                            </div>
                            <span className="text-sm font-black text-slate-700 group-hover:text-slate-900 transition-colors">{action.label}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* ─── RECENT PDCs ─── */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-soft overflow-hidden">
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <span className="material-symbols-rounded font-black">history_edu</span>
                        </div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Actividad Reciente</h2>
                    </div>
                    <Link href="/dashboard/pdcs" className="text-[10px] font-black text-blue-600 hover:opacity-70 transition-all uppercase tracking-widest flex items-center gap-1">
                        Ver todo
                        <span className="material-symbols-rounded text-sm">chevron_right</span>
                    </Link>
                </div>

                <div className="p-6">
                    {loadingPdcs ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                            ))}
                        </div>
                    ) : pdcs.length > 0 ? (
                        <div className="grid gap-4">
                            {pdcs.slice(0, 3).map(pdc => (
                                <PdcCard
                                    key={pdc.id}
                                    pdc={pdc}
                                    onDelete={handleDelete}
                                    onResume={handleResume}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center rounded-[2rem] bg-slate-50/60 border-2 border-dashed border-slate-200">
                            <div className="size-16 bg-white rounded-[1.5rem] shadow-soft flex items-center justify-center mx-auto mb-5 text-slate-300">
                                <span className="material-symbols-rounded text-4xl">inbox</span>
                            </div>
                            <h3 className="font-black text-slate-700 mb-1">Sin actividad reciente</h3>
                            <p className="text-slate-400 font-medium text-sm mb-6">Crea tu primer plan de desarrollo curricular</p>
                            <Link href="/dashboard/pdcs/new">
                                <Button className="h-11 px-8 rounded-2xl text-sm font-black">
                                    Crear mi primer PDC
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
