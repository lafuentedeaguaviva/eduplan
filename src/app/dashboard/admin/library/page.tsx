'use client';

import React, { Suspense } from 'react';
import { useLibraryController } from '@/hooks/useLibraryController';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { AreaTrabajo, ContentItem } from '@/types';
import { Feedback } from '@/components/ui/feedback';

function GlobalLibraryContent() {
    const {
        query,
        results,
        isSearching,
        areas,
        selectedAreaId,
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
                subtitle="Explora y utiliza contenidos oficiales o personalizados para tus planificaciones curriculares desde el repositorio global."
                icon="admin_panel_settings"
            />

            {/* Global Search Bar - Exact image match */}
            <div className="relative mb-20">
                <form onSubmit={handleSearchSubmit} className="relative z-10">
                    <div className="group relative max-w-4xl mx-auto">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-20">
                            <span className="material-symbols-rounded text-slate-400 group-focus-within:text-primary transition-colors text-2xl">search</span>
                        </div>
                        <input
                            className="w-full bg-white border-2 border-slate-100 rounded-[3rem] py-7 pl-16 pr-44 shadow-2xl shadow-slate-200/50 text-xl font-bold placeholder:text-slate-300 focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none transition-all"
                            placeholder="¿Qué tema deseas planificar hoy?"
                            value={query}
                            onChange={(e) => handleQueryChange(e.target.value)}
                        />
                        <div className="absolute inset-y-3.5 right-3.5 z-20">
                            <Button
                                type="submit"
                                className="h-full rounded-[2.5rem] bg-slate-900 text-white px-12 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20"
                                isLoading={isSearching}
                            >
                                <span className="font-black uppercase tracking-widest text-xs">Buscar</span>
                            </Button>
                        </div>
                    </div>
                </form>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
            </div>

            <main className="grid grid-cols-1 xl:grid-cols-4 gap-12">
                {/* Global Filters / Areas */}
                <aside className="xl:col-span-1 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <span className="material-symbols-rounded text-lg">hub</span>
                            Tus Clases
                        </h2>
                    </div>

                    <div className="flex flex-col gap-4">
                        {areas.map((area: AreaTrabajo) => {
                            const isSelected = String(selectedAreaId) === String(area.id);
                            return (
                                <button
                                    key={area.id}
                                    onClick={() => navigateToArea(area.id)}
                                    className={`group relative flex flex-col p-6 rounded-[2.5rem] border-2 text-left transition-all overflow-hidden ${isSelected
                                        ? 'bg-blue-600 border-blue-600 shadow-2xl shadow-blue-600/20 scale-[1.02]'
                                        : 'bg-white border-slate-50 hover:border-blue-600/20 hover:shadow-xl hover:shadow-blue-600/5'
                                        }`}
                                >
                                    <div className="relative z-10 space-y-4">
                                        <Badge variant={isSelected ? 'outline' : 'default'} className={`text-[9px] ${isSelected ? 'border-white/30 text-white' : ''}`}>
                                            {area.unidad_educativa.nombre}
                                        </Badge>

                                        <div>
                                            <h3 className={`font-black text-lg leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                                {area.area_conocimiento.nombre}
                                            </h3>
                                            <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                                                {area.area_conocimiento.grado?.nombre}
                                            </p>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Results Area */}
                <section className="xl:col-span-3 space-y-10">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                            Resultados Disponibles
                        </h2>
                        {results.length > 0 && (
                            <Badge variant="accent" className="h-8 px-4 rounded-xl text-[9px] bg-blue-50 text-blue-600 border-blue-100 font-black">
                                {results.length} CONTENIDOS
                            </Badge>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {results.length > 0 ? (
                            results.map((item: ContentItem) => (
                                <Card
                                    key={item.id}
                                    className="p-10 rounded-[4rem] group border-none shadow-2xl shadow-slate-200/50 hover:shadow-blue-600/10 transition-all bg-white"
                                >
                                    <div className="flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-8">
                                            <Badge variant={item.is_base ? 'accent' : 'outline'} className="rounded-xl px-4 py-1.5 text-[9px]">
                                                {item.is_base ? 'BASE OFICIAL' : 'PERSONALIZADO'}
                                            </Badge>
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                                <span className="material-symbols-rounded">category</span>
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-[1.1] mb-4">
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
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => useContentInWorkArea(item.id)}
                                                className="text-blue-600 font-black text-[10px] hover:bg-blue-50 tracking-widest uppercase"
                                            >
                                                Copiar a mi área
                                                <span className="material-symbols-rounded text-sm ml-2">content_copy</span>
                                            </Button>
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
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Búsqueda Global</h3>
                                    <p className="text-slate-400 font-medium text-center max-w-sm px-6">
                                        Usa el buscador superior para encontrar contenidos en el repositorio base del sistema.
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

export default function GlobalLibraryPage() {
    return (
        <Suspense fallback={
            <div className="p-8 max-w-7xl mx-auto animate-pulse">
                <div className="h-40 bg-slate-50 rounded-[3rem] mb-12"></div>
                <div className="h-24 bg-slate-50 rounded-[3rem] mb-16 max-w-4xl mx-auto"></div>
                <div className="grid grid-cols-4 gap-12">
                    <div className="col-span-1 space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-50 rounded-2xl"></div>)}
                    </div>
                    <div className="col-span-3 grid grid-cols-2 gap-8">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-80 bg-slate-50 rounded-[4rem]"></div>)}
                    </div>
                </div>
            </div>
        }>
            <GlobalLibraryContent />
        </Suspense>
    );
}

