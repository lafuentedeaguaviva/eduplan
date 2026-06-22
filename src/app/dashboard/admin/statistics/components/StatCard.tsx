import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface StatCardProps {
    title: string;
    description?: string;
    icon?: string;
    color?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}

export function StatCard({ title, description, icon = 'bar_chart', color = 'blue', children, action }: StatCardProps) {
    return (
        <Card className="p-6 md:p-8 border-none shadow-soft hover:shadow-medium transition-all group overflow-hidden relative flex flex-col h-full bg-white">
            {/* Ambient background accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50/50 rounded-bl-full -mr-8 -mt-8 pointer-events-none transition-colors duration-500`} />
            
            <div className="relative z-10 flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-2xl bg-${color}-50 flex items-center justify-center text-${color}-600`}>
                        <span className="material-symbols-rounded text-2xl">{icon}</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
                        {description && <p className="text-sm font-medium text-slate-500">{description}</p>}
                    </div>
                </div>
                {action && (
                    <div className="flex items-center">
                        {action}
                    </div>
                )}
            </div>
            
            <div className="relative z-10 flex-1 w-full min-h-[300px]">
                {children}
            </div>
        </Card>
    );
}
