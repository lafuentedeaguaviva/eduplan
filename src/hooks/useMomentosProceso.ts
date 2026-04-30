'use client';

import { useState, useEffect } from 'react';
import { usePdcWizard } from '@/contexts/PdcWizardContext';
import { PracticasService, PracticaLibraryItem } from '@/services/practicas.service';
import { TheoryService } from '@/services/theory.service';
import { ProduccionService } from '@/services/produccion.service';
import { ValoracionService } from '@/services/valoracion.service';
import { AdaptacionesService } from '@/services/adaptaciones.service';
import { RecursosService } from '@/services/recursos.service';
import { FuentesService } from '@/services/fuentes.service';
import { PlanningService } from '@/services/planning.service';
import {
    PracticaItem, TeoriaItem, TheoryLibraryItem,
    ProduccionItem, ProduccionLibraryItem,
    ValoracionItem, ValoracionLibraryItem,
    AdaptacionBasicaItem, AdaptacionBasicaLibraryItem,
    RecursoItem, RecursoLibraryItem,
    MiFuenteItem, MiFuenteLibraryItem
} from '@/types';

// ─── Empty State Constants ─────────────────────────────────────────────────────

export const EMPTY_EDITING_ITEM: PracticaItem = {
    nombre_practica: '',
    preguntas: '',
    descripcion: '',
    proposito: '',
    tipo: '',
    apto_para: '',
    codigo_biblioteca_practica: '',
    ejemplo_inicial: '',
    ejemplo_primaria: '',
    ejemplo_secundaria: '',
    ejemplo_multigrado: ''
};

export const EMPTY_EDITING_THEORY: TeoriaItem = {
    nombre_estrategia_teorica: '',
    redactado: '',
    descripcion_concreta: '',
    codigo_biblioteca_teoria: '',
    proposito: '',
    tipo: '',
    apto_para: '',
    ejemplo_inicial: '',
    ejemplo_primaria: '',
    ejemplo_secundaria: '',
    ejemplo_multigrado: ''
};

export const EMPTY_EDITING_PRODUCCION: ProduccionItem = {
    nombre_produccion: '',
    descripcion_concreta: '',
    redactado: '',
    instrumento: '',
    codigo_biblioteca_produccion: '',
    proposito: '',
    nivel: '',
    subnivel: '',
    tipo: '',
    apto_para: '',
    ejemplo_inicial: '',
    ejemplo_primaria: '',
    ejemplo_secundaria: '',
    ejemplo_multigrado: ''
};

export const EMPTY_EDITING_VALORACION: ValoracionItem = {
    categoria: '',
    subcategoria: '',
    preguntas: '',
    redactado: '',
    instrumento: '',
    codigo_biblioteca_valoracion: undefined,
    proposito: '',
    apto_para: '',
    ejemplo_inicial: '',
    ejemplo_primaria: '',
    ejemplo_secundaria: '',
    ejemplo_multigrado: ''
};

export const EMPTY_EDITING_ADAPTACION: AdaptacionBasicaItem = {
    tipo: '',
    situacion: '',
    nombre_adaptacion: '',
    descripcion_situacion: '',
    redactado: '',
    proposito: '',
    apto_para: '',
    ejemplo_inicial: '',
    ejemplo_primaria: '',
    ejemplo_secundaria: '',
    ejemplo_multigrado: '',
    codigo_biblioteca_adaptacion: null
};

export const EMPTY_EDITING_RECURSO: RecursoItem = {
    tipo: '',
    recursos: '',
    redactado: '',
    proposito: '',
    apto_para: '',
    ejemplo_inicial: '',
    ejemplo_primaria: '',
    ejemplo_secundaria: '',
    ejemplo_multigrado: '',
    ejemplo: '',
    codigo_biblioteca_recursos: null
};

export const EMPTY_EDITING_FUENTE: MiFuenteLibraryItem = {
    id_mi_fuente: 0,
    tipo: null,
    autor: '',
    anio: '',
    titulo_fuente: '',
    url: '',
    detalle: '',
};

