'use client';

import React from 'react';
import { TabType } from '@/hooks/useMomentosProceso';
import { 
    Activity, 
    BookOpen, 
    Layout, 
    Target, 
    Accessibility, 
    Box, 
    Link, 
    ListTodo 
} from 'lucide-react';

interface MomentoTabsProps {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    momentos: readonly {
        id: TabType;
        label: string;
        icon: string;
        color: string;
        bg: string;
        text: string;
    }[];
}

const ICON_MAP: Record<string, any> = {
    practica: Activity,
    teoria: BookOpen,
    produccion: Layout,
    valoracion: Target,
    adaptaciones: Accessibility,
    recursos: Box,
    fuentes: Link,
    proceso: ListTodo
};

export function MomentoTabs({ activeTab, setActiveTab, momentos }: MomentoTabsProps) {
    return (
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 p-3 flex items-center justify-between w-full gap-2">
            {momentos.map(m => {
                const isActive = activeTab === m.id;
                const Icon = ICON_MAP[m.id as string] || Activity;
                
                return (
                    <button
                        key={m.id}
                        onClick={() => setActiveTab(m.id)}
                        className={`flex-1 flex flex-col items-center justify-center gap-2 py-3.5 rounded-2xl transition-all duration-500 min-w-0 relative group ${isActive
                            ? `${m.bg} ${m.text} shadow-xl shadow-current/5 font-black scale-105 z-10`
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-bold'
                            }`}
                    >
                        <div className={`transition-all duration-500 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                            <Icon className={`w-5 h-5 ${isActive ? m.text : 'text-slate-300'}`} strokeWidth={isActive ? 3 : 2} />
                        </div>
                        <span className={`text-[10px] leading-tight text-center uppercase tracking-[0.1em] px-1 font-bold ${isActive ? m.text : 'text-slate-400'}`}>
                            {m.label}
                        </span>
                        {isActive && (
                            <div className="absolute bottom-1 w-6 h-1 rounded-full bg-current opacity-30" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
