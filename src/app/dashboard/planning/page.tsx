'use client';

import { useRouter } from 'next/navigation';
import { usePlanningDeskController } from '@/hooks/usePlanningDeskController';
import { AreaTrabajo } from '@/types';

export default function PlanningPage() {
    const router = useRouter();
    const { areas, loading, gestion } = usePlanningDeskController();

    if (loading) {
        return <PlanningDeskSkeleton />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* ─── HEADER ─── */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Bandeja de Entrada</p>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Mi Escritorio</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Selecciona una clase para comenzar a planificar.</p>
                </div>
                <div className="px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl border border-blue-100 shrink-0 flex items-center gap-2">
                    <span className="material-symbols-rounded text-sm font-black">event_note</span>
                    Gestión {gestion}
                </div>
            </div>

            {/* ─── AREA GRID ─── */}
            {areas.length === 0 ? (
                <EmptyDesk onConfigure={() => router.push('/dashboard/areas')} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {areas.map((area) => (
                        <AreaCard
                            key={area.id}
                            area={area}
                            onClick={() => router.push(`/dashboard/planning/${area.id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function AreaCard({ area, onClick }: { area: AreaTrabajo; onClick: () => void }) {
    const colors = [
        { bg: 'from-blue-600 to-indigo-600', badge: 'bg-blue-50 text-blue-700 border-blue-100' },
        { bg: 'from-emerald-600 to-teal-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        { bg: 'from-purple-600 to-violet-600', badge: 'bg-purple-50 text-purple-700 border-purple-100' },
        { bg: 'from-amber-600 to-orange-500', badge: 'bg-amber-50 text-amber-700 border-amber-100' },
    ];
    // Stable color based on area id
    const colorIdx = area.id ? (area.id.charCodeAt(0) % colors.length) : 0;
    const color = colors[colorIdx];

    return (
        <div
            onClick={onClick}
            className="group relative overflow-hidden rounded-[3rem] bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.12)] cursor-pointer transition-all duration-500 hover:-translate-y-2"
        >
            {/* Gradient Top Strip - More elegant */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${color.bg} opacity-80`} />

            <div className="p-8 flex flex-col h-full min-h-[280px]">
                {/* School badge */}
                <div className="mb-6">
                    <span className={`text-[10px] font-black px-4 py-2 rounded-2xl uppercase tracking-[0.15em] border ${color.badge} inline-block shadow-sm group-hover:shadow-md transition-shadow`}>
                        {area.unidad_educativa?.nombre || 'Unidad Educativa'}
                    </span>
                </div>

                {/* Subject - Breathing room for names */}
                <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-[1.1] tracking-tight">
                        {area.area_conocimiento?.nombre}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {(area.area_conocimiento as any).grado?.nombre} • {(area.area_conocimiento as any).grado?.nivel?.nombre}
                    </p>
                </div>

                {/* Footer - Refined integration */}
                <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50/50">
                    <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-blue-500 transition-colors">
                        <span className="material-symbols-rounded text-lg font-black">schedule</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.1em]">
                            {area.turno?.nombre}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        {area.paralelos?.map(p => (
                            <span
                                key={p.id}
                                className="size-7 flex items-center justify-center rounded-xl bg-slate-50 text-[11px] font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm"
                            >
                                {p.nombre}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hover Indicator - More premium feel */}
            <div className="absolute top-8 right-8 size-10 rounded-2xl bg-white group-hover:bg-blue-600 flex items-center justify-center transition-all duration-500 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 rotate-12 group-hover:rotate-0 shadow-lg shadow-blue-500/20">
                <span className="material-symbols-rounded text-lg text-slate-400 group-hover:text-white font-black transition-colors">arrow_outward</span>
            </div>
        </div>
    );
}

function PlanningDeskSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <div className="h-3 w-28 bg-slate-200 rounded" />
                    <div className="h-8 w-48 bg-slate-200 rounded-xl" />
                    <div className="h-3 w-64 bg-slate-100 rounded" />
                </div>
                <div className="h-9 w-36 bg-slate-100 rounded-2xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-52 bg-white rounded-[2.5rem] border border-slate-100 shadow-soft overflow-hidden">
                        <div className="h-2 bg-slate-200" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function EmptyDesk({ onConfigure }: { onConfigure: () => void }) {
    return (
        <div className="py-24 text-center rounded-[3rem] bg-white border-2 border-dashed border-slate-200 shadow-soft col-span-full">
            <div className="size-20 bg-slate-50 rounded-[2rem] shadow-soft flex items-center justify-center mx-auto mb-6 rotate-6 text-slate-300">
                <span className="material-symbols-rounded text-5xl">school</span>
            </div>
            <h3 className="text-xl font-black text-slate-700 mb-2 tracking-tight">Sin clases configuradas</h3>
            <p className="text-slate-400 font-medium text-sm max-w-xs mx-auto leading-relaxed mb-8">
                Primero debes configurar tus áreas de trabajo para empezar a planificar.
            </p>
            <button
                onClick={onConfigure}
                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:scale-105 transition-all duration-300"
            >
                <span className="material-symbols-rounded text-base">settings</span>
                Ir a Configuración
            </button>
        </div>
    );
}
