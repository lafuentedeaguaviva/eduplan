import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, HeadingLevel, WidthType, BorderStyle, VerticalAlign, PageOrientation, VerticalMergeType } from 'docx';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PDC, FullReportData, PdcProfile, FullReportArea, PlanificacionSemanal, HierarchyRoot } from '@/types';

/**
 * Helper to format names with title
 */
const formatFullName = (profile: PdcProfile | null | undefined) => {
    if (!profile) return 'N/A';
    return `${profile.titulo || ''} ${profile.nombres || ''} ${profile.apellidos || ''}`.trim();
};

/**
 * Service to handle Word Exports matching Reportes.md requirements
 */
export const exportToWord = async (pdcData: PDC, fullData?: FullReportData) => {
    if (!fullData) {
        console.warn("exportToWord called without fullData. Skipping detailed export.");
        return;
    }
    // Determine PDC Type Label
    const typeMap: Record<number, string> = {
        1: "PDC Inicial",
        2: "PDC Primaria",
        3: "PDC Secundaria",
        4: "PDC Multigrado"
    };
    const pdcType = (pdcData.tipo_pdc_id !== undefined ? typeMap[pdcData.tipo_pdc_id] : null) || "PDC";
    const pdcNumero = pdcData.mes || 1;

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: {
                            orientation: PageOrientation.LANDSCAPE,
                        },
                    },
                },
                children: [
                    new Paragraph({
                        text: "EDUCACIÓN PRIMARIA COMUNITARIA VOCACIONAL",
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 100 },
                    }),
                    new Paragraph({
                        text: `PLAN DE DESARROLLO CURRICULAR Nº ${pdcNumero}`,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                    }),
                    
                    new Paragraph({
                        text: "1. DATOS REFERENCIALES",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 200, after: 100 },
                    }),

                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph("Distrito educativo")] }),
                                    new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph(fullData.distritos || 'N/A')] }),
                                    new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph("Unidad educativa")] }),
                                    new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph(fullData.unidades || 'N/A')] }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("Nivel")] }),
                                    new TableCell({ children: [new Paragraph(fullData.niveles || 'N/A')] }),
                                    new TableCell({ children: [new Paragraph("Año de escolaridad")] }),
                                    new TableCell({ children: [new Paragraph(fullData.grados || 'N/A')] }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("Director/a")] }),
                                    new TableCell({ columnSpan: 3, children: [new Paragraph(fullData.director || 'N/A')] }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("Maestro/a")] }),
                                    new TableCell({ columnSpan: 3, children: [new Paragraph(fullData.docente || 'N/A')] }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("Areas")] }),
                                    new TableCell({ columnSpan: 3, children: [new Paragraph(fullData.areas || 'N/A')] }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("Trimestre")] }),
                                    new TableCell({ columnSpan: 3, children: [new Paragraph(`${pdcData.trimestre}º Trimestre`)] }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("")] }),
                                    new TableCell({ 
                                        columnSpan: 3, 
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({ text: "Del: " }),
                                                    new TextRun({ text: pdcData.fecha_inicio || '____', bold: true }),
                                                    new TextRun({ text: " al: " }),
                                                    new TextRun({ text: pdcData.fecha_fin || '____', bold: true }),
                                                ]
                                            })
                                        ] 
                                    }),
                                ],
                            }),
                        ],
                    }),


                    new Paragraph({
                        text: "2. DESARROLLO",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 400, after: 100 },
                    }),

                    new Paragraph({
                        children: [new TextRun({ text: "OBJETIVO HOLÍSTICO DE NIVEL:", bold: true })],
                        spacing: { before: 200, after: 100 },
                    }),
                    new Paragraph({
                        text: fullData.objetivo_holistico_nivel || "No definido",
                        alignment: AlignmentType.JUSTIFIED,
                    }),

                    ...fullData.areas_trabajo.map((area: FullReportArea) => [
                        new Paragraph({ text: "", spacing: { before: 200 } }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                // Header: Area Name
                                new TableRow({
                                    children: [
                                        new TableCell({ 
                                            shading: { fill: "E8F5E9" },
                                            columnSpan: 6,
                                            children: [new Paragraph({ 
                                                children: [new TextRun({ text: `Área de saberes y conocimiento: ${area.nombre}`, bold: true })],
                                                alignment: AlignmentType.CENTER 
                                            })] 
                                        }),
                                    ]
                                }),
                                // Header: Column Labels
                                new TableRow({
                                    children: [
                                        new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Objetivo de aprendizaje", bold: true })], alignment: AlignmentType.CENTER })] }),
                                        new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Contenidos", bold: true })], alignment: AlignmentType.CENTER })] }),
                                        new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Momentos del proceso formativo", bold: true })], alignment: AlignmentType.CENTER })] }),
                                        new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Recursos", bold: true })], alignment: AlignmentType.CENTER })] }),
                                        new TableCell({ width: { size: 5, type: WidthType.PERCENTAGE }, shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Per.", bold: true })], alignment: AlignmentType.CENTER })] }),
                                        new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Criterios de evaluación", bold: true })], alignment: AlignmentType.CENTER })] }),
                                    ]
                                }),
                                // Rows for Weeks
                                ...(area.semanas || []).map((s: PlanificacionSemanal, idx: number) => new TableRow({
                                    children: [
                                        // Column 1: Objective (Merged)
                                        new TableCell({ 
                                            verticalMerge: idx === 0 ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
                                            verticalAlign: VerticalAlign.CENTER,
                                            children: idx === 0 ? [new Paragraph({ text: area.objetivos_aprendizaje || "N/A", alignment: AlignmentType.BOTH })] : []
                                        }),
                                        // Column 2: Contents
                                        new TableCell({ 
                                            children: [
                                                new Paragraph({ children: [new TextRun({ text: `Semana ${s.semana}`, bold: true })], spacing: { after: 100 } }),
                                                ...(s.semana_contenido_hier || []).flatMap((root: HierarchyRoot) => [
                                                    new Paragraph({
                                                        children: [new TextRun({ text: `${root.global_index}. ${root.titulo}`, bold: true, size: 18 })],
                                                    }),
                                                    ...(root.children || []).map((child) => 
                                                        new Paragraph({
                                                            children: [new TextRun({ text: `${root.global_index}.${child.global_sub_index}. ${child.titulo}`, size: 16 })],
                                                            indent: { left: 180 }
                                                        })
                                                    )
                                                ])
                                            ]
                                        }),
                                        // Column 3: Moments
                                        new TableCell({ children: [new Paragraph(s.momentos_ia || "N/A")] }),
                                        // Column 4: Resources
                                        new TableCell({ children: [new Paragraph(s.recursos_fuentes_ia || "N/A")] }),

                                        // Column 5: Periods
                                        new TableCell({ children: [new Paragraph(area.periodos?.toString() || "0"), new Paragraph({ children: [new TextRun({ text: "hrs", size: 16 })] })], verticalAlign: VerticalAlign.CENTER }),
                                        // Column 6: Criteria (Merged)
                                        new TableCell({ 
                                            verticalMerge: idx === 0 ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
                                            verticalAlign: VerticalAlign.CENTER,
                                            children: idx === 0 ? [new Paragraph({ text: area.criterios_evaluacion || "N/A", alignment: AlignmentType.BOTH })] : []
                                        }),
                                    ]
                                })),
                                // Row for Adaptations
                                new TableRow({
                                    children: [
                                        new TableCell({ verticalMerge: VerticalMergeType.CONTINUE, children: [] }),
                                        new TableCell({ 
                                            columnSpan: 4, 
                                            children: [
                                                new Paragraph({ children: [new TextRun({ text: "ADAPTACIONES CURRICULARES NO SIGNIFICATIVAS", bold: true })], spacing: { before: 100 } }),
                                                new Paragraph(area.adaptaciones_no_significativas || 'Ninguna')
                                            ] 
                                        }),
                                        new TableCell({ verticalMerge: VerticalMergeType.CONTINUE, children: [] }),
                                    ]
                                })
                            ]
                        }),
                        // New Table: Significative Adaptations
                        ...(area.semanas || []).some((s: PlanificacionSemanal) => s.adaptaciones_especiales_ia || s.adaptaciones_basicas_ia) ? [
                            new Paragraph({ text: "", spacing: { before: 200 } }),
                            new Table({
                                width: { size: 100, type: WidthType.PERCENTAGE },
                                rows: [
                                    new TableRow({
                                        children: [
                                            new TableCell({ 
                                                shading: { fill: "E8F5E9" },
                                                columnSpan: 4,
                                                children: [new Paragraph({ 
                                                    children: [new TextRun({ text: "ADAPTACIONES CURRICULARES SIGNIFICATIVAS", bold: true })],
                                                    alignment: AlignmentType.CENTER 
                                                })] 
                                            }),
                                        ]
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Contenidos", bold: true })], alignment: AlignmentType.CENTER })] }),
                                            new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Discapacidad/TDH/TEA y otros", bold: true })], alignment: AlignmentType.CENTER })] }),
                                            new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Adaptación", bold: true })], alignment: AlignmentType.CENTER })] }),
                                            new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Criterio de evaluación", bold: true })], alignment: AlignmentType.CENTER })] }),
                                        ]
                                    }),
                                    ...(area.semanas || []).filter((s: PlanificacionSemanal) => s.adaptaciones_especiales_ia).map((s: PlanificacionSemanal) => new TableRow({
                                        children: [
                                            new TableCell({ 
                                                children: [
                                                    new Paragraph({ children: [new TextRun({ text: `Semana ${s.semana}`, bold: true })], spacing: { after: 100 } }),
                                                    ...(s.semana_contenido_hier || []).flatMap((root: HierarchyRoot) => [
                                                        new Paragraph({
                                                            children: [new TextRun({ text: `${root.global_index}. ${root.titulo}`, bold: true, size: 18 })],
                                                        }),
                                                        ...(root.children || []).map((child) => 
                                                            new Paragraph({
                                                                children: [new TextRun({ text: `${root.global_index}.${child.global_sub_index}. ${child.titulo}`, size: 16 })],
                                                                indent: { left: 180 }
                                                            })
                                                        )
                                                    ])
                                                ]
                                            }),
                                            new TableCell({ children: [new Paragraph(s.adaptaciones_especiales_ia || "N/A")] }),
                                            new TableCell({ children: [new Paragraph(s.adaptaciones_basicas_ia || "N/A")] }),
                                            new TableCell({ children: [new Paragraph(area.criterios_evaluacion_adaptaciones || "N/A")] }),
                                        ]
                                    }))
                                ]
                            })
                        ] : []
                    ]).flat(),

                    // Signature lines
                    new Paragraph({ text: "", spacing: { before: 600 } }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "__________________________", alignment: AlignmentType.CENTER }), new Paragraph({ text: `Dir. ${fullData.director || ''}`, alignment: AlignmentType.CENTER }), new Paragraph({ text: "Firma del Director/a", alignment: AlignmentType.CENTER })] }),
                                    new TableCell({ children: [new Paragraph({ text: "__________________________", alignment: AlignmentType.CENTER }), new Paragraph({ text: `Prof. ${fullData.docente || ''}`, alignment: AlignmentType.CENTER }), new Paragraph({ text: "Firma del Maestro/a", alignment: AlignmentType.CENTER })] }),
                                ]
                            })
                        ]
                    })
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `PDC_${pdcData.nombre_pdc || 'report'}.docx`);
};

