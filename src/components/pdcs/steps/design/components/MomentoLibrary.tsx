'use client';

import React, { useState } from 'react';
import { TabType } from '@/hooks/useMomentosProceso';

interface MomentoLibraryProps {
    activeTab: TabType;
    // Práctica
    library: any[];
    selectedProposito: string;
    setSelectedProposito: (v: string) => void;
    selectedTipo: string;
    setSelectedTipo: (v: string) => void;
    setSelectedLibraryItem: (item: any) => void;
    // Teoría
    theoryLibrary: any[];
    selectedTheoryTipo: string;
    setSelectedTheoryTipo: (v: string) => void;
    selectedTheorySubtipo: string;
    setSelectedTheorySubtipo: (v: string) => void;
    setSelectedTheoryLibraryItem: (item: any) => void;
    // Producción
    produccionLibrary: any[];
    selectedProduccionNivel: string;
    setSelectedProduccionNivel: (v: string) => void;
    selectedProduccionSubnivel: string;
    setSelectedProduccionSubnivel: (v: string) => void;
    selectedProduccionTipo: string;
    setSelectedProduccionTipo: (v: string) => void;
    setSelectedProduccionLibraryItem: (item: any) => void;
    // Valoración
    valoracionLibrary: any[];
    selectedValoracionCategoria: string;
    setSelectedValoracionCategoria: (v: string) => void;
    setSelectedValoracionLibraryItem: (item: any) => void;
    // Adaptaciones
    adaptacionesLibrary: any[];
    selectedAdaptacionTipo: string;
    setSelectedAdaptacionTipo: (v: string) => void;
    selectedAdaptacionSituacion: string;
    setSelectedAdaptacionSituacion: (v: string) => void;
    setSelectedAdaptacionLibraryItem: (item: any) => void;
    // Recursos
    recursosLibrary: any[];
    selectedRecursoTipo: string;
    setSelectedRecursoTipo: (v: string) => void;
    setSelectedRecursoLibraryItem: (item: any) => void;
    // Fuentes
    fuentesLibrary: any[];
    selectedFuenteTipo: string;
    setSelectedFuenteTipo: (v: string) => void;
    setSelectedFuenteLibraryItem: (item: any) => void;
    /** Catálogo de tipos de fuente para resolver nombre a partir del ID */
    tiposFuenteCatalogo: { id_tipo_fuente: number; tipo_fuente: string }[];
}

// ─── Estilo por pestaña ───────────────────────────────────────────────────────
const TAB_STYLE: Record<string, { accent: string; ring: string; icon: string; chipBg: string; chipText: string }> = {
    practica: { accent: 'border-rose-400 focus:ring-rose-100', ring: 'focus:ring-rose-100', icon: 'auto_fix', chipBg: 'bg-rose-50', chipText: 'text-rose-600' },
    teoria: { accent: 'border-blue-400 focus:ring-blue-100', ring: 'focus:ring-blue-100', icon: 'menu_book', chipBg: 'bg-blue-50', chipText: 'text-blue-600' },
    produccion: { accent: 'border-amber-400 focus:ring-amber-100', ring: 'focus:ring-amber-100', icon: 'construction', chipBg: 'bg-amber-50', chipText: 'text-amber-600' },
    valoracion: { accent: 'border-emerald-400 focus:ring-emerald-100', ring: 'focus:ring-emerald-100', icon: 'verified', chipBg: 'bg-emerald-50', chipText: 'text-emerald-600' },
    adaptaciones: { accent: 'border-indigo-400 focus:ring-indigo-100', ring: 'focus:ring-indigo-100', icon: 'accessibility_new', chipBg: 'bg-indigo-50', chipText: 'text-indigo-600' },
    recursos: { accent: 'border-cyan-400 focus:ring-cyan-100', ring: 'focus:ring-cyan-100', icon: 'inventory_2', chipBg: 'bg-cyan-50', chipText: 'text-cyan-600' },
    fuentes: { accent: 'border-orange-400 focus:ring-orange-100', ring: 'focus:ring-orange-100', icon: 'import_contacts', chipBg: 'bg-orange-50', chipText: 'text-orange-600' },
};

