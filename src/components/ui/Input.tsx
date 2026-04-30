import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="block text-sm font-bold text-slate-700 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 outline-none transition-all duration-200',
                            'focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 focus:shadow-glow',
                            'placeholder:text-slate-400 font-medium',
                            icon && 'pl-12',
                            error && 'border-danger focus:border-danger focus:ring-danger/5',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs font-semibold text-danger ml-1 mt-1">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

