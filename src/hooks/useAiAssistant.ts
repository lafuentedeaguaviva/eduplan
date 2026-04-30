"use client";

import { useAi } from "../contexts/AiContext";
import { useCallback } from "react";

/**
 * Hook especializado para usar el asistente de IA en diferentes partes de la app.
 */
export function useAiAssistant() {
  const { generate, quota, isLoading } = useAi();

  /**
   * Genera redactados para momentos formativos (Práctica, Teoría, etc.)
   */
  const generateMomentDraft = useCallback(
    async (type: string, contents: string[], context?: string) => {
      const prompt = `Como experto pedagogo, redacta un momento de ${type.toUpperCase()} para un Plan de Desarrollo Curricular (PDC). 
      Contenidos: ${contents.join(", ")}.
      ${context ? `Contexto adicional: ${context}` : ""}
      El redactado debe ser profesional, coherente con el modelo educativo boliviano y estar listo para usar.`;
      
      return await generate(prompt, "Eres un asistente experto en el Modelo Educativo Sociocomunitario Productivo de Bolivia.");
    },
    [generate]
  );

  /**
   * Sugiere criterios de evaluación (Ser, Saber, Hacer, Decidir)
   */
  const suggestEvaluationCriteria = useCallback(
    async (dimension: string, contents: string[]) => {
      const prompt = `Genera un criterio de evaluación para la dimensión ${dimension.toUpperCase()} basado en: ${contents.join(", ")}.
      Debe estar redactado en tercera persona, ser medible y coherente.`;
      
      return await generate(prompt, "Asistente pedagógico para evaluación curricular.");
    },
    [generate]
  );

  /**
   * Sugiere un objetivo holístico
   */
  const suggestHolisticObjective = useCallback(
    async (nivel: string, area: string, contenidos: string[]) => {
      const prompt = `Redacta un Objetivo Holístico para el nivel ${nivel}, área ${area}.
      Contenidos a cubrir: ${contenidos.join(", ")}.
      Sigue la estructura: Ser (valores), Saber (conocimientos), Hacer (procedimientos), Decidir (impacto social).`;
      
      return await generate(prompt, "Experto en redacción de objetivos holísticos bolivianos.");
    },
    [generate]
  );

  return {
    generateMomentDraft,
    suggestEvaluationCriteria,
    suggestHolisticObjective,
    quota,
    isLoading,
  };
}