// ─── Select reutilizable ──────────────────────────────────────────────────────
interface FilterSelectProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    disabled?: boolean;
    icon?: string;
    accentClass: string;
    ringClass: string;
    stepNumber?: number;
}

function FilterSelect({ label, value, onChange, options, placeholder, disabled, icon, accentClass, ringClass, stepNumber }: FilterSelectProps) {
    const hasValue = value !== '';
    return (
        <div className={`flex flex-col gap-1.5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-1.5">
                {stepNumber && (
                    <span className={`size-4 rounded-full text-[9px] font-black flex items-center justify-center shrink-0 ${hasValue ? `${accentClass.split(' ')[0].replace('border-', 'bg-').replace('-400', '-500')} text-white` : 'bg-slate-100 text-slate-400'}`}>
                        {stepNumber}
                    </span>
                )}
                {icon && <span className={`material-symbols-rounded text-sm ${hasValue ? accentClass.split(' ')[0].replace('border-', 'text-') : 'text-slate-400'}`}>{icon}</span>}
                <label className={`text-[10px] font-black uppercase tracking-[0.18em] ${hasValue ? accentClass.split(' ')[0].replace('border-', 'text-') : 'text-slate-400'}`}>
                    {label}
                </label>
                {hasValue && <span className="material-symbols-rounded text-xs text-emerald-500 ml-auto">check_circle</span>}
            </div>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className={`w-full appearance-none bg-white border-2 rounded-xl px-3.5 py-2.5 pr-9 text-xs font-semibold text-slate-700 outline-none transition-all duration-200 cursor-pointer
                        ${hasValue
                            ? `${accentClass} focus:ring-4 shadow-sm`
                            : `border-slate-200 focus:${accentClass} focus:ring-4 ${ringClass}`
                        } disabled:cursor-not-allowed`}
                >
                    <option value="">{placeholder}</option>
                    {options.map((opt, idx) => (
                        <option key={`${opt.value ?? 'empty'}-${idx}`} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-base ${hasValue ? accentClass.split(' ')[0].replace('border-', 'text-') : 'text-slate-300'}`}>
                    expand_more
                </span>
            </div>
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function MomentoLibrary(props: MomentoLibraryProps) {
    const {
        activeTab,
        library, selectedProposito, setSelectedProposito, selectedTipo, setSelectedTipo, setSelectedLibraryItem,
        theoryLibrary, selectedTheoryTipo, setSelectedTheoryTipo,
        selectedTheorySubtipo, setSelectedTheorySubtipo,
        setSelectedTheoryLibraryItem,
        produccionLibrary, selectedProduccionNivel, setSelectedProduccionNivel,
        selectedProduccionSubnivel, setSelectedProduccionSubnivel,
        selectedProduccionTipo, setSelectedProduccionTipo, setSelectedProduccionLibraryItem,
        valoracionLibrary, selectedValoracionCategoria, setSelectedValoracionCategoria, setSelectedValoracionLibraryItem,
        adaptacionesLibrary, selectedAdaptacionTipo, setSelectedAdaptacionTipo,
        selectedAdaptacionSituacion, setSelectedAdaptacionSituacion, setSelectedAdaptacionLibraryItem,
        recursosLibrary, selectedRecursoTipo, setSelectedRecursoTipo, setSelectedRecursoLibraryItem,
        fuentesLibrary, selectedFuenteTipo, setSelectedFuenteTipo, setSelectedFuenteLibraryItem,
        tiposFuenteCatalogo,
    } = props;

    const [selectedPracticaId, setSelectedPracticaId] = useState('');
    const [selectedTheoryId, setSelectedTheoryId] = useState('');
    const [selectedProduccionId, setSelectedProduccionId] = useState('');
    const [selectedValoracionId, setSelectedValoracionId] = useState('');
    const [selectedAdaptacionId, setSelectedAdaptacionId] = useState('');
    const [selectedRecursoId, setSelectedRecursoId] = useState('');
    const [selectedFuenteId, setSelectedFuenteId] = useState('');

    // ─── Listas Filtradas (Memoized) ──────────────────────────────────────────
    const filteredPractica = React.useMemo(() => {
        if (!selectedProposito || !selectedTipo) return [];
        return library.filter(i => i.proposito === selectedProposito && i.tipo === selectedTipo);
    }, [library, selectedProposito, selectedTipo]);

    const filteredTheory = React.useMemo(() => {
        return theoryLibrary.filter(i => {
            if (selectedTheoryTipo && i.proposito !== selectedTheoryTipo) return false;
            if (selectedTheorySubtipo && i.tipo !== selectedTheorySubtipo) return false;
            return true;
        });
    }, [theoryLibrary, selectedTheoryTipo, selectedTheorySubtipo]);

    const filteredProduccion = React.useMemo(() => {
        if (!selectedProduccionNivel || !selectedProduccionSubnivel || !selectedProduccionTipo) return [];
        return produccionLibrary.filter(i =>
            i.nivel === selectedProduccionNivel &&
            i.subnivel === selectedProduccionSubnivel &&
            i.tipo === selectedProduccionTipo
        );
    }, [produccionLibrary, selectedProduccionNivel, selectedProduccionSubnivel, selectedProduccionTipo]);

    const filteredValoracion = React.useMemo(() => {
        if (!selectedValoracionCategoria) return [];
        return valoracionLibrary.filter(i => i.categoria === selectedValoracionCategoria);
    }, [valoracionLibrary, selectedValoracionCategoria]);

    const filteredAdaptaciones = React.useMemo(() => {
        if (!selectedAdaptacionTipo || !selectedAdaptacionSituacion) return [];
        return adaptacionesLibrary.filter(i =>
            i.tipo === selectedAdaptacionTipo &&
            i.situacion === selectedAdaptacionSituacion
        );
    }, [adaptacionesLibrary, selectedAdaptacionTipo, selectedAdaptacionSituacion]);

    const filteredRecursos = React.useMemo(() => {
        if (!selectedRecursoTipo) return [];
        return recursosLibrary.filter(i => i.tipo === selectedRecursoTipo);
    }, [recursosLibrary, selectedRecursoTipo]);

    const filteredFuentes = React.useMemo(() => {
        if (!selectedFuenteTipo) return [];
        
        const selectedId = String(selectedFuenteTipo);
        const selectedLabel = tiposFuenteCatalogo.find(t => String(t.id_tipo_fuente) === selectedId)?.tipo_fuente;

        return fuentesLibrary.filter(i => {
            const itemTipoId = String(i.tipo);
            const itemTipoName = i.tipo_fuente_obj?.tipo_fuente;
            
            // Coincidencia por ID o por Nombre de categoría (para máxima compatibilidad)
            return itemTipoId === selectedId || 
                   String(i.tipo_fuente_obj?.id_tipo_fuente) === selectedId ||
                   (selectedLabel && itemTipoName === selectedLabel);
        });
    }, [fuentesLibrary, selectedFuenteTipo, tiposFuenteCatalogo]);

    // Log de diagnóstico
    React.useEffect(() => {
        if (activeTab === 'fuentes') {
            console.log(`[Fuentes] Total en biblioteca: ${fuentesLibrary.length}`, fuentesLibrary);
        }
    }, [fuentesLibrary, activeTab]);

    // Cuando las listas cambian (re-fetch), resincronizar selecciones
    React.useEffect(() => {
        if (selectedPracticaId) {
            const idx = parseInt(selectedPracticaId, 10);
            if (filteredPractica[idx]) setSelectedLibraryItem(filteredPractica[idx]);
            else { setSelectedPracticaId(''); setSelectedLibraryItem(null); }
        }
    }, [filteredPractica]);

    React.useEffect(() => {
        if (selectedTheoryId) {
            const idx = parseInt(selectedTheoryId, 10);
            if (filteredTheory[idx]) setSelectedTheoryLibraryItem(filteredTheory[idx]);
            else { setSelectedTheoryId(''); setSelectedTheoryLibraryItem(null); }
        }
    }, [filteredTheory]);

    React.useEffect(() => {
        if (selectedProduccionId) {
            const idx = parseInt(selectedProduccionId, 10);
            if (filteredProduccion[idx]) setSelectedProduccionLibraryItem(filteredProduccion[idx]);
            else { setSelectedProduccionId(''); setSelectedProduccionLibraryItem(null); }
        }
    }, [filteredProduccion]);

    React.useEffect(() => {
        if (selectedValoracionId) {
            const idx = parseInt(selectedValoracionId, 10);
            if (filteredValoracion[idx]) setSelectedValoracionLibraryItem(filteredValoracion[idx]);
            else { setSelectedValoracionId(''); setSelectedValoracionLibraryItem(null); }
        }
    }, [filteredValoracion]);

    React.useEffect(() => {
        if (selectedAdaptacionId) {
            const idx = parseInt(selectedAdaptacionId, 10);
            if (filteredAdaptaciones[idx]) setSelectedAdaptacionLibraryItem(filteredAdaptaciones[idx]);
            else { setSelectedAdaptacionId(''); setSelectedAdaptacionLibraryItem(null); }
        }
    }, [filteredAdaptaciones]);

    React.useEffect(() => {
        if (selectedRecursoId) {
            const idx = parseInt(selectedRecursoId, 10);
            if (filteredRecursos[idx]) setSelectedRecursoLibraryItem(filteredRecursos[idx]);
            else { setSelectedRecursoId(''); setSelectedRecursoLibraryItem(null); }
        }
    }, [filteredRecursos]);

    React.useEffect(() => {
        if (selectedFuenteId) {
            const idx = parseInt(selectedFuenteId, 10);
            if (filteredFuentes[idx]) setSelectedFuenteLibraryItem(filteredFuentes[idx]);
            else { setSelectedFuenteId(''); setSelectedFuenteLibraryItem(null); }
        }
    }, [filteredFuentes]);

    const style = TAB_STYLE[activeTab] || TAB_STYLE.practica;

    // Calcular progreso de pasos
    const stepsDone =
        activeTab === 'practica' ? [selectedProposito, selectedTipo, selectedPracticaId].filter(Boolean).length :
            activeTab === 'teoria' ? [selectedTheoryTipo, selectedTheoryId].filter(Boolean).length :
                activeTab === 'produccion' ? [selectedProduccionNivel, selectedProduccionSubnivel, selectedProduccionTipo, selectedProduccionId].filter(Boolean).length :
                    activeTab === 'valoracion' ? [selectedValoracionCategoria, selectedValoracionId].filter(Boolean).length :
                        activeTab === 'adaptaciones' ? [selectedAdaptacionTipo, selectedAdaptacionSituacion, selectedAdaptacionId].filter(Boolean).length :
                            activeTab === 'recursos' ? [selectedRecursoTipo, selectedRecursoId].filter(Boolean).length :
                                activeTab === 'fuentes' ? [selectedFuenteTipo, selectedFuenteId].filter(Boolean).length : 0;

    const totalSteps =
        activeTab === 'practica' ? 3 :
            activeTab === 'produccion' ? 4 :
                activeTab === 'adaptaciones' ? 3 :
                    2;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 bg-slate-50/60">
                <div className="flex items-center gap-2">
                    <span className={`material-symbols-rounded text-base ${style.chipText}`}>{style.icon}</span>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {activeTab === 'fuentes' ? 'Seleccionar Fuente' : 'Explorar Biblioteca'}
                        </span>
                        {activeTab === 'fuentes' && (
                            <span className="text-[8px] font-bold text-orange-500 uppercase tracking-tighter">
                                {fuentesLibrary.length} registros en biblioteca
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 w-6 rounded-full transition-all duration-300 ${i < stepsDone
                                ? `${style.chipBg.replace('bg-', 'bg-').replace('-50', '-400')}`
                                : 'bg-slate-100'
                                }`}
                        />
                    ))}
                    <span className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">
                        {stepsDone}/{totalSteps}
                    </span>
                </div>
            </div>

            {/* Selectores */}
            <div className="p-4">

                {/* ── PRÁCTICA ── */}
                {activeTab === 'practica' && (
                    <div className="grid grid-cols-3 gap-4">
                        <FilterSelect
                            label="Propósito" stepNumber={1}
                            value={selectedProposito} onChange={(v) => { setSelectedProposito(v); setSelectedTipo(''); setSelectedPracticaId(''); setSelectedLibraryItem(null); }}
                            options={Array.from(new Set(library.map(i => i.proposito))).filter(Boolean).map(p => ({ value: p as string, label: (p as string).toUpperCase() }))}
                            placeholder="Seleccionar..." icon="track_changes"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                        <FilterSelect
                            label="Tipo de Actividad" stepNumber={2}
                            value={selectedTipo} onChange={(v) => { setSelectedTipo(v); setSelectedPracticaId(''); setSelectedLibraryItem(null); }}
                            options={selectedProposito ? Array.from(new Set(library.filter(i => i.proposito === selectedProposito).map(i => i.tipo))).filter(Boolean).map(t => ({ value: t as string, label: t as string })) : []}
                            placeholder="Seleccionar..." disabled={!selectedProposito} icon="category"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                        <FilterSelect
                            label="Actividad Sugerida" stepNumber={3}
                            value={selectedPracticaId}
                            onChange={(v) => {
                                setSelectedPracticaId(v);
                                const idx = parseInt(v, 10);
                                const item = filteredPractica[idx];
                                if (item) setSelectedLibraryItem(item);
                            }}
                            options={filteredPractica.map((i, idx) => ({
                                value: String(idx),
                                label: i.nombre_practica
                            }))}
                            placeholder="Seleccionar..." disabled={!selectedTipo} icon="star"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                    </div>
                )}

                {/* ── TEORÍA ── */}
                {activeTab === 'teoria' && (
                    <div className="grid grid-cols-3 gap-4">
                        <FilterSelect
                            label="Propósito" stepNumber={1}
                            value={selectedTheoryTipo} onChange={(v) => { setSelectedTheoryTipo(v); setSelectedTheorySubtipo(''); setSelectedTheoryId(''); setSelectedTheoryLibraryItem(null); }}
                            options={Array.from(new Set(theoryLibrary.map(i => i.proposito))).filter(Boolean).map(t => ({ value: t as string, label: (t as string).toUpperCase() }))}
                            placeholder="Seleccionar..." icon="track_changes"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                        <FilterSelect
                            label="Tipo de Estrategia" stepNumber={2}
                            value={selectedTheorySubtipo} onChange={(v) => { setSelectedTheorySubtipo(v); setSelectedTheoryId(''); setSelectedTheoryLibraryItem(null); }}
                            options={selectedTheoryTipo ? Array.from(new Set(theoryLibrary.filter(i => i.proposito === selectedTheoryTipo).map(i => i.tipo))).filter(Boolean).map(t => ({ value: t as string, label: t as string })) : []}
                            placeholder="Seleccionar..." disabled={!selectedTheoryTipo} icon="category"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                        <FilterSelect
                            label="Estrategia Teórica" stepNumber={3}
                            value={selectedTheoryId}
                            onChange={(v) => {
                                setSelectedTheoryId(v);
                                const idx = parseInt(v, 10);
                                const item = filteredTheory[idx];
                                if (item) setSelectedTheoryLibraryItem(item);
                            }}
                            options={filteredTheory.map((i, idx) => ({
                                value: String(idx),
                                label: i.nombre_estrategia_teorica
                            }))}
                            placeholder="Seleccionar..." disabled={!selectedTheorySubtipo} icon="menu_book"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                    </div>
                )}

                {/* ── PRODUCCIÓN ── */}
                {activeTab === 'produccion' && (
                    <div className="grid grid-cols-2 gap-4">
                        <FilterSelect
                            label="Nivel" stepNumber={1}
                            value={selectedProduccionNivel} onChange={(v) => { setSelectedProduccionNivel(v); setSelectedProduccionSubnivel(''); setSelectedProduccionTipo(''); setSelectedProduccionId(''); setSelectedProduccionLibraryItem(null); }}
                            options={Array.from(new Set(produccionLibrary.map(i => i.nivel))).filter(Boolean).map(n => ({ value: n as string, label: (n as string)?.toUpperCase() }))}
                            placeholder="Nivel..." icon="school"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                        <FilterSelect
                            label="Subnivel" stepNumber={2}
                            value={selectedProduccionSubnivel} onChange={(v) => { setSelectedProduccionSubnivel(v); setSelectedProduccionTipo(''); setSelectedProduccionId(''); setSelectedProduccionLibraryItem(null); }}
                            options={selectedProduccionNivel ? Array.from(new Set(produccionLibrary.filter(i => i.nivel === selectedProduccionNivel).map(i => i.subnivel))).filter(Boolean).map(s => ({ value: s as string, label: (s as string)?.toUpperCase() })) : []}
                            placeholder="Subnivel..." disabled={!selectedProduccionNivel} icon="layers"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                        <FilterSelect
                            label="Tipo" stepNumber={3}
                            value={selectedProduccionTipo} onChange={(v) => { setSelectedProduccionTipo(v); setSelectedProduccionId(''); setSelectedProduccionLibraryItem(null); }}
                            options={selectedProduccionSubnivel ? Array.from(new Set(produccionLibrary.filter(i => i.nivel === selectedProduccionNivel && i.subnivel === selectedProduccionSubnivel).map(i => i.tipo))).filter(Boolean).map(t => ({ value: t as string, label: (t as string)?.toUpperCase() })) : []}
                            placeholder="Tipo..." disabled={!selectedProduccionSubnivel} icon="category"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                        <FilterSelect
                            label="Producto" stepNumber={4}
                            value={selectedProduccionId}
                            onChange={(v) => {
                                setSelectedProduccionId(v);
                                const idx = parseInt(v, 10);
                                const item = filteredProduccion[idx];
                                if (item) setSelectedProduccionLibraryItem(item);
                            }}
                            options={filteredProduccion.map((i, idx) => ({
                                value: String(idx),
                                label: i.nombre_produccion
                            }))}
                            placeholder="Seleccionar..." disabled={!selectedProduccionTipo} icon="construction"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                    </div>
                )}

                {/* ── VALORACIÓN ── */}
                {activeTab === 'valoracion' && (
                    <div className="grid grid-cols-2 gap-4">
                        <FilterSelect
                            label="Categoría" stepNumber={1}
                            value={selectedValoracionCategoria} onChange={(v) => { setSelectedValoracionCategoria(v); setSelectedValoracionId(''); setSelectedValoracionLibraryItem(null); }}
                            options={Array.from(new Set(valoracionLibrary.map(i => i.categoria))).filter(Boolean).map(c => ({ value: c as string, label: (c as string)?.toUpperCase() }))}
                            placeholder="Seleccionar categoría..." icon="folder"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                        <FilterSelect
                            label="Preguntas" stepNumber={2}
                            value={selectedValoracionId}
                            onChange={(v) => {
                                setSelectedValoracionId(v);
                                const idx = parseInt(v, 10);
                                const item = filteredValoracion[idx];
                                if (item) setSelectedValoracionLibraryItem(item);
                            }}
                            options={filteredValoracion.map((i, idx) => ({
                                value: String(idx),
                                label: (i.preguntas?.substring(0, 80) || '—') + '...'
                            }))}
                            placeholder="Seleccionar instrumento..." disabled={!selectedValoracionCategoria} icon="verified"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                    </div>
                )}

                {/* ── ADAPTACIONES ── */}
                {activeTab === 'adaptaciones' && (
                    <div className="grid grid-cols-3 gap-4">
                        <FilterSelect
                            label="Tipo" stepNumber={1}
                            value={selectedAdaptacionTipo} onChange={(v) => { setSelectedAdaptacionTipo(v); setSelectedAdaptacionSituacion(''); setSelectedAdaptacionId(''); setSelectedAdaptacionLibraryItem(null); }}
                            options={Array.from(new Set(adaptacionesLibrary.map(i => i.tipo))).map(t => ({ value: t as string, label: t as string }))}
                            placeholder="Seleccionar tipo..." icon="tune"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                        <FilterSelect
                            label="Situación" stepNumber={2}
                            value={selectedAdaptacionSituacion} onChange={(v) => { setSelectedAdaptacionSituacion(v); setSelectedAdaptacionId(''); setSelectedAdaptacionLibraryItem(null); }}
                            options={selectedAdaptacionTipo ? Array.from(new Set(adaptacionesLibrary.filter(i => i.tipo === selectedAdaptacionTipo).map(i => i.situacion))).map(s => ({ value: s as string, label: s as string })) : []}
                            placeholder="Seleccionar situación..." disabled={!selectedAdaptacionTipo} icon="category"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                        <FilterSelect
                            label="Adaptación" stepNumber={3}
                            value={selectedAdaptacionId}
                            onChange={(v) => {
                                setSelectedAdaptacionId(v);
                                const idx = parseInt(v, 10);
                                const item = filteredAdaptaciones[idx];
                                if (item) setSelectedAdaptacionLibraryItem(item);
                            }}
                            options={filteredAdaptaciones.map((i, idx) => ({
                                value: String(idx),
                                label: i.nombre_adaptacion
                            }))}
                            placeholder="Seleccionar..." disabled={!selectedAdaptacionSituacion} icon="accessibility_new"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                    </div>
                )}

                {/* ── RECURSOS ── */}
                {activeTab === 'recursos' && (
                    <div className="grid grid-cols-2 gap-4">
                        <FilterSelect
                            label="Tipo de Recurso" stepNumber={1}
                            value={selectedRecursoTipo} onChange={(v) => { setSelectedRecursoTipo(v); setSelectedRecursoId(''); setSelectedRecursoLibraryItem(null); }}
                            options={Array.from(new Set(recursosLibrary.map(i => i.tipo))).map(t => ({ value: t as string, label: t as string }))}
                            placeholder="Seleccionar tipo..." icon="category"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                        <FilterSelect
                            label="Recurso" stepNumber={2}
                            value={selectedRecursoId}
                            onChange={(v) => {
                                setSelectedRecursoId(v);
                                const idx = parseInt(v, 10);
                                const item = filteredRecursos[idx];
                                if (item) setSelectedRecursoLibraryItem(item);
                            }}
                            options={filteredRecursos.map((i, idx) => ({
                                value: String(idx),
                                label: i.recursos
                            }))}
                            placeholder="Seleccionar recurso..." disabled={!selectedRecursoTipo} icon="inventory_2"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                    </div>
                )}

                {/* ── FUENTES ── */}
                {activeTab === 'fuentes' && (
                    <div className="grid grid-cols-2 gap-4">
                        <FilterSelect
                            label="Tipo de Fuente" stepNumber={1}
                            value={selectedFuenteTipo} 
                            onChange={(v) => { 
                                setSelectedFuenteTipo(v); 
                                setSelectedFuenteId(''); 
                                setSelectedFuenteLibraryItem(null); 
                            }}
                            options={tiposFuenteCatalogo.map(t => ({ 
                                value: String(t.id_tipo_fuente), 
                                label: t.tipo_fuente 
                            }))}
                            placeholder="Seleccionar tipo..." icon="category"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                        <FilterSelect
                            label="Título" stepNumber={2}
                            value={selectedFuenteId}
                            onChange={(v) => {
                                setSelectedFuenteId(v);
                                const idx = parseInt(v, 10);
                                const item = filteredFuentes[idx];
                                if (item) setSelectedFuenteLibraryItem(item);
                            }}
                            options={filteredFuentes.map((i, idx) => ({
                                value: String(idx),
                                label: i.titulo_fuente || '—'
                            }))}
                            placeholder={filteredFuentes.length > 0 ? "Seleccionar fuente..." : "No hay fuentes de este tipo"} 
                            disabled={!selectedFuenteTipo} 
                            icon="import_contacts"
                            accentClass={style.accent} ringClass={style.ring}
                        />
                    </div>
                )}

            </div>
        </div>
    );
}
