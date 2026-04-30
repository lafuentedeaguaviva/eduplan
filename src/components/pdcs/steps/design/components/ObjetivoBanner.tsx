'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ObjetivoBannerProps {
    objetivoNivel: string | null;
    typeConfig: { color: string; text: string; icon: string };
    colorClasses: string;
    backgroundClass: string;
}

export function ObjetivoBanner({
    objetivoNivel,
    typeConfig,
    colorClasses,
    backgroundClass
}: ObjetivoBannerProps) {
    return (
        <Card className="overflow-hidden border-none shadow-premium bg-white group relative">
            {/* Decorative Background Element */}
            <div className={`absolute -top-24 -right-24 size-64 ${backgroundClass} rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-110`} />

            <div className="relative p-8 space-y-8">
                {/* Header Info */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-2xl ${colorClasses} border flex items-center justify-center shadow-sm`}>
                                <span className="material-symbols-rounded text-2xl font-black">{typeConfig.icon}</span>
                            </div>
                            <div>
                                <Badge variant="outline" className={`font-black uppercase tracking-[0.2em] text-[10px] ${colorClasses} bg-white shadow-soft`}>
                                    Referencia de Nivel: {typeConfig.text}
                                </Badge>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-1 uppercase">
                                    Objetivo Holístico de Nivel
                                </h2>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-col items-end opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                        <span className="material-symbols-rounded text-6xl text-slate-400 font-black">psychology_alt</span>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500/20 via-blue-500/40 to-blue-500/20 rounded-full" />

                    <div className="bg-slate-50/50 rounded-[2.5rem] p-12 border border-slate-100/80 shadow-inner relative overflow-hidden group/text">
                        {/* Giant Quote Icon background */}
                        <span className="absolute -bottom-6 -right-4 material-symbols-rounded text-[14rem] text-slate-200/30 font-black pointer-events-none select-none leading-none">
                            format_quote
                        </span>

                        <div className="relative z-10">
                            {objetivoNivel ? (
                                <p className="text-xl font-bold text-slate-700 leading-relaxed text-balance italic">
                                    "{objetivoNivel}"
                                </p>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 gap-6">
                                    <div className="size-14 border-4 border-slate-200 border-t-blue-500 rounded-[1.5rem] animate-spin" />
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] italic">
                                        Sincronizando objetivo con la base ministerial...
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Helper Tag */}
                    <div className="mt-8 flex items-center gap-3 px-2">
                        <div className="size-3 bg-blue-500 rounded-full shadow-glow-blue animate-pulse" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
                            Este objetivo sirve como base estratégica para el diseño de tu PDC actual.
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
