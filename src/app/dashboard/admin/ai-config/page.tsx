'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAdminController } from '@/hooks/useAdminController';
import { AdminService } from '@/services/admin.service';
import { toast } from 'sonner';

interface AIConfig {
    context_fields: {
        nivel: boolean;
        grado: boolean;
        area: boolean;
        temas: boolean;
        docente: boolean;
    };
    prompts: {
        strategic_objective: string;
        criteria_batch: string;
        weekly_batch: string;
        content_generator: string;
        exam_generator: string;
    };
}

const DEFAULT_CONFIG: AIConfig = {
    context_fields: {
        nivel: true,
        grado: true,
        area: true,
        temas: true,
        docente: false
    },
    prompts: {
        strategic_objective: `Tu tarea es refinar una lista de objetivos de aprendizaje de un Plan de Desarrollo Curricular, basándote en la descripción enviada y el tono seleccionado.

**Instrucciones adicionales para la redacción (REGLA ESTRICTA):**
- El verbo principal DEBE estar redactado SIEMPRE en modo indicativo, tercera persona del singular (por ejemplo: explica, categoriza, conoce, comprende).
- ESTÁ TOTALMENTE PROHIBIDO usar verbos en infinitivo (NO uses explicar, NO uses categorizar).
- Debe redactarse de manera clara, precisa y respondiendo a los contenidos a desarrollar.
- Debe expresar el desempeño académico que se espera que el estudiante logre con el avance de los contenidos planteados.
- La redacción de CADA objetivo (en descripcion_ia) DEBE comenzar SIEMPRE con un guion y un espacio ("- ") a modo de viñeta.
- La primera letra del objetivo (inmediatamente después del guion y el espacio) DEBE estar siempre en MAYÚSCULA.

**INSTRUCCIÓN CRÍTICA — FORMATO DE RESPUESTA:**
Responde ÚNICAMENTE con un array JSON válido. No uses bloques \`\`\`json ni incluyas texto fuera del JSON.
El JSON debe ser un array de objetos, donde cada objeto corresponde a un objetivo de la lista original.
Cada objeto DEBE incluir el "id" original del objetivo y la clave "descripcion_ia" con el texto refinado.
Ejemplo de formato:
[
  {"id": 1, "descripcion_ia": "- explica las nociones fundamentales..."},
  {"id": 2, "descripcion_ia": "- categoriza los números naturales..."}
]

**Tono:** [TONO_SELECCIONADO]
**Profundidad de corrección seleccionada:** [CORRECCION_PROFUNDIDAD]
**Reglas según profundidad:**
- Si es "Solo errores de redaccion" o "Solo correcciones": Actúa ÚNICAMENTE como un corrector ortotipográfico. NO agregues ideas nuevas ni elimines información. NO reestructures los párrafos ni cambies el significado original. Limítate a corregir ortografía, gramática y puntuación (los campos vacíos déjalos vacíos, excepto adaptaciones especiales si aplica).
- Si es "Sugerir moderadamente": Actúa como Editor Académico y Asesor Pedagógico. Mejora la fluidez y usa vocabulario técnico-pedagógico. Ayuda a desarrollar brevemente las ideas sueltas dándoles sentido pedagógico (puedes completar lo que hay), pero NO inventes conceptos grandes ni cambies el objetivo principal.
- Si es "Sugerir ampliamente" o "Refinar profundamente": Actúa como Experto en Pedagogía y Diseño Curricular. Llena los vacíos con contenido pertinente, diseña actividades o justificaciones faltantes, reestructura y amplía libremente para crear un resultado robusto y altamente didáctico.

**Contexto del PDC:**
[CONTEXTO_PDC]

**Objetivos Originales (con IDs):**
[DATOS_OBJETIVOS]`,
        criteria_batch: `Tu tarea es consolidar y refinar los criterios de evaluación (SER, SABER, HACER), las adaptaciones no significativas y los criterios de evaluación para adaptaciones especiales en un bloque coherente.

- OBLIGATORIO usar los subtítulos exactos: Ser:, Saber:, Hacer: (sin asteriscos, sin comillas, sólo la palabra con dos puntos).
- Cada dimensión debe contener una numeración independiente (es decir: 1., 2., 3...).
- Escribe desde la perspectiva de un docente experto: Tercera persona singular en modo imperativo (ejemplos: "Reconoce", "Aplica", "Valora").
- **Tono:** [TONO_SELECCIONADO]
- **Profundidad de corrección seleccionada:** [CORRECCION_PROFUNDIDAD]
**Reglas según profundidad:**
- Si es "Solo errores de redaccion" o "Solo correcciones": Actúa ÚNICAMENTE como un corrector ortotipográfico. NO agregues ideas nuevas ni elimines información. NO reestructures los párrafos ni cambies el significado original. Limítate a corregir ortografía, gramática y puntuación (los campos vacíos déjalos vacíos, excepto adaptaciones especiales si aplica).
- Si es "Sugerir moderadamente": Actúa como Editor Académico y Asesor Pedagógico. Mejora la fluidez y usa vocabulario técnico-pedagógico. Ayuda a desarrollar brevemente las ideas sueltas dándoles sentido pedagógico (puedes completar lo que hay), pero NO inventes conceptos grandes ni cambies el objetivo principal.
- Si es "Sugerir ampliamente" o "Refinar profundamente": Actúa como Experto en Pedagogía y Diseño Curricular. Llena los vacíos con contenido pertinente, diseña actividades o justificaciones faltantes, reestructura y amplía libremente para crear un resultado robusto y altamente didáctico.

**Estructura de salida requerida (JSON):**
{
  "criterios_evaluacion_ia": "Texto con los criterios (SER, SABER, HACER) proporcionados. Si una dimensión no tiene datos, no la incluyas.",
  "adaptaciones_no_significativas_ia": "Síntesis de adaptaciones básicas. Si no hay datos, devuelve \"\".",
  "criterios_evaluacion_adaptaciones_ia": "Toma los mismos Criterios de Evaluación generados (del campo criterios_evaluacion_ia) y adáptalos específicamente para CADA UNA de las discapacidades presentes en la DISCAPACIDAD GLOBAL IDENTIFICADA. Mantén la misma esencia. Usa ESTE FORMATO EXACTO:\n\nDiscapacidad: [Nombre Discapacidad]\nSer:\n1. [Criterio adaptado]\nSaber:\n1. [Criterio adaptado]\nHacer:\n1. [Criterio adaptado]\n\nSi para alguna dimensión (Ser, Saber o Hacer) de una discapacidad no es necesario realizar una adaptación, debes escribirlo expresamente (ej: \"1. No se requieren adaptaciones específicas para esta dimensión\"). Si no hay discapacidad global, devuelve \"\"."
}

**REGLA CRÍTICA:** Si la Profundidad es "Sugerir ampliamente" o "Refinar profundamente", TU OBLIGACIÓN es CREAR Y LLENAR los criterios faltantes basándote en el Contexto del PDC, INCLUSO SI LOS DATOS DE ENTRADA ESTÁN VACÍOS. Si la profundidad es menor a estas, y un campo está vacío o dice "Sin datos", la respuesta para esa clave DEBE ser una cadena vacía ("") y no debes inventar nada.

**Contexto del PDC:**
[CONTEXTO_PDC]

**Datos de entrada (Criterios Originales):**
[DATOS_CRITERIOS]

**Datos de entrada (Adaptaciones Planificadas):**
[DATOS_ADAPTACIONES]`,
        weekly_batch: `Tu tarea es consolidar y refinar toda la planificación de VARIAS semanas (Momentos Metodológicos, Recursos/Fuentes y Adaptaciones) en una sola pasada.

**INSTRUCCIÓN CRÍTICA — FORMATO DE RESPUESTA:**
Responde ÚNICAMENTE con un array JSON válido. No uses bloques \`\`\`json. No incluyas texto ni markdown fuera del JSON.
El JSON debe ser un array de objetos, donde cada objeto corresponde a una semana enviada e incluye su "semana_id" original más las 4 claves refinadas: "momentos_ia", "recursos_fuentes_ia", "adaptaciones_basicas_ia", "adaptaciones_especiales_ia".

Ejemplo de formato correcto:
[
  {
    "semana_id": "id-de-la-semana",
    "momentos_ia": "texto...",
    "recursos_fuentes_ia": "texto...",
    "adaptaciones_basicas_ia": "texto...",
    "adaptaciones_especiales_ia": "texto..."
  }
]

**Tono:** [TONO_SELECCIONADO]
**Profundidad de corrección seleccionada:** [CORRECCION_PROFUNDIDAD]
**Reglas según profundidad:**
- Si es "Solo errores de redaccion" o "Solo correcciones": Actúa ÚNICAMENTE como un corrector ortotipográfico. NO agregues ideas nuevas ni elimines información. NO reestructures los párrafos ni cambies el significado original. Limítate a corregir ortografía, gramática y puntuación (los campos vacíos déjalos vacíos, excepto adaptaciones especiales si aplica).
- Si es "Sugerir moderadamente": Actúa como Editor Académico y Asesor Pedagógico. Mejora la fluidez y usa vocabulario técnico-pedagógico. Ayuda a desarrollar brevemente las ideas sueltas dándoles sentido pedagógico (puedes completar lo que hay), pero NO inventes conceptos grandes ni cambies el objetivo principal.
- Si es "Sugerir ampliamente" o "Refinar profundamente": Actúa como Experto en Pedagogía y Diseño Curricular. Llena los vacíos con contenido pertinente, diseña actividades o justificaciones faltantes, reestructura y amplía libremente para crear un resultado robusto y altamente didáctico.

**Contexto del PDC:**
[CONTEXTO_PDC]

**Reglas de contenido (ESTRICTAS):**
- Para "momentos_ia": Presenta la Práctica, Teoría, Producción y Valoración (si existen datos de entrada para ellos) en una lista usando el símbolo de viñeta "- ".
- ESTRICTAMENTE PROHIBIDO usar palabras de enlace o conectores temporales entre los momentos (como "luego", "a continuación", "después", "posteriormente", etc.). Cada momento debe ser un punto independiente en la lista.
- El texto debe estar en Presente de Indicativo, primera persona del plural (forma inclusiva: "aprendemos", "conocemos", etc.) describiendo el proceso de aprendizaje.
- Para la redacción de cada momento metodológico, sigue ESTRICTAMENTE la siguiente estructura:
  * Práctica: Primero una descripción de la actividad y luego preguntas activadoras.
  * Teoría: Solo la redacción de la estrategia.
  * Producción: Descripción de la actividad y un solo instrumento sugerido.
  * Valoración: Siempre preguntas.
- Identifica el momento poniendo la etiqueta entre paréntesis: (Práctica), (Teoría), (Producción) o (Valoración) ÚNICAMENTE AL FINAL de cada punto de la lista correspondiente a ese momento. NUNCA como título inicial ni encima.
- NO menciones días de la semana ni fechas bajo ninguna circunstancia.
- Para "recursos_fuentes_ia": Sugiere ÚNICAMENTE recursos creativos y novedosos (materiales, didácticos o tecnológicos) pertinentes y organízalos agrupados por cada momento metodológico, usando viñetas ("- "). ESTÁ ESTRICTAMENTE PROHIBIDO inventar, sugerir o mencionar libros, sitios web, bibliografía o "Fuentes de apoyo". Limítate exclusivamente a los materiales educativos. (Si la profundidad es moderada/solo corrección y no hay datos de recursos en la entrada, devuelve "").
- Para "adaptaciones_basicas_ia": Lista las adaptaciones curriculares generales, metodológicas o de apoyo utilizando viñetas ("- "). Sugiere estrategias de atención a la diversidad si la profundidad es "Sugerir ampliamente". NO agregues ningún título al inicio. (Si la profundidad es moderada/solo corrección y no hay datos, devuelve "").
- Para "adaptaciones_especiales_ia": Redacta sugerencias de adaptaciones metodológicas para CADA UNA de las discapacidades en "DISCAPACIDAD GLOBAL IDENTIFICADA". DEBES usar EXACTAMENTE este formato: primero el subtítulo con la discapacidad, y luego las viñetas terminando con el momento entre paréntesis.
Ejemplo OBLIGATORIO de formato:
**Adaptaciones para [Nombre Discapacidad]:**
- [Sugerencia de adaptación detallada...] (Práctica)
- [Sugerencia de adaptación detallada...] (Teoría)
- [Sugerencia de adaptación detallada...] (Producción)
- [Sugerencia de adaptación detallada...] (Valoración)

REGLA ABSOLUTA e INQUEBRANTABLE: Las etiquetas (Práctica), (Teoría), (Producción), (Valoración) DEBEN ir AL FINAL de la viñeta, NUNCA al principio. 
Si no es necesario adaptar un momento específico, indícalo expresamente (ej: "- No requiere adaptación (Práctica)"). 
Si una discapacidad en particular NO necesita NINGUNA adaptación para los contenidos de esta semana, escribe exactamente: "No requiere adaptación." debajo de su subtítulo.
Si no hay discapacidad global, devuelve "".
- Debes devolver exactamente un objeto por cada semana en la entrada, manteniendo su "semana_id".

**Datos de Semanas:**
[DATOS_SEMANAS]`,
        content_generator: `Tu tarea es generar contenido educativo didáctico e integral para estudiantes, basado en el tema asignado y la planificación del docente.

**INSTRUCCIÓN TÉCNICA (MATEMÁTICAS):** Si el contenido requiere ecuaciones o fórmulas, utiliza obligatoriamente formato LaTeX encerrado entre símbolos de dólar dobles ($$) para bloques y simples ($) para fórmulas en línea.

**Estructura solicitada por el docente:** 
[ESTRUCTURA_SELECCIONADA]

**Secciones adicionales a incluir obligatoriamente:** 
[COMPONENTES_PEDAGOGICOS]

**Toques extra obligatorios:** 
[EXTRAS_SELECCIONADOS]

**Contexto del Plan de Clase (PDC) para inspirar la didáctica:**
[CONTEXTO_MOMENTOS_PDC]
(Práctica -> Ejemplos reales; Teoría -> Conceptos; Valoración -> Reflexión; Producción -> Ejercicios prácticos).

**Información base proporcionada (Úsala como fuente principal de verdad para la teoría):**
[CONTEXTO_EXTRA_PDF]

**Tema General:** [TEMA_PADRE]
**Subtemas a Desarrollar:** [LISTA_SUBTEMAS]

Desarrolla el documento final en formato Markdown estructurado, limpio y listo para exportarse.`,
        exam_generator: `Eres un Arquitecto de Evaluaciones Pedagógicas y Gamificación de Alto Nivel.
Tu misión es diseñar un examen o prueba escrita basándote ESTRICTAMENTE en la información enviada (Contexto, Criterios de Evaluación y Módulos Activados).

**REGLA CRÍTICA 1 (ESTRUCTURA):**
Tu respuesta DEBE ser un objeto JSON válido, con EXACTAMENTE las siguientes propiedades:
1. "markdown_documento": Un texto en formato Markdown de alta calidad listo para imprimir y repartir a los estudiantes. Este es el examen físico.
2. "reactivos": Un arreglo de objetos JSON donde extraes CADA PREGUNTA individual generada en el examen (Para guardarlas en la Base de Datos).
3. "instrumentos": Un arreglo de objetos JSON que represente las Rúbricas o Listas de Cotejo generadas para calificar el Hacer y Ser.

**REGLA CRÍTICA 2 (NARRATIVA):**
Si el docente especifica una "NARRATIVA GAMIFICADA SELECCIONADA", debes transformar el lenguaje del examen para sumergir al alumno en esa historia. Ejemplo: Si es Escape Room, las preguntas son "acertijos para abrir la puerta".

**REGLA CRÍTICA 3 (MODULOS ACTIVADOS):**
Solo puedes generar los bloques que el docente haya activado explícitamente en "MÓDULOS ACTIVADOS PARA LA PRUEBA". Si un módulo no está en la lista, omítelo por completo. Los puntajes deben sumar siempre 100 puntos en base a los módulos presentes.`
    }
};

