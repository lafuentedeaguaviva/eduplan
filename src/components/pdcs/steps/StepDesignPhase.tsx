'use client';

import React from 'react';
import { usePdcWizard } from '@/contexts/PdcWizardContext';

// Step Components
import { DataReferential } from './design/DataReferential';
import { ObjetivoHolisticoNivel } from './design/ObjetivoHolisticoNivel';
import { ObjetivosAprendizaje } from './design/ObjetivosAprendizaje';
import { SemanasContenidos } from './design/SemanasContenidos';
import { MomentosProceso } from './design/MomentosProceso';
import { Step9CriteriosEvaluacion } from './design/Step9CriteriosEvaluacion';
import { ProductoFinal } from './design/ProductoFinal';
import { Step9PeriodsWorkload } from './design/Step9PeriodsWorkload';
import { Step10AIFinalization } from './design/Step10AIFinalization';
import { Step12FinalPreview } from './design/Step12EvaluationType';

export function StepDesignPhase() {
    const { step } = usePdcWizard();

    return (
        <div className="w-full">
            {step === 4 && (
                <div key="step-4">
                    <DataReferential />
                </div>
            )}

            {step === 5 && (
                <div key="step-5">
                    <ObjetivoHolisticoNivel />
                </div>
            )}

            {step === 6 && (
                <div key="step-6">
                    <ObjetivosAprendizaje />
                </div>
            )}

            {step === 7 && (
                <div key="step-7">
                    <SemanasContenidos />
                </div>
            )}

            {step === 8 && (
                <div key="step-8">
                    <MomentosProceso />
                </div>
            )}

            {step === 9 && (
                <div key="step-9">
                    <Step9CriteriosEvaluacion />
                </div>
            )}

            {step === 10 && (
                <div key="step-10">
                    <Step9PeriodsWorkload />
                </div>
            )}

            {step === 11 && (
                <div key="step-11">
                    <Step10AIFinalization />
                </div>
            )}

            {step === 12 && (
                    <Step12FinalPreview />
            )}
        </div>
    );
}
