'use client';

import React from 'react';
import { useCriteriosEvaluacion } from '@/hooks/useCriteriosEvaluacion';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { CriteriosTabs } from './components/CriteriosTabs';
import { CriteriosSelector } from './components/CriteriosSelector';
import { CriteriosItemDetail } from './components/CriteriosItemDetail';
import { CriteriosEditor } from './components/CriteriosEditor';
import { CriteriosSavedList } from './components/CriteriosSavedList';
import { 
    Library, 
    ClipboardCheck, 
    ShieldCheck,
    Trophy
} from 'lucide-react';

export const Step9CriteriosEvaluacion: React.FC = () => {
    const {
        activeTab, setActiveTab,
        isSaving,
        selectedType,

        // Libraries & Lists
        libSer, libSaber, libHacer, libAdaptacion,
        savedSer, savedSaber, savedHacer, savedAdaptacion,

        // Filters
        filtersSer, setFiltersSer, availableCategoriesSer, filteredSubcategoriesSer, filteredNombresSer,
        filtersSaber, setFiltersSaber, availableNivelesSaber, filteredSubnivelesSaber, filteredVerbosSaber,
        filtersHacer, setFiltersHacer, availableNivelesHacer, filteredSubnivelesHacer, filteredVerbosHacer,
        filtersAdaptacion, setFiltersAdaptacion, availableCondicionesAdapt, availableNombresAdapt, filteredNombresAdapt,

        selectedLibItem, setSelectedLibItem,

        // Editing Items
        editingSer, setEditingSer,
        editingSaber, setEditingSaber,
        editingHacer, setEditingHacer,
        editingAdaptacion, setEditingAdaptacion,

        // Handlers
        handlePushToEditor,
        handleSaveSer, handleSaveSaber, handleSaveHacer, handleSaveAdaptacion,
        handleDeleteSer, handleDeleteSaber, handleDeleteHacer, handleDeleteAdaptacion
    } = useCriteriosEvaluacion();

    // Auto-seleccionar ítem de adaptación al elegir el nombre (Nivel 2) para mostrar Ficha Técnica
    React.useEffect(() => {
        if (activeTab === 'adaptacion' && filtersAdaptacion.nombre && libAdaptacion.length > 0) {
            const item = libAdaptacion.find(i => 
                i.condicion === filtersAdaptacion.condicion && 
                i.nombre_adaptacion === filtersAdaptacion.nombre
            );
            if (item) setSelectedLibItem(item);
        }
    }, [filtersAdaptacion.nombre, filtersAdaptacion.condicion, activeTab, libAdaptacion, setSelectedLibItem]);


    // Mapping based on active tab
    const getTabData = () => {
        switch (activeTab) {
            case 'ser': return {
                lib: libSer, saved: savedSer, filters: filtersSer, setFilters: setFiltersSer,
                data1: availableCategoriesSer, data2: filteredSubcategoriesSer, data3: filteredNombresSer,
                editing: editingSer, setEditing: setEditingSer, onSave: handleSaveSer, onDelete: handleDeleteSer
            };
            case 'saber': return {
                lib: libSaber, saved: savedSaber, filters: filtersSaber, setFilters: setFiltersSaber,
                data1: availableNivelesSaber, data2: filteredSubnivelesSaber, data3: filteredVerbosSaber,
                editing: editingSaber, setEditing: setEditingSaber, onSave: handleSaveSaber, onDelete: handleDeleteSaber
            };
            case 'hacer': return {
                lib: libHacer, saved: savedHacer, filters: filtersHacer, setFilters: setFiltersHacer,
                data1: availableNivelesHacer, data2: filteredSubnivelesHacer, data3: filteredVerbosHacer,
                editing: editingHacer, setEditing: setEditingHacer, onSave: handleSaveHacer, onDelete: handleDeleteHacer
            };
            case 'adaptacion': return {
                lib: libAdaptacion, saved: savedAdaptacion, filters: filtersAdaptacion, setFilters: setFiltersAdaptacion,
                data1: availableCondicionesAdapt, data2: availableNombresAdapt, data3: filteredNombresAdapt,
                editing: editingAdaptacion, setEditing: setEditingAdaptacion, onSave: handleSaveAdaptacion, onDelete: handleDeleteAdaptacion
            };
        }
    };

    const tabData = getTabData();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000 pb-20">
            {/* 1. Header Area */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
                        <Trophy className="w-5 h-5 text-amber-400" />
                    </div>
                    <Badge variant="outline" className="font-black uppercase tracking-[0.25em] text-[10px] py-1.5 px-4 bg-white border-slate-200 shadow-sm">
                        Fase de Valoración Integral
                    </Badge>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                            Criterios de Evaluación
                        </h1>
                        <p className="text-slate-500 font-bold text-lg opacity-80">
                            Define cómo se valorará el desarrollo de capacidades en las cuatro dimensiones.
                        </p>
                    </div>
                </div>
            </div>

            <Card className="p-0 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] bg-slate-50/30 backdrop-blur-sm min-h-[800px] flex flex-col overflow-hidden rounded-[3rem] ring-1 ring-slate-200/50">
                {/* Tab Navigation */}
                <div className="p-4 bg-white/80 border-b border-slate-100/50 backdrop-blur-md">
                    <CriteriosTabs activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setSelectedLibItem(null); }} />
                </div>

                {/* Workspace */}
                <div className="p-8 flex-1 relative flex flex-col space-y-8">

                    {/* Biblioteca Selector */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/10 p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                            <Library className="w-32 h-32 text-slate-900" />
                        </div>
                        <div className="flex items-center gap-4 mb-8 relative z-10">
                            <div className="size-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-white">
                                <Library className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Biblioteca de Criterios</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">Explora y selecciona</p>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <CriteriosSelector
                                tab={activeTab}
                                filters={tabData.filters}
                                setFilters={tabData.setFilters}
                                data1={tabData.data1}
                                data2={tabData.data2}
                                data3={tabData.data3}
                                onSelectItem={setSelectedLibItem}
                            />
                        </div>
                    </div>

                    {/* 3-Column Workspace */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Column 1: Detalle */}
                        <div className="lg:col-span-3">
                            <CriteriosItemDetail
                                tab={activeTab}
                                item={selectedLibItem}
                                onPush={handlePushToEditor}
                                selectedType={selectedType ?? undefined}
                            />
                        </div>

                        {/* Column 2: Editor */}
                        <div className="lg:col-span-5">
                            <CriteriosEditor
                                tab={activeTab}
                                editingItem={tabData.editing}
                                setEditingItem={tabData.setEditing}
                                onSave={tabData.onSave}
                                isSaving={isSaving}
                            />
                        </div>

                        {/* Column 3: Lista de Guardados */}
                        <div className="lg:col-span-4">
                            <div className="bg-white/60 backdrop-blur-sm rounded-[3rem] border border-slate-200/60 shadow-xl shadow-slate-200/5 p-8 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-8 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                                            <ClipboardCheck className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Criterios Guardados</h3>
                                    </div>
                                    <div className="bg-slate-100/80 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-500 border border-slate-200/50 shadow-inner">
                                        TOTAL: {tabData.saved.length}
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <CriteriosSavedList
                                        tab={activeTab}
                                        items={tabData.saved}
                                        onEdit={tabData.setEditing}
                                        onDelete={tabData.onDelete}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white/80 backdrop-blur-md border-t border-slate-100/50 px-10 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                        <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                            <ShieldCheck className="w-4 h-4 text-slate-300" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                            Protocolo de Evaluación Curricular • Stitch V2.0
                        </span>
                    </div>
                </div>
            </Card>

        </div>
    );
};
