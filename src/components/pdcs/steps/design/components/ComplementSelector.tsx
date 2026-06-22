import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ComplementSelectorProps {
    complementCategories: string[];
    selectedCompCategory: string;
    setSelectedCompCategory: (v: string) => void;
    complementFilters: {
        niveles: string[];
        categoria: string;
        subcategoria: string;
    };
    setComplementFilters: (v: any) => void;
    complementSubCategories: string[];
    allComplementLevels: string[];
    showCompFilters: boolean;
    setShowCompFilters: (v: boolean) => void;
    toggleComplementNivelFilter: (v: string) => void;
    filteredComplementos: any[];
    complementSearch: string;
    setComplementSearch: (v: string) => void;
    currentObjective: any;
    hoveredComplement: any;
    setHoveredComplement: (v: any) => void;
    catalogoComplementos: any[];
    onToggleComplement: (comp: any) => void;
}

export function ComplementSelector(props: ComplementSelectorProps) {
    const {
        complementCategories,
        complementFilters,
        setComplementFilters,
        complementSubCategories,
        allComplementLevels,
        showCompFilters,
        setShowCompFilters,
        toggleComplementNivelFilter,
        filteredComplementos: propsFilteredComplementos,
        complementSearch,
        setComplementSearch,
        currentObjective,
        hoveredComplement,
        setHoveredComplement,
        catalogoComplementos,
        onToggleComplement
    } = props;

    // Local search state to prevent keystroke lag
    const [localSearch, setLocalSearch] = React.useState(complementSearch || '');

    // Sync from props if updated externally
    React.useEffect(() => {
        setLocalSearch(complementSearch || '');
    }, [complementSearch]);

    // Local filtering to avoid re-rendering parent context on every keypress
    const filteredComplementos = React.useMemo(() => {
        if (!catalogoComplementos) return [];
        return catalogoComplementos.filter((c: any) => {
            // Búsqueda
            if (localSearch && !c.complemento.toLowerCase().includes(localSearch.toLowerCase())) return false;
            
            // Filtro de categoría vieja
            if (props.selectedCompCategory && c.categoria !== props.selectedCompCategory) return false;

            // Nuevos filtros
            if (complementFilters.categoria && c.categoria !== complementFilters.categoria) return false;
            if (complementFilters.subcategoria && c.subcategoria !== complementFilters.subcategoria) return false;
            
            if (complementFilters.niveles.length > 0) {
                if (!c.niveles_sugeridos) return false;
                if (!complementFilters.niveles.some((n: string) => c.niveles_sugeridos?.includes(n))) return false;
            }

            return true;
        }).sort((a, b) => a.complemento.localeCompare(b.complemento));
    }, [catalogoComplementos, localSearch, props.selectedCompCategory, complementFilters]);

    // Obtener el complemento actual (hover o seleccionado)
    const activeComp = hoveredComplement || catalogoComplementos.find(c => c.id === currentObjective.complementId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-1">
                        <label className="soft-label text-blue-600 !mb-0">Paso 3.3: Sentido Crítico (Finalidad)</label>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCompFilters(!showCompFilters)}
                        className={`rounded-xl h-9 text-[10px] font-black uppercase tracking-widest gap-2 transition-all ${showCompFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white text-slate-500'}`}
                    >
                        <span className="material-symbols-rounded text-lg">{showCompFilters ? 'filter_list_off' : 'filter_list'}</span>
                        {showCompFilters ? 'Ocultar Filtros' : 'Filtros Avanzados'}
                    </Button>
                </div>

                {/* Buscador de Complementos */}
                <div className="relative group flex-1 max-w-md">
                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por propósito o palabras clave..."
                        value={localSearch}
                        onChange={(e) => {
                            setLocalSearch(e.target.value);
                            setComplementSearch(e.target.value);
                        }}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-2.5 pl-12 pr-4 text-[11px] font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-inner"
                    />
                </div>
            </div>

            {showCompFilters && (
                <div className="space-y-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-200/60 animate-in slide-in-from-top-4 duration-500 shadow-inner">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                            <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Refinamiento de Finalidad
                        </h4>
                        <button 
                            onClick={() => setComplementFilters({ niveles: [], categoria: '', subcategoria: '' })}
                            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest transition-colors"
                        >
                            Restablecer
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Categoría y Subcategoría */}
                        <div className="space-y-5 bg-white/70 p-5 rounded-2xl border border-emerald-100/50 relative shadow-sm">
                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Categoría Principal</span>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setComplementFilters((prev: any) => ({ ...prev, categoria: '', subcategoria: '' }))}
                                        className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border ${!complementFilters.categoria ? 'bg-emerald-600 text-white border-transparent' : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200'}`}
                                    >
                                        Todas
                                    </button>
                                    {complementCategories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setComplementFilters((prev: any) => ({ ...prev, categoria: cat, subcategoria: '' }))}
                                            className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border ${complementFilters.categoria === cat ? 'bg-emerald-600 text-white border-transparent shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {complementFilters.categoria && complementSubCategories.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-emerald-50">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Subcategoría Específica</span>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setComplementFilters((prev: any) => ({ ...prev, subcategoria: '' }))}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all border ${!complementFilters.subcategoria ? 'bg-emerald-100 text-emerald-700 border-transparent' : 'bg-white text-slate-400 border-slate-100'}`}
                                        >
                                            Todas las subcategorías
                                        </button>
                                        {complementSubCategories.map(sub => (
                                            <button
                                                key={sub}
                                                onClick={() => setComplementFilters((prev: any) => ({ ...prev, subcategoria: sub }))}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all border ${complementFilters.subcategoria === sub ? 'bg-emerald-600 text-white border-transparent shadow-sm' : 'bg-white text-slate-500 border-slate-100 hover:border-emerald-200'}`}
                                            >
                                                {sub}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Niveles Sugeridos */}
                        <div className="space-y-4 bg-white/70 p-5 rounded-2xl border border-emerald-100/50 shadow-sm">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Niveles Educativos Sugeridos</span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setComplementFilters((prev: any) => ({ ...prev, niveles: [] }))}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${complementFilters.niveles.length === 0 ? 'bg-slate-900 text-white border-transparent' : 'bg-white text-slate-400 border-slate-200 hover:text-emerald-600'}`}
                                >
                                    Todos
                                </button>
                                {allComplementLevels.map(n => (
                                    <button
                                        key={n}
                                        onClick={() => toggleComplementNivelFilter(n)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${complementFilters.niveles.includes(n) ? 'bg-slate-900 text-white border-transparent shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:text-emerald-600'}`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[9px] text-slate-400 font-medium px-1 italic">Filtrar propósitos según la adecuación pedagógica del nivel seleccionado.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-4 items-start content-start pb-10">
                    {filteredComplementos.length > 0 ? (
                        filteredComplementos.map(comp => (
                            <button
                                key={comp.id}
                                onMouseEnter={() => setHoveredComplement(comp)}
                                onMouseLeave={() => setHoveredComplement(null)}
                                onClick={() => onToggleComplement(comp)}
                                className={`p-5 rounded-2xl text-left border text-[11px] font-bold leading-relaxed transition-all relative group/item overflow-hidden ${currentObjective.complementId === comp.id ? 'bg-emerald-600 text-white border-transparent shadow-glow scale-[1.02]' : 'bg-white border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/10 text-slate-600'}`}
                            >
                                <div className="flex flex-col gap-2 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[8px] uppercase tracking-tighter font-black ${currentObjective.complementId === comp.id ? 'text-emerald-100' : 'text-emerald-600'}`}>
                                            {comp.categoria}
                                        </span>
                                        {comp.subcategoria && (
                                            <span className={`text-[8px] font-black opacity-60`}>• {comp.subcategoria}</span>
                                        )}
                                    </div>
                                    <p className="line-clamp-3">
                                        <span className="opacity-60 font-medium italic mr-1">...para</span>
                                        {comp.complemento}
                                    </p>
                                </div>
                                {currentObjective.complementId === comp.id && (
                                    <div className="absolute right-2 bottom-2 text-white/40">
                                        <span className="material-symbols-rounded text-base">verified</span>
                                    </div>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                            <span className="material-symbols-rounded text-slate-300 text-5xl mb-4">search_off</span>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No hay complementos que coincidan</p>
                            <Button variant="ghost" size="sm" onClick={() => setComplementFilters({ niveles: [], categoria: '', subcategoria: '' })} className="mt-4 text-[9px] font-black text-emerald-600">Limpiar todos los filtros</Button>
                        </div>
                    )}
                </div>

                <div className="hidden lg:block sticky top-8">
                    {activeComp ? (
                        <Card className="bg-emerald-700 border-none p-7 space-y-6 rounded-[2.5rem] shadow-premium text-white relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 size-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                            
                            <div className="space-y-5 relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                            <span className="material-symbols-rounded text-white text-xl">psychology</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Sentido Crítico</h4>
                                            <span className="text-[8px] font-bold text-emerald-200/60 tracking-[0.1em]">ENFOQUE PEDAGÓGICO</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/20 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                                        <span className="text-[8px] font-black uppercase text-white">{activeComp.categoria}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="relative">
                                        <span className="absolute -left-3 -top-2 text-4xl text-white/10 font-serif">"</span>
                                        <p className="text-[13px] font-bold leading-relaxed italic border-l-4 border-emerald-400/50 pl-5 py-1">
                                            {activeComp.complemento}
                                        </p>
                                    </div>
                                    
                                    {activeComp.subcategoria && (
                                        <div className="flex items-center gap-2 px-1">
                                            <span className="size-1.5 bg-emerald-400 rounded-full"></span>
                                            <span className="text-[9px] font-black uppercase text-emerald-100/80">{activeComp.subcategoria}</span>
                                        </div>
                                    )}

                                    {activeComp.ejemplo_uso && (
                                        <div className="bg-black/20 rounded-2xl p-5 border border-white/10 space-y-3 shadow-inner">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-rounded text-emerald-300 text-sm">tips_and_updates</span>
                                                <span className="text-[9px] font-black uppercase text-emerald-200 tracking-wider">Aplicación Sugerida:</span>
                                            </div>
                                            <p className="text-[11px] font-medium leading-relaxed text-emerald-50">
                                                {activeComp.ejemplo_uso}
                                            </p>
                                        </div>
                                    )}

                                    {activeComp.niveles_sugeridos && activeComp.niveles_sugeridos.length > 0 && (
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black uppercase text-emerald-200/50 tracking-widest">Niveles de aplicación</span>
                                            <div className="flex flex-wrap gap-2">
                                                {activeComp.niveles_sugeridos.map((n: string) => (
                                                    <span key={n} className="bg-white/10 text-[9px] font-black px-3 py-1 rounded-lg border border-white/5">
                                                        {n}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="bg-slate-50/50 p-10 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center py-24 opacity-40 grayscale flex flex-col items-center gap-5">
                            <div className="size-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center rotate-6">
                                <span className="material-symbols-rounded text-4xl text-slate-300">target</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-8 leading-relaxed">
                                Selecciona una finalidad para consolidar el sentido crítico de tu objetivo
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

