'use client';

import { Pdc, FullReportData, FullReportArea, PlanificacionSemanal, HierarchyRoot } from '@/types';
import { formatCurricularText } from '@/lib/formatText';

interface PDFPreviewProps {
    initialPdc: Pdc;
    fullReportData: FullReportData;
    viewMode?: 'ia' | 'original';
}

export default function PDFPreview({ initialPdc, fullReportData, viewMode = 'ia' }: PDFPreviewProps) {
    return (
        <div id="pdc-preview" style={{ position: 'fixed', left: '-4000px', top: 0, width: '297mm', backgroundColor: '#ffffff', color: '#000000', padding: '15mm', fontFamily: 'serif', lineHeight: '1.2', fontSize: '11px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>EDUCACIÓN PRIMARIA COMUNITARIA VOCACIONAL</p>
                <h1 style={{ fontSize: '14px', fontWeight: 'bold' }}>PLAN DE DESARROLLO CURRICULAR Nº {initialPdc.mes || 1}</h1>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>1. DATOS REFERENCIALES</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000' }}>
                    <tbody>
                        <tr>
                            <td style={{ border: '1px solid #000000', padding: '4px', fontWeight: 'bold', width: '25%' }}>Distrito Educativo</td>
                            <td style={{ border: '1px solid #000000', padding: '4px', width: '25%' }}>{fullReportData.distritos}</td>
                            <td style={{ border: '1px solid #000000', padding: '4px', fontWeight: 'bold', width: '25%' }}>Unidad Educativa</td>
                            <td style={{ border: '1px solid #000000', padding: '4px', width: '25%' }}>{fullReportData.unidades}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000000', padding: '4px', fontWeight: 'bold' }}>Nivel</td>
                            <td style={{ border: '1px solid #000000', padding: '4px' }}>{fullReportData.niveles}</td>
                            <td style={{ border: '1px solid #000000', padding: '4px', fontWeight: 'bold' }}>Año de escolaridad</td>
                            <td style={{ border: '1px solid #000000', padding: '4px' }}>{fullReportData.grados}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000000', padding: '4px', fontWeight: 'bold' }}>Director/a</td>
                            <td colSpan={3} style={{ border: '1px solid #000000', padding: '4px' }}>{fullReportData.director}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000000', padding: '4px', fontWeight: 'bold' }}>Maestro/a</td>
                            <td colSpan={3} style={{ border: '1px solid #000000', padding: '4px' }}>{fullReportData.docente}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000000', padding: '4px', fontWeight: 'bold' }}>Áreas</td>
                            <td colSpan={3} style={{ border: '1px solid #000000', padding: '4px' }}>{fullReportData.areas}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000000', padding: '4px', fontWeight: 'bold' }}>Trimestre</td>
                            <td colSpan={3} style={{ border: '1px solid #000000', padding: '4px' }}>{initialPdc.trimestre}º Trimestre</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000000', padding: '4px' }}></td>
                            <td colSpan={3} style={{ border: '1px solid #000000', padding: '4px' }}>
                                Del: <b>{initialPdc.fecha_inicio || '____'}</b> al: <b>{initialPdc.fecha_fin || '____'}</b>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>2. DESARROLLO</h2>
                <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>OBJETIVO HOLÍSTICO DE NIVEL:</p>
                <p style={{ textAlign: 'justify', marginBottom: '16px' }}>{fullReportData.objetivo_holistico_nivel}</p>
            </div>

            {initialPdc.tipo_pdc_id === 4 ? (
                <div style={{ marginBottom: '24px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f3f4f6' }}>
                                <th style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center', width: '8%', fontSize: '10px' }} rowSpan={2}>Semana</th>
                                <th style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center', width: '12%', fontSize: '10px' }} rowSpan={2}>Áreas</th>
                                <th style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center', fontSize: '10px', fontStyle: 'italic' }} colSpan={Array.from(new Set(fullReportData.areas_trabajo.map(a => a.grado_nombre))).length}>
                                    Integración de Contenidos Curriculares Afines por Años de Escolaridad
                                </th>
                            </tr>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                                {Array.from(new Set(fullReportData.areas_trabajo.map(a => a.grado_nombre))).sort().map(grado => (
                                    <th key={grado} style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center', fontSize: '9px' }}>
                                        {grado}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: Math.max(...fullReportData.areas_trabajo.map(a => a.semanas.length), 0) }, (_, i) => i + 1).map((weekNum) => {
                                const areaNames = Array.from(new Set(fullReportData.areas_trabajo.map(a => a.nombre))).sort();
                                const grades = Array.from(new Set(fullReportData.areas_trabajo.map(a => a.grado_nombre))).sort();

                                return areaNames.map((areaName, aIdx) => (
                                    <tr key={`${weekNum}-${areaName}`}>
                                        {aIdx === 0 && (
                                            <td rowSpan={areaNames.length} style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#fbfbfb' }}>
                                                Semana {weekNum}
                                            </td>
                                        )}
                                        <td style={{ border: '1px solid #000000', padding: '4px', fontWeight: 'bold', fontSize: '10px' }}>{areaName}</td>
                                        {grades.map((grado) => {
                                            const at = fullReportData.areas_trabajo.find(ta => ta.grado_nombre === grado && ta.nombre === areaName);
                                            const semana = at?.semanas.find(s => s.semana === weekNum);
                                            return (
                                                <td key={grado} style={{ border: '1px solid #000000', padding: '4px', verticalAlign: 'top', fontSize: '9px' }}>
                                                    {semana?.semana_contenido_hier?.map((root: HierarchyRoot) => (
                                                        <div key={root.id} style={{ marginBottom: '2px' }}>
                                                            - {root.titulo}
                                                            {root.children?.map(child => (
                                                                <div key={child.id} style={{ paddingLeft: '8px', fontSize: '8px', color: '#4b5563' }}>
                                                                    • {child.titulo}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ));
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                fullReportData.areas_trabajo.map((area: FullReportArea) => (
                    <div key={area.id} style={{ marginBottom: '24px', breakInside: 'avoid' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', marginBottom: '16px' }}>
                            <thead>
                                <tr>
                                    <th colSpan={6} style={{ border: '1px solid #000000', backgroundColor: '#f3f4f6', padding: '4px', textAlign: 'center', fontWeight: 'bold', fontStyle: 'italic' }}>
                                        Área de saberes y conocimiento: {area.nombre}
                                    </th>
                                </tr>
                                <tr style={{ backgroundColor: '#f9fafb', fontSize: '10px' }}>
                                    <th style={{ border: '1px solid #000000', padding: '4px', width: '15%' }}>Objetivo de aprendizaje</th>
                                    <th style={{ border: '1px solid #000000', padding: '4px', width: '15%' }}>Contenidos</th>
                                    <th style={{ border: '1px solid #000000', padding: '4px', width: '25%' }}>Momentos del proceso formativo</th>
                                    <th style={{ border: '1px solid #000000', padding: '4px', width: '15%' }}>Recursos</th>
                                    <th style={{ border: '1px solid #000000', padding: '4px', width: '5%' }}>Per.</th>
                                    <th style={{ border: '1px solid #000000', padding: '4px', width: '25%' }}>Criterios de evaluación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(area.semanas || []).map((s: PlanificacionSemanal, idx: number) => (
                                    <tr key={s.id}>
                                        {(() => {
                                            const hasPerWeekObj = viewMode === 'ia' 
                                                ? s.objetivos_aprendizaje_ia !== undefined 
                                                : s.objetivos_aprendizaje !== undefined;
                                            
                                            if (hasPerWeekObj) {
                                                return (
                                                    <td style={{ border: '1px solid #000000', padding: '4px', verticalAlign: 'top', textAlign: 'justify', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                                                        {viewMode === 'ia' ? s.objetivos_aprendizaje_ia : s.objetivos_aprendizaje}
                                                    </td>
                                                );
                                            } else {
                                                if (idx === 0) {
                                                    return (
                                                        <td rowSpan={area.semanas.length + 1} style={{ border: '1px solid #000000', padding: '4px', verticalAlign: 'top', textAlign: 'justify', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                                                            {viewMode === 'ia' ? area.objetivos_aprendizaje_ia : area.objetivos_aprendizaje}
                                                        </td>
                                                    );
                                                }
                                                return null;
                                            }
                                        })()}
                                        <td style={{ border: '1px solid #000000', padding: '4px', verticalAlign: 'top' }}>
                                            <b>Semana {s.semana}</b>
                                            <div style={{ marginTop: '4px' }}>
                                                {s.semana_contenido_hier?.map((root: HierarchyRoot) => (
                                                    <div key={root.id} style={{ marginBottom: '4px' }}>
                                                        <b>{root.global_index}. {root.titulo}</b>
                                                        {root.children?.map((child) => (
                                                            <div key={child.id} style={{ paddingLeft: '8px' }}>
                                                                {root.global_index}.{child.global_sub_index}. {child.titulo}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ border: '1px solid #000000', padding: '4px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>
                                            {formatCurricularText(viewMode === 'ia' ? (s.momentos_ia ?? s.momentos_original) : s.momentos_original)}
                                        </td>
                                        <td style={{ border: '1px solid #000000', padding: '4px', verticalAlign: 'top', whiteSpace: 'pre-wrap', fontStyle: 'italic', fontSize: '9px' }}>
                                            {formatCurricularText(viewMode === 'ia' ? (s.recursos_fuentes_ia ?? s.recursos_fuentes_original) : s.recursos_fuentes_original)}
                                        </td>
                                        {idx === 0 && (
                                            <td rowSpan={area.semanas.length + 1} style={{ border: '1px solid #000000', padding: '4px', verticalAlign: 'top', textAlign: 'justify', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                                                {formatCurricularText(viewMode === 'ia' ? area.criterios_evaluacion_ia : area.criterios_evaluacion)}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan={5} style={{ border: '1px solid #000000', padding: '4px', whiteSpace: 'pre-wrap' }}>
                                        <b>ADAPTACIONES CURRICULARES</b><br />
                                        {formatCurricularText(viewMode === 'ia' ? area.adaptaciones_no_significativas_ia : area.adaptaciones_no_significativas)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {(area.semanas || []).some((s: PlanificacionSemanal) =>
                            viewMode === 'ia'
                                ? (s.adaptaciones_especiales_ia || s.adaptaciones_basicas_ia)
                                : (s.adaptaciones_especiales_original || s.adaptaciones_basicas_original)
                        ) && (
                                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', breakInside: 'avoid' }}>
                                    <thead>
                                        <tr>
                                            <th colSpan={4} style={{ border: '1px solid #000000', backgroundColor: '#f3f4f6', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                                                ADAPTACIONES CURRICULARES SIGNIFICATIVAS
                                            </th>
                                        </tr>
                                        <tr style={{ backgroundColor: '#f9fafb', fontSize: '10px' }}>
                                            <th style={{ border: '1px solid #000000', padding: '4px', width: '25%' }}>Contenidos</th>
                                            <th style={{ border: '1px solid #000000', padding: '4px', width: '25%' }}>Discapacidad/TDH/TEA y otros</th>
                                            <th style={{ border: '1px solid #000000', padding: '4px', width: '25%' }}>Adaptación</th>
                                            <th style={{ border: '1px solid #000000', padding: '4px', width: '25%' }}>Criterio de evaluación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
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
                                            <tr key={s.id}>
                                                <td style={{ border: '1px solid #000000', padding: '4px', verticalAlign: 'top' }}>
                                                    <b>Semana {s.semana}</b>
                                                    {s.semana_contenido_hier?.map((root: HierarchyRoot) => (
                                                        <div key={root.id} style={{ fontSize: '9px' }}>
                                                            {root.global_index}. {root.titulo}
                                                        </div>
                                                    ))}
                                                </td>
                                                <td style={{ border: '1px solid #000000', padding: '4px', verticalAlign: 'top', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                                                    {displayDiscapacidad}
                                                </td>
                                                <td style={{ border: '1px solid #000000', padding: '4px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>
                                                    {formatCurricularText(viewMode === 'ia' ? s.adaptaciones_especiales_ia : s.adaptaciones_especiales_original)}
                                                </td>
                                                {idx === 0 && (
                                                    <td rowSpan={filteredWeeks.length} style={{ border: '1px solid #000000', padding: '4px', verticalAlign: 'top', color: '#374151', backgroundColor: '#f9fafb', whiteSpace: 'pre-wrap' }}>
                                                        {formatCurricularText(viewMode === 'ia' ? area.criterios_evaluacion_adaptaciones_ia : area.criterios_evaluacion_adaptaciones)}
                                                    </td>
                                                )}
                                            </tr>
                                                );
                                                })
                                            })()}
                                    </tbody>
                                </table>
                            )}
                    </div>
                ))
            )}

            <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center', paddingTop: '8px', borderTop: '1px solid #000000', width: '256px' }}>
                    <p style={{ fontWeight: 'bold' }}>{fullReportData.director}</p>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase' }}>Director de Unidad Educativa</p>
                </div>
                <div style={{ textAlign: 'center', paddingTop: '8px', borderTop: '1px solid #000000', width: '256px' }}>
                    <p style={{ fontWeight: 'bold' }}>{fullReportData.docente}</p>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase' }}>Firma del Maestro/a</p>
                </div>
            </div>
        </div>
    );
}
