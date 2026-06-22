'use client';

import React, { useEffect, useState, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PdcRevisionesService } from '@/services/pdc-revisiones.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { db } from '@/lib/database';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';

const COMPONENTS = [
    { id: 'aprendizaje', label: 'Objetivos de aprendizaje' },
    { id: 'contenidos', label: 'Contenidos' },
    { id: 'practica', label: 'Momento de Aprendizaje Práctica' },
    { id: 'teoria', label: 'Momento de Aprendizaje Teoría' },
    { id: 'produccion', label: 'Momento de Aprendizaje Producción' },
    { id: 'valoracion', label: 'Momento de Aprendizaje Valorar' },
    { id: 'criterio_ser', label: 'Criterio de Evaluación Ser' },
    { id: 'criterio_saber', label: 'Criterio de Evaluación Saber' },
    { id: 'criterio_hacer', label: 'Criterio de Evaluación Hacer' },
    { id: 'recursos', label: 'Recursos' },
    { id: 'fuentes', label: 'Fuentes' },
    { id: 'adaptaciones_gral', label: 'Adaptaciones generales' },
    { id: 'adaptaciones_esp', label: 'Adaptaciones especiales' },
    { id: 'presentacion', label: 'Presentación general' },
];

const COMPONENT_DETAILS: Record<string, any> = {
    aprendizaje: {
        title: "1. OBJETIVOS DE APRENDIZAJE",
        levels: [
            { level: 1, text: "Los objetivos de aprendizaje están ausentes o no guardan relación con el plan.", status: "❌ Observado" },
            { level: 2, text: "Los objetivos existen pero utilizan verbos no observables (saber, comprender, conocer).", status: "❌ Observado" },
            { level: 3, text: "Los objetivos son aceptables pero demasiado amplios o vagos para el tiempo declarado.", status: "✅ Aceptado (básico)" },
            { level: 4, text: "Los objetivos son claros pero el verbo podría ajustarse para mayor precisión.", status: "✅ Aceptado (bueno)" },
            { level: 5, text: "Los objetivos están bien formulados con verbos observables, específicos, medibles y alcanzables.", status: "✅ Aceptado (excelente)" }
        ]
    },
    contenidos: {
        title: "2. CONTENIDOS",
        levels: [
            { level: 1, text: "Los contenidos están ausentes o son completamente ajenos al área y nivel.", status: "❌ Observado" },
            { level: 2, text: "Los contenidos existen pero están desordenados, repetidos o sin secuencia lógica.", status: "❌ Observado" },
            { level: 3, text: "Los contenidos son pertinentes pero no hay progresión de menor a mayor complejidad.", status: "✅ Aceptado (básico)" },
            { level: 4, text: "Los contenidos están bien seleccionados pero la carga horaria (columna Per.) está incompleta.", status: "✅ Aceptado (bueno)" },
            { level: 5, text: "Los contenidos son pertinentes, están secuenciados por semana con progresión adecuada y carga horaria definida.", status: "✅ Aceptado (excelente)" }
        ]
    },
    practica: {
        title: "3. MOMENTO DE APRENDIZAJE PRÁCTICA",
        levels: [
            { level: 1, text: "El momento Práctica está ausente. No se parte de experiencia concreta alguna.", status: "❌ Observado" },
            { level: 2, text: "El momento Práctica existe pero es teórico o pasivo, sin acción del estudiante.", status: "❌ Observado" },
            { level: 3, text: "El momento Práctica es una actividad genérica no vinculada al contenido específico.", status: "✅ Aceptado (básico)" },
            { level: 4, text: "El momento Práctica está presente pero la actividad es poco desafiante o demasiado breve.", status: "✅ Aceptado (bueno)" },
            { level: 5, text: "El momento Práctica parte de una experiencia concreta, activa y pertinente que moviliza saberes previos.", status: "✅ Aceptado (excelente)" }
        ]
    },
    teoria: {
        title: "4. MOMENTO DE APRENDIZAJE TEORÍA",
        levels: [
            { level: 1, text: "El momento Teoría está ausente. No hay sistematización conceptual.", status: "❌ Observado" },
            { level: 2, text: "El momento Teoría es una exposición magistral sin participación ni diálogo con los estudiantes.", status: "❌ Observado" },
            { level: 3, text: "El momento Teoría existe pero los conceptos no se vinculan con la práctica realizada.", status: "✅ Aceptado (básico)" },
            { level: 4, text: "El momento Teoría es adecuado pero la profundidad es insuficiente para el nivel.", status: "✅ Aceptado (bueno)" },
            { level: 5, text: "El momento Teoría sistematiza la práctica, introduce conceptos clave con diálogo y ejemplos contextualizados.", status: "✅ Aceptado (excelente)" }
        ]
    },
    produccion: {
        title: "5. MOMENTO DE APRENDIZAJE PRODUCCIÓN",
        levels: [
            { level: 1, text: "El momento Producción está ausente. El estudiante no aplica ni crea nada.", status: "❌ Observado" },
            { level: 2, text: "El momento Producción es una repetición mecánica sin creatividad ni aplicación nueva.", status: "❌ Observado" },
            { level: 3, text: "El momento Producción existe pero el producto no evidencia la comprensión del contenido.", status: "✅ Aceptado (básico)" },
            { level: 4, text: "El momento Producción es pertinente pero la consigna es cerrada o poco innovadora.", status: "✅ Aceptado (bueno)" },
            { level: 5, text: "El momento Producción desafía al estudiante a crear, aplicar o transformar el conocimiento en un producto tangible y significativo.", status: "✅ Aceptado (excelente)" }
        ]
    },
    valoracion: {
        title: "6. MOMENTO DE APRENDIZAJE VALORAR",
        levels: [
            { level: 1, text: "El momento Valoración está ausente. No hay reflexión ética ni metacognitiva.", status: "❌ Observado" },
            { level: 2, text: "El momento Valoración es una mera calificación sin reflexión sobre el proceso.", status: "❌ Observado" },
            { level: 3, text: "El momento Valoración existe pero las preguntas son cerradas y superficiales.", status: "✅ Aceptado (básico)" },
            { level: 4, text: "El momento Valoración promueve reflexión pero sin vincularla a valores o compromisos concretos.", status: "✅ Aceptado (bueno)" },
            { level: 5, text: "El momento Valoración guía una reflexión ética profunda, conecta lo aprendido con la vida y genera compromisos personales y comunitarios.", status: "✅ Aceptado (excelente)" }
        ]
    },
    criterio_ser: {
        title: "7. CRITERIO DE EVALUACIÓN SER",
        levels: [
            { level: 1, text: "No se evidencian criterios de evaluación para la dimensión del Ser (actitudes, valores).", status: "❌ Observado" },
            { level: 2, text: "Los criterios del Ser son genéricos y no se vinculan con el contenido o el objetivo.", status: "❌ Observado" },
            { level: 3, text: "Criterios del Ser presentes pero sin instrumentos claros para su seguimiento.", status: "✅ Aceptado (básico)" },
            { level: 4, text: "Criterios del Ser adecuados y con instrumentos, pero podrían ser más específicos.", status: "✅ Aceptado (bueno)" },
            { level: 5, text: "Criterios del Ser perfectamente definidos, con instrumentos claros y vinculados a la formación integral.", status: "✅ Aceptado (excelente)" }
        ]
    },
    criterio_saber: {
        title: "8. CRITERIO DE EVALUACIÓN SABER",
        levels: [
            { level: 1, text: "No se evidencian criterios de evaluación para la dimensión del Saber (conocimientos).", status: "❌ Observado" },
            { level: 2, text: "Los criterios del Saber son memorísticos y no evalúan la comprensión profunda.", status: "❌ Observado" },
            { level: 3, text: "Criterios del Saber presentes pero se limitan a pruebas objetivas tradicionales.", status: "✅ Aceptado (básico)" },
            { level: 4, text: "Criterios del Saber adecuados, evalúan aplicación pero falta variedad instrumental.", status: "✅ Aceptado (bueno)" },
            { level: 5, text: "Criterios del Saber evalúan procesos cognitivos superiores con diversidad de instrumentos.", status: "✅ Aceptado (excelente)" }
        ]
    },
    criterio_hacer: {
        title: "9. CRITERIO DE EVALUACIÓN HACER",
        levels: [
            { level: 1, text: "No se evidencian criterios de evaluación para la dimensión del Hacer (habilidades).", status: "❌ Observado" },
            { level: 2, text: "Los criterios del Hacer no guardan relación con el producto o actividad propuesta.", status: "❌ Observado" },
            { level: 3, text: "Criterios del Hacer presentes pero no definen qué aspectos del producto se evalúan.", status: "✅ Aceptado (básico)" },
            { level: 4, text: "Criterios del Hacer adecuados pero faltan rúbricas o escalas de desempeño.", status: "✅ Aceptado (bueno)" },
            { level: 5, text: "Criterios del Hacer claros, medibles, con rúbricas detalladas y alineados al producto final.", status: "✅ Aceptado (excelente)" }
        ]
    },
    recursos: {
        title: "10. RECURSOS DIDÁCTICOS",
        levels: [
            { level: 1, text: "No se especifican recursos didácticos en el PDC.", status: "❌ Observado" },
            { level: 2, text: "Los recursos mencionados no son pertinentes al contenido o no están disponibles.", status: "❌ Observado" },
            { level: 3, text: "Los recursos son adecuados pero insuficientes o poco variados.", status: "✅ Aceptado (básico)" },
            { level: 4, text: "Los recursos son variados y pertinentes pero no consideran accesibilidad para estudiantes con NEE.", status: "✅ Aceptado (bueno)" },
            { level: 5, text: "Los recursos son variados, pertinentes, accesibles para todos y aprovechan materiales del contexto comunitario.", status: "✅ Aceptado (excelente)" }
        ]
    },
    fuentes: {
        title: "11. FUENTES DE INFORMACIÓN",
        levels: [
            { level: 1, text: "No se mencionan fuentes de información en el PDC.", status: "❌ Observado" },
            { level: 2, text: "Las fuentes están mencionadas pero sin citación completa (falta autor, año o editorial).", status: "❌ Observado" },
            { level: 3, text: "Las fuentes están citadas pero están desactualizadas (más de 5 años) o no son oficiales.", status: "✅ Aceptado (básico)" },
            { level: 4, text: "Las fuentes son actuales y oficiales pero no incluyen diversidad de formatos (libros, videos, normativas).", status: "✅ Aceptado (bueno)" },
            { level: 5, text: "Las fuentes están correctamente citadas, actualizadas, diversas e incluyen referencias del Ministerio de Educación de Bolivia.", status: "✅ Aceptado (excelente)" }
        ]
    },
    adaptaciones_gral: {
        title: "12. ADAPTACIONES CURRICULARES GENERALES",
        levels: [
            { level: 1, text: "No se incluyen adaptaciones curriculares generales.", status: "❌ Observado" },
            { level: 2, text: "Se mencionan adaptaciones pero de forma genérica sin ejemplos concretos.", status: "❌ Observado" },
            { level: 3, text: "Las adaptaciones son pertinentes pero solo consideran tiempos, no otros aspectos (materiales, agrupamientos).", status: "✅ Aceptado (básico)" },
            { level: 4, text: "Las adaptaciones son adecuadas pero no se vinculan explícitamente con los momentos metodológicos.", status: "✅ Aceptado (bueno)" },
            { level: 5, text: "Las adaptaciones generales son concretas, variadas (tiempos, materiales, agrupamientos) y pertinentes para la atención a la diversidad.", status: "✅ Aceptado (excelente)" }
        ]
    },
    adaptaciones_esp: {
        title: "13. ADAPTACIONES CURRICULARES ESPECIALES (NEE)",
        levels: [
            { level: 1, text: "No se incluyen adaptaciones especiales a pesar de existir estudiantes con NEE certificadas.", status: "❌ Observado" },
            { level: 2, text: "Las adaptaciones especiales son genéricas o copia textual de otro documento sin ajuste.", status: "❌ Observado" },
            { level: 3, text: "Las adaptaciones especiales incluyen corchetes [ ] sin completar con texto concreto.", status: "✅ Aceptado (básico)" },
            { level: 4, text: "Las adaptaciones especiales están escritas con texto concreto pero no consideran todos los tipos de NEE presentes en el aula.", status: "✅ Aceptado (bueno)" },
            { level: 5, text: "Las adaptaciones especiales son específicas, concretas, sin corchetes, y responden a las necesidades reales de los estudiantes del curso.", status: "✅ Aceptado (excelente)" }
        ]
    },
    presentacion: {
        title: "14. PRESENTACIÓN Y ORGANIZACIÓN GENERAL",
        levels: [
            { level: 1, text: "El documento es caótico, con múltiples repeticiones y sin orden identificable.", status: "❌ Observado" },
            { level: 2, text: "El documento tiene información ajena al área y repeticiones que dificultan la lectura.", status: "❌ Observado" },
            { level: 3, text: "El documento es legible pero presenta desórdenes menores o errores de formato.", status: "✅ Aceptado (básico)" },
            { level: 4, text: "El documento está ordenado pero faltan firmas o espacios institucionales.", status: "✅ Aceptado (bueno)" },
            { level: 5, text: "El documento está ordenado, sin repeticiones, incluye firmas del docente y espacio para visto bueno de dirección.", status: "✅ Aceptado (excelente)" }
        ]
    },
    holistico: {
        title: "1. OBJETIVO HOLÍSTICO",
        levels: [
            { level: 1, text: "El objetivo holístico está ausente o no tiene relación con el currículo.", status: "❌ Observado" },
            { level: 2, text: "El objetivo holístico existe pero carece de una de las cuatro dimensiones (Ser, Saber, Hacer, Decidir).", status: "❌ Observado" },
            { level: 3, text: "El objetivo holístico es aceptable pero carece de claridad o articulación entre dimensiones.", status: "✅ Aceptado (básico)" },
            { level: 4, text: "El objetivo holístico es claro y articula las dimensiones de forma adecuada.", status: "✅ Aceptado (bueno)" },
            { level: 5, text: "El objetivo holístico está perfectamente articulado, es pertinente y refleja la formación integral.", status: "✅ Aceptado (excelente)" }
        ]
    }
};

