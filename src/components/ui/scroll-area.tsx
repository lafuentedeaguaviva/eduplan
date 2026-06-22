'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaProps {
    children: React.ReactNode;
    className?: string;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ children, className }) => {
    return (
        <div className={cn("overflow-y-auto custom-scrollbar", className)}>
            {children}
        </div>
    );
};
