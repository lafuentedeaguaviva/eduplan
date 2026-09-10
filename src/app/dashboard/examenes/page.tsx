'use client';

import { useEffect, useState, useCallback } from 'react';
import { AuthService } from '@/services/auth.service';
import { examenService, ExamenGenerado } from '@/services/examen.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Atoms';
import { Feedback } from '@/components/ui/feedback';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { FileText, CalendarDays, Sparkles } from 'lucide-react';

export default function ExamenesDashboardPage() {
    const [examenes, setExamenes] = useState<ExamenGenerado[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await AuthService.getSession();
            const userId = data?.session?.user?.id;
            
            if (!userId) {
                setError('No se pudo encontrar la sesión del usuario.');
                return;
            }

            const dataExamenes = await examenService.getExamenesByDocente(userId);
            setExamenes(dataExamenes || []);
        } catch (err: any) {
            console.error('Error loading Examenes:', err);
            const msg = err.message || err.details || 'Hubo un problema al cargar tus exámenes.';
            setError(msg);
            toast.error("Error de carga", { description: msg });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (isLoading) return <ExamenSkeletonList />;

    if (error) return (
        <Feedback
            title="Error al cargar"
            description={error}
            icon="error"
            onRetry={loadData}
        />
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto py-8">
            {/* ─── HEADER ─── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Evaluación</p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Mis Exámenes</h1>
                        {!isLoading && (
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                                {examenes.length} {examenes.length === 1 ? 'Examen' : 'Exámenes'}
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 font-medium text-sm mt-1">Consulta y genera exámenes gamificados basados en tus PDCs.</p>
                </div>
                <Link href="/dashboard/examenes/new" className="shrink-0">
                    <Button className="h-12 px-8 rounded-2xl shadow-glow-indigo font-black gap-2 hover:scale-105 transition-all duration-300 bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Sparkles className="w-5 h-5" />
                        Nuevo
                    </Button>
                </Link>
            </div>

            {/* ─── CONTENT ─── */}
            {examenes.length === 0 ? (
                <div className="py-24 text-center rounded-[3rem] bg-white border-2 border-dashed border-slate-200 shadow-soft">
                    <div className="size-20 bg-indigo-50 rounded-[2rem] shadow-soft flex items-center justify-center mx-auto mb-6 text-indigo-300">
                        <FileText className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-700 mb-2 tracking-tight">Aún no tienes Exámenes generados</h3>
                    <p className="text-slate-400 font-medium text-sm mb-8 max-w-xs mx-auto leading-relaxed px-10">
                        Crea evaluaciones gamificadas (Saber, Hacer, Ser) a partir de tus planes de desarrollo curricular.
                    </p>
                    <Link href="/dashboard/examenes/new">
                        <Button className="px-10 h-12 rounded-2xl font-black gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-glow-indigo">
                            <Sparkles className="w-5 h-5" />
                            Nuevo Examen
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-12">
                    {Object.entries(
                        examenes.reduce((acc, examen) => {
                            const materia = examen.materia_nombre || 'Sin Materia';
                            const tema = examen.pdcs?.nombre_pdc || 'PDC Sin Nombre';
                            if (!acc[materia]) acc[materia] = {};
                            if (!acc[materia][tema]) acc[materia][tema] = [];
                            acc[materia][tema].push(examen);
                            return acc;
                        }, {} as Record<string, Record<string, ExamenGenerado[]>>)
                    ).map(([materia, temas]) => (
                        <div key={materia} className="space-y-6">
                            <h2 className="text-2xl font-black text-slate-800 border-b border-slate-200 pb-2">{materia}</h2>
                            <div className="space-y-8 pl-4 border-l-2 border-indigo-100 ml-2">
                                {Object.entries(temas).map(([tema, examenesDelTema]) => (
                                    <div key={tema} className="space-y-4 relative">
                                        <div className="absolute -left-[1.35rem] top-2 w-4 h-4 bg-white border-4 border-indigo-200 rounded-full"></div>
                                        <h3 className="text-xl font-bold text-slate-700 pl-4">
                                            {tema}
                                        </h3>
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pl-4">
                                            {examenesDelTema.map(examen => (
                                                <Card key={examen.id} className="p-6 relative overflow-hidden group hover:border-indigo-200 transition-colors flex flex-col justify-between min-h-[220px]">
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                                                                <FileText className="w-6 h-6" />
                                                            </div>
                                                            {examen.narrativa_gamificada && examen.narrativa_gamificada !== 'Ninguna' && (
                                                                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100 shadow-sm">
                                                                    {examen.narrativa_gamificada}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-tight">
                                                                {examen.titulo || 'Examen sin título'}
                                                            </h3>
                                                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
                                                                <CalendarDays className="w-3.5 h-3.5" />
                                                                {examen.created_at ? format(new Date(examen.created_at), "d 'de' MMMM, yyyy", { locale: es }) : 'Fecha desconocida'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                                                        <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Generado con IA</span>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            className="rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 font-bold transition-all shadow-sm"
                                                        >
                                                            Ver Detalles
                                                        </Button>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ExamenSkeletonList() {
    return (
        <div className="space-y-8 animate-pulse max-w-7xl mx-auto py-8">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-8 w-48 rounded-xl" />
                    <Skeleton className="h-3 w-72" />
                </div>
                <Skeleton className="h-12 w-48 rounded-2xl" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-[220px] w-full rounded-3xl" />
                ))}
            </div>
        </div>
    );
}
