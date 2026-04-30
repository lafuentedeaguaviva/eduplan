'use client';

import { usePdcWizard } from '@/contexts/PdcWizardContext';

export function useStep9PeriodsWorkload() {
    const {
        periodsPerWeek,
        setPeriodsPerWeek,
        selectedType,
        savePeriods
    } = usePdcWizard();

    const typeConfig = {
        1: { color: 'rose', accent: 'rose-600', light: 'rose-50' },
        2: { color: 'amber', accent: 'amber-600', light: 'amber-50' },
        3: { color: 'indigo', accent: 'indigo-600', light: 'indigo-50' },
        4: { color: 'emerald', accent: 'emerald-600', light: 'emerald-50' },
    }[selectedType || 2] || { color: 'slate', accent: 'slate-600', light: 'slate-50' };

    return {
        periodsPerWeek,
        setPeriodsPerWeek,
        savePeriods,
        typeConfig,
    };
}
