'use client';

import React from 'react';

interface WeekSidebarProps {
    activeWeek: number;
    setActiveWeek: (week: number) => void;
    weekContentsMap: Record<string, any>;
    typeConfig: {
        color: string;
        accent: string;
        light: string;
        hex?: string;
    };
}

export function WeekSidebar({ activeWeek, setActiveWeek, weekContentsMap, typeConfig }: WeekSidebarProps) {
    const sortedWeeks = Object.keys(weekContentsMap).sort((a, b) => Number(a) - Number(b));

    // Mapa de colores hex para los estilos inline (evita purging de Tailwind con clases dinámicas)
    const accentHexMap: Record<string, string> = {
        'blue': '#3b82f6',
        'rose': '#f43f5e',
        'violet': '#8b5cf6',
        'emerald': '#10b981',
        'amber': '#f59e0b',
        'cyan': '#06b6d4',
        'indigo': '#6366f1',
    };
    const accentHex = typeConfig.hex || accentHexMap[typeConfig.color] || '#3b82f6';

    return (
        <div className="lg:col-span-1 sticky top-24 self-start">
            <div className="bg-white rounded-[2rem] p-3 border border-slate-100 shadow-soft flex flex-col gap-2">

                {/* Week buttons */}
                <div className="flex flex-col gap-1.5">
                    {sortedWeeks.map(week => {
                        const isActive = activeWeek === Number(week);
                        const hasContent = weekContentsMap[week] && Object.values(weekContentsMap[week]).some((arr: any) => arr?.length > 0);

                        return (
                            <button
                                key={week}
                                onClick={() => setActiveWeek(Number(week))}
                                title={`Semana ${week}`}
                                style={isActive ? {
                                    background: `linear-gradient(135deg, ${accentHex}ee, ${accentHex}cc)`,
                                    boxShadow: `0 8px 24px ${accentHex}33`,
                                    borderColor: accentHex,
                                } : {}}
                                className={`relative w-full flex flex-col items-center justify-center py-3 rounded-2xl border-2 font-black transition-all duration-300 group ${isActive
                                    ? 'text-white scale-105 border-transparent'
                                    : 'bg-slate-50/80 border-transparent text-slate-400 hover:bg-white hover:border-slate-200 hover:text-slate-600 hover:scale-105'
                                    }`}
                            >
                                <span className={`text-[8px] uppercase tracking-widest leading-none mb-1 font-black transition-opacity ${isActive ? 'opacity-70' : 'opacity-50'}`}>
                                    Sem
                                </span>
                                <span className="text-lg leading-none font-black">{week}</span>

                                {/* Indicador de contenido guardado */}
                                {hasContent && (
                                    <div
                                        className={`absolute top-1.5 right-1.5 size-2 rounded-full transition-all ${isActive ? 'bg-white/70' : 'bg-emerald-400 shadow-sm shadow-emerald-400/50'}`}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
