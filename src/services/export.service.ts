import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, HeadingLevel, WidthType, BorderStyle, VerticalAlign, PageOrientation, VerticalMergeType } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PDCMaster, FullReportData, FullReportArea, PlanificacionSemanal, HierarchyRoot } from '@/types';

/**
 * Service to handle high-fidelity exports for EduPlan Pro.
 * Follows the specific layout defined in src2 reference.
 */
export const ExportService = {
    /**
     * Generates a professional Word document matching pedagogical standards.
     */
    async exportToWord(pdcData: PDCMaster, fullData: FullReportData) {
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
                            text: fullData.niveles.toUpperCase() || "EDUCACIÓN COMUNITARIA VOCACIONAL",
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
                                        new TableCell({ children: [new Paragraph("Áreas")] }),
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

                        ...fullData.areas_trabajo.flatMap((area: FullReportArea) => [
                            new Paragraph({ text: "", spacing: { before: 200 } }),
                            new Table({
                                width: { size: 100, type: WidthType.PERCENTAGE },
                                rows: [
                                    new TableRow({
                                        children: [
                                            new TableCell({ 
                                                shading: { fill: "F3F4F6" },
                                                columnSpan: 6,
                                                children: [new Paragraph({ 
                                                    children: [new TextRun({ text: `Área de saberes y conocimiento: ${area.nombre}`, bold: true })],
                                                    alignment: AlignmentType.CENTER 
                                                })] 
                                            }),
                                        ]
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Objetivo de aprendizaje", bold: true })], alignment: AlignmentType.CENTER })] }),
                                            new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Contenidos", bold: true })], alignment: AlignmentType.CENTER })] }),
                                            new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Momentos formativos", bold: true })], alignment: AlignmentType.CENTER })] }),
                                            new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Recursos", bold: true })], alignment: AlignmentType.CENTER })] }),
                                            new TableCell({ width: { size: 5, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Per.", bold: true })], alignment: AlignmentType.CENTER })] }),
                                            new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Criterios de evaluación", bold: true })], alignment: AlignmentType.CENTER })] }),
                                        ]
                                    }),
                                    ...(area.semanas || []).map((s: any, idx: number) => new TableRow({
                                        children: [
                                            new TableCell({ 
                                                verticalMerge: idx === 0 ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
                                                children: idx === 0 ? [new Paragraph({ text: area.objetivos_aprendizaje, alignment: AlignmentType.BOTH })] : []
                                            }),
                                            new TableCell({ 
                                                children: [
                                                    new Paragraph({ children: [new TextRun({ text: `Semana ${s.semana}`, bold: true })], spacing: { after: 100 } }),
                                                    ...(s.semana_contenido_hier || []).flatMap((root: HierarchyRoot) => [
                                                        new Paragraph({ children: [new TextRun({ text: `${root.global_index}. ${root.titulo}`, bold: true })] }),
                                                        ...(root.children || []).map((child) => 
                                                            new Paragraph({ children: [new TextRun({ text: `${root.global_index}.${child.global_sub_index}. ${child.titulo}` })], indent: { left: 180 } })
                                                        )
                                                    ])
                                                ]
                                            }),
                                            new TableCell({ children: [new Paragraph(s.momentos_ia || "N/A")] }),
                                            new TableCell({ children: [new Paragraph(s.recursos_fuentes_ia || "N/A")] }),
                                            new TableCell({ children: [new Paragraph(area.periodos?.toString() || "0"), new Paragraph("hrs")], verticalAlign: VerticalAlign.CENTER }),
                                            new TableCell({ 
                                                verticalMerge: idx === 0 ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
                                                children: idx === 0 ? [new Paragraph({ text: area.criterios_evaluacion, alignment: AlignmentType.BOTH })] : []
                                            }),
                                        ]
                                    })),
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
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ verticalMerge: VerticalMergeType.CONTINUE, children: [] }),
                                            new TableCell({ 
                                                columnSpan: 4, 
                                                children: [
                                                    new Paragraph({ children: [new TextRun({ text: "ADAPTACIONES CURRICULARES SIGNIFICATIVAS / CRITERIOS", bold: true })], spacing: { before: 100 } }),
                                                    new Paragraph(area.adaptaciones_especiales_ia || 'Ninguna'),
                                                    new Paragraph({ children: [new TextRun({ text: "Criterios:", bold: true })] }),
                                                    new Paragraph(area.criterios_evaluacion_adaptaciones || 'No definido')
                                                ] 
                                            }),
                                            new TableCell({ verticalMerge: VerticalMergeType.CONTINUE, children: [] }),
                                        ]
                                    })
                                ]
                            })
                        ]),

                        // BIBLIOGRAFÍA / CRÉDITOS
                        new Paragraph({ 
                            children: [new TextRun({ text: "BIBLIOGRAFÍA Y CRÉDITOS", bold: true })], 
                            spacing: { before: 400, after: 200 },
                            alignment: AlignmentType.CENTER
                        }),
                        new Paragraph({ 
                            text: fullData.bibliografia_global || "No definido", 
                            alignment: AlignmentType.BOTH,
                            spacing: { after: 400 }
                        }),

                        // Signatures
                        new Paragraph({ text: "", spacing: { before: 600 } }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph({ text: "__________________________", alignment: AlignmentType.CENTER }), new Paragraph({ text: `Dir. ${fullData.director}`, alignment: AlignmentType.CENTER }), new Paragraph({ text: "Firma del Director/a", alignment: AlignmentType.CENTER })] }),
                                        new TableCell({ children: [new Paragraph({ text: "__________________________", alignment: AlignmentType.CENTER }), new Paragraph({ text: `Prof. ${fullData.docente}`, alignment: AlignmentType.CENTER }), new Paragraph({ text: "Firma del Maestro/a", alignment: AlignmentType.CENTER })] }),
                                    ]
                                })
                            ]
                        })
                    ]
                }
            ]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `PDC_${pdcData.nombre_pdc || 'Reporte'}.docx`);
    },

    /**
     * Generates a high-fidelity PDF based on an HTML element.
     */
    async exportToPDF(elementId: string, fileName: string, orientation: 'p' | 'l' = 'p') {
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
    }
};
