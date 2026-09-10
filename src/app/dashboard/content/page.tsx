'use client';

import React, { useEffect, useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { AreasService } from '@/services/areas.service';
import { ContentService } from '@/services/content.service';
import { AreaTrabajo, MaterialContenido } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkles, Folder, FolderOpen, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ContentAreasPage() {
    const { profile } = useProfile();
    const [areas, setAreas] = useState<AreaTrabajo[]>([]);
    const [contentCounts, setContentCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile?.id) {
            loadData();
        }
    }, [profile?.id]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch both areas and contents in parallel
            const [areasRes, contentsData] = await Promise.all([
                AreasService.getAreas(profile!.id),
                ContentService.getTeacherContents(profile!.id)
            ]);

            if (areasRes.success && areasRes.data) {
                setAreas(areasRes.data);
                
                // Count contents per area
                const counts: Record<string, number> = {};
                areasRes.data.forEach(a => counts[a.id] = 0);
                
                contentsData.forEach(c => {
                    if (c.area_trabajo_id) {
                        counts[c.area_trabajo_id] = (counts[c.area_trabajo_id] || 0) + 1;
                    } else {
                        counts['unassigned'] = (counts['unassigned'] || 0) + 1;
                    }
                });
                setContentCounts(counts);
            }
        } catch (error) {
            console.error("Error loading areas/contents:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                    <div className="text-slate-400 font-medium">Cargando tus áreas...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10 space-y-2">
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Sparkles className="text-indigo-400 size-10" />
                        Generación de Materiales
                    </h1>
                    <p className="text-indigo-200/80 font-medium max-w-xl text-sm">
                        Selecciona un Área de Trabajo para ver o generar nuevos contenidos teóricos para tus estudiantes.
                    </p>
                </div>
                
                <Link href="/dashboard/content/new" prefetch={false} className="relative z-10 w-full md:w-auto">
                    <Button className="w-full bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl h-12 px-6 font-bold shadow-lg transition-all hover:scale-105 active:scale-95 group">
                        <span className="material-symbols-rounded mr-2 text-indigo-600 group-hover:rotate-90 transition-transform">add</span>
                        Nuevo Contenido
                    </Button>
                </Link>
            </div>

            {/* List */}
            {areas.length === 0 && (!contentCounts['unassigned'] || contentCounts['unassigned'] === 0) ? (
                <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                        <FolderOpen className="text-slate-300 size-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No tienes Áreas de Trabajo</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                        Primero debes configurar tus Áreas de Trabajo para poder organizar tus contenidos generados.
                    </p>
                    <Link href="/dashboard/areas" prefetch={false}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-glow-indigo">
                            Ir a Áreas de Trabajo
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {areas.map((area) => (
                        <Link key={area.id} href={`/dashboard/content/${area.id}`} prefetch={false}>
                            <Card className="flex flex-col overflow-hidden border-slate-200/60 shadow-soft hover:shadow-lg transition-all hover:-translate-y-1 hover:border-indigo-200 bg-white group h-full cursor-pointer">
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shrink-0 group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
                                            <Folder className="size-6" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                            {contentCounts[area.id] || 0} Materiales
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">
                                            {area.area_conocimiento?.nombre || 'Área sin nombre'}
                                        </h3>
                                        <p className="text-sm font-medium text-slate-500">
                                            {area.area_conocimiento?.grado?.nombre} de {area.area_conocimiento?.grado?.nivel?.nombre}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100">
                                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md truncate max-w-full">
                                            {area.unidad_educativa?.nombre || 'Sin Unidad'}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 flex justify-between items-center px-6 border-t border-slate-100 group-hover:bg-indigo-50/50 transition-colors">
                                    <span className="text-xs font-bold text-indigo-600">Ver contenidos</span>
                                    <ChevronRight className="size-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Card>
                        </Link>
                    ))}
                    
                    {contentCounts['unassigned'] > 0 && (
                        <Link href={`/dashboard/content/unassigned`} prefetch={false}>
                            <Card className="flex flex-col overflow-hidden border-slate-200/60 shadow-soft hover:shadow-lg transition-all hover:-translate-y-1 hover:border-slate-300 bg-white group h-full cursor-pointer opacity-80 hover:opacity-100">
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="p-3 bg-slate-100 rounded-2xl text-slate-500 shrink-0 group-hover:scale-110 group-hover:bg-slate-200 transition-all">
                                            <Folder className="size-6" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                            {contentCounts['unassigned']} Materiales
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-bold text-slate-700 text-lg leading-tight mb-1">
                                            Otros Contenidos
                                        </h3>
                                        <p className="text-sm font-medium text-slate-500">
                                            Sin área de trabajo asignada
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 flex justify-between items-center px-6 border-t border-slate-100 group-hover:bg-slate-100 transition-colors">
                                    <span className="text-xs font-bold text-slate-600">Ver contenidos</span>
                                    <ChevronRight className="size-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Card>
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
