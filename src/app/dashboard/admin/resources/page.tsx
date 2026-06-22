'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useAdminController } from '@/hooks/useAdminController';

export default function AdminResourcesPage() {
    const router = useRouter();
    const {
        resourceCategories,
        teacherResources,
        loading,
        saving,
        error: controllerError,
        checkAccess,
        loadResourcesData,
        saveResourceCategory,
        deleteResourceCategory,
        saveTeacherResource,
        deleteTeacherResource
    } = useAdminController();

    const [activeTab, setActiveTab] = useState<'resources' | 'categories'>('resources');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [selectedCatFilter, setSelectedCatFilter] = useState('all');

    useEffect(() => {
        const init = async () => {
            const hasAccess = await checkAccess();
            if (hasAccess) {
                loadResourcesData(selectedCatFilter);
            }
        };
        init();
    }, [selectedCatFilter]);

    const openEdit = (item?: any) => {
        if (item) {
            setEditingItem({ ...item });
        } else {
            if (activeTab === 'categories') {
                setEditingItem({ nombre: '', descripcion: '', icono: 'folder', orden: 0 });
            } else {
                setEditingItem({ titulo: '', descripcion: '', categoria_id: '', url_archivo: '', tipo_archivo: 'PDF', premium: false });
            }
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        let success = false;
        if (activeTab === 'categories') {
            success = await saveResourceCategory(editingItem);
        } else {
            success = await saveTeacherResource(editingItem);
        }

        if (success) {
            setShowModal(false);
            loadResourcesData(selectedCatFilter);
        }
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
                        <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] text-indigo-600 bg-indigo-50 border-indigo-100 mb-2">
                           Biblioteca de Recursos
                        </Badge>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic">Gestión de Materiales</h1>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {activeTab === 'resources' && (
                        <select 
                            value={selectedCatFilter}
                            onChange={(e) => setSelectedCatFilter(e.target.value)}
                            className="px-4 py-3 rounded-xl bg-white border border-slate-100 shadow-soft outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm text-slate-700 appearance-none min-w-[200px]"
                        >
                            <option value="all">Todas las categorías</option>
                            {resourceCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                        </select>
                    )}
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-slate-100 pb-1">
                <button 
                    onClick={() => setActiveTab('resources')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'resources' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Recursos / Archivos
                    {activeTab === 'resources' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 rounded-full animate-in slide-in-from-left-2" />}
                </button>
                <button 
                    onClick={() => setActiveTab('categories')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'categories' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Categorías
                    {activeTab === 'categories' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 rounded-full animate-in slide-in-from-left-2" />}
                </button>
            </div>

            {/* Content Manager */}
            <div className="grid grid-cols-1 gap-8">
                <Card className="p-0 border-none shadow-premium bg-white overflow-hidden min-h-[500px]">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900">
                            {activeTab === 'resources' ? 'Lista de Materiales' : 'Configuración de Categorías'}
                        </h3>
                        <Button 
                            onClick={() => openEdit()}
                            className="rounded-2xl h-14 px-8 font-black bg-slate-900 text-white hover:bg-black gap-2 shadow-xl shadow-slate-200"
                        >
                            <span className="material-symbols-rounded">add_circle</span>
                            Nuevo {activeTab === 'resources' ? 'Recurso' : 'Categoría'}
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Cargando biblioteca...</p>
                        </div>
                    ) : (activeTab === 'resources' ? teacherResources : resourceCategories).length === 0 ? (
                        <div className="p-20 text-center space-y-4">
                            <span className="material-symbols-rounded text-6xl text-slate-100">folder_open</span>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay registros disponibles</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-50">
                                        <th className="p-6">{activeTab === 'resources' ? 'Recurso' : 'Categoría'}</th>
                                        {activeTab === 'resources' && <th className="p-6">Categoría / Tipo</th>}
                                        {activeTab === 'categories' && <th className="p-6">Icono / Orden</th>}
                                        <th className="p-6 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(activeTab === 'resources' ? teacherResources : resourceCategories).map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                        <span className="material-symbols-rounded">{activeTab === 'categories' ? item.icono : 'description'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-slate-900 block">{item.nombre || item.titulo}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold line-clamp-1 max-w-[300px]">{item.descripcion || 'Sin descripción'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            {activeTab === 'resources' && (
                                                <td className="p-6">
                                                    <div className="space-y-1">
                                                        <Badge variant="outline" className="font-black text-[10px] border-indigo-100 text-indigo-600 bg-indigo-50">
                                                            {item.recurso_categorias?.nombre}
                                                        </Badge>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">{item.tipo_archivo} • {item.peso_archivo || 'N/A'}</p>
                                                    </div>
                                                </td>
                                            )}
                                            {activeTab === 'categories' && (
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <Badge className="bg-slate-100 text-slate-600 border-none font-bold">Orden: {item.orden}</Badge>
                                                    </div>
                                                </td>
                                            )}
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button 
                                                        onClick={() => openEdit(item)}
                                                        className="p-3 rounded-xl hover:bg-white hover:shadow-soft text-slate-400 hover:text-blue-600 transition-all"
                                                    >
                                                        <span className="material-symbols-rounded">edit_note</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => activeTab === 'resources' ? deleteTeacherResource(item.id) : deleteResourceCategory(item.id)}
                                                        className="p-3 rounded-xl hover:bg-white hover:shadow-soft text-slate-400 hover:text-rose-600 transition-all"
                                                    >
                                                        <span className="material-symbols-rounded">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            {/* Edit Modal */}
            {showModal && editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-xl p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {editingItem.id ? 'Editar' : 'Nueva'} {activeTab === 'resources' ? 'Recurso' : 'Categoría'}
                                </h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configuración de Biblioteca</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="size-10 rounded-full hover:bg-slate-200 text-slate-400 transition-all flex items-center justify-center">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="p-8 space-y-6">
                                {activeTab === 'categories' ? (
                                    <>
                                        <Input 
                                            label="Nombre de Categoría"
                                            placeholder="Ej: Plantillas PDF"
                                            value={editingItem.nombre}
                                            onChange={(e) => setEditingItem({...editingItem, nombre: e.target.value})}
                                            required
                                        />
                                        <div className="grid grid-cols-2 gap-6">
                                            <Input 
                                                label="Icono (Material Icon)"
                                                placeholder="Ej: folder, gavel, etc."
                                                value={editingItem.icono}
                                                onChange={(e) => setEditingItem({...editingItem, icono: e.target.value})}
                                            />
                                            <Input 
                                                label="Orden Visual"
                                                type="number"
                                                value={editingItem.orden}
                                                onChange={(e) => setEditingItem({...editingItem, orden: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción</label>
                                            <textarea 
                                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all min-h-[100px]"
                                                value={editingItem.descripcion}
                                                onChange={(e) => setEditingItem({...editingItem, descripcion: e.target.value})}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Categoría Padre</label>
                                            <select 
                                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-indigo-500 appearance-none"
                                                value={editingItem.categoria_id}
                                                onChange={(e) => setEditingItem({...editingItem, categoria_id: e.target.value})}
                                                required
                                            >
                                                <option value="">Selecciona categoría...</option>
                                                {resourceCategories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Input 
                                            label="Título del Recurso"
                                            placeholder="Ej: Guía de Planificación 2026"
                                            value={editingItem.titulo}
                                            onChange={(e) => setEditingItem({...editingItem, titulo: e.target.value})}
                                            required
                                        />
                                        <Input 
                                            label="URL del Archivo (Enlace de descarga)"
                                            placeholder="https://drive.google.com/..."
                                            value={editingItem.url_archivo}
                                            onChange={(e) => setEditingItem({...editingItem, url_archivo: e.target.value})}
                                            required
                                        />
                                        <div className="grid grid-cols-2 gap-6">
                                            <Input 
                                                label="Tipo de Archivo"
                                                placeholder="Ej: PDF, XLSX"
                                                value={editingItem.tipo_archivo}
                                                onChange={(e) => setEditingItem({...editingItem, tipo_archivo: e.target.value})}
                                            />
                                            <Input 
                                                label="Peso (Opcional)"
                                                placeholder="Ej: 2.5 MB"
                                                value={editingItem.peso_archivo}
                                                onChange={(e) => setEditingItem({...editingItem, peso_archivo: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl cursor-pointer" 
                                             onClick={() => setEditingItem({...editingItem, premium: !editingItem.premium})}>
                                            <div className={`size-6 rounded-lg border-2 flex items-center justify-center transition-all ${editingItem.premium ? 'bg-amber-500 border-amber-500' : 'border-amber-200'}`}>
                                                {editingItem.premium && <span className="material-symbols-rounded text-white text-[16px]">check</span>}
                                            </div>
                                            <span className="text-sm font-black text-amber-900 uppercase tracking-tight">Solo Usuarios Premium</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                                <Button variant="ghost" type="button" onClick={() => setShowModal(false)} className="px-8 font-black rounded-2xl">
                                    Cancelar
                                </Button>
                                <Button type="submit" isLoading={saving} className="px-10 font-black rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200">
                                    Guardar Cambios
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
