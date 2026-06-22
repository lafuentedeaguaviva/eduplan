'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useDirectorController } from '@/hooks/useDirectorController';
import { InstitutionalStats } from '@/components/director/InstitutionalStats';
import { StaffTable } from '@/components/director/StaffTable';

export default function DirectorDashboardPage() {
    const { analytics, staff, pdcs, inbox, revisionStats, loading, error } = useDirectorController();

    const pendingRevisions = inbox.filter((r: any) => r.estado === 'enviado');

    if (error) return (
        <div className="p-20 text-center">
            <Card className="p-12 border-rose-100 bg-rose-50/50">
                <span className="material-symbols-rounded text-rose-500 text-5xl mb-4">error</span>
                <p className="text-rose-600 font-bold">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4 bg-rose-600 text-white font-black rounded-xl px-8">Reintentar</Button>
            </Card>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Extended Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Badge variant="accent" className="font-black uppercase tracking-widest text-[10px] bg-white border border-slate-200 text-slate-900 rounded-lg shadow-sm">
                            Supervisión 2026
                        </Badge>
                        <div className="h-1.5 w-8 bg-emerald-500 rounded-full" />
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic">
                        Tablero de Dirección
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl text-lg leading-relaxed">
                        Control pedagógico en tiempo real. Monitorea la brecha entre lo <span className="text-blue-600 font-black">planificado</span> y lo <span className="text-emerald-600 font-black">ejecutado</span> en tu unidad educativa.
                    </p>
                </div>

                <div className="flex gap-4">
                    <Link href="/dashboard/director/reports">
                        <Button className="h-14 px-8 rounded-2xl bg-white border border-slate-100 shadow-premium text-slate-900 font-black hover:bg-slate-50 gap-2 transition-all active:scale-95">
                            <span className="material-symbols-rounded text-emerald-600">assessment</span>
                            Informes Generales
                        </Button>
                    </Link>
                </div>
            </header>

            {/* KPI Revisions Row */}
            {!loading && revisionStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <KpiCard 
                        label="Tasa de Aprobación" 
                        value={`${revisionStats.approvalRate}%`} 
                        icon="trending_up" 
                        color="emerald" 
                        progress={revisionStats.approvalRate}
                    />
                    <KpiCard 
                        label="Ciclo Promedio" 
                        value={`${revisionStats.avgCycleTime}h`} 
                        icon="schedule" 
                        color="blue" 
                    />
                    <KpiCard 
                        label="Observados" 
                        value={revisionStats.observados} 
                        icon="refresh" 
                        color="rose" 
                    />
                    <KpiCard 
                        label="Pendientes" 
                        value={revisionStats.enviados} 
                        icon="priority_high" 
                        color="amber" 
                        pulse={revisionStats.enviados > 0}
                    />
                </div>
            )}

            {loading ? (
                <div className="space-y-10 animate-pulse">
                    <div className="h-[300px] w-full bg-slate-100 rounded-[3rem]" />
                    <div className="h-[400px] w-full bg-slate-50 rounded-[3rem]" />
                </div>
            ) : (
                <>
                    {/* Phase 2: Analytics UI */}
                    {analytics && (
                        <InstitutionalStats 
                            planningRate={analytics.planningRate}
                            executionRate={analytics.executionRate}
                            totalContents={analytics.totalContents}
                            distribution={analytics.distribution}
                        />
                    )}

                    {/* Inbox and Staff Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 mt-10">
                        {/* Inbox (Pending Revisions) */}
                        <div className="xl:col-span-4 space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Bandeja de Entrada</h3>
                                    {pendingRevisions.length > 0 && (
                                        <Badge variant="accent" className="bg-amber-500 text-white rounded-full size-5 flex items-center justify-center p-0 text-[10px]">
                                            {pendingRevisions.length}
                                        </Badge>
                                    )}
                                </div>
                                <Link href="/dashboard/director/revisions">
                                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50">
                                        Ver Todo
                                    </Button>
                                </Link>
                            </div>
                            
                            <div className="space-y-4">
                                {pendingRevisions.length === 0 ? (
                                    <Card className="p-10 border-dashed border-2 border-slate-100 bg-transparent flex flex-col items-center justify-center text-center space-y-4">
                                        <span className="material-symbols-rounded text-slate-200 text-5xl">task_alt</span>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin revisiones pendientes</p>
                                    </Card>
                                ) : (
                                    pendingRevisions.slice(0, 4).map((rev: any) => (
                                        <Link key={rev.id} href={`/dashboard/director/revisions/${rev.id}`}>
                                            <Card className="p-5 border-none shadow-soft bg-white/50 backdrop-blur-sm hover:shadow-premium hover:bg-white transition-all cursor-pointer group relative overflow-hidden">
                                                <div className="absolute top-0 left-0 h-full w-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="flex items-center justify-between relative z-10">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 font-black text-xs group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                                                            {rev.perfiles?.nombres?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{rev.materia}</p>
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                                                                {rev.perfiles?.nombres} • {rev.grado}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <Badge className="bg-amber-100 text-amber-600 text-[8px] font-black uppercase tracking-widest border-none">Pendiente</Badge>
                                                        <span className="text-[9px] text-slate-300 font-bold">{new Date(rev.updated_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    ))
                                )}
                            </div>

                            {/* Additional Actions */}
                            <div className="pt-4 grid grid-cols-2 gap-4">
                                <Link href="/dashboard/director/pdc" className="col-span-2">
                                    <Button className="w-full h-14 rounded-2xl bg-white border border-slate-100 shadow-soft text-slate-600 font-bold text-xs gap-3 hover:bg-slate-50 transition-all">
                                        <span className="material-symbols-rounded text-slate-400">inventory_2</span>
                                        Archivo Histórico
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Staff Table */}
                        <div className="xl:col-span-8">
                             <StaffTable staff={staff} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function KpiCard({ label, value, icon, color, pulse, progress }: any) {
    const colors = {
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        rose: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    } as any;

    return (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 space-y-4 relative overflow-hidden group shadow-soft hover:shadow-medium transition-all">
            {progress !== undefined && (
                <div className="absolute bottom-0 left-0 h-1 bg-emerald-500/20 w-full">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
            )}
            <div className={cn("size-12 rounded-2xl flex items-center justify-center", colors[color])}>
                <span className={cn("material-symbols-rounded text-2xl", pulse && "animate-pulse")}>{icon}</span>
            </div>
            <div>
                <p className="text-3xl font-black text-slate-900 group-hover:scale-110 origin-left transition-transform duration-500">{value}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{label}</p>
            </div>
        </div>
    );
}

import { cn } from '@/lib/utils';
