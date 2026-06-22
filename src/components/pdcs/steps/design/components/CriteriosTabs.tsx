'use client';

import React from 'react';
import { EvaluacionTab } from '@/hooks/useCriteriosEvaluacion';
import { 
    Heart, 
    BookOpen, 
    Wrench, 
    Accessibility,
    ChevronRight
} from 'lucide-react';

interface CriteriosTabsProps {
    activeTab: EvaluacionTab;
    onTabChange: (tab: EvaluacionTab) => void;
}

export const TAB_CONFIG: Record<EvaluacionTab, { label: string; icon: any; color: string; bg: string; description: string }> = {
    ser: {
        label: 'Dimensión SER',
        description: 'Actitudes y valores',
        icon: Heart,
        color: 'text-fuchsia-600',
        bg: 'bg-fuchsia-50'
    },
    saber: {
        label: 'Dimensión SABER',
        description: 'Conocimientos teóricos',
        icon: BookOpen,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
    },
    hacer: {
        label: 'Dimensión HACER',
        description: 'Habilidades prácticas',
        icon: Wrench,
        color: 'text-amber-600',
        bg: 'bg-amber-50'
    },
    adaptacion: {
        label: 'ADAPTACIÓN (S)',
        description: 'Especiales / Significativas',
        icon: Accessibility,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50'
    },
    adaptacion_no_sig: {
        label: 'ADAPTACIÓN (NS)',
        description: 'No Significativas',
        icon: ChevronRight,
        color: 'text-slate-600',
        bg: 'bg-slate-100'
    }
};

export const CriteriosTabs: React.FC<CriteriosTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-2">
            {(Object.entries(TAB_CONFIG) as [EvaluacionTab, typeof TAB_CONFIG['ser']][])
                .filter(([key]) => key !== 'adaptacion_no_sig' && key !== 'adaptacion')
                .map(([key, config]) => {
                const isActive = activeTab === key;
                const Icon = config.icon;
                
                return (
                    <button
                        key={key}
                        onClick={() => onTabChange(key)}
                        className={`
                            group relative flex flex-col items-start p-4 rounded-[2rem] transition-all duration-500 border-2
                            ${isActive
                                ? 'bg-white border-slate-100 shadow-2xl shadow-slate-200/50 scale-[1.02] z-10'
                                : 'bg-slate-50/50 border-transparent hover:border-slate-200 hover:bg-white grayscale opacity-60 hover:opacity-100 hover:grayscale-0'
                            }
                        `}
                    >
                        <div className={`size-12 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 shadow-sm border border-white`}>
                            <Icon className="w-6 h-6" />
                        </div>

                        <div className="text-left">
                            <span className={`block text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                                {config.label}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
                                {config.description}
                            </span>
                        </div>

                        {isActive && (
                            <div className="absolute top-4 right-4 size-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
