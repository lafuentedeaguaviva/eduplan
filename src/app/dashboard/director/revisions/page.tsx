'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PdcRevisionesService } from '@/services/pdc-revisiones.service';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { exportEvaluationToWord, exportConsolidatedRevisionsToWord, ORDERED_COMPONENTS, getObservationText } from '@/lib/exportService';
import { db } from '@/lib/database';
import { toast } from 'sonner';
import { useDirectorController } from '@/hooks/useDirectorController';
import { RevisionFormEditor } from '@/components/pdcs/viewer/RevisionFormEditor';

export default function DirectorRevisionsPage() {
    const { user } = useAuth();
    const { inbox: revisions, staff, revisionStats, loading, refresh } = useDirectorController();
    const [filter, setFilter] = useState<'todos' | 'enviado' | 'revisado' | 'consolidado' | 'estadisticas'>('todos');
    const [generating, setGenerating] = useState<string | null>(null);
    const [editingRevision, setEditingRevision] = useState<any | null>(null);

    // Estadísticas
    const stats = {
        total: revisionStats?.total || 0,
        pendientes: revisionStats?.enviados || 0,
        revisados: revisionStats?.revisados || 0,
    };

    const filteredRevisions = filter === 'todos'
        ? revisions
        : filter === 'revisado'
            ? revisions.filter((r: any) => ['revisado', 'observado'].includes(r.estado))
            : filter === 'consolidado'
                ? revisions.filter((r: any) => r.estado === 'aprobado')
                : revisions.filter((r: any) => r.estado === filter);

    const exportTeacherPDF = async (teacher: any) => {
        setGenerating(teacher.id || teacher.nombre);
        try {
            const jsPDF = (await import('jspdf')).default;
            const autoTable = (await import('jspdf-autotable')).default;
            const doc = new jsPDF();
            const now = new Date().toLocaleDateString();

            // Header Professional
            doc.setFillColor(30, 41, 59);
            doc.rect(0, 0, 210, 50, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.text('INFORME DE CUMPLIMIENTO DOCENTE', 105, 20, { align: 'center' });
            doc.setFontSize(14);
            doc.text(teacher.nombre, 105, 32, { align: 'center' });
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

            (doc as any).autoTable({
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
            doc.text(`${user?.user_metadata?.nombres ? `${user.user_metadata.nombres} ${user.user_metadata.apellidos || ''}` : ''}`, 55, finalY + 65);
            doc.text('Director', 55, finalY + 70);

            doc.text('__________________________', 120, finalY + 60);
            doc.text(`${teacher.nombre || ''}`, 135, finalY + 65);
            doc.text('Profesor', 135, finalY + 70);

            doc.save(`Reporte_${teacher.nombre.replace(' ', '_')}.pdf`);
        } finally {
            setGenerating(null);
        }
    };

    const handleExportWord = async (rev: any) => {
        try {
            if (rev.observaciones && rev.observaciones.evaluations && rev.observaciones.stats) {
                toast.success("Generando informe de revisión...");
                const directorName = user?.user_metadata?.nombres ? `${user.user_metadata.nombres} ${user.user_metadata.apellidos || ''}`.trim() : "";
                await exportEvaluationToWord(rev, rev.observaciones.evaluations, rev.observaciones.stats, directorName);
            } else {
                toast.error("Datos de evaluación incompletos para exportar.");
            }
        } catch (error) {
            console.error("Error exporting evaluation to word:", error);
            toast.error("Hubo un error al generar el informe de revisión.");
        }
    };

    const handleExportConsolidated = async () => {
        try {
            if (revisions.length === 0) {
                toast.error("No hay informes para consolidar.");
                return;
            }
            toast.success("Generando consolidado general de " + revisions.length + " informes...");
            const directorName = user?.user_metadata?.nombres ? `${user.user_metadata.nombres} ${user.user_metadata.apellidos || ''}`.trim() : "";
            await exportConsolidatedRevisionsToWord("General", revisions, directorName);
        } catch (error) {
            console.error("Error exporting consolidated:", error);
            toast.error("Hubo un error al generar el consolidado.");
        }
    };

    const handleExportConsolidatedPDF = async () => {
        try {
            if (revisions.length === 0) {
                toast.error("No hay informes para consolidar.");
                return;
            }
            toast.success("Generando consolidado general en PDF...");
            setGenerating("consolidado_pdf");
            
            const jsPDF = (await import('jspdf')).default;
            const autoTable = (await import('jspdf-autotable')).default;
            
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.width;
            
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text("RESUMEN DE INFORMES - REVISIÓN PEDAGÓGICA", pageWidth/2, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total de Informes Procesados: ${revisions.length}`, 14, 35);
            
            const aprobados = revisions.filter(r => r.estado === 'aprobado').length;
            const observados = revisions.filter(r => r.estado === 'observado' || r.estado === 'revisado').length;
            const enviados = revisions.filter(r => r.estado === 'enviado').length;

            (doc as any).autoTable({
                startY: 45,
                head: [['Métrica', 'Cantidad']],
                body: [
                    ['Aprobados (Sin observaciones)', aprobados],
                    ['Observados / Revisados', observados],
                    ['Pendientes de Revisión', enviados],
                ],
                theme: 'grid',
                headStyles: { fillColor: [16, 185, 129], textColor: 255 }, // Emerald 500
            });
            
            // For each revision, add a page with details
            revisions.forEach((rev, idx) => {
                doc.addPage();
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(`INFORME DE REVISIÓN: ${rev.materia}`, pageWidth/2, 20, { align: 'center' });
                
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                const docenteNombre = rev.pdc_snapshot?.docente || (rev.perfiles?.nombres ? `${rev.perfiles.nombres} ${rev.perfiles.apellidos}` : "");
                doc.text(`Docente: ${docenteNombre}`, pageWidth/2, 30, { align: 'center' });
                
                (doc as any).autoTable({
                    startY: 40,
                    body: [
                        ['Estado', rev.estado.toUpperCase()],
                        ['Promedio', rev.observaciones?.stats?.average || "N/A"]
                    ],
                    theme: 'plain',
                    styles: { cellPadding: 2, fontSize: 10 }
                });

                let finalY = (doc as any).lastAutoTable.finalY + 10;
                
                doc.setFont('helvetica', 'bold');
                doc.text("Observaciones Generales:", 14, finalY);
                doc.setFont('helvetica', 'normal');
                
                const splitText = doc.splitTextToSize(rev.observaciones?.stats?.dictamen || "Sin dictamen registrado.", pageWidth - 28);
                doc.text(splitText, 14, finalY + 10);
                
                finalY = finalY + 10 + (splitText.length * 5) + 15;
                
                // Detailed component table
                const evaluations = rev.observaciones?.evaluations || {};
                const componentBody = ORDERED_COMPONENTS.map((comp, index) => {
                    const evalData = evaluations[comp.id];
                    if (!evalData) return null;
                    const label = `${index + 1}. ${comp.label}`;
                    const observationText = getObservationText(comp.id, evalData);
                    return [label, evalData.level?.toString() || '0', observationText];
                }).filter(Boolean);

                const extraKeys = Object.keys(evaluations).filter(k => !ORDERED_COMPONENTS.some(c => c.id === k));
                let currentIndex = ORDERED_COMPONENTS.length + 1;
                extraKeys.forEach(id => {
                    const evalData = evaluations[id];
                    const label = `${currentIndex}. ${id.charAt(0).toUpperCase() + id.slice(1).replace('_', ' ')}`;
                    const observationText = getObservationText(id, evalData);
                    componentBody.push([label, evalData.level?.toString() || '0', observationText]);
                    currentIndex++;
                });

                if (componentBody.length > 0) {
                    (doc as any).autoTable({
                        startY: finalY,
                        head: [['Componente', 'Puntaje', 'Observaciones']],
                        body: componentBody as string[][],
                        theme: 'grid',
                        headStyles: { fillColor: [245, 245, 245], textColor: 0 },
                        styles: { fontSize: 9, cellPadding: 3 },
                        columnStyles: {
                            0: { cellWidth: 50 },
                            1: { cellWidth: 20, halign: 'center' },
                            2: { cellWidth: 'auto' }
                        }
                    });
                }
            });
            
            // Final Signature Block on the same page if possible
            let signatureY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 40 : 250;
            if (signatureY > 270) {
                doc.addPage();
                signatureY = 40;
            }

            doc.setFontSize(11);
            const directorName = user?.user_metadata?.nombres ? `${user.user_metadata.nombres} ${user.user_metadata.apellidos || ''}`.trim() : "";
            doc.text('__________________________', pageWidth / 2, signatureY, { align: 'center' });
            doc.text(`${directorName}`, pageWidth / 2, signatureY + 5, { align: 'center' });
            doc.text('Director', pageWidth / 2, signatureY + 10, { align: 'center' });
            
            doc.save(`Consolidado_General_${new Date().getTime()}.pdf`);
        } catch (error) {
            console.error("Error exporting consolidated PDF:", error);
            toast.error("Hubo un error al generar el PDF.");
        } finally {
            setGenerating(null);
        }
    };

    // Calculate stats for the statistics view
    const calculateStats = () => {
        const revisados = revisions.filter(r => r.estado === 'revisado');
        const approvedCount = revisados.filter(r => r.observaciones?.stats?.dictamen?.includes("Aprobado")).length;
        const observedCount = revisados.length - approvedCount;
        const passRate = revisados.length > 0 ? Math.round((approvedCount / revisados.length) * 100) : 0;

        let avgScore = 0;
        if (revisados.length > 0) {
            const totalScore = revisados.reduce((sum, r) => sum + parseFloat(r.observaciones?.stats?.average || '0'), 0);
            avgScore = totalScore / revisados.length;
        }

        return { approvedCount, observedCount, passRate, avgScore: avgScore.toFixed(2), totalEvaluated: revisados.length };
    };

    const globalStats = calculateStats();

    if (loading) {
        return (
            <div className="min-h-screen p-8 flex items-center justify-center bg-white">
                <div className="relative">
                    <div className="size-20 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 size-20 border-4 border-transparent border-b-emerald-500/30 rounded-full animate-[spin_2s_linear_infinite]" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 space-y-12">
            {/* Header & Stats Grid */}
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Centro de Control Pedagógico</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[0.9]">
                            Panel de <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-700">Supervisión</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg max-w-xl">
                            Bandeja de entrada inteligente para la revisión, retroalimentación y validación de planificaciones institucionales.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-soft">
                        <button
                            onClick={handleExportConsolidatedPDF}
                            className="hidden md:flex px-6 py-4 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all shadow-md active:scale-95 items-center gap-2"
                        >
                            <span className="material-symbols-rounded text-lg">picture_as_pdf</span>
                            <span>Consolidado (PDF)</span>
                        </button>
                        <button
                            onClick={handleExportConsolidated}
                            className="hidden md:flex px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all shadow-md active:scale-95 items-center gap-2"
                        >
                            <span className="material-symbols-rounded text-lg">download</span>
                            <span>Consolidado (Word)</span>
                        </button>
                        <button
                            onClick={refresh}
                            className="size-14 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center group border border-slate-100"
                        >
                            <span className="material-symbols-rounded group-hover:rotate-180 transition-transform duration-700">refresh</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard label="Total Recibidos" value={stats.total} color="blue" icon="inbox" onClick={() => setFilter('todos')} active={filter === 'todos'} />
                    <StatCard label="Faltan Revisar" value={stats.pendientes} color="cyan" icon="pending" pulse={stats.pendientes > 0} onClick={() => setFilter('enviado')} active={filter === 'enviado'} />
                    <StatCard label="Enviados al Profesor" value={stats.revisados} color="emerald" icon="verified" onClick={() => setFilter('revisado')} active={filter === 'revisado'} />
                </div>
            </div>

            {/* Canvas / Tab System */}
            <div className="relative group/canvas">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10 rounded-[3rem] blur-2xl opacity-50 group-hover/canvas:opacity-100 transition duration-1000"></div>

                <div className="relative bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-premium">
                    <div className="px-10 py-8 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-transparent flex flex-col lg:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-teal-600 p-[1px] shadow-xl shadow-emerald-500/10">
                                <div className="w-full h-full rounded-[1.4rem] bg-white flex items-center justify-center">
                                    <span className="material-symbols-rounded text-emerald-500 text-2xl">folder_shared</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider leading-none">
                                    Gestión de Envíos
                                </h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Historial de validación curricular</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center bg-slate-50 p-2 rounded-[1.8rem] border border-slate-200 gap-1 shadow-inner">
                            <TabButton active={filter === 'todos'} onClick={() => setFilter('todos')} label="Todos" count={stats.total} />
                            <TabButton active={filter === 'enviado'} onClick={() => setFilter('enviado')} label="Faltan Revisar" count={stats.pendientes} color="cyan" />
                            <TabButton active={filter === 'revisado'} onClick={() => setFilter('revisado')} label="Enviados al Profesor" count={stats.revisados} color="emerald" />
                            <TabButton active={filter === 'consolidado'} onClick={() => setFilter('consolidado')} label="Consolidado" count={stats.total > 0 ? revisions.filter(r => r.estado === 'aprobado').length : 0} color="blue" />
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[500px]">
                        {editingRevision ? (
                            <div className="p-8">
                                <RevisionFormEditor 
                                    revision={editingRevision} 
                                    onBack={() => setEditingRevision(null)}
                                    onSaveSuccess={() => {
                                        setEditingRevision(null);
                                        refresh();
                                    }}
                                    onProgressSaved={() => refresh()}
                                    isDirectorView={true}
                                />
                            </div>
                        ) : (
                            <>
                                {filteredRevisions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in zoom-in-95 duration-700">
                                <div className="size-28 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
                                    <span className="material-symbols-rounded text-6xl text-slate-300">
                                        {filter === 'enviado' ? 'auto_awesome' : 'inventory_2'}
                                    </span>
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-3">
                                    {filter === 'enviado' ? '¡Bandeja Despejada!' : 'Sin registros'}
                                </h4>
                                <p className="text-slate-500 font-bold text-lg max-w-sm">
                                    {filter === 'enviado' ? 'No hay planificaciones esperando revisión en este momento.' : 'Aún no se han registrado envíos en esta categoría.'}
                                </p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Profesor Responsable</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Detalle Curricular</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Contexto</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Estado</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Fecha</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredRevisions.map((rev, idx) => (
                                        <tr key={rev.id} className="hover:bg-slate-50/50 transition-all group/row animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="size-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-400 group-hover/row:border-emerald-500/50 transition-all duration-500 overflow-hidden shadow-soft">
                                                            {rev.perfiles?.foto_url ? (
                                                                <img src={rev.perfiles.foto_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                rev.perfiles?.nombres?.[0] || 'P'
                                                            )}
                                                            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/row:opacity-100 transition-opacity duration-500" />
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 size-4 rounded-full bg-white p-0.5 border border-slate-200">
                                                            <div className="w-full h-full rounded-full bg-emerald-500" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 group-hover/row:text-emerald-600 transition-colors">{rev.perfiles?.nombres} {rev.perfiles?.apellidos}</p>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Personal Docente</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover/row:translate-x-1 transition-transform">{rev.materia}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-tighter">VER. {rev.version}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium italic">PDC Institucional</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-slate-600">{rev.grado}</p>
                                                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{rev.nivel}</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                {getStatusBadge(rev.estado, rev.pdc_estado)}
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-600">{new Date(rev.updated_at).toLocaleDateString()}</span>
                                                    <span className="text-[9px] text-slate-400 font-medium">{new Date(rev.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                {['revisado', 'aprobado', 'observado'].includes(rev.estado) ? (
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            onClick={() => setEditingRevision(rev)}
                                                            className="inline-flex items-center justify-center size-12 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all shadow-soft border border-slate-200 hover:-translate-y-1 active:scale-95"
                                                            title="Ver PDC Evaluado"
                                                        >
                                                            <span className="material-symbols-rounded">visibility</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleExportWord(rev)}
                                                            className="inline-flex items-center gap-3 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-95 group/btn"
                                                        >
                                                            <span className="text-lg">📄</span>
                                                            <span>IMPRIMIR WORD INFORME</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={() => setEditingRevision(rev)}
                                                            className="inline-flex items-center gap-3 px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-soft border border-slate-200 hover:-translate-y-1 active:scale-95 group/btn"
                                                        >
                                                            <span>AUDITAR PDC</span>
                                                            <span className="material-symbols-rounded text-sm group-hover/btn:translate-x-1 transition-transform text-emerald-600">arrow_forward_ios</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color, icon, pulse, onClick, active }: any) {
    const colorConfigs = {
        blue: { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", glow: "shadow-blue-500/10" },
        cyan: { text: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100", glow: "shadow-cyan-500/10" },
        amber: { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", glow: "shadow-amber-500/10" },
        emerald: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", glow: "shadow-emerald-500/10" },
    } as any;

    const config = colorConfigs[color];

    return (
        <button
            onClick={onClick}
            className={cn(
                "relative group/stat text-left rounded-[2.5rem] p-8 transition-all duration-700 overflow-hidden",
                active
                    ? "bg-white border-white shadow-premium translate-y-[-4px]"
                    : "bg-white/40 border border-slate-200 hover:border-slate-300 hover:bg-white"
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />

            <div className={cn(
                "relative z-10 size-14 rounded-[1.25rem] flex items-center justify-center mb-6 transition-all duration-700 group-hover/stat:scale-110 border",
                config.bg, config.text, config.border, active && config.glow
            )}>
                <span className={cn("material-symbols-rounded text-3xl", pulse && "animate-pulse")}>{icon}</span>
            </div>

            <div className="relative z-10">
                <p className={cn("text-5xl font-black tracking-tighter leading-none transition-all", active ? "text-slate-900" : "text-slate-400 group-hover/stat:text-slate-900")}>{value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-3 group-hover/stat:text-slate-500 transition-colors">{label}</p>
            </div>

            {active && (
                <div className={cn("absolute bottom-0 left-0 right-0 h-1.5", config.text.replace('text-', 'bg-'))} />
            )}
        </button>
    );
}

function TabButton({ active, onClick, label, count, color }: any) {
    const activeColors = {
        cyan: "bg-cyan-600 shadow-cyan-600/20",
        amber: "bg-amber-600 shadow-amber-600/20",
        emerald: "bg-emerald-600 shadow-emerald-600/20",
        blue: "bg-blue-600 shadow-blue-600/20",
    } as any;

    return (
        <button
            onClick={onClick}
            className={cn(
                "relative px-8 py-3.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3",
                active
                    ? cn("text-white scale-105 shadow-xl", activeColors[color] || "bg-slate-900 shadow-slate-900/10")
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
            )}
        >
            {label}
            {count > 0 && (
                <span className={cn(
                    "px-2.5 py-1 rounded-md text-[9px] font-black transition-all",
                    active ? "bg-black/20 text-white" : "bg-slate-200 text-slate-500"
                )}>
                    {count}
                </span>
            )}
        </button>
    );
}

const getStatusBadge = (estado: string, pdcEstado?: string) => {
    if (pdcEstado === 'Finalizado') {
        return (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100 shadow-sm">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Finalizado
            </span>
        );
    }

    switch (estado) {
        case 'enviado':
            return (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 text-cyan-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-cyan-100 shadow-sm">
                    <span className="size-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    En Auditoría
                </span>
            );
        case 'observado':
            return (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-100 shadow-sm">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    Acción Requerida
                </span>
            );
        case 'aprobado':
            return (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100 shadow-sm">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Validado Oficial
                </span>
            );
        case 'revisado':
            return (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100 shadow-sm">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Enviado al Profesor
                </span>
            );
        default:
            return null;
    }
};
