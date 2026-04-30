import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string | React.ReactNode;
    subtitle?: string;
    badge?: string;
    icon?: string;
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, subtitle, badge, icon, actions, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-12", className)}>
            <div className="flex items-center gap-4 lg:gap-6">
                {icon && (
                    <div className="size-14 lg:size-16 bg-blue-600 text-white rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-500/20 shrink-0">
                        <span className="material-symbols-rounded text-3xl lg:text-4xl">{icon}</span>
                    </div>
                )}
                <div className="space-y-1">
                    {badge && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-1">
                            {badge}
                        </div>
                    )}
                    <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-slate-500 font-medium text-sm lg:text-lg max-w-2xl leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}

