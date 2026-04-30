'use client';

import { PDCMaster, FullReportData, FullReportArea, PlanificacionSemanal, HierarchyRoot } from '@/types';

interface PDFPreviewProps {
    pdc: PDCMaster;
    data: FullReportData;
    id: string;
}

/**
 * PDFPreview Component
 * 
 * Purpose: Renders a hidden HTML structure that html2canvas uses to generate the PDF.
 * This guarantees that the PDF looks exactly like the professional pedagogical template.
 * 
 * Styles are hardcoded in inline 'style' attribute to ensure html2canvas captures them correctly.
 */
export default function PDFPreview({ pdc, data, id }: PDFPreviewProps) {
    return (
        <div 
            id={id} 
            style={{ 
                position: 'fixed', 
                left: '-10000px', 
                top: 0, 
                width: '297mm', // A4 Landscape width
                backgroundColor: '#ffffff', 
                color: '#000000', 
                padding: '15mm', 
                fontFamily: "'Times New Roman', Times, serif", // Professional look
                lineHeight: '1.2', 
                fontSize: '11px' 
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', textTransform: 'uppercase' }}>
                    {data.niveles || "EDUCACIÓN COMUNITARIA VOCACIONAL"}
                </p>
                <h1 style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    PLAN DE DESARROLLO CURRICULAR Nº {pdc.mes || 1}
                </h1>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>1. DATOS REFERENCIALES</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000' }}>
                    <tbody>
                        <tr>
                            <td style={{ border: '1px solid #000000', padding: '6px', fontWeight: 'bold', width: '25%' }}>Distrito educativo</td>
                            <td style={{ border: '1px solid #000000', padding: '6px', width: '25%' }}>{data.distritos}</td>
                            <td style={{ border: '1px solid #000000', padding: '6px', fontWeight: 'bold', width: '25%' }}>Unidad educativa</td>
                            <td style={{ border: '1px solid #000000', padding: '6px', width: '25%' }}>{data.unidades}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000000', padding: '6px', fontWeight: 'bold' }}>Nivel</td>
                            <td style={{ border: '1px solid #000000', padding: '6px' }}>{data.niveles}</td>
                            <td style={{ border: '1px solid #000000', padding: '6px', fontWeight: 'bold' }}>Año de escolaridad</td>
                            <td style={{ border: '1px solid #000000', padding: '6px' }}>{data.grados}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000000', padding: '6px', fontWeight: 'bold' }}>Director/a</td>
                            <td colSpan={3} style={{ border: '1px solid #000000', padding: '6px' }}>{data.director}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000000', padding: '6px', fontWeight: 'bold' }}>Maestro/a</td>
                            <td colSpan={3} style={{ border: '1px solid #000000', padding: '6px' }}>{data.docente}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000000', padding: '6px', fontWeight: 'bold' }}>Áreas</td>
                            <td colSpan={3} style={{ border: '1px solid #000000', padding: '6px' }}>{data.areas}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000000', padding: '6px', fontWeight: 'bold' }}>Trimestre</td>
                            <td colSpan={3} style={{ border: '1px solid #000000', padding: '6px' }}>{pdc.trimestre}º Trimestre</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000000', padding: '6px' }}></td>
                            <td colSpan={3} style={{ border: '1px solid #000000', padding: '6px' }}>
                                Del: <b>{pdc.fecha_inicio || '____'}</b> al: <b>{pdc.fecha_fin || '____'}</b>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>2. DESARROLLO</h2>
                <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>OBJETIVO HOLÍSTICO DE NIVEL:</p>
                <p style={{ textAlign: 'justify', marginBottom: '16px', fontSize: '10px' }}>{data.objetivo_holistico_nivel}</p>
            </div>

            {data.areas_trabajo.map((area: FullReportArea) => (
                <div key={area.id} style={{ marginBottom: '24px', breakInside: 'avoid' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000000', marginBottom: '8px' }}>
                        <thead>
                            <tr>
                                <th colSpan={6} style={{ border: '1px solid #000000', backgroundColor: '#f3f4f6', padding: '4px', textAlign: 'center', fontWeight: 'bold', fontStyle: 'italic' }}>
                                    Área de saberes y conocimiento: {area.nombre}
                                </th>
                            </tr>
                            <tr style={{ backgroundColor: '#f9fafb', fontSize: '9px' }}>
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
                                    {idx === 0 && (
                                        <td rowSpan={area.semanas.length + 1} style={{ border: '1px solid #000000', padding: '4px', verticalAlign: 'top', textAlign: 'justify', fontSize: '9px' }}>
                                            {area.objetivos_aprendizaje || "N/A"}
                                        </td>
                                    )}
                                    <td style={{ border: '1px solid #000000', padding: '4px', verticalAlign: 'top', fontSize: '9px' }}>
                                        <b style={{ textDecoration: 'underline' }}>Semana {s.semana}</b>
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
                                    <td style={{ border: '1px solid #000000', padding: '4px', verticalAlign: 'top', textAlign: 'justify', fontSize: '9px' }}>{s.momentos_ia || "N/A"}</td>
                                    <td style={{ border: '1px solid #000000', padding: '4px', verticalAlign: 'top', fontSize: '9px' }}>{s.recursos_fuentes_ia || "N/A"}</td>
                                    <td style={{ border: '1px solid #000000', padding: '4px', textAlign: 'center', verticalAlign: 'middle', fontSize: '9px' }}>
                                        {area.periodo_semanal} <br/> hrs
                                    </td>
                                    {idx === 0 && (
                                        <td rowSpan={area.semanas.length + 1} style={{ border: '1px solid #000000', padding: '4px', verticalAlign: 'top', textAlign: 'justify', fontSize: '9px' }}>
                                            {area.criterios_evaluacion}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            <tr>
                                <td colSpan={4} style={{ border: '1px solid #000000', padding: '6px', fontSize: '9px' }}>
                                    <b>ADAPTACIONES CURRICULARES NO SIGNIFICATIVAS</b><br/>
                                    {area.adaptaciones_no_significativas || 'Ninguna'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ))}

            <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center', paddingTop: '8px', borderTop: '1px solid #000000', width: '250px' }}>
                    <p style={{ fontWeight: 'bold' }}>{data.director}</p>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase' }}>Director de Unidad Educativa</p>
                </div>
                <div style={{ textAlign: 'center', paddingTop: '8px', borderTop: '1px solid #000000', width: '250px' }}>
                    <p style={{ fontWeight: 'bold' }}>{data.docente}</p>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase' }}>Firma del Maestro/a</p>
                </div>
            </div>
        </div>
    );
}
