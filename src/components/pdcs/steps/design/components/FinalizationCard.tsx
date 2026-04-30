'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface FinalizationCardProps {
    pdcName: string;
    typeConfig: any;
    trackingId: string;
}

export function FinalizationCard({ pdcName, typeConfig, trackingId }: FinalizationCardProps) {
    const items = [
        { icon: 'check_circle', label: 'Coherencia Pedagógica', color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600' },
        { icon: 'auto_fix_high', label: 'Estilo y Redacción', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600' },
        { icon: 'insights', label: 'Análisis de Resultados', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600' },
        { icon: 'description', label: 'Generación de Reporte', color: 'purple', bg: 'bg-purple-50', text: 'text-purple-600' }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-8">
                <div className="relative inline-block">
                    {/* Animated Completion Icon */}
                    <div className={`size-32 bg-${typeConfig.accent} rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl shadow-${typeConfig.color}-500/20 rotate-6 animate-bounce`}>
                        <span className="material-symbols-rounded text-6xl text-white font-black">magic_button</span>
                    </div>
                    <div className="absolute -top-3 -right-3 size-12 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-xl animate-in zoom-in duration-700 delay-500">
                        <span className="material-symbols-rounded text-white text-2xl font-black">check</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight uppercase">
                        ¡Estructura Finalizada!
                    </h2>
                    <p className="text-slate-400 font-bold text-lg max-w-2xl mx-auto leading-relaxed italic">
                        Has diseñado con éxito todos los componentes del PDC para <br />
                        <span className={`text-${typeConfig.accent} font-black text-2xl tracking-tight uppercase not-italic`}>{pdcName}</span>
                    </p>
                </div>
            </div>

            <Card className="p-0 overflow-hidden border-none shadow-premium bg-white group relative rounded-[3rem]">
                {/* Soft UI Glow Background */}
                <div className={`absolute top-0 right-0 size-96 bg-${typeConfig.color}-50/50 rounded-full blur-3xl -mr-48 -mt-48 transition-transform duration-1000 group-hover:scale-110 opacity-70`} />

                <div className="p-10 md:p-14 space-y-10 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-slate-50/50 rounded-[3rem] border border-slate-100/80 shadow-inner">
                        <div className="size-24 bg-white rounded-[2rem] flex items-center justify-center shadow-premium border border-slate-100 shrink-0 rotate-3 group-hover:rotate-0 transition-transform">
                            <span className={`material-symbols-rounded text-5xl text-${typeConfig.accent} font-black`}>psychology</span>
                        </div>
                        <div className="space-y-2 text-center md:text-left">
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Optimización Asistida</h4>
                            <p className="text-sm font-bold text-slate-500 leading-relaxed italic">
                                Tu PDC ahora está listo para la fase de refinamiento AI, donde aseguraremos la coherencia pedagógica y la calidad técnica.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map((item, idx) => (
                            <div key={idx} className="p-6 bg-white rounded-3xl border-2 border-slate-50 flex items-center gap-5 transition-all hover:shadow-soft hover:border-slate-100 group/item">
                                <div className={`size-12 ${item.bg} ${item.text} rounded-2xl flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform`}>
                                    <span className="material-symbols-rounded text-2xl font-black">{item.icon}</span>
                                </div>
                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest leading-none">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex flex-col items-center gap-6">
                        <div className="text-center space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Pulsa finalizar para proceder</p>
                            <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-xl italic">
                                Todo tu progreso ha sido guardado de forma segura en la nube. Puedes regresar a cualquier paso anterior si deseas realizar ajustes finales.
                            </p>
                        </div>

                        <Badge variant="outline" className={`font-black text-[9px] tracking-widest text-${typeConfig.accent} border-${typeConfig.color}-200 bg-white shadow-soft`}>
                            ID DE SEGUIMIENTO: {trackingId}
                        </Badge>
                    </div>
                </div>
            </Card>
        </div>
    );
}