/**
 * Service to handle PDF Exports via HTML conversion
 */
export const exportToPDF = async (elementId: string, fileName: string, orientation: 'p' | 'l' = 'p') => {
    const input = document.getElementById(elementId);
    if (!input) return;

    const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF(orientation, 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Check if content exceeds page height
    if (pdfHeight > pageHeight) {
        let heightLeft = pdfHeight;
        let position = 0;

        while (heightLeft >= 0) {
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
            position -= pageHeight;
            if (heightLeft > 0) pdf.addPage();
        }
    } else {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(`${fileName}.pdf`);
};

/**
 * Service to handle Excel/Dataframe Exports
 */
export const exportToExcel = async (data: Record<string, unknown>[], fileName: string) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    if (data.length === 0) return;

    const columns = Object.keys(data[0]).map(key => ({
        header: key.toUpperCase().replace('_', ' '),
        key: key,
        width: 20
    }));

    worksheet.columns = columns;

    data.forEach(item => {
        const row: Record<string, string | number | boolean | null | undefined> = {};
        Object.keys(item).forEach(key => {
            if (typeof item[key] === 'object' && item[key] !== null) {
                row[key] = JSON.stringify(item[key]);
            } else {
                row[key] = item[key] as string | number | boolean | null | undefined;
            }
        });
        worksheet.addRow(row);
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}.xlsx`);
};
