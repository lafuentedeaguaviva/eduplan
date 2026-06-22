'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { usePdcDetailedStats, StatItem } from '@/hooks/usePdcDetailedStats';
import { cn } from '@/lib/utils';

export function PdcStatisticsCharts() {
    const { stats, loading, error } = usePdcDetailedStats();

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
                <div className="h-80 bg-slate-100 rounded-3xl" />
                <div className="h-80 bg-slate-100 rounded-3xl" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-3xl text-rose-500 font-medium">
                <span className="material-symbols-rounded text-4xl mb-2">warning</span>
                <p>No se pudieron cargar las estadísticas institucionales.</p>
                <p className="text-sm opacity-80 mt-1">Asegúrese de haber ejecutado las migraciones SQL.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <ChartCard 
                title="Estrategias Metodológicas" 
                subtitle="Top 10 más utilizadas (Teoría, Práctica, Producción, Valoración)"
                icon="account_tree"
                data={stats.momentos}
                colorScheme="indigo"
                limit={10}
            />
            
            <ChartCard 
                title="Criterios de Evaluación" 
                subtitle="Enfoque de evaluación (Ser, Saber, Hacer)"
                icon="checklist"
                data={stats.criterios}
                colorScheme="emerald"
                limit={5}
            />

            <ChartCard 
                title="Inclusión y Adaptaciones" 
                subtitle="Registro de adaptaciones curriculares"
                icon="accessibility_new"
                data={stats.adaptaciones}
                colorScheme="amber"
                limit={5}
                className="lg:col-span-2"
            />
        </div>
    );
}

interface ChartCardProps {
    title: string;
    subtitle: string;
    icon: string;
    data: StatItem[];
    colorScheme: 'indigo' | 'emerald' | 'amber';
    limit?: number;
    className?: string;
}

function ChartCard({ title, subtitle, icon, data = [], colorScheme, limit = 5, className }: ChartCardProps) {
    const filteredData = useMemo(() => {
        return data?.slice(0, limit) || [];
    }, [data, limit]);

    const maxCount = useMemo(() => {
        return Math.max(...filteredData.map(d => d.cantidad), 1);
    }, [filteredData]);

    const colors = {
        indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50' },
        emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
        amber: { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' }
    };

    const c = colors[colorScheme];

    return (
        <Card className={cn("p-8 border-none shadow-soft hover:shadow-premium transition-all duration-500 group overflow-hidden relative", className)}>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-rounded text-9xl">{icon}</span>
            </div>

            <div className="flex items-center gap-4 mb-8">
                <div className={cn("size-12 rounded-2xl flex items-center justify-center", c.light, c.text)}>
                    <span className="material-symbols-rounded text-2xl">{icon}</span>
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
                    <p className="text-sm font-medium text-slate-500">{subtitle}</p>
                </div>
            </div>

            {filteredData.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                    <span className="material-symbols-rounded text-4xl mb-2 opacity-50">data_alert</span>
                    <p className="font-medium">No hay datos suficientes aún</p>
                </div>
            ) : (
                <div className="space-y-5 relative z-10">
                    {filteredData.map((item, idx) => {
                        const width = `${Math.max((item.cantidad / maxCount) * 100, 2)}%`;
                        return (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {item.categoria}
                                        </span>
                                        <span className="text-sm font-bold text-slate-700 truncate max-w-[200px] sm:max-w-[300px]" title={item.nombre}>
                                            {item.nombre}
                                        </span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{item.cantidad}</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                    <div 
                                        className={cn("h-full rounded-full transition-all duration-1000 ease-out", c.bg)} 
                                        style={{ width }} 
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