export default function AIConfigPage() {
    const router = useRouter();
    const { checkAccess, loading } = useAdminController();
    const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG);
    const [saving, setSaving] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'prompts' | 'context'>('prompts');

    useEffect(() => {
        const init = async () => {
            const hasAccess = await checkAccess();
            if (hasAccess) {
                const res = await AdminService.getGlobalSettings();
                if (res.success && res.data?.ia_config) {
                    setConfig(res.data.ia_config);
                }
            }
            setPageLoading(false);
        };
        init();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const currentSettings = await AdminService.getGlobalSettings();
            const newSettings = {
                ...(currentSettings.data || {}),
                ia_config: config
            };
            
            const res = await AdminService.updateGlobalSettings(newSettings);
            if (res.success) {
                toast.success("Configuración de IA Guardada", {
                    description: "Los prompts y el contexto se han actualizado globalmente."
                });
            } else {
                throw new Error(res.error?.message || "Error al guardar");
            }
        } catch (error: any) {
            toast.error("Error al guardar", {
                description: error.message
            });
        } finally {
            setSaving(false);
        }
    };

    const handleRestore = (key: keyof typeof DEFAULT_CONFIG.prompts) => {
        if (window.confirm(`¿Estás seguro de restaurar este prompt a su valor predeterminado?`)) {
            setConfig({
                ...config,
                prompts: {
                    ...config.prompts,
                    [key]: DEFAULT_CONFIG.prompts[key]
                }
            });
            toast.info("Prompt restaurado", {
                description: "Recuerda hacer clic en 'Guardar' para aplicar los cambios en la base de datos."
            });
        }
    };

    if (pageLoading) return null;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/admin')} className="size-12 rounded-2xl bg-white shadow-soft border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all group">
                        <span className="material-symbols-rounded text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all">arrow_back</span>
                    </button>
                    <div>
                        <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] text-cyan-600 bg-cyan-50 border-cyan-100 mb-2">
                            AI Core Configuration
                        </Badge>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic">Orquestador de IA</h1>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline"
                        onClick={() => {
                            if (window.confirm("¿Estás seguro de restaurar los prompts y variables a sus valores por defecto? Perderás los cambios no guardados.")) {
                                setConfig(DEFAULT_CONFIG);
                                toast.info("Valores predeterminados restaurados", {
                                    description: "Recuerda presionar 'Sincronizar IA' para guardar los cambios en la base de datos."
                                });
                            }
                        }}
                        className="h-14 px-8 rounded-2xl font-black"
                    >
                        Restaurar Predeterminados
                    </Button>
                    <Button 
                        onClick={handleSave}
                        isLoading={saving}
                        className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-black shadow-2xl shadow-slate-200"
                    >
                        Sincronizar IA
                    </Button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
                <button 
                    onClick={() => setActiveTab('prompts')}
                    className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'prompts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Prompts de Ingeniería
                </button>
                <button 
                    onClick={() => setActiveTab('context')}
                    className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'context' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Variables de Contexto
                </button>
            </div>

            {activeTab === 'prompts' ? (
                <div className="grid grid-cols-1 gap-8">
                    {/* Strategic Objective Prompt */}
                    <Card className="p-10 border-none shadow-premium bg-white overflow-hidden">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <span className="material-symbols-rounded text-3xl">target</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Objetivo Estratégico</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Ajuste de redacción y tono</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleRestore('strategic_objective')} className="rounded-xl text-xs h-9 px-4 font-bold">Restaurar</Button>
                                <Button size="sm" onClick={handleSave} isLoading={saving} className="rounded-xl text-xs h-9 px-4 font-bold bg-slate-900 text-white shadow-md">Guardar</Button>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Template del Prompt System</label>
                            <textarea 
                                className="w-full min-h-[200px] p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-mono text-sm text-slate-700 outline-none focus:border-blue-500 transition-all leading-relaxed"
                                value={config.prompts.strategic_objective}
                                onChange={(e) => setConfig({
                                    ...config,
                                    prompts: { ...config.prompts, strategic_objective: e.target.value }
                                })}
                            />
                            <div className="flex flex-wrap gap-2">
                                {['[TONO_SELECCIONADO]', '[CORRECCION_PROFUNDIDAD]', '[DESCRIPCION_OBJETIVO]', '[CONTEXTO_PDC]'].map(tag => (
                                    <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-700 text-[9px] font-bold py-1 px-3 border border-blue-100">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Criteria Batch Prompt */}
                    <Card className="p-10 border-none shadow-premium bg-white">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <span className="material-symbols-rounded text-3xl">checklist</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Criterios de Evaluación (Batch)</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Generación de SER/SABER/HACER e IA</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleRestore('criteria_batch')} className="rounded-xl text-xs h-9 px-4 font-bold">Restaurar</Button>
                                <Button size="sm" onClick={handleSave} isLoading={saving} className="rounded-xl text-xs h-9 px-4 font-bold bg-slate-900 text-white shadow-md">Guardar</Button>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Template del Prompt System</label>
                            <textarea 
                                className="w-full min-h-[300px] p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-mono text-sm text-slate-700 outline-none focus:border-purple-500 transition-all leading-relaxed"
                                value={config.prompts.criteria_batch}
                                onChange={(e) => setConfig({
                                    ...config,
                                    prompts: { ...config.prompts, criteria_batch: e.target.value }
                                })}
                            />
                            <div className="flex flex-wrap gap-2">
                                {['[TONO_SELECCIONADO]', '[CORRECCION_PROFUNDIDAD]', '[CONTEXTO_PDC]', '[DATOS_CRITERIOS]', '[DATOS_ADAPTACIONES]'].map(tag => (
                                    <Badge key={tag} variant="outline" className="bg-purple-50 text-purple-700 text-[9px] font-bold py-1 px-3 border border-purple-100">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Weekly Batch Prompt */}
                    <Card className="p-10 border-none shadow-premium bg-white">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                                    <span className="material-symbols-rounded text-3xl">view_week</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Planificación Semanal (Batch)</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Momentos, Recursos y Adaptaciones</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleRestore('weekly_batch')} className="rounded-xl text-xs h-9 px-4 font-bold">Restaurar</Button>
                                <Button size="sm" onClick={handleSave} isLoading={saving} className="rounded-xl text-xs h-9 px-4 font-bold bg-slate-900 text-white shadow-md">Guardar</Button>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Template del Prompt System</label>
                            <textarea 
                                className="w-full min-h-[350px] p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-mono text-sm text-slate-700 outline-none focus:border-cyan-500 transition-all leading-relaxed"
                                value={config.prompts.weekly_batch}
                                onChange={(e) => setConfig({
                                    ...config,
                                    prompts: { ...config.prompts, weekly_batch: e.target.value }
                                })}
                            />
                            <div className="flex flex-wrap gap-2">
                                {['[TONO_SELECCIONADO]', '[CORRECCION_PROFUNDIDAD]', '[CONTEXTO_PDC]', '[DATOS_MOMENTOS]', '[DATOS_RECURSOS_FUENTES]', '[DATOS_ADAPTACIONES]'].map(tag => (
                                    <Badge key={tag} variant="outline" className="bg-cyan-50 text-cyan-700 text-[9px] font-bold py-1 px-3 border border-cyan-100">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Content Generator Prompt */}
                    <Card className="p-10 border-none shadow-premium bg-white">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <span className="material-symbols-rounded text-3xl">auto_stories</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Generador de Contenidos</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Creación de Material Didáctico y PDFs</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleRestore('content_generator')} className="rounded-xl text-xs h-9 px-4 font-bold">Restaurar</Button>
                                <Button size="sm" onClick={handleSave} isLoading={saving} className="rounded-xl text-xs h-9 px-4 font-bold bg-slate-900 text-white shadow-md">Guardar</Button>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Template del Prompt System</label>
                            <textarea 
                                className="w-full min-h-[350px] p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-mono text-sm text-slate-700 outline-none focus:border-emerald-500 transition-all leading-relaxed"
                                value={config.prompts.content_generator}
                                onChange={(e) => setConfig({
                                    ...config,
                                    prompts: { ...config.prompts, content_generator: e.target.value }
                                })}
                            />
                            <div className="flex flex-wrap gap-2">
                                {['[ESTRUCTURA_SELECCIONADA]', '[COMPONENTES_PEDAGOGICOS]', '[EXTRAS_SELECCIONADOS]', '[PROFUNDIDAD]', '[CURSO]', '[CONTEXTO_MOMENTOS_PDC]', '[CONTEXTO_EXTRA_PDF]', '[TEMA_PADRE]', '[LISTA_SUBTEMAS]'].map(tag => (
                                    <Badge key={tag} variant="outline" className="bg-emerald-50 text-emerald-700 text-[9px] font-bold py-1 px-3 border border-emerald-100">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Exam Generator Prompt */}
                    <Card className="p-10 border-none shadow-premium bg-white">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                                    <span className="material-symbols-rounded text-3xl">quiz</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Generador de Exámenes Gamificados</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Saber, Hacer, Ser y Módulos Dinámicos</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleRestore('exam_generator')} className="rounded-xl text-xs h-9 px-4 font-bold">Restaurar</Button>
                                <Button size="sm" onClick={handleSave} isLoading={saving} className="rounded-xl text-xs h-9 px-4 font-bold bg-slate-900 text-white shadow-md">Guardar</Button>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Template del Prompt System</label>
                            <textarea 
                                className="w-full min-h-[350px] p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-mono text-sm text-slate-700 outline-none focus:border-orange-500 transition-all leading-relaxed"
                                value={config.prompts.exam_generator}
                                onChange={(e) => setConfig({
                                    ...config,
                                    prompts: { ...config.prompts, exam_generator: e.target.value }
                                })}
                            />
                            <div className="flex flex-wrap gap-2">
                                {['[CONTEXTO_PDC]', '[CRITERIOS_EVALUACION]', '[NARRATIVA]', '[MODULOS_ACTIVADOS]'].map(tag => (
                                    <Badge key={tag} variant="outline" className="bg-orange-50 text-orange-700 text-[9px] font-bold py-1 px-3 border border-orange-100">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="max-w-3xl">
                    <Card className="p-10 border-none shadow-premium bg-white">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="size-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <span className="material-symbols-rounded text-3xl">info</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Variables de Contexto del PDC</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Información enviada en [CONTEXTO_PDC]</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(config.context_fields).map(([field, enabled]) => (
                                <div key={field} className="flex items-center justify-between p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 group hover:border-amber-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`size-10 rounded-xl flex items-center justify-center ${enabled ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                            <span className="material-symbols-rounded text-xl">
                                                {field === 'nivel' ? 'school' : 
                                                 field === 'grado' ? 'auto_stories' : 
                                                 field === 'area' ? 'menu_book' : 
                                                 field === 'temas' ? 'list_alt' : 'person'}
                                            </span>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="font-black text-slate-900 capitalize tracking-tight">{field}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                {field === 'nivel' ? 'Educación Inicial / Primaria / Secundaria' : 
                                                 field === 'grado' ? 'Año de escolaridad del estudiante' : 
                                                 field === 'area' ? 'Materia o campo de conocimiento' : 
                                                 field === 'temas' ? 'Títulos de contenidos seleccionados' : 'Nombre del docente asignado'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setConfig({
                                            ...config,
                                            context_fields: { ...config.context_fields, [field]: !enabled }
                                        })}
                                        className={`size-12 rounded-xl flex items-center justify-center transition-all ${enabled ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-200 text-slate-400'}`}
                                    >
                                        <span className="material-symbols-rounded">{enabled ? 'toggle_on' : 'toggle_off'}</span>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 p-6 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium leading-relaxed">
                            <p className="font-black uppercase tracking-widest text-[10px] mb-2">Nota Técnica:</p>
                            Estas variables se inyectan automáticamente en el marcador [CONTEXTO_PDC] dentro de los prompts de ingeniería. Desactivar campos clave puede reducir la precisión pedagógica de la IA.
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
