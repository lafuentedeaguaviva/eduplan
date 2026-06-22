'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useAdminController } from '@/hooks/useAdminController';
import { AdminService } from '@/services/admin.service';

import { StatCard } from './components/StatCard';
import { GrowthChart } from './components/GrowthChart';
import { DistributionChart } from './components/DistributionChart';

export default function StatisticsDashboardPage() {
    return (
        <React.Suspense fallback={<div className="p-20 text-center font-bold text-slate-500 animate-pulse tracking-widest uppercase">Cargando métricas...</div>}>
            <StatisticsContent />
        </React.Suspense>
    );
}

function StatisticsContent() {
    const { checkAccess } = useAdminController();
    const [stats, setStats] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const init = async () => {
            const hasAccess = await checkAccess();
            if (hasAccess) {
                const res = await AdminService.getDetailedStats();
                if (res.success) setStats(res.data);
                setLoading(false);
            }
        };
        init();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="size-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm animate-pulse">Analizando Datos</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/dashboard/admin" className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                            <span className="material-symbols-rounded block text-sm">arrow_back</span>
                        </Link>
                        <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] text-violet-600 bg-violet-50 border-violet-100">
                            Analytics & Adopción
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                        Estadísticas del Sistema
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl mt-2">
                        Monitoriza el crecimiento de la plataforma, la generación de PDCs y la distribución de los usuarios activos.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 font-black rounded-xl border-slate-200">
                        <span className="material-symbols-rounded text-lg">download</span>
                        Exportar Reporte
                    </Button>
                    <Button className="bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl gap-2 shadow-lg shadow-violet-500/30">
                        <span className="material-symbols-rounded text-lg">sync</span>
                        Actualizar
                    </Button>
                </div>
            </header>

            {/* Top Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    title="Usuarios Activos" 
                    value={stats?.summary?.activeUsersLast30Days || '0'} 
                    trend="+12%" 
                    isPositive={true}
                    subtitle="Últimos 30 días"
                    icon="group"
                    color="blue"
                />
                <KPICard 
                    title="PDCs Generados" 
                    value={stats?.summary?.pdcsGeneratedLast30Days || '0'} 
                    trend="+24%" 
                    isPositive={true}
                    subtitle="Últimos 30 días"
                    icon="description"
                    color="pink"
                />
                <KPICard 
                    title="Tokens IA (Gemini)" 
                    value={stats?.summary?.aiTokensUsed || '0'} 
                    trend="-5%" 
                    isPositive={true}
                    subtitle="Eficiencia mejorada"
                    icon="psychology"
                    color="violet"
                />
                <KPICard 
                    title="Promedio PDC/Docente" 
                    value={stats?.summary?.avgPDCsPerUser || '0'} 
                    trend="+0.5" 
                    isPositive={true}
                    subtitle="Adopción por usuario"
                    icon="trending_up"
                    color="emerald"
                />
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <StatCard 
                        title="Crecimiento de Adopción" 
                        description="Comparativa mensual entre nuevos usuarios y generación de PDCs."
                        icon="monitoring"
                        color="indigo"
                        action={
                            <select className="bg-slate-50 border-none text-sm font-bold text-slate-600 rounded-lg py-2 px-4 outline-none cursor-pointer">
                                <option>Año Actual</option>
                                <option>Últimos 6 meses</option>
                            </select>
                        }
                    >
                        <GrowthChart data={stats?.growthData || []} />
                    </StatCard>
                </div>
                
                <div className="lg:col-span-1">
                    <StatCard 
                        title="Distribución por Áreas" 
                        description="Áreas de conocimiento más planificadas."
                        icon="pie_chart"
                        color="amber"
                    >
                        <DistributionChart 
                            data={stats?.distributionData || []} 
                            colors={['#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#10b981']}
                        />
                    </StatCard>
                </div>

                <div className="lg:col-span-1">
                    <StatCard 
                        title="Perfiles de Usuario" 
                        description="Distribución de roles en la plataforma."
                        icon="badge"
                        color="emerald"
                    >
                        <DistributionChart 
                            data={stats?.roleDistributionData || []} 
                            colors={['#10b981', '#3b82f6', '#f43f5e']}
                        />
                    </StatCard>
                </div>

                <div className="lg:col-span-2">
                    <Card className="p-8 border-none shadow-soft h-full flex flex-col justify-center items-center text-center relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-violet-500/30 transition-colors duration-700" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -ml-20 -mb-20 group-hover:bg-blue-500/30 transition-colors duration-700" />
                        
                        <div className="relative z-10 space-y-6 max-w-md">
                            <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto backdrop-blur-md border border-white/10">
                                <span className="material-symbols-rounded text-3xl">insights</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tight mb-2">Reportes Detallados Pro</h3>
                                <p className="text-slate-300 font-medium">
                                    Exporta un PDF con el análisis predictivo de deserción, adopción de IA por unidad educativa y rendimiento general.
                                </p>
                            </div>
                            <Button className="bg-white text-slate-900 hover:bg-slate-100 font-black rounded-xl px-8 h-12 w-full gap-2 transition-transform active:scale-95">
                                <span className="material-symbols-rounded">auto_awesome</span>
                                Generar Reporte Predictivo
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Helper component for small KPIs
function KPICard({ title, value, trend, isPositive, subtitle, icon, color }: any) {
    return (
        <Card className="p-6 border-none shadow-soft hover:shadow-medium transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110`}>
                <span className="material-symbols-rounded text-6xl text-slate-900">{icon}</span>
            </div>
            <div className="flex justify-between items-start relative z-10 mb-4">
                <div className={`size-10 rounded-xl bg-${color}-50 flex items-center justify-center text-${color}-600`}>
                    <span className="material-symbols-rounded text-xl">{icon}</span>
                </div>
                <Badge variant="outline" className={`font-black text-[10px] ${isPositive ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100'}`}>
                    {trend}
                </Badge>
            </div>
            <div className="flex flex-col gap-1 relative z-10">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{value}</span>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{title}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{subtitle}</span>
                </div>
            </div>
            <div className={`mt-5 h-1 w-12 rounded-full bg-${color}-500/20`} />
        </Card>
    );
}
