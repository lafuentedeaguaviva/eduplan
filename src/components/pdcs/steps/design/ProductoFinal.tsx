'use client';

import React from 'react';
import { usePdcWizard } from '@/contexts/PdcWizardContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function ProductoFinal() {
    const { 
        finalProductState, 
        setFinalProductState,
        pdcName
    } = usePdcWizard();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <Badge variant="outline" className="w-fit font-black uppercase tracking-[0.2em] text-[10px] text-amber-600 bg-amber-50 border-amber-100">
                    Paso 10: Producto Final del PDC
                </Badge>
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                        Resultado Tangible del Proceso
                    </h1>
                    <p className="text-slate-500 font-medium">Define el producto concreto que los estudiantes desarrollarán como evidencia de su aprendizaje.</p>
                </div>
            </div>

            <Card className="p-10 border-none shadow-premium bg-white rounded-[3rem] overflow-hidden relative group">
                {/* Decoration */}
                <div className="absolute top-0 right-0 size-64 bg-amber-50/50 rounded-full blur-3xl -mr-32 -mt-32 opacity-70 group-hover:scale-110 transition-transform duration-1000" />
                
                <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="size-16 bg-amber-100 rounded-[1.5rem] flex items-center justify-center shadow-soft">
                            <span className="material-symbols-rounded text-3xl text-amber-600 font-black">inventory_2</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Descripción del Producto</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PDC: {pdcName}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                         <label className="soft-label">Redacta el producto final esperado</label>
                         <textarea
                            value={finalProductState}
                            onChange={(e) => setFinalProductState(e.target.value)}
                            placeholder="Ej: Elaboración de un periódico mural sobre la alimentación saludable y su impacto en la comunidad escolar..."
                            className="w-full min-h-[250px] bg-slate-50/50 border-2 border-slate-100 rounded-[2rem] p-8 text-sm font-bold text-slate-700 outline-none focus:border-amber-400 focus:bg-white transition-all shadow-inner placeholder:text-slate-300 placeholder:italic leading-relaxed"
                         />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="p-6 bg-slate-50/80 rounded-[2rem] border border-slate-100/50 flex items-start gap-4">
                            <span className="material-symbols-rounded text-2xl text-amber-500 mt-0.5">info</span>
                            <div className="space-y-1">
                                <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Consejo Pedagógico</h4>
                                <p className="text-[11px] text-slate-500 font-bold italic leading-normal">
                                    El producto debe ser un resultado concreto, observable y que sintetice los contenidos abordados en el PDC.
                                </p>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50/80 rounded-[2rem] border border-slate-100/50 flex items-start gap-4">
                            <span className="material-symbols-rounded text-2xl text-emerald-500 mt-0.5">verified</span>
                            <div className="space-y-1">
                                <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Visibilidad</h4>
                                <p className="text-[11px] text-slate-500 font-bold italic leading-normal">
                                    Este producto se mostrará en el reporte final y servirá como eje central para la evaluación diagnóstica.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <style jsx>{`
                .soft-label {
                    display: block;
                    width: 100%;
                    @apply text-[11px] font-[900] text-slate-800 uppercase tracking-[0.2em] px-3 mb-2 font-black;
                }
            `}</style>
        </div>
    );
}
