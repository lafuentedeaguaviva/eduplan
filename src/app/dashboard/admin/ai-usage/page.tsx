'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAdminController } from '@/hooks/useAdminController';
import Link from 'next/link';

// --- Tipos ---

interface ProviderStat {
    totalRequests: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}

interface TopUser {
    id: string;
    name: string;
    totalTokens: number;
    requests: number;
}

interface AiUsageData {
    period: { days: number; since: string };
    globalTotals: {
        totalRequests: number;
        totalTokens: number;
        promptTokens: number;
        completionTokens: number;
    };
    providerStats: Record<string, ProviderStat>;
    dailyUsage: Array<Record<string, any>>;
    topUsers: TopUser[];
    ia_limits?: Record<string, {
        dailyTokenLimit: number;
        monthlyTokenLimit: number;
        rpmLimit: number;
    }>;
}

// --- Constantes de límites conocidos ---

const PROVIDER_CONFIG: Record<string, {
    label: string;
    icon: string;
    gradient: string;
    color: string;
    textColor: string;
    bgLight: string;
}> = {
    gemini: {
        label: 'Google Gemini',
        icon: '✦',
        gradient: 'from-blue-500 to-indigo-600',
        color: 'blue',
        textColor: 'text-blue-400',
        bgLight: 'bg-blue-500/10',
    },
    deepseek: {
        label: 'DeepSeek V4 Flash',
        icon: '⚡',
        gradient: 'from-emerald-500 to-teal-600',
        color: 'emerald',
        textColor: 'text-emerald-400',
        bgLight: 'bg-emerald-500/10',
    }
};

// --- Helpers de formato ---

function formatTokenCount(count: number): string {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(2)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-BO', { day: '2-digit', month: 'short' });
}

function getPercentage(used: number, limit: number): number {
    if (limit <= 0) return 0;
    return Math.min(100, (used / limit) * 100);
}

function getStatusColor(percentage: number): string {
    if (percentage >= 90) return 'text-rose-400';
    if (percentage >= 70) return 'text-amber-400';
    return 'text-emerald-400';
}

function getBarColor(percentage: number): string {
    if (percentage >= 90) return 'bg-rose-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
}

// --- Componente de barra de progreso ---

