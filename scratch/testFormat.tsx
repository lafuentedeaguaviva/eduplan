import React from 'react';
import { renderToString } from 'react-dom/server';

function formatCurricularText(text: string | null | undefined): React.ReactNode {
    if (!text) return null;
    const lines = text.split('\n');
    return (
        <>
            {lines.map((line, idx) => {
                const parts = line.split(/(\*\*.*?\*\*|\(Práctica\)|\(Teoría\)|\(Producción\)|\(Valoración\))/g);
                return (
                    <React.Fragment key={idx}>
                        {parts.map((part, i) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={i}>{part.slice(2, -2)}</strong>;
                            }
                            if (['(Práctica)', '(Teoría)', '(Producción)', '(Valoración)'].includes(part)) {
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

console.log(renderToString(<>{formatCurricularText("**Ser**: 1. Reconozca algo")}</>));
console.log(renderToString(<>{formatCurricularText("**Ser:** 1. Reconozca algo")}</>));
console.log(renderToString(<>{formatCurricularText("**Ser **: 1. Reconozca algo")}</>));
