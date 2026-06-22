'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePdcWizard } from '@/contexts/PdcWizardContext';
import { EvaluacionService } from '@/services/evaluacion.service';
import { PdcService } from '@/services/pdc.service';
import {
    SerLibraryItem, SerItem,
    SaberLibraryItem, SaberItem,
    HacerLibraryItem, HacerItem,
    AdaptacionEvaluacionLibraryItem, AdaptacionEvaluacionItem
} from '@/types';

export type EvaluacionTab = 'ser' | 'saber' | 'hacer' | 'adaptacion' | 'adaptacion_no_sig';

export function useCriteriosEvaluacion() {
    const { 
        currentPdcId, 
        selectedType, 
        selectedAreas, 
        currentAreaIndex,
        showSuccess,
        showError,
        showConfirm
    } = usePdcWizard();
    const selectedAreaId = selectedAreas?.[currentAreaIndex] || null;

    const [pdcAreaId, setPdcAreaId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<EvaluacionTab>('ser');
    const [isSaving, setIsSaving] = useState(false);

    // ─── DATA LIBRARIES ───
    const [libSer, setLibSer] = useState<SerLibraryItem[]>([]);
    const [libSaber, setLibSaber] = useState<SaberLibraryItem[]>([]);
    const [libHacer, setLibHacer] = useState<HacerLibraryItem[]>([]);
    const [libAdaptacion, setLibAdaptacion] = useState<AdaptacionEvaluacionLibraryItem[]>([]);

    // ─── SAVED ITEMS ───
    const [savedSer, setSavedSer] = useState<SerItem[]>([]);
    const [savedSaber, setSavedSaber] = useState<SaberItem[]>([]);
    const [savedHacer, setSavedHacer] = useState<HacerItem[]>([]);
    const [savedAdaptacion, setSavedAdaptacion] = useState<AdaptacionEvaluacionItem[]>([]);
    const [adaptacionNoSig, setAdaptacionNoSig] = useState<string>('');

    // ─── SELECTION STATE ───
    // Hierarchical filters for each tab
    const [filtersSer, setFiltersSer] = useState({ categoria: '', subcategoria: '', nombre: '' });
    const [filtersSaber, setFiltersSaber] = useState({ nivel: '', subnivel: '', verbo: '' });
    const [filtersHacer, setFiltersHacer] = useState({ nivel: '', subnivel: '', verbo: '' });
    const [filtersAdaptacion, setFiltersAdaptacion] = useState({ condicion: '', nombre: '' });

    // Currently selected library item for the Detail view
    const [selectedLibItem, setSelectedLibItem] = useState<any>(null);

    // ─── EDITING STATE ───
    const [editingSer, setEditingSer] = useState<Partial<SerItem>>({});
    const [editingSaber, setEditingSaber] = useState<Partial<SaberItem>>({});
    const [editingHacer, setEditingHacer] = useState<Partial<HacerItem>>({});
    const [editingAdaptacion, setEditingAdaptacion] = useState<Partial<AdaptacionEvaluacionItem>>({});

    // ─── GET JUNCTION ID ───
    useEffect(() => {
        if (!currentPdcId || !selectedAreaId) {
            setPdcAreaId(null);
            return;
        }

        const fetchJunctionId = async () => {
            const res = await PdcService.getPdcAreaJunctionId(currentPdcId!, selectedAreaId!);
            setPdcAreaId(res.data || null);
        };
        fetchJunctionId();
    }, [currentPdcId, selectedAreaId]);

    // ─── INITIAL LOAD ───
    useEffect(() => {
        const loadLib = async () => {
            const [ser, saber, hacer, adapt] = await Promise.all([
                EvaluacionService.getBibliotecaSer(),
                EvaluacionService.getBibliotecaSaber(),
                EvaluacionService.getBibliotecaHacer(),
                EvaluacionService.getBibliotecaAdaptacion()
            ]);
            setLibSer(ser.data || []);
            setLibSaber(saber.data || []);
            setLibHacer(hacer.data || []);
            setLibAdaptacion(adapt.data || []);
        };
        loadLib();
    }, []);

    useEffect(() => {
        const loadSaved = async () => {
            if (!pdcAreaId) return;
            const [ser, saber, hacer, adapt, noSig] = await Promise.all([
                EvaluacionService.getSerByPdcArea(pdcAreaId),
                EvaluacionService.getSaberByPdcArea(pdcAreaId),
                EvaluacionService.getHacerByPdcArea(pdcAreaId),
                EvaluacionService.getAdaptacionByPdcArea(pdcAreaId),
                PdcService.getAdaptacionNoSig(pdcAreaId)
            ]);
            setSavedSer(ser.data || []);
            setSavedSaber(saber.data || []);
            setSavedHacer(hacer.data || []);
            setSavedAdaptacion(adapt.data || []);
            setAdaptacionNoSig(noSig.data || '');
        };
        if (pdcAreaId) loadSaved();
    }, [pdcAreaId]);

    // Snapshot synchronization effect
    useEffect(() => {
        if (!pdcAreaId || isSaving) return;
        
        const updateSnapshot = async () => {
            const allCriterios = [...savedSer, ...savedSaber, ...savedHacer];
            // Only update if we have data to avoid clearing on initial load
            if (allCriterios.length === 0 && savedAdaptacion.length === 0) return;

            await EvaluacionService.saveEvaluationSnapshot(pdcAreaId, {
                criterios: allCriterios,
                adaptaciones: savedAdaptacion
            });
        };
        
        // Debounce to avoid excessive writes
        const timeout = setTimeout(updateSnapshot, 1000);
        return () => clearTimeout(timeout);
    }, [savedSer, savedSaber, savedHacer, savedAdaptacion, pdcAreaId]);

    // ─── FILTER LOGIC ───

    // SER: Categoria -> Subcategoria -> Nombre
    const availableCategoriesSer = useMemo(() => Array.from(new Set(libSer.map(i => i.categoria))), [libSer]);
    const filteredSubcategoriesSer = useMemo(() =>
        Array.from(new Set(libSer.filter(i => i.categoria === filtersSer.categoria).map(i => i.subcategoria))),
        [libSer, filtersSer.categoria]);
    const filteredNombresSer = useMemo(() =>
        libSer.filter(i => i.categoria === filtersSer.categoria && i.subcategoria === filtersSer.subcategoria),
        [libSer, filtersSer.categoria, filtersSer.subcategoria]);

    // SABER: Nivel -> Subnivel -> Verbo
    const availableNivelesSaber = useMemo(() => Array.from(new Set(libSaber.map(i => i.nivel))), [libSaber]);
    const filteredSubnivelesSaber = useMemo(() =>
        Array.from(new Set(libSaber.filter(i => i.nivel === filtersSaber.nivel).map(i => i.subnivel))),
        [libSaber, filtersSaber.nivel]);
    const filteredVerbosSaber = useMemo(() =>
        libSaber.filter(i => i.nivel === filtersSaber.nivel && i.subnivel === filtersSaber.subnivel),
        [libSaber, filtersSaber.nivel, filtersSaber.subnivel]);

    // HACER: Nivel -> Subnivel -> Verbo
    const availableNivelesHacer = useMemo(() => Array.from(new Set(libHacer.map(i => i.nivel))), [libHacer]);
    const filteredSubnivelesHacer = useMemo(() =>
        Array.from(new Set(libHacer.filter(i => i.nivel === filtersHacer.nivel).map(i => i.subnivel))),
        [libHacer, filtersHacer.nivel]);
    const filteredVerbosHacer = useMemo(() =>
        libHacer.filter(i => i.nivel === filtersHacer.nivel && i.subnivel === filtersHacer.subnivel),
        [libHacer, filtersHacer.nivel, filtersHacer.subnivel]);

    // ADAPTACION: Condicion -> Nombre -> Estrategia
    const availableCondicionesAdapt = useMemo(() => Array.from(new Set(libAdaptacion.map(i => i.condicion))), [libAdaptacion]);
    
    const availableNombresAdapt = useMemo(() => 
        Array.from(new Set(libAdaptacion.filter(i => i.condicion === filtersAdaptacion.condicion).map(i => i.nombre_adaptacion))),
        [libAdaptacion, filtersAdaptacion.condicion]);

    const filteredNombresAdapt = useMemo(() =>
        libAdaptacion.filter(i => i.condicion === filtersAdaptacion.condicion && i.nombre_adaptacion === filtersAdaptacion.nombre),
        [libAdaptacion, filtersAdaptacion.condicion, filtersAdaptacion.nombre]);

    // ─── ACTIONS ───

    const handlePushToEditor = async (item: any) => {
        if (!pdcAreaId) {
            showError('No se ha podido vincular este criterio al área actual del PDC. Asegúrate de haber guardado los pasos anteriores.');
            return;
        }

        if (activeTab === 'ser') {
            const data = { 
                ...item, 
                pdc_area_trabajo_id: pdcAreaId, 
                codigo_biblioteca_ser: item.id_ser,
                nombre_ser: item.nombre_ser || item.nombre // Backup por si acaso
            };
            // Limpieza manual de campos que no van en la tabla 'ser'
            delete (data as any).id_ser;
            delete (data as any).created_at;
            delete (data as any).ejemplo_inicial;
            delete (data as any).ejemplo_primaria;
            delete (data as any).ejemplo_secundaria;
            delete (data as any).ejemplo_multigrado;
            
            setEditingSer(data);
        } else if (activeTab === 'saber') {
            const data = { 
                ...item, 
                pdc_area_trabajo_id: pdcAreaId, 
                codigo_biblioteca_saber: item.id_saber,
                verbo_saber: item.verbo_saber || item.verbo
            };
            delete (data as any).id_saber;
            delete (data as any).created_at;
            delete (data as any).ejemplo_inicial;
            delete (data as any).ejemplo_primaria;
            delete (data as any).ejemplo_secundaria;
            delete (data as any).ejemplo_multigrado;

            setEditingSaber(data);
        } else if (activeTab === 'hacer') {
            const data = { 
                ...item, 
                pdc_area_trabajo_id: pdcAreaId, 
                codigo_biblioteca_hacer: item.id_hacer,
                verbo: item.verbo || item.verbo_hacer
            };
            delete (data as any).id_hacer;
            delete (data as any).created_at;
            delete (data as any).ejemplo_inicial;
            delete (data as any).ejemplo_primaria;
            delete (data as any).ejemplo_secundaria;
            delete (data as any).ejemplo_multigrado;

            setEditingHacer(data);
        } else if (activeTab === 'adaptacion') {
            const data = { 
                ...item, 
                pdc_area_trabajo_id: pdcAreaId, 
                codigo_biblioteca_evaluacion_adaptaciones_especiales: item.id_adaptacion_evaluacion,
                nombre_adaptacion: item.nombre_adaptacion || item.nombre
            };
            delete (data as any).id_adaptacion_evaluacion;
            delete (data as any).created_at;
            delete (data as any).ejemplo;

            setEditingAdaptacion(data);
        }
    };

    const handleSaveSer = async (directData?: Partial<SerItem>) => {
        const d = directData || editingSer;
        const finalName = d.nombre_ser || (d as any).nombre;
        
        if (!finalName || !pdcAreaId) return;
        
        setIsSaving(true);
        try {
            // Strict payload mapping to avoid NetworkError/Schema errors
            const payload: Partial<SerItem> = {
                id_ser: d.id_ser,
                pdc_area_trabajo_id: pdcAreaId,
                nombre_ser: finalName,
                redactado: d.redactado,
                instrumento_sugerido: d.instrumento_sugerido,
                codigo_biblioteca_ser: d.codigo_biblioteca_ser
            };

            const res = await EvaluacionService.saveSer(payload as SerItem);
            if (res.success && res.data) {
                setSavedSer(prev => {
                    const existing = prev.findIndex(p => p.id_ser === res.data!.id_ser);
                    if (existing >= 0) {
                        const next = [...prev];
                        next[existing] = res.data!;
                        return next;
                    }
                    return [...prev, res.data!];
                });
                setEditingSer({});
                showSuccess('Criterio del SER guardado.');
            } else {
                throw res.error;
            }
        } catch (error: any) {
            console.error('Error saving SER:', error);
            showError(`Error al guardar SER: ${error?.message || error || 'Error de conexión'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSaber = async (directData?: Partial<SaberItem>) => {
        const d = directData || editingSaber;
        const finalVerbo = d.verbo_saber || (d as any).verbo;

        if (!finalVerbo || !pdcAreaId) return;
        
        setIsSaving(true);
        try {
            const payload: Partial<SaberItem> = {
                id_saber: d.id_saber,
                pdc_area_trabajo_id: pdcAreaId,
                verbo_saber: finalVerbo,
                redactado: d.redactado,
                instrumento_sugerido: d.instrumento_sugerido,
                evidencia: d.evidencia,
                codigo_biblioteca_saber: d.codigo_biblioteca_saber
            };

            const res = await EvaluacionService.saveSaber(payload as SaberItem);
            if (res.success && res.data) {
                setSavedSaber(prev => {
                    const existing = prev.findIndex(p => p.id_saber === res.data!.id_saber);
                    if (existing >= 0) {
                        const next = [...prev];
                        next[existing] = res.data!;
                        return next;
                    }
                    return [...prev, res.data!];
                });
                setEditingSaber({});
                showSuccess('Criterio del SABER guardado.');
            } else {
                throw res.error;
            }
        } catch (error: any) {
            console.error('Error saving SABER:', error);
            showError(`Error al guardar SABER: ${error?.message || error || 'Error de conexión'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveHacer = async (directData?: Partial<HacerItem>) => {
        const d = directData || editingHacer;
        const finalVerbo = d.verbo || (d as any).verbo_hacer;

        if (!finalVerbo || !pdcAreaId) return;
        
        setIsSaving(true);
        try {
            const payload: Partial<HacerItem> = {
                id_hacer: d.id_hacer,
                pdc_area_trabajo_id: pdcAreaId,
                verbo: finalVerbo,
                redactado: d.redactado,
                instrumento_sugerido: d.instrumento_sugerido,
                producto: d.producto,
                codigo_biblioteca_hacer: d.codigo_biblioteca_hacer
            };

            const res = await EvaluacionService.saveHacer(payload as HacerItem);
            if (res.success && res.data) {
                setSavedHacer(prev => {
                    const existing = prev.findIndex(p => p.id_hacer === res.data!.id_hacer);
                    if (existing >= 0) {
                        const next = [...prev];
                        next[existing] = res.data!;
                        return next;
                    }
                    return [...prev, res.data!];
                });
                setEditingHacer({});
                showSuccess('Criterio del HACER guardado.');
            } else {
                throw res.error;
            }
        } catch (error: any) {
            console.error('Error saving HACER:', error);
            showError(`Error al guardar HACER: ${error?.message || error || 'Error de conexión'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAdaptacion = async (directData?: Partial<AdaptacionEvaluacionItem>) => {
        const d = directData || editingAdaptacion;
        const finalNombre = d.nombre_adaptacion || (d as any).nombre;

        if (!finalNombre || !pdcAreaId) return;
        
        setIsSaving(true);
        try {
            const payload: Partial<AdaptacionEvaluacionItem> = {
                id_adaptacion_evaluacion: d.id_adaptacion_evaluacion,
                pdc_area_trabajo_id: pdcAreaId,
                nombre_adaptacion: finalNombre,
                condicion: d.condicion,
                redactado: d.redactado,
                codigo_biblioteca_evaluacion_adaptaciones_especiales: d.codigo_biblioteca_evaluacion_adaptaciones_especiales
            };

            const res = await EvaluacionService.saveAdaptacion(payload as AdaptacionEvaluacionItem);
            if (res.success && res.data) {
                setSavedAdaptacion(prev => {
                    const existing = prev.findIndex(p => p.id_adaptacion_evaluacion === res.data!.id_adaptacion_evaluacion);
                    if (existing >= 0) {
                        const next = [...prev];
                        next[existing] = res.data!;
                        return next;
                    }
                    return [...prev, res.data!];
                });
                setEditingAdaptacion({});
                showSuccess('Adaptación de evaluación guardada.');
            } else {
                throw res.error;
            }
        } catch (error: any) {
            console.error('Error saving Adaptación:', error);
            showError(`Error al guardar Adaptación: ${error?.message || error || 'Error de conexión'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSer = async (id: number) => {
        showConfirm({
            title: '¿Eliminar criterio?',
            description: 'Esta acción eliminará permanentemente este criterio de evaluación del SER.',
            variant: 'error',
            onConfirm: async () => {
                const res = await EvaluacionService.deleteSer(id);
                if (res.success) {
                    setSavedSer(prev => prev.filter(i => i.id_ser !== id));
                    showSuccess('Criterio eliminado.');
                } else {
                    showError('Error al eliminar criterio.');
                }
            }
        });
    };

    const handleDeleteSaber = async (id: number) => {
        showConfirm({
            title: '¿Eliminar criterio?',
            description: 'Esta acción eliminará permanentemente este criterio de evaluación del SABER.',
            variant: 'error',
            onConfirm: async () => {
                const res = await EvaluacionService.deleteSaber(id);
                if (res.success) {
                    setSavedSaber(prev => prev.filter(i => i.id_saber !== id));
                    showSuccess('Criterio eliminado.');
                } else {
                    showError('Error al eliminar criterio.');
                }
            }
        });
    };

    const handleDeleteHacer = async (id: number) => {
        showConfirm({
            title: '¿Eliminar criterio?',
            description: 'Esta acción eliminará permanentemente este criterio de evaluación del HACER.',
            variant: 'error',
            onConfirm: async () => {
                const res = await EvaluacionService.deleteHacer(id);
                if (res.success) {
                    setSavedHacer(prev => prev.filter(i => i.id_hacer !== id));
                    showSuccess('Criterio eliminado.');
                } else {
                    showError('Error al eliminar criterio.');
                }
            }
        });
    };

    const handleDeleteAdaptacion = async (id: number) => {
        showConfirm({
            title: '¿Eliminar adaptación?',
            description: '¿Deseas eliminar esta adaptación de evaluación?',
            variant: 'error',
            onConfirm: async () => {
                const res = await EvaluacionService.deleteAdaptacion(id);
                if (res.success) {
                    setSavedAdaptacion(prev => prev.filter(i => i.id_adaptacion_evaluacion !== id));
                    showSuccess('Adaptación eliminada.');
                } else {
                    showError('Error al eliminar adaptación.');
                }
            }
        });
    };



    const handleSaveAdaptacionNoSig = async (directValue?: string) => {
        if (!pdcAreaId) return;
        setIsSaving(true);
        try {
            const val = typeof directValue === 'string' ? directValue : adaptacionNoSig;
            const res = await PdcService.updateAdaptacionNoSig(pdcAreaId, val);
            if (res.success) {
                if (typeof directValue === 'string') {
                    setAdaptacionNoSig(directValue);
                }
                showSuccess('Adaptación no significativa guardada correctamente.');
            }
            else showError('Error al guardar la adaptación.');
        } catch (e) {
            showError('Error inesperado al guardar.');
        } finally {
            setIsSaving(false);
        }
    };

    return {
        activeTab, setActiveTab,
        isSaving,
        selectedType,

        // Libraries
        libSer, libSaber, libHacer, libAdaptacion,

        // Saved Lists
        savedSer, savedSaber, savedHacer, savedAdaptacion,
        adaptacionNoSig, setAdaptacionNoSig,

        // Filters & Selectors
        filtersSer, setFiltersSer, availableCategoriesSer, filteredSubcategoriesSer, filteredNombresSer,
        filtersSaber, setFiltersSaber, availableNivelesSaber, filteredSubnivelesSaber, filteredVerbosSaber,
        filtersHacer, setFiltersHacer, availableNivelesHacer, filteredSubnivelesHacer, filteredVerbosHacer,
        filtersAdaptacion, setFiltersAdaptacion, availableCondicionesAdapt, availableNombresAdapt, filteredNombresAdapt,

        selectedLibItem, setSelectedLibItem,

        // Editing State
        editingSer, setEditingSer,
        editingSaber, setEditingSaber,
        editingHacer, setEditingHacer,
        editingAdaptacion, setEditingAdaptacion,

        // Handlers
        handlePushToEditor,
        handleSaveSer, handleSaveSaber, handleSaveHacer, handleSaveAdaptacion,
        handleDeleteSer, handleDeleteSaber, handleDeleteHacer, handleDeleteAdaptacion,
        handleSaveAdaptacionNoSig
    };
}
