import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.PropsWithChildren {
    variant?: 'default' | 'accent' | 'outline' | 'success' | 'warning' | 'error';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className
}) => {
    const variants: Record<string, string> = {
        default: 'bg-slate-100 text-slate-600',
        accent: 'bg-blue-600/10 text-blue-600',
        outline: 'border border-slate-200 text-slate-400 bg-white/50',
        success: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
        warning: 'bg-amber-50 text-amber-600 border border-amber-100',
        error: 'bg-rose-50 text-rose-600 border border-rose-100'
    };

    return (
        <span className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] inline-flex items-center justify-center transition-all",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};

