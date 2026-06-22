'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ReactMarkdown from 'react-markdown';
import { exportDirectorStatsToWord, exportToPDF } from '@/lib/exportService';

export function AiDirectorReport({ stats }: { stats: any }) {
    const [tone, setTone] = useState<string>('Analítico');
    const [reportText, setReportText] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const prompt = `
Eres un asesor educativo experto en planificación y pedagogía en Bolivia (Profocom, Modelo Sociocomunitario Productivo).
Se te ha entregado un resumen estadístico de todos los Planes de Desarrollo Curricular (PDCs) aprobados por el director de una unidad educativa.
Tu tarea es escribir un informe cualitativo, profesional y estructurado interpretando estos datos.

TONO REQUERIDO: ${tone}

ESTADÍSTICAS OBTENIDAS:
- Total PDCs aprobados: ${stats.totalApprovedPDCs}
- Total Objetivos: ${stats.totalObjectives}
- Taxonomía de Bloom (Niveles): ${JSON.stringify(stats.bloomTaxonomy.slice(0, 5))}
- Criterios SER (Top 5): ${JSON.stringify(stats.criterios.ser.slice(0, 5))}
- Criterios SABER (Top 5): ${JSON.stringify(stats.criterios.saber.slice(0, 5))}
- Criterios HACER (Top 5): ${JSON.stringify(stats.criterios.hacer.slice(0, 5))}
- Momentos Metodológicos - Práctica (Top 3): ${JSON.stringify(stats.momentos.practica.slice(0, 3))}
- Momentos Metodológicos - Producción (Top 3): ${JSON.stringify(stats.momentos.produccion.slice(0, 3))}

INSTRUCCIONES:
1. Analiza qué dominios de Bloom predominan y qué significa esto para el nivel de desafío cognitivo de los estudiantes.
2. Evalúa si hay equilibrio entre las dimensiones del Ser, Saber y Hacer.
3. Observa los momentos de Práctica y Producción. ¿Son activos y creativos o pasivos?
4. Formula 3 conclusiones fuertes y 2 recomendaciones accionables para los profesores.
5. El informe debe estar escrito en Markdown.
`;

            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, context: "Eres un asesor pedagógico de alto nivel." })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Error al generar el informe con IA');
            }

            setReportText(data.text);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            await exportToPDF('director-stats-container', 'Informe_Estadistico_Director', 'p');
        } catch (error) {
            console.error("Error exporting PDF:", error);
            alert("No se pudo exportar el PDF. Revisa la consola.");
        }
    };

    const handleExportWord = async () => {
        try {
            await exportDirectorStatsToWord(stats, reportText || "No se ha generado un informe con IA aún.");
        } catch (error) {
            console.error("Error exporting Word:", error);
            alert("No se pudo exportar a Word. Revisa la consola.");
        }
    };

    return (
        <Card className="p-8 border-none shadow-soft bg-white/50 backdrop-blur-sm mt-10" id="ai-report-section">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="material-symbols-rounded text-indigo-500">auto_awesome</span>
                        Análisis Cuali-Cuantitativo con IA
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Genera un reporte narrativo estructurado sobre las tendencias pedagógicas de tu unidad educativa.
                    </p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                    <select
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-auto"
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        disabled={loading}
                    >
                        <option value="Analítico">Tono Analítico (Objetivo)</option>
                        <option value="Formativo">Tono Formativo (Constructivo)</option>
                        <option value="Crítico">Tono Crítico (Exigente)</option>
                        <option value="Motivador">Tono Motivador (Inspirador)</option>
                    </select>

                    <Button 
                        onClick={generateReport} 
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 font-bold w-full md:w-auto flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Generando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-rounded text-[18px]">bolt</span>
                                Generar Informe
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 text-sm font-medium mb-6">
                    {error}
                </div>
            )}

            {reportText && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] text-indigo-600 bg-indigo-50 border-indigo-100">
                            INFORME GENERADO ({tone})
                        </Badge>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2 rounded-xl text-slate-600 hover:text-rose-600">
                                <span className="material-symbols-rounded text-[18px]">picture_as_pdf</span>
                                Exportar PDF
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleExportWord} className="gap-2 rounded-xl text-slate-600 hover:text-blue-600">
                                <span className="material-symbols-rounded text-[18px]">description</span>
                                Exportar Word
                            </Button>
                        </div>
                    </div>
                    
                    <div className="prose prose-slate prose-sm max-w-none 
                        prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900 
                        prose-p:text-slate-600 prose-p:leading-relaxed 
                        prose-li:text-slate-600 prose-strong:text-slate-800">
                        <ReactMarkdown>{reportText}</ReactMarkdown>
                    </div>
                </div>
            )}
        </Card>
    );
}
