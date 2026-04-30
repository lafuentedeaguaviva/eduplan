import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, icon, children, disabled, ...props }, ref) => {
        const variants = {
            primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-soft',
            secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm',
            accent: 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20',
            outline: 'bg-transparent border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
            ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700',
            danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-500/20',
            success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20',
            warning: 'bg-amber-500 text-white hover:bg-amber-600 shadow-xl shadow-amber-500/20',
        };

        const sizes = {
            sm: 'h-9 px-4 text-xs',
            md: 'h-11 px-6 text-sm',
            lg: 'h-14 px-8 text-base',
            xl: 'h-16 px-10 text-lg',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    'inline-flex items-center justify-center rounded-2xl font-black uppercase tracking-widest transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <div className="size-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : icon ? (
                    <span className="mr-2.5 flex items-center justify-center">{icon}</span>
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

