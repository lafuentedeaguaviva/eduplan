'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useDirectorController } from '@/hooks/useDirectorController';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function DirectorReportsPage() {
    const router = useRouter();
    const { analytics, staff, pdcs, loading } = useDirectorController();
    const [generating, setGenerating] = useState(false);

    const exportConsolidatedPDF = () => {
        setGenerating(true);
        try {
            const doc = new jsPDF();
            const now = new Date().toLocaleDateString();

            // Header
            doc.setFontSize(18);
            doc.text('REPORTE PEDAGÓGICO CONSOLIDADO', 105, 20, { align: 'center' });
            
            doc.setFontSize(10);
            doc.text(`Gestión: 2026 | Fecha de Emisión: ${now}`, 105, 30, { align: 'center' });

            // Institutional Section
            doc.setFontSize(12);
            doc.text('1. RESUMEN INSTITUCIONAL', 20, 45);
            doc.line(20, 47, 190, 47);

            const statData = [
                ['Total Contenidos Planificados', analytics?.totalContents || 0],
                ['Tasa de Planificación Global', `${analytics?.planningRate || 0}%`],
                ['Tasa de Ejecución Real', `${analytics?.executionRate || 0}%`],
                ['Contenidos Completados', analytics?.distribution?.completado || 0]
            ];

            (doc as any).autoTable({
                startY: 50,
                head: [['Métrica', 'Valor']],
                body: statData,
                theme: 'striped',
                headStyles: { fillStyle: [15, 23, 42] }
            });

            // Staff Performance Section
            doc.text('2. AUDITORÍA POR DOCENTE', 20, (doc as any).lastAutoTable.finalY + 15);
            
            const staffData = staff.map(t => [
                t.nombre,
                `${t.completedContents} / ${t.totalContents}`,
                `${t.executionRate}%`,
                t.executionRate > 70 ? 'Satisfactorio' : 'En Seguimiento'
            ]);

            (doc as any).autoTable({
                startY: (doc as any).lastAutoTable.finalY + 20,
                head: [['Docente', 'Contenidos', 'Ejecución', 'Estado']],
                body: staffData,
                theme: 'grid'
            });

            // Footer
            doc.setFontSize(8);
            doc.text('EduPlan Pro - Sistema de Gestión Curricular Inteligente', 105, 285, { align: 'center' });

            doc.save(`Reporte_Consolidado_UE_${now}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/director')} className="size-12 rounded-2xl bg-white shadow-soft border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all group">
                        <span className="material-symbols-rounded text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic">Reportes e Informes</h1>
                        <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Gestión de Gobierno Institucional</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* PDF Generator */}
                <Card className="lg:col-span-4 p-8 border-none shadow-premium bg-slate-900 text-white flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="size-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                            <span className="material-symbols-rounded text-emerald-500 text-4xl">picture_as_pdf</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black tracking-tight leading-none">Reporte Maestro</h3>
                            <p className="text-slate-400 text-sm font-medium">Genera un documento PDF consolidado con todas las métricas de planificación y ejecución de tu unidad educativa.</p>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-xs font-bold text-slate-300">
                                <span className="material-symbols-rounded text-emerald-500 text-sm">check_circle</span>
                                Resumen institucional de PDCs
                            </li>
                            <li className="flex items-center gap-3 text-xs font-bold text-slate-300">
                                <span className="material-symbols-rounded text-emerald-500 text-sm">check_circle</span>
                                Audit de contenidos por docente
                            </li>
                            <li className="flex items-center gap-3 text-xs font-bold text-slate-300">
                                <span className="material-symbols-rounded text-emerald-500 text-sm">check_circle</span>
                                Estadísticas de ejecución real
                            </li>
                        </ul>
                    </div>

                    <Button 
                        onClick={exportConsolidatedPDF} 
                        isLoading={generating}
                        className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black mt-10 shadow-xl shadow-emerald-500/20"
                    >
                        Exportar a PDF
                    </Button>
                </Card>

                {/* Report Preview / Stats */}
                <div className="lg:col-span-8 space-y-8">
                     <Card className="p-10 border-none shadow-soft bg-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <span className="material-symbols-rounded text-9xl">contract_edit</span>
                        </div>

                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-8 px-1">Vista Previa de Indicadores</h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-slate-900">{analytics?.planningRate || 0}%</p>
                                <p className="text-[10px] font-bold uppercase text-slate-400">Planificación</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-emerald-600">{analytics?.executionRate || 0}%</p>
                                <p className="text-[10px] font-bold uppercase text-slate-400">Ejecución</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-blue-600">{staff.length}</p>
                                <p className="text-[10px] font-bold uppercase text-slate-400">Docentes</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-slate-900">{pdcs.length}</p>
                                <p className="text-[10px] font-bold uppercase text-slate-400">PDCs Activos</p>
                            </div>
                        </div>

                        <div className="mt-12 bg-slate-50 rounded-3xl p-8 border border-slate-100 italic text-sm text-slate-500 leading-relaxed">
                            "Este reporte consolida el trabajo pedagógico realizado en la Unidad Educativa, permitiendo identificar brechas de aprendizaje y optimizar el seguimiento docente de forma centralizada."
                        </div>
                     </Card>

                     <Card className="p-8 border-none shadow-soft bg-emerald-50/30 flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                            <div className="size-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
                                <span className="material-symbols-rounded text-3xl">description</span>
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900">Informe Semanal Automático</h4>
                                <p className="text-xs text-slate-500 font-medium">Próximamente: Envío automático a distritales cada viernes.</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="opacity-50">Próximamente</Badge>
                     </Card>
                </div>
            </div>
        </div>
    );
}
