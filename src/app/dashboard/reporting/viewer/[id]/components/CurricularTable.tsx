'use client';

import { Pdc, FullReportData, FullReportArea, PlanificacionSemanal, HierarchyRoot } from '@/types';
import MultigradeCurricularTable from './MultigradeCurricularTable';
import { formatCurricularText } from '@/lib/formatText';

interface CurricularTableProps {
    fullReportData: FullReportData;
    initialPdc: Pdc;
    viewMode?: 'ia' | 'original';
}

export default function CurricularTable({ fullReportData, initialPdc, viewMode = 'ia' }: CurricularTableProps) {
    const isMultigrado = initialPdc.tipo_pdc_id === 4;

    return (
        <section className="space-y-16 animate-fade-in-up">
            {!isMultigrado && (
                <header className="flex items-center justify-between pb-8">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-[0.3em] flex items-center gap-4">
                        <span className="w-12 h-1 bg-indigo-600 rounded-full"></span>
                        2. Desarrollo Curricular
                    </h2>
                    <div className="glass-premium text-indigo-600 text-[10px] font-black px-6 py-2.5 rounded-2xl border-white/50 uppercase tracking-[0.2em] shadow-luxe">
                        Reporte Analítico Digital
                    </div>
                </header>
            )}

            <div className="glass-premium rounded-[2.5rem] p-10 border-white/50 shadow-luxe relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                     <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></span>
                     Objetivo Holístico de Nivel
                </h3>
                <div className="bg-slate-50/50 backdrop-blur-sm px-8 py-6 rounded-[1.5rem] border border-slate-100 italic text-slate-800 leading-relaxed text-sm font-semibold shadow-inner-white">
                    {fullReportData.objetivo_holistico_nivel || "No definido"}
                </div>
            </div>

            {isMultigrado ? (
                <MultigradeCurricularTable fullReportData={fullReportData} />
            ) : (
                fullReportData.areas_trabajo.map((area: FullReportArea) => (
                <div key={area.id} className="space-y-10">
                    <div className="relative overflow-hidden rounded-[2.5rem] border-white/50 bg-white/70 backdrop-blur-xl shadow-luxe group">
                        {/* Area Header with Luxe Gradient */}
                        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-10 py-8 border-b border-white/10 flex items-center justify-between relative overflow-hidden">
                            <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none"></div>
                            <h4 className="text-2xl font-black text-white flex items-center gap-6 relative z-10 tracking-tight uppercase">
                                <span className="bg-white/10 backdrop-blur-md text-white px-4 py-1.5 rounded-xl text-[10px] uppercase font-black border border-white/20 shadow-inner-white tracking-widest">Área Curricular</span>
                                {area.nombre}
                            </h4>
                            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/70 relative z-10">
                                <span>Carga Horaria: <b className="text-white bg-blue-800/40 px-3 py-1 rounded-lg ml-2">{area.periodo_semanal} hrs</b></span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
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
                                    {(area.semanas || []).map((semana: PlanificacionSemanal, sIdx: number) => (
                                        <tr key={semana.id} className="group/row transition-all duration-500">
                                            {(() => {
                                                const hasPerWeekObj = viewMode === 'ia' 
                                                    ? semana.objetivos_aprendizaje_ia !== undefined 
                                                    : semana.objetivos_aprendizaje !== undefined;
                                                
                                                if (hasPerWeekObj) {
                                                    return (
                                                        <td className="px-8 py-8 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 align-top group-hover/row:bg-white transition-all shadow-sm">
                                                            <div className="text-[11px] leading-relaxed italic font-bold text-slate-800 opacity-90">
                                                                {viewMode === 'ia' ? semana.objetivos_aprendizaje_ia : semana.objetivos_aprendizaje}
                                                            </div>
                                                        </td>
                                                    );
                                                } else {
                                                    if (sIdx === 0) {
                                                        return (
                                                            <td rowSpan={area.semanas.length} className="px-8 py-8 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 align-top group-hover/row:bg-white transition-all shadow-sm">
                                                                <div className="text-[11px] leading-relaxed italic font-bold text-slate-800 opacity-90 whitespace-pre-wrap">
                                                                    {viewMode === 'ia' ? area.objetivos_aprendizaje_ia : area.objetivos_aprendizaje}
                                                                </div>
                                                            </td>
                                                        );
                                                    }
                                                    return null;
                                                }
                                            })()}
                                            
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
                                                            {root.children?.map((child) => (
                                                                <div key={child.id} className="pl-6 flex gap-3 items-start text-[10px] text-slate-500 font-medium">
                                                                    <span className="text-blue-300 font-black opacity-40 shrink-0">└</span>
                                                                    <span>{child.titulo}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="px-8 py-8 align-top whitespace-pre-wrap text-[11px] leading-relaxed font-semibold text-slate-700 italic bg-white/40 group-hover/row:bg-white rounded-[1.5rem] border border-transparent group-hover/row:border-blue-100 transition-all">
                                                {formatCurricularText(viewMode === 'ia' ? (semana.momentos_ia || semana.momentos_original) : semana.momentos_original)}
                                            </td>

                                            <td className="px-8 py-8 align-top whitespace-pre-wrap text-[11px] leading-relaxed font-semibold text-slate-500 italic bg-slate-50/30 group-hover/row:bg-white rounded-[1.5rem] border border-transparent group-hover/row:border-blue-50 transition-all">
                                                {formatCurricularText(viewMode === 'ia' ? (semana.recursos_fuentes_ia || semana.recursos_fuentes_original) : semana.recursos_fuentes_original)}
                                            </td>

                                            {sIdx === 0 && (
                                                <td rowSpan={area.semanas.length} className="px-8 py-8 align-top text-right">
                                                    <div className="inline-block bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-[2rem] p-8 text-[11px] leading-relaxed font-bold shadow-2xl shadow-slate-900/10 max-w-[280px]">
                                                        <span className="text-blue-400 text-[9px] font-black mb-3 block uppercase tracking-widest">Criterios de Evaluación</span>
                                                        <div className="whitespace-pre-wrap">{formatCurricularText(viewMode === 'ia' ? area.criterios_evaluacion_ia : area.criterios_evaluacion)}</div>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Non-Significative Adaptations Block */}
                    {(() => {
                        const adaptNoSig = viewMode === 'ia' ? area.adaptaciones_no_significativas_ia : area.adaptaciones_no_significativas;
                        if (!adaptNoSig || adaptNoSig === 'No definido' || adaptNoSig === 'Ninguna') return null;
                        
                        return (
                            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 shadow-lg shadow-amber-900/5">
                                <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                    Adaptaciones Curriculares
                                </h5>
                                <p className="text-xs text-slate-600 italic font-medium leading-relaxed">
                                    {formatCurricularText(adaptNoSig)}
                                </p>
                            </div>
                        );
                    })()}

                    {/* Significative Adaptations Table */}
                                    <SignificativeAdaptations area={area} viewMode={viewMode} />
                                </div>
                            ))
                        )}
                    </section>
                );
            }

function SignificativeAdaptations({ area, viewMode }: { area: FullReportArea, viewMode: 'ia' | 'original' }) {
    const hasAdaptations = (area.semanas || []).some((s: PlanificacionSemanal) => 
        viewMode === 'ia' 
        ? (s.adaptaciones_especiales_ia || s.adaptaciones_basicas_ia)
        : (s.adaptaciones_especiales_original || s.adaptaciones_basicas_original)
    );
    
    if (!hasAdaptations) return null;

    return (
        <div className="mt-8 overflow-x-auto rounded-3xl border border-emerald-200 bg-white shadow-xl shadow-emerald-900/5">
            <table className="w-full text-xs text-left border-collapse">
                <thead>
                    <tr>
                        <th colSpan={4} className="px-8 py-4 bg-emerald-600 text-white text-center font-black uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-emerald-600/20">
                            ADAPTACIONES CURRICULARES SIGNIFICATIVAS
                        </th>
                    </tr>
                    <tr className="bg-emerald-50 text-emerald-700 font-black text-center text-[10px] uppercase tracking-widest">
                        <th className="px-4 py-4 border border-emerald-100 w-1/4">Contenidos</th>
                        <th className="px-4 py-4 border border-emerald-100 w-1/4">Discapacidad/TDH/TEA y otros</th>
                        <th className="px-4 py-4 border border-emerald-100 w-1/4">Adaptación</th>
                        <th className="px-4 py-4 border border-emerald-100 w-1/4">Criterio de evaluación</th>
                    </tr>
                </thead>
                <tbody className="text-slate-600">
                    {(() => {
                        const globalEspecialAdaps = area.semanas.flatMap((w: any) => Array.isArray(w.adaptaciones_basicas) ? w.adaptaciones_basicas.filter((a: any) => a.tipo?.toLowerCase() === 'especial') : []);
                        const globalSituacionEspecial = [...new Set(globalEspecialAdaps.map((a: any) => a.situacion).filter(Boolean))].join('\n\n');

                        return area.semanas.filter((s:PlanificacionSemanal) => 
                            viewMode === 'ia' 
                            ? (s.adaptaciones_especiales_ia || s.adaptaciones_basicas_ia)
                            : (s.adaptaciones_especiales_original || s.adaptaciones_basicas_original)
                        ).map((s: PlanificacionSemanal, idx: number, filteredWeeks: any[]) => {
                            const displayDiscapacidad = globalSituacionEspecial || (viewMode === 'ia' ? s.adaptaciones_especiales_ia : s.adaptaciones_especiales_original);
                            
                            return (
                        <tr key={s.id} className="border-b border-emerald-50 hover:bg-emerald-50/30 transition-colors">
                            <td className="px-6 py-6 border border-emerald-100 align-top">
                                <span className="font-black text-emerald-600 block mb-2 tracking-tighter">Mes {s.mes} - Semana {s.semana}</span>
                                <div className="space-y-2">
                                    {s.semana_contenido_hier?.map((root: HierarchyRoot) => (
                                        <div key={root.id}>
                                            <div className="font-black text-[10px] text-slate-800">{root.global_index}. {root.titulo}</div>
                                            {root.children?.map((child) => (
                                                <div key={child.id} className="pl-3 text-[9px] font-medium text-slate-500">
                                                    {root.global_index}.{child.global_sub_index}. {child.titulo}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </td>
                            <td className="px-6 py-6 border border-emerald-100 align-top italic text-[11px] font-medium">
                                {displayDiscapacidad}
                            </td>
                            <td className="px-6 py-6 border border-emerald-100 align-top text-[11px] font-medium whitespace-pre-wrap">
                                {formatCurricularText(viewMode === 'ia' ? s.adaptaciones_especiales_ia : s.adaptaciones_especiales_original)}
                            </td>
                            {idx === 0 && (
                                <td rowSpan={filteredWeeks.length} className="px-6 py-6 border border-emerald-100 align-top text-slate-700 text-[11px] font-bold italic bg-emerald-50/30">
                                    {formatCurricularText(viewMode === 'ia' ? area.criterios_evaluacion_adaptaciones_ia : area.criterios_evaluacion_adaptaciones)}
                                </td>
                            )}
                        </tr>
                        );
                        })
                    })()}
                </tbody>
            </table>
        </div>
    );
}
