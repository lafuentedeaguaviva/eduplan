import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Save, X, Loader2 } from 'lucide-react';

export const COMPONENTS = [
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

export const COMPONENT_DETAILS: Record<string, any> = {
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
    }
};

interface DirectorEvaluationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    evaluations: Record<string, { level: number, status: 'aprobado' | 'observado' | null, comment: string, useCustomComment: boolean }>;
    setEvaluations: React.Dispatch<React.SetStateAction<Record<string, { level: number, status: 'aprobado' | 'observado' | null, comment: string, useCustomComment: boolean }>>>;
    isReadOnly: boolean;
    onSaveAction: () => void;
    onSaveProgress?: () => void;
    onExport?: () => void;
    isSaving: boolean;
    isSavingProgress?: boolean;
    stats: any;
}

export function DirectorEvaluationPanel({ isOpen, onClose, evaluations, setEvaluations, isReadOnly, onSaveAction, onSaveProgress, onExport, isSaving, isSavingProgress, stats }: DirectorEvaluationPanelProps) {
    const handleUpdateEvaluation = (compId: string, level: number) => {
        const status = level <= 2 ? 'observado' : 'aprobado';
        setEvaluations(prev => ({ ...prev, [compId]: { ...prev[compId], level, status } }));
    };

    const handleToggleCustom = (compId: string) => {
        setEvaluations(prev => ({ ...prev, [compId]: { ...prev[compId], useCustomComment: !prev[compId].useCustomComment } }));
    };

    const handleUpdateComment = (compId: string, comment: string) => {
        setEvaluations(prev => ({ ...prev, [compId]: { ...prev[compId], comment } }));
    };

    return (
        <>
            {/* Removed Overlay to allow interacting with the background document */}

            {/* Panel */}
            <div className={cn(
                "fixed inset-y-0 right-0 w-full md:w-[600px] bg-white border-l border-slate-200 shadow-2xl z-[100] transform transition-transform duration-500 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                            <span className="material-symbols-rounded font-black">fact_check</span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Formulario de Evaluación</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        {onExport && (
                            <button onClick={onExport} className="p-2 bg-white rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors border border-blue-200 shadow-sm flex items-center gap-2 px-3">
                                <span className="material-symbols-rounded text-[16px]">download</span>
                                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Descargar</span>
                            </button>
                        )}
                        <div className="px-4 py-1.5 bg-white rounded-full border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                            {Object.values(evaluations).filter((e:any) => e.level > 0).length} / {COMPONENTS.length}
                        </div>
                        <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 shadow-sm">
                            <X className="size-4" />
                        </button>
                    </div>
                </div>

                {/* Body / Evaluaciones */}
                <div className="flex-1 overflow-y-auto p-8 space-y-12 bg-white custom-scrollbar">
                    {COMPONENTS.map(comp => (
                        <div key={comp.id} className="space-y-6 pb-12 border-b border-slate-100 last:border-0">
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

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 bg-white shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span>Evaluados: {Object.values(evaluations).filter(e => e.level > 0).length} / {COMPONENTS.length}</span>
                            <span className={cn(
                                stats.isComplete ? (stats.observedCount === 0 ? "text-emerald-600" : "text-rose-600") : "text-slate-400"
                            )}>{stats.dictamen}</span>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={onSaveProgress}
                                disabled={isSavingProgress || isReadOnly}
                                className={cn(
                                    "flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                                    (isSavingProgress || isReadOnly) ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-95 bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-sm"
                                )}
                            >
                                {isSavingProgress ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
                                Guardar Progreso
                            </button>
                            <button 
                                onClick={onSaveAction}
                                disabled={isSaving || !stats.isComplete || isReadOnly}
                                className={cn(
                                    "flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                                    (isSaving || !stats.isComplete || isReadOnly) ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-95",
                                    stats.isComplete ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-slate-100 text-slate-400"
                                )}
                            >
                                {isSaving ? <Loader2 className="size-5 animate-spin" /> : <span className="material-symbols-rounded text-lg font-black">send</span>}
                                {isReadOnly ? 'Finalizada' : 'Enviar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
