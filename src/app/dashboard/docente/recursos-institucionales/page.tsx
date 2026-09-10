'use client';

import React, { useState, useEffect } from 'react';
import { RecursosInstitucionalesService, RecursoInstitucional } from '@/services/recursos_institucionales.service';
import { InstitucionalService } from '@/services/institucional.service';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Archive, ExternalLink } from 'lucide-react';

export default function RecursosInstitucionalesPage() {
    const { user } = useAuth();
    const [unidadEducativaId, setUnidadEducativaId] = useState<number | null>(null);
    const [normativas, setNormativas] = useState<RecursoInstitucional[]>([]);
    const [bienes, setBienes] = useState<RecursoInstitucional[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadRecursos();
        }
    }, [user]);

    const loadRecursos = async () => {
        setLoading(true);
        const { data: ueId, success: ueSuccess } = await InstitucionalService.getMiUnidadEducativa(user!.id);
        if (!ueSuccess || !ueId) {
            setLoading(false);
            return;
        }
        setUnidadEducativaId(ueId);

        const [normData, bienesData] = await Promise.all([
            RecursosInstitucionalesService.getRecursosPorEscuela(ueId, 'normativa'),
            RecursosInstitucionalesService.getRecursosPorEscuela(ueId, 'bien')
        ]);
        
        if (normData.success) setNormativas(normData.data);
        if (bienesData.success) setBienes(bienesData.data);
        setLoading(false);
    };

    if (loading) {
        return <div className="p-8 text-slate-500 animate-pulse font-medium">Cargando recursos institucionales...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6 animate-in fade-in zoom-in-95 duration-500 pb-24">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recursos de la Institución</h1>
                <p className="text-slate-500 mt-2 font-medium">Consulta las normativas vigentes y el inventario de bienes disponibles.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                
                {/* Normativas */}
                <div className="space-y-4">
                    <h2 className="text-xl font-black text-indigo-900 flex items-center gap-2 mb-4">
                        <FileText className="size-6 text-indigo-500" /> Normativas Básicas
                    </h2>
                    
                    {normativas.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-sm">
                            No hay normativas publicadas por secretaría.
                        </div>
                    ) : (
                        normativas.map(n => (
                            <div key={n.id} className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm hover:border-indigo-200 transition-colors">
                                <h3 className="font-bold text-slate-800 text-lg">{n.titulo_nombre}</h3>
                                {n.descripcion && <p className="text-slate-500 text-sm mt-2">{n.descripcion}</p>}
                                {n.archivo_url && (
                                    <a 
                                        href={n.archivo_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-4 text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                    >
                                        <ExternalLink className="size-4" /> Ver Documento Oficial
                                    </a>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Bienes / Inventario */}
                <div className="space-y-4">
                    <h2 className="text-xl font-black text-emerald-900 flex items-center gap-2 mb-4">
                        <Archive className="size-6 text-emerald-500" /> Inventario de Bienes
                    </h2>
                    
                    {bienes.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-sm">
                            No hay bienes registrados en el inventario.
                        </div>
                    ) : (
                        bienes.map(b => (
                            <div key={b.id} className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">{b.titulo_nombre}</h3>
                                    {b.descripcion && <p className="text-slate-500 text-sm mt-1">{b.descripcion}</p>}
                                    <div className="flex gap-3 mt-3">
                                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">
                                            Estado: {b.estado_bien || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-center bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl min-w-[80px]">
                                    <div className="text-2xl font-black">{b.cantidad || 0}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider">Unidades</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}
