'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/contexts/ProfileContext';
import { InstitucionalService } from '@/services/institucional.service';
import { Button } from '@/components/ui/Button';
import { Gavel, Plus, Edit, Trash, Download, FileText, Briefcase, ExternalLink, Package } from 'lucide-react';
import { toast } from 'sonner';
import { ResourceModal } from './components/ResourceModal';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function InstitucionalDashboard() {
    const { user } = useAuth();
    const { profile } = useProfile();
    const [loading, setLoading] = useState(true);
    const [resources, setResources] = useState<any[]>([]);
    const [unidadId, setUnidadId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'normativa' | 'bien'>('normativa');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<any>(null);

    const canEdit = profile?.roles?.includes('Secretario') || profile?.roles?.includes('Administrador');

    useEffect(() => {
        if (user && profile) {
            loadInitialData();
        }
    }, [user, profile]);

    const loadInitialData = async () => {
        setLoading(true);
        // Obtener la unidad educativa del usuario
        const ueRes = await InstitucionalService.getMiUnidadEducativa(user!.id);
        if (ueRes.success && ueRes.data) {
            setUnidadId(ueRes.data);
            await loadResources(ueRes.data);
        } else {
            toast.error("No se pudo cargar la unidad educativa.");
        }
        setLoading(false);
    };

    const loadResources = async (id: number) => {
        const res = await InstitucionalService.getRecursosInstitucionales(id);
        if (res.success) {
            setResources(res.data || []);
        }
    };

    const handleOpenModal = (resource: any = null) => {
        setEditingResource(resource);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingResource(null);
    };

    const handleSaveResource = async (formData: any) => {
        if (!unidadId) return;

        // formData already has titulo_nombre, tipo, archivo_url, etc. from ResourceModal
        const dataToSave: any = {
            ...formData,
            unidad_educativa_id: unidadId,
            creado_por: user!.id,
        };
        
        if (editingResource?.id) {
            dataToSave.id = editingResource.id;
        }

        const res = await InstitucionalService.upsertRecursoInstitucional(dataToSave);
        if (res.success) {
            toast.success("Recurso guardado correctamente.");
            handleCloseModal();
            loadResources(unidadId);
        } else {
            toast.error("Error al guardar el recurso.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este recurso?")) return;
        
        const res = await InstitucionalService.deleteRecursoInstitucional(id);
        if (res.success) {
            toast.success("Recurso eliminado.");
            if (unidadId) loadResources(unidadId);
        } else {
            toast.error("Error al eliminar.");
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                    <div className="size-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="font-medium">Cargando panel...</p>
                </div>
            </div>
        );
    }

    const normativas = resources.filter(r => r.tipo === 'normativa');
    const bienes = resources.filter(r => r.tipo === 'bien');

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-8 animate-in fade-in zoom-in-95 duration-500 pb-24">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                            <Briefcase className="size-5" />
                        </div>
                        Recursos Institucionales
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        Normativas institucionales y el inventario de bienes de la unidad educativa.
                    </p>
                </div>
                
                {canEdit && (
                    <Button 
                        onClick={() => handleOpenModal()} 
                        className={cn(
                            "font-bold rounded-xl h-12 px-6 mt-4 md:mt-0 shadow-lg transition-colors text-white",
                            activeTab === 'normativa' 
                                ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200" 
                                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                        )}
                    >
                        <Plus className="size-4 mr-2" />
                        {activeTab === 'normativa' ? 'Añadir Normativa' : 'Añadir Ítem al Inventario'}
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-indigo-100 transition-colors">
                    <div className="size-16 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Gavel className="size-8 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Total Normativas</p>
                        <p className="text-4xl font-black text-slate-800 tracking-tighter">{normativas.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-emerald-100 transition-colors">
                    <div className="size-16 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Package className="size-8 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Total Ítems de Inventario</p>
                        <p className="text-4xl font-black text-slate-800 tracking-tighter">{bienes.length}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-8 bg-slate-100/50 p-1.5 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('normativa')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                        activeTab === 'normativa'
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <Gavel className="size-4" /> Normativas
                </button>
                <button
                    onClick={() => setActiveTab('bien')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                        activeTab === 'bien'
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    <Package className="size-4" /> Inventario
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeTab === 'normativa' ? normativas : bienes).map(item => (
                    <div key={item.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group relative">
                        {canEdit && (
                            <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(item)} className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                    <Edit className="size-4" />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                                    <Trash className="size-4" />
                                </button>
                            </div>
                        )}
                        
                        <div className={`size-12 rounded-2xl flex items-center justify-center mb-6 ${activeTab === 'normativa' ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'}`}>
                            {activeTab === 'normativa' ? <FileText className="size-6" /> : <Package className="size-6" />}
                        </div>
                        
                        <h3 className="text-lg font-black text-slate-800 leading-tight mb-2 pr-16">{item.titulo_nombre}</h3>
                        
                        {item.descripcion && (
                            <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-6">{item.descripcion}</p>
                        )}
                        
                        {!item.descripcion && <div className="h-6 mb-6" />}

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {activeTab === 'normativa' ? 'Añadido el' : 'Estado'}
                                </p>
                                {activeTab === 'normativa' ? (
                                    <p className="text-xs font-bold text-slate-700">
                                        {format(new Date(item.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                                    </p>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "text-xs font-bold px-2 py-1 rounded-lg",
                                            item.estado_bien === 'Bueno' ? "bg-emerald-50 text-emerald-600" :
                                            item.estado_bien === 'Regular' ? "bg-amber-50 text-amber-600" :
                                            "bg-rose-50 text-rose-600"
                                        )}>
                                            {item.estado_bien}
                                        </span>
                                        <span className="text-xs font-black text-slate-400 uppercase">
                                            Cant: {item.cantidad}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            {activeTab === 'normativa' && item.archivo_url && (
                                <a 
                                    href={item.archivo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="size-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors"
                                >
                                    <ExternalLink className="size-4" />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
                
                {(activeTab === 'normativa' ? normativas : bienes).length === 0 && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                        <div className={`size-16 rounded-2xl flex items-center justify-center mb-4 ${activeTab === 'normativa' ? 'bg-indigo-100/50 text-indigo-400' : 'bg-emerald-100/50 text-emerald-400'}`}>
                            {activeTab === 'normativa' ? <Gavel className="size-8" /> : <Package className="size-8" />}
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mb-2">No hay registros</h3>
                        <p className="text-sm font-medium text-slate-500 max-w-sm text-center">
                            No se han añadido {activeTab === 'normativa' ? 'normativas' : 'ítems de inventario'} todavía. {canEdit ? 'Utiliza el botón de arriba para comenzar.' : ''}
                        </p>
                    </div>
                )}
            </div>

            <ResourceModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveResource}
                initialData={editingResource}
                tipo={activeTab}
            />
        </div>
    );
}