export type TabType = 'practica' | 'teoria' | 'produccion' | 'valoracion' | 'adaptaciones' | 'recursos' | 'fuentes' | 'proceso';

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useMomentosProceso() {
    const {
        weekContentsMap,
        weekDesignState,
        setWeekDesignState,
        setAreasDesignState,
        selectedAreas,
        currentAreaIndex,
        selectedType,
        weekPlanningIds,
        showError,
        showSuccess,
        showConfirm,
        hideFeedback
    } = usePdcWizard();

    const [activeWeek, setActiveWeek] = useState<number>(
        Object.keys(weekContentsMap).length > 0
            ? Number(Object.keys(weekContentsMap).sort((a, b) => Number(a) - Number(b))[0])
            : 1
    );
    const [activeTab, setActiveTab] = useState<TabType>('practica');

    // ── Práctica ──────────────────────────────────────────────────────────────
    const [library, setLibrary] = useState<PracticaLibraryItem[]>([]);
    const [selectedLibraryItem, setSelectedLibraryItem] = useState<PracticaLibraryItem | null>(null);
    const [editingItem, setEditingItem] = useState<PracticaItem>(EMPTY_EDITING_ITEM);
    const [selectedProposito, setSelectedProposito] = useState<string>('');
    const [selectedTipo, setSelectedTipo] = useState<string>('');

    // ── Teoría ────────────────────────────────────────────────────────────────
    const [theoryLibrary, setTheoryLibrary] = useState<TheoryLibraryItem[]>([]);
    const [selectedTheoryLibraryItem, setSelectedTheoryLibraryItem] = useState<TheoryLibraryItem | null>(null);
    const [editingTheoryItem, setEditingTheoryItem] = useState<TeoriaItem>(EMPTY_EDITING_THEORY);
    const [selectedTheoryTipo, setSelectedTheoryTipo] = useState<string>('');
    const [selectedTheorySubtipo, setSelectedTheorySubtipo] = useState<string>('');

    // ── Producción ────────────────────────────────────────────────────────────
    const [produccionLibrary, setProduccionLibrary] = useState<ProduccionLibraryItem[]>([]);
    const [selectedProduccionLibraryItem, setSelectedProduccionLibraryItem] = useState<ProduccionLibraryItem | null>(null);
    const [editingProduccionItem, setEditingProduccionItem] = useState<ProduccionItem>(EMPTY_EDITING_PRODUCCION);
    const [selectedProduccionNivel, setSelectedProduccionNivel] = useState<string>('');
    const [selectedProduccionSubnivel, setSelectedProduccionSubnivel] = useState<string>('');
    const [selectedProduccionTipo, setSelectedProduccionTipo] = useState<string>('');

    // ── Valoración ────────────────────────────────────────────────────────────
    const [valoracionLibrary, setValoracionLibrary] = useState<ValoracionLibraryItem[]>([]);
    const [selectedValoracionLibraryItem, setSelectedValoracionLibraryItem] = useState<ValoracionLibraryItem | null>(null);
    const [editingValoracionItem, setEditingValoracionItem] = useState<ValoracionItem>(EMPTY_EDITING_VALORACION);
    const [selectedValoracionCategoria, setSelectedValoracionCategoria] = useState<string>('');

    // ── Adaptaciones ──────────────────────────────────────────────────────────
    const [adaptacionesLibrary, setAdaptacionesLibrary] = useState<AdaptacionBasicaLibraryItem[]>([]);
    const [selectedAdaptacionLibraryItem, setSelectedAdaptacionLibraryItem] = useState<AdaptacionBasicaLibraryItem | null>(null);
    const [editingAdaptacionItem, setEditingAdaptacionItem] = useState<AdaptacionBasicaItem>(EMPTY_EDITING_ADAPTACION);
    const [selectedAdaptacionTipo, setSelectedAdaptacionTipo] = useState<string>('');
    const [selectedAdaptacionSituacion, setSelectedAdaptacionSituacion] = useState<string>('');

    // ── Recursos ──────────────────────────────────────────────────────────────
    const [recursosLibrary, setRecursosLibrary] = useState<RecursoLibraryItem[]>([]);
    const [selectedRecursoLibraryItem, setSelectedRecursoLibraryItem] = useState<RecursoLibraryItem | null>(null);
    const [editingRecursoItem, setEditingRecursoItem] = useState<RecursoItem>(EMPTY_EDITING_RECURSO);
    const [selectedRecursoTipo, setSelectedRecursoTipo] = useState<string>('');

    // ── Fuentes ───────────────────────────────────────────────────────────────
    const [fuentesLibrary, setFuentesLibrary] = useState<MiFuenteLibraryItem[]>([]);
    const [selectedFuenteLibraryItem, setSelectedFuenteLibraryItem] = useState<MiFuenteLibraryItem | null>(null);
    const [editingFuenteItem, setEditingFuenteItem] = useState<MiFuenteLibraryItem>(EMPTY_EDITING_FUENTE);
    const [selectedFuenteTipo, setSelectedFuenteTipo] = useState<string>('');
    /** true = editing existing row from biblioteca_mi_fuente; false = creating new */
    const [isEditingExistingFuente, setIsEditingExistingFuente] = useState(false);
    
    // ── Consolidación (Pestaña 8) ─────────────────────────────────────────────
    const [consolidatedMomentos, setConsolidatedMomentos] = useState<any[]>([]);


    const [isSaving, setIsSaving] = useState(false);

    // ── Load all libraries once ───────────────────────────────────────────────
    useEffect(() => {
        const loadLibraries = async () => {
            try {
                const [
                    practicaRes, theoryRes, produccionRes, valoracionRes,
                    adaptacionesRes, recursosRes, fuentesRes
                ] = await Promise.all([
                    PracticasService.getLibrary(),
                    TheoryService.getLibrary(),
                    ProduccionService.getLibrary(),
                    ValoracionService.getLibrary(),
                    AdaptacionesService.getLibrary(),
                    RecursosService.getLibrary(),
                    FuentesService.getMiFuentes()
                ]);

                if (practicaRes.success && practicaRes.data) setLibrary(practicaRes.data);
                if (theoryRes.success && theoryRes.data) setTheoryLibrary(theoryRes.data);
                if (produccionRes.success && produccionRes.data) setProduccionLibrary(produccionRes.data);
                if (valoracionRes.success && valoracionRes.data) setValoracionLibrary(valoracionRes.data as ValoracionLibraryItem[]);
                if (adaptacionesRes.success && adaptacionesRes.data) setAdaptacionesLibrary(adaptacionesRes.data);
                if (recursosRes.success && recursosRes.data) setRecursosLibrary(recursosRes.data);
                if (fuentesRes.success && fuentesRes.data) setFuentesLibrary(fuentesRes.data);
            } catch (error) {
                console.error('[useMomentosProceso] Error loading libraries:', error);
            }
        };
        loadLibraries();
    }, []);

    // ── Derive currentMomentos for active week ────────────────────────────────
    const rawMomentos = weekDesignState[activeWeek]?.momentos;
    const currentMomentos = (rawMomentos && typeof rawMomentos === 'object')
        ? rawMomentos
        : {
            practica: [], teoria: [], produccion: [], valoracion: [],
            adaptaciones: [], recursos: [], fuentes: []
        };
    
    // ── Sync consolidatedMomentos with weekDesignState ────────────────────────
    useEffect(() => {
        if (activeTab !== 'proceso') return;
        console.log('[DEBUG] Sincronizando consolidación. AllCurrentItems:', [
            ...(currentMomentos.practica || []),
            ...(currentMomentos.teoria || []),
            ...(currentMomentos.produccion || []),
            ...(currentMomentos.valoracion || [])
        ].length);
        // 1. Obtener datos persistentes y actuales
        const savedJson = weekDesignState[activeWeek]?.momentos_json || [];
        const allCurrentItems: any[] = [
            ...(currentMomentos.practica || []).map((p: any) => ({ ...p, type: 'practica' })),
            ...(currentMomentos.teoria || []).map((t: any) => ({ ...t, type: 'teoria' })),
            ...(currentMomentos.produccion || []).map((p: any) => ({ ...p, type: 'produccion' })),
            ...(currentMomentos.valoracion || []).map((v: any) => ({ ...v, type: 'valoracion' })),
        ];

        // 2. Determinar la base de comparación: lo que ya tenemos en estado local vs lo que viene de la DB
        const baseItems = consolidatedMomentos.length > 0 ? consolidatedMomentos : savedJson;

        // 3. Si no hay nada previo en ningún sitio, cargar todo lo actual
        if (baseItems.length === 0) {
            setConsolidatedMomentos(allCurrentItems);
            return;
        }

        // 4. Filtrar la base para mantener solo lo que aún existe en las tablas
        const filteredBase = baseItems.filter((baseItem: any) => {
            const idKey = getItemIdKey(baseItem.type);
            return allCurrentItems.some(item => 
                item.type === baseItem.type && 
                String(item[idKey]) === String(baseItem[idKey])
            );
        });

        // 5. Encontrar items nuevos que NO estén en nuestra base
        const newItems = allCurrentItems.filter(item => {
            const idKey = getItemIdKey(item.type);
            return !filteredBase.some((baseItem: any) => 
                baseItem.type === item.type && 
                String(baseItem[idKey]) === String(item[idKey])
            );
        });

        // 6. Solo actualizar si el contenido real ha cambiado (nuevos o eliminados)
        // Comparación simple por longitud y presencia de IDs
        const currentIds = consolidatedMomentos.map(m => `${m.type}-${m[getItemIdKey(m.type)]}`).sort().join(',');
        const targetIds = [...filteredBase, ...newItems].map(m => `${m.type}-${m[getItemIdKey(m.type)]}`).sort().join(',');

        if (currentIds !== targetIds) {
            setConsolidatedMomentos([...filteredBase, ...newItems]);
        }
    }, [
        activeWeek, 
        activeTab,
        weekDesignState[activeWeek]?.momentos_json, 
        currentMomentos.practica, 
        currentMomentos.teoria, 
        currentMomentos.produccion, 
        currentMomentos.valoracion
    ]);

    // Helper para obtener el nombre de la columna ID según el tipo de momento
    function getItemIdKey(type: string) {
        switch(type) {
            case 'practica': return 'id_practica';
            case 'teoria': return 'id_teoria';
            case 'produccion': return 'id_produccion';
            case 'valoracion': return 'id_valoracion';
            default: return 'id';
        }
    }


    // ── Generic updater ───────────────────────────────────────────────────────
    const handleUpdateMomento = (tab: TabType, value: any) => {
        setWeekDesignState((prev: any) => {
            const currentWeekData = prev[activeWeek] || {
                momentos: {},
                criterios: { ser: '', saber: '', hacer: '', decidir: '' }
            };

            const updatedMomentos = { ...currentWeekData.momentos, [tab]: value };
            
            // Mapeo de campos para mantener snapshots JSON sincronizados
            const jsonFieldMap: Record<string, string> = {
                recursos: 'recursos_json',
                fuentes: 'fuentes_json',
                adaptaciones: 'adaptaciones_json'
            };

            const updatedWeekData = {
                ...currentWeekData,
                momentos: updatedMomentos,
                consolidado: 0
            };

            // Si es recursos o fuentes, actualizamos también su campo _json
            if (jsonFieldMap[tab]) {
                (updatedWeekData as any)[jsonFieldMap[tab]] = value;
            }

            return {
                ...prev,
                [activeWeek]: updatedWeekData
            };
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS: Práctica
    // ─────────────────────────────────────────────────────────────────────────
    const handleSavePractica = async () => {
        const weekPlanId = weekPlanningIds?.[activeWeek];
        if (!weekPlanId) {
            showError('No hay una ID de planificación para esta semana. Asegúrate de haberla creado en el paso anterior.');
            return;
        }

        setIsSaving(true);
        try {
            // Limpieza de ID: Si es temporal, no lo enviamos
            const idVal = editingItem.id_practica;
            const cleanId = (idVal && !String(idVal).startsWith('temp-')) ? idVal : undefined;

            // Payload explícito para evitar errores de columnas inexistentes
            const payload = {
                id_practica: cleanId,
                planificacion_semanal_id: weekPlanId,
                nombre_practica: editingItem.nombre_practica?.trim() || 'Actividad Práctica',
                preguntas: editingItem.preguntas || '',
                redactado: editingItem.redactado || '',
                tipo: editingItem.tipo || '',
                proposito: editingItem.proposito || '',
                descripcion_concreta: editingItem.descripcion_concreta || '',
                codigo_biblioteca_practica: editingItem.codigo_biblioteca_practica ? Number(editingItem.codigo_biblioteca_practica) : null
            };

            const res = await PracticasService.upsertPractica(payload);
            
            if (res.success && res.data) {
                const current = Array.isArray(currentMomentos.practica) ? currentMomentos.practica : [];
                const saved = res.data;
                const exists = current.some((p: any) => String(p.id_practica) === String(saved.id_practica));
                const updated = exists
                    ? current.map((p: any) => String(p.id_practica) === String(saved.id_practica) ? saved : p)
                    : [...current, saved];
                
                handleUpdateMomento('practica', updated);
                setEditingItem(EMPTY_EDITING_ITEM);
                setSelectedLibraryItem(null);
                showSuccess('Práctica guardada correctamente.');
            } else {
                throw res.error;
            }
        } catch (error: any) {
            console.error('Error saving practice:', error);
            showError(`Error al guardar: ${error.message || 'Error desconocido'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePractica = async (id: string | number) => {
        if (String(id).startsWith('temp-')) {
             const current = Array.isArray(currentMomentos.practica) ? currentMomentos.practica : [];
             handleUpdateMomento('practica', current.filter((p: any) => String(p.id_practica) !== String(id)));
             return;
        }

        showConfirm({
            title: '¿Eliminar actividad?',
            description: 'Esta acción no se puede deshacer y eliminará permanentemente la práctica.',
            variant: 'error',
            confirmText: 'Sí, eliminar',
            onConfirm: async () => {
                setIsSaving(true);
                try {
                    const res = await PracticasService.deletePractica(id);
                    if (!res.success) throw res.error;
                    const current = Array.isArray(currentMomentos.practica) ? currentMomentos.practica : [];
                    handleUpdateMomento('practica', current.filter((p: any) => String(p.id_practica) !== String(id)));
                    showSuccess('Práctica eliminada.');
                } catch (error: any) {
                    showError(`Error al eliminar: ${error.message}`);
                } finally {
                    setIsSaving(false);
                }
            }
        });
    };

    // HANDLERS: Teoría
    // ─────────────────────────────────────────────────────────────────────────
    const handleSaveTheory = async () => {
        const weekPlanId = weekPlanningIds?.[activeWeek];
        if (!weekPlanId) {
            showError('No hay una ID de planificación para esta semana.');
            return;
        }

        setIsSaving(true);
        try {
            const idVal = editingTheoryItem.id_teoria;
            const cleanId = (idVal && !String(idVal).startsWith('temp-')) ? idVal : undefined;

            const payload = {
                id_teoria: cleanId,
                planificacion_semanal_id: weekPlanId,
                nombre_estrategia_teorica: editingTheoryItem.nombre_estrategia_teorica?.trim() || 'Estrategia Teórica',
                redactado: editingTheoryItem.redactado || '',
                tipo: editingTheoryItem.tipo || '',
                proposito: editingTheoryItem.proposito || '',
                descripcion_concreta: editingTheoryItem.descripcion_concreta || '',
                codigo_biblioteca_teoria: editingTheoryItem.codigo_biblioteca_teoria ? Number(editingTheoryItem.codigo_biblioteca_teoria) : null
            };

            const res = await TheoryService.upsertTheory(payload);
            
            if (res.success && res.data) {
                const current = Array.isArray(currentMomentos.teoria) ? currentMomentos.teoria : [];
                const saved = res.data;
                const exists = current.some((t: any) => String(t.id_teoria) === String(saved.id_teoria));
                const updated = exists
                    ? current.map((t: any) => String(t.id_teoria) === String(saved.id_teoria) ? saved : t)
                    : [...current, saved];
                
                handleUpdateMomento('teoria', updated);
                setEditingTheoryItem(EMPTY_EDITING_THEORY);
                setSelectedTheoryLibraryItem(null);
                showSuccess('Estrategia teórica guardada correctamente.');
            } else {
                throw res.error;
            }
        } catch (error: any) {
            console.error('Error saving theory:', error);
            showError(`Error al guardar teoría: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTheory = async (id: any) => {
        showConfirm({
            title: '¿Eliminar estrategia?',
            description: 'Se eliminará permanentemente esta estrategia teórica de tu planificación.',
            variant: 'error',
            confirmText: 'Confirmar eliminación',
            onConfirm: async () => {
                setIsSaving(true);
                try {
                    const res = await TheoryService.deleteTheory(id);
                    if (!res.success) throw res.error;
                    
                    const current = Array.isArray(currentMomentos.teoria) ? currentMomentos.teoria : [];
                    handleUpdateMomento('teoria', current.filter((t: any) => String(t.id_teoria) !== String(id)));
                    showSuccess('Teoría eliminada.');
                } catch (error: any) {
                    showError(`Error al eliminar: ${error.message}`);
                } finally {
                    setIsSaving(false);
                }
            }
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS: Producción
    // ─────────────────────────────────────────────────────────────────────────
    const handleSaveProduccion = async () => {
        const weekPlanId = weekPlanningIds?.[activeWeek];
        if (!weekPlanId) {
            showError('No hay una ID de planificación para esta semana.');
            return;
        }

        setIsSaving(true);
        try {
            const idVal = editingProduccionItem.id_produccion;
            const cleanId = (idVal && !String(idVal).startsWith('temp-')) ? idVal : undefined;

            const payload = {
                id_produccion: cleanId,
                planificacion_semanal_id: weekPlanId,
                nombre_produccion: editingProduccionItem.nombre_produccion?.trim() || 'Producto de Producción',
                instrumento: editingProduccionItem.instrumento || '',
                redactado: editingProduccionItem.redactado || '',
                nivel: editingProduccionItem.nivel || '',
                subnivel: editingProduccionItem.subnivel || '',
                tipo: editingProduccionItem.tipo || '',
                proposito: editingProduccionItem.proposito || '',
                descripcion_concreta: editingProduccionItem.descripcion_concreta || '',
                codigo_biblioteca_produccion: editingProduccionItem.codigo_biblioteca_produccion ? Number(editingProduccionItem.codigo_biblioteca_produccion) : null
            };

            const res = await ProduccionService.upsertProduccion(payload as Partial<ProduccionItem>);
            
            if (res.success && res.data) {
                const current = Array.isArray(currentMomentos.produccion) ? currentMomentos.produccion : [];
                const saved = res.data;
                const exists = current.some((p: any) => String(p.id_produccion) === String(saved.id_produccion));
                const updated = exists
                    ? current.map((p: any) => String(p.id_produccion) === String(saved.id_produccion) ? saved : p)
                    : [...current, saved];
                
                handleUpdateMomento('produccion', updated);
                setEditingProduccionItem(EMPTY_EDITING_PRODUCCION);
                setSelectedProduccionLibraryItem(null);
                showSuccess('Producción guardada correctamente.');
            } else {
                throw res.error;
            }
        } catch (error: any) {
            console.error('Error saving production:', error);
            showError(`Error al guardar producción: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProduccion = async (id: any) => {
        showConfirm({
            title: '¿Eliminar producción?',
            description: 'Esta acción eliminará el registro de producción/producto de esta semana.',
            variant: 'error',
            confirmText: 'Eliminar',
            onConfirm: async () => {
                setIsSaving(true);
                try {
                    const res = await ProduccionService.deleteProduccion(id);
                    if (!res.success) throw res.error;
                    
                    const current = Array.isArray(currentMomentos.produccion) ? currentMomentos.produccion : [];
                    handleUpdateMomento('produccion', current.filter((p: any) => String(p.id_produccion) !== String(id)));
                    showSuccess('Producción eliminada.');
                } catch (error: any) {
                    showError(`Error al eliminar: ${error.message}`);
                } finally {
                    setIsSaving(false);
                }
            }
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS: Valoración
    // ─────────────────────────────────────────────────────────────────────────
    const handleSaveValoracion = async () => {
        const weekPlanId = weekPlanningIds?.[activeWeek];
        if (!weekPlanId) {
            showError('No hay una ID de planificación para esta semana.');
            return;
        }

        setIsSaving(true);
        try {
            const idVal = editingValoracionItem.id_valoracion;
            const cleanId = (idVal && !String(idVal).startsWith('temp-')) ? idVal : undefined;

            const payload = {
                id_valoracion: cleanId,
                planificacion_semanal_id: weekPlanId,
                categoria: editingValoracionItem.categoria || 'Actividad de Valoración',
                subcategoria: editingValoracionItem.subcategoria || '',
                proposito: editingValoracionItem.proposito || '',
                preguntas: editingValoracionItem.preguntas || '',
                redactado: editingValoracionItem.redactado || '',
                instrumento: editingValoracionItem.instrumento || '',
                codigo_biblioteca_valoracion: editingValoracionItem.codigo_biblioteca_valoracion ? Number(editingValoracionItem.codigo_biblioteca_valoracion) : null
            };

            const res = await ValoracionService.upsertValoracion(payload as Partial<ValoracionItem>);
            
            if (res.success && res.data) {
                const current = Array.isArray(currentMomentos.valoracion) ? currentMomentos.valoracion : [];
                const saved = res.data;
                const exists = current.some((v: any) => String(v.id_valoracion) === String(saved.id_valoracion));
                const updated = exists
                    ? current.map((v: any) => String(v.id_valoracion) === String(saved.id_valoracion) ? saved : v)
                    : [...current, saved];
                
                handleUpdateMomento('valoracion', updated);
                setEditingValoracionItem(EMPTY_EDITING_VALORACION);
                setSelectedValoracionLibraryItem(null);
                showSuccess('Valoración guardada correctamente.');
            } else {
                throw res.error;
            }
        } catch (error: any) {
            console.error('Error saving valuation:', error);
            showError(`Error al guardar valoración: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteValoracion = async (id: any) => {
        showConfirm({
            title: '¿Eliminar valoración?',
            description: 'Se perderán los datos de valoración asociados a esta semana.',
            variant: 'error',
            onConfirm: async () => {
                setIsSaving(true);
                try {
                    const res = await ValoracionService.deleteValoracion(id);
                    if (!res.success) throw res.error;
                    
                    const current = Array.isArray(currentMomentos.valoracion) ? currentMomentos.valoracion : [];
                    handleUpdateMomento('valoracion', current.filter((v: any) => String(v.id_valoracion) !== String(id)));
                    showSuccess('Valoración eliminada.');
                } catch (error: any) {
                    showError(`Error al eliminar: ${error.message}`);
                } finally {
                    setIsSaving(false);
                }
            }
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS: Adaptaciones
    // ─────────────────────────────────────────────────────────────────────────
    const handleSaveAdaptacion = async () => {
        const weekPlanId = weekPlanningIds?.[activeWeek];
        if (!weekPlanId) {
            showError('No hay una ID de planificación para esta semana.');
            return;
        }

        setIsSaving(true);
        try {
            const idVal = editingAdaptacionItem.id_adaptacion_basica;
            const cleanId = (idVal && !String(idVal).startsWith('temp-')) ? idVal : undefined;

            // Limpiar el payload para evitar campos undefined que rompen Supabase
            const payload: any = {
                planificacion_semanal_id: weekPlanId,
                nombre_adaptacion: editingAdaptacionItem.nombre_adaptacion?.trim() || 'Adaptación Curricular',
                descripcion_situacion: editingAdaptacionItem.descripcion_situacion || '',
                proposito: editingAdaptacionItem.proposito || editingAdaptacionItem.estrategia_metodologica || '',
                tipo: editingAdaptacionItem.tipo || editingAdaptacionItem.tipo_adaptacion || '',
                situacion: editingAdaptacionItem.situacion || '',
                apto_para: editingAdaptacionItem.apto_para || '',
                redactado: editingAdaptacionItem.redactado || '',
                codigo_biblioteca_adaptacion: editingAdaptacionItem.codigo_biblioteca_adaptacion 
                    ? Number(editingAdaptacionItem.codigo_biblioteca_adaptacion) 
                    : null
            };

            // Solo añadir el ID si existe y es real
            if (cleanId) {
                payload.id_adaptacion_basica = cleanId;
            }

            console.log('DEBUG: Intentando guardar adaptación:', payload);

            const res = await AdaptacionesService.upsertAdaptacion(payload);
            
            if (res.success && res.data) {
                const current = Array.isArray(currentMomentos.adaptaciones) ? currentMomentos.adaptaciones : [];
                const saved = res.data;
                const exists = current.some((a: any) => String(a.id_adaptacion_basica) === String(saved.id_adaptacion_basica));
                const updated = exists
                    ? current.map((a: any) => String(a.id_adaptacion_basica) === String(saved.id_adaptacion_basica) ? saved : a)
                    : [...current, saved];
                
                handleUpdateMomento('adaptaciones', updated);
                setEditingAdaptacionItem(EMPTY_EDITING_ADAPTACION);
                setSelectedAdaptacionLibraryItem(null);
                showSuccess('Adaptación guardada correctamente.');
            } else {
                const errorMsg = res.error?.message || 'Error desconocido al guardar en base de datos';
                throw new Error(errorMsg);
            }
        } catch (error: any) {
            console.error('Error detallado en handleSaveAdaptacion:', error);
            showError(`Error al guardar: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAdaptacion = async (id: any) => {
        showConfirm({
            title: '¿Eliminar adaptación?',
            description: 'Esta adaptación curricular se eliminará de la semana seleccionada.',
            variant: 'error',
            onConfirm: async () => {
                setIsSaving(true);
                try {
                    const res = await AdaptacionesService.deleteAdaptacion(id);
                    if (!res.success) throw res.error;
                    
                    const current = Array.isArray(currentMomentos.adaptaciones) ? currentMomentos.adaptaciones : [];
                    handleUpdateMomento('adaptaciones', current.filter((a: any) => String(a.id_adaptacion_basica) !== String(id)));
                    showSuccess('Adaptación eliminada.');
                } catch (error: any) {
                    showError(`Error al eliminar: ${error.message}`);
                } finally {
                    setIsSaving(false);
                }
            }
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS: Recursos
    // ─────────────────────────────────────────────────────────────────────────
    const handleSaveRecurso = async () => {
        const weekPlanId = weekPlanningIds?.[activeWeek];
        if (!weekPlanId) {
            showError('No hay una ID de planificación para esta semana.');
            return;
        }

        setIsSaving(true);
        try {
            const idVal = editingRecursoItem.id_recursos;
            const cleanId = (idVal && !String(idVal).startsWith('temp-')) ? idVal : undefined;

            const payload = {
                id_recursos: cleanId,
                planificacion_semanal_id: weekPlanId,
                recursos: editingRecursoItem.recursos?.trim() || 'Recurso de apoyo',
                tipo: editingRecursoItem.tipo || '',
                apto_para: editingRecursoItem.apto_para || '',
                redactado: editingRecursoItem.redactado || '',
                codigo_biblioteca_recursos: editingRecursoItem.codigo_biblioteca_recursos ? Number(editingRecursoItem.codigo_biblioteca_recursos) : null
            };

            const res = await RecursosService.upsertRecurso(payload);
            
            if (res.success && res.data) {
                const current = Array.isArray(currentMomentos.recursos) ? currentMomentos.recursos : [];
                const saved = res.data;
                const exists = current.some((r: any) => String(r.id_recursos) === String(saved.id_recursos));
                const updated = exists
                    ? current.map((r: any) => String(r.id_recursos) === String(saved.id_recursos) ? saved : r)
                    : [...current, saved];
                
                handleUpdateMomento('recursos', updated);
                setEditingRecursoItem(EMPTY_EDITING_RECURSO);
                setSelectedRecursoLibraryItem(null);
                showSuccess('Recurso guardado correctamente.');
            } else {
                throw res.error;
            }
        } catch (error: any) {
            console.error('Error saving resource:', error);
            showError(`Error al guardar recurso: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteRecurso = async (id: any) => {
        showConfirm({
            title: '¿Eliminar recurso?',
            description: 'Se eliminarán los materiales y recursos asociados a esta semana.',
            variant: 'error',
            onConfirm: async () => {
                setIsSaving(true);
                try {
                    const res = await RecursosService.deleteRecurso(id);
                    if (!res.success) throw res.error;
                    
                    const current = Array.isArray(currentMomentos.recursos) ? currentMomentos.recursos : [];
                    handleUpdateMomento('recursos', current.filter((r: any) => String(r.id_recursos) !== String(id)));
                    showSuccess('Recurso eliminado.');
                } catch (error: any) {
                    showError(`Error al eliminar: ${error.message}`);
                } finally {
                    setIsSaving(false);
                }
            }
        });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS: Fuentes
    // ─────────────────────────────────────────────────────────────────────────

    /** Guarda o actualiza en biblioteca_mi_fuente (la biblioteca personal del docente). */
    const handleSaveMiFuente = async () => {
        console.log('[handleSaveMiFuente] Iniciando guardado...', editingFuenteItem);
        setIsSaving(true);
        try {
            const idVal = editingFuenteItem.id_mi_fuente;
            const isNew = !idVal || String(idVal).startsWith('temp-');
            
            // Construimos el payload de forma segura
            const payload: any = {
                titulo_fuente: editingFuenteItem.titulo_fuente?.trim() || 'Nueva Fuente',
                autor: editingFuenteItem.autor || '',
                anio: editingFuenteItem.anio || '',
                url: editingFuenteItem.url || '',
                detalle: editingFuenteItem.detalle || '',
                tipo: (editingFuenteItem.tipo && editingFuenteItem.tipo !== '') ? Number(editingFuenteItem.tipo) : null
            };

            // Solo incluimos el ID si no es nuevo (edición)
            if (!isNew) {
                payload.id_mi_fuente = idVal;
            }
            
            console.log('[handleSaveMiFuente] Payload final:', payload);
            const res = await FuentesService.upsertMiFuente(payload);
            console.log('[handleSaveMiFuente] Respuesta del servicio:', res);
            
            if (res.success && res.data) {
                const { data: freshLibrary } = await FuentesService.getMiFuentes();
                if (freshLibrary) {
                    setFuentesLibrary(freshLibrary);
                    // Seleccionar automáticamente el tipo guardado para mostrarlo
                    if (payload.tipo) setSelectedFuenteTipo(String(payload.tipo));
                }
                setEditingFuenteItem(EMPTY_EDITING_FUENTE);
                setIsEditingExistingFuente(false);
                showSuccess('Fuente guardada y lista para seleccionar.');
            } else {
                throw res.error;
            }
        } catch (error: any) {
            console.error('Error saving library source:', error);
            const msg = error?.message || (typeof error === 'string' ? error : 'Error desconocido al guardar en biblioteca');
            showError(`Error al guardar fuente: ${msg}`);
        } finally {
            setIsSaving(false);
        }
    };

    /** Copia la fuente seleccionada a mi_fuente (instancia de planificación semanal). */
    const handleSaveFuenteToPlanning = async (libraryItem: MiFuenteLibraryItem) => {
        const weekPlanId = weekPlanningIds?.[activeWeek];
        if (!weekPlanId) {
            showError('No hay una ID de planificación para esta semana.');
            return;
        }
        setIsSaving(true);
        try {
            const payload = {
                planificacion_semanal_id: weekPlanId,
                tipo: libraryItem.tipo,
                autor: libraryItem.autor,
                anio: libraryItem.anio,
                titulo_fuente: libraryItem.titulo_fuente,
                url: libraryItem.url,
                detalle: libraryItem.detalle,
                codigo_biblioteca_mi_fuente: libraryItem.id_mi_fuente
            };
            const res = await FuentesService.saveToPlanning(payload);
            
            if (res.success && res.data) {
                const current = Array.isArray(currentMomentos.fuentes) ? currentMomentos.fuentes : [];
                handleUpdateMomento('fuentes', [...current, res.data]);
                setSelectedFuenteLibraryItem(null);
                showSuccess('Fuente añadida a la semana.');
            } else {
                throw res.error;
            }
        } catch (error: any) {
            showError(`Error al añadir fuente: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteFuente = async (id: any) => {
        showConfirm({
            title: '¿Eliminar fuente?',
            description: '¿Deseas eliminar esta fuente bibliográfica de tu planificación?',
            variant: 'error',
            onConfirm: async () => {
                setIsSaving(true);
                try {
                    const res = await FuentesService.deleteMiFuente(id);
                    if (!res.success) throw res.error;
                    
                    const current = Array.isArray(currentMomentos.fuentes) ? currentMomentos.fuentes : [];
                    // Filtramos usando específicamente el ID de la instancia semanal
                    handleUpdateMomento('fuentes', current.filter((f: any) => String(f.id_fuente) !== String(id)));
                    showSuccess('Fuente eliminada.');
                } catch (error: any) {
                    showError(`Error al eliminar: ${error.message}`);
                } finally {
                    setIsSaving(false);
                }
            }
        });
    };

    /** Carga una fuente de la biblioteca al editor para su modificación. */
    const handleEditFuenteFromLibrary = (item: MiFuenteLibraryItem) => {
        setEditingFuenteItem({ ...item });
        setIsEditingExistingFuente(true);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS: Consolidación y Paso Final
    // ─────────────────────────────────────────────────────────────────────────

    const handleSaveConsolidated = async (items: any[]) => {
        const weekId = weekPlanningIds?.[activeWeek];
        if (!weekId) {
            showError('No se encontró el ID de planificación semanal. Asegúrate de haber guardado el paso anterior.');
            return;
        }

        if (!items || items.length === 0) {
            showError('No hay elementos para guardar. Asegúrate de que la lista no esté vacía.');
            setIsSaving(false);
            return;
        }

        setIsSaving(true);
        try {
            const allAdaptations = currentMomentos.adaptaciones || [];
            const basicas = allAdaptations.filter((a: any) => a.tipo?.toLowerCase() !== 'especial');
            const especial = allAdaptations.filter((a: any) => a.tipo?.toLowerCase() === 'especial');
            
            const payload = {
                momentos: items,
                recursos: currentMomentos.recursos || [],
                fuentes: currentMomentos.fuentes || [],
                consolidado: 1,
                adaptaciones_basicas: basicas,
                adaptacion_especial: especial
            };

            const res = await PlanningService.updateHeader(weekId, payload);
            
            if (res.error) throw res.error;
            
            // 1. Actualizar estado local inmediato
            const updatedWeekState = {
                ...weekDesignState[activeWeek],
                momentos_json: items,
                recursos_json: payload.recursos,
                fuentes_json: payload.fuentes,
                consolidado: 1,
                adaptaciones_json: basicas,
                adaptacion_especial: especial
            };

            setWeekDesignState((prev: any) => ({
                ...prev,
                [activeWeek]: updatedWeekState
            }));

            // 2. Notificar al Wizard (Estado Global) para que handleNext lo vea
            setAreasDesignState(prev => {
                const areaId = selectedAreas[currentAreaIndex];
                if (!areaId) return prev;
                
                return {
                    ...prev,
                    [areaId]: {
                        ...prev[areaId],
                        weekDesignState: {
                            ...(prev[areaId]?.weekDesignState || {}),
                            [activeWeek]: updatedWeekState
                        }
                    }
                };
            });
            
            showSuccess('Consolidación guardada', 'El orden de las actividades ha sido verificado y guardado.');
        } catch (error: any) {
            showError(`Error al guardar orden: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSyncResourcesAndSources = async () => {
        const weekId = weekPlanningIds?.[activeWeek];
        if (!weekId) return;

        try {
            const payload = {
                recursos: currentMomentos.recursos || [],
                fuentes: currentMomentos.fuentes || []
            };
            await PlanningService.updateHeader(weekId, payload);
            
            setWeekDesignState((prev: any) => ({
                ...prev,
                [activeWeek]: {
                    ...prev[activeWeek],
                    recursos_json: payload.recursos,
                    fuentes_json: payload.fuentes,
                    consolidado: 0 
                }
            }));
        } catch (error) {
            console.error('Error syncing resources/sources:', error);
        }
    };

    return {
        activeWeek, setActiveWeek,
        activeTab, setActiveTab,
        // Práctica
        library, setLibrary,
        selectedLibraryItem, setSelectedLibraryItem,
        editingItem, setEditingItem,
        selectedProposito, setSelectedProposito,
        selectedTipo, setSelectedTipo,
        // Teoría
        theoryLibrary, setTheoryLibrary,
        selectedTheoryLibraryItem, setSelectedTheoryLibraryItem,
        editingTheoryItem, setEditingTheoryItem,
        selectedTheoryTipo, setSelectedTheoryTipo,
        selectedTheorySubtipo, setSelectedTheorySubtipo,
        // Producción
        produccionLibrary, setProduccionLibrary,
        selectedProduccionLibraryItem, setSelectedProduccionLibraryItem,
        editingProduccionItem, setEditingProduccionItem,
        selectedProduccionNivel, setSelectedProduccionNivel,
        selectedProduccionSubnivel, setSelectedProduccionSubnivel,
        selectedProduccionTipo, setSelectedProduccionTipo,
        // Valoración
        valoracionLibrary, setValoracionLibrary,
        selectedValoracionLibraryItem, setSelectedValoracionLibraryItem,
        editingValoracionItem, setEditingValoracionItem,
        selectedValoracionCategoria, setSelectedValoracionCategoria,
        // Adaptaciones
        adaptacionesLibrary,
        selectedAdaptacionLibraryItem, setSelectedAdaptacionLibraryItem,
        editingAdaptacionItem, setEditingAdaptacionItem,
        selectedAdaptacionTipo, setSelectedAdaptacionTipo,
        selectedAdaptacionSituacion, setSelectedAdaptacionSituacion,
        // Recursos
        recursosLibrary,
        selectedRecursoLibraryItem, setSelectedRecursoLibraryItem,
        editingRecursoItem, setEditingRecursoItem,
        selectedRecursoTipo, setSelectedRecursoTipo,
        // Fuentes
        fuentesLibrary, setFuentesLibrary,
        selectedFuenteLibraryItem, setSelectedFuenteLibraryItem,
        editingFuenteItem, setEditingFuenteItem,
        selectedFuenteTipo, setSelectedFuenteTipo,
        isEditingExistingFuente,
        // Consolidación
        consolidatedMomentos, setConsolidatedMomentos,
        handleSaveConsolidated,
        handleSyncResourcesAndSources,
        // Consolidación status
        isConsolidated: weekDesignState[activeWeek]?.consolidado === 1,
        // Saving flag
        isSaving,
        // Shared state
        currentMomentos,
        handleUpdateMomento,
        // Handlers
        handleSavePractica, handleDeletePractica,
        handleSaveTheory, handleDeleteTheory,
        handleSaveProduccion, handleDeleteProduccion,
        handleSaveValoracion, handleDeleteValoracion,
        handleSaveAdaptacion, handleDeleteAdaptacion,
        handleSaveRecurso, handleDeleteRecurso,
        handleSaveMiFuente, handleSaveFuenteToPlanning, handleDeleteFuente, handleEditFuenteFromLibrary,
        weekContentsMap,
        selectedType,
        showError,
        showSuccess,
        hideFeedback
    };
}
