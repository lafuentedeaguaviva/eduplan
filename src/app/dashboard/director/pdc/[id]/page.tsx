'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PdcService } from '@/services/pdc.service';
import { FullReportData, PDCMaster, HierarchyRoot, FullReportArea, PlanificacionSemanal } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { useFeedback } from '@/hooks/useFeedback';

export default function DirectorPdcReviewPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showSuccess, showError } = useFeedback();
    
    const [pdc, setPdc] = useState<PDCMaster | null>(null);
    const [reportData, setReportData] = useState<FullReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [observations, setObservations] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const [pdcRes, reportRes] = await Promise.all([
                PdcService.getPDCs('currentUser').then(r => ({ ...r, data: r.data?.find(p => p.id === id) })), // Just for PDC master data
                PdcService.getFullReportData(id as string)
            ]);

            if (reportRes) {
                setReportData(reportRes);
                setObservations(reportRes.areas_trabajo[0] ? "" : ""); // Placeholder
            }
            setLoading(false);
        };
        loadData();
    }, [id]);

    const handleSaveObservations = async (newStatus?: string) => {
        setSaving(true);
        try {
            const res = await PdcService.updateObservations(id as string, observations);
            if (newStatus) {
                await PdcService.updatePdcMaster(id as string, { estado: newStatus as any });
            }
            
            if (res.success) {
                showSuccess('Observaciones guardadas correctamente.');
                if (newStatus) router.push('/dashboard/director');
            } else {
                showError('Error al guardar las observaciones.');
            }
        } catch (error) {
            showError('Error de red.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse">Cargando PDC...</div>;
    if (!reportData) return <div className="p-20 text-center font-black text-rose-500">No se pudo cargar la información del PDC.</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-120px)] border-t border-slate-100 mt-4 overflow-hidden">
            {/* Viewer Panel */}
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                <div className="bg-white shadow-premium p-12 rounded-3xl min-h-screen font-serif border border-slate-200">
                     {/* Header Pedagógico */}
                     <div className="text-center mb-10">
                        <p className="font-bold text-sm uppercase mb-2">{reportData.niveles}</p>
                        <h1 className="text-xl font-bold uppercase tracking-tight">PLAN DE DESARROLLO CURRICULAR</h1>
                        <div className="h-1 w-20 bg-emerald-500 mx-auto mt-4 rounded-full" />
                     </div>

                     {/* Datos Referenciales */}
                     <section className="mb-8">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 px-2">1. Datos Referenciales</h2>
                        <div className="grid grid-cols-2 border border-slate-200 rounded-2xl overflow-hidden divide-x divide-y divide-slate-200 italic text-[13px]">
                            <div className="p-4 bg-slate-50/50"><b>Distrito:</b> {reportData.distritos}</div>
                            <div className="p-4 bg-slate-50/50"><b>U.E.:</b> {reportData.unidades}</div>
                            <div className="p-4"><b>Nivel:</b> {reportData.niveles}</div>
                            <div className="p-4"><b>Grado:</b> {reportData.grados}</div>
                            <div className="p-1.5 px-4 col-span-2"><b>Docente:</b> {reportData.docente}</div>
                            <div className="p-1.5 px-4 col-span-2"><b>Director:</b> {reportData.director}</div>
                            <div className="p-1.5 px-4 col-span-2"><b>Áreas:</b> {reportData.areas}</div>
                        </div>
                     </section>

                     {/* Objetivo Holístico */}
                     <section className="mb-10">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 px-2">2. Desarrollo</h2>
                        <div className="p-6 bg-emerald-50/30 border border-emerald-100 rounded-3xl text-sm leading-relaxed text-justify relative">
                            <span className="absolute -top-3 left-6 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Objetivo Holístico</span>
                            {reportData.objetivo_holistico_nivel}
                        </div>
                     </section>

                     {/* Tablas de Áreas */}
                     {reportData.areas_trabajo.map((area) => (
                         <div key={area.id} className="mb-12">
                             <div className="flex items-center gap-3 mb-4">
                                 <div className="size-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">A</div>
                                 <h3 className="font-bold text-lg">{area.nombre}</h3>
                             </div>

                             <div className="border border-slate-200 rounded-3xl overflow-hidden">
                                 <table className="w-full text-xs border-collapse">
                                     <thead className="bg-slate-50 border-b border-slate-200">
                                         <tr>
                                             <th className="p-4 text-left border-r border-slate-200 w-1/4">Obj. Aprendizaje</th>
                                             <th className="p-4 text-left border-r border-slate-200 w-1/4">Semanas / Contenidos</th>
                                             <th className="p-4 text-left border-r border-slate-200 w-1/3">Momentos Metodológicos</th>
                                             <th className="p-4 text-left">Criterios Evaluación</th>
                                         </tr>
                                     </thead>
                                     <tbody>
                                         {area.semanas.map((semana, idx) => (
                                             <tr key={semana.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/30 transition-colors">
                                                 {idx === 0 && (
                                                     <td rowSpan={area.semanas.length} className="p-4 align-top border-r border-slate-200 italic leading-relaxed text-justify">
                                                         {area.objetivos_aprendizaje}
                                                     </td>
                                                 )}
                                                 <td className="p-4 align-top border-r border-slate-200">
                                                    <div className="font-bold mb-2 flex items-center gap-2">
                                                        <span className="size-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">W{semana.semana}</span>
                                                        Semana {semana.semana}
                                                    </div>
                                                    <div className="space-y-2 opacity-80">
                                                        {semana.semana_contenido_hier?.map(root => (
                                                            <div key={root.id}>
                                                                <p className="font-bold">{root.global_index}. {root.titulo}</p>
                                                                {root.children.map(c => (
                                                                    <p key={c.id} className="pl-3 text-[10px]">• {root.global_index}.{c.global_sub_index}. {c.titulo}</p>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                 </td>
                                                 <td className="p-4 align-top border-r border-slate-200 leading-relaxed text-justify">
                                                     {semana.momentos_ia}
                                                 </td>
                                                 {idx === 0 && (
                                                     <td rowSpan={area.semanas.length} className="p-4 align-top leading-relaxed text-justify">
                                                         {area.criterios_evaluacion}
                                                     </td>
                                                 )}
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                         </div>
                     ))}
                </div>
            </div>

            {/* Actions Sidebar */}
            <div className="w-full lg:w-80 shrink-0 space-y-6">
                <Card className="p-6 border-none shadow-premium bg-white rounded-3xl space-y-6 sticky top-0">
                    <div className="space-y-1">
                        <h3 className="font-black text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-rounded text-emerald-600">rate_review</span>
                            Acciones de Dirección
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Revisión y Seguimiento</p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Observaciones Pedagógicas</label>
                            <textarea 
                                className="w-full min-h-[200px] p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-400 transition-all resize-none italic"
                                placeholder="Escribe aquí las correcciones o recomendaciones para el docente..."
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3 pt-4">
                            <Button 
                                onClick={() => handleSaveObservations()}
                                isLoading={saving}
                                className="w-full h-12 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-black hover:bg-slate-50 gap-2"
                            >
                                <span className="material-symbols-rounded text-lg">save</span>
                                Guardar Borrador
                            </Button>

                            <div className="grid grid-cols-2 gap-3">
                                <Button 
                                    onClick={() => handleSaveObservations('Verificado')}
                                    disabled={saving}
                                    className="h-12 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 gap-2 shadow-lg shadow-emerald-500/20"
                                >
                                    <span className="material-symbols-rounded text-lg">verified</span>
                                    Verificar
                                </Button>
                                <Button 
                                    onClick={() => handleSaveObservations('Rechazado')}
                                    disabled={saving}
                                    className="h-12 rounded-2xl bg-rose-50 text-rose-600 font-black hover:bg-rose-100 gap-2 border border-rose-100"
                                >
                                    <span className="material-symbols-rounded text-lg">close</span>
                                    Rechazar
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-soft bg-slate-50/50 rounded-3xl">
                    <div className="flex items-center gap-3 text-slate-400 italic text-[11px] leading-relaxed">
                        <span className="material-symbols-rounded text-lg">info</span>
                        <span>Al verificar el PDC, el docente podrá exportarlo oficialmente con su firma digital de dirección.</span>
                    </div>
                </Card>
            </div>
        </div>
    );
}
