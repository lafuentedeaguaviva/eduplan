import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, HeadingLevel, WidthType, BorderStyle, VerticalAlign, PageOrientation, VerticalMergeType } from 'docx';
import { PDCMaster, FullReportData, FullReportArea, PlanificacionSemanal, HierarchyRoot } from '@/types';

/**
 * Service to handle high-fidelity exports for EduPlan Pro.
 * Follows the specific layout defined in src2 reference.
 */
export const ExportService = {
    /**
     * Genera un examen en formato Word (.docx) a partir del Markdown de la IA.
     */
    async exportExamenToWord(markdown: string, fileName: string = "Examen_Generado") {
        const doc = new Document({
            sections: [
                {
                    properties: {
                        page: { margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 } }
                    },
                    children: markdown.split('\n').map((line) => {
                        const isHeading1 = line.startsWith('# ');
                        const isHeading2 = line.startsWith('## ');
                        const isHeading3 = line.startsWith('### ');
                        const isBoldItem = line.startsWith('**') || line.includes('**');
                        
                        let text = line.replace(/#/g, '').trim();
                        let bold = false;
                        
                        // Parseo simplificado de negritas
                        if (isBoldItem) {
                             text = text.replace(/\*\*/g, '');
                             bold = true;
                        }

                        let heading = undefined;
                        if (isHeading1) heading = HeadingLevel.HEADING_1;
                        if (isHeading2) heading = HeadingLevel.HEADING_2;
                        if (isHeading3) heading = HeadingLevel.HEADING_3;

                        return new Paragraph({
                            children: [new TextRun({ text, bold, size: heading ? 28 : 24 })],
                            heading,
                            spacing: { after: 200 }
                        });
                    })
                }
            ]
        });

        const blob = await Packer.toBlob(doc);
        const { saveAs } = await import('file-saver');
        saveAs(blob, `${fileName}.docx`);
    },

    /**
     * Generates a professional Word document matching pedagogical standards.
     */
    async exportToWord(pdcData: PDCMaster, fullData: FullReportData) {
        const pdcNumero = pdcData.mes || 1;

        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: {
                            size: 22,
                            characterSpacing: 10,
                        },
                        paragraph: {
                            spacing: {
                                line: 360,
                            },
                        },
                    },
                },
            },
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
                                                children: idx === 0 ? [new Paragraph({ text: (() => { const t = area.objetivos_aprendizaje_ia || area.objetivos_aprendizaje || ""; return t ? t.replace(/^([^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]*)([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ])/, (m, p, l) => p + l.toUpperCase()) : ""; })(), alignment: AlignmentType.BOTH })] : []
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
                                            new TableCell({ children: [new Paragraph(s.momentos_ia || s.momentos_original || "N/A")] }),
                                            new TableCell({ children: [new Paragraph(s.recursos_fuentes_ia || s.recursos_fuentes_original || "N/A")] }),
                                            new TableCell({ children: [new Paragraph({ text: area.periodo_semanal?.toString() || "0", alignment: AlignmentType.CENTER }), new Paragraph({ text: "hrs", alignment: AlignmentType.CENTER })], verticalAlign: VerticalAlign.CENTER }),
                                            new TableCell({ 
                                                verticalMerge: idx === 0 ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
                                                children: idx === 0 ? [new Paragraph({ text: area.criterios_evaluacion_ia || area.criterios_evaluacion, alignment: AlignmentType.BOTH })] : []
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
                                                    new Paragraph(area.adaptaciones_no_significativas_ia || area.adaptaciones_no_significativas || 'Ninguna')
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
                                                    new Paragraph(area.criterios_evaluacion_adaptaciones_ia || area.criterios_evaluacion_adaptaciones || 'No definido')
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
        const { saveAs } = await import('file-saver');
    saveAs(blob, `PDC_${pdcData.nombre_pdc || 'Reporte'}.docx`);
    },

    /**
     * Generates a high-fidelity PDF based on an HTML element.
     */
    async exportToPDF(elementId: string, fileName: string, orientation: 'p' | 'l' = 'p') {
        const input = document.getElementById(elementId);
        if (!input) return;

        // --- PAGE BREAK LOGIC ---
        const mX = 15; // 15mm margin
        const mY = 15; // 15mm margin
        const { default: jsPDF } = await import('jspdf');
        const tempPdf = new jsPDF(orientation, 'mm', 'a4');
        const pdfWidthInitial = tempPdf.internal.pageSize.getWidth() - (mX * 2);
        const pdfHeightInitial = tempPdf.internal.pageSize.getHeight() - (mY * 2);
        
        // Calculate DOM height corresponding to one PDF page
        const domPageHeight = pdfHeightInitial * (input.offsetWidth / pdfWidthInitial);

        const breakableElements = Array.from(input.querySelectorAll('tr, h1, h2, h3, h4, p, li, .avoid-break, .force-page-break')) as HTMLElement[];
        const modifications: { el: HTMLElement, origMarginTop: string }[] = [];
        const addedSpacers: HTMLElement[] = [];

        for (const el of breakableElements) {
            const rect = el.getBoundingClientRect();
            const inputRect = input.getBoundingClientRect();
            
            const top = rect.top - inputRect.top;
            const bottom = top + rect.height;

            const pageNumTop = Math.floor(top / domPageHeight);
            const pageNumBottom = Math.floor(bottom / domPageHeight);
            
            const isForceBreak = el.classList.contains('force-page-break');
            const isAtTopOfPage = (top % domPageHeight) < 10; // within 10px of the top

            // If element crosses page boundary or requires a force break
            if ((isForceBreak && !isAtTopOfPage) || (pageNumTop !== pageNumBottom && rect.height < domPageHeight)) {
                const pushAmount = ((pageNumTop + 1) * domPageHeight) - top;
                
                if (el.tagName.toLowerCase() === 'tr') {
                    const spacer = document.createElement('tr');
                    const td = document.createElement('td');
                    td.colSpan = 99;
                    td.style.height = `${pushAmount}px`;
                    td.style.border = 'none';
                    td.style.padding = '0';
                    spacer.appendChild(td);
                    el.parentNode?.insertBefore(spacer, el);
                    addedSpacers.push(spacer);
                } else {
                    const spacer = document.createElement('div');
                    spacer.style.borderTop = `${pushAmount}px solid transparent`;
                    spacer.style.margin = '0';
                    spacer.style.padding = '0';
                    spacer.className = 'pdf-block-spacer';
                    el.parentNode?.insertBefore(spacer, el);
                    addedSpacers.push(spacer);
                }
            }
        }
        // --- END PAGE BREAK LOGIC ---

        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        // Revert modifications
        modifications.forEach(({ el, origMarginTop }) => {
            el.style.marginTop = origMarginTop;
        });
        addedSpacers.forEach(spacer => spacer.remove());

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF(orientation, 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        
        // Layout image on PDF
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = pdfWidth - (mX * 2);
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        // Check if content exceeds page height minus margins
        if (imgHeight > (pageHeight - mY * 2)) {
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', mX, mY, imgWidth, imgHeight);
            heightLeft -= (pageHeight - mY * 2);

            // Hide bottom margin
            if (heightLeft > 0) {
                pdf.setFillColor(255, 255, 255);
                pdf.rect(0, pageHeight - mY, pdfWidth, mY, 'F');
            }

            while (heightLeft > 0) {
                position -= (pageHeight - mY * 2);
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', mX, position + mY, imgWidth, imgHeight);
                
                // Hide top margin
                pdf.setFillColor(255, 255, 255);
                pdf.rect(0, 0, pdfWidth, mY, 'F');
                
                heightLeft -= (pageHeight - mY * 2);
                
                // Hide bottom margin
                if (heightLeft > 0) {
                    pdf.setFillColor(255, 255, 255);
                    pdf.rect(0, pageHeight - mY, pdfWidth, mY, 'F');
                }
            }
        } else {
            pdf.addImage(imgData, 'PNG', mX, mY, imgWidth, imgHeight);
        }

        pdf.save(`${fileName}.pdf`);
    }
};
