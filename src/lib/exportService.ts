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
 * Helper to split text by newline and create multiple Paragraphs
 */
const createMultilineText = (text: string | null | undefined): Paragraph[] => {
    if (text === null || text === undefined) return [new Paragraph("N/A")];
    if (text === "") return [new Paragraph("")];

    // Fix tags at the beginning of lines: "- (Práctica) Item" or "- Práctica: Item" -> "- Item (Práctica)"
    const fixedText = text.split('\n').map(line => {
        return line.replace(/^(\s*(?:-\s*)?)\(?(Práctica|Teoría|Producción|Valoración)\)?\s*:?\s*(.+)$/i, (match, p1, p2, p3) => {
            return `${p1 || ''}${p3} (${p2.charAt(0).toUpperCase() + p2.slice(1).toLowerCase()})`;
        });
    }).join('\n');

    return fixedText.split('\n').map(line => {
        const parts = line.split(/(\*\*.*?\*\*|Ser:|Saber:|Hacer:|Fuentes de Apoyo:|Discapacidad:|\(Práctica\)|\(Teoría\)|\(Producción\)|\(Valoración\))/gi);
        const runs = parts.filter(p => p.length > 0).map(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return new TextRun({ text: part.slice(2, -2), bold: true });
            }
            const lowerPart = part.toLowerCase();
            if (['ser:', 'saber:', 'hacer:', 'fuentes de apoyo:', 'discapacidad:', '(práctica)', '(teoría)', '(producción)', '(valoración)'].includes(lowerPart)) {
                return new TextRun({ text: part, bold: true });
            }
            return new TextRun({ text: part });
        });
        return new Paragraph({ children: runs.length > 0 ? runs : [new TextRun("")], alignment: AlignmentType.BOTH });
    });
};

/**
 * Service to handle Word Exports matching Reportes.md requirements
 */