function UsageBar({ used, limit, label, sublabel }: { used: number; limit: number; label: string; sublabel?: string }) {
    const percentage = getPercentage(used, limit);
    const remaining = Math.max(0, limit - used);

    return (
        <div className="space-y-2">
            <div className="flex items-baseline justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
                {sublabel && <span className="text-[10px] text-slate-500">{sublabel}</span>}
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden relative">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                />
                {/* Glow effect */}
                <div
                    className={`absolute top-0 h-full rounded-full blur-sm opacity-40 transition-all duration-1000 ${getBarColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between items-center">
                <span className={`text-sm font-black ${getStatusColor(percentage)}`}>
                    {formatTokenCount(used)} / {formatTokenCount(limit)}
                </span>
                <span className="text-xs text-slate-500">
                    Restante: <strong className="text-slate-300">{formatTokenCount(remaining)}</strong>
                </span>
            </div>
        </div>
    );
}

// --- Componente de mini-gráfico de barras (sparkline) ---

function DailyChart({ dailyUsage, provider }: { dailyUsage: Array<Record<string, any>>; provider: string }) {
    const values = dailyUsage.map(d => d[provider] || 0);
    const maxVal = Math.max(...values, 1);

    return (
        <div className="flex items-end gap-0.5 h-16 mt-2">
            {values.slice(-14).map((val, i) => {
                const height = Math.max(2, (val / maxVal) * 100);
                const config = PROVIDER_CONFIG[provider];
                return (
                    <div key={i} className="flex-1 group relative">
                        <div
                            className={`w-full rounded-t-sm transition-all duration-300 group-hover:opacity-80 bg-gradient-to-t ${config?.gradient || 'from-slate-500 to-slate-600'}`}
                            style={{ height: `${height}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                            <div className="bg-slate-800 text-[10px] text-white px-2 py-1 rounded shadow-lg whitespace-nowrap border border-slate-700">
                                {formatTokenCount(val)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// --- Página Principal ---

export default function AiUsagePage() {
    const { checkAccess } = useAdminController();
    const [data, setData] = useState<AiUsageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDays, setSelectedDays] = useState(30);

    const fetchData = useCallback(async (days: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/ai-usage?days=${days}`);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Error ${res.status}`);
            }
            const json = await res.json();
            setData(json);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const hasAccess = await checkAccess();
            if (hasAccess) {
                fetchData(selectedDays);
            }
        };
        init();
    }, [selectedDays]);

    // Calcular uso diario promedio para estimación de "cuánto falta"
    const getTodayUsage = (provider: string): number => {
        if (!data?.dailyUsage?.length) return 0;
        const today = new Date().toISOString().split('T')[0];
        const todayData = data.dailyUsage.find(d => d.date === today);
        return todayData?.[provider] || 0;
    };

    const periodDayLabels: Record<number, string> = {
        1: 'Hoy',
        7: '7 días',
        30: '30 días',
        90: '90 días',
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Link href="/dashboard/admin" className="text-slate-500 hover:text-slate-300 transition-colors text-sm font-semibold flex items-center gap-1 mb-3">
                        <span className="material-symbols-rounded text-base">arrow_back</span>
                        Panel Admin
                    </Link>
                    <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] text-cyan-500 bg-cyan-950/30 border-cyan-800/40 mb-2">
                        Monitoreo IA
                    </Badge>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                        Consumo de Tokens IA
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl">
                        Visualiza el uso de tokens de Gemini y DeepSeek, costos estimados y cuánto queda de tu cuota.
                    </p>
                </div>

                {/* Selector de período */}
                <div className="flex gap-2 bg-slate-100 rounded-2xl p-1">
                    {[1, 7, 30, 90].map(d => (
                        <button
                            key={d}
                            onClick={() => setSelectedDays(d)}
                            className={`px-4 py-2 rounded-xl text-sm font-black transition-all duration-200 ${
                                selectedDays === d
                                    ? 'bg-white text-slate-900 shadow-md'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {periodDayLabels[d]}
                        </button>
                    ))}
                </div>
            </header>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-400 font-semibold animate-pulse">Cargando métricas de IA...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <Card className="p-8 border-rose-200 bg-rose-50 text-center">
                    <span className="material-symbols-rounded text-4xl text-rose-400 mb-3">error</span>
                    <p className="text-rose-700 font-bold">{error}</p>
                    <Button onClick={() => fetchData(selectedDays)} className="mt-4">Reintentar</Button>
                </Card>
            )}

            {/* Data Display */}
            {data && !loading && (
                <>
                    {/* Global Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Solicitudes Totales', value: data.globalTotals.totalRequests.toLocaleString(), icon: 'send', color: 'blue' },
                            { label: 'Tokens Totales', value: formatTokenCount(data.globalTotals.totalTokens), icon: 'token', color: 'purple' },
                            { label: 'Tokens Prompt', value: formatTokenCount(data.globalTotals.promptTokens), icon: 'input', color: 'indigo' },
                            { label: 'Tokens Respuesta', value: formatTokenCount(data.globalTotals.completionTokens), icon: 'output', color: 'cyan' },
                        ].map((stat, i) => (
                            <Card key={i} className="p-6 border-none shadow-soft hover:shadow-medium transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                                    <span className="material-symbols-rounded text-6xl text-slate-900">{stat.icon}</span>
                                </div>
                                <div className="flex flex-col gap-1 relative z-10">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</span>
                                    <span className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</span>
                                </div>
                                <div className={`mt-4 h-1.5 w-12 rounded-full bg-${stat.color}-500/20`} />
                            </Card>
                        ))}
                    </div>

                    {/* Provider Detail Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {Object.entries(PROVIDER_CONFIG).map(([providerKey, config]) => {
                            const stats = data.providerStats[providerKey];
                            const todayUsage = getTodayUsage(providerKey);
                            const hasData = !!stats;

                            return (
                                <Card key={providerKey} className="border-none shadow-soft overflow-hidden">
                                    {/* Provider Header */}
                                    <div className={`p-6 bg-gradient-to-r ${config.gradient} relative overflow-hidden`}>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-8 -mt-8" />
                                        <div className="relative z-10 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{config.icon}</span>
                                                <div>
                                                    <h3 className="text-xl font-black text-white tracking-tight">{config.label}</h3>
                                                    <p className="text-white/60 text-xs font-semibold">
                                                        {hasData ? `${stats.totalRequests} solicitudes` : 'Sin uso registrado'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={`${hasData ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'} font-black text-xs border-none`}>
                                                {hasData ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Provider Body */}
                                    <div className="p-6 space-y-6">
                                        {/* Token Breakdown */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prompt</p>
                                                <p className="text-lg font-black text-slate-900">{formatTokenCount(stats?.promptTokens || 0)}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Respuesta</p>
                                                <p className="text-lg font-black text-slate-900">{formatTokenCount(stats?.completionTokens || 0)}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
                                                <p className="text-lg font-black text-slate-900">{formatTokenCount(stats?.totalTokens || 0)}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-100 pt-4" />

                                        {/* Usage Bars */}
                                        <UsageBar
                                            used={todayUsage}
                                            limit={data.ia_limits?.[providerKey]?.dailyTokenLimit || 0}
                                            label="Uso de Hoy"
                                            sublabel={`Límite diario: ${formatTokenCount(data.ia_limits?.[providerKey]?.dailyTokenLimit || 0)}`}
                                        />

                                        <UsageBar
                                            used={stats?.totalTokens || 0}
                                            limit={data.ia_limits?.[providerKey]?.monthlyTokenLimit || 0}
                                            label={`Uso del Período (${periodDayLabels[selectedDays]})`}
                                            sublabel={`Límite mensual: ${formatTokenCount(data.ia_limits?.[providerKey]?.monthlyTokenLimit || 0)}`}
                                        />

                                        {/* Daily Chart */}
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Actividad Diaria</p>
                                            {data.dailyUsage.length > 0 ? (
                                                <DailyChart dailyUsage={data.dailyUsage} provider={providerKey} />
                                            ) : (
                                                <div className="h-16 flex items-center justify-center text-slate-400 text-sm">
                                                    Sin datos en el período
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Top Users */}
                    {data.topUsers.length > 0 && (
                        <Card className="border-none shadow-soft overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                        <span className="material-symbols-rounded text-xl text-indigo-600 font-black">leaderboard</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Top Consumidores</h3>
                                        <p className="text-slate-500 text-xs font-medium">Usuarios con mayor uso de tokens en el período</p>
                                    </div>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {data.topUsers.map((user, i) => {
                                    const percentage = data.globalTotals.totalTokens > 0
                                        ? (user.totalTokens / data.globalTotals.totalTokens) * 100
                                        : 0;

                                    return (
                                        <div key={user.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group">
                                            <div className={`size-8 rounded-xl flex items-center justify-center text-sm font-black ${
                                                i === 0 ? 'bg-amber-50 text-amber-600' :
                                                i === 1 ? 'bg-slate-100 text-slate-500' :
                                                i === 2 ? 'bg-orange-50 text-orange-600' :
                                                'bg-slate-50 text-slate-400'
                                            }`}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                                                <p className="text-[10px] text-slate-400 font-semibold">{user.requests} solicitudes</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900">{formatTokenCount(user.totalTokens)}</p>
                                                <p className="text-[10px] text-slate-400">{percentage.toFixed(1)}% del total</p>
                                            </div>
                                            {/* Mini bar */}
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden hidden md:block">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-700"
                                                    style={{ width: `${Math.min(100, percentage)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    )}

                    {/* Empty State */}
                    {data.globalTotals.totalRequests === 0 && (
                        <Card className="p-16 border-none shadow-soft text-center">
                            <span className="material-symbols-rounded text-6xl text-slate-200 mb-4">analytics</span>
                            <h3 className="text-2xl font-black text-slate-400 tracking-tight">Sin Datos de Consumo</h3>
                            <p className="text-slate-400 mt-2 max-w-md mx-auto">
                                No se han registrado solicitudes de IA en los últimos {selectedDays} días.
                                Los datos aparecerán cuando los docentes utilicen la optimización con IA.
                            </p>
                        </Card>
                    )}

                    {/* Quota Info Footer */}
                    <Card className="p-8 border-none bg-slate-900 text-white overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-600/10 to-transparent pointer-events-none" />
                        <div className="relative z-10 space-y-4">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black tracking-tight">Información de Cuotas</h2>
                                <p className="text-slate-400">Límites actuales configurados para cada proveedor de IA.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                {Object.entries(PROVIDER_CONFIG).map(([key, config]) => {
                                    const limits = data.ia_limits?.[key];
                                    return (
                                        <div key={key} className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{config.icon}</span>
                                                <span className="font-black text-white">{config.label}</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3 text-center">
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Diario</p>
                                                    <p className="text-sm font-black text-slate-200">{formatTokenCount(limits?.dailyTokenLimit || 0)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Mensual</p>
                                                    <p className="text-sm font-black text-slate-200">{formatTokenCount(limits?.monthlyTokenLimit || 0)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">RPM</p>
                                                    <p className="text-sm font-black text-slate-200">{limits?.rpmLimit || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
