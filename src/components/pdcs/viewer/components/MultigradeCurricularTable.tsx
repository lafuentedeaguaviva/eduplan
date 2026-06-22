'use client';

import { FullReportData, FullReportArea, PlanificacionSemanal, HierarchyRoot } from '@/types';

interface MultigradeCurricularTableProps {
    fullReportData: FullReportData;
}

export default function MultigradeCurricularTable({ fullReportData }: MultigradeCurricularTableProps) {
    // 1. Obtener todos los grados únicos presentes en las áreas de trabajo
    const allGrades = Array.from(new Set(fullReportData.areas_trabajo.map(a => a.grado_nombre))).sort();
    
    // 2. Obtener todas las áreas únicas (por nombre)
    const allAreaNames = Array.from(new Set(fullReportData.areas_trabajo.map(a => a.nombre))).sort();
    
    // 3. Obtener el número máximo de semanas across all areas
    const maxWeeks = Math.max(...fullReportData.areas_trabajo.map(a => a.semanas.length), 0);
    const weekNumbers = Array.from({ length: maxWeeks }, (_, i) => i + 1);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
             <header className="flex items-center justify-between pb-6 border-b border-slate-200">
                <h2 className="text-xl font-black text-amber-600 uppercase tracking-[0.2em] border-l-4 border-amber-600 pl-6">
                    Contenidos Curriculares (Multigrado)
                </h2>
                <div className="bg-amber-50 text-amber-600 text-[10px] font-black px-4 py-1.5 rounded-full border border-amber-100 uppercase tracking-widest shadow-sm">
                    Integración por Años de Escolaridad
                </div>
            </header>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-blue-900/5 backdrop-blur-md">
                <table className="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">
                            <th className="px-6 py-5 border-r border-slate-100 text-center bg-slate-50/80" rowSpan={2}>Semana</th>
                            <th className="px-6 py-5 border-r border-slate-100 text-center bg-slate-50/80" rowSpan={2}>Áreas</th>
                            <th className="px-6 py-4 border-b border-slate-100 text-center bg-blue-50/50 text-blue-800 font-black tracking-widest" colSpan={allGrades.length}>
                                Integración de Contenidos Curriculares Afines por Años de Escolaridad
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
                                areas_trabajo={fullReportData.areas_trabajo}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function WeekRows({ weekNum, allGrades, allAreaNames, areas_trabajo }: { 
    weekNum: number, 
    allGrades: string[], 
    allAreaNames: string[],
    areas_trabajo: FullReportArea[] 
}) {
    return (
        <>
            {allAreaNames.map((areaName, aIdx) => {
                // Filter areas that match this name
                const matchingAreas = areas_trabajo.filter(at => at.nombre === areaName);
                
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
                            // Find the specific area/grade combination
                            const at = matchingAreas.find(ma => ma.grado_nombre === grado);
                            const semana = at?.semanas.find(s => s.semana === weekNum);
                            
                            return (
                                <td key={grado} className="px-6 py-6 border-r border-slate-100 align-top">
                                    {semana ? (
                                        <div className="space-y-4">
                                            {semana.semana_contenido_hier?.map((root: HierarchyRoot) => (
                                                <div key={root.id} className="space-y-2">
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
                                                <span className="text-[9px] text-slate-400 italic font-medium">Sin contenidos</span>
                                            )}
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
