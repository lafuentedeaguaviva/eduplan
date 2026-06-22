/**
 * @file promptBuilder.ts
 * @description Lógica para construir prompts contextualizados para el Asistente IA.
 */

import { SYSTEM_PROMPT_MOMENTOS, SYSTEM_PROMPT_CRITERIOS, MOMENTOS_DEFINITIONS, TonoRedaccion } from './promptTemplates';

export interface PromptDataContext {
  momento?: 'practica' | 'teoria' | 'produccion' | 'valoracion';
  dimension?: 'ser' | 'saber' | 'hacer' | 'decidir';
  tono: TonoRedaccion;
  data: any; // PracticaItem, CriterioItem, etc.
}

export function buildMomentoPrompt({ momento, tono, data }: PromptDataContext): string {
  if (!momento) return '';
  const definition = MOMENTOS_DEFINITIONS[momento];
  const momentoNombre = momento.charAt(0).toUpperCase() + momento.slice(1);
  
  // Mapeo dinámico de datos según el momento
  let activityInfo = '';

  if (momento === 'practica') {
    activityInfo = `
- Nombre de la práctica: ${data.nombre_practica || 'N/A'}
- Propósito: ${data.proposito || 'Desarrollar habilidades prácticas'}
- Tipo: ${data.tipo || 'Actividad de aula'}
- Apto para: ${data.apto_para || 'Todos los niveles'}
- Descripción concreta: ${data.descripcion || 'Sin descripción'}
- Redactado para presentar al grupo: ${data.redactado || 'N/A'}
- Preguntas guía: ${data.preguntas || 'Sin preguntas registradas'}
- Ejemplo para nivel inicial: ${data.ejemplo_inicial || 'N/A'}
- Ejemplo para primaria: ${data.ejemplo_primaria || 'N/A'}
- Ejemplo para secundaria: ${data.ejemplo_secundaria || 'N/A'}
- Ejemplo para multigrado: ${data.ejemplo_multigrado || 'N/A'}
    `.trim();
  } else if (momento === 'teoria') {
    activityInfo = `
- Nombre de la estrategia: ${data.nombre_estrategia_teorica || 'N/A'}
- Redactado base: ${data.redactado || 'Sin redactar'}
- Ejemplo para nivel inicial: ${data.ejemplo_inicial || 'N/A'}
- Ejemplo para primaria: ${data.ejemplo_primaria || 'N/A'}
- Ejemplo para secundaria: ${data.ejemplo_secundaria || 'N/A'}
- Ejemplo para multigrado: ${data.ejemplo_multigrado || 'N/A'}
    `.trim();
  } else if (momento === 'produccion') {
    activityInfo = `
- Nombre de la producción: ${data.nombre_produccion || 'N/A'}
- Descripción concreta: ${data.descripcion_concreta || 'Sin descripción'}
- Redactado base: ${data.redactado || 'Sin redactar'}
- Instrumento sugerido: ${data.instrumento || 'N/A'}
- Ejemplo para nivel inicial: ${data.ejemplo_inicial || 'N/A'}
- Ejemplo para primaria: ${data.ejemplo_primaria || 'N/A'}
- Ejemplo para secundaria: ${data.ejemplo_secundaria || 'N/A'}
- Ejemplo para multigrado: ${data.ejemplo_multigrado || 'N/A'}
    `.trim();
  } else if (momento === 'valoracion') {
    activityInfo = `
- Categoría de valoración: ${data.categoria || 'N/A'}
- Preguntas guía: ${data.preguntas || 'Sin preguntas'}
- Redactado base: ${data.redactado || 'Sin redactar'}
- Instrumento sugerido: ${data.instrumento || 'N/A'}
- Ejemplo para nivel inicial: ${data.ejemplo_inicial || 'N/A'}
- Ejemplo para primaria: ${data.ejemplo_primaria || 'N/A'}
- Ejemplo para secundaria: ${data.ejemplo_secundaria || 'N/A'}
- Ejemplo para multigrado: ${data.ejemplo_multigrado || 'N/A'}
    `.trim();
  }

  let estructuraASeguir = '';
  if (momento === 'practica') {
    estructuraASeguir = `Primero una descripción de la actividad y luego preguntas activadoras.`;
  } else if (momento === 'teoria') {
    estructuraASeguir = `Solo la redacción de la estrategia (sin fundamentación extensa ni otros elementos).`;
  } else if (momento === 'produccion') {
    estructuraASeguir = `Descripción de la actividad y un solo instrumento sugerido.`;
  } else if (momento === 'valoracion') {
    estructuraASeguir = `Siempre preguntas (enfocadas en la reflexión ética y postura crítica).`;
  }

  // Ensamblar el prompt final
  return SYSTEM_PROMPT_MOMENTOS
    .replace('[MOMENTO_NOMBRE]', momentoNombre)
    .replace('[TONO_SELECCIONADO]', tono)
    .replace('[DATOS_ACTIVIDAD]', activityInfo)
    .replace('[DEFINICION_MOMENTO]', definition)
    .replace('[ESTRUCTURA_A_SEGUIR]', estructuraASeguir);
}

export function buildCriterioPrompt({ dimension, tono, data }: PromptDataContext): string {
  if (!dimension) return '';
  const definition = MOMENTOS_DEFINITIONS[dimension];
  const dimensionNombre = dimension.charAt(0).toUpperCase() + dimension.slice(1);
  
  let criterionInfo = '';

  if (dimension === 'ser') {
    criterionInfo = `
- Categoría: ${data.categoria || 'N/A'}
- Nombre/Valor: ${data.nombre || 'N/A'}
- Redacción base: ${data.redactado || 'Sin redactar'}
    `.trim();
  } else if (dimension === 'saber' || dimension === 'hacer') {
    criterionInfo = `
- Nivel: ${data.nivel || 'N/A'}
- Subnivel: ${data.subnivel || 'N/A'}
- Verbo: ${data.verbo || 'N/A'}
- Redacción base: ${data.redactado || 'Sin redactar'}
    `.trim();
  } else if (dimension === 'decidir') {
    criterionInfo = `
- Condición: ${data.condicion || 'N/A'}
- Nombre: ${data.nombre || 'N/A'}
- Redacción base: ${data.redactado || 'Sin redactar'}
    `.trim();
  }

  return SYSTEM_PROMPT_CRITERIOS
    .replace('[DIMENSION_NOMBRE]', dimensionNombre)
    .replace('[TONO_SELECCIONADO]', tono)
    .replace('[DATOS_CRITERIO]', criterionInfo)
    .replace('[DEFINICION_DIMENSION]', definition)
    .replace('[DIMENSION_NOMBRE]', dimensionNombre);
}
