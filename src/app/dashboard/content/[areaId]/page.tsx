'use client';

import React, { useEffect, useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { ContentService } from '@/services/content.service';
import { AreasService } from '@/services/areas.service';
import { MaterialContenido, AreaTrabajo } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, Trash2, ArrowLeft, FolderOpen, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function AreaContentsPage() {
    const params = useParams();
    const areaId = params.areaId as string;
    const router = useRouter();
    const { profile } = useProfile();
    
    const [area, setArea] = useState<AreaTrabajo | null>(null);
    const [contents, setContents] = useState<MaterialContenido[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (profile?.id && areaId) {
            loadData();
        }
    }, [profile?.id, areaId]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (areaId === 'unassigned') {
                setArea(null);
            } else {
                // 1. Fetch all areas to find the specific one
                const areasRes = await AreasService.getAreas(profile!.id);
                if (areasRes.success && areasRes.data) {
                    const foundArea = areasRes.data.find(a => a.id === areaId);
                    if (foundArea) {
                        setArea(foundArea);
                    } else {
                        // Area not found, fallback safely without throwing router errors during init
                        setArea(null);
                        setLoading(false);
                        return;
                    }
                }
            }

            // 2. Fetch contents and filter by area
            const allContents = await ContentService.getTeacherContents(profile!.id);
            if (areaId === 'unassigned') {
                setContents(allContents.filter(c => !c.area_trabajo_id));
            } else {
                setContents(allContents.filter(c => c.area_trabajo_id === areaId));
            }
            
        } catch (error) {
            console.error("Error loading area contents:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (content: MaterialContenido) => {
        if (!profile) return;
        setActionLoading(`download-${content.id}`);
        try {
            const { exportMarkdownToWord } = await import('@/lib/markdownExport.service');
            await exportMarkdownToWord(
                content.cuerpo_contenido,
                `${profile.nombres} ${profile.apellidos}`,
                content.titulo_tema
            );
        } catch (error) {
            console.error("Error exporting:", error);
            alert("Error al descargar el archivo Word.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (content: MaterialContenido) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar el material "${content.titulo_tema}"?`)) return;
        
        setActionLoading(`delete-${content.id}`);
        try {
            await ContentService.deleteContent(content.id);
            setContents(prev => prev.filter(c => c.id !== content.id));
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Error al eliminar el contenido.");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="p-8 max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                    <div className="text-slate-400 font-medium">Cargando materiales...</div>
                </div>
            </div>
        );
    }

    if (!area && areaId !== 'unassigned') {
        return (
            <div className="p-8 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-20 h-20 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                    <FolderOpen className="text-slate-300 size-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Área no encontrada</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                    El área de trabajo que intentas buscar no existe o no tienes acceso.
                </p>
                <Link href="/dashboard/content">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-glow-indigo">
                        Volver a mis Áreas
                    </Button>
                </Link>
            </div>
        );
    }

    const isUnassigned = areaId === 'unassigned';
    const areaName = isUnassigned ? 'Otros Contenidos' : (area?.area_conocimiento?.nombre || 'Área de Trabajo');
    const gradeName = isUnassigned ? 'Sin Área Asignada' : (area?.area_conocimiento?.grado?.nombre ? `${area.area_conocimiento.grado.nombre} de ${area.area_conocimiento.grado.nivel?.nombre}` : '');

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                
                <div className="relative z-10 space-y-4">
                    <Link href="/dashboard/content" prefetch={false} className="inline-flex items-center gap-2 text-indigo-200 hover:text-white transition-colors text-sm font-semibold mb-2">
                        <ArrowLeft className="size-4" />
                        Volver a las Áreas
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <BookOpen className="text-indigo-400 size-8" />
                            {areaName}
                        </h1>
                        <p className="text-indigo-200/80 font-medium text-sm mt-2">
                            {gradeName} • {area?.unidad_educativa?.nombre}
                        </p>
                    </div>
                </div>
                
                <Link href={`/dashboard/content/new?areaId=${areaId}`} prefetch={false} className="relative z-10 w-full md:w-auto mt-4 md:mt-0">
                    <Button className="w-full bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl h-12 px-6 font-bold shadow-lg transition-all hover:scale-105 active:scale-95 group">
                        <span className="material-symbols-rounded mr-2 text-indigo-600 group-hover:rotate-90 transition-transform">add</span>
                        Nuevo Contenido
                    </Button>
                </Link>
            </div>

            {/* List */}
            {contents.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                        <FolderOpen className="text-slate-300 size-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No hay materiales para esta área</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                        Comienza a generar contenido teórico adaptado a este curso usando la IA.
                    </p>
                    <Link href={`/dashboard/content/new?areaId=${areaId}`} prefetch={false}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-glow-indigo">
                            Generar material
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contents.map((content) => (
                        <Card key={content.id} className="flex flex-col overflow-hidden border-slate-200/60 shadow-soft hover:shadow-lg transition-all hover:-translate-y-1 bg-white group">
                            <div className="p-6 flex-1 space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-rounded">description</span>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                                        {new Date(content.created_at || '').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                
                                <div>
                                    <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight mb-1" title={content.titulo_tema}>
                                        {content.titulo_tema}
                                    </h3>
                                </div>

                                {content.config_usada && (
                                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md truncate max-w-full">
                                            Estructura: {content.config_usada.estructura?.split(' ')[0] || 'Personalizada'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 border-t border-slate-100 bg-slate-50/50">
                                <button 
                                    onClick={() => handleDownload(content)}
                                    disabled={actionLoading === `download-${content.id}`}
                                    className="p-3 flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors border-r border-slate-100"
                                >
                                    {actionLoading === `download-${content.id}` ? (
                                        <span className="material-symbols-rounded animate-spin text-[18px]">sync</span>
                                    ) : (
                                        <>
                                            <Download className="size-4" />
                                            Word
                                        </>
                                    )}
                                </button>
                                <button 
                                    onClick={() => handleDelete(content)}
                                    disabled={actionLoading === `delete-${content.id}`}
                                    className="p-3 flex items-center justify-center gap-2 text-sm font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
                                >
                                    {actionLoading === `delete-${content.id}` ? (
                                        <span className="material-symbols-rounded animate-spin text-[18px]">sync</span>
                                    ) : (
                                        <>
                                            <Trash2 className="size-4" />
                                            Eliminar
                                        </>
                                    )}
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
