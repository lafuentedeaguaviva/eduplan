'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import { useAreasController } from '@/hooks/useAreasController';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Atoms';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { UserContent } from '@/types';

export default function AreaDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const {
        area,
        rootBaseThemes,
        userThemes,
        loading,
        copyingId,
        isCopyingAll,
        isSaving,
        feedback,
        hideFeedback,
        expandedThemes,
        expandedUserThemes,
        editingContentId,
        editingTitle,
        isAddingNew,
        newTitle,
        isAddingSubthemeTo,
        newSubthemeTitle,
        setEditingTitle,
        setNewTitle,
        setIsAddingNew,
        setIsAddingSubthemeTo,
        setNewSubthemeTitle,
        getBaseSubthemes,
        getUserSubthemes,
        handleCopyManual,
        handleCopyAllOfficial,
        updateContent,
        createNewTheme,
        createNewSubtheme,
        reorderContent,
        deleteContent,
        toggleBaseTheme,
        toggleUserTheme,
        startEditing,
        cancelEditing,
        goBack
    } = useAreasController(params);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;
            if (!target.closest('.editor-container')) {
                cancelEditing();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [cancelEditing]);

    if (loading) {
        return (
            <div className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-11 w-32 rounded-xl" />
                        <Skeleton className="h-11 w-40 rounded-xl" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8">
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                    </div>
                    <div className="hidden lg:block w-px h-full bg-slate-100 mx-auto" />
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                    </div>
                </div>
            </div>
        );
    }

    if (!area) {
        return (
            <div className="p-12 text-center animate-in fade-in duration-500">
                <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-rounded text-slate-300 text-4xl">search_off</span>
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Área de trabajo no encontrada</h2>
                <p className="text-slate-500 mt-2 mb-8">El recurso que buscas no existe o no tienes permisos para verlo.</p>
                <Button variant="outline" onClick={goBack} className="px-8">
                    Volver al Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-1">
                        <button onClick={goBack} className="p-2 hover:bg-slate-100 rounded-full transition-all hover:scale-110">
                            <span className="material-symbols-rounded text-slate-500">arrow_back</span>
                        </button>
                        <Badge variant="accent" className="font-black">
                            {area.unidad_educativa.nombre}
                        </Badge>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter ml-1">
                        {area.area_conocimiento.nombre}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-500 font-bold text-xs ml-1 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">
                            <span className="material-symbols-rounded text-lg text-primary">school</span>
                            <span>{area.area_conocimiento.grado?.nombre} • {area.area_conocimiento.grado?.nivel?.nombre}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">
                            <span className="material-symbols-rounded text-lg text-primary">schedule</span>
                            <span>{area.turno.nombre}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">
                            <span className="material-symbols-rounded text-lg text-primary">group</span>
                            <div className="flex gap-1">
                                {area.paralelos.map(p => (
                                    <span key={p.id} className="text-slate-900 underline decoration-primary decoration-2 underline-offset-2">
                                        {p.nombre}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                </div>
            </div>

            <AlertDialog
                isOpen={feedback.isOpen && !!feedback.isConfirm}
                onClose={hideFeedback}
                onConfirm={feedback.onConfirm || (() => { })}
                title={feedback.title}
                description={feedback.description}
                confirmText={feedback.confirmText || 'Confirmar'}
                cancelText={feedback.cancelText || 'Cancelar'}
                variant={feedback.type === 'error' ? 'danger' : feedback.type === 'warning' ? 'warning' : 'info'}
            />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-start">
                {/* Contenidos Base Accordion */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-rounded text-primary text-xl">verified</span>
                            </div>
                            Currículo Base Oficinal
                        </h2>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={handleCopyAllOfficial}
                        disabled={isCopyingAll || rootBaseThemes.length === 0}
                        className="lg:hidden w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all active:scale-95"
                    >
                        {isCopyingAll ? (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span className="material-symbols-rounded">double_arrow</span>
                                Sincronizar Todo al Planificador
                            </>
                        )}
                    </Button>

                    <div className="space-y-4">
                        {rootBaseThemes.map(theme => {
                            const isExpanded = expandedThemes.has(theme.id);
                            const subthemes = getBaseSubthemes(theme.id);

                            return (
                                <Card key={theme.id} className="p-0 overflow-hidden border-slate-100 hover:border-primary/20 transition-all duration-300 group/card shadow-soft">
                                    <div
                                        onClick={() => toggleBaseTheme(theme.id)}
                                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`size-10 rounded-2xl flex items-center justify-center transition-all shadow-inner font-black text-sm ${isExpanded ? 'bg-primary text-white scale-110 rotate-3' : 'bg-slate-100 text-slate-400'}`}>
                                                {theme.orden}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 group-hover/card:text-primary transition-colors">
                                                    {theme.titulo}
                                                </h3>
                                                {theme.trimestre && (
                                                    <Badge variant="default" className="mt-1 lowercase bg-slate-100 text-slate-500 border-none px-2 py-0">
                                                        {theme.trimestre}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`material-symbols-rounded size-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-all duration-300 ${isExpanded ? 'rotate-180 text-primary' : ''}`}>
                                            expand_more
                                        </span>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-5 pb-5 pt-1 space-y-2.5 border-t border-slate-50 bg-slate-50/20">
                                            {subthemes.length > 0 ? subthemes.map(sub => (
                                                <div key={sub.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group/sub transition-all hover:shadow-md hover:-translate-y-0.5">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-black text-slate-300 bg-slate-50 size-6 flex items-center justify-center rounded-lg">{theme.orden}.{sub.orden}</span>
                                                        <span className="text-sm font-bold text-slate-700">{sub.titulo}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCopyManual(sub.id)}
                                                        disabled={copyingId === sub.id}
                                                        className="size-10 flex items-center justify-center text-primary hover:bg-primary/10 rounded-xl transition-all opacity-0 group-hover/sub:opacity-100 disabled:opacity-50"
                                                        title="Copiar a mis contenidos"
                                                    >
                                                        {copyingId === sub.id ? (
                                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <span className="material-symbols-rounded text-xl">content_copy</span>
                                                        )}
                                                    </button>
                                                </div>
                                            )) : (
                                                <div className="flex justify-between items-center bg-white p-5 rounded-2xl border-2 border-dashed border-slate-100">
                                                    <p className="text-sm text-slate-400 font-medium italic">No hay subtemas definidos para esta unidad.</p>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCopyManual(theme.id)}
                                                        className="text-primary"
                                                    >
                                                        <span className="material-symbols-rounded text-xl mr-2">content_copy</span>
                                                        Copiar Tema
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>

                <div className="hidden lg:flex flex-col items-center justify-center pt-24 sticky top-10">
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>
                    <button
                        onClick={handleCopyAllOfficial}
                        disabled={isCopyingAll || rootBaseThemes.length === 0}
                        className="my-8 size-14 rounded-3xl bg-white border-2 border-slate-100 shadow-2xl shadow-primary/10 flex items-center justify-center text-primary hover:scale-110 hover:border-primary transition-all duration-500 group disabled:opacity-50 disabled:scale-100"
                        title="Sincronizar todo el currículo base"
                    >
                        {isCopyingAll ? (
                            <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <span className="material-symbols-rounded text-3xl group-hover:rotate-180 transition-transform duration-700">double_arrow</span>
                        )}
                    </button>
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>
                </div>

                {/* Contenidos de Usuario */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-rounded text-primary text-xl">edit_note</span>
                            </div>
                            Plan de Desarrollo Curricular
                        </h2>
                        <div className="flex items-center gap-3">
                            <Badge variant="default" className="font-black bg-slate-100 text-slate-500 border-none">
                                {userThemes.length} TEMAS
                            </Badge>
                            <button
                                onClick={() => setIsAddingNew(true)}
                                className="size-10 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:scale-110 active:scale-95"
                                title="Agregar nuevo tema personalizado"
                            >
                                <span className="material-symbols-rounded text-2xl font-black">add</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isAddingNew && (
                            <Card className="editor-container border-2 border-dashed border-primary/30 bg-primary/5 p-6 animate-in zoom-in-95 duration-300">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Crear Nuevo Título / Contenido</h4>
                                        <button onClick={() => setIsAddingNew(false)} className="size-8 flex items-center justify-center rounded-full hover:bg-white text-slate-400 transition-colors">
                                            <span className="material-symbols-rounded text-base">close</span>
                                        </button>
                                    </div>
                                    <input
                                        autoFocus
                                        className="w-full bg-transparent border-b-2 border-primary px-0 py-2 font-black text-xl text-slate-900 focus:outline-none placeholder:text-slate-300 transition-all"
                                        value={newTitle}
                                        placeholder="Título del nuevo tema..."
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && createNewTheme(newTitle)}
                                    />
                                    {isSaving === 'new' && (
                                        <div className="flex items-center gap-2 text-[10px] text-primary font-black uppercase tracking-widest animate-pulse">
                                            <span className="material-symbols-rounded text-base animate-spin">sync</span>
                                            Guardando cambios...
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {userThemes.length === 0 && !isAddingNew ? (
                            <div className="p-16 text-center border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/30">
                                <div className="size-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <span className="material-symbols-rounded text-slate-200 text-4xl">inventory_2</span>
                                </div>
                                <h3 className="text-lg font-black text-slate-400">Sin contenidos aún</h3>
                                <p className="text-sm text-slate-400 mt-1 mb-8 max-w-[240px] mx-auto">Copia del currículo base o crea tus propios temas personalizados.</p>
                                <Button onClick={() => setIsAddingNew(true)} variant="outline" className="px-8">
                                    ¡Comenzar a escribir!
                                </Button>
                            </div>
                        ) : (
                            userThemes.map((theme, idx) => {
                                const subthemes = getUserSubthemes(theme.id);
                                const hasSubthemes = subthemes.length > 0;
                                const isExpanded = expandedUserThemes.has(theme.id);

                                return (
                                    <Card key={theme.id} className="p-0 overflow-hidden border-slate-100 hover:border-primary/20 shadow-soft transition-all group/user">
                                        <div
                                            onClick={() => hasSubthemes && toggleUserTheme(theme.id)}
                                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className={`size-10 flex items-center justify-center rounded-2xl font-black text-sm transition-all shadow-inner ${isExpanded ? 'bg-primary text-white scale-110' : 'bg-slate-100 text-slate-400'}`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    {renderContentItem(theme, false, true)}
                                                </div>
                                            </div>
                                            {hasSubthemes && (
                                                <span className={`material-symbols-rounded size-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-all ${isExpanded ? 'rotate-180 text-primary' : ''}`}>
                                                    expand_more
                                                </span>
                                            )}
                                        </div>

                                        {hasSubthemes && isExpanded && (
                                            <div className="px-5 pb-5 pt-1 space-y-2.5 border-t border-slate-50 bg-slate-50/20">
                                                {subthemes.map((sub, sidx) => (
                                                    <div key={sub.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group/sub transition-all hover:shadow-md">
                                                        <span className="text-[10px] font-black text-slate-300 bg-slate-50 size-6 flex items-center justify-center rounded-lg">{idx + 1}.{sidx + 1}</span>
                                                        <div className="flex-1 ml-4">{renderContentItem(sub, true)}</div>
                                                    </div>
                                                ))}

                                                {isAddingSubthemeTo === theme.id && (
                                                    <div className="bg-white/50 p-4 rounded-2xl border-2 border-dashed border-primary/30 animate-in slide-in-from-top-2 duration-300">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-6 bg-primary/10 rounded-lg flex items-center justify-center">
                                                                <span className="material-symbols-rounded text-primary text-xs">add</span>
                                                            </div>
                                                            <input
                                                                autoFocus
                                                                className="flex-1 bg-transparent border-b border-primary/30 px-0 py-1 text-sm font-bold text-slate-700 focus:outline-none focus:border-primary transition-all placeholder:text-slate-300"
                                                                placeholder="Nombre del nuevo subtema..."
                                                                value={newSubthemeTitle}
                                                                onChange={(e) => setNewSubthemeTitle(e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && createNewSubtheme(theme.id, newSubthemeTitle)}
                                                            />
                                                            <button 
                                                                onClick={() => setIsAddingSubthemeTo(null)}
                                                                className="size-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400"
                                                            >
                                                                <span className="material-symbols-rounded text-sm">close</span>
                                                            </button>
                                                        </div>
                                                        <div className="mt-2 flex justify-end">
                                                            <button 
                                                                onClick={() => createNewSubtheme(theme.id, newSubthemeTitle)}
                                                                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                                                            >
                                                                Crear Subtema (Enter)
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    function renderContentItem(content: UserContent, isSub = false, isHeader = false) {
        const isEditing = editingContentId === content.id;
        return (
            <div className="flex items-center justify-between gap-4 group/item">
                {isEditing ? (
                    <div className="editor-container flex-1" onClick={e => e.stopPropagation()}>
                        <input
                            autoFocus
                            className="w-full bg-transparent border-b-2 border-primary px-0 py-1 font-black text-slate-900 focus:outline-none animate-in fade-in slide-in-from-left-2 duration-300"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && updateContent(content.id)}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={cancelEditing} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-danger p-1">Cancelar</button>
                            <button onClick={() => updateContent(content.id)} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline p-1">Guardar (Enter)</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 flex-1">
                        <h3 
                            className={`${isSub ? 'text-sm font-bold' : 'text-base font-black'} text-slate-800 transition-colors group-hover/item:text-primary cursor-pointer`}
                            onClick={() => startEditing(content)}
                        >
                            {content.titulo}
                        </h3>
                    </div>
                )}

                {!isEditing && (
                    <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-all scale-95 group-hover/item:scale-100" onClick={e => e.stopPropagation()}>
                        <button onClick={() => reorderContent(content, 'up')} className="size-8 flex items-center justify-center text-slate-300 hover:text-primary hover:bg-slate-100 rounded-lg transition-all" title="Subir"><span className="material-symbols-rounded text-lg">arrow_upward</span></button>
                        <button onClick={() => reorderContent(content, 'down')} className="size-8 flex items-center justify-center text-slate-300 hover:text-primary hover:bg-slate-100 rounded-lg transition-all" title="Bajar"><span className="material-symbols-rounded text-lg">arrow_downward</span></button>
                        {isHeader && <button onClick={() => {
                            setIsAddingSubthemeTo(content.id);
                            if (!expandedUserThemes.has(content.id)) {
                                toggleUserTheme(content.id);
                            }
                        }} className="size-8 flex items-center justify-center text-slate-300 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Agregar Subtema"><span className="material-symbols-rounded text-xl">add_box</span></button>}
                        <button onClick={() => startEditing(content)} className="size-8 flex items-center justify-center text-slate-300 hover:text-primary hover:bg-slate-100 rounded-lg transition-all" title="Editar"><span className="material-symbols-rounded text-xl">edit</span></button>
                        <button onClick={() => deleteContent(content.id)} className="size-8 flex items-center justify-center text-slate-300 hover:text-danger hover:bg-danger/10 rounded-lg transition-all" title="Eliminar"><span className="material-symbols-rounded text-xl">delete</span></button>
                    </div>
                )}
            </div>
        );
    }
}