export const exportToWord = async (pdcData: PDC, fullData?: FullReportData, viewMode: 'ia' | 'original' = 'ia') => {
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
                                    new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph("Distrito Educativo")] }),
                                    new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph(fullData.distritos || 'N/A')] }),
                                    new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph("Unidad Educativa")] }),
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
                                            children: idx === 0 ? createMultilineText(viewMode === 'ia' ? (area.objetivos_aprendizaje_ia ?? area.objetivos_aprendizaje ?? "N/A") : (area.objetivos_aprendizaje ?? "N/A")) : []
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
                                        new TableCell({ children: createMultilineText(String(viewMode === 'ia' ? (s.momentos_ia ?? s.momentos_original ?? s.momentos ?? "N/A") : (s.momentos_original ?? s.momentos ?? "N/A"))) }),
                                        // Column 4: Resources
                                        new TableCell({ children: createMultilineText(String(viewMode === 'ia' ? (s.recursos_fuentes_ia ?? s.recursos_fuentes_original ?? s.recursos_fuentes ?? "N/A") : (s.recursos_fuentes_original ?? s.recursos_fuentes ?? "N/A"))) }),

                                        // Column 5: Periods
                                        new TableCell({ children: [new Paragraph(area.periodo_semanal?.toString() || "0"), new Paragraph({ children: [new TextRun({ text: "hrs", size: 16 })] })], verticalAlign: VerticalAlign.CENTER }),
                                        // Column 6: Criteria (Merged)
                                        new TableCell({ 
                                            verticalMerge: idx === 0 ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
                                            verticalAlign: VerticalAlign.CENTER,
                                            children: idx === 0 ? createMultilineText(String(viewMode === 'ia' ? (area.criterios_evaluacion_ia ?? area.criterios_evaluacion ?? "N/A") : (area.criterios_evaluacion ?? "N/A"))) : []
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
                                                new Paragraph(String(viewMode === 'ia' ? (area.adaptaciones_no_significativas_ia ?? area.adaptaciones_no_significativas ?? 'Ninguna') : (area.adaptaciones_no_significativas ?? 'Ninguna')))
                                            ] 
                                        }),
                                        new TableCell({ verticalMerge: VerticalMergeType.CONTINUE, children: [] }),
                                    ]
                                })
                            ]
                        }),
                        // New Table: Significative Adaptations
                        ...(area.semanas || []).some((s: PlanificacionSemanal) => {
                            const val = viewMode === 'ia' ? (s.adaptaciones_especiales_ia || s.adaptaciones_especiales_original || s.adaptaciones_especiales) : (s.adaptaciones_especiales_original || s.adaptaciones_especiales);
                            return val && typeof val === 'string' && val.trim().length > 0 && val.toLowerCase() !== 'ninguna' && val.toLowerCase() !== 'no definido' && val !== 'Sin datos previos.';
                        }) ? [
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
                                    ...(() => {
                                        const globalEspecialAdaps = area.semanas.flatMap((w: any) => Array.isArray(w.adaptaciones_basicas) ? w.adaptaciones_basicas.filter((a: any) => a.tipo?.toLowerCase() === 'especial') : []);
                                        const globalSituacionEspecial = [...new Set(globalEspecialAdaps.map((a: any) => a.situacion).filter(Boolean))].join('\n\n');

                                        return (area.semanas || []).filter((s: PlanificacionSemanal) => {
                                            const val = viewMode === 'ia' ? (s.adaptaciones_especiales_ia || s.adaptaciones_especiales_original || s.adaptaciones_especiales) : (s.adaptaciones_especiales_original || s.adaptaciones_especiales);
                                            return !!val;
                                        }).map((s: PlanificacionSemanal, idx: number) => {
                                            let discapacidadName = "N/A";
                                            if (viewMode === 'ia' && area.criterios_evaluacion_adaptaciones_ia) {
                                                const match = area.criterios_evaluacion_adaptaciones_ia.match(/Discapacidad:\s*([^\n]+)/i);
                                                if (match) discapacidadName = match[1].trim();
                                            } else if (viewMode === 'original' && area.criterios_evaluacion_adaptaciones) {
                                                const match = area.criterios_evaluacion_adaptaciones.match(/Discapacidad:\s*([^\n]+)/i);
                                                if (match) discapacidadName = match[1].trim();
                                            }
                                            if (discapacidadName === "N/A" && Array.isArray(s.adaptacion_especial) && s.adaptacion_especial.length > 0) {
                                                discapacidadName = s.adaptacion_especial[0].nombre_adaptacion || s.adaptacion_especial[0].condicion || "Discapacidad";
                                            }
                                            const displayDiscapacidad = globalSituacionEspecial || discapacidadName;

                                            return new TableRow({
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
                                                    new TableCell({ 
                                                        children: createMultilineText(String(displayDiscapacidad))
                                                    }),
                                                    new TableCell({ children: createMultilineText(String(viewMode === 'ia' ? (s.adaptaciones_especiales_ia ?? s.adaptaciones_especiales_original ?? s.adaptaciones_especiales ?? "N/A") : (s.adaptaciones_especiales_original ?? s.adaptaciones_especiales ?? "N/A"))) }),
                                                    new TableCell({ 
                                                        verticalMerge: idx === 0 ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE,
                                                        verticalAlign: VerticalAlign.CENTER,
                                                        children: idx === 0 ? createMultilineText(String(viewMode === 'ia' ? (area.criterios_evaluacion_adaptaciones_ia ?? area.criterios_evaluacion_adaptaciones ?? "N/A") : (area.criterios_evaluacion_adaptaciones ?? "N/A"))) : []
                                                    }),
                                                ]
                                            });
                                        });
                                    })()
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
                                    new TableCell({ children: [new Paragraph({ text: "__________________________", alignment: AlignmentType.CENTER }), new Paragraph({ text: `${fullData.director || ''}`, alignment: AlignmentType.CENTER }), new Paragraph({ text: "Director", alignment: AlignmentType.CENTER })] }),
                                    new TableCell({ children: [new Paragraph({ text: "__________________________", alignment: AlignmentType.CENTER }), new Paragraph({ text: `${fullData.docente || ''}`, alignment: AlignmentType.CENTER }), new Paragraph({ text: "Profesor", alignment: AlignmentType.CENTER })] }),
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
    try {
        const input = document.getElementById(elementId);
        if (!input) {
            throw new Error(`Elemento con ID ${elementId} no encontrado en el DOM.`);
        }

        // --- PAGE BREAK LOGIC ---
        const mX = 15; // 15mm margin
        const mY = 15; // 15mm margin
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

        // Calcular la escala de forma dinámica DESPUÉS de que los espaciadores han aumentado el alto
        let scale = 2;
        const MAX_DIMENSION = 15000; 
        if (input.offsetHeight * scale > MAX_DIMENSION) {
            scale = MAX_DIMENSION / input.offsetHeight;
            if (scale > 2) scale = 2;
        }

        // PATCH PARA HTML2CANVAS: Forzar RGB en lugar de Oklch/Lab
        const origGetComputedStyle = window.getComputedStyle;
        window.getComputedStyle = function(el, pseudoElt) {
            const style = origGetComputedStyle(el, pseudoElt);
            return new Proxy(style, {
                get(target, prop) {
                    if (prop === 'getPropertyValue') {
                        return function(propertyName: string) {
                            const val = target.getPropertyValue(propertyName);
                            if (typeof val === 'string' && (val.includes('lab(') || val.includes('lch(') || val.includes('color('))) {
                                if (propertyName === 'background-color' || propertyName === 'background') return 'rgb(255, 255, 255)';
                                if (propertyName.includes('border')) return 'rgb(226, 232, 240)';
                                return 'rgb(15, 23, 42)';
                            }
                            return val;
                        };
                    }
                    const val = (target as any)[prop];
                    if (typeof val === 'string' && typeof prop === 'string') {
                        if (val.includes('lab(') || val.includes('lch(') || val.includes('color(')) {
                            if (prop === 'backgroundColor' || prop === 'background') return 'rgb(255, 255, 255)';
                            if (prop.includes('border')) return 'rgb(226, 232, 240)';
                            return 'rgb(15, 23, 42)';
                        }
                    }
                    if (typeof val === 'function') {
                        return val.bind(target);
                    }
                    return val;
                }
            });
        };

        let canvas;
        try {
            canvas = await html2canvas(input, {
                scale: scale,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
        } finally {
            // Restore immediately
            window.getComputedStyle = origGetComputedStyle;
        }

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
    } catch (error: any) {
        console.error('Error detallado en exportToPDF:', error);
        throw new Error(error.message || 'Fallo desconocido al exportar PDF');
    }
};

export const ORDERED_COMPONENTS = [
    { id: 'aprendizaje', label: 'Objetivos de aprendizaje' },
    { id: 'contenidos', label: 'Contenidos' },
    { id: 'practica', label: 'Momento Práctica' },
    { id: 'teoria', label: 'Momento Teoría' },
    { id: 'produccion', label: 'Momento Producción' },
    { id: 'valoracion', label: 'Momento Valoración' },
    { id: 'criterio_ser', label: 'Criterio Ser' },
    { id: 'criterio_saber', label: 'Criterio Saber' },
    { id: 'criterio_hacer', label: 'Criterio Hacer' },
    { id: 'recursos', label: 'Recursos' },
    { id: 'fuentes', label: 'Fuentes' },
    { id: 'adaptaciones_gral', label: 'Adaptaciones Generales' },
    { id: 'adaptaciones_esp', label: 'Adaptaciones Especiales' },
    { id: 'presentacion', label: 'Presentación General' },
];

export const COMPONENT_DETAILS: Record<string, any> = {
    aprendizaje: { levels: [{ level: 1, text: "Los objetivos de aprendizaje están ausentes o no guardan relación con el plan." }, { level: 2, text: "Los objetivos existen pero utilizan verbos no observables (saber, comprender, conocer)." }, { level: 3, text: "Los objetivos son aceptables pero demasiado amplios o vagos para el tiempo declarado." }, { level: 4, text: "Los objetivos son claros pero el verbo podría ajustarse para mayor precisión." }, { level: 5, text: "Los objetivos están bien formulados con verbos observables, específicos, medibles y alcanzables." }] },
    contenidos: { levels: [{ level: 1, text: "Los contenidos están ausentes o son completamente ajenos al área y nivel." }, { level: 2, text: "Los contenidos existen pero están desordenados, repetidos o sin secuencia lógica." }, { level: 3, text: "Los contenidos son pertinentes pero no hay progresión de menor a mayor complejidad." }, { level: 4, text: "Los contenidos están bien seleccionados pero la carga horaria (columna Per.) está incompleta." }, { level: 5, text: "Los contenidos son pertinentes, están secuenciados por semana con progresión adecuada y carga horaria definida." }] },
    practica: { levels: [{ level: 1, text: "El momento Práctica está ausente. No se parte de experiencia concreta alguna." }, { level: 2, text: "El momento Práctica existe pero es teórico o pasivo, sin acción del estudiante." }, { level: 3, text: "El momento Práctica es una actividad genérica no vinculada al contenido específico." }, { level: 4, text: "El momento Práctica está presente pero la actividad es poco desafiante o demasiado breve." }, { level: 5, text: "El momento Práctica parte de una experiencia concreta, activa y pertinente que moviliza saberes previos." }] },
    teoria: { levels: [{ level: 1, text: "El momento Teoría está ausente. No hay sistematización conceptual." }, { level: 2, text: "El momento Teoría es una exposición magistral sin participación ni diálogo con los estudiantes." }, { level: 3, text: "El momento Teoría existe pero los conceptos no se vinculan con la práctica realizada." }, { level: 4, text: "El momento Teoría es adecuado pero la profundidad es insuficiente para el nivel." }, { level: 5, text: "El momento Teoría sistematiza la práctica, introduce conceptos clave con diálogo y ejemplos contextualizados." }] },
    produccion: { levels: [{ level: 1, text: "El momento Producción está ausente. El estudiante no aplica ni crea nada." }, { level: 2, text: "El momento Producción es una repetición mecánica sin creatividad ni aplicación nueva." }, { level: 3, text: "El momento Producción existe pero el producto no evidencia la comprensión del contenido." }, { level: 4, text: "El momento Producción es pertinente pero la consigna es cerrada o poco innovadora." }, { level: 5, text: "El momento Producción desafía al estudiante a crear, aplicar o transform el conocimiento en un producto tangible y significativo." }] },
    valoracion: { levels: [{ level: 1, text: "El momento Valoración está ausente. No hay reflexión ética ni metacognitiva." }, { level: 2, text: "El momento Valoración es una mera calificación sin reflexión sobre el proceso." }, { level: 3, text: "El momento Valoración existe pero las preguntas son cerradas y superficiales." }, { level: 4, text: "El momento Valoración promueve reflexión pero sin vincularla a valores o compromisos concretos." }, { level: 5, text: "El momento Valoración guía una reflexión ética profunda, conecta lo aprendido con la vida y genera compromisos personales y comunitarios." }] },
    criterio_ser: { levels: [{ level: 1, text: "No se evidencian criterios de evaluación para la dimensión del Ser (actitudes, valores)." }, { level: 2, text: "Los criterios del Ser son genéricos y no se vinculan con el contenido o el objetivo." }, { level: 3, text: "Criterios del Ser presentes pero sin instrumentos claros para su seguimiento." }, { level: 4, text: "Criterios del Ser adecuados y con instrumentos, pero podrían ser más específicos." }, { level: 5, text: "Criterios del Ser perfectamente definidos, con instrumentos claros y vinculados a la formación integral." }] },
    criterio_saber: { levels: [{ level: 1, text: "No se evidencian criterios de evaluación para la dimensión del Saber (conocimientos)." }, { level: 2, text: "Los criterios del Saber son memorísticos y no evalúan la comprensión profunda." }, { level: 3, text: "Criterios del Saber presentes pero se limitan a pruebas objetivas tradicionales." }, { level: 4, text: "Criterios del Saber adecuados, evalúan aplicación pero falta variedad instrumental." }, { level: 5, text: "Criterios del Saber evalúan procesos cognitivos superiores con diversidad de instrumentos." }] },
    criterio_hacer: { levels: [{ level: 1, text: "No se evidencian criterios de evaluación para la dimensión del Hacer (habilidades)." }, { level: 2, text: "Los criterios del Hacer no guardan relación con el producto o actividad propuesta." }, { level: 3, text: "Criterios del Hacer presentes pero no definen qué aspectos del producto se evalúan." }, { level: 4, text: "Criterios del Hacer adecuados pero faltan rúbricas o escalas de desempeño." }, { level: 5, text: "Criterios del Hacer claros, medibles, con rúbricas detalladas y alineados al producto final." }] },
    recursos: { levels: [{ level: 1, text: "No se especifican recursos didácticos en el PDC." }, { level: 2, text: "Los recursos mencionados no son pertinentes al contenido o no están disponibles." }, { level: 3, text: "Los recursos son adecuados pero insuficientes o poco variados." }, { level: 4, text: "Los recursos son variados y pertinentes pero no consideran accesibilidad para estudiantes con NEE." }, { level: 5, text: "Los recursos son variados, pertinentes, accesibles para todos y aprovechan materiales del contexto comunitario." }] },
    fuentes: { levels: [{ level: 1, text: "No se mencionan fuentes de información en el PDC." }, { level: 2, text: "Las fuentes están mencionadas pero sin citación completa (falta autor, año o editorial)." }, { level: 3, text: "Las fuentes están citadas pero están desactualizadas (más de 5 años) o no son oficiales." }, { level: 4, text: "Las fuentes son actuales y oficiales pero no incluyen diversidad de formatos (libros, videos, normativas)." }, { level: 5, text: "Las fuentes están correctamente citadas, actualizadas, diversas e incluyen referencias del Ministerio de Educación de Bolivia." }] },
    adaptaciones_gral: { levels: [{ level: 1, text: "No se incluyen adaptaciones curriculares generales." }, { level: 2, text: "Se mencionan adaptaciones pero de forma genérica sin ejemplos concretos." }, { level: 3, text: "Las adaptaciones son pertinentes pero solo consideran tiempos, no otros aspectos (materiales, agrupamientos)." }, { level: 4, text: "Las adaptaciones son adecuadas pero no se vinculan explícitamente con los momentos metodológicos." }, { level: 5, text: "Las adaptaciones generales son concretas, variadas (tiempos, materiales, agrupamientos) y pertinentes para la atención a la diversidad." }] },
    adaptaciones_esp: { levels: [{ level: 1, text: "No se incluyen adaptaciones especiales a pesar de existir estudiantes con NEE certificadas." }, { level: 2, text: "Las adaptaciones especiales son genéricas o copia textual de otro documento sin ajuste." }, { level: 3, text: "Las adaptaciones especiales incluyen corchetes [ ] sin completar con texto concreto." }, { level: 4, text: "Las adaptaciones especiales están escritas con texto concreto pero no consideran todos los tipos de NEE presentes en el aula." }, { level: 5, text: "Las adaptaciones especiales son específicas, concretas, sin corchetes, y responden a las necesidades reales de los estudiantes del curso." }] },
    presentacion: { levels: [{ level: 1, text: "El documento es caótico, con múltiples repeticiones y sin orden identificable." }, { level: 2, text: "El documento tiene información ajena al área y repeticiones que dificultan la lectura." }, { level: 3, text: "El documento es legible pero presenta desórdenes menores o errores de formato." }, { level: 4, text: "El documento está ordenado pero faltan firmas o espacios institucionales." }, { level: 5, text: "El documento está ordenado, sin repeticiones, incluye firmas del docente y espacio para visto bueno de dirección." }] },
};

export const getObservationText = (compId: string, evalData: any) => {
    if (evalData.comment && evalData.comment.trim() !== '' && evalData.comment !== 'Sin observaciones.') {
        return evalData.comment;
    }
    if (evalData.level > 0 && COMPONENT_DETAILS[compId]) {
        const levelData = COMPONENT_DETAILS[compId].levels.find((l: any) => l.level === evalData.level);
        if (levelData) {
            return levelData.text;
        }
    }
    return "Sin observaciones.";
};

const buildComponentRows = (evaluations: any) => {
    if (!evaluations || Object.keys(evaluations).length === 0) return [];
    
    const orderedRows = ORDERED_COMPONENTS.map((comp, index) => {
        const evalData = evaluations[comp.id];
        if (!evalData) return null;
        const label = `${index + 1}. ${comp.label}`;
        const observationText = getObservationText(comp.id, evalData);
        
        return new TableRow({
            children: [
                new TableCell({ children: [new Paragraph(label)] }),
                new TableCell({ children: [new Paragraph({ text: evalData.level?.toString() || '0', alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph(observationText)] }),
            ]
        });
    }).filter(Boolean) as TableRow[];
    
    const extraKeys = Object.keys(evaluations).filter(k => !ORDERED_COMPONENTS.some(c => c.id === k));
    let currentIndex = ORDERED_COMPONENTS.length + 1;
    extraKeys.forEach(id => {
        const evalData = evaluations[id];
        const label = `${currentIndex}. ${id.charAt(0).toUpperCase() + id.slice(1).replace('_', ' ')}`;
        const observationText = getObservationText(id, evalData);
        orderedRows.push(new TableRow({
            children: [
                new TableCell({ children: [new Paragraph(label)] }),
                new TableCell({ children: [new Paragraph({ text: evalData.level?.toString() || '0', alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph(observationText)] }),
            ]
        }));
        currentIndex++;
    });
    
    return orderedRows;
};

/**
 * Export a single PDC Evaluation to Word
 */
export const exportEvaluationToWord = async (revision: any, evaluations: any, stats: any, directorName?: string) => {
    const totalScore: number = Object.values(evaluations).reduce((sum: number, e: any) => sum + (e.level || 0), 0) as number;
    const average = (totalScore / Object.keys(evaluations).length).toFixed(2);

    const doc = new Document({
        sections: [{
            properties: { page: { size: { orientation: PageOrientation.PORTRAIT } } },
            children: [
                new Paragraph({ text: "INFORME DE REVISIÓN PEDAGÓGICA", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
                
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "DOCENTE:", bold: true })] })] }), new TableCell({ children: [new Paragraph(revision.pdc_snapshot?.docente || (revision.perfiles?.nombres ? `${revision.perfiles.nombres} ${revision.perfiles.apellidos}` : "No especificado"))] })] }),
                        new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ÁREA/MATERIA:", bold: true })] })] }), new TableCell({ children: [new Paragraph(revision.materia || "N/A")] })] }),
                        new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "FECHA:", bold: true })] })] }), new TableCell({ children: [new Paragraph(new Date().toLocaleDateString())] })] }),
                        new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "DICTAMEN:", bold: true })] })] }), new TableCell({ shading: { fill: stats.observedCount === 0 ? "E8F5E9" : "FFEBEE" }, children: [new Paragraph({ children: [new TextRun({ text: stats.dictamen, bold: true, color: stats.observedCount === 0 ? "2E7D32" : "C62828" })] })] })] }),
                        new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "PROMEDIO:", bold: true })] })] }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${average} / 5.00`, bold: true })] })] })] }),
                    ]
                }),

                new Paragraph({ text: "DETALLE POR COMPONENTE", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),

                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Componente", bold: true })] })] }),
                                new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Puntaje", bold: true })], alignment: AlignmentType.CENTER })] }),
                                new TableCell({ width: { size: 45, type: WidthType.PERCENTAGE }, shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Observaciones", bold: true })] })] }),
                            ]
                        }),
                        ...buildComponentRows(evaluations)
                    ]
                }),

                new Paragraph({ text: "", spacing: { before: 800 } }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: "__________________________", alignment: AlignmentType.CENTER }), new Paragraph({ text: `${directorName || revision.pdc_snapshot?.director || ""}`, alignment: AlignmentType.CENTER }), new Paragraph({ text: "Director", alignment: AlignmentType.CENTER })] }),
                                new TableCell({ children: [new Paragraph({ text: "__________________________", alignment: AlignmentType.CENTER }), new Paragraph({ text: `${revision.pdc_snapshot?.docente || (revision.perfiles?.nombres ? `${revision.perfiles.nombres} ${revision.perfiles.apellidos}` : "")}`, alignment: AlignmentType.CENTER }), new Paragraph({ text: "Profesor", alignment: AlignmentType.CENTER })] }),
                            ]
                        })
                    ]
                })
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    const safeMateria = (revision.materia || "Reporte").replace(/[\/\\:*?"<>|]/g, '_');
    saveAs(blob, `Informe_Revision_${safeMateria}_${new Date().getTime()}.docx`);
};

/**
 * Export consolidated revisions for a School Unit to Word
 */
export const exportConsolidatedRevisionsToWord = async (unitName: string, revisions: any[], directorName?: string) => {
    const aprobados = revisions.filter(r => r.estado === 'aprobado').length;
    const observados = revisions.filter(r => r.estado === 'observado' || r.estado === 'revisado').length;
    const enviados = revisions.filter(r => r.estado === 'enviado').length;

    const summarySection = {
        properties: { page: { size: { orientation: PageOrientation.PORTRAIT } } },
        children: [
            new Paragraph({ text: "RESUMEN DE INFORMES - REVISIÓN PEDAGÓGICA", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
            new Paragraph({ text: `Total de Informes Procesados: ${revisions.length}`, spacing: { after: 200 } }),
            
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({ children: [new TableCell({ children: [new Paragraph("Aprobados (Sin observaciones)")] }), new TableCell({ children: [new Paragraph(aprobados.toString())] })] }),
                    new TableRow({ children: [new TableCell({ children: [new Paragraph("Observados / Revisados")] }), new TableCell({ children: [new Paragraph(observados.toString())] })] }),
                    new TableRow({ children: [new TableCell({ children: [new Paragraph("Pendientes de Revisión")] }), new TableCell({ children: [new Paragraph(enviados.toString())] })] }),
                ]
            }),
            new Paragraph({ text: "", spacing: { before: 800 } }),
        ]
    };

    const doc = new Document({
        sections: [
            summarySection,
            ...revisions.map((rev, index) => {
                const evaluations = rev.observaciones?.evaluations || {};
                const stats = rev.observaciones?.stats || { dictamen: "Sin dictamen registrado.", average: "N/A" };
                
                const childrenElements = [
                    new Paragraph({ text: `INFORME DE REVISIÓN PEDAGÓGICA: ${rev.materia}`, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "DOCENTE:", bold: true })] })] }), new TableCell({ children: [new Paragraph(rev.pdc_snapshot?.docente || (rev.perfiles?.nombres ? `${rev.perfiles.nombres} ${rev.perfiles.apellidos}` : "No especificado"))] })] }),
                            new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ÁREA/MATERIA:", bold: true })] })] }), new TableCell({ children: [new Paragraph(rev.materia || "N/A")] })] }),
                            new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ESTADO:", bold: true })] })] }), new TableCell({ children: [new Paragraph(rev.estado.toUpperCase())] })] }),
                            new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "PROMEDIO:", bold: true })] })] }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: stats.average || "N/A", bold: true })] })] })] }),
                            new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "DICTAMEN:", bold: true })] })] }), new TableCell({ children: [new Paragraph(stats.dictamen || "Sin dictamen")] })] }),
                        ]
                    }),

                    new Paragraph({ text: "DETALLE POR COMPONENTE", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),

                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Componente", bold: true })] })] }),
                                    new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Puntaje", bold: true })], alignment: AlignmentType.CENTER })] }),
                                    new TableCell({ width: { size: 45, type: WidthType.PERCENTAGE }, shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Observaciones", bold: true })] })] }),
                                ]
                            }),
                            ...buildComponentRows(evaluations)
                        ]
                    })
                ];

                if (index === revisions.length - 1) {
                    childrenElements.push(
                        new Paragraph({ text: "", spacing: { before: 800 } }),
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph({ text: "__________________________", alignment: AlignmentType.CENTER }), new Paragraph({ text: `${directorName || ""}`, alignment: AlignmentType.CENTER }), new Paragraph({ text: "Director", alignment: AlignmentType.CENTER })] })
                                    ]
                                })
                            ]
                        })
                    );
                }

                return {
                    properties: { page: { size: { orientation: PageOrientation.PORTRAIT } } },
                    children: childrenElements
                };
            })
        ]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Consolidado_Revisiones_${unitName}.docx`);
};

