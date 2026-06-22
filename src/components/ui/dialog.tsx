'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children, className }) => {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                        onClick={() => onOpenChange(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={cn(
                            "relative w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20",
                            className
                        )}
                    >
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export const DialogContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("relative flex flex-col h-full", className)}>
        {children}
    </div>
);

export const DialogHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("p-6 border-b border-slate-100", className)}>
        {children}
    </div>
);

export const DialogTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <h3 className={cn("text-xl font-black text-slate-900", className)}>
        {children}
    </h3>
);

export const DialogDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("text-slate-500", className)}>
        {children}
    </div>
);

export const DialogFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("p-6 border-t border-slate-100 flex justify-end gap-3", className)}>
        {children}
    </div>
);
