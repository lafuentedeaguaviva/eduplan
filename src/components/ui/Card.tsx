import { HTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'flat' | 'glass' | 'elevated' | 'outline';
    hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'elevated', hoverable = false, children, ...props }, ref) => {
        const variants = {
            flat: 'bg-white',
            glass: 'bg-white/70 backdrop-blur-xl border border-white/40',
            elevated: 'bg-white shadow-soft border border-slate-100',
            outline: 'bg-transparent border border-slate-200',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-[2rem] p-6 transition-all duration-300',
                    variants[variant],
                    hoverable && 'hover:shadow-medium hover:scale-[1.01] hover:border-blue-100',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

