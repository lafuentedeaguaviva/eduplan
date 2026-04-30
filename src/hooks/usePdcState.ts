'use client';

import { useState } from 'react';
import { PDCMaster, PlanificacionSemanal } from '@/types';

/**
 * Controller: usePdcState
 * 
 * Gestiona el estado atómico de los metadatos de un PDC.
 * Este hook es agnóstico del diseño interno de las áreas.
 */
export function usePdcState() {
    const [currentPdcId, setCurrentPdcId] = useState<string | null>(null);
    const [pdcName, setPdcName] = useState('');
    const [selectedType, setSelectedType] = useState<number | null>(null);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [selectedTrimestre, setSelectedTrimestre] = useState<number | null>(null);
    const [selectedMes, setSelectedMes] = useState<number | null>(null);
    const [pdcDates, setPdcDates] = useState({ inicio: '', fin: '' });
    const [pdcWeeks, setPdcWeeks] = useState<Partial<PlanificacionSemanal>[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const resetPdcState = () => {
        setCurrentPdcId(null);
        setPdcName('');
        setSelectedType(null);
        setSelectedAreas([]);
        setSelectedTrimestre(null);
        setSelectedMes(null);
        setPdcDates({ inicio: '', fin: '' });
        setPdcWeeks([]);
    };

    const loadPdcMetadata = (pdc: PDCMaster) => {
        setCurrentPdcId(pdc.id);
        setPdcName(pdc.nombre_pdc || '');
        setSelectedType(pdc.tipo_pdc_id);
        setSelectedTrimestre(pdc.trimestre ?? null);
        setSelectedMes(pdc.mes ?? null);
        setPdcDates({ 
            inicio: pdc.fecha_inicio || '', 
            fin: pdc.fecha_fin || '' 
        });
        
        // Cargar IDs de áreas desde la relación persistente
        const areaIds = pdc.areas_trabajo?.map(a => a.id) || [];
        setSelectedAreas(areaIds);
    };

    return {
        currentPdcId, setCurrentPdcId,
        pdcName, setPdcName,
        selectedType, setSelectedType,
        selectedAreas, setSelectedAreas,
        selectedTrimestre, setSelectedTrimestre,
        selectedMes, setSelectedMes,
        pdcDates, setPdcDates,
        pdcWeeks, setPdcWeeks,
        loading, setLoading,
        saving, setSaving,
        resetPdcState,
        loadPdcMetadata
    };
}
