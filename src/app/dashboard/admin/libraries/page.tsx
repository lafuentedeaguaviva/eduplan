'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAdminController } from '@/hooks/useAdminController';

const LIBRARY_TABS = [
    { id: 'biblioteca_teoria', label: 'Teoría', icon: 'menu_book', color: 'blue' },
    { id: 'biblioteca_practica', label: 'Práctica', icon: 'handyman', color: 'rose' },
    { id: 'biblioteca_produccion', label: 'Producción', icon: 'precision_manufacturing', color: 'amber' },
    { id: 'biblioteca_valoracion', label: 'Valoración', icon: 'balance', color: 'emerald' },
    { id: 'biblioteca_recursos', label: 'Recursos', icon: 'category', color: 'indigo' },
    { id: 'biblioteca_adaptaciones_basicas', label: 'Adaptaciones', icon: 'psychology', color: 'purple' },
    { id: 'biblioteca_ser', label: 'Ser', icon: 'favorite', color: 'rose' },
    { id: 'biblioteca_saber', label: 'Saber', icon: 'psychology_alt', color: 'blue' },
    { id: 'biblioteca_hacer', label: 'Hacer', icon: 'rocket_launch', color: 'emerald' },
];

export default function AdminLibrariesPage() {
    const router = useRouter();
    const {
        libraryItems,
        loading,
        saving,
        checkAccess,
        loadLibraryTable,
        saveLibraryItem
    } = useAdminController();

    const [activeTab, setActiveTab] = useState(LIBRARY_TABS[0].id);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            const hasAccess = await checkAccess();
            if (hasAccess) {
                loadLibraryTable(activeTab);
            }
        };
        init();
    }, [activeTab]);

    const activeTabMeta = LIBRARY_TABS.find(t => t.id === activeTab);

    const openEdit = (item?: any) => {
        if (item) {
            setEditingItem({ ...item });
        } else {
            // New item template based on most common fields
            setEditingItem({
                nombre_estrategia_teorica: '', // Fallback for various names
                proposito: '',
                redactado: '',
                ejemplo_inicial: '',
                ejemplo_primaria: '',
                ejemplo_secundaria: '',
                ejemplo_multigrado: ''
            });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        const success = await saveLibraryItem(activeTab, editingItem);
        if (success) {
            setShowModal(false);
            loadLibraryTable(activeTab);
        }
    };

    // Helper to get the main title of a library item (since columns vary)
    const getItemTitle = (item: any) => {
        return item.nombre_estrategia_teorica || 
               item.nombre_practica || 
               item.nombre_produccion || 
               item.categoria || 
               item.recursos || 
               item.nombre_adaptacion || 
               item.nombre_ser || 
               item.verbo_saber || 
               item.verbo || 
               "Elemento sin título";
    };

    const getIdField = (tableName: string) => {
        if (tableName.includes('teoria')) return 'id_teoria';
        if (tableName.includes('practica')) return 'id_practica';
        if (tableName.includes('produccion')) return 'id_produccion';
        if (tableName.includes('valoracion')) return 'id_valoracion';
        if (tableName.includes('recursos')) return 'id_recursos';
        if (tableName.includes('adaptaciones')) return 'id_adaptacion_basica';
        if (tableName.includes('ser')) return 'id_ser';
        if (tableName.includes('saber')) return 'id_saber';
        if (tableName.includes('hacer')) return 'id_hacer';
        return 'id';
    };

    const getTitleField = (tableName: string) => {
        if (tableName.includes('teoria')) return 'nombre_estrategia_teorica';
        if (tableName.includes('practica')) return 'nombre_practica';
        if (tableName.includes('produccion')) return 'nombre_produccion';
        if (tableName.includes('valoracion')) return 'categoria';
        if (tableName.includes('recursos')) return 'recursos';
        if (tableName.includes('adaptaciones')) return 'nombre_adaptacion';
        if (tableName.includes('ser')) return 'nombre_ser';
        if (tableName.includes('saber')) return 'verbo_saber';
        if (tableName.includes('hacer')) return 'verbo';
        return 'titulo';
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/admin')} className="size-12 rounded-2xl bg-white shadow-soft border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all group">
                        <span className="material-symbols-rounded text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all">arrow_back</span>
                    </button>
                    <div>
                        <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] text-purple-600 bg-purple-50 border-purple-100 mb-2">
                           Knowledge Base Management
                        </Badge>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic">Bibliotecas Pedagógicas</h1>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">search</span>
                        <input 
                            type="text" 
                            placeholder="Buscar en biblioteca..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 shadow-soft outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 transition-all w-full md:w-80 font-medium"
                        />
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-2 bg-slate-100 rounded-[2rem] border border-slate-200">
                {LIBRARY_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-3xl font-black text-xs transition-all ${
                            activeTab === tab.id
                            ? 'bg-white shadow-medium text-slate-900 scale-105'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                        }`}
                    >
                        <span className={`material-symbols-rounded text-base text-${tab.color}-500`}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* List Manager */}
            <Card className="p-0 border-none shadow-premium bg-white overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`size-14 rounded-2xl bg-${activeTabMeta?.color}-50 flex items-center justify-center text-${activeTabMeta?.color}-600 shadow-inner`}>
                            <span className="material-symbols-rounded text-3xl font-black">{activeTabMeta?.icon}</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Catálogo: {activeTabMeta?.label}</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{libraryItems.length} Elementos Disponibles</p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => openEdit()}
                        className={`rounded-2xl h-14 px-8 font-black bg-slate-900 text-white hover:bg-black gap-2 shadow-2xl shadow-slate-200 transition-all active:scale-95`}
                    >
                        <span className="material-symbols-rounded">add_circle</span>
                        Nuevo Ejemplo
                    </Button>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Cargando base de datos...</p>
                    </div>
                ) : libraryItems.filter(i => getItemTitle(i).toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                        <div className="size-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                            <span className="material-symbols-rounded text-6xl">search_off</span>
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-slate-900 text-xl">Sin resultados</p>
                            <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm italic">No encontramos elementos en esta biblioteca que coincidan con tu búsqueda.</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {libraryItems
                            .filter(i => getItemTitle(i).toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((item, idx) => (
                            <div key={idx} className="p-8 hover:bg-slate-50/50 transition-all group flex items-start justify-between">
                                <div className="space-y-4 max-w-2xl">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-lg font-black text-slate-900 leading-tight">{getItemTitle(item)}</h4>
                                        {item.dificultad && <Badge variant="outline" className="text-[9px] font-black uppercase">{item.dificultad}</Badge>}
                                    </div>
                                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed font-medium">
                                        {item.redactado || item.descripcion || "Sin descripción redactada."}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold text-[9px] px-3">Inicial: {item.ejemplo_inicial ? '✓' : '—'}</Badge>
                                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[9px] px-3">Primaria: {item.ejemplo_primaria ? '✓' : '—'}</Badge>
                                        <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold text-[9px] px-3">Secundaria: {item.ejemplo_secundaria ? '✓' : '—'}</Badge>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => openEdit(item)}
                                        className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-medium text-slate-400 hover:text-slate-900 transition-all font-black text-xs flex items-center gap-2 group/btn"
                                    >
                                        <span className="material-symbols-rounded text-lg group-hover/btn:rotate-12 transition-transform">edit</span>
                                        Editar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Edit Modal (Generic Form) */}
            {showModal && editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
                    <Card className="w-full max-w-4xl max-h-[90vh] p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
                        <div className={`p-8 border-b border-slate-50 flex justify-between items-center bg-${activeTabMeta?.color}-50/30`}>
                            <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-2xl bg-white shadow-soft flex items-center justify-center text-${activeTabMeta?.color}-600`}>
                                    <span className="material-symbols-rounded text-2xl font-black">{activeTabMeta?.icon}</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Editar Elemento de {activeTabMeta?.label}</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Configuración de Base de Conocimiento</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="size-12 rounded-full hover:bg-white text-slate-400 transition-all flex items-center justify-center shadow-soft">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>
                        
                        <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                            {/* Dynamic Principal Field */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Título / Nombre Principal</label>
                                <input 
                                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-black text-slate-900 outline-none focus:border-slate-900 transition-all"
                                    placeholder="Nombre del componente pedagógico..."
                                    value={editingItem[getTitleField(activeTab)] || ''}
                                    onChange={(e) => setEditingItem({...editingItem, [getTitleField(activeTab)]: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Propósito / Categoría</label>
                                    <input 
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-slate-900 transition-all"
                                        value={editingItem.proposito || editingItem.categoria || ''}
                                        onChange={(e) => setEditingItem({...editingItem, proposito: e.target.value, categoria: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Dificultad / Nivel de Detalle</label>
                                    <select 
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-slate-900 appearance-none"
                                        value={editingItem.dificultad || ''}
                                        onChange={(e) => setEditingItem({...editingItem, dificultad: e.target.value})}
                                    >
                                        <option value="">No aplica</option>
                                        <option value="Básico">Básico</option>
                                        <option value="Intermedio">Intermedio</option>
                                        <option value="Avanzado">Avanzado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Redactado Maestro (Lo que ve el docente)</label>
                                <textarea 
                                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-medium text-slate-700 outline-none focus:border-slate-900 transition-all resize-none min-h-[140px] leading-relaxed italic"
                                    placeholder="Escribe el texto sugerido que la IA proporcionará..."
                                    value={editingItem.redactado || ''}
                                    onChange={(e) => setEditingItem({...editingItem, redactado: e.target.value})}
                                />
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <p className="text-xs font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="material-symbols-rounded text-lg text-purple-600">tips_and_updates</span>
                                    Ejemplos Diferenciados por Nivel
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {['inicial', 'primaria', 'secundaria', 'multigrado'].map(nivel => (
                                        <div key={nivel} className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ejemplo {nivel}</label>
                                            <textarea 
                                                className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-medium text-slate-600 outline-none focus:border-slate-400 transition-all resize-none h-32"
                                                value={editingItem[`ejemplo_${nivel}`] || ''}
                                                onChange={(e) => setEditingItem({...editingItem, [`ejemplo_${nivel}`]: e.target.value})}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3 text-slate-400 text-xs italic font-medium">
                                <span className="material-symbols-rounded">security</span>
                                Los cambios afectarán todas las futuras planificaciones.
                            </div>
                            <div className="flex gap-4">
                                <Button variant="ghost" onClick={() => setShowModal(false)} className="px-8 font-black rounded-2xl text-white hover:bg-white/10">
                                    Descartar
                                </Button>
                                <Button onClick={handleSave} isLoading={saving} className="px-12 font-black rounded-2xl bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/5">
                                    Sincronizar Biblioteca
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
