/**
 * @file promptTemplates.ts
 * @description Plantillas de prompts para el Asistente IA de EduPlan Pro.
 *
 * ── Arquitectura de Composición ──────────────────────────────────────────────
 * En lugar de repetir la misma introducción en cada prompt (lo que consume
 * tokens innecesarios), se definen dos bloques base:
 *
 *   AGENT_PERSONA       → Quién es el agente (se escribe UNA vez)
 *   STRICT_INSTRUCTIONS → Reglas comunes a todos los prompts
 *
 * El compositor buildPrompt(tarea, cuerpo, extrasOpcionales) ensambla los tres
 * bloques. Cada SYSTEM_PROMPT_* solo define la parte que es ÚNICA para esa tarea.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ═══════════════════════════════════════════════════════════════════════════════
// BLOQUE BASE — Solo se define aquí, no se repite en ningún prompt
// ═══════════════════════════════════════════════════════════════════════════════

const AGENT_PERSONA =
    `Actúa como un docente experto en pedagogía, didáctica y diseño curricular boliviano.`;

const STRICT_INSTRUCTIONS = `\
**Instrucciones estrictas:**
- No incluyas metacomentarios, introducciones ni despedidas (nada de "Claro, aquí está", "A continuación", etc.).
- No uses emojis, asteriscos decorativos ni formatos innecesarios.
- Responde únicamente con la redacción solicitada.
- Usa lenguaje claro, pedagógico y profesional, orientado a docentes.
- Escribe desde la perspectiva de un docente experto: usa primera persona singular o modo imperativo directo según el contexto. Nunca uses "nosotros", "somos" ni frases de equipo.`;

/**
 * Compositor de prompts.
 * @param taskDescription   Descripción breve de la tarea específica del agente.
 * @param uniqueBody        Cuerpo con placeholders y datos únicos de esta tarea.
 * @param extraInstructions Instrucciones adicionales que se añaden DESPUÉS de las comunes (opcional).
 */
