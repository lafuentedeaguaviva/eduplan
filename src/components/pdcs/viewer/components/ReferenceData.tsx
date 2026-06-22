'use client';

import { Pdc, FullReportData } from '@/types';

interface ReferenceDataProps {
    initialPdc: Pdc;
    fullReportData: FullReportData;
    viewMode?: 'ia' | 'original';
}

export default function ReferenceData({ initialPdc, fullReportData, viewMode = 'ia' }: ReferenceDataProps) {
    const infoItems = [
        { label: 'Distrito Educativo', value: fullReportData.distritos, icon: '📍' },
        { label: 'Unidad Educativa', value: fullReportData.unidades, icon: '🏛️' },
        { label: 'Nivel', value: fullReportData.niveles, icon: '🎓' },
        { label: 'Año de escolaridad', value: fullReportData.grados, icon: '📚' },
        { label: 'Director/a', value: fullReportData.director, icon: '👤', fullWidth: true },
        { label: 'Maestro/a', value: fullReportData.docente, icon: '👨‍🏫', fullWidth: true },
        { label: 'Áreas', value: fullReportData.areas, icon: '🧩', fullWidth: true },
    ];

    return (
        <section className="space-y-10 animate-fade-in-up">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-4 mb-10">
                <span className="w-12 h-1 bg-blue-600 rounded-full"></span>
                1. Datos Referenciales
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {infoItems.map((item, idx) => (
                    <div 
                        key={idx} 
                        className={`glass-premium rounded-[2rem] p-6 border-white/50 hover:border-blue-400 transition-all duration-500 group hover:-translate-y-2 shadow-luxe ${item.fullWidth ? 'lg:col-span-2' : ''}`}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-3xl group-hover:scale-125 transition-transform duration-500 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100">{item.icon}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{item.label}</span>
                        </div>
                        <p className="text-sm font-black text-slate-800 tracking-tight leading-tight group-hover:text-blue-600 transition-colors uppercase">
                            {item.value || 'N/A'}
                        </p>
                    </div>
                ))}
                
                {/* Time Period Luxe Card */}
                <div className="lg:col-span-2 glass-premium rounded-[2.5rem] p-8 border-white/50 shadow-luxe flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl text-white shadow-xl shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                            📅
                        </div>
                        <div>
                            <span className="text-[9px] font-black text-blue-600/70 uppercase tracking-[0.3em] block mb-1">Periodo Escolar</span>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-slate-900 tracking-tighter">{initialPdc.trimestre}º</span>
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Trimestre<br/>{initialPdc.mes}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right relative z-10">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-2">Vigencia Curricular</span>
                        <div className="text-[10px] font-black tracking-[0.1em] flex items-center gap-3 justify-end">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">{initialPdc.fecha_inicio || '____'}</span>
                            <span className="opacity-20">→</span>
                            <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">{initialPdc.fecha_fin || '____'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
