'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useObjetivosAprendizaje } from '@/hooks/useObjetivosAprendizaje';

// Modular Components
import { VerbSelector } from './components/VerbSelector';
import { ContentSelector } from './components/ContentSelector';
import { ComplementSelector } from './components/ComplementSelector';
import { SavedObjectivesList } from './components/SavedObjectivesList';
import { ObjectiveDraft } from './components/ObjectiveDraft';

export function ObjetivosAprendizaje() {
    const {
        currentObjective,
        setCurrentObjective,
        sortedVerbos,
        hoveredVerb,
        setHoveredVerb,
        verbFilters,
        showFilters,
        setShowFilters,
        toggleNivelFilter,
        setVerbFilters,
        catalogoVerbos,
        filteredContentsForDesign,
        expandedTitles,
        learningObjectives = [],
        complementCategories,
        selectedCompCategory,
        setSelectedCompCategory,
        filteredComplementos,
        hoveredComplement,
        setHoveredComplement,
        catalogoComplementos,
        complementSearch,
        setComplementSearch,
        addStrategicObjective,
        removeStrategicObjective,
        aiOptions,
        handleToggleVerb,
        handleToggleContent,
        handleToggleComplement,
        handleToggleExpanded,
        isStep6Complete,
        pendingContentsCount,
        loadObjectiveForEdit
    } = useObjetivosAprendizaje();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700 pt-6">
            <div className="flex flex-col gap-10">
                {/* Top: Generator Selector & Input Form */}
                <div className="w-full space-y-10">
                    <Card className="p-8 space-y-10 rounded-[2.5rem] border-none shadow-premium bg-white/80 backdrop-blur-xl">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Configuración de Objetivos</h3>
                                <div className="flex items-center gap-3">
                                    <div className="h-px w-12 bg-blue-600"></div>
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Arquitectura: Verbo + Contenido + Contexto</p>
                                </div>
                            </div>
                            <div className="size-16 bg-blue-50 rounded-[2rem] flex items-center justify-center shadow-soft border border-blue-100/50">
                                <span className="material-symbols-rounded text-3xl text-blue-600">psychology</span>
                            </div>
                        </div>

                        {/* Paso 1: Verbos */}
                        <VerbSelector
                            sortedVerbos={sortedVerbos}
                            currentObjective={currentObjective}
                            hoveredVerb={hoveredVerb}
                            setHoveredVerb={setHoveredVerb}
                            showFilters={showFilters}
                            setShowFilters={setShowFilters}
                            verbFilters={verbFilters}
                            setVerbFilters={setVerbFilters}
                            toggleNivelFilter={toggleNivelFilter}
                            catalogoVerbos={catalogoVerbos}
                            onToggleVerb={handleToggleVerb}
                        />

                        {/* Paso 2: Contenidos */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <p className="soft-label !mb-0">Contenidos del Mes</p>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isStep6Complete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {isStep6Complete ? 'Cobertura Completa' : `Pendientes: ${pendingContentsCount}`}
                                </div>
                            </div>
                            <ContentSelector
                                availableContents={filteredContentsForDesign}
                                currentObjective={currentObjective}
                                expandedTitles={expandedTitles}
                                learningObjectives={learningObjectives}
                                onToggleContent={handleToggleContent}
                                onToggleExpanded={handleToggleExpanded}
                            />
                        </div>

                        {/* Paso 3: Complementos */}
                        <ComplementSelector
                            complementCategories={complementCategories}
                            selectedCompCategory={selectedCompCategory}
                            setSelectedCompCategory={setSelectedCompCategory}
                            filteredComplementos={filteredComplementos}
                            complementSearch={complementSearch}
                            setComplementSearch={setComplementSearch}
                            currentObjective={currentObjective}
                            hoveredComplement={hoveredComplement}
                            setHoveredComplement={setHoveredComplement}
                            catalogoComplementos={catalogoComplementos}
                            onToggleComplement={handleToggleComplement}
                        />

                        {/* Draft & Save */}
                        <ObjectiveDraft
                            currentObjective={currentObjective}
                            setCurrentObjective={setCurrentObjective}
                            addStrategicObjective={addStrategicObjective}
                        />
                    </Card>
                </div>

                {/* AI Suggestions & Saved List */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">

                    <SavedObjectivesList
                        learningObjectives={learningObjectives}
                        onRemove={removeStrategicObjective}
                        onEdit={loadObjectiveForEdit}
                    />
                </div>
            </div>

            <style jsx>{`
                :global(.soft-label) {
                    @apply text-[11px] font-[900] text-slate-800 uppercase tracking-[0.2em] px-1 mb-2 font-black;
                }
                .shadow-premium {
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
                }
                .shadow-glow {
                    box-shadow: 0 0 20px rgba(37, 99, 235, 0.3);
                }
            `}</style>
        </div>
    );
}
