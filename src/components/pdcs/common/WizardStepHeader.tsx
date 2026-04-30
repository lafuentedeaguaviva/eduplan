'use client';

import React from 'react';

interface WizardStepHeaderProps {
    stepNumber: number;
    title: string;
    description: string;
    icon: string;
    gradient?: string;
    badgeColor?: string;
    children?: React.ReactNode;
}

export function WizardStepHeader({
    stepNumber,
    title,
    description,
    icon,
    gradient = 'from-blue-500/40 via-cyan-500/20 to-transparent',
    badgeColor = 'from-blue-600 to-cyan-500',
    children
}: WizardStepHeaderProps) {
    return (
        <div className="bg-slate-950 p-12 rounded-[4rem] text-white shadow-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 group mb-12">
            {/* Master Glows */}
            <div className={`absolute top-0 right-0 size-96 bg-gradient-to-br ${gradient} rounded-full blur-[100px] -mr-32 -mt-32 opacity-50`}></div>
            <div className="absolute bottom-0 left-0 size-80 bg-gradient-to-tr from-slate-800/20 via-slate-900/10 to-transparent rounded-full blur-[90px] -ml-24 -mb-24"></div>

            <div className="relative z-10 space-y-5 text-center md:text-left flex-1">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                    <span className={`px-5 py-2 bg-gradient-to-r ${badgeColor} text-white rounded-full text-[10px] font-black uppercase tracking-[0.25em] shadow-xl border border-white/20`}>
                        Fase {stepNumber}
                    </span>
                    <div className="h-px w-8 bg-white/20 rounded-full"></div>
                </div>

                <h3 className="text-4xl md:text-6xl font-black tracking-tight leading-tight uppercase italic">
                    {title.split(' ').map((word, i) => (
                        <React.Fragment key={i}>
                            {i === title.split(' ').length - 1 ? (
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 drop-shadow-sm">
                                    {word}
                                </span>
                            ) : (
                                word + ' '
                            )}
                        </React.Fragment>
                    ))}
                </h3>

                <p className="text-slate-400 text-sm font-medium max-w-xl leading-relaxed italic">
                    {description}
                </p>
            </div>

            <div className="relative z-10 flex items-center gap-6">
                {children}
                <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 backdrop-blur-sm hidden lg:block hover:scale-110 transition-transform duration-500">
                    <span className="material-symbols-rounded text-7xl text-white/20">{icon}</span>
                </div>
            </div>
        </div>
    );
}