export default function DirectorReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();
    
    const [revision, setRevision] = useState<any>(null);
    const [snapshot, setSnapshot] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [evaluations, setEvaluations] = useState<Record<string, { level: number, status: 'aprobado' | 'observado' | null, comment: string, useCustomComment: boolean }>>(
        COMPONENTS.reduce((acc, comp) => ({ ...acc, [comp.id]: { level: 0, status: null, comment: "", useCustomComment: false } }), {})
    );

    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        loadRevision();
    }, [id]);

    const loadRevision = async () => {
        try {
            setLoading(true);
            const { data, error } = await db
                .from('pdc_revisiones')
                .select('*, perfiles!profesor_id(nombres, apellidos)')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            setRevision(data);
            setSnapshot(data.pdc_snapshot);
            
            if (data.observaciones && typeof data.observaciones === 'object' && data.observaciones.evaluations) {
                setEvaluations(data.observaciones.evaluations);
            }
        } catch (error) {
            console.error("Error loading revision:", error);
            toast.error("No se pudo cargar la revisión.");
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        let observedCount = 0;
        let acceptedCount = 0;
        let totalCount = 0;

        COMPONENTS.forEach(comp => {
            const evaluation = evaluations[comp.id];
            if (evaluation.level > 0) {
                totalCount++;
                if (evaluation.level <= 2) observedCount++;
                else acceptedCount++;
            }
        });

        let dictamen = "";
        let variant: 'excellent' | 'good' | 'regular' | 'fail' = 'fail';

        if (totalCount < COMPONENTS.length) dictamen = "Evaluación incompleta";
        else if (observedCount === 0) { dictamen = "Aprobado – Validado oficialmente sin observaciones críticas."; variant = 'excellent'; }
        else if (observedCount <= 3) { dictamen = "Observado – Requiere correcciones obligatorias menores."; variant = 'regular'; }
        else { dictamen = "Observado – Reestructurar el PDC (múltiples correcciones requeridas)."; variant = 'fail'; }

        return { observedCount, acceptedCount, dictamen, variant, isComplete: totalCount === COMPONENTS.length };
    }, [evaluations]);

    const isReadOnly = revision?.estado === 'revisado';

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty || !stats.isComplete) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty, stats.isComplete]);

    const handleUpdateEvaluation = (compId: string, level: number) => {
        // Auto-assign status based on level
        const status = level <= 2 ? 'observado' : 'aprobado';
        setEvaluations(prev => ({ ...prev, [compId]: { ...prev[compId], level, status } }));
        setIsDirty(true);
    };

    const handleUpdateStatus = (compId: string, status: 'aprobado' | 'observado') => {
        setEvaluations(prev => ({ ...prev, [compId]: { ...prev[compId], status } }));
    };

    const handleToggleCustom = (compId: string) => {
        setEvaluations(prev => ({ ...prev, [compId]: { ...prev[compId], useCustomComment: !prev[compId].useCustomComment } }));
    };

    const handleUpdateComment = (compId: string, comment: string) => {
        setEvaluations(prev => ({ ...prev, [compId]: { ...prev[compId], comment } }));
    };

    const handleReviewAction = async () => {
        if (!user) return;
        if (!stats.isComplete) {
            toast.error("Por favor completa la evaluación de todos los componentes antes de enviar al profesor.");
            return;
        }

        if (!confirm("¿Deseas finalizar la revisión y enviar los resultados al profesor? Una vez enviado, el documento se marcará como 'Revisado'.")) {
            return;
        }

        const finalStatus = stats.observedCount > 0 ? 'observado' : 'aprobado';
        
        try {
            setIsSaving(true);
            
            // Calculate average
            const totalScore = Object.values(evaluations).reduce((sum, e) => sum + e.level, 0);
            const average = totalScore / COMPONENTS.length;

            // Prepare final evaluations for the report/database
            const finalEvaluations = { ...evaluations };
            Object.keys(finalEvaluations).forEach(key => {
                const e = finalEvaluations[key];
                if (!e.useCustomComment && e.level > 0) {
                    const levelData = COMPONENT_DETAILS[key].levels.find((l:any) => l.level === e.level);
                    e.comment = levelData ? levelData.text : e.comment;
                }
            });

            const observacionesPayload = {
                evaluations: finalEvaluations,
                stats: {
                    observed: stats.observedCount,
                    accepted: stats.acceptedCount,
                    dictamen: stats.dictamen,
                    average: average.toFixed(2)
                },
                date: new Date().toISOString()
            };

            const cleanPayload = JSON.parse(JSON.stringify(observacionesPayload));
            await PdcRevisionesService.updateReviewStatus(id, user.id, finalStatus, cleanPayload);
            toast.success(`Revisión finalizada y enviada al profesor como ${finalStatus.toUpperCase()}.`);
            setIsDirty(false);
            router.push('/dashboard/director/revisions');
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Error al actualizar el estado.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportWord = async () => {
        const { exportEvaluationToWord } = await import('@/lib/exportService');
        
        // Prepare evaluations for export
        const exportEvals = JSON.parse(JSON.stringify(evaluations));
        Object.keys(exportEvals).forEach(key => {
            const e = exportEvals[key];
            if (!e.useCustomComment && e.level > 0) {
                const levelData = COMPONENT_DETAILS[key].levels.find((l:any) => l.level === e.level);
                e.comment = levelData ? levelData.text : e.comment;
            }
        });

        await exportEvaluationToWord(revision, exportEvals, stats);
    };

    if (loading) {
        return (
            <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-4 bg-white">
                <div className="size-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-emerald-600 font-black animate-pulse uppercase tracking-widest text-xs">Cargando Evaluación de Director...</p>
            </div>
        );
    }

    if (!revision || !snapshot) return null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-8 py-4 shrink-0 shadow-sm">
                <div className="max-w-[1800px] mx-auto flex justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.back()} className="size-12 rounded-2xl bg-white hover:bg-slate-50 flex items-center justify-center transition-all border border-slate-200 shadow-soft">
                            <span className="material-symbols-rounded text-slate-600 font-black">arrow_back</span>
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                                    Revisión Pedagógica: <span className="text-blue-600">{revision.materia}</span>
                                </h1>
                                <span className={cn(
                                    "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    revision.estado === 'aprobado' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    revision.estado === 'observado' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                    "bg-blue-50 text-blue-600 border-blue-100"
                                )}>
                                    {revision.estado}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                Maestro: {revision.perfiles?.nombres} {revision.perfiles?.apellidos} • Versión {revision.version}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleExportWord}
                            className="h-14 px-8 font-black text-xs uppercase tracking-widest rounded-2xl bg-white text-slate-700 border border-slate-200 shadow-soft hover:bg-slate-50 transition-all flex items-center gap-3"
                        >
                            <span className="material-symbols-rounded">description</span>
                            Exportar Informe Word
                        </button>
                        <button 
                            onClick={handleReviewAction}
                            disabled={isSaving || !stats.isComplete || isReadOnly}
                            className={cn(
                                "h-14 px-10 font-black text-xs uppercase tracking-widest rounded-2xl shadow-premium transition-all flex items-center gap-3",
                                (isSaving || !stats.isComplete || isReadOnly) ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-95",
                                stats.isComplete ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20" : "bg-slate-300 text-slate-500"
                            )}
                        >
                            {isSaving ? <span className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-rounded">{isReadOnly ? 'lock' : 'send'}</span>}
                            {isReadOnly ? 'Evaluación Finalizada' : 'Enviar al Profesor'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-y-auto p-12 bg-white relative custom-scrollbar shadow-inner">
                    <div className="max-w-5xl mx-auto space-y-20 text-slate-900">
                        {/* Header Documento */}
                        <div className="flex justify-between items-start border-b border-slate-100 pb-10">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                                    Plan de Desarrollo <br/><span className="text-blue-600">Curricular</span>
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Gestión Escolar {snapshot.gestion}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-right">
                                <InfoItem label="Distrito" value={snapshot.distritos} />
                                <InfoItem label="Unidad" value={snapshot.unidades} />
                                <InfoItem label="Nivel" value={snapshot.niveles} />
                                <InfoItem label="Grado" value={snapshot.grados} />
                            </div>
                        </div>

                        {/* 1. Objetivo Holístico */}
                        <section className="space-y-6">
                            <SectionTitle icon="psychology" label="1. Objetivo Holístico de Nivel" />
                            <div className="bg-slate-50 px-8 py-6 rounded-[1.5rem] border border-slate-100 italic text-slate-800 leading-relaxed text-sm font-semibold shadow-inner">
                                {snapshot.objetivo_holistico_nivel || "No definido"}
                            </div>
                        </section>

                        {/* 2. Desarrollo Curricular */}
                        <section className="space-y-10">
                            <SectionTitle icon="grid_view" label="2. Desarrollo Curricular" />
                            {(() => {
                                const isMultigrado = snapshot.areas_trabajo?.length > 1 && 
                                                   new Set(snapshot.areas_trabajo.map((a:any) => a.grado_nombre)).size > 1;

                                if (isMultigrado) {
                                    return <MultigradeSnapshotViewer snapshot={snapshot} />;
                                }

                                return (snapshot.areas_trabajo || []).map((area: any) => (
                                    <div key={area.id} className="space-y-6">
                                        <div className="bg-slate-900 px-8 py-4 rounded-2xl flex items-center justify-between shadow-xl">
                                            <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                                                <span className="text-[9px] text-slate-500 font-black uppercase">Área:</span> {area.nombre}
                                            </h4>
                                            <div className="text-[10px] font-black text-slate-400 uppercase">Carga: {area.periodo_semanal} hrs</div>
                                        </div>
                                        <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 shadow-lg bg-white">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase text-[8px] tracking-[0.2em]">
                                                        <th className="px-6 py-4 text-left w-[18%]">Misión / Objetivos</th>
                                                        <th className="px-6 py-4 text-left w-[15%]">Temas</th>
                                                        <th className="px-6 py-4 text-left w-[25%]">Metodología</th>
                                                        <th className="px-6 py-4 text-left w-[18%]">Recursos</th>
                                                        <th className="px-6 py-4 text-right w-[24%]">Resultados</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-slate-600">
                                                    {(area.semanas || []).map((semana: any, sIdx: number) => (
                                                        <tr key={semana.id} className="border-b border-slate-50 last:border-0">
                                                            {sIdx === 0 && (
                                                                <td rowSpan={area.semanas.length} className="px-6 py-8 align-top border-r border-slate-100 bg-slate-50/20 text-[10px] font-bold text-slate-800 italic leading-relaxed">
                                                                    {area.objetivos_aprendizaje_ia || area.objetivos_aprendizaje}
                                                                </td>
                                                            )}
                                                            <td className="px-6 py-8 align-top border-r border-slate-100">
                                                                <div className="text-[10px] font-black text-blue-600 mb-2">S{semana.semana}</div>
                                                                {semana.semana_contenido_hier?.map((root: any) => (
                                                                    <p key={root.id} className="text-[9px] font-black text-slate-900">• {root.titulo}</p>
                                                                ))}
                                                            </td>
                                                            <td className="px-6 py-8 align-top border-r border-slate-100 text-[10px] font-semibold text-slate-700 italic leading-relaxed whitespace-pre-wrap">{semana.momentos_ia || semana.momentos_original}</td>
                                                            <td className="px-6 py-8 align-top border-r border-slate-100 text-[10px] font-semibold text-slate-500 italic leading-relaxed whitespace-pre-wrap">{semana.recursos_fuentes_ia || semana.recursos_fuentes_original}</td>
                                                            {sIdx === 0 && (
                                                                <td rowSpan={area.semanas.length} className="px-6 py-8 align-top text-right text-[10px] font-black text-slate-800 leading-relaxed bg-slate-50/10">
                                                                    {area.criterios_evaluacion_ia || area.criterios_evaluacion}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </section>

                        {/* 3. Adaptaciones NEE */}
                        <section className="space-y-6">
                            <SectionTitle icon="accessibility_new" label="3. Adaptaciones Significativas (NEE)" />
                            {(snapshot.areas_trabajo || []).map((area: any) => {
                                const relWeeks = (area.semanas || []).filter((s:any) => s.adaptaciones_especiales_ia || s.adaptaciones_basicas_ia || s.adaptaciones_especiales_original || s.adaptaciones_basicas_original);
                                if (relWeeks.length === 0) return null;
                                return (
                                    <div key={area.id} className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-md mb-8">
                                        <div className="bg-emerald-600 px-6 py-3 text-white text-[10px] font-black uppercase text-center">Area: {area.nombre}</div>
                                        <table className="w-full text-[10px] border-collapse">
                                            <thead>
                                                <tr className="bg-emerald-50 text-emerald-800 font-black uppercase text-[8px] tracking-widest">
                                                    <th className="px-4 py-3 border border-emerald-100">Semana</th>
                                                    <th className="px-4 py-3 border border-emerald-100">NEE</th>
                                                    <th className="px-4 py-3 border border-emerald-100">Adaptación</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {relWeeks.map((s:any) => (
                                                    <tr key={s.id} className="border-b border-emerald-50">
                                                        <td className="px-4 py-6 border border-emerald-100 align-top font-black">S{s.semana}</td>
                                                        <td className="px-4 py-6 border border-emerald-100 align-top italic">{s.adaptaciones_especiales_ia || s.adaptaciones_especiales_original}</td>
                                                        <td className="px-4 py-6 border border-emerald-100 align-top">{s.adaptaciones_basicas_ia || s.adaptaciones_basicas_original}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })}
                        </section>

                        {/* Firmas */}
                        <div className="grid grid-cols-2 gap-24 pt-20 border-t border-slate-100 pb-32">
                            <div className="text-center space-y-4">
                                <div className="h-px w-48 bg-slate-200 mx-auto" />
                                <p className="text-[9px] font-black text-slate-400 uppercase">Director(a)</p>
                            </div>
                            <div className="text-center space-y-4">
                                <div className="h-px w-48 bg-slate-200 mx-auto" />
                                <p className="text-[9px] font-black text-slate-400 uppercase">Maestro(a)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Evaluation Form */}
                <div className="w-[600px] bg-white border-l border-slate-200 flex flex-col shadow-soft z-20">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm"><span className="material-symbols-rounded font-black">fact_check</span></div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Formulario de Evaluación</h3>
                        </div>
                        <div className="px-4 py-1.5 bg-white rounded-full border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">{Object.values(evaluations).filter(e => e.level > 0).length} / {COMPONENTS.length}</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar bg-white">
                        {COMPONENTS.map(comp => (
                            <div key={comp.id} className="space-y-6 pb-12 border-b border-slate-100 last:border-0 animate-fade-in-up">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                        <span className={cn("size-8 rounded-xl flex items-center justify-center text-sm font-black transition-all shadow-sm", 
                                            evaluations[comp.id].level > 0 
                                                ? (evaluations[comp.id].level <= 2 ? "bg-rose-600 text-white" : "bg-emerald-600 text-white") 
                                                : "bg-slate-100 text-slate-400"
                                        )}>
                                            {COMPONENTS.indexOf(comp) + 1}
                                        </span>
                                        {comp.label}
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative">
                                                <input 
                                                    type="checkbox" 
                                                    checked={evaluations[comp.id].useCustomComment}
                                                    onChange={() => handleToggleCustom(comp.id)}
                                                    disabled={isReadOnly}
                                                    className="sr-only" 
                                                />
                                                <div className={cn(
                                                    "w-10 h-5 rounded-full transition-all border",
                                                    evaluations[comp.id].useCustomComment ? "bg-blue-600 border-blue-600" : "bg-slate-100 border-slate-200",
                                                    isReadOnly && "opacity-50 cursor-not-allowed"
                                                )} />
                                                <div className={cn(
                                                    "absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                                                    evaluations[comp.id].useCustomComment ? "translate-x-5" : "translate-x-0"
                                                )} />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Personalizar</span>
                                        </label>
                                        {evaluations[comp.id].status && (
                                            <Badge variant="outline" className={cn(
                                                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                evaluations[comp.id].status === 'aprobado' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                            )}>
                                                {evaluations[comp.id].status === 'aprobado' ? '✅ Aceptado' : '❌ Observado'}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {evaluations[comp.id].useCustomComment ? (
                                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Calificación Manual (1-5)</p>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(lvl => (
                                                    <button 
                                                        key={lvl} 
                                                        disabled={isReadOnly}
                                                        onClick={() => handleUpdateEvaluation(comp.id, lvl)} 
                                                        className={cn(
                                                            "size-12 rounded-2xl border font-black text-sm transition-all flex items-center justify-center shadow-sm",
                                                            evaluations[comp.id].level === lvl 
                                                                ? (lvl <= 2 ? "bg-rose-600 border-rose-600 text-white" : "bg-emerald-600 border-emerald-600 text-white") 
                                                                : "bg-white border-slate-100 text-slate-400 hover:border-slate-300",
                                                            isReadOnly && "opacity-50 cursor-not-allowed"
                                                        )}
                                                    >
                                                        {lvl}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observación Escrita Propia</p>
                                            <textarea 
                                                value={evaluations[comp.id].comment} 
                                                onChange={(e) => handleUpdateComment(comp.id, e.target.value)} 
                                                disabled={isReadOnly}
                                                placeholder="Escribe aquí tu observación personalizada para este componente..." 
                                                className="w-full h-32 bg-white border-2 border-blue-100 rounded-3xl p-6 text-[11px] text-slate-700 focus:border-blue-500 transition-all resize-none shadow-soft outline-none font-medium leading-relaxed disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed" 
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 animate-in fade-in duration-300">
                                        {(COMPONENT_DETAILS[comp.id]?.levels || []).map((lvl:any) => (
                                            <button 
                                                key={lvl.level} 
                                                disabled={isReadOnly}
                                                onClick={() => handleUpdateEvaluation(comp.id, lvl.level)} 
                                                className={cn(
                                                    "w-full p-5 rounded-[1.5rem] border text-left transition-all flex items-start gap-5 group/btn", 
                                                    evaluations[comp.id].level === lvl.level 
                                                        ? (lvl.level <= 2 ? "bg-rose-50 border-rose-200 shadow-md ring-1 ring-rose-200" : "bg-emerald-50 border-emerald-200 shadow-md ring-1 ring-emerald-200") 
                                                        : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm",
                                                    isReadOnly && "opacity-50 cursor-not-allowed hover:bg-white"
                                                )}
                                            >
                                                <div className={cn(
                                                    "size-10 rounded-xl flex items-center justify-center text-xs font-black border transition-all shrink-0",
                                                    evaluations[comp.id].level === lvl.level 
                                                        ? (lvl.level <= 2 ? "bg-rose-600 border-rose-600 text-white" : "bg-emerald-600 border-emerald-600 text-white")
                                                        : "bg-white border-slate-200 text-slate-400 group-hover/btn:border-slate-400"
                                                )}>
                                                    {lvl.level}
                                                </div>
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <p className={cn(
                                                            "text-[9px] font-black uppercase tracking-[0.2em]", 
                                                            evaluations[comp.id].level === lvl.level 
                                                                ? (lvl.level <= 2 ? "text-rose-600" : "text-emerald-600") 
                                                                : "text-slate-400"
                                                        )}>
                                                            {lvl.status}
                                                        </p>
                                                    </div>
                                                    <p className={cn(
                                                        "text-[11px] font-semibold leading-relaxed", 
                                                        evaluations[comp.id].level === lvl.level ? "text-slate-900" : "text-slate-500"
                                                    )}>
                                                        {lvl.text}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MultigradeSnapshotViewer({ snapshot }: { snapshot: any }) {
    const allGrades = Array.from(new Set(snapshot.areas_trabajo.map((a: any) => a.grado_nombre))).sort() as string[];
    const allAreaNames = Array.from(new Set(snapshot.areas_trabajo.map((a: any) => a.nombre))).sort() as string[];
    const maxWeeks = Math.max(...snapshot.areas_trabajo.map((a: any) => a.semanas.length), 0);
    const weekNumbers = Array.from({ length: maxWeeks }, (_, i) => i + 1);

    return (
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 shadow-lg bg-white">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[8px] tracking-[0.2em]">
                        <th className="px-4 py-4 border-r border-slate-100 text-center" rowSpan={2}>Semana</th>
                        <th className="px-4 py-4 border-r border-slate-100 text-center" rowSpan={2}>Áreas</th>
                        <th className="px-4 py-3 border-b border-slate-100 text-center bg-blue-50/50 text-blue-800" colSpan={allGrades.length}>Integración por Años de Escolaridad</th>
                    </tr>
                    <tr className="bg-slate-50/30 text-slate-400 font-black uppercase text-[7px] tracking-[0.15em]">
                        {allGrades.map(grado => <th key={grado} className="px-4 py-3 border-r border-slate-100 text-center min-w-[150px]">{grado}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {weekNumbers.map((weekNum) => (
                        <React.Fragment key={weekNum}>
                            {allAreaNames.map((areaName, aIdx) => (
                                <tr key={`${weekNum}-${areaName}`} className="border-t border-slate-50">
                                    {aIdx === 0 && (
                                        <td rowSpan={allAreaNames.length} className="px-4 py-6 border-r border-slate-100 align-middle text-center font-black text-amber-600 bg-slate-50/50 text-[9px] uppercase [writing-mode:vertical-lr] rotate-180">Semana {weekNum}</td>
                                    )}
                                    <td className="px-4 py-4 border-r border-slate-100 align-middle font-black text-slate-800 text-[9px] bg-slate-50/10">{areaName}</td>
                                    {allGrades.map((grado) => {
                                        const at = snapshot.areas_trabajo.find((ma: any) => ma.nombre === areaName && ma.grado_nombre === grado);
                                        const semana = at?.semanas.find((s: any) => s.semana === weekNum);
                                        return (
                                            <td key={grado} className="px-4 py-4 border-r border-slate-100 align-top">
                                                {semana ? (
                                                    <div className="space-y-4">
                                                        <div className="space-y-1">
                                                            {semana.semana_contenido_hier?.map((root: any) => (
                                                                <div key={root.id}>
                                                                    <p className="font-black text-slate-800 text-[9px]">• {root.titulo}</p>
                                                                    {root.children?.map((child: any) => <p key={child.id} className="text-[8px] text-slate-500 pl-3">└ {child.titulo}</p>)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="pt-3 border-t border-slate-50 space-y-3">
                                                            <div className="space-y-1">
                                                                <p className="text-[8px] font-black text-indigo-400 uppercase">Metodología</p>
                                                                <p className="text-[9px] text-slate-700 italic leading-relaxed whitespace-pre-wrap">{semana.momentos_ia || semana.momentos_original}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[8px] font-black text-slate-400 uppercase">Recursos</p>
                                                                <p className="text-[9px] text-slate-500 italic leading-relaxed whitespace-pre-wrap">{semana.recursos_fuentes_ia || semana.recursos_fuentes_original}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : <div className="text-center opacity-10">—</div>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function SectionTitle({ icon, label }: { icon: string, label: string }) {
    return (
        <div className="flex items-center gap-4 mb-4">
            <div className="size-8 rounded-lg bg-white flex items-center justify-center border border-slate-200 shadow-sm"><span className="material-symbols-rounded text-lg text-blue-600">{icon}</span></div>
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</h3>
        </div>
    );
}

function InfoItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase">{label}</p>
            <p className="text-xs font-black text-slate-800">{value || '-'}</p>
        </div>
    );
}
