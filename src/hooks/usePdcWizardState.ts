'use client';

import { useState, useEffect } from 'react';
import { PdcService, PdcScheduleService } from '@/services/pdc.service';
import { AuthService } from '@/services/auth.service';
import { AreasService } from '@/services/areas.service';
import { CatalogService } from '@/services/catalog.service';
import { 
    AreaTrabajo, 
    PDCMaster, 
    CatalogoVerbo, 
    CatalogoComplemento, 
    UserContent, 
    LearningObjective, 
    WeekDesign, 
    PlanificacionSemanal,
    AreaDesignState,
    TonoRedaccion
} from '@/types';

export function usePdcWizardState() {
    // --- Navigation & Global UI ---
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentPdcId, setCurrentPdcId] = useState<string | null>(null);
    const [pdcName, setPdcName] = useState('');
    const [currentAreaIndex, setCurrentAreaIndex] = useState(0);
    const [areasDesignState, setAreasDesignState] = useState<Record<string, AreaDesignState>>({});

    // --- Core Master Data ---
    const [areas, setAreas] = useState<AreaTrabajo[]>([]);
    const [recentPdcs, setRecentPdcs] = useState<PDCMaster[]>([]);
    const [userProfile, setUserProfile] = useState<{ nombre_completo: string } | null>(null);
    const [mainAreaDetails, setMainAreaDetails] = useState<AreaTrabajo | null>(null);

    // --- Form State: Phase 1 (Modality & Areas) ---
    const [selectedType, setSelectedType] = useState<number | null>(null);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

    // --- Form State: Phase 2 (Schedule) ---
    const [selectedTrimestre, setSelectedTrimestre] = useState<number | null>(null);
    const [selectedMes, setSelectedMes] = useState<number | null>(null);
    const [pdcDates, setPdcDates] = useState({ inicio: '', fin: '' });
    const [pdcWeeks, setPdcWeeks] = useState<Partial<PlanificacionSemanal>[]>([]);

    // --- Form State: Phase 3 (PDC Design) ---
    const [catalogoVerbos, setCatalogoVerbos] = useState<CatalogoVerbo[]>([]);
    const [catalogoComplementos, setCatalogoComplementos] = useState<CatalogoComplemento[]>([]);
    const [availableContents, setAvailableContents] = useState<UserContent[]>([]);
    const [learningObjectives, setLearningObjectives] = useState<LearningObjective[]>([]);
    const [weekContentsMap, setWeekContentsMap] = useState<Record<number, UserContent[]>>({});
    const [objetivoNivel, setObjetivoNivel] = useState('');
    const [weekDesignState, setWeekDesignState] = useState<Record<number, WeekDesign>>({});
    const [weekPlanningIds, setWeekPlanningIds] = useState<Record<number, string>>({});
    const [periodsPerWeek, setPeriodsPerWeek] = useState<number>(0);
    const [weeklyHours, setWeeklyHours] = useState<number>(0);
    const [scheduledMonthContentIds, setScheduledMonthContentIds] = useState<string[]>([]);

    // --- Internal Selection/Interaction State ---
    const [currentObjective, setCurrentObjective] = useState({
        verboIds: [] as number[],
        contentIds: [] as number[],
        complementId: null as number | null,
        complement: '',
        draft: '',
        isManual: false
    });
    const [selectedTone, setSelectedTone] = useState<TonoRedaccion>('Academico');
    const [correctionDepth, setCorrectionDepth] = useState<string>('Sugerir moderadamente');
    const [selectedEvaluationType, setSelectedEvaluationType] = useState<string>('Evaluación Cualitativa-Cuantitativa');
    const [finalProductState, setFinalProductState] = useState('');
    const [aiOptions, setAiOptions] = useState<{ id: number, title: string, description: string, style: string }[]>([]);
    const [manualObjective, setManualObjective] = useState({
        quiero: '',
        paraQue: '',
        medire: ''
    });
    const [generatorMode, setGeneratorMode] = useState<'auto' | 'manual'>('auto');
    const [verbFilters, setVerbFilters] = useState({
        niveles: [] as string[],
        dominio: '' as string,
        profundidad: '' as string,
        detalle_tipo: '' as string
    });
    const [complementFilters, setComplementFilters] = useState({
        niveles: [] as string[],
        categoria: '' as string,
        subcategoria: '' as string
    });
    const [showFilters, setShowFilters] = useState(false);
    const [showCompFilters, setShowCompFilters] = useState(false);
    const [hoveredVerb, setHoveredVerb] = useState<CatalogoVerbo | null>(null);
    const [expandedTitles, setExpandedTitles] = useState<number[]>([]);
    const [selectedCompCategory, setSelectedCompCategory] = useState<string>('');
    const [complementSearch, setComplementSearch] = useState<string>('');
    const [hoveredComplement, setHoveredComplement] = useState<CatalogoComplemento | null>(null);
    const [editingObjectiveIndex, setEditingObjectiveIndex] = useState<number | null>(null);
    const [originalObjectiveText, setOriginalObjectiveText] = useState<string | null>(null);

    return {
        // Step & Flow
        step, setStep,
        loading, setLoading,
        saving, setSaving,
        currentPdcId, setCurrentPdcId,
        pdcName, setPdcName,
        currentAreaIndex, setCurrentAreaIndex,
        areasDesignState, setAreasDesignState,

        // Core Data
        areas, setAreas,
        recentPdcs, setRecentPdcs,
        userProfile, setUserProfile,
        mainAreaDetails, setMainAreaDetails,

        // Fields
        selectedType, setSelectedType,
        selectedAreas, setSelectedAreas,
        selectedTrimestre, setSelectedTrimestre,
        selectedMes, setSelectedMes,
        pdcDates, setPdcDates,
        pdcWeeks, setPdcWeeks,

        // PDC Design
        catalogoVerbos, setCatalogoVerbos,
        catalogoComplementos, setCatalogoComplementos,
        availableContents, setAvailableContents,
        learningObjectives, setLearningObjectives,
        weekContentsMap, setWeekContentsMap,
        objetivoNivel, setObjetivoNivel,
        weekDesignState, setWeekDesignState,
        weekPlanningIds, setWeekPlanningIds,
        periodsPerWeek, setPeriodsPerWeek,
        weeklyHours, setWeeklyHours,

        // Interaction State
        currentObjective, setCurrentObjective,
        aiOptions, setAiOptions,
        manualObjective, setManualObjective,
        generatorMode, setGeneratorMode,
        verbFilters, setVerbFilters,
        complementFilters, setComplementFilters,
        showFilters, setShowFilters,
        showCompFilters, setShowCompFilters,
        hoveredVerb, setHoveredVerb,
        expandedTitles, setExpandedTitles,
        selectedCompCategory, setSelectedCompCategory,
        complementSearch, setComplementSearch,
        hoveredComplement, setHoveredComplement,
        scheduledMonthContentIds, setScheduledMonthContentIds,
        editingObjectiveIndex, setEditingObjectiveIndex,
        originalObjectiveText, setOriginalObjectiveText,
        selectedTone, setSelectedTone,
        correctionDepth, setCorrectionDepth,
        selectedEvaluationType, setSelectedEvaluationType,
        finalProductState, setFinalProductState
    };
}
