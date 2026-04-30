'use client';

/**
 * View: PlanningSplitView
 * 
 * Componente de interfaz que permite la asignación de contenidos a semanas mediante
 * drag-and-drop o clics. Delega las acciones persistentes al controlador.
 */

import { useState, useMemo } from 'react';
import { AreaTrabajo, UserContent, PlanificacionSemanal, SemanaContenido } from '@/types';

interface Props {
    area: AreaTrabajo;
    userContents: UserContent[];
    areaSchedule: PlanificacionSemanal[];
    setAreaSchedule: React.Dispatch<React.SetStateAction<PlanificacionSemanal[]>>;
    allAssignments: any[];
    onRefresh: () => void;
    handleAssign: (planId: string, contentId: number) => void;
    handleRemoveAssignment: (planId: string, contentId: number) => void;
    isProcessing: string | null;
    onShowConfig?: () => void;
    // Props for editing and reordering
    editingContentId?: number | null;
    editingTitle?: string;
    setEditingTitle?: (val: string) => void;
    startEditing?: (content: UserContent) => void;
    cancelEditing?: (e: React.MouseEvent | React.KeyboardEvent) => void;
    updateContent?: (id: number) => void;
    reorderContent?: (content: UserContent, direction: 'up' | 'down') => void;
    // Props for adding new contents
    isAddingNew?: boolean;
    setIsAddingNew?: (val: boolean) => void;
    newTitle?: string;
    setNewTitle?: (val: string) => void;
    createNewTheme?: () => void;
    isAddingSubthemeTo?: number | null;
    setIsAddingSubthemeTo?: (id: number | null) => void;
    newSubthemeTitle?: string;
    setNewSubthemeTitle?: (val: string) => void;
    createNewSubtheme?: (parentId: number) => void;
}

