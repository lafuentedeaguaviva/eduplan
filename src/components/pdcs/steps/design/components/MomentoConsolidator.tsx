'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { 
    GripVertical, 
    ArrowUp, 
    ArrowDown, 
    Save, 
    CheckCircle2, 
    AlertCircle,
    Activity,
    BookOpen,
    Layout,
    Target
} from 'lucide-react';

const MOMENTO_CONFIG: Record<string, { color: string; icon: any; label: string; bg: string }> = {
    practica: { 
        color: 'text-blue-600', 
        bg: 'bg-blue-50', 
        icon: Activity, 
        label: 'Práctica' 
    },
    teoria: { 
        color: 'text-purple-600', 
        bg: 'bg-purple-50', 
        icon: BookOpen, 
        label: 'Teoría' 
    },
    produccion: { 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50', 
        icon: Layout, 
        label: 'Producción' 
    },
    valoracion: { 
        color: 'text-amber-600', 
        bg: 'bg-amber-50', 
        icon: Target, 
        label: 'Valoración' 
    }
};

interface Props {
    items: any[];
    onReorder: (items: any[]) => void;
    onSave: (items: any[]) => void;
    activeWeek: number;
    isSaving?: boolean;
    isConsolidated?: boolean;
}

export function MomentoConsolidator({ items, onReorder, onSave, activeWeek, isSaving, isConsolidated }: Props) {
    const [localItems, setLocalItems] = React.useState<any[]>([]);
    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

    React.useEffect(() => {
        if (Array.isArray(items)) {
            setLocalItems(items);
        }
    }, [items]);

    const move = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= localItems.length) return;

        const newItems = [...localItems];
        [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
        setLocalItems(newItems);
        onReorder(newItems);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        
        const newItems = [...localItems];
        const itemToMove = newItems.splice(draggedIndex, 1)[0];
        newItems.splice(index, 0, itemToMove);
        setLocalItems(newItems);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        onReorder(localItems);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            {/* Header / Status Banner */}
            <div className={`p-4 rounded-3xl flex items-center justify-between border-2 transition-all duration-500 ${
                isConsolidated 
                ? 'bg-emerald-50/40 border-emerald-100 backdrop-blur-sm' 
                : 'bg-amber-50/40 border-amber-100 shadow-lg shadow-amber-100/10 backdrop-blur-sm'
            }`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${isConsolidated ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-amber-500 text-white animate-pulse shadow-lg shadow-amber-500/20'}`}>
                        {isConsolidated ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg leading-tight ${isConsolidated ? 'text-emerald-900' : 'text-amber-900'}`}>
                            {isConsolidated ? 'Planificación Verificada' : 'Consolidación Pendiente'}
                        </h3>
                        <p className={`text-sm font-medium ${isConsolidated ? 'text-emerald-700/70' : 'text-amber-700/70'}`}>
                            {isConsolidated 
                                ? 'El orden de las actividades ha sido guardado y verificado.' 
                                : 'Define el orden final para esta semana antes de continuar.'}
                        </p>
                    </div>
                </div>
                
                <Button 
                    onClick={() => onSave(localItems)} 
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-xl text-xs uppercase tracking-widest ${
                        isConsolidated 
                        ? 'bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50' 
                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200'
                    } disabled:opacity-50 h-14`}
                >
                    {isSaving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            {isConsolidated ? 'Actualizar' : 'Guardar'}
                        </>
                    )}
                </Button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {localItems.length === 0 ? (
                    <div className="text-center py-24 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                        <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 text-slate-200 border border-slate-100">
                            <Activity className="w-12 h-12" />
                        </div>
                        <h4 className="text-slate-900 font-black text-xl tracking-tight">Sin actividades para organizar</h4>
                        <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2 text-sm">
                            Añade actividades en las pestañas (Práctica, Teoría...) para habilitar la consolidación.
                        </p>
                    </div>
                ) : (
                    localItems.map((item, index) => {
                        const type = item.type || 'practica';
                        const config = MOMENTO_CONFIG[type] || MOMENTO_CONFIG.practica;
                        const Icon = config.icon;
                        const itemId = item.id_practica || item.id_teoria || item.id_produccion || item.id_valoracion || item.id;
                        const stableId = `consolidate-${type}-${itemId}-${index}`;
                        
                        return (
                            <div 
                                key={stableId} 
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`group flex items-center gap-5 p-5 rounded-3xl border-2 transition-all duration-500 backdrop-blur-sm ${
                                    draggedIndex === index 
                                    ? 'bg-blue-50/80 border-blue-400 opacity-50 scale-95 shadow-inner' 
                                    : 'bg-white/80 border-slate-50 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1'
                                }`}
                            >
                                <div className="cursor-grab active:cursor-grabbing text-slate-200 hover:text-blue-500 transition-colors">
                                    <GripVertical className="w-6 h-6" />
                                </div>
                                
                                <div className={`size-14 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500 border border-white`}>
                                    <Icon className="w-7 h-7" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${config.bg} ${config.color} border border-current/10`}>
                                            {config.label}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">Fase #{index + 1}</span>
                                    </div>
                                    <h4 className="text-slate-900 font-black text-base truncate tracking-tight leading-tight">
                                        {item.nombre_practica || item.nombre_estrategia_teorica || item.nombre_produccion || item.categoria || 'Sin título'}
                                    </h4>
                                    <p className="text-slate-500 text-xs truncate mt-1 font-medium opacity-60">
                                        {item.redactado || item.descripcion_concreta || item.detalle || 'Sin descripción detallada.'}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                    <button 
                                        type="button"
                                        onClick={() => move(index, 'up')}
                                        disabled={index === 0}
                                        className="size-9 rounded-xl hover:bg-blue-50 text-slate-300 hover:text-blue-600 disabled:opacity-0 transition-all shadow-sm hover:shadow-md bg-white border border-slate-100"
                                    >
                                        <ArrowUp className="w-5 h-5 mx-auto" />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => move(index, 'down')}
                                        disabled={index === localItems.length - 1}
                                        className="size-9 rounded-xl hover:bg-blue-50 text-slate-300 hover:text-blue-600 disabled:opacity-0 transition-all shadow-sm hover:shadow-md bg-white border border-slate-100"
                                    >
                                        <ArrowDown className="w-5 h-5 mx-auto" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
