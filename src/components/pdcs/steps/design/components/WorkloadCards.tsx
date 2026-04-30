'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface WorkloadCardsProps {
    periodsPerWeek: number;
    setPeriodsPerWeek: (val: number) => void;
    savePeriods: () => Promise<void>;
}

export function WorkloadCards({
    periodsPerWeek,
    setPeriodsPerWeek,
    savePeriods,
}: WorkloadCardsProps) {
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

    const workloadImages = [
        { label: 'Inicial', path: '/images/Carga_Horaria_Inicial.jpg', icon: 'child_care', color: 'rose' },
        { label: 'Primaria', path: '/images/Carga_Horaria_Primaria.jpg', icon: 'school', color: 'amber' },
        { label: 'Secundaria', path: '/images/Carga_Horaria_Secundaria.jpg', icon: 'menu_book', color: 'indigo' },
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Sección Superior: Acción Principal (Periodos) - Ahora Ocupa Todo el Ancho */}
            <div className="w-full">
                <Card className="p-12 border-none shadow-premium bg-white group hover:shadow-2xl transition-all duration-700 overflow-hidden relative rounded-[4rem] border border-slate-100/40">
                    <div className="absolute top-0 right-0 size-96 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:scale-125 transition-transform duration-1000" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                        <div className="space-y-8">
                            <div className="flex items-center gap-8">
                                <div className="size-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 rotate-6 group-hover:rotate-0 transition-all duration-700">
                                    <span className="material-symbols-rounded text-5xl font-black">schedule</span>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Periodos Semanales</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="size-2.5 bg-blue-500 rounded-full animate-pulse shadow-glow-blue" />
                                        <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Carga Horaria Lectiva</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-slate-500 font-bold leading-relaxed max-w-sm italic">
                                "Ingresa la cantidad total de periodos pedagógicos que impartes semanalmente para este Plan de Desarrollo Curricular."
                            </p>
                            
                            <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-3xl border border-blue-100/50 w-fit">
                                <span className="material-symbols-rounded text-blue-600">info</span>
                                <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest text-balance">Dato fundamental para el cronograma</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center py-4 w-full max-w-xl mx-auto">
                            <div className="relative w-full flex items-center gap-6 group/input">
                                <div className="flex-1 relative">
                                    <Input
                                        type="number"
                                        value={periodsPerWeek || ''}
                                        onChange={(e) => setPeriodsPerWeek(parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        className="h-32 md:h-40 px-8 text-6xl md:text-8xl font-black text-center bg-slate-50/30 border-slate-200/50 focus:border-blue-500 focus:bg-white focus:ring-[1rem] focus:ring-blue-500/5 rounded-[3rem] transition-all outline-none shadow-inner"
                                    />
                                </div>
                                
                                <div className="flex flex-col items-start min-w-[120px] space-y-1">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Sesiones</span>
                                        <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1 opacity-70">Semanales</span>
                                    </div>
                                    
                                    <button 
                                        onClick={async () => {
                                            // Ejecutar el guardado real
                                            await savePeriods();
                                            
                                            // Feedback visual mejorado
                                            const btn = document.getElementById('btn-save-periods');
                                            if (btn) {
                                                const originalContent = btn.innerHTML;
                                                btn.classList.add('bg-green-500', 'scale-105');
                                                btn.innerHTML = '<span class="material-symbols-rounded">check</span>';
                                                setTimeout(() => {
                                                    btn.classList.remove('bg-green-500', 'scale-105');
                                                    btn.innerHTML = originalContent;
                                                }, 2000);
                                            }
                                        }}
                                        id="btn-save-periods"
                                        className="mt-3 flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-95 group/btn"
                                    >
                                        <span className="material-symbols-rounded text-xl group-hover/btn:rotate-12 transition-transform">save</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest ml-2">Guardar</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Sección Inferior: Material de Referencia - Ahora en Grid Horizontal debajo */}
            <div className="space-y-8 px-4">
                <div className="flex items-center gap-6">
                    <h5 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">
                        Documentos de Apoyo Normativo
                    </h5>
                    <div className="h-px bg-gradient-to-r from-slate-200 to-transparent flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {workloadImages.map((img) => (
                        <button
                            key={img.label}
                            onClick={() => setSelectedImage(img.path)}
                            className="group relative flex flex-col items-center gap-6 p-10 bg-white border border-slate-100/80 rounded-[4rem] hover:border-blue-400 hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)] transition-all duration-700 active:scale-[0.98] text-center shadow-premium overflow-hidden"
                        >
                            {/* Background Image Preview (Subtle) */}
                            <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
                                <img src={img.path} alt="" className="w-full h-full object-cover grayscale" />
                            </div>

                            <div className={`size-24 bg-${img.color}-50/60 text-${img.color}-600 rounded-[2.5rem] flex items-center justify-center group-hover:scale-110 transition-all duration-700 group-hover:shadow-xl group-hover:shadow-${img.color}-500/20 relative z-10`}>
                                <span className="material-symbols-rounded text-5xl font-bold">{img.icon}</span>
                            </div>
                            
                            <div className="space-y-1 relative z-10">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Subsistema</p>
                                <p className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{img.label}</p>
                            </div>

                            <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 group-hover:bg-blue-600 text-slate-400 group-hover:text-white rounded-2xl transition-all duration-500 shadow-sm relative z-10">
                                <span className="material-symbols-rounded text-xl">visibility</span>
                                <span className="text-[11px] font-black uppercase tracking-widest">Ver Carga</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Modal de Previsualización Optimizado - Tamaño Ajustado */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-8 md:p-12 animate-in fade-in duration-500 backdrop-blur-xl"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)' }}
                    onClick={() => setSelectedImage(null)}
                >
                    <div 
                        className="relative max-w-4xl w-full max-h-[85vh] overflow-hidden rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(30,58,138,0.4)] bg-white p-4 animate-in zoom-in-95 duration-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Botón cerrar flotante - Más discreto */}
                        <button 
                            className="absolute top-8 right-8 z-30 size-14 bg-slate-900 hover:bg-red-600 text-white rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl hover:rotate-90 group"
                            onClick={() => setSelectedImage(null)}
                        >
                            <span className="material-symbols-rounded text-2xl font-black group-hover:scale-110 transition-transform">close</span>
                        </button>

                        <div className="overflow-auto max-h-[70vh] rounded-[2.5rem] bg-slate-50 custom-scrollbar shadow-inner border border-slate-100">
                            <img 
                                src={selectedImage} 
                                alt="Referencia Carga Horaria" 
                                className="w-full h-auto block"
                            />
                        </div>
                        
                        <div className="mt-6 flex items-center justify-center gap-4 opacity-30">
                            <div className="h-px w-12 bg-slate-400" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">PDC V3 • Referencia</p>
                            <div className="h-px w-12 bg-slate-400" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
