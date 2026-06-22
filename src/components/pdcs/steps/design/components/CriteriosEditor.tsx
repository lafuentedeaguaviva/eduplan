'use client';

import React from 'react';
import { EvaluacionTab } from '@/hooks/useCriteriosEvaluacion';
import { TAB_CONFIG } from './CriteriosTabs';
import { Button } from '@/components/ui/Button';
import { 
    Edit3, 
    X, 
    Save, 
    Type, 
    Layout, 
    ClipboardCheck, 
    FileText,
    Zap,
    Package
} from 'lucide-react';

interface CriteriosEditorProps {
    tab: EvaluacionTab;
    editingItem: any;
    setEditingItem: (item: any) => void;
    onSave: (draft?: any) => void;
    isSaving: boolean;
}

export const CriteriosEditor: React.FC<CriteriosEditorProps> = ({
    tab, editingItem, setEditingItem, onSave, isSaving
}) => {
    const config = TAB_CONFIG[tab];
    
    // Local draft state to prevent input lag
    const [draft, setDraft] = React.useState(editingItem || {});

    React.useEffect(() => {
        setDraft(editingItem || {});
    }, [editingItem]);

    const isEmpty = Object.keys(draft).length === 0;

    if (isEmpty) return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
            <div className="size-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-slate-200">
                <Edit3 className="w-8 h-8" />
            </div>
            <h4 className="text-slate-900 font-black text-sm uppercase tracking-widest mb-2">Editor Vacío</h4>
            <p className="text-slate-400 font-medium text-xs max-w-[180px] mx-auto">Selecciona un criterio de la biblioteca o escribe uno nuevo para comenzar.</p>
        </div>
    );

    const bgColors: Record<EvaluacionTab, string> = {
        ser: 'bg-fuchsia-700',
        saber: 'bg-blue-700',
        hacer: 'bg-amber-700',
        adaptacion: 'bg-emerald-700',
        adaptacion_no_sig: 'bg-slate-700'
    };

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden flex flex-col h-full ring-4 ring-slate-950/5 relative">
            {/* Header */}
            <div className={`px-8 py-7 flex items-center justify-between border-b border-slate-100 ${config.bg}`}>
                <div className="flex items-center gap-4">
                    <div className={`size-10 rounded-xl bg-white flex items-center justify-center shadow-sm ${config.color}`}>
                        <Edit3 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black tracking-tight leading-none uppercase text-slate-900">Panel de Redacción</h3>
                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 opacity-60 ${config.color}`}>Personalización Activa</p>
                    </div>
                </div>
                <button
                    onClick={() => setEditingItem({})}
                    className="size-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar text-slate-900">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <Type className="w-3 h-3 text-slate-400" />
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {tab === 'ser' ? 'Nombre del Criterio' : tab === 'adaptacion' ? 'Nombre de Adaptación' : 'Verbo / Acción'}
                        </label>
                    </div>
                    <input
                        value={draft.nombre_ser || draft.verbo_saber || draft.verbo || draft.nombre_adaptacion || ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (tab === 'ser') setDraft({ ...draft, nombre_ser: val });
                            else if (tab === 'saber') setDraft({ ...draft, verbo_saber: val });
                            else if (tab === 'hacer') setDraft({ ...draft, verbo: val });
                            else if (tab === 'adaptacion') setDraft({ ...draft, nombre_adaptacion: val });
                        }}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 focus:ring-4 focus:ring-slate-100 focus:border-slate-200 transition-all outline-none"
                        placeholder="Ej: Reconoce..."
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <FileText className="w-3 h-3 text-slate-400" />
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Redactado</label>
                    </div>
                    <textarea
                        value={draft.redactado || ''}
                        onChange={(e) => setDraft({ ...draft, redactado: e.target.value })}
                        rows={5}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-6 py-5 text-sm font-bold text-slate-600 leading-relaxed focus:ring-4 focus:ring-slate-100 focus:border-slate-200 transition-all outline-none resize-none"
                        placeholder="Escribe el criterio detallado aquí..."
                    />
                </div>

                {/* Conditional Fields */}
                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-100">
                    {tab === 'saber' && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <Zap className="w-3 h-3 text-slate-400" />
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidencia</label>
                            </div>
                            <input
                                value={draft.evidencia || ''}
                                onChange={(e) => setDraft({ ...draft, evidencia: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800"
                                placeholder="Ej: Examen, Exposición..."
                            />
                        </div>
                    )}

                    {tab === 'hacer' && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <Package className="w-3 h-3 text-slate-400" />
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto</label>
                            </div>
                            <input
                                value={draft.producto || ''}
                                onChange={(e) => setDraft({ ...draft, producto: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800"
                                placeholder="Ej: Maqueta, Informe..."
                            />
                        </div>
                    )}

                    {tab === 'adaptacion' ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <Layout className="w-3 h-3 text-slate-400" />
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Condición / Situación</label>
                            </div>
                            <input
                                value={draft.condicion || ''}
                                onChange={(e) => setDraft({ ...draft, condicion: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800"
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <ClipboardCheck className="w-3 h-3 text-slate-400" />
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instrumento de Evaluación</label>
                            </div>
                            <input
                                value={draft.instrumento_sugerido || ''}
                                onChange={(e) => setDraft({ ...draft, instrumento_sugerido: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800"
                                placeholder="Ej: Ficha de observación"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Save Button */}
            <div className="p-6 bg-slate-50 border-t border-slate-100">
                <Button
                    onClick={() => onSave(draft)}
                    disabled={isSaving}
                    className={`w-full h-16 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 text-white ${bgColors[tab]} hover:brightness-110 shadow-slate-200`}
                >
                    {isSaving ? (
                        <div className="size-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span>Guardar Dimensión</span>
                            <Save className="w-5 h-5" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};
