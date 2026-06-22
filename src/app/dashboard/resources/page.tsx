'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAdminController } from '@/hooks/useAdminController';

export default function ResourcesPage() {
    const { 
        resourceCategories: categories, 
        teacherResources: resources, 
        loading, 
        loadResourcesData 
    } = useAdminController();
    
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // En esta página no llamamos a checkAccess porque es para todos los docentes
        loadResourcesData(selectedCategory);
    }, [selectedCategory]);

    const filteredResources = resources.filter(res => {
        const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             res.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-10 space-y-10">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 border border-slate-800 p-10 md:p-16 shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none rotate-12">
                    <span className="material-symbols-rounded text-[200px]">library_books</span>
                </div>
                
                <div className="relative z-10 max-w-3xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <span className="material-symbols-rounded text-sm">auto_awesome</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Biblioteca de Éxito</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none">
                        Recursos <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">Docentes</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed">
                        Explora nuestra colección curada de herramientas, normativas y guías diseñadas para potenciar tu labor pedagógica y ahorrarte horas de trabajo administrativo.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-xl group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-500 group-focus-within:text-indigo-400 transition-colors">search</span>
                        <input 
                            type="text"
                            placeholder="Buscar plantillas, guías, normativas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Categories & Grid */}
            <div className="space-y-8">
                {/* Category Tabs */}
                <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border shrink-0",
                            selectedCategory === 'all'
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/20"
                            : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
                        )}
                    >
                        <span className="material-symbols-rounded text-lg">apps</span>
                        Todos
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border shrink-0",
                                selectedCategory === cat.id
                                ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/20"
                                : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
                            )}
                        >
                            <span className="material-symbols-rounded text-lg">{cat.icono || 'folder'}</span>
                            {cat.nombre}
                        </button>
                    ))}
                </div>

                {/* Resources Grid */}
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Cargando materiales...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResources.map((res) => (
                            <div 
                                key={res.id}
                                className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-500 flex flex-col"
                            >
                                {res.premium && (
                                    <div className="absolute top-6 right-6">
                                        <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                            <span className="material-symbols-rounded text-[14px]">workspace_premium</span>
                                            <span className="text-[9px] font-black uppercase tracking-wider">Premium</span>
                                        </div>
                                    </div>
                                )}

                                <div className="size-14 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                    <span className="material-symbols-rounded text-2xl">
                                        {categories.find(c => c.id === res.categoria_id)?.icono || 'description'}
                                    </span>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                                        {res.titulo}
                                    </h3>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">
                                        {res.descripcion}
                                    </p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Formato</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase">{res.tipo_archivo} {res.peso_archivo && `• ${res.peso_archivo}`}</p>
                                    </div>
                                    <a 
                                        href={res.url_archivo} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="size-12 rounded-2xl bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center border border-indigo-500/20"
                                    >
                                        <span className="material-symbols-rounded">download</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredResources.length === 0 && (
                    <div className="py-20 text-center space-y-4 bg-slate-900/30 rounded-[3rem] border border-slate-800 border-dashed">
                        <span className="material-symbols-rounded text-6xl text-slate-700">search_off</span>
                        <h3 className="text-xl font-bold text-slate-400">No encontramos resultados</h3>
                        <p className="text-slate-500">Prueba con otra categoría o término de búsqueda.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
