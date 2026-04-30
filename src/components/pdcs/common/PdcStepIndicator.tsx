import React from 'react';
import { Check } from 'lucide-react';

export function PdcStepIndicator({ currentStep, totalSteps, className = "" }: PdcStepIndicatorProps) {
    return (
        <div className={`flex items-center gap-1.5 p-1 bg-white/40 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-sm ${className}`}>
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => {
                const isActive = s === currentStep;
                const isCompleted = s < currentStep;

                return (
                    <React.Fragment key={s}>
                        <div
                            className={`
                                size-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-500
                                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110 z-10'
                                    : isCompleted
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        : 'bg-white text-slate-300 border border-slate-100'
                                }
                            `}
                        >
                            {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : s}
                        </div>
                        {s < totalSteps && (
                            <div className={`w-3 h-0.5 rounded-full ${isCompleted ? 'bg-emerald-200' : 'bg-slate-100'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