export function PlanningSplitView({
    userContents,
    areaSchedule,
    allAssignments,
    handleAssign,
    handleRemoveAssignment,
    isProcessing,
    onShowConfig,
    editingContentId,
    editingTitle,
    setEditingTitle,
    startEditing,
    cancelEditing,
    updateContent,
    reorderContent,
    isAddingNew,
    setIsAddingNew,
    newTitle,
    setNewTitle,
    createNewTheme,
    isAddingSubthemeTo,
    setIsAddingSubthemeTo,
    newSubthemeTitle,
    setNewSubthemeTitle,
    createNewSubtheme
}: Props) {
    const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
    const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set(areaSchedule.map(w => w.mes)));
    const [expandedThemes, setExpandedThemes] = useState<Set<number>>(new Set());
    const [dragOverWeekId, setDragOverWeekId] = useState<string | null>(null);

    // Group schedule by month
    const months = useMemo(() => {
        const grouped: Record<number, PlanificacionSemanal[]> = {};
        areaSchedule.forEach(week => {
            if (!grouped[week.mes]) grouped[week.mes] = [];
            grouped[week.mes].push(week);
        });
        return grouped;
    }, [areaSchedule]);

    const handleDragStart = (e: React.DragEvent, contentId: number) => {
        e.dataTransfer.setData('contentId', contentId.toString());
        setSelectedContentId(contentId);
    };

    const handleDragOver = (e: React.DragEvent, weekId: string) => {
        e.preventDefault();
        setDragOverWeekId(weekId);
    };

    const handleDrop = (e: React.DragEvent, weekId: string) => {
        e.preventDefault();
        setDragOverWeekId(null);
        const contentIdStr = e.dataTransfer.getData('contentId');
        if (contentIdStr) {
            const contentId = parseInt(contentIdStr);
            setSelectedContentId(contentId);
            handleAssign(weekId, contentId);
            setSelectedContentId(null); // Clear selection after direct assign
        }
    };

    const onAssignClick = (weekId: string) => {
        if (selectedContentId) {
            handleAssign(weekId, selectedContentId);
            setSelectedContentId(null);
        }
    };

    // Mostrar todos los temas y subtemas, incluyendo los ya planificados.
    // Los subtemas pueden asignarse a múltiples semanas; el guard de duplicado
    // en la misma semana se maneja en handleAssign mediante existingIds.
    const themes = useMemo(() => {
        return userContents
            .filter(theme => !theme.padre_id)
            .sort((a, b) => {
                if (a.orden !== b.orden) return a.orden - b.orden;
                return Number(a.id) - Number(b.id);
            });
    }, [userContents]);

    const getSubthemes = (parentId: number) =>
        userContents
            .filter(c => c.padre_id === parentId)
            .sort((a, b) => {
                if (a.orden !== b.orden) return a.orden - b.orden;
                return Number(a.id) - Number(b.id);
            });

    const toggleMonth = (mes: number) => {
        const next = new Set(expandedMonths);
        if (next.has(mes)) next.delete(mes);
        else next.add(mes);
        setExpandedMonths(next);
    };

    const toggleTheme = (themeId: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const next = new Set(expandedThemes);
        if (next.has(themeId)) next.delete(themeId);
        else next.add(themeId);
        setExpandedThemes(next);
    };

    // Calculate if a content is already assigned somewhere
    const contentAssignments = useMemo(() => {
        const map: Record<number, string[]> = {};
        
        // Procesar asignaciones globales (historial completo del año)
        allAssignments.forEach(item => {
            const cid = item.contenido_usuario_id;
            const week = item.planificacion_semanal;
            if (!week) return;
            
            if (!map[cid]) map[cid] = [];
            const label = `T${week.trimestre}-M${week.mes}-S${week.semana}`;
            if (!map[cid].includes(label)) map[cid].push(label);
        });

        // Asegurar que las del trimestre actual se reflejen inmediatamente (optimismo)
        areaSchedule.forEach(week => {
            week.semana_contenido?.forEach(sc => {
                if (!map[sc.contenido_usuario_id]) map[sc.contenido_usuario_id] = [];
                const label = `T${week.trimestre}-M${week.mes}-S${week.semana}`;
                if (!map[sc.contenido_usuario_id].includes(label)) {
                    map[sc.contenido_usuario_id].push(label);
                }
            });
        });
        
        return map;
    }, [allAssignments, areaSchedule]);

    return (
        <div className="flex bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden h-[calc(100vh-280px)] min-h-[600px] w-full">
            {/* Left Column: Contenidos */}
            <div className="w-[420px] shrink-0 border-r border-slate-100 flex flex-col bg-slate-50/20 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-rounded text-blue-600">list_alt</span>
                                Tus Contenidos
                            </h2>
                            <p className="text-xs text-slate-400 font-medium mt-1">Selecciona un tema para asignarlo a una semana</p>
                        </div>
                        <button 
                            onClick={() => setIsAddingNew?.(true)}
                            className="size-10 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-sm shadow-blue-200/50"
                            title="Añadir Tema Principal"
                        >
                            <span className="material-symbols-rounded">add</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/50">
                    {isAddingNew && (
                        <div className="p-4 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/30 animate-in zoom-in-95 duration-200">
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Nuevo Tema Principal</h4>
                            <div className="flex items-center gap-2">
                                <input
                                    autoFocus
                                    className="flex-1 bg-white border border-blue-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Título del tema..."
                                    value={newTitle}
                                    onChange={(e) => setNewTitle?.(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') createNewTheme?.();
                                        if (e.key === 'Escape') setIsAddingNew?.(false);
                                    }}
                                />
                                <button onClick={() => createNewTheme?.()} className="size-8 rounded-lg bg-blue-600 text-white flex items-center justify-center"><span className="material-symbols-rounded text-sm">check</span></button>
                                <button onClick={() => setIsAddingNew?.(false)} className="size-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center"><span className="material-symbols-rounded text-sm">close</span></button>
                            </div>
                        </div>
                    )}
                    {themes.map((theme, themeIdx) => {
                        const themeNumber = themeIdx + 1;
                        const subthemes = getSubthemes(theme.id);
                        const isExpanded = expandedThemes.has(theme.id);
                        const isSelected = selectedContentId === theme.id;

                        return (
                            <div key={theme.id} className="space-y-3">
                                <div
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, theme.id)}
                                    onClick={() => setSelectedContentId(isSelected ? null : theme.id)}
                                    className={`group/theme p-5 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden flex flex-col ${isSelected
                                        ? 'border-blue-500 bg-white shadow-2xl shadow-blue-500/10 -translate-y-1'
                                        : contentAssignments[theme.id]
                                            ? 'border-emerald-200 bg-emerald-50/30 hover:bg-white hover:border-emerald-300'
                                            : 'border-white bg-white/80 hover:bg-white hover:border-blue-100 hover:shadow-lg'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`size-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 transition-all ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                                                {themeNumber}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {editingContentId === theme.id ? (
                                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                        <input
                                                            autoFocus
                                                            className="w-full bg-slate-50 border-b-2 border-blue-500 px-2 py-1 text-sm font-black text-slate-900 focus:outline-none"
                                                            value={editingTitle}
                                                            onChange={(e) => setEditingTitle?.(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') updateContent?.(theme.id);
                                                                if (e.key === 'Escape') cancelEditing?.(e as any);
                                                            }}
                                                        />
                                                        <button onClick={() => updateContent?.(theme.id)} className="text-blue-600"><span className="material-symbols-rounded text-base">check</span></button>
                                                        <button onClick={(e) => cancelEditing?.(e as any)} className="text-slate-400"><span className="material-symbols-rounded text-base">close</span></button>
                                                    </div>
                                                ) : (
                                                    <h3 
                                                        className={`text-sm font-black tracking-tight leading-tight transition-colors ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}
                                                        onClick={(e) => {
                                                            if (e.detail === 2) {
                                                                e.stopPropagation();
                                                                startEditing?.(theme);
                                                            }
                                                        }}
                                                    >
                                                        {theme.titulo}
                                                    </h3>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-1.5">
                                            {!editingContentId && (
                                                <div className="flex items-center opacity-0 group-hover/theme:opacity-100 transition-all scale-90 group-hover/theme:scale-100" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => reorderContent?.(theme, 'up')} className="size-8 flex items-center justify-center text-slate-300 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="Subir"><span className="material-symbols-rounded text-base">arrow_upward</span></button>
                                                    <button onClick={() => reorderContent?.(theme, 'down')} className="size-8 flex items-center justify-center text-slate-300 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="Bajar"><span className="material-symbols-rounded text-base">arrow_downward</span></button>
                                                    <button onClick={() => startEditing?.(theme)} className="size-8 flex items-center justify-center text-slate-300 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="Editar"><span className="material-symbols-rounded text-base">edit</span></button>
                                                    <button onClick={() => {
                                                        setIsAddingSubthemeTo?.(theme.id);
                                                        if (!isExpanded) toggleTheme(theme.id);
                                                    }} className="size-8 flex items-center justify-center text-slate-300 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="Añadir Subtema"><span className="material-symbols-rounded text-base">add_circle</span></button>
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => toggleTheme(theme.id, e)}
                                                className={`size-8 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-400'}`}
                                            >
                                                <span className={`material-symbols-rounded text-xl transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                                                    expand_more
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                    {contentAssignments[theme.id] && (
                                        <div className="mt-3 flex flex-wrap gap-1 bg-emerald-100/30 p-2 rounded-xl border border-emerald-100/50">
                                            <span className="material-symbols-rounded text-[10px] text-emerald-500">done_all</span>
                                            {contentAssignments[theme.id].map((tag, i) => (
                                                <span key={i} className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                                                    {tag}{i < contentAssignments[theme.id].length - 1 ? ' • ' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {isExpanded && (
                                    <div className="ml-8 space-y-2 border-l-2 border-slate-100 pl-6 py-1 animate-in slide-in-from-top-4 duration-500">
                                        {subthemes.map((sub, subIdx) => {
                                            const subNumber = `${themeNumber}.${subIdx + 1}`;
                                            const isSubAssigned = !!contentAssignments[sub.id];
                                            const isSubSelected = selectedContentId === sub.id;

                                            return (
                                                <div
                                                    key={sub.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, sub.id)}
                                                    onClick={() => setSelectedContentId(isSubSelected ? null : sub.id)}
                                                    className={`group/sub p-4 rounded-2xl border transition-all cursor-pointer relative ${isSubSelected
                                                        ? 'border-indigo-400 bg-white shadow-lg -translate-x-1'
                                                        : contentAssignments[sub.id]
                                                            ? 'border-emerald-100 bg-emerald-50/20 hover:bg-white hover:border-emerald-200'
                                                            : isSubAssigned
                                                                ? 'border-indigo-50 bg-indigo-50/20 hover:bg-white hover:border-indigo-200'
                                                                : 'border-transparent bg-white/40 hover:bg-white hover:border-slate-200'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className={`text-[10px] font-black px-2 py-1 rounded-lg transition-colors ${isSubSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-400'}`}>
                                                            {subNumber}
                                                        </div>
                                                        
                                                        {editingContentId === sub.id ? (
                                                            <div className="flex-1 min-w-0 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                                <input
                                                                    autoFocus
                                                                    className="w-full bg-slate-100 border-b border-indigo-400 px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none"
                                                                    value={editingTitle}
                                                                    onChange={(e) => setEditingTitle?.(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') updateContent?.(sub.id);
                                                                        if (e.key === 'Escape') cancelEditing?.(e as any);
                                                                    }}
                                                                />
                                                                <button onClick={() => updateContent?.(sub.id)} className="text-indigo-600"><span className="material-symbols-rounded text-sm">check</span></button>
                                                            </div>
                                                        ) : (
                                                            <h4 
                                                                className={`text-xs font-bold leading-relaxed truncate flex-1 uppercase tracking-tight ${isSubSelected ? 'text-indigo-900' : 'text-slate-600'}`}
                                                                onClick={(e) => {
                                                                    if (e.detail === 2) {
                                                                        e.stopPropagation();
                                                                        startEditing?.(sub);
                                                                    }
                                                                }}
                                                            >
                                                                {sub.titulo}
                                                            </h4>
                                                        )}
    
                                                        <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-all scale-90 group-hover/sub:scale-100" onClick={e => e.stopPropagation()}>
                                                            {!editingContentId && (
                                                                <>
                                                                    <button onClick={() => reorderContent?.(sub, 'up')} className="size-7 flex items-center justify-center text-slate-300 hover:text-indigo-600 rounded-lg hover:bg-indigo-50" title="Subir"><span className="material-symbols-rounded text-sm">arrow_upward</span></button>
                                                                    <button onClick={() => reorderContent?.(sub, 'down')} className="size-7 flex items-center justify-center text-slate-300 hover:text-indigo-600 rounded-lg hover:bg-indigo-50" title="Bajar"><span className="material-symbols-rounded text-sm">arrow_downward</span></button>
                                                                    <button onClick={() => startEditing?.(sub)} className="size-7 flex items-center justify-center text-slate-300 hover:text-indigo-600 rounded-lg hover:bg-indigo-50" title="Editar"><span className="material-symbols-rounded text-sm">edit</span></button>
                                                                </>
                                                            )}
                                                            {contentAssignments[sub.id] && !editingContentId && (
                                                                <div className="size-6 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                                                    <span className="material-symbols-rounded text-sm" title="Asignado">offline_pin</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {contentAssignments[sub.id] && (
                                                        <div className="mt-2 pl-12 flex flex-wrap gap-1">
                                                            {contentAssignments[sub.id].map((tag, i) => (
                                                                <span key={i} className="text-[7px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-1 rounded">
                                                                    {tag}{i < contentAssignments[sub.id].length - 1 ? ' • ' : ''}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
    
                                        {isAddingSubthemeTo === theme.id && (
                                            <div className="p-4 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 animate-in slide-in-from-top-1 duration-200">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        autoFocus
                                                        className="flex-1 bg-white border border-indigo-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                                                        placeholder="Nuevo subtema..."
                                                        value={newSubthemeTitle}
                                                        onChange={(e) => setNewSubthemeTitle?.(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') createNewSubtheme?.(theme.id);
                                                            if (e.key === 'Escape') setIsAddingSubthemeTo?.(null);
                                                        }}
                                                    />
                                                    <button onClick={() => createNewSubtheme?.(theme.id)} className="size-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center"><span className="material-symbols-rounded text-sm">check</span></button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {themes.length === 0 && (
                        <div className="py-12 text-center text-slate-300">
                            <span className="material-symbols-rounded text-4xl block mb-2">sticky_note_2</span>
                            <p className="text-xs font-bold uppercase tracking-widest">Sin contenidos</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Cronograma */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-rounded text-blue-600">calendar_view_week</span>
                        Cronograma de Trabajo
                    </h2>
                    {selectedContentId && (
                        <div className="animate-in fade-in slide-in-from-right-4">
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-blue-100">
                                Asignando: {userContents.find(c => c.id === selectedContentId)?.titulo.substring(0, 30)}...
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-6 space-y-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                    {areaSchedule.length > 0 ? (
                        Object.entries(months).map(([mes, weeks]) => {
                            const mId = parseInt(mes);
                            const isExpanded = expandedMonths.has(mId);

                            return (
                                <div key={mes} className="space-y-4">
                                    <div
                                        onClick={() => toggleMonth(mId)}
                                        className="flex items-center gap-3 cursor-pointer group"
                                    >
                                        <div className="h-px flex-1 bg-slate-100"></div>
                                        <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'
                                            }`}>
                                            MES {mId}
                                            <span className={`material-symbols-rounded text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                                        </div>
                                        <div className="h-px flex-1 bg-slate-100"></div>
                                    </div>

                                    {isExpanded && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                                            {weeks.map(week => (
                                                <div
                                                    key={week.id}
                                                    onDragOver={(e) => handleDragOver(e, week.id)}
                                                    onDragLeave={() => setDragOverWeekId(null)}
                                                    onDrop={(e) => handleDrop(e, week.id)}
                                                    className={`rounded-2xl border transition-all relative overflow-hidden flex flex-col ${dragOverWeekId === week.id || (selectedContentId && dragOverWeekId === null)
                                                        ? 'border-blue-400 bg-blue-50/20 shadow-lg ring-2 ring-blue-500/20 shadow-blue-500/10'
                                                        : selectedContentId
                                                            ? 'border-blue-100 bg-blue-50/10 hover:border-blue-400 hover:shadow-lg cursor-pointer'
                                                            : 'border-slate-100 bg-white hover:border-slate-200'
                                                        }`}
                                                    onClick={() => onAssignClick(week.id)}
                                                >
                                                    {isProcessing === week.id && (
                                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center">
                                                            <span className="material-symbols-rounded animate-spin text-blue-600">sync</span>
                                                        </div>
                                                    )}

                                                    <div className="p-3 flex-1 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                                                                    S{week.semana}
                                                                </div>
                                                                <div className="text-[8px] font-black text-slate-300 uppercase tracking-tight">
                                                                    {week.fecha_inicio_trimestre?.split('-').reverse().join('/') || '...'} AL {week.fecha_fin_trimestre?.split('-').reverse().join('/') || '...'}
                                                                </div>
                                                            </div>
                                                            {selectedContentId && (
                                                                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center animate-bounce">
                                                                    <span className="material-symbols-rounded text-xs">add</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-1 min-h-[40px]">
                                                            {week.semana_contenido
                                                                ?.sort((a, b) => {
                                                                    const aParentId = a.contenido_usuario?.padre_id || a.contenido_usuario_id;
                                                                    const bParentId = b.contenido_usuario?.padre_id || b.contenido_usuario_id;
                                                                    if (aParentId !== bParentId) return aParentId - bParentId;
                                                                    if (!a.contenido_usuario?.padre_id) return -1;
                                                                    if (!b.contenido_usuario?.padre_id) return 1;
                                                                    return 0;
                                                                })
                                                                .map(sc => {
                                                                    const isSubtheme = !!sc.contenido_usuario?.padre_id;
                                                                    const themeForSc = themes.find(t => t.id === sc.contenido_usuario_id || t.id === sc.contenido_usuario?.padre_id);
                                                                    const themeIdxForSc = themeForSc ? themes.indexOf(themeForSc) : -1;
                                                                    const themeNumberForSc = themeIdxForSc !== -1 ? themeIdxForSc + 1 : '?';
                                                                    
                                                                    let scNumber = themeNumberForSc.toString();
                                                                    if (isSubtheme) {
                                                                        const subsForTheme = getSubthemes(themeForSc?.id || 0);
                                                                        const subIdxForSc = subsForTheme.findIndex(s => s.id === sc.contenido_usuario_id);
                                                                        scNumber = `${themeNumberForSc}.${subIdxForSc !== -1 ? subIdxForSc + 1 : '?'}`;
                                                                    }

                                                                    const currentProcessingId = `${week.id}-${sc.contenido_usuario_id}`;
                                                                    return (
                                                                        <div
                                                                            key={sc.id}
                                                                            className={`group/item flex items-center justify-between gap-2 p-2 rounded-xl border transition-all shadow-sm ${isSubtheme
                                                                                ? 'ml-6 pl-3 border-l-4 border-indigo-200 bg-white hover:border-indigo-300'
                                                                                : 'bg-blue-600 border-blue-700 text-white font-black shadow-blue-500/10'
                                                                                }`}
                                                                        >
                                                                            <div className="flex items-center gap-2 truncate">
                                                                                <div className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${isSubtheme ? 'bg-indigo-50 text-indigo-400' : 'bg-white/20 text-white'}`}>
                                                                                    {scNumber}
                                                                                </div>
                                                                                <span className={`truncate tracking-tight ${isSubtheme ? 'text-[9px] font-bold text-slate-500 uppercase' : 'text-[10px] uppercase'}`}>
                                                                                    {sc.contenido_usuario?.titulo}
                                                                                </span>
                                                                            </div>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleRemoveAssignment(week.id, sc.contenido_usuario_id);
                                                                                }}
                                                                                className={`p-0.5 transition-colors ${isSubtheme ? 'text-slate-300 hover:text-red-500' : 'text-white/40 hover:text-white'}`}
                                                                            >
                                                                                {isProcessing === currentProcessingId ? (
                                                                                    <span className="material-symbols-rounded text-[10px] animate-spin">sync</span>
                                                                                ) : (
                                                                                    <span className="material-symbols-rounded text-sm">cancel</span>
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}

                                                            {(!week.semana_contenido || week.semana_contenido.length === 0) && !selectedContentId && (
                                                                <div className="flex flex-col items-center justify-center h-full py-2 opacity-20">
                                                                    <span className="material-symbols-rounded text-xl">event_available</span>
                                                                    <span className="text-[8px] font-black uppercase mt-0.5 text-center">Libre</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-20">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                <span className="material-symbols-rounded text-4xl text-slate-300">calendar_today</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Sin cronograma disponible</h2>
                                <p className="text-slate-400 max-w-sm mx-auto font-medium">
                                    No se ha definido un calendario global para este trimestre o ha ocurrido un error al cargar los datos.
                                </p>
                            </div>
                            {onShowConfig && (
                                <button
                                    onClick={onShowConfig}
                                    className="h-12 px-8 rounded-2xl font-black border-2 border-slate-100 hover:bg-slate-50 transition-all text-slate-600"
                                >
                                    Configuración Manual
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

