'use client';

/**
 * View: NewPdcPage
 * 
 * Punto de entrada para la creación de un nuevo PDC.
 * Implementa el patrón MVC delegando la lógica al controlador usePdcWizardController
 * y la interfaz a componentes modulares por pasos.
 */

import { PdcWizardProvider, usePdcWizard } from '@/contexts/PdcWizardContext';
import { Step1ModalidadAreas } from '@/components/pdcs/steps/Step1ModalidadAreas';
import { Step2CronogramaFechas } from '@/components/pdcs/steps/Step2CronogramaFechas';
import { Step3ConfirmationName } from '@/components/pdcs/steps/Step3ConfirmationName';
import { StepDesignPhase } from '@/components/pdcs/steps/StepDesignPhase';
import { PdcStepIndicator } from '@/components/pdcs/common/PdcStepIndicator';
import { Button } from '@/components/ui/Button';
import { Suspense } from 'react';

/**
 * Main entry point: Wraps the content with the Controller (PdcWizardProvider)
 */
export default function NewPdcPage() { console.log('Rendering NewPdcPage!');
    return (
        <Suspense fallback={<p>Cargando...</p>}>
            <PdcWizardProvider>
                <NewPdcContent />
            </PdcWizardProvider>
        </Suspense>
    );
}

import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

function NewPdcContent() {
    const context = usePdcWizard();
    const {
        step,
        loading,
        saving,
        handleNext,
        handleBack,
        getStepName,
        getTotalSteps,
        currentAreaIndex,
        selectedAreas,
        areas,
        areasDesignState,
        jumpToArea,
    } = context;

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8">
                <div className="relative">
                    <div className="size-24 border-[6px] border-slate-100 border-t-blue-600 rounded-[2.5rem] animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                </div>
                <div className="text-center space-y-3">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Preparando tu asistente</h2>
                    <p className="text-slate-400 font-medium text-lg">Configurando el entorno pedagógico de alta fidelidad...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header / Navigation */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-3xl border-b border-slate-200/50 px-6 py-4 transition-all duration-300 shadow-sm">
                <div className="max-w-[1700px] mx-auto w-full flex items-center justify-between gap-10">
                    <div className="flex items-center gap-8">
                        {/* Interactive Navigation Group */}
                        <div className="flex items-center gap-6 bg-slate-50/50 p-2.5 rounded-[2.5rem] border border-slate-200/60 shadow-sm backdrop-blur-xl group/nav hover:border-blue-200/50 transition-all duration-500">
                            {step !== 4 && (
                                <button
                                    onClick={handleBack}
                                    className="size-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm transition-all hover:border-blue-500 hover:text-blue-600 hover:shadow-xl hover:shadow-blue-500/10 active:scale-95 group/back"
                                    title="Volver"
                                >
                                    <ArrowLeft className="w-6 h-6 group-hover/back:-translate-x-1 transition-transform" />
                                </button>
                            )}

                            <div className="flex flex-col gap-4 px-4">
                                <div className="flex flex-col gap-1 min-w-[320px]">
                                    <h1 className="text-xl font-black text-blue-950 tracking-tighter leading-none uppercase truncate">
                                        {getStepName().includes(':') ? getStepName().split(':')[1].trim() : getStepName()}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <div className="size-1.5 bg-blue-500 rounded-full animate-pulse" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Asistente de Planificación PDC</p>
                                    </div>
                                </div>
                                <PdcStepIndicator
                                    currentStep={step}
                                    totalSteps={getTotalSteps()}
                                    className="scale-100 origin-left"
                                />
                            </div>

                            <Button
                                onClick={handleNext}
                                disabled={saving}
                                className="h-14 px-10 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-2xl gap-4 shadow-2xl shadow-blue-500/30 transition-all active:scale-95 group/next disabled:opacity-50 text-sm uppercase tracking-widest"
                            >
                                {saving ? (
                                    <div className="size-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>{step === 12 ? 'FINALIZAR' : 'Continuar'}</span>
                                        <div className="size-9 bg-white/20 text-white rounded-xl flex items-center justify-center group-hover/next:translate-x-1 transition-transform">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Area Selector - Refined positioning */}
                </div>

                {/* Second Row: Area Selector - Now more prominent and 'lower' */}
                {step >= 4 && step < 11 && selectedAreas.length > 1 && (
                    <div className="max-w-[1700px] mx-auto w-full mt-4 animate-in slide-in-from-top-2 duration-500">
                        <div className="flex items-center gap-3 p-1.5 bg-slate-100/30 rounded-[2rem] border border-slate-200/40 w-fit">
                            <div className="pl-4 pr-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200/60">
                                Áreas en planificación
                            </div>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[1200px] py-0.5">
                                {selectedAreas.map((areaId, originalIdx) => {
                                    const areaData = areas.find(a => a.id === areaId);
                                    const isActive = currentAreaIndex === originalIdx;
                                    const isDone = !!areasDesignState[areaId]?.learningObjectives?.length;

                                    return (
                                        <button
                                            key={areaId}
                                            onClick={() => jumpToArea(originalIdx)}
                                            className={`px-6 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap group/area relative ${isActive
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105 z-10'
                                                : 'bg-white/50 text-slate-500 hover:text-blue-600 hover:bg-white border border-slate-200/50'
                                                }`}
                                        >
                                            <span className="relative z-10">{areaData?.area_conocimiento?.nombre || '...'}</span>
                                            {isDone && !isActive && (
                                                <CheckCircle2 className="size-3 text-emerald-500" />
                                            )}
                                            {isActive && (
                                                <div className="size-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
                </div>

            {/* Main Content Area */}
            <main className="max-w-[1800px] mx-auto px-12 pt-20">
                <div className="relative animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
                    {step === 1 && <Step1ModalidadAreas />}
                    {step === 2 && <Step2CronogramaFechas />}
                    {step === 3 && <Step3ConfirmationName />}
                    {step >= 4 && <StepDesignPhase />}
                </div>
            </main>
        </div>
    );
}