function buildPrompt(taskDescription: string, uniqueBody: string, extraInstructions?: string): string {
    const instructions = extraInstructions
        ? `${STRICT_INSTRUCTIONS}\n${extraInstructions}`
        : STRICT_INSTRUCTIONS;
    return `${AGENT_PERSONA} ${taskDescription}\n\n${instructions}\n\n${uniqueBody}`.trim();
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFINICIONES PEDAGÓGICAS
// ═══════════════════════════════════════════════════════════════════════════════

export const MOMENTOS_DEFINITIONS = {
    practica:   'La Práctica como momento metodológico inicia desde la experiencia (lo que ya sabemos), el contacto directo con la realidad (observación y vivencia) o la experimentación (manipular objetos o fenómenos). Su objetivo es aterrizar el aprendizaje en situaciones concretas y tangibles.',
    teoria:     'La Teoría implica la re-significación y el análisis crítico de la información. No es solo lectura pasiva, sino la construcción de conceptos, la investigación documental y el diálogo con el conocimiento acumulado para comprender la realidad de forma abstracta y sistémica.',
    produccion: 'La Producción es el momento de la creación e innovación pedagógica. Se refiere a la elaboración de productos tangibles (objetos, escritos, maquetas) o intangibles (ideas, soluciones, propuestas) que demuestran la aplicación creativa y útil de lo aprendido.',
    valoracion: 'La Valoración es una reflexión ética y postura crítica sobre el aprendizaje. Busca determinar la importancia del conocimiento para la vida, la comunidad y el bienestar común. Evalúa si lo aprendido contribuye a la transformación positiva de la sociedad.',
    ser:        'La Dimensión del Ser se enfoca en los valores, actitudes y principios éticos del estudiante. Evalúa el desarrollo de la espiritualidad, la responsabilidad y la convivencia armónica.',
    saber:      'La Dimensión del Saber evalúa los conocimientos cognitivos, la comprensión teórica y la capacidad de análisis de contenidos científicos y culturales.',
    hacer:      'La Dimensión del Hacer se centra en las habilidades prácticas, la aplicación de conocimientos en situaciones reales y la producción de resultados tangibles o técnicos.',
};

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export type TonoRedaccion =
    | 'Motivacional-afectivo'
    | 'Instructivo-operativo'
    | 'Técnico-pedagógico'
    | 'Reflexivo-metacognitivo'
    | 'Lúdico-narrativo';

export const TONOS_LABEL: Record<TonoRedaccion, string> = {
    'Motivacional-afectivo':   'Motivacional-afectivo',
    'Instructivo-operativo':   'Instructivo-operativo',
    'Técnico-pedagógico':      'Técnico-pedagógico',
    'Reflexivo-metacognitivo': 'Reflexivo-metacognitivo',
    'Lúdico-narrativo':        'Lúdico-narrativo',
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPTS COMPUESTOS
// Cada uno solo define su PARTE ÚNICA. El resto lo aporta buildPrompt().
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Criterio de evaluación por dimensión individual (SER / SABER / HACER).
 * Usado en el wizard paso a paso.
 */
export const SYSTEM_PROMPT_CRITERIOS = buildPrompt(
    `Tu tarea es redactar el criterio de evaluación para la dimensión "[DIMENSION_NOMBRE]".`,
    `- El criterio debe ser medible, observable y redactado en tercera persona del plural (ej: "Expresan posturas críticas...", "Aplican técnicas de...").

**Tono:** [TONO_SELECCIONADO]

**Información del criterio:**
[DATOS_CRITERIO]

**Definición de la dimensión (marco de referencia):**
[DEFINICION_DIMENSION]`
);

/**
 * Momento metodológico individual (Práctica / Teoría / Producción / Valoración).
 * Usado en el wizard de momentos.
 */
export const SYSTEM_PROMPT_MOMENTOS = buildPrompt(
    `Tu tarea es redactar el momento "[MOMENTO_NOMBRE]" de una sesión de aprendizaje.`,
    `**Tono:** [TONO_SELECCIONADO]
Mantén coherencia en el vocabulario y el registro lingüístico conforme al tono elegido.

**Información de la actividad:**
[DATOS_ACTIVIDAD]

**Definición del momento (marco de referencia):**
[DEFINICION_MOMENTO]

**Estructura a seguir:**
1. Fundamentación del momento
2. Desarrollo de la actividad
3. Preguntas para la mediación docente
4. Adaptaciones por nivel educativo
5. Rol del docente
6. Cierre y conexión con el siguiente momento`
);

/**
 * Objetivo estratégico de un área del PDC.
 */
export const SYSTEM_PROMPT_STRATEGIC_OBJECTIVE = buildPrompt(
    `Tu tarea es refinar el objetivo estratégico de un Plan de Desarrollo Curricular, basándote en la descripción enviada y el tono seleccionado.`,
    `**Tono:** [TONO_SELECCIONADO]
**Profundidad de corrección:** [CORRECCION_PROFUNDIDAD]

**Descripción original:**
[DESCRIPCION_OBJETIVO]

**Contexto del PDC:**
[CONTEXTO_PDC]`
);

/**
 * Batch semanal unificado: consolida Momentos, Recursos/Fuentes y Adaptaciones
 * en una sola llamada a la IA. Devuelve un JSON con 4 claves _ia.
 */
export const SYSTEM_PROMPT_WEEKLY_BATCH = buildPrompt(
    `Tu tarea es consolidar y refinar toda la planificación de UNA semana (Momentos Metodológicos, Recursos/Fuentes y Adaptaciones) en una sola pasada.`,
    `**Tono:** [TONO_SELECCIONADO]
**Profundidad:** [CORRECCION_PROFUNDIDAD]

**Contexto del PDC:**
[CONTEXTO_PDC]

**Formato de salida para "momentos_ia":**
Un bloque de texto coherente estructurado en:
1. PRÁCTICA (Fundamentación y Actividad)
2. TEORÍA (Análisis y Conceptos)
3. PRODUCCIÓN (Creación e Innovación)
4. VALORACIÓN (Reflexión Ética)

**Formato de salida para "recursos_fuentes_ia":** Texto profesional y fluido. Si no hay datos: "No definido".
**Formato de salida para "adaptaciones_basicas_ia":** Texto empático. Si no hay datos: "No definido".
**Formato de salida para "adaptaciones_especiales_ia":** Texto preciso. Si no hay datos: "No definido".

**Datos de entrada:**
Momentos:
[DATOS_MOMENTOS]

Recursos y Fuentes:
[DATOS_RECURSOS_FUENTES]

Adaptaciones:
[DATOS_ADAPTACIONES]`,
    `- Responde ÚNICAMENTE con un objeto JSON válido (sin bloques \`\`\`json) con exactamente estas 4 claves: "momentos_ia", "recursos_fuentes_ia", "adaptaciones_basicas_ia", "adaptaciones_especiales_ia".`
);

/**
 * Consolidado batch de criterios SER/SABER/HACER para el reporte final.
 */
export const SYSTEM_PROMPT_BATCH_CRITERIOS = buildPrompt(
    `Tu tarea es consolidar y refinar los criterios de evaluación de las dimensiones SER, SABER y HACER en un bloque de texto coherente.`,
    `- Los criterios deben ser medibles y redactados en tercera persona del plural.
- **Tono:** [TONO_SELECCIONADO]
- **Profundidad:** [CORRECCION_PROFUNDIDAD]
- Estructura de salida:
  - SER: [Redacción mejorada]
  - SABER: [Redacción mejorada]
  - HACER: [Redacción mejorada]

**Contexto del PDC:**
[CONTEXTO_PDC]

**Datos de entrada:**
[DATOS_CRITERIOS]`
);

// ─── Alias de compatibilidad hacia atrás (importados en aiOptimization.service) ─
/** @deprecated Usar SYSTEM_PROMPT_MOMENTOS directamente */
export const SYSTEM_PROMPT_BATCH_MOMENTOS = SYSTEM_PROMPT_MOMENTOS;
/** @deprecated Consolidado en SYSTEM_PROMPT_WEEKLY_BATCH */
export const SYSTEM_PROMPT_RECURSOS_FUENTES = SYSTEM_PROMPT_WEEKLY_BATCH;
/** @deprecated Consolidado en SYSTEM_PROMPT_WEEKLY_BATCH */
export const SYSTEM_PROMPT_ADAPTACIONES = SYSTEM_PROMPT_WEEKLY_BATCH;
