'use client';

import { usePdcWizard } from '@/contexts/PdcWizardContext';

export function useStep3ConfirmationName() {
    const { pdcName, setPdcName } = usePdcWizard();

    return {
        pdcName,
        setPdcName,
    };
}
