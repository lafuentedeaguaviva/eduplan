'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Star } from 'lucide-react';

interface RevisionBannerProps {
    moduleId: string;
    activeRevision: any;
}

export function RevisionBanner({ moduleId, activeRevision }: RevisionBannerProps) {
    if (!activeRevision || !activeRevision.observaciones) return null;

    const observations = activeRevision.observaciones;
    const item = (observations.matrix && observations.matrix[moduleId]);

    // Si no hay observación para este módulo y la nota es perfecta, no mostramos nada
    if (!item || (item.score === 5 && !item.comment)) return null;

    return (
        <div className={cn(
            "mb-6 p-6 rounded-[2rem] border transition-all animate-in slide-in-from-top-4 duration-500",
            item.score < 5 
                ? "bg-rose-50 border-rose-100 shadow-lg shadow-rose-500/5" 
                : "bg-amber-50 border-amber-100 shadow-lg shadow-amber-500/5"
        )}>
            <div className="flex items-start gap-4">
                <div className={cn(
                    "size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                    item.score < 5 ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                )}>
                    <AlertCircle className="size-6" />
                </div>
                <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                        <p className={cn(
                            "text-xs font-black uppercase tracking-widest",
                            item.score < 5 ? "text-rose-600" : "text-amber-600"
                        )}>
                            Observación del Director
                        </p>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star 
                                    key={s} 
                                    className={cn(
                                        "size-3", 
                                        s <= item.score 
                                            ? (item.score < 5 ? "fill-rose-500 text-rose-500" : "fill-amber-500 text-amber-500") 
                                            : "text-slate-300"
                                    )} 
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                        "{item.comment || 'Se requiere revisión de este módulo.'}"
                    </p>
                </div>
            </div>
        </div>
    );
}
