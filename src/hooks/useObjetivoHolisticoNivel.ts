'use client';

import { usePdcWizard } from '@/contexts/PdcWizardContext';

export function useObjetivoHolisticoNivel() {
    const { objetivoNivel, selectedType } = usePdcWizard();

    const typeConfig = {
        1: { color: 'rose', text: 'Inicial', icon: 'child_care' },
        2: { color: 'amber', text: 'Primaria', icon: 'school' },
        3: { color: 'indigo', text: 'Secundaria', icon: 'menu_book' },
        4: { color: 'emerald', text: 'Multigrado', icon: 'group_work' },
    }[selectedType || 2] || { color: 'slate', text: 'Desconocido', icon: 'help' };

    const colorClasses = {
        rose: 'text-rose-600 bg-rose-50 border-rose-100',
        amber: 'text-amber-600 bg-amber-50 border-amber-100',
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        slate: 'text-slate-600 bg-slate-50 border-slate-100',
    }[typeConfig.color];

    const backgroundClass = {
        rose: 'bg-rose-50/50',
        amber: 'bg-amber-50/50',
        indigo: 'bg-indigo-50/50',
        emerald: 'bg-emerald-50/50',
        slate: 'bg-slate-50/50',
    }[typeConfig.color];

    return {
        objetivoNivel,
        typeConfig,
        colorClasses,
        backgroundClass,
    };
}
