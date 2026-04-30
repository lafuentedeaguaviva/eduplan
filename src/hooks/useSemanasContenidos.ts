'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePdcWizard } from '@/contexts/PdcWizardContext';

export function useSemanasContenidos() {
    const {
        pdcDates,
        weekContentsMap,
        learningObjectives,
        selectedType,
        isContentCovered
    } = usePdcWizard();

    const typeConfig = {
        1: { color: 'rose', accent: 'rose-600', light: 'rose-50' },
        2: { color: 'amber', accent: 'amber-600', light: 'amber-50' },
        3: { color: 'indigo', accent: 'indigo-600', light: 'indigo-50' },
        4: { color: 'emerald', accent: 'emerald-600', light: 'emerald-50' },
    }[selectedType || 2] || { color: 'slate', accent: 'slate-600', light: 'slate-50' };

    // Mostrar todos los contenidos programados para la semana
    const filteredWeekContentsMap: Record<number, any[]> = {};
    Object.entries(weekContentsMap).forEach(([week, contents]) => {
        filteredWeekContentsMap[Number(week)] = contents || [];
    });

    const hasWeeks = Object.keys(weekContentsMap).length > 0;
    const sortedWeekKeys = useMemo(() => 
        Object.keys(weekContentsMap).sort((a, b) => Number(a) - Number(b)),
    [weekContentsMap]);

    const [activeWeek, setActiveWeek] = useState<number>(1);

    // Sincronizar la semana activa cuando se cargan las semanas o cambia el mes
    useEffect(() => {
        if (hasWeeks && sortedWeekKeys.length > 0) {
            // Intentar mantener la semana activa si existe en el nuevo mapa
            // o seleccionar la primera disponible si la actual ya no es válida
            const weekStr = String(activeWeek);
            if (!sortedWeekKeys.includes(weekStr)) {
                setActiveWeek(Number(sortedWeekKeys[0]));
            }
        }
    }, [hasWeeks, sortedWeekKeys, activeWeek]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '--/--';
        try {
            return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        } catch (e) {
            return dateStr;
        }
    };

    return {
        pdcDates,
        weekContentsMap: filteredWeekContentsMap,
        learningObjectives,
        typeConfig,
        hasWeeks,
        sortedWeekKeys,
        activeWeek,
        setActiveWeek,
        formatDate
    };
}
