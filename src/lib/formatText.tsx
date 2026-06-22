import React from 'react';

/**
 * Formatea el texto de la planificación:
 * - Renderiza **texto** en negrita (<strong>).
 * - Renderiza las etiquetas (Práctica), (Teoría), (Producción), (Valoración) en color rojo.
 * - Mantiene los saltos de línea originales.
 */
export function formatCurricularText(text: string | null | undefined): React.ReactNode {
    if (!text) return null;

    const fixedText = text.split('\n').map(line => {
        let newLine = line.replace(/^(\s*(?:-\s*)?)\(?(Práctica|Teoría|Producción|Valoración)\)?\s*:?\s*(.+)$/i, (match, p1, p2, p3) => {
            return `${p1 || ''}${p3} (${p2.charAt(0).toUpperCase() + p2.slice(1).toLowerCase()})`;
        });
        
        // Capitalizar la primera letra después del guion o al inicio de la línea
        newLine = newLine.replace(/^(\s*(?:-\s*)?)([a-záéíóúüñ])(.*)/, (match, p1, p2, p3) => {
             return `${p1}${p2.toUpperCase()}${p3}`;
        });

        return newLine;
    }).join('\n');

    const lines = fixedText.split('\n');
    return (
        <>
            {lines.map((line, idx) => {
                // Separamos por negritas o las palabras clave exactas (case-insensitive).
                const parts = line.split(/(\*\*.*?\*\*|Ser:|Saber:|Hacer:|Fuentes de Apoyo:|Discapacidad:|\(Práctica\)|\(Teoría\)|\(Producción\)|\(Valoración\))/gi);
                
                return (
                    <React.Fragment key={idx}>
                        {parts.map((part, i) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={i}>{part.slice(2, -2)}</strong>;
                            }
                            const lowerPart = part.toLowerCase();
                            if (['ser:', 'saber:', 'hacer:', 'fuentes de apoyo:', 'discapacidad:'].includes(lowerPart)) {
                                return <strong key={i}>{part}</strong>;
                            }
                            if (['(práctica)', '(teoría)', '(producción)', '(valoración)'].includes(lowerPart)) {
                                return <span key={i} style={{ color: '#ef4444', fontWeight: 'bold' }}>{part}</span>;
                            }
                            return <React.Fragment key={i}>{part}</React.Fragment>;
                        })}
                        {idx < lines.length - 1 && <br />}
                    </React.Fragment>
                );
            })}
        </>
    );
}
