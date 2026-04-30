'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface SavedObjectivesListProps {
    learningObjectives: any[];
    onRemove: (index: number) => void;
    onEdit: (index: number) => void;
}

export function SavedObjectivesList({ learningObjectives, onRemove, onEdit }: SavedObjectivesListProps) {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 px-1">
                <div className="size-12 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-rounded text-slate-600 text-2xl font-bold">checklist</span>
                </div>
                <div className="flex-1">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Objetivos Guardados ({learningObjectives.length})</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lista de objetivos pedagógicos validados</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {learningObjectives.length > 0 ? (
                    learningObjectives.map((obj, i) => (
                        <Card key={i} className="p-6 flex items-start gap-6 group/obj animate-in zoom-in-95 duration-500 hover:ring-2 hover:ring-blue-100 cursor-default rounded-[2rem]">
                            <Badge variant="accent" className="size-10 rounded-2xl flex items-center justify-center p-0 shrink-0 font-black text-lg bg-blue-100 text-blue-600 border-none">
                                {i + 1}
                            </Badge>
                            <div className="flex-1 pt-1.5 line-clamp-2">
                                <p className="font-black text-slate-700 text-lg leading-snug tracking-tight uppercase">{obj.text}</p>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover/obj:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="size-12 p-0 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all"
                                    onClick={() => onEdit(i)}
                                >
                                    <span className="material-symbols-rounded text-2xl font-bold">edit</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="size-12 p-0 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                    onClick={() => onRemove(i)}
                                >
                                    <span className="material-symbols-rounded text-2xl font-bold">delete_forever</span>
                                </Button>
                            </div>
                        </Card>
                    ))

                ) : (
                    <div className="py-24 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100 space-y-4">
                        <div className="size-24 bg-white rounded-[2.5rem] shadow-sm flex items-center justify-center mx-auto text-slate-200 rotate-6">
                            <span className="material-symbols-rounded text-6xl">inventory_2</span>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Bandeja de Objetivos Vacía</h4>
                            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Inicia la redacción en el panel superior para visualizar resultados</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
