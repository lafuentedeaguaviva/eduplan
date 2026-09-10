'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useDirectorController } from '@/hooks/useDirectorController';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PdcStatisticsCharts } from '@/components/dashboard/director/PdcStatisticsCharts';
import { PedagogicalStats } from '@/components/director/PedagogicalStats';

export default function DirectorReportsPage() {
    const router = useRouter();
    const { analytics, staff, pdcs, revisionStats, loading } = useDirectorController();
    const [generating, setGenerating] = useState<string | null>(null);

    const exportGeneralWord = async () => {
        setGenerating('global-word');
        try {
            const { exportGeneralStatsToWord } = await import('@/lib/exportService');
            await exportGeneralStatsToWord(revisionStats, staff);
            toast.success("Informe estadístico generado en Word.");
        } finally {
            setGenerating(null);
        }
    };

    const exportConsolidatedWord = async () => {
        setGenerating('consolidated-word');
        try {
            const { exportConsolidatedRevisionsToWord } = await import('@/lib/exportService');
            // We need the actual revisions data. useDirectorController provides 'pdcs' and 'revisionStats'.
            // For now we'll use the available 'pdcs' or fetch from service if needed.
            await exportConsolidatedRevisionsToWord("Unidad Educativa", pdcs);
            toast.success("Informe consolidado generado en Word.");
        } finally {
            setGenerating(null);
        }
    };

    const exportTrimestralPDF = async () => {
        setGenerating('trimestral-pdf');
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');
            const doc = new jsPDF();
            const now = new Date().toLocaleDateString();

            // Header
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text('INFORME DE IMPLEMENTACIÓN DE PDC', 105, 20, { align: 'center' });
            
            // I. DATOS REFERENCIALES
            doc.setFontSize(12);
            doc.text('I.     DATOS REFERENCIALES', 20, 35);
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('INSTITUCIÓN EDUCATIVA:', 30, 45);
            doc.text('SUBSISTEMA:', 30, 52);
            doc.text('DIRECTOR DE NÚCLEO Y/O UNIDAD EDUCATIVA:', 30, 59);
            doc.text('LUGAR Y FECHA:', 30, 66);

            doc.setFont('helvetica', 'normal');
            doc.text('Unidad Educativa', 85, 45);
            doc.text('Educación Regular', 60, 52);
            doc.text('Director/a', 115, 59);
            doc.text(now, 65, 66);

            // II. COMPONENTES DEL INFORME
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('II.    COMPONENTES DEL INFORME', 20, 80);
            
            doc.text('1. ASPECTO ADMINISTRATIVO INSTITUCIONAL', 30, 90);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text('Acciones de implementación del Plan de Desarrollo Curricular (programas de estudio, textos de aprendizaje, PSP y otros). Consolidado de avance de la Unidad Educativa:', 30, 100, { maxWidth: 160 });

            let currentY = 115;
            
            // 2. Gráfico de Avance
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('2. GRÁFICO DE AVANCE DE IMPLEMENTACIÓN POR DOCENTE', 30, currentY);
            currentY += 10;

            if (staff && staff.length > 0) {
                const chartX = 40;
                const chartY = currentY + 5;
                const chartWidth = 130;
                const chartHeight = 40;
                
                // Dibujar Ejes
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.5);
                doc.line(chartX, chartY, chartX, chartY + chartHeight); // Eje Y
                doc.line(chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight); // Eje X
                
                // Dibujar líneas guía horizontales
                doc.setDrawColor(230, 230, 230);
                doc.line(chartX, chartY + (chartHeight / 2), chartX + chartWidth, chartY + (chartHeight / 2)); // 50%
                doc.line(chartX, chartY, chartX + chartWidth, chartY); // 100%
                
                doc.setFontSize(7);
                doc.setTextColor(150, 150, 150);
                doc.text('100%', chartX - 10, chartY + 2);
                doc.text('50%', chartX - 8, chartY + (chartHeight / 2) + 2);
                doc.text('0%', chartX - 6, chartY + chartHeight + 2);
                doc.setTextColor(0, 0, 0);

                // Dibujar barras
                const maxBars = Math.min(staff.length, 12); // Límite por espacio
                const validStaff = staff.slice(0, maxBars);
                const barWidth = 8;
                const spacing = (chartWidth - (validStaff.length * barWidth)) / (validStaff.length + 1);
                
                validStaff.forEach((t: any, idx: number) => {
                    const x = chartX + spacing + (idx * (barWidth + spacing));
                    const rate = Math.min(t.executionRate || 0, 100);
                    const barHeight = (rate / 100) * chartHeight;
                    const y = chartY + chartHeight - barHeight;
                    
                    if (rate >= 80) doc.setFillColor(34, 197, 94); // Green
                    else if (rate >= 50) doc.setFillColor(234, 179, 8); // Yellow
                    else doc.setFillColor(239, 68, 68); // Red
                    
                    doc.rect(x, y, barWidth, barHeight, 'F');
                    
                    const initials = (t.nombres || 'D').substring(0, 3).toUpperCase();
                    doc.setFontSize(7);
                    doc.text(initials, x + (barWidth/2), chartY + chartHeight + 5, { align: 'center' });
                    
                    doc.setFontSize(6);
                    doc.text(`${rate}%`, x + (barWidth/2), y - 2, { align: 'center' });
                });
                
                currentY += chartHeight + 20;
            } else {
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(9);
                doc.text('No hay datos suficientes para generar la gráfica.', 40, currentY + 5);
                currentY += 15;
            }

            // Create a table showing the staff execution rate and contents
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('3. DESGLOSE DETALLADO DE AVANCE', 30, currentY);
            currentY += 8;

            const tableData = staff.map((t: any) => [
                t.nombres || 'Docente',
                t.completedContents?.toString() || '0',
                `${t.executionRate || 0}%`,
                (t.executionRate || 0) > 70 ? 'Óptimo' : 'Requiere Apoyo'
            ]);

            autoTable(doc, {
                startY: currentY,
                head: [['Docente', 'Temas Ejecutados', '% Avance', 'Estado de Seguimiento']],
                body: tableData,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 4 },
                headStyles: { fillColor: [30, 41, 59], textColor: 255 }
            });

            const finalY = (doc as any).lastAutoTable.finalY + 30;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text('__________________________', 105, finalY, { align: 'center' });
            doc.text('Firma y Sello Director(a)', 105, finalY + 5, { align: 'center' });

            doc.save('Informe_Implementacion_PDC.pdf');
            toast.success("Informe de Implementación PDC generado.");
        } finally {
            setGenerating(null);
        }
    };

    const exportTeacherPDF = async (teacher: any) => {
        setGenerating(teacher.id || teacher.nombres);
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');
            const doc = new jsPDF();
            const now = new Date().toLocaleDateString();

            // Header Professional
            doc.setFillColor(30, 41, 59);
            doc.rect(0, 0, 210, 50, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.text('INFORME DE CUMPLIMIENTO DOCENTE', 105, 20, { align: 'center' });
            doc.setFontSize(14);
            doc.text(teacher.nombres || 'Docente', 105, 32, { align: 'center' });
            doc.setFontSize(9);
            doc.text(`Fecha: ${now} | Reporte Individualizado de Desempeño`, 105, 42, { align: 'center' });

            // Metrics
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(12);
            doc.text('ANÁLISIS DE PRODUCTIVIDAD', 20, 65);
            
            const metrics = [
                ['Temas Planificados en PDC', teacher.totalContents],
                ['Temas Completados (Ejecutados)', teacher.completedContents],
                ['Porcentaje de Cumplimiento', `${teacher.executionRate}%`],
                ['Estado de Seguimiento', teacher.executionRate > 70 ? 'Óptimo' : 'Requiere Refuerzo']
            ];

            autoTable(doc, {
                startY: 75,
                body: metrics,
                theme: 'plain',
                styles: { fontSize: 11, cellPadding: 4 }
            });

            // Conclusions
            const finalY = (doc as any).lastAutoTable.finalY + 30;
            doc.setFontSize(12);
            doc.text('OBSERVACIONES Y FIRMAS', 20, finalY);
            doc.line(20, finalY + 2, 190, finalY + 2);
            
            doc.setFontSize(10);
            doc.text('Se certifica que el docente ha cumplido con la carga académica declarada en sus', 20, finalY + 15);
            doc.text('instrumentos de planificación oficial (PDC) conforme a las normativas vigentes.', 20, finalY + 20);

            doc.text('__________________________', 40, finalY + 60);
            doc.text('Firma Director(a)', 55, finalY + 65);

            doc.text('__________________________', 120, finalY + 60);
            doc.text('Firma Docente', 135, finalY + 65);

            doc.save(`Reporte_${(teacher.nombres || 'Docente').replace(' ', '_')}.pdf`);
        } finally {
            setGenerating(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="size-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-24">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <Badge variant="outline" className="text-indigo-600 border-indigo-100 font-black uppercase tracking-widest text-[9px] px-3">Gobierno Institucional</Badge>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Estadísticas y <span className="text-indigo-600">Reportes</span></h1>
                    <p className="text-slate-500 font-medium">Monitoreo centralizado de planificación, ejecución y calidad pedagógica.</p>
                </div>
                <div className="flex flex-wrap justify-end gap-4">
                    <Button 
                        onClick={exportTrimestralPDF} 
                        isLoading={generating === 'trimestral-pdf'}
                        className="h-16 px-8 rounded-[2rem] bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center gap-4 group shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                        <span className="material-symbols-rounded text-2xl group-hover:scale-110 transition-transform text-red-400">picture_as_pdf</span>
                        INFORME PDC
                    </Button>
                    <Button 
                        onClick={exportGeneralWord} 
                        isLoading={generating === 'global-word'}
                        variant="outline"
                        className="h-16 px-8 rounded-[2rem] border-slate-200 text-slate-700 font-black flex items-center gap-4 group shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                        <span className="material-symbols-rounded text-2xl text-blue-600 group-hover:rotate-12 transition-transform">description</span>
                        ESTADÍSTICAS WORD
                    </Button>
                    <Button 
                        onClick={exportConsolidatedWord} 
                        isLoading={generating === 'consolidated-word'}
                        className="h-16 px-8 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black flex items-center gap-4 group shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                        <span className="material-symbols-rounded text-2xl group-hover:scale-110 transition-transform">library_books</span>
                        CONSOLIDADO UE
                    </Button>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MiniStatCard label="Tasa Aprobación" value={`${revisionStats?.approvalRate || 0}%`} icon="verified" color="emerald" />
                <MiniStatCard label="Tiempo Rev." value={`${revisionStats?.avgCycleTime || 0}h`} icon="timer" color="blue" />
                <MiniStatCard label="PDCs Totales" value={pdcs.length} icon="description" color="indigo" />
                <MiniStatCard label="Docentes" value={staff.length} icon="groups" color="slate" />
            </div>

            {/* Detailed Analytics Charts */}
            <div className="mt-12 mb-12">
                <PdcStatisticsCharts />
            </div>

            {/* Minería Pedagógica (Bloom, Momentos, Criterios) */}
            <div className="mb-12">
                <PedagogicalStats />
            </div>

            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-4">
                        <span className="material-symbols-rounded text-indigo-500">person_search</span>
                        Informes por Docente
                    </h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total: {staff.length} registros</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {staff.map((teacher, idx) => (
                        <Card key={idx} className="p-8 border-none shadow-soft hover:shadow-premium transition-all duration-500 group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity">
                                <span className="material-symbols-rounded text-7xl">account_circle</span>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-8">
                                <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                                    <span className="material-symbols-rounded text-3xl font-black italic">
                                        {(teacher.nombres || 'D').charAt(0)}
                                    </span>
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-black text-slate-900 uppercase tracking-tight truncate max-w-[160px]">{teacher.nombres}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rol: Docente de Aula</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                    <p className="text-lg font-black text-slate-900 leading-none">{teacher.executionRate}%</p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Cumplimiento</p>
                                </div>
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                    <p className="text-lg font-black text-slate-900 leading-none">{teacher.completedContents}</p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Avance Temas</p>
                                </div>
                            </div>

                            <Button 
                                variant="outline" 
                                onClick={() => exportTeacherPDF(teacher)}
                                isLoading={generating === (teacher.id || teacher.nombres)}
                                className="w-full h-12 rounded-xl border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center gap-3"
                            >
                                <span className="material-symbols-rounded text-sm">print</span>
                                Imprimir Reporte
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MiniStatCard({ label, value, icon, color }: any) {
    const colors = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        slate: "bg-slate-50 text-slate-600 border-slate-100"
    } as any;

    return (
        <Card className="p-6 border-none shadow-soft flex items-center gap-5">
            <div className={cn("size-12 rounded-xl flex items-center justify-center border", colors[color])}>
                <span className="material-symbols-rounded text-2xl">{icon}</span>
            </div>
            <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
            </div>
        </Card>
    );
}

