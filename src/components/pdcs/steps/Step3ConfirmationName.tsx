'use client';

import React from 'react';
import { useStep3ConfirmationName } from '@/hooks/useStep3ConfirmationName';
import { ProjectNameInput } from './components/ProjectNameInput';

export function Step3ConfirmationName() {
    const { pdcName, setPdcName } = useStep3ConfirmationName();

    return (
        <div className="max-w-4xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <ProjectNameInput pdcName={pdcName} setPdcName={setPdcName} />
        </div>
    );
}
