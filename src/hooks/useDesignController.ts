'use client';

import { useState } from 'react';
import { 
    LearningObjective, 
    UserContent, 
    WeekDesign, 
    AreaDesignState 
} from '@/types';

const EMPTY_ARRAY: any[] = [];
const EMPTY_OBJECT: any = {};

/**
 * Controller: useDesignController
 * 
 * Gestiona el estado del diseño pedagógico (Objetivos, Momentos, Criterios)
 * con aislamiento estricto por Área utilizando el patrón de "Isolation by Key".
 */
export function useDesignController() {
    // Estado principal indexado por AreaID
    const [availableContents, setAvailableContents] = useState<Record<string, UserContent[]>>({});
    const [learningObjectives, setLearningObjectives] = useState<Record<string, LearningObjective[]>>({});
    const [weekContentsMap, setWeekContentsMap] = useState<Record<string, Record<number, UserContent[]>>>({});
    const [weekDesignState, setWeekDesignState] = useState<Record<string, Record<number, WeekDesign>>>({});
    const [weekPlanningIds, setWeekPlanningIds] = useState<Record<string, Record<number, string>>>({});
    const [objetivoNivel, setObjetivoNivel] = useState('');

    /**
     * Limpia el estado de diseño por completo (al crear nuevo PDC)
     */
    const resetDesignState = () => {
        setAvailableContents({});
        setLearningObjectives({});
        setWeekContentsMap({});
        setWeekDesignState({});
        setWeekPlanningIds({});
        setObjetivoNivel('');
    };

    /**
     * Limpia el estado de una área específica si es necesario forzar recarga
     */
    const clearAreaState = (areaId: string) => {
        setAvailableContents(prev => { const n = {...prev}; delete n[areaId]; return n; });
        setLearningObjectives(prev => { const n = {...prev}; delete n[areaId]; return n; });
        setWeekContentsMap(prev => { const n = {...prev}; delete n[areaId]; return n; });
        setWeekDesignState(prev => { const n = {...prev}; delete n[areaId]; return n; });
        setWeekPlanningIds(prev => { const n = {...prev}; delete n[areaId]; return n; });
    };

    /**
     * Helpers para obtener datos de la vista activa (Shorthands para componentes)
     */
    const getAreaContents = (areaId: string) => availableContents[areaId] || EMPTY_ARRAY;
    const getAreaObjectives = (areaId: string) => learningObjectives[areaId] || EMPTY_ARRAY;
    const getAreaWeekContents = (areaId: string) => weekContentsMap[areaId] || EMPTY_OBJECT;
    const getAreaWeekDesign = (areaId: string) => weekDesignState[areaId] || EMPTY_OBJECT;
    const getAreaPlanningIds = (areaId: string) => weekPlanningIds[areaId] || EMPTY_OBJECT;

    return {
        // Raw States (para el Context)
        availableContents, setAvailableContents,
        learningObjectives, setLearningObjectives,
        weekContentsMap, setWeekContentsMap,
        weekDesignState, setWeekDesignState,
        weekPlanningIds, setWeekPlanningIds,
        objetivoNivel, setObjetivoNivel,

        // Actions
        resetDesignState,
        clearAreaState,

        // Shorthands
        getAreaContents,
        getAreaObjectives,
        getAreaWeekContents,
        getAreaWeekDesign,
        getAreaPlanningIds
    };
}
