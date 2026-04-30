'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
    useMomentosProceso,
    EMPTY_EDITING_ITEM, EMPTY_EDITING_THEORY, EMPTY_EDITING_PRODUCCION,
    EMPTY_EDITING_VALORACION, EMPTY_EDITING_ADAPTACION, EMPTY_EDITING_RECURSO, EMPTY_EDITING_FUENTE
} from '@/hooks/useMomentosProceso';
import { FuentesService } from '@/services/fuentes.service';
import { TipoFuente } from '@/types';
import { useState, useEffect } from 'react';

// Modular Components
import { WeekSidebar } from './components/WeekSidebar';
import { MomentoTabs } from './components/MomentoTabs';
import { MomentoLibrary } from './components/MomentoLibrary';
import { MomentoEditor } from './components/MomentoEditor';
import { MomentoItemDetail } from './components/MomentoItemDetail';
import { MomentoSavedList } from './components/MomentoSavedList';
import { MomentoConsolidator } from './components/MomentoConsolidator';

export function MomentosProceso() {
    const {
        activeWeek, setActiveWeek,
        activeTab, setActiveTab,
        library, selectedLibraryItem, setSelectedLibraryItem,
        editingItem, setEditingItem,
        selectedProposito, setSelectedProposito,
        selectedTipo, setSelectedTipo,
        theoryLibrary, selectedTheoryLibraryItem, setSelectedTheoryLibraryItem,
        editingTheoryItem, setEditingTheoryItem,
        selectedTheoryTipo, setSelectedTheoryTipo,
        selectedTheorySubtipo, setSelectedTheorySubtipo,
        produccionLibrary, selectedProduccionLibraryItem, setSelectedProduccionLibraryItem,
        editingProduccionItem, setEditingProduccionItem,
        selectedProduccionNivel, setSelectedProduccionNivel,
        selectedProduccionSubnivel, setSelectedProduccionSubnivel,
        selectedProduccionTipo, setSelectedProduccionTipo,
        valoracionLibrary, selectedValoracionLibraryItem, setSelectedValoracionLibraryItem,
        editingValoracionItem, setEditingValoracionItem,
        selectedValoracionCategoria, setSelectedValoracionCategoria,
        adaptacionesLibrary, selectedAdaptacionLibraryItem, setSelectedAdaptacionLibraryItem,
        editingAdaptacionItem, setEditingAdaptacionItem,
        selectedAdaptacionTipo, setSelectedAdaptacionTipo,
        selectedAdaptacionSituacion, setSelectedAdaptacionSituacion,
        recursosLibrary, selectedRecursoLibraryItem, setSelectedRecursoLibraryItem,
        editingRecursoItem, setEditingRecursoItem,
        selectedRecursoTipo, setSelectedRecursoTipo,
        fuentesLibrary, selectedFuenteLibraryItem, setSelectedFuenteLibraryItem,
        editingFuenteItem, setEditingFuenteItem,
        selectedFuenteTipo, setSelectedFuenteTipo,
        isEditingExistingFuente,
        isSaving,
        currentMomentos,
        handleUpdateMomento,
        handleSavePractica, handleDeletePractica,
        handleSaveTheory, handleDeleteTheory,
        handleSaveProduccion, handleDeleteProduccion,
        handleSaveValoracion, handleDeleteValoracion,
        handleSaveAdaptacion, handleDeleteAdaptacion,
        handleSaveRecurso, handleDeleteRecurso,
        handleSaveMiFuente, handleSaveFuenteToPlanning, handleDeleteFuente, handleEditFuenteFromLibrary,
        consolidatedMomentos, setConsolidatedMomentos,
        handleSaveConsolidated, handleSyncResourcesAndSources,
        isConsolidated,
        weekContentsMap,
        selectedType
    } = useMomentosProceso();


    // ── Catálogo de tipos de fuente (cargado una vez desde tipo_fuente) ──────────
    const [tiposFuenteCatalogo, setTiposFuenteCatalogo] = React.useState<TipoFuente[]>([]);
    React.useEffect(() => {
        FuentesService.getTiposFuente().then(res => {
            if (res.data) setTiposFuenteCatalogo(res.data);
        });
    }, []);

    // ── Config visual por tipo de PDC ─────────────────────────────────────────
    const typeConfig = {
        1: { color: 'rose', accent: 'rose-600', light: 'rose-50' },
        2: { color: 'amber', accent: 'amber-600', light: 'amber-50' },
        3: { color: 'indigo', accent: 'indigo-600', light: 'indigo-50' },
        4: { color: 'emerald', accent: 'emerald-600', light: 'emerald-50' },
    }[selectedType || 2] || { color: 'slate', accent: 'slate-600', light: 'slate-50' };

    // ── Definición de tabs (sin herramientas) ─────────────────────────────────
    const momentos = [
        { id: 'practica', label: 'Práctica', icon: 'auto_fix', color: 'rose-500', bg: 'bg-rose-50', text: 'text-rose-600', accent: 'rose-600' },
        { id: 'teoria', label: 'Teoría', icon: 'menu_book', color: 'indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-600', accent: 'indigo-600' },
        { id: 'produccion', label: 'Producción', icon: 'construction', color: 'amber-500', bg: 'bg-amber-50', text: 'text-amber-600', accent: 'amber-600' },
        { id: 'valoracion', label: 'Valoración', icon: 'verified', color: 'emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600', accent: 'emerald-600' },
        { id: 'adaptaciones', label: 'Adaptaciones', icon: 'accessibility_new', color: 'violet-500', bg: 'bg-violet-50', text: 'text-violet-600', accent: 'violet-600' },
        { id: 'recursos', label: 'Recursos', icon: 'inventory_2', color: 'sky-500', bg: 'bg-sky-50', text: 'text-sky-600', accent: 'sky-600' },
        { id: 'fuentes', label: 'Fuentes', icon: 'import_contacts', color: 'orange-500', bg: 'bg-orange-50', text: 'text-orange-600', accent: 'orange-600' },
        { id: 'proceso', label: 'Consolidación', icon: 'reorder', color: 'blue-500', bg: 'bg-blue-50', text: 'text-blue-600', accent: 'blue-600' },
    ] as const;

    const activeMomentoConfig = momentos.find(m => m.id === activeTab) || momentos[0];

    // ── Accent map para editor y lista ────────────────────────────────────────
    const accentByTab: Record<string, string> = {
        practica: 'rose-600',
        teoria: 'indigo-600',
        produccion: 'amber-600',
        valoracion: 'emerald-600',
        adaptaciones: 'violet-600',
        recursos: 'sky-600',
        fuentes: 'orange-600',
        proceso: 'blue-600'
    };
    const activeAccentColor = accentByTab[activeTab] || 'blue-600';

    // ── Ejemplo por nivel educativo ───────────────────────────────────────────
    const getExampleByLevel = (item: any) => {
        if (!item) return '';
        switch (selectedType) {
            case 1: return item.ejemplo_inicial || item.ejemplo || item.descripcion_concreta || item.descripcion_situacion || '';
            case 2: return item.ejemplo_primaria || item.ejemplo || item.descripcion_concreta || item.descripcion_situacion || '';
            case 3: return item.ejemplo_secundaria || item.ejemplo || item.descripcion_concreta || item.descripcion_situacion || '';
            case 4: return item.ejemplo_multigrado || item.ejemplo || item.descripcion_concreta || item.descripcion_situacion || '';
            default: return item.ejemplo_primaria || item.ejemplo || item.descripcion_concreta || '';
        }
    };

    // ── Llevar biblioteca al editor ───────────────────────────────────────────
    // ── Llevar biblioteca al editor y GUARDAR automáticamente ────────────────
    const handlePushToEditor = async (libraryItem: any) => {
        console.log('[MomentosProceso] Llevando item a panel:', libraryItem);
        
        if (activeTab === 'fuentes') {
            await handleSaveFuenteToPlanning(libraryItem);
            return;
        }

        // Para el resto de momentos, seteamos el editor (visual) y guardamos
        if (activeTab === 'practica') {
            const newItem = {
                ...EMPTY_EDITING_ITEM,
                nombre_practica: libraryItem.nombre_practica,
                descripcion: libraryItem.redactado || libraryItem.descripcion_concreta || '',
                redactado: libraryItem.redactado || libraryItem.descripcion_concreta || '',
                preguntas: libraryItem.preguntas || '',
                proposito: libraryItem.proposito || '',
                tipo: libraryItem.tipo || '',
                apto_para: libraryItem.apto_para || '',
                descripcion_concreta: libraryItem.descripcion_concreta || '',
                codigo_biblioteca_practica: String(libraryItem.id || libraryItem.id_practica || '')
            };
            setEditingItem(newItem);
        } else if (activeTab === 'teoria') {
            setEditingTheoryItem({
                ...EMPTY_EDITING_THEORY,
                nombre_estrategia_teorica: libraryItem.nombre_estrategia_teorica,
                redactado: libraryItem.redactado || libraryItem.descripcion_concreta || '',
                descripcion_concreta: libraryItem.descripcion_concreta || '',
                proposito: libraryItem.proposito || '',
                tipo: libraryItem.tipo || '',
                apto_para: libraryItem.apto_para || '',
                codigo_biblioteca_teoria: String(libraryItem.id_teoria || '')
            });
        } else if (activeTab === 'produccion') {
            setEditingProduccionItem({
                ...EMPTY_EDITING_PRODUCCION,
                nombre_produccion: libraryItem.nombre_produccion,
                descripcion_concreta: libraryItem.descripcion_concreta || '',
                nivel: libraryItem.nivel || '',
                subnivel: libraryItem.subnivel || '',
                tipo: libraryItem.tipo || '',
                apto_para: libraryItem.apto_para || '',
                redactado: libraryItem.redactado || libraryItem.descripcion_concreta || '',
                instrumento: libraryItem.instrumento || '',
                codigo_biblioteca_produccion: String(libraryItem.id_produccion || '')
            });
        } else if (activeTab === 'valoracion') {
            setEditingValoracionItem({
                ...EMPTY_EDITING_VALORACION,
                categoria: libraryItem.categoria,
                preguntas: libraryItem.preguntas || '',
                redactado: libraryItem.redactado || libraryItem.preguntas || '',
                instrumento: libraryItem.instrumento || '',
                apto_para: libraryItem.apto_para || '',
                proposito: libraryItem.proposito || '',
                subcategoria: libraryItem.subcategoria || '',
                codigo_biblioteca_valoracion: libraryItem.id_valoracion
            });
        } else if (activeTab === 'adaptaciones') {
            setEditingAdaptacionItem({
                ...EMPTY_EDITING_ADAPTACION,
                nombre_adaptacion: libraryItem.nombre_adaptacion || '',
                tipo: libraryItem.tipo || '',
                situacion: libraryItem.situacion || '',
                descripcion_situacion: libraryItem.descripcion_situacion || '',
                redactado: libraryItem.redactado || libraryItem.descripcion_situacion || '',
                apto_para: libraryItem.apto_para || '',
                codigo_biblioteca_adaptacion: libraryItem.id_adaptacion_basica || null
            });
        } else if (activeTab === 'recursos') {
            setEditingRecursoItem({
                ...EMPTY_EDITING_RECURSO,
                recursos: libraryItem.recursos || '',
                tipo: libraryItem.tipo || '',
                redactado: libraryItem.redactado || libraryItem.recursos || '',
                apto_para: libraryItem.apto_para || '',
                ejemplo: libraryItem.ejemplo || '',
                codigo_biblioteca_recursos: libraryItem.id_recursos || null
            });
        }
    };

    // ── Editar elemento guardado ──────────────────────────────────────────────
    const handleEditSavedItem = (item: any) => {
        if (activeTab === 'practica') setEditingItem(item);
        else if (activeTab === 'teoria') setEditingTheoryItem(item);
        else if (activeTab === 'produccion') setEditingProduccionItem(item);
        else if (activeTab === 'valoracion') setEditingValoracionItem(item);
        else if (activeTab === 'adaptaciones') setEditingAdaptacionItem(item);
        else if (activeTab === 'recursos') setEditingRecursoItem(item);
        else if (activeTab === 'fuentes') setEditingFuenteItem(item);
    };

    // ── Delete dispatcher ─────────────────────────────────────────────────────
    const handleDelete = (id: any) => {
        if (activeTab === 'practica') handleDeletePractica(id);
        else if (activeTab === 'teoria') handleDeleteTheory(id);
        else if (activeTab === 'produccion') handleDeleteProduccion(id);
        else if (activeTab === 'valoracion') handleDeleteValoracion(id);
        else if (activeTab === 'adaptaciones') handleDeleteAdaptacion(id);
        else if (activeTab === 'recursos') handleDeleteRecurso(id);
        else if (activeTab === 'fuentes') handleDeleteFuente(id);
    };

    // ── Layout de columnas (Fuentes invierte Detalle y Editor) ────────────────
    const isFuentesTab = activeTab === 'fuentes';

    const editorPanel = (
        <MomentoEditor
            activeTab={activeTab}
            activeMomentoConfig={{
                icon: activeMomentoConfig.icon,
                label: activeMomentoConfig.label,
                accent: activeAccentColor,
                color: activeMomentoConfig.color
            }}
            isSaving={isSaving}
            editingItem={editingItem}
            setEditingItem={setEditingItem}
            handleSavePractica={handleSavePractica}
            editingTheoryItem={editingTheoryItem}
            setEditingTheoryItem={setEditingTheoryItem}
            handleSaveTheory={handleSaveTheory}
            editingProduccionItem={editingProduccionItem}
            setEditingProduccionItem={setEditingProduccionItem}
            handleSaveProduccion={handleSaveProduccion}
            editingValoracionItem={editingValoracionItem}
            setEditingValoracionItem={setEditingValoracionItem}
            handleSaveValoracion={handleSaveValoracion}
            editingAdaptacionItem={editingAdaptacionItem}
            setEditingAdaptacionItem={setEditingAdaptacionItem}
            handleSaveAdaptacion={handleSaveAdaptacion}
            editingRecursoItem={editingRecursoItem}
            setEditingRecursoItem={setEditingRecursoItem}
            handleSaveRecurso={handleSaveRecurso}
            editingFuenteItem={editingFuenteItem}
            setEditingFuenteItem={setEditingFuenteItem}
            handleSaveMiFuente={handleSaveMiFuente}
            isEditingExistingFuente={isEditingExistingFuente}
            tiposFuenteCatalogo={tiposFuenteCatalogo}
        />
    );

    const detailPanel = (
        <div className="lg:col-span-3 space-y-4">
            <MomentoItemDetail
                activeTab={activeTab}
                selectedLibraryItem={selectedLibraryItem}
                selectedTheoryLibraryItem={selectedTheoryLibraryItem}
                selectedProduccionLibraryItem={selectedProduccionLibraryItem}
                selectedValoracionLibraryItem={selectedValoracionLibraryItem}
                selectedAdaptacionLibraryItem={selectedAdaptacionLibraryItem}
                selectedRecursoLibraryItem={selectedRecursoLibraryItem}
                selectedFuenteLibraryItem={selectedFuenteLibraryItem}
                getExampleByLevel={getExampleByLevel}
                onPushToEditor={handlePushToEditor}
                onEditFuenteInLibrary={handleEditFuenteFromLibrary}
            />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <Badge variant="outline" className={`w-fit font-black uppercase tracking-[0.2em] text-[10px] text-${typeConfig.accent} bg-${typeConfig.light} border-${typeConfig.color}-100`}>
                    Paso 8: Momentos Metodológicos del PDC
                </Badge>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                            Desarrollo del Proceso Pedagógico
                        </h1>
                        <p className="text-slate-500 font-medium">Configura las actividades estratégicas para cada momento de la semana seleccionada.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Semana Sidebar */}
                <WeekSidebar
                    activeWeek={activeWeek}
                    setActiveWeek={setActiveWeek}
                    weekContentsMap={weekContentsMap}
                    typeConfig={typeConfig}
                />

                {/* Main Content */}
                <div className="lg:col-span-11 space-y-6">
                    <Card className="p-0 border-none shadow-premium bg-slate-50/50 min-h-[700px] flex flex-col overflow-hidden rounded-3xl">
                        {/* Tab Navigation */}
                        <MomentoTabs
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            momentos={momentos}
                        />

                        {/* Workspace */}
                        <div className="p-6 flex-1 relative flex flex-col space-y-6">
                            {/* Sección Superior: Selectores de Biblioteca (Ocultar en Consolidación) */}
                            {activeTab !== 'proceso' && (
                                <MomentoLibrary
                                    activeTab={activeTab}
                                    library={library}
                                    selectedProposito={selectedProposito}
                                    setSelectedProposito={setSelectedProposito}
                                    selectedTipo={selectedTipo}
                                    setSelectedTipo={setSelectedTipo}
                                    setSelectedLibraryItem={setSelectedLibraryItem}
                                    theoryLibrary={theoryLibrary}
                                    selectedTheoryTipo={selectedTheoryTipo}
                                    setSelectedTheoryTipo={setSelectedTheoryTipo}
                                    selectedTheorySubtipo={selectedTheorySubtipo}
                                    setSelectedTheorySubtipo={setSelectedTheorySubtipo}
                                    setSelectedTheoryLibraryItem={setSelectedTheoryLibraryItem}
                                    produccionLibrary={produccionLibrary}
                                    selectedProduccionNivel={selectedProduccionNivel}
                                    setSelectedProduccionNivel={setSelectedProduccionNivel}
                                    selectedProduccionSubnivel={selectedProduccionSubnivel}
                                    setSelectedProduccionSubnivel={setSelectedProduccionSubnivel}
                                    selectedProduccionTipo={selectedProduccionTipo}
                                    setSelectedProduccionTipo={setSelectedProduccionTipo}
                                    setSelectedProduccionLibraryItem={setSelectedProduccionLibraryItem}
                                    valoracionLibrary={valoracionLibrary}
                                    selectedValoracionCategoria={selectedValoracionCategoria}
                                    setSelectedValoracionCategoria={setSelectedValoracionCategoria}
                                    setSelectedValoracionLibraryItem={setSelectedValoracionLibraryItem}
                                    adaptacionesLibrary={adaptacionesLibrary}
                                    selectedAdaptacionTipo={selectedAdaptacionTipo}
                                    setSelectedAdaptacionTipo={setSelectedAdaptacionTipo}
                                    selectedAdaptacionSituacion={selectedAdaptacionSituacion}
                                    setSelectedAdaptacionSituacion={setSelectedAdaptacionSituacion}
                                    setSelectedAdaptacionLibraryItem={setSelectedAdaptacionLibraryItem}
                                    recursosLibrary={recursosLibrary}
                                    selectedRecursoTipo={selectedRecursoTipo}
                                    setSelectedRecursoTipo={setSelectedRecursoTipo}
                                    setSelectedRecursoLibraryItem={setSelectedRecursoLibraryItem}
                                    fuentesLibrary={fuentesLibrary}
                                    selectedFuenteTipo={selectedFuenteTipo}
                                    setSelectedFuenteTipo={setSelectedFuenteTipo}
                                    setSelectedFuenteLibraryItem={setSelectedFuenteLibraryItem}
                                    tiposFuenteCatalogo={tiposFuenteCatalogo}
                                />
                            )}

                            {/* Sección Inferior: 3 columnas o Consolidación */}
                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                                {activeTab === 'proceso' ? (
                                    <div className="lg:col-span-12 h-full">
                                        <MomentoConsolidator
                                            activeWeek={activeWeek}
                                            items={consolidatedMomentos}
                                            onReorder={setConsolidatedMomentos}
                                            onSave={handleSaveConsolidated}
                                            isSaving={isSaving}
                                            isConsolidated={isConsolidated}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        {isFuentesTab ? (
                                            <>
                                                {/* Col 1: Editor (creación/edición de fuente personal) */}
                                                {editorPanel}
                                                {/* Col 2: Detalle (fuente seleccionada de biblioteca) */}
                                                {detailPanel}
                                            </>
                                        ) : (
                                            <>
                                                {/* Col 1: Detalle */}
                                                {detailPanel}
                                                {/* Col 2: Editor */}
                                                {editorPanel}
                                            </>
                                        )}
                                        {/* Col 3: Guardados */}
                                        <MomentoSavedList
                                            activeTab={activeTab}
                                            currentMomentos={currentMomentos}
                                            momentos={momentos}
                                            activeAccentColor={activeAccentColor}
                                            onEdit={handleEditSavedItem}
                                            onDelete={handleDelete}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <span className="material-symbols-rounded text-sm">sync</span>
                                Última sincronización local: {new Date().toLocaleTimeString()}
                            </div>
                            <Badge variant="outline" className="opacity-50 font-black text-[9px]">DISEÑO MODULAR STITCH V2.0</Badge>
                        </div>
                    </Card>
                </div>
            </div>


            <style jsx>{`
                :global(.soft-select) {
                    @apply w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all cursor-pointer shadow-sm hover:shadow-md;
                }
                :global(.soft-label) {
                    display: block;
                    width: 100%;
                    @apply text-[11px] font-[900] text-slate-800 uppercase tracking-[0.2em] px-3 mb-2 font-black;
                }
                :global(.no-scrollbar::-webkit-scrollbar) { display: none; }
                :global(.no-scrollbar) { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
