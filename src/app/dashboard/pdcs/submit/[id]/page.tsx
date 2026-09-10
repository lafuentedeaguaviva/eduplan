'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PdcReportService } from '@/services/pdc-report.service';
import { PdcRevisionesService } from '@/services/pdc-revisiones.service';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FullReportData, FullReportArea, PlanificacionSemanal, HierarchyRoot } from '@/types';

interface Props {
    params: Promise<{ id: string }>;
}

export default function PdcSubmissionPage({ params }: Props) {
    const router = useRouter();
    const { id } = use(params);
    const searchParams = useSearchParams();
    const mode = (searchParams?.get('mode') as 'ia' | 'original') || 'ia';

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fullReportData, setFullReportData] = useState<FullReportData | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const { data: sessionData } = await AuthService.getSession();
                const uId = sessionData?.session?.user?.id;
                if (!uId) throw new Error("No hay sesión activa.");
                setUserId(uId);

                const res = await PdcReportService.getFullReportData(id, mode as any, true);
                if (!res) throw new Error("No se pudo obtener la información del PDC.");

                setFullReportData(res);
            } catch (err: any) {
                console.error("Error loading submission data:", err);
                toast.error("Error de carga", { description: err.message });
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id, mode]);

    const updateAreaData = (areaIndex: number, field: string, value: string) => {
        if (!fullReportData) return;
        const newData = { ...fullReportData };
        const area = newData.areas_trabajo[areaIndex];
        
        if (field === 'objetivos') {
            area.objetivos_aprendizaje_ia = value;
            area.objetivos_aprendizaje = value;
        } else if (field === 'criterios') {
            area.criterios_evaluacion_ia = value;
            area.criterios_evaluacion = value;
        } else if (field === 'criterios_adaptaciones') {
            area.criterios_evaluacion_adaptaciones_ia = value;
            area.criterios_evaluacion_adaptaciones = value;
        } else if (field === 'adaptaciones_no_sig') {
            area.adaptaciones_no_significativas_ia = value;
            area.adaptaciones_no_significativas = value;
        }
        
        setFullReportData(newData);
    };

    const updateWeekData = (areaIndex: number, weekIndex: number, field: string, value: string) => {
        if (!fullReportData) return;
        const newData = { ...fullReportData };
        const week = newData.areas_trabajo[areaIndex].semanas[weekIndex];

        if (field === 'momentos') {
            week.momentos_ia = value;
            week.momentos_original = value;
        } else if (field === 'recursos') {
            week.recursos_fuentes_ia = value;
            week.recursos_fuentes_original = value;
        } else if (field === 'adaptaciones_esp') {
            week.adaptaciones_especiales_ia = value;
            week.adaptaciones_especiales_original = value;
        } else if (field === 'adaptaciones_bas') {
            week.adaptaciones_basicas_ia = value;
            week.adaptaciones_basicas_original = value;
        }

        setFullReportData(newData);
    };

    const updateHolistico = (value: string) => {
        if (!fullReportData) return;
        setFullReportData({ ...fullReportData, objetivo_holistico_nivel: value });
    };

    const handleSubmit = async () => {
        if (!fullReportData || !userId) return;
        setIsSubmitting(true);
        try {
            const mainArea = fullReportData.areas_trabajo[0] || {};
            
            await PdcRevisionesService.submitForReview(
                id,
                userId,
                fullReportData.areas || mainArea.nombre || "Materia no definida",
                fullReportData.grados || '',
                fullReportData.niveles || '',
                fullReportData,
                false,
                true
            );
            
            toast.success("¡PDC enviado con éxito!", {
                description: "El director ya puede revisar tu planificación oficial."
            });
            
            setTimeout(() => {
                window.close();
            }, 2000);
        } catch (err: any) {
            toast.error("Error al enviar", { description: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <div className="size-14 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-indigo-600 font-black uppercase tracking-widest text-xs animate-pulse">Cargando Formato Oficial...</p>
            </div>
        );
    }

    if (!fullReportData) return null;

    // Detect if PDC is Multigrade based on structure or type
    const isMultigrado = fullReportData.areas_trabajo.length > 1 && 
                       new Set(fullReportData.areas_trabajo.map(a => a.grado_nombre)).size > 1;

    return (
        <div className="min-h-screen bg-slate-50 pb-32 font-sans">
            {/* Header de Control */}
            <div className="sticky top-0 z-[100] bg-white/90 backdrop-blur-2xl border-b border-slate-200 px-8 py-5">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="size-14 rounded-[1.25rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
                            <span className="material-symbols-rounded text-2xl">verified_user</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                Edición Final y Envío Oficial
                                <span className="bg-indigo-100 text-indigo-600 text-[9px] px-3 py-1 rounded-full uppercase tracking-widest font-black border border-indigo-200">
                                    Modo: {mode === 'ia' ? 'IA Optimizada' : 'Original'}
                                </span>
                                {isMultigrado && (
                                    <span className="bg-amber-100 text-amber-600 text-[9px] px-3 py-1 rounded-full uppercase tracking-widest font-black border border-amber-200">
                                        Multigrado
                                    </span>
                                )}
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Este documento es el snapshot oficial que recibirá el director</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => window.close()}
                            className="px-8 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-100"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="h-16 px-12 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest gap-4 shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all"
                        >
                            {isSubmitting ? (
                                <span className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-rounded">cloud_upload</span>
                            )}
                            Finalizar y Enviar a Dirección
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-10 py-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="bg-white rounded-[4rem] border border-slate-200 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] overflow-hidden p-16 space-y-24 relative">
                    {/* Decoraciones */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 blur-[100px] -mr-48 -mt-48 pointer-events-none rounded-full"></div>
                    
                    {/* Header del Reporte */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 relative z-10 border-b border-slate-100 pb-12">
                        <div className="space-y-6">
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
                                Plan de Desarrollo <br />
                                <span className="text-indigo-600">Curricular</span>
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className="h-1 w-20 bg-indigo-600 rounded-full"></span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Gestión Escolar {fullReportData.gestion}</span>
                            </div>
                        </div>
                    </div>

                    {/* 1. Datos Referenciales */}
                    <section className="space-y-10">
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-4 mb-10">
                            <span className="w-12 h-1 bg-blue-600 rounded-full"></span>
                            1. Datos Referenciales
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { label: 'Distrito Educativo', value: fullReportData.distritos, icon: '📍' },
                                { label: 'Unidad Educativa', value: fullReportData.unidades, icon: '🏛️' },
                                { label: 'Nivel', value: fullReportData.niveles, icon: '🎓' },
                                { label: 'Año de escolaridad', value: fullReportData.grados, icon: '📚' },
                                { label: 'Director/a', value: fullReportData.director, icon: '👤', fullWidth: true },
                                { label: 'Maestro/a', value: fullReportData.docente, icon: '👨‍🏫', fullWidth: true },
                                { label: 'Áreas', value: fullReportData.areas, icon: '🧩', fullWidth: true },
                            ].map((item, idx) => (
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
                            <div className="lg:col-span-2 glass-premium rounded-[2.5rem] p-8 border-white/50 shadow-luxe flex items-center justify-between relative overflow-hidden group transition-all duration-500 hover:-translate-y-2">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl text-white shadow-xl shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                                        📅
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black text-blue-600/70 uppercase tracking-[0.3em] block mb-1">Periodo Escolar</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl font-black text-slate-900 tracking-tighter">{fullReportData.trimestre || '1'}º</span>
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Trimestre</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right relative z-10">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-2">Vigencia Curricular</span>
                                    <div className="text-[10px] font-black tracking-[0.1em] flex items-center gap-3 justify-end">
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">____-__-__</span>
                                        <span className="opacity-20">→</span>
                                        <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">____-__-__</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. Desarrollo Curricular y Objetivo Holístico */}
                    <section className="space-y-12">
                        <header className="flex items-center justify-between pb-8">
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-4">
                                <span className="w-12 h-1 bg-indigo-600 rounded-full"></span>
                                2. Desarrollo Curricular
                            </h2>
                            <div className="bg-white text-indigo-600 text-[10px] font-black px-6 py-2.5 rounded-2xl border border-slate-100 uppercase tracking-[0.2em] shadow-sm">
                                Reporte Analítico Digital
                            </div>
                        </header>

                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3 relative z-10">
                                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></span>
                                Objetivo Holístico de Nivel
                            </h3>
                            
                            <div className="relative group/textarea z-10">
                                <textarea 
                                    value={fullReportData.objetivo_holistico_nivel || ''}
                                    onChange={(e) => updateHolistico(e.target.value)}
                                    rows={4}
                                    className="w-full bg-slate-50/50 backdrop-blur-sm px-8 py-6 rounded-[1.5rem] border border-slate-100 italic text-slate-800 leading-relaxed text-sm font-semibold shadow-inner focus:outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none"
                                    placeholder="Redacta el objetivo holístico aquí..."
                                />
                                <div className="absolute top-4 right-4 opacity-0 group-hover/textarea:opacity-100 transition-opacity">
                                    <span className="material-symbols-rounded text-indigo-400 text-lg bg-white rounded-full p-1 shadow-sm border border-slate-100">edit_note</span>
                                </div>
                            </div>
                        </div>

                        {isMultigrado ? (
                            <div className="space-y-16">
                                <EditableMultigradeTable 
                                    fullReportData={fullReportData} 
                                    mode={mode}
                                    onUpdateWeek={updateWeekData}
                                />
                                <div className="space-y-12">
                                    {fullReportData.areas_trabajo.map((area, aIdx) => (
                                        <div key={`adapt-${area.id}`}>
                                            <SignificativeAdaptationsEditor 
                                                area={area} 
                                                mode={mode} 
                                                onUpdateWeek={(wIdx, field, val) => updateWeekData(aIdx, wIdx, field, val)}
                                                onUpdateArea={(field, val) => updateAreaData(aIdx, field, val)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            fullReportData.areas_trabajo.map((area, aIdx) => (
                                <div key={area.id} className="space-y-8">
                                {/* Area Header with Luxe Gradient */}
                                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-10 py-8 border-b border-white/10 flex items-center justify-between relative overflow-hidden rounded-t-[2.5rem]">
                                    <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none"></div>
                                    <h4 className="text-2xl font-black text-white flex items-center gap-6 relative z-10 tracking-tight uppercase">
                                        <span className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-xl text-[10px] uppercase font-black border border-white/20 shadow-inner-white tracking-widest">Área Curricular</span>
                                        {area.nombre}
                                    </h4>
                                    <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/70 relative z-10">
                                        <span>Carga Horaria: <b className="text-white bg-blue-800/40 px-3 py-1 rounded-lg ml-2">{area.periodo_semanal} hrs</b></span>
                                    </div>
                                </div>

                                {/* Table Body */}
                                <div className="overflow-x-auto bg-white rounded-b-[2.5rem] shadow-xl border border-t-0 border-slate-100">
                                    <table className="w-full text-xs text-left border-separate border-spacing-y-2 px-6 pb-6">
                                        <thead>
                                            <tr className="text-slate-400 font-black uppercase text-[9px] tracking-[0.3em]">
                                                <th className="px-6 py-6 w-[15%]">Misión / Objetivos</th>
                                                <th className="px-6 py-6 w-[15%]">Estructura Temática</th>
                                                <th className="px-6 py-6 w-[25%]">Momentos del Proceso Formativo</th>
                                                <th className="px-6 py-6 w-[20%]">Recursos y Fuentes</th>
                                                <th className="px-6 py-6 w-[25%] text-right">Resultados Esperados</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-slate-600">
                                            {area.semanas.length > 0 ? area.semanas.map((semana, sIdx) => (
                                                <tr key={semana.id} className="group/row transition-all duration-500">
                                                    {sIdx === 0 && (
                                                        <td rowSpan={area.semanas.length} className="px-8 py-8 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 align-top group-hover/row:bg-white transition-all shadow-sm">
                                                            <textarea 
                                                                value={(mode === 'ia' ? area.objetivos_aprendizaje_ia : area.objetivos_aprendizaje) || ''}
                                                                onChange={(e) => updateAreaData(aIdx, 'objetivos', e.target.value)}
                                                                className="w-full h-full min-h-[300px] bg-transparent text-[11px] font-bold text-slate-800 leading-relaxed italic resize-none focus:outline-none"
                                                                placeholder="Objetivos de aprendizaje..."
                                                            />
                                                        </td>
                                                    )}

                                                    <td className="px-8 py-8 align-top">
                                                        <div className="inline-flex items-center px-4 py-1.5 rounded-xl bg-blue-600 text-white font-black text-[9px] mb-6 uppercase tracking-[0.2em] shadow-lg shadow-blue-500/30">
                                                            Mes {semana.mes} - Semana {semana.semana}
                                                        </div>
                                                        <div className="space-y-6">
                                                            {semana.semana_contenido_hier?.map((root: HierarchyRoot) => (
                                                                <div key={root.id} className="space-y-3">
                                                                    <div className="font-black text-slate-900 text-[11px] tracking-tight border-l-2 border-blue-500 pl-3">
                                                                        {root.global_index}. {root.titulo}
                                                                    </div>
                                                                    {root.children?.map(child => (
                                                                        <div key={child.id} className="pl-6 flex gap-3 items-start text-[10px] text-slate-500 font-medium">
                                                                            <span className="text-blue-300 font-black opacity-40 shrink-0">└</span>
                                                                            <span>{child.titulo}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                            {(!semana.semana_contenido_hier || semana.semana_contenido_hier.length === 0) && (
                                                                <p className="text-[9px] text-slate-400 italic border-l-2 border-slate-200 pl-3">Sin contenidos vinculados</p>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-8 py-8 align-top bg-white/40 group-hover/row:bg-white rounded-[1.5rem] border border-transparent group-hover/row:border-blue-100 transition-all">
                                                        <textarea 
                                                            value={(mode === 'ia' ? semana.momentos_ia : semana.momentos_original) || ''}
                                                            onChange={(e) => updateWeekData(aIdx, sIdx, 'momentos', e.target.value)}
                                                            className="w-full min-h-[250px] bg-transparent text-[11px] leading-relaxed font-semibold text-slate-700 italic resize-none focus:outline-none focus:text-indigo-600"
                                                            placeholder="Redacta los momentos metodológicos..."
                                                        />
                                                    </td>

                                                    <td className="px-8 py-8 align-top bg-slate-50/30 group-hover/row:bg-white rounded-[1.5rem] border border-transparent group-hover/row:border-blue-50 transition-all">
                                                        <textarea 
                                                            value={(mode === 'ia' ? semana.recursos_fuentes_ia : semana.recursos_fuentes_original) || ''}
                                                            onChange={(e) => updateWeekData(aIdx, sIdx, 'recursos', e.target.value)}
                                                            className="w-full min-h-[250px] bg-transparent text-[11px] leading-relaxed font-semibold text-slate-500 italic resize-none focus:outline-none"
                                                            placeholder="Listado de recursos..."
                                                        />
                                                    </td>

                                                    {sIdx === 0 && (
                                                        <td rowSpan={area.semanas.length} className="px-8 py-8 align-top text-right">
                                                            <div className="inline-flex flex-col bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-[2rem] p-8 h-full min-h-[300px] shadow-2xl shadow-slate-900/10 max-w-[280px]">
                                                                <span className="text-blue-400 text-[9px] font-black mb-4 block uppercase tracking-widest text-left">Criterios de Evaluación</span>
                                                                <textarea 
                                                                    value={(mode === 'ia' ? area.criterios_evaluacion_ia : area.criterios_evaluacion) || ''}
                                                                    onChange={(e) => updateAreaData(aIdx, 'criterios', e.target.value)}
                                                                    className="w-full flex-1 min-h-[200px] bg-transparent text-[11px] font-bold text-white leading-relaxed text-right resize-none focus:outline-none"
                                                                    placeholder="Resultados esperados..."
                                                                />
                                                            </div>
                                                        </td>
                                                    )}
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">
                                                            No hay semanas planificadas para este trimestre/gestión.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Adaptaciones No Significativas */}
                                    <div className="bg-amber-50 rounded-[2rem] p-10 border border-amber-100 space-y-4">
                                        <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-3">
                                            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                            Adaptaciones Curriculares No Significativas
                                        </h5>
                                        <textarea 
                                            value={(mode === 'ia' ? area.adaptaciones_no_significativas_ia : area.adaptaciones_no_significativas) || ''}
                                            onChange={(e) => updateAreaData(aIdx, 'adaptaciones_no_sig', e.target.value)}
                                            className="w-full bg-transparent text-xs text-slate-700 italic font-medium leading-relaxed outline-none resize-none focus:text-amber-700"
                                            placeholder="Escribe adaptaciones generales aquí..."
                                            rows={2}
                                        />
                                    </div>

                                    {/* Significative Adaptations Table */}
                                    <SignificativeAdaptationsEditor 
                                        area={area} 
                                        mode={mode} 
                                        onUpdateWeek={(wIdx, field, val) => updateWeekData(aIdx, wIdx, field, val)}
                                        onUpdateArea={(field, val) => updateAreaData(aIdx, field, val)}
                                    />
                                </div>
                            ))
                        )}
                    </section>

                    {/* Footer con Firmas */}
                    <div className="grid grid-cols-2 gap-32 pt-20 border-t border-slate-100">
                        <div className="text-center space-y-6">
                            <div className="h-px w-64 bg-slate-200 mx-auto" />
                            <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Sello y Firma Dirección</p>
                        </div>
                        <div className="text-center space-y-6">
                            <div className="h-px w-64 bg-slate-200 mx-auto" />
                            <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Firma del Maestro(a)</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Float Action */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10">
                <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="h-20 px-20 rounded-full bg-slate-900 hover:bg-black text-white font-black text-sm uppercase tracking-widest gap-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] active:scale-95 transition-all group"
                >
                    {isSubmitting ? "Enviando..." : "Proceder al Envío Oficial"}
                    <span className="material-symbols-rounded text-indigo-400 group-hover:translate-x-2 transition-transform">send</span>
                </Button>
            </div>
        </div>
    );
}

function SectionHeader({ number, title, icon, color }: { number: string, title: string, icon: string, color: string }) {
    return (
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-5">
                <span className={cn("size-10 rounded-xl flex items-center justify-center text-white text-sm shadow-lg", 
                    color === 'blue' ? 'bg-blue-600 shadow-blue-500/30' : 'bg-indigo-600 shadow-indigo-500/30'
                )}>
                    {number}
                </span>
                {title}
            </h2>
            <div className="flex items-center gap-3 text-slate-400">
                <span className="material-symbols-rounded text-xl">{icon}</span>
                <div className="w-12 h-0.5 bg-slate-100 rounded-full"></div>
            </div>
        </div>
    );
}

function EditableMultigradeTable({ fullReportData, mode, onUpdateWeek }: { 
    fullReportData: FullReportData, 
    mode: 'ia' | 'original',
    onUpdateWeek: (aIdx: number, wIdx: number, field: string, val: string) => void
}) {
    const allGrades = Array.from(new Set(fullReportData.areas_trabajo.map(a => a.grado_nombre))).sort();
    const allAreaNames = Array.from(new Set(fullReportData.areas_trabajo.map(a => a.nombre))).sort();
    const maxWeeks = Math.max(...fullReportData.areas_trabajo.map(a => a.semanas.length), 0);
    const weekNumbers = Array.from({ length: maxWeeks }, (_, i) => i + 1);

    return (
        <div className="overflow-hidden rounded-[3rem] border border-slate-200 bg-white shadow-xl">
            <table className="w-full text-xs text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">
                        <th className="px-6 py-5 border-r border-slate-100 text-center bg-slate-50/80" rowSpan={2}>Semana</th>
                        <th className="px-6 py-5 border-r border-slate-100 text-center bg-slate-50/80" rowSpan={2}>Áreas</th>
                        <th className="px-6 py-4 border-b border-slate-100 text-center bg-blue-50/50 text-blue-800 font-black tracking-widest" colSpan={allGrades.length}>
                            Integración de Contenidos Curriculares por Años de Escolaridad
                        </th>
                    </tr>
                    <tr className="bg-slate-50/30 text-slate-400 font-black uppercase text-[8px] tracking-[0.15em]">
                        {allGrades.map(grado => (
                            <th key={grado} className="px-6 py-4 border-r border-slate-100 text-center min-w-[200px]">
                                {grado}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-slate-600">
                    {weekNumbers.map((weekNum) => (
                        <WeekRows 
                            key={weekNum}
                            weekNum={weekNum}
                            allGrades={allGrades}
                            allAreaNames={allAreaNames}
                            fullReportData={fullReportData}
                            mode={mode}
                            onUpdateWeek={onUpdateWeek}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function WeekRows({ weekNum, allGrades, allAreaNames, fullReportData, mode, onUpdateWeek }: { 
    weekNum: number, 
    allGrades: string[], 
    allAreaNames: string[],
    fullReportData: FullReportData,
    mode: 'ia' | 'original',
    onUpdateWeek: (aIdx: number, wIdx: number, field: string, val: string) => void
}) {
    return (
        <>
            {allAreaNames.map((areaName, aIdx) => {
                const matchingAreas = fullReportData.areas_trabajo.filter(at => at.nombre === areaName);
                
                return (
                    <tr key={`${weekNum}-${areaName}`} className="border-t border-slate-50 group/row hover:bg-blue-50/20 transition-colors">
                        {aIdx === 0 && (
                            <td 
                                rowSpan={allAreaNames.length} 
                                className="px-6 py-8 border-r border-slate-100 align-middle text-center font-black text-amber-600 bg-slate-50/50"
                            >
                                <div className="vertical-text rotate-180 [writing-mode:vertical-lr] uppercase tracking-[0.2em] text-[10px]">
                                    Semana {weekNum}
                                </div>
                            </td>
                        )}
                        <td className="px-6 py-6 border-r border-slate-100 align-middle font-black text-slate-800 bg-slate-50/10">
                            {areaName}
                        </td>
                        {allGrades.map((grado) => {
                            const atGlobalIdx = fullReportData.areas_trabajo.findIndex(ma => ma.nombre === areaName && ma.grado_nombre === grado);
                            const at = fullReportData.areas_trabajo[atGlobalIdx];
                            const sIdx = at?.semanas.findIndex(s => s.semana === weekNum);
                            const semana = at?.semanas[sIdx];
                            
                            return (
                                <td key={grado} className="px-6 py-6 border-r border-slate-100 align-top">
                                    {semana ? (
                                        <div className="space-y-6">
                                            {/* Contenidos - Read Only */}
                                            <div className="space-y-2">
                                                {semana.semana_contenido_hier?.map((root: HierarchyRoot) => (
                                                    <div key={root.id} className="space-y-1">
                                                        <div className="font-black text-slate-800 text-[10px] flex gap-2 tracking-tight">
                                                            <span className="text-amber-500">•</span>
                                                            <span>{root.titulo}</span>
                                                        </div>
                                                        {root.children?.map((child) => (
                                                            <div key={child.id} className="pl-4 flex gap-3 items-start text-[9px] text-slate-500 font-medium">
                                                                <span className="opacity-30 text-blue-400 font-black">└</span>
                                                                <span>{child.titulo}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                                {(!semana.semana_contenido_hier || semana.semana_contenido_hier.length === 0) && (
                                                    <span className="text-[9px] text-slate-400 italic">Sin contenidos</span>
                                                )}
                                            </div>

                                            {/* Momentos - Editable */}
                                            <div className="space-y-2 pt-4 border-t border-slate-100">
                                                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Metodología</span>
                                                <textarea 
                                                    value={(mode === 'ia' ? semana.momentos_ia : semana.momentos_original) || ''}
                                                    onChange={(e) => onUpdateWeek(atGlobalIdx, sIdx, 'momentos', e.target.value)}
                                                    className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-medium text-slate-700 italic border border-transparent focus:border-indigo-200 outline-none resize-none"
                                                    rows={4}
                                                    placeholder="Momentos..."
                                                />
                                            </div>

                                            {/* Recursos - Editable */}
                                            <div className="space-y-2">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Recursos</span>
                                                <textarea 
                                                    value={(mode === 'ia' ? semana.recursos_fuentes_ia : semana.recursos_fuentes_original) || ''}
                                                    onChange={(e) => onUpdateWeek(atGlobalIdx, sIdx, 'recursos', e.target.value)}
                                                    className="w-full bg-slate-50 rounded-xl p-3 text-[10px] font-medium text-slate-500 italic border border-transparent focus:border-slate-200 outline-none resize-none"
                                                    rows={2}
                                                    placeholder="Recursos..."
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full opacity-10">
                                            <div className="w-8 h-px bg-slate-400"></div>
                                        </div>
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                );
            })}
        </>
    );
}

function SignificativeAdaptationsEditor({ 
    area, 
    mode, 
    onUpdateWeek,
    onUpdateArea
}: { 
    area: FullReportArea, 
    mode: 'ia' | 'original',
    onUpdateWeek: (wIdx: number, field: string, val: string) => void,
    onUpdateArea: (field: string, val: string) => void
}) {
    const hasAdaptations = area.semanas && area.semanas.length > 0;
    
    if (!hasAdaptations) return null;

    return (
        <div className="mt-12 overflow-hidden rounded-[3rem] border border-emerald-200 bg-white shadow-2xl">
            <table className="w-full text-xs text-left border-collapse">
                <thead>
                    <tr>
                        <th colSpan={4} className="px-8 py-6 bg-emerald-600 text-white text-center font-black uppercase tracking-[0.2em] text-xs">
                            ADAPTACIONES CURRICULARES SIGNIFICATIVAS (EDITABLE)
                        </th>
                    </tr>
                    <tr className="bg-emerald-50 text-emerald-800 font-black text-center text-[9px] uppercase tracking-widest">
                        <th className="px-6 py-4 border border-emerald-100 w-1/4">Contenidos</th>
                        <th className="px-6 py-4 border border-emerald-100 w-1/4">Discapacidad/TDH/TEA y otros</th>
                        <th className="px-6 py-4 border border-emerald-100 w-1/4">Adaptación</th>
                        <th className="px-6 py-4 border border-emerald-100 w-1/4">Criterio de evaluación</th>
                    </tr>
                </thead>
                <tbody>
                    {area.semanas.map((s, idx, all) => {
                        return (
                            <tr key={s.id} className="border-b border-emerald-50">
                                <td className="px-8 py-8 border border-emerald-100 align-top bg-emerald-50/10">
                                    <span className="font-black text-emerald-700 block mb-4 text-[10px]">MES {s.mes} - S{s.semana}</span>
                                    <div className="space-y-3">
                                        {s.semana_contenido_hier?.map(root => (
                                            <div key={root.id}>
                                                <p className="text-[10px] font-black text-slate-800 leading-tight">• {root.titulo}</p>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-8 py-8 border border-emerald-100 align-top">
                                    <textarea 
                                        value={(mode === 'ia' ? s.adaptaciones_especiales_ia : s.adaptaciones_especiales_original) || ''}
                                        onChange={(e) => onUpdateWeek(idx, 'adaptaciones_esp', e.target.value)}
                                        className="w-full min-h-[100px] bg-transparent text-[11px] font-medium text-slate-700 italic leading-relaxed outline-none resize-none"
                                        placeholder="Descripción de la NEE..."
                                    />
                                </td>
                                <td className="px-8 py-8 border border-emerald-100 align-top">
                                    <textarea 
                                        value={(mode === 'ia' ? s.adaptaciones_basicas_ia : s.adaptaciones_basicas_original) || ''}
                                        onChange={(e) => onUpdateWeek(idx, 'adaptaciones_bas', e.target.value)}
                                        className="w-full min-h-[100px] bg-transparent text-[11px] font-medium text-slate-700 leading-relaxed outline-none resize-none"
                                        placeholder="Adaptación realizada..."
                                    />
                                </td>
                                {idx === 0 && (
                                    <td rowSpan={all.length} className="px-8 py-8 border border-emerald-100 align-top bg-emerald-50/20">
                                        <textarea 
                                            value={(mode === 'ia' ? area.criterios_evaluacion_adaptaciones_ia : area.criterios_evaluacion_adaptaciones) || ''}
                                            onChange={(e) => onUpdateArea('criterios_adaptaciones', e.target.value)}
                                            className="w-full min-h-[200px] bg-transparent text-[11px] font-bold text-emerald-800 italic leading-relaxed outline-none resize-none"
                                            placeholder="Criterios para adaptaciones..."
                                        />
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
