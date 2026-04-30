import React from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

interface AlertDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    isLoading?: boolean;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    isLoading = false
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch(variant) {
            case 'danger': return <XCircle className="w-10 h-10" />;
            case 'warning': return <AlertTriangle className="w-10 h-10" />;
            case 'success': return <CheckCircle2 className="w-10 h-10" />;
            default: return <Info className="w-10 h-10" />;
        }
    };

    const getColors = () => {
        switch(variant) {
            case 'danger': return "bg-rose-50 text-rose-500 shadow-rose-100/50";
            case 'warning': return "bg-amber-50 text-amber-500 shadow-amber-100/50";
            case 'success': return "bg-emerald-50 text-emerald-500 shadow-emerald-100/50";
            default: return "bg-blue-50 text-blue-500 shadow-blue-100/50";
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div 
                className="bg-white rounded-[2.5rem] shadow-[0_32px_80px_rgba(0,0,0,0.25)] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-white/40"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 pb-0 text-center">
                    <div className={cn(
                        "size-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner",
                        getColors()
                    )}>
                        {getIcon()}
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight mb-3">
                        {title}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed px-2">
                        {description}
                    </p>
                </div>

                <div className="p-8 flex flex-col sm:flex-row gap-3">
                    {cancelText !== 'hide' && (
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-none h-14"
                        >
                            {cancelText || 'Cancelar'}
                        </Button>
                    )}
                    <Button
                        variant={variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'accent'}
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className={cn(
                            "flex-1 rounded-2xl shadow-xl h-14 text-sm font-bold",
                            variant === 'danger' ? "shadow-rose-500/20 bg-rose-500 hover:bg-rose-600" : 
                            variant === 'warning' ? "shadow-amber-500/20 bg-amber-500 hover:bg-amber-600" : 
                            "shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};
