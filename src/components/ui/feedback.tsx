import { Button } from './Button';

interface FeedbackProps {
    title: string;
    description: string;
    variant?: 'error' | 'success' | 'info' | 'warning';
    icon?: string;
    onRetry?: () => void;
    onClose?: () => void;
    retryLabel?: string;
    className?: string;
    children?: React.ReactNode;
}

const variantStyles = {
    error: {
        bg: 'bg-rose-50',
        icon: 'text-rose-500',
        iconBg: 'bg-rose-100',
        defaultIcon: 'error_outline'
    },
    success: {
        bg: 'bg-emerald-50',
        icon: 'text-emerald-500',
        iconBg: 'bg-emerald-100',
        defaultIcon: 'check_circle'
    },
    warning: {
        bg: 'bg-amber-50',
        icon: 'text-amber-500',
        iconBg: 'bg-amber-100',
        defaultIcon: 'warning'
    },
    info: {
        bg: 'bg-slate-50',
        icon: 'text-slate-500',
        iconBg: 'bg-slate-100',
        defaultIcon: 'info'
    }
};

export function Feedback({
    title,
    description,
    variant = 'info',
    icon,
    onRetry,
    onClose,
    retryLabel = 'Reintentar',
    className = '',
    children,
}: FeedbackProps) {
    const styles = variantStyles[variant];
    const displayIcon = icon || styles.defaultIcon;

    return (
        <div className={`relative flex flex-col items-center justify-center py-10 px-6 text-center animate-in fade-in zoom-in duration-300 rounded-3xl ${styles.bg} ${className}`}>
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <span className="material-symbols-rounded">close</span>
                </button>
            )}
            <div className={`size-14 ${styles.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                <span className={`material-symbols-rounded ${styles.icon} text-3xl`}>{displayIcon}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">{description}</p>

            <div className="flex gap-3">
                {onRetry && (
                    <Button onClick={onRetry} variant="outline" className="w-auto px-6 border-slate-200">
                        {retryLabel}
                    </Button>
                )}
                {onClose && !onRetry && (
                    <Button onClick={onClose} className="w-auto px-8 bg-slate-900 hover:bg-slate-800 text-white">
                        Entendido
                    </Button>
                )}
            </div>
            {children}
        </div>
    );
}

