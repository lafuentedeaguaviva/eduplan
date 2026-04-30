'use client';

import React from 'react';
import { EvaluacionTab } from '@/hooks/useCriteriosEvaluacion';
import { 
    Layers, 
    Filter, 
    Search, 
    Sparkles,
    CheckCircle2
} from 'lucide-react';

interface CriteriosSelectorProps {
    tab: EvaluacionTab;
    filters: any;
    setFilters: (f: any) => void;
    // Data sources
    data1: string[]; // Level 1 (Categoria, Nivel, Condicion)
    data2: string[]; // Level 2 (Subcategoria, Subnivel)
    data3: any[];    // Level 3 (Nombres, Verbos)
    onSelectItem: (item: any) => void;
}

export const CriteriosSelector: React.FC<CriteriosSelectorProps> = ({
    tab, filters, setFilters, data1, data2, data3, onSelectItem
}) => {

    const getLabels = () => {
        switch (tab) {
            case 'ser': return ['Categoría Principal', 'Subcategoría de Valor', 'Criterio Sugerido'];
            case 'saber': return ['Nivel de Conocimiento', 'Dimensión Cognitiva', 'Taxonomía'];
            case 'hacer': return ['Nivel de Acción', 'Ámbito de Aplicación', 'Verbo de Desempeño'];
            case 'adaptacion': return ['Condición / Situación', 'Nombre de Adaptación', 'Estrategia de Evaluación'];
            default: return ['', '', ''];
        }
    };

    const labels = getLabels();

    const handleSelect1 = (val: string) => {
        if (tab === 'ser') setFilters({ ...filters, categoria: val, subcategoria: '', nombre: '' });
        else if (tab === 'saber') setFilters({ ...filters, nivel: val, subnivel: '', verbo: '' });
        else if (tab === 'hacer') setFilters({ ...filters, nivel: val, subnivel: '', verbo: '' });
        else if (tab === 'adaptacion') setFilters({ ...filters, condicion: val, nombre: '' });
    };

    const handleSelect2 = (val: string) => {
        if (tab === 'ser') setFilters({ ...filters, subcategoria: val });
        else if (tab === 'saber') setFilters({ ...filters, subnivel: val });
        else if (tab === 'hacer') setFilters({ ...filters, subnivel: val });
        else if (tab === 'adaptacion') setFilters({ ...filters, nombre: val });
    };

    const handleSelect3 = (id: string) => {
        const item = data3.find(i => (i.id_ser || i.id_saber || i.id_hacer || i.id_adaptacion_evaluacion)?.toString() === id);
        if (item) onSelectItem(item);
    };

    const val1 = filters.categoria || filters.nivel || filters.condicion || '';
    const val2 = filters.subcategoria || filters.subnivel || '';
    const val3 = filters.nombre || filters.verbo || filters.verbo_saber || '';

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lvl 1 */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Filter className="w-3 h-3 text-slate-400" />
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{labels[0]}</label>
                </div>
                <div className="relative group">
                    <select
                        value={val1}
                        onChange={(e) => handleSelect1(e.target.value)}
                        className="w-full bg-slate-50/50 hover:bg-white border-2 border-slate-100 hover:border-slate-200 rounded-2xl px-5 py-3 text-xs font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-slate-100 transition-all outline-none h-14 appearance-none"
                    >
                        <option value="">Selecciona...</option>
                        {data1.map((v, idx) => <option key={`${v}-${idx}`} value={v}>{v}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
                        <Layers className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Lvl 2 */}
            <div className={`space-y-3 transition-all duration-500 ${!val1 ? 'opacity-30 blur-[1px] pointer-events-none translate-y-1' : 'opacity-100'}`}>
                <div className="flex items-center gap-2 px-1">
                    <Search className="w-3 h-3 text-slate-400" />
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{labels[1] || 'Filtros'}</label>
                </div>
                {labels[1] ? (
                    <div className="relative group">
                        <select
                            value={val2}
                            onChange={(e) => handleSelect2(e.target.value)}
                            className="w-full bg-slate-50/50 hover:bg-white border-2 border-slate-100 hover:border-slate-200 rounded-2xl px-5 py-3 text-xs font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-slate-100 transition-all outline-none h-14 appearance-none"
                        >
                            <option value="">Selecciona...</option>
                            {data2.map((v, idx) => <option key={`${v}-${idx}`} value={v}>{v}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <Filter className="w-4 h-4" />
                        </div>
                    </div>
                ) : (
                    <div className="h-14 bg-slate-50/30 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        No aplica
                    </div>
                )}
            </div>

            {/* Lvl 3 */}
            <div className={`space-y-3 transition-all duration-500 ${(!val1 || (labels[1] && !val2)) ? 'opacity-30 blur-[1px] pointer-events-none translate-y-1' : 'opacity-100'}`}>
                <div className="flex items-center gap-2 px-1">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{labels[2]}</label>
                </div>
                <div className="relative group">
                    <select
                        value={val3}
                        onChange={(e) => handleSelect3(e.target.value)}
                        className="w-full bg-blue-50/30 hover:bg-white border-2 border-blue-100 hover:border-blue-200 rounded-2xl px-5 py-3 text-xs font-black text-blue-900 shadow-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none h-14 appearance-none"
                    >
                        <option value="">Selecciona un criterio...</option>
                        {data3.map((i, idx) => {
                            const id = i.id_ser ?? i.id_saber ?? i.id_hacer ?? i.id_adaptacion_evaluacion ?? `item-${idx}`;
                            const label = i.nombre_ser || i.verbo_saber || i.verbo || i.nombre_adaptacion;
                            return <option key={id} value={id}>{label}</option>;
                        })}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};