/**
 * Export General Stats to Word
 */
export const exportGeneralStatsToWord = async (stats: any, staff: any[]) => {
    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({ text: "REPORTE ESTADÍSTICO INSTITUCIONAL", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
                
                new Paragraph({ text: "1. INDICADORES CLAVE", heading: HeadingLevel.HEADING_2 }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({ children: [new TableCell({ children: [new Paragraph("Tasa de Aprobación")] }), new TableCell({ children: [new Paragraph(`${stats.approvalRate}%`)] })] }),
                        new TableRow({ children: [new TableCell({ children: [new Paragraph("Tiempo Promedio de Revisión")] }), new TableCell({ children: [new Paragraph(`${stats.avgCycleTime} horas`)] })] }),
                        new TableRow({ children: [new TableCell({ children: [new Paragraph("Total de Docentes Activos")] }), new TableCell({ children: [new Paragraph(staff.length.toString())] })] }),
                    ]
                }),

                new Paragraph({ text: "2. DESEMPEÑO DOCENTE", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Docente", bold: true })] })] }),
                                new TableCell({ shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "% Ejecución", bold: true })] })] }),
                                new TableCell({ shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Temas", bold: true })] })] }),
                            ]
                        }),
                        ...staff.map(t => new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph(t.nombres || 'Docente')] }),
                                new TableCell({ children: [new Paragraph(`${t.executionRate}%`)] }),
                                new TableCell({ children: [new Paragraph(`${t.completedContents} / ${t.totalContents}`)] }),
                            ]
                        }))
                    ]
                }),

                new Paragraph({ text: "", spacing: { before: 600 } }),
                new Paragraph({ text: `Fecha de emisión: ${new Date().toLocaleDateString()}`, alignment: AlignmentType.RIGHT }),
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Reporte_Estadistico_UE_${new Date().getFullYear()}.docx`);
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

/**
 * Service to handle Exporting Director AI Stats to Word
 */
export const exportDirectorStatsToWord = async (stats: any, aiReportText: string) => {
    // Helper to process markdown-like AI report
    const paragraphs = aiReportText.split('\n').map(line => {
        if (line.trim().startsWith('###')) {
            return new Paragraph({
                text: line.replace(/###/g, '').trim(),
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 200, after: 100 }
            });
        }
        if (line.trim().startsWith('##')) {
            return new Paragraph({
                text: line.replace(/##/g, '').trim(),
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 100 }
            });
        }
        if (line.trim().startsWith('#')) {
            return new Paragraph({
                text: line.replace(/#/g, '').trim(),
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 }
            });
        }
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return new Paragraph({
                text: line.substring(2).replace(/\*\*/g, '').trim(),
                bullet: { level: 0 }
            });
        }
        // Bold parsing basic
        const parts = line.split(/\*\*(.*?)\*\*/g);
        const runs = parts.map((part, index) => {
            if (index % 2 === 1) { // It's bold
                return new TextRun({ text: part, bold: true });
            }
            return new TextRun({ text: part });
        });
        
        return new Paragraph({
            children: runs,
            spacing: { after: 100 }
        });
    });

    const createStatTable = (title: string, dataArray: any[]) => {
        return [
            new Paragraph({ text: title, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Categoría", bold: true })] })] }),
                            new TableCell({ shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Cantidad", bold: true })] })] }),
                            new TableCell({ shading: { fill: "F5F5F5" }, children: [new Paragraph({ children: [new TextRun({ text: "Porcentaje", bold: true })] })] }),
                        ]
                    }),
                    ...dataArray.map(item => new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(item.name)] }),
                            new TableCell({ children: [new Paragraph(item.value.toString())] }),
                            new TableCell({ children: [new Paragraph(`${item.percentage}%`)] }),
                        ]
                    }))
                ]
            })
        ];
    };

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: "INFORME DE ESTADÍSTICAS PEDAGÓGICAS Y ANÁLISIS DE IA",
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: `PDCs Aprobados: ${stats.totalApprovedPDCs}`,
                    bold: true,
                    spacing: { after: 200 }
                }),
                
                ...createStatTable("Taxonomía de Bloom", stats.bloomTaxonomy),
                ...createStatTable("Momentos - Práctica", stats.momentos.practica),
                ...createStatTable("Criterios - SER", stats.criterios.ser),
                
                new Paragraph({ text: "ANÁLISIS DE LA INTELIGENCIA ARTIFICIAL", heading: HeadingLevel.HEADING_1, spacing: { before: 600, after: 200 } }),
                ...paragraphs
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Informe_IA_Director_${new Date().getFullYear()}.docx`);
};
