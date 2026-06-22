'use client';

import React, { Suspense } from 'react';
import { useLibraryController } from '@/hooks/useLibraryController';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { AreaTrabajo, ContentItem } from '@/types';
import { Feedback } from '@/components/ui/feedback';

function ClassCard({ area, isSelected, onClick, isMini = false }: { area: AreaTrabajo, isSelected?: boolean, onClick: () => void, isMini?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`group relative flex flex-col rounded-[2.5rem] border-2 text-left transition-all overflow-hidden ${isMini ? 'p-6' : 'p-8 h-full'} ${isSelected
                ? 'bg-primary border-primary shadow-2xl shadow-primary/20 scale-[1.02]'
                : 'bg-white border-slate-50 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5'
                }`}
        >
            <div className="relative z-10 space-y-4 flex-1 flex flex-col">
                <Badge variant={isSelected ? 'outline' : 'default'} className={`text-[9px] w-fit ${isSelected ? 'border-white/30 text-white' : ''}`}>
                    {area.unidad_educativa.nombre}
                </Badge>

                <div className="flex-1">
                    <h3 className={`font-black tracking-tight leading-tight ${isMini ? 'text-lg' : 'text-2xl'} ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {area.area_conocimiento.nombre}
                    </h3>
                    <p className={`font-bold mt-1 uppercase tracking-wider ${isMini ? 'text-[10px]' : 'text-xs'} ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                        {area.area_conocimiento.grado?.nombre}
                    </p>
                </div>

                <div className={`flex items-center justify-between pt-4 border-t ${isSelected ? 'border-white/10' : 'border-slate-50'}`}>
                    <div className="flex items-center gap-1.5 opacity-60">
                        <span className={`material-symbols-rounded ${isMini ? 'text-lg' : 'text-xl'} ${isSelected ? 'text-white' : ''}`}>calendar_today</span>
                        <span className={`font-black uppercase ${isMini ? 'text-[10px]' : 'text-xs'} ${isSelected ? 'text-white' : 'text-slate-500'}`}>{area.turno.nombre}</span>
                    </div>
                    <div className="flex -space-x-1">
                        {area.paralelos.map((p: any) => (
                            <span key={p.id} className={`rounded-full border-2 border-white flex items-center justify-center font-black shadow-sm ${isMini ? 'w-6 h-6 text-[9px]' : 'w-8 h-8 text-[11px]'} ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                {p.nombre}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {isSelected && (
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
            )}
        </button>
    );
}

function LibraryContent() {
    const {
        query,
        results,
        isSearching,
        areas,
        selectedAreaId,
        isAdmin,
        feedback,
        handleQueryChange,
        handleSearchSubmit,
        useContentInWorkArea,
        navigateToArea,
        hideFeedback
    } = useLibraryController();

    if (feedback.isOpen) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
                <Feedback
                    variant={feedback.type}
                    title={feedback.title}
                    description={feedback.description}
                    onClose={hideFeedback}
                    className="max-w-md w-full shadow-2xl bg-white border border-slate-100"
                />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
            <PageHeader
                title={<>Banco de <span className="text-blue-600">Contenidos</span></>}
                subtitle="Explora y utiliza contenidos oficiales o personalizados para tus planificaciones curriculares."
                icon="collections_bookmark"
                actions={results.length > 0 && isAdmin && (
                    <Badge variant="accent" className="h-10 px-6 rounded-2xl text-[10px] bg-blue-50 text-blue-600 border-blue-100">
                        {results.length} CONTENIDOS ENCONTRADOS
                    </Badge>
                )}
            />

            {/* Unified Search Experience */}
            <div className="relative mb-16">
                <form onSubmit={handleSearchSubmit} className="relative z-10">
                            <div className="group relative max-w-3xl mx-auto">
                                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-20">
                                    <span className="material-symbols-rounded text-slate-400 group-focus-within:text-primary transition-colors text-2xl">search</span>
                                </div>
                                <input
                                    className="w-full bg-white border-2 border-slate-100 rounded-[2.5rem] py-6 pl-16 pr-40 shadow-2xl shadow-slate-200/50 text-xl font-bold placeholder:text-slate-300 focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none transition-all"
                                    placeholder="¿Qué tema deseas planificar hoy?"
                                    value={query}
                                    onChange={(e) => handleQueryChange(e.target.value)}
                                />
                                <div className="absolute inset-y-3 right-3 z-20">
                                    <Button
                                        type="submit"
                                        className="h-full rounded-[2rem] bg-slate-900 text-white px-10 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                                        isLoading={isSearching}
                                    >
                                        <span className="font-black uppercase tracking-widest text-xs">Buscar</span>
                                    </Button>
                                </div>
                            </div>
                        </form>
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl -z-10"></div>
                    </div>

                    <main className="grid grid-cols-1 xl:grid-cols-4 gap-12">
                        <aside className="xl:col-span-1 space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Tus Clases</h2>
                                <span className="material-symbols-rounded text-slate-300">hub</span>
                            </div>
                            <div className="flex flex-col gap-4">
                                {areas.map((area) => (
                                    <ClassCard
                                        key={area.id}
                                        area={area}
                                        isSelected={String(selectedAreaId) === String(area.id)}
                                        onClick={() => navigateToArea(area.id)}
                                        isMini
                                    />
                                ))}
                            </div>
                        </aside>

                        <section className="xl:col-span-3 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {results.length > 0 ? (
                                    results.map((item: ContentItem & { area_trabajo_id?: string }) => (
                                        <Card
                                            key={item.id}
                                            onClick={() => {
                                                if (item.is_base) {
                                                    useContentInWorkArea(item.id);
                                                } else if (item.area_trabajo_id) {
                                                    navigateToArea(item.area_trabajo_id);
                                                }
                                            }}
                                            className="p-10 rounded-[4rem] group hover:scale-[1.02] active:scale-[0.98] border-none shadow-2xl shadow-slate-200/50 hover:shadow-primary/10 transition-all cursor-pointer bg-white"
                                        >
                                            <div className="flex flex-col h-full">
                                                <div className="flex items-start justify-between mb-8">
                                                    <Badge variant={item.is_base ? 'accent' : 'outline'} className="rounded-xl px-4 py-1.5 text-[9px]">
                                                        {item.is_base ? 'BASE OFICIAL' : 'PERSONALIZADO'}
                                                    </Badge>
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                        <span className="material-symbols-rounded">auto_awesome</span>
                                                    </div>
                                                </div>

                                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors leading-[1.1] mb-4">
                                                    {item.titulo}
                                                </h3>

                                                {item.trimestre && (
                                                    <p className="text-sm font-bold text-slate-400 mb-8 flex items-center gap-2">
                                                        <span className="material-symbols-rounded text-lg">event_note</span>
                                                        {item.trimestre} Trimestre
                                                    </p>
                                                )}

                                                <div className="mt-auto flex items-center justify-between pt-8 border-t border-slate-50">
                                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                                        Dificultad: Estándar
                                                    </div>
                                                    <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                        {item.is_base ? 'AÑADIR A MI PLAN' : 'VER MI CONTENIDO'}
                                                        <span className="material-symbols-rounded text-xl">{item.is_base ? 'add_circle' : 'arrow_forward'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    !isSearching && (
                                        <div className="col-span-full py-32 flex flex-col items-center justify-center bg-slate-50/50 rounded-[4rem] border-4 border-dashed border-slate-100">
                                            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl mb-8">
                                                <span className="material-symbols-rounded text-6xl text-slate-200">manage_search</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-2">No encontramos nada</h3>
                                            <p className="text-slate-400 font-medium text-center max-w-sm px-6">
                                                Intenta con otros términos de búsqueda o selecciona una clase diferente.
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        </section>
                    </main>
        </div>
    );
}

export default function LibraryPage() {
    return (
        <Suspense fallback={
            <div className="p-8 max-w-7xl mx-auto animate-pulse">
                <div className="h-32 bg-slate-50 rounded-[3rem] mb-12"></div>
                <div className="h-20 bg-slate-50 rounded-[2.5rem] mb-16 max-w-3xl mx-auto"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="h-60 bg-slate-50 rounded-[2.5rem]"></div>
                    <div className="h-60 bg-slate-50 rounded-[2.5rem]"></div>
                    <div className="h-60 bg-slate-50 rounded-[2.5rem]"></div>
                </div>
            </div>
        }>
            <LibraryContent />
        </Suspense>
    );
}
