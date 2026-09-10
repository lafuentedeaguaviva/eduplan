'use client';

import {Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType , Footer } from 'docx';

/**
 * Parsea un texto en Markdown básico y genera un archivo Word (.docx)
 * @param markdownContent El contenido generado por IA en formato Markdown
 * @param teacherName El nombre del docente para incluirlo en el pie de página
 * @param title Título del documento
 */
export async function exportMarkdownToWord(markdownContent: string, teacherName: string, title: string) {
    const lines = markdownContent.split('\n');
    const paragraphs: Paragraph[] = [];

    // Título Principal
    paragraphs.push(new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
    }));

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Headers
        if (line.startsWith('### ')) {
            paragraphs.push(new Paragraph({
                text: line.replace('### ', ''),
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 200, after: 100 },
            }));
        } else if (line.startsWith('## ')) {
            paragraphs.push(new Paragraph({
                text: line.replace('## ', ''),
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 100 },
            }));
        } else if (line.startsWith('# ')) {
            paragraphs.push(new Paragraph({
                text: line.replace('# ', ''),
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
            }));
        } 
        // Listas
        else if (line.startsWith('- ') || line.startsWith('* ')) {
            paragraphs.push(new Paragraph({
                text: line.substring(2),
                bullet: { level: 0 }
            }));
        }
        // Fórmulas matemáticas (Bloque)
        else if (line.startsWith('$$')) {
            paragraphs.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: line.replace(/\$\$/g, ''),
                        italics: true, // Simulación de renderizado matemático básico
                        font: "Cambria Math",
                    })
                ]
            }));
        }
        // Texto normal (con soporte básico para negrita y matemáticas inline)
        else {
            const runs: TextRun[] = [];
            // Parseo rudimentario de negrita **texto**
            const boldParts = line.split('**');
            for (let j = 0; j < boldParts.length; j++) {
                if (j % 2 === 1) {
                    runs.push(new TextRun({ text: boldParts[j], bold: true }));
                } else {
                    // Parseo de $formula$ inline
                    const mathParts = boldParts[j].split('$');
                    for (let k = 0; k < mathParts.length; k++) {
                        if (k % 2 === 1) {
                            runs.push(new TextRun({ text: mathParts[k], italics: true, font: "Cambria Math" }));
                        } else {
                            if (mathParts[k]) runs.push(new TextRun({ text: mathParts[k] }));
                        }
                    }
                }
            }
            
            paragraphs.push(new Paragraph({
                children: runs,
                spacing: { after: 120 }
            }));
        }
    }

    const doc = new Document({
        sections: [{
            properties: {},
            headers: {
                default: undefined,
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: `Material Generado para la clase de: Prof. ${teacherName} | EduPlan Pro`,
                                    color: "888888",
                                    size: 20, // 10pt
                                })
                            ]
                        })
                    ]
                })
            },
            children: paragraphs,
        }],
    });

    const blob = await Packer.toBlob(doc);
    const { saveAs } = await import('file-saver');
    saveAs(blob, `Contenido_${title.replace(/\s+/g, '_')}.docx`);
}
