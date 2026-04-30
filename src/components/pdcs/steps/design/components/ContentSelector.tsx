'use client';

import React from 'react';

interface ContentSelectorProps {
    availableContents: any[];
    currentObjective: any;
    expandedTitles: number[];
    learningObjectives: any[];
    onToggleContent: (id: number, isCovered: boolean) => void;
    onToggleExpanded: (id: number) => void;
}

export function ContentSelector(props: ContentSelectorProps) {
    const {
        availableContents,
        currentObjective,
        expandedTitles,
        learningObjectives,
        onToggleContent,
        onToggleExpanded
    } = props;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
                <label className="soft-label text-blue-600">Paso 3.2: Contenidos Asociados</label>
                <div className="h-px flex-1 bg-slate-50"></div>
            </div>
            <div className="max-h-[400px] overflow-y-auto pr-3 custom-scrollbar space-y-3">
                {availableContents.length > 0 ? (
                    availableContents
                        .filter(c => !c.padre_id || !availableContents.some(p => String(p.id) === String(c.padre_id)))
                        .map((parent, pIdx) => {
                        const children = availableContents.filter(c => String(c.padre_id) === String(parent.id));
                        const isExpanded = expandedTitles.includes(Number(parent.id));
                        const isParentSelected = currentObjective.contentIds.includes(Number(parent.id));
                        const isParentCovered = learningObjectives.some(obj => obj.contentIds.includes(Number(parent.id)));

                        const parentNumber = pIdx + 1;

                        return (
                            <div key={parent.id} className="space-y-2">
                                <div
                                    className={`p-4 rounded-[1.5rem] border transition-all flex items-center gap-4 group/item ${isParentCovered
                                        ? 'bg-emerald-50/50 border-emerald-100 opacity-60 cursor-default'
                                        : isParentSelected
                                            ? 'bg-blue-50 border-blue-200 cursor-pointer shadow-sm translate-x-1'
                                            : 'bg-white border-slate-100 hover:border-slate-200 cursor-pointer'
                                        }`}
                                    onClick={() => onToggleContent(Number(parent.id), isParentCovered)}
                                >
                                    <div className={`size-8 rounded-xl border flex items-center justify-center transition-all ${isParentCovered
                                        ? 'bg-emerald-500 border-transparent text-white'
                                        : isParentSelected
                                            ? 'bg-blue-600 border-transparent text-white shadow-glow'
                                            : 'bg-white border-slate-200 text-slate-300 group-hover/item:border-blue-400 group-hover/item:text-blue-500'}`}
                                    >
                                        {isParentCovered || isParentSelected ? (
                                            <span className="material-symbols-rounded text-[18px] font-bold">done</span>
                                        ) : (
                                            <span className="text-[14px] font-black">{parentNumber}.</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`text-[12px] font-black tracking-tight leading-tight ${isParentSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                                            {parent.titulo}
                                        </div>
                                        {children.length > 0 && (
                                            <div className="text-[9px] font-bold text-blue-500/60 uppercase tracking-widest mt-0.5">
                                                {children.length} {children.length === 1 ? 'Subtema' : 'Subtemas'}
                                            </div>
                                        )}
                                    </div>
                                    {children.length > 0 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleExpanded(Number(parent.id));
                                            }}
                                            className={`size-10 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-blue-600 text-white rotate-180 shadow-glow' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-blue-200 hover:text-blue-600'}`}
                                        >
                                            <span className="material-symbols-rounded text-xl">expand_more</span>
                                        </button>
                                    )}
                                </div>

                                {isExpanded && children.length > 0 && (
                                    <div className="pl-8 space-y-2 animate-in slide-in-from-top-4 duration-300 py-1 border-l-2 border-slate-50 ml-4">
                                        {children.map((child, cIdx) => {
                                            const isChildSelected = currentObjective.contentIds.includes(Number(child.id));
                                            const isChildCovered = learningObjectives.some(obj => obj.contentIds.includes(Number(child.id)));
                                            const childNumber = `${parentNumber}.${cIdx + 1}`;

                                            return (
                                                <div
                                                    key={child.id}
                                                    onClick={() => onToggleContent(Number(child.id), isChildCovered)}
                                                    className={`p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${isChildCovered
                                                        ? 'bg-emerald-50/30 border-emerald-50 opacity-60'
                                                        : isChildSelected
                                                            ? 'bg-blue-50/50 border-blue-100 shadow-sm'
                                                            : 'bg-white/50 border-slate-100 hover:border-slate-200 hover:bg-white'
                                                        }`}
                                                >
                                                    <div className={`size-7 px-1 rounded-lg border flex items-center justify-center transition-all ${isChildCovered
                                                        ? 'bg-emerald-400 border-transparent text-white'
                                                        : isChildSelected
                                                            ? 'bg-blue-500 border-transparent text-white'
                                                            : 'bg-white border-slate-100 text-slate-400 shadow-sm'}`}
                                                    >
                                                        {isChildCovered || isChildSelected ? (
                                                            <span className="material-symbols-rounded text-[14px] font-bold">done</span>
                                                        ) : (
                                                            <span className="text-[9px] font-black">{childNumber}</span>
                                                        )}
                                                    </div>
                                                    <span className={`text-[11px] font-bold leading-snug ${isChildSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                                                        {child.titulo}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="py-16 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-3">
                        <span className="material-symbols-rounded text-slate-200 text-5xl">list_alt</span>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin contenidos disponibles</p>
                    </div>
                )}
            </div>
        </div>
    );
}
