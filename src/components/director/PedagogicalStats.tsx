'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { DirectorStatsService } from '@/services/director-stats.service';
import { PercentageChart } from './PercentageChart';
import { AiDirectorReport } from './AiDirectorReport';

export function PedagogicalStats() {
    // Forzar recarga del componente para tomar cambios del servicio
    const { user } = useAuth();
    const [stats, setStats] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchStats = async () => {
            if (!user?.id) return;
            try {
                const response = await fetch(`/api/director/stats?directorId=${user.id}`);
                const res = await response.json();
                if (res.success && res.data) {
                    console.log('STATS MOMENTOS:', res.data.momentos);
                    setStats(res.data);
                } else {
                    setError(res.error || "No hay PDCs aprobados para generar estadísticas.");
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user?.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="size-16 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm animate-pulse">Procesando Data Relacional...</p>
            </div>
        );
    }

    if (error || !stats || stats.totalApprovedPDCs === 0) {
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 mt-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] text-emerald-600 bg-emerald-50 border-emerald-100">
                                Minería Pedagógica
                            </Badge>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                            Estadísticas de PDCs Aprobados
                        </h2>
                    </div>
                </header>
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50/50 rounded-3xl border border-slate-100 border-dashed">
                    <span className="material-symbols-rounded text-6xl mb-4 text-slate-300">analytics</span>
                    <h3 className="text-xl font-black text-slate-700">Sin Datos Disponibles</h3>
                    <p className="text-sm font-medium max-w-md text-center mt-2">No se encontraron PDCs aprobados para procesar la minería pedagógica. Se requieren PDCs en estado "aprobado" para generar estadísticas de Bloom y momentos metodológicos.</p>
                </div>
            </div>
        );
    }

    return (
        <div id="director-stats-container" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 mt-10 p-2 bg-white">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] text-emerald-600 bg-emerald-50 border-emerald-100">
                            Minería Pedagógica
                        </Badge>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                        Estadísticas de PDCs Aprobados
                    </h2>
                    <p className="text-slate-500 font-medium max-w-2xl mt-2 leading-relaxed">
                        Análisis profundo extraído de las bases relacionales para los objetivos de aprendizaje (Bloom), momentos metodológicos y criterios de evaluación.
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base de Análisis</span>
                    <Badge className="bg-emerald-600 text-white font-black px-4 py-1.5 text-sm rounded-xl">
                        {stats.totalApprovedPDCs} PDCs Aprobados
                    </Badge>
                </div>
            </header>

            {/* 1. Taxonomía de Bloom (Objetivos) */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <span className="material-symbols-rounded">psychology</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Objetivos de Aprendizaje</h3>
                </div>
                <Card className="p-8 border-none shadow-soft bg-white/50 backdrop-blur-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h4 className="text-lg font-black mb-2">Taxonomía de Bloom</h4>
                            <p className="text-slate-500 font-medium mb-6 text-sm">Distribución de los {stats.totalObjectives} objetivos encontrados según los verbos de la taxonomía de Bloom.</p>
                            <div className="grid grid-cols-2 gap-4">
                                {stats.bloomTaxonomy.slice(0, 4).map((item: any, i: number) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.name}</p>
                                        <div className="flex items-end gap-2 mt-1">
                                            <span className="text-2xl font-black text-slate-900 leading-none">{item.percentage}%</span>
                                            <span className="text-xs font-bold text-slate-400 mb-0.5">({item.value})</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="h-[250px]">
                            <PercentageChart data={stats.bloomTaxonomy} title="Distribución de Verbos" type="pie" />
                        </div>
                    </div>
                </Card>
            </section>

            {/* 2. Momentos Metodológicos */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <span className="material-symbols-rounded">extension</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Momentos Metodológicos (Subtipos)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 border-none shadow-soft h-[300px] bg-white/50 backdrop-blur-sm">
                        <PercentageChart data={stats.momentos.practica} title="Tipos de Práctica" type="bar" />
                    </Card>
                    <Card className="p-6 border-none shadow-soft h-[300px] bg-white/50 backdrop-blur-sm">
                        <PercentageChart data={stats.momentos.teoria} title="Tipos de Teoría" type="bar" />
                    </Card>
                    <Card className="p-6 border-none shadow-soft h-[300px] bg-white/50 backdrop-blur-sm">
                        <PercentageChart data={stats.momentos.produccion} title="Tipos de Producción" type="bar" />
                    </Card>
                    <Card className="p-6 border-none shadow-soft h-[300px] bg-white/50 backdrop-blur-sm">
                        <PercentageChart data={stats.momentos.valoracion} title="Tipos de Valoración" type="bar" />
                    </Card>
                </div>
            </section>

            {/* 3. Criterios de Evaluación */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <span className="material-symbols-rounded">fact_check</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Criterios de Evaluación</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="p-6 border-none shadow-soft h-[300px] bg-white/50 backdrop-blur-sm">
                        <PercentageChart data={stats.criterios.ser} title="Dimensión: SER" type="pie" />
                    </Card>
                    <Card className="p-6 border-none shadow-soft h-[300px] bg-white/50 backdrop-blur-sm">
                        <PercentageChart data={stats.criterios.saber} title="Dimensión: SABER (Niveles)" type="pie" />
                    </Card>
                    <Card className="p-6 border-none shadow-soft h-[300px] bg-white/50 backdrop-blur-sm">
                        <PercentageChart data={stats.criterios.hacer} title="Dimensión: HACER (Niveles)" type="pie" />
                    </Card>
                </div>
            </section>

            {/* 4. Informe IA */}
            <AiDirectorReport stats={stats} />
        </div>
    );
}
