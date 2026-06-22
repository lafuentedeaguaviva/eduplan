'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAdminController } from '@/hooks/useAdminController';
import { db } from '@/lib/database';
import { AiOptimizationService } from '@/services/aiOptimization.service';
import { toast } from 'sonner';

export default function PromptSimulatorPage() {
    const router = useRouter();
    const { checkAccess, loading } = useAdminController();
    
    const [recentPdcs, setRecentPdcs] = useState<any[]>([]);
    const [selectedPdc, setSelectedPdc] = useState<string>('');
    const [selectedAreaTrabajo, setSelectedAreaTrabajo] = useState<string>('');
    
    const [tone, setTone] = useState('Formal');
    const [depth, setDepth] = useState('Media');
    
    const [simulation, setSimulation] = useState<any>(null);
    const [simulating, setSimulating] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const hasAccess = await checkAccess();
            if (hasAccess) {
                await loadRecentPdcs();
            }
            setPageLoading(false);
        };
        init();
    }, []);

    const loadRecentPdcs = async () => {
        try {
            // Fetch top 20 recent PDC designs with context
            const { data, error } = await db.from('pdcs_area_trabajo')
                .select(`
                    id,
                    created_at,
                    pdc_id,
                    pdcs ( nombre_pdc, gestion, trimestre ),
                    areas_trabajo (
                        id,
                        areas_conocimiento ( nombre, grados (nombre) )
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setRecentPdcs(data || []);
        } catch (e: any) {
            toast.error('Error al cargar PDCs recientes', { description: e.message });
        }
    };

    const handleSimulate = async () => {
        if (!selectedPdc || !selectedAreaTrabajo) {
            toast.error('Selecciona un PDC para simular');
            return;
        }

        setSimulating(true);
        try {
            const preview = await AiOptimizationService.getCompiledPromptsForPreview(selectedPdc, selectedAreaTrabajo, tone, depth);
            setSimulation(preview);
            toast.success('Simulación completada con éxito');
        } catch (e: any) {
            toast.error('Error en simulación', { description: e.message });
        } finally {
            setSimulating(false);
        }
    };

    if (pageLoading) return null;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/admin')} className="size-12 rounded-2xl bg-white shadow-soft border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all group">
                        <span className="material-symbols-rounded text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all">arrow_back</span>
                    </button>
                    <div>
                        <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100 mb-2">
                            AI Debugger
                        </Badge>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic">Simulador de Prompts</h1>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Panel de Control */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-8 border-none shadow-premium bg-white">
                        <h3 className="text-lg font-black text-slate-900 mb-6">Configuración del Test</h3>
                        
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">PDC Objetivo</label>
                                <select 
                                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:border-fuchsia-500 outline-none cursor-pointer"
                                    value={selectedPdc}
                                    onChange={(e) => {
                                        setSelectedPdc(e.target.value);
                                        const found = recentPdcs.find(p => p.id === e.target.value);
                                        setSelectedAreaTrabajo(found?.areas_trabajo?.id || '');
                                        setSimulation(null);
                                    }}
                                >
                                    <option value="">Selecciona un PDC reciente...</option>
                                    {recentPdcs.map(pdc => {
                                        const area = pdc.areas_trabajo?.areas_conocimiento?.nombre || 'Área Desconocida';
                                        const grado = pdc.areas_trabajo?.areas_conocimiento?.grados?.nombre || '';
                                        const name = pdc.pdcs?.nombre_pdc || 'Sin Nombre';
                                        return (
                                            <option key={pdc.id} value={pdc.id}>
                                                {name} - {area} ({grado})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tono de Redacción</label>
                                <select 
                                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:border-fuchsia-500 outline-none cursor-pointer"
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                >
                                    <option value="Formal">Formal Académico</option>
                                    <option value="Empático">Empático e Inclusivo</option>
                                    <option value="Técnico">Técnico Normativo</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profundidad</label>
                                <select 
                                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:border-fuchsia-500 outline-none cursor-pointer"
                                    value={depth}
                                    onChange={(e) => setDepth(e.target.value)}
                                >
                                    <option value="Básica">Básica (Corrección Menor)</option>
                                    <option value="Media">Media (Mejora de Cohesión)</option>
                                    <option value="Profunda">Profunda (Reestructuración)</option>
                                </select>
                            </div>

                            <Button 
                                className="w-full mt-4 bg-slate-900 text-white h-14 rounded-xl font-black gap-2 shadow-xl shadow-slate-200 hover:bg-slate-800"
                                onClick={handleSimulate}
                                isLoading={simulating}
                            >
                                <span className="material-symbols-rounded">play_arrow</span>
                                Generar Payload
                            </Button>
                        </div>
                    </Card>
                    
                    <div className="p-6 rounded-2xl bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-700 text-xs font-medium leading-relaxed">
                        <p className="font-black uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2">
                            <span className="material-symbols-rounded text-sm">science</span>
                            Entorno Seguro
                        </p>
                        Esta simulación <b>NO</b> consume tokens ni modifica la base de datos. Extrae los datos reales del PDC y los inyecta en los Prompts del Sistema para su previsualización.
                    </div>
                </div>

                {/* Área de Visualización */}
                <div className="lg:col-span-2 space-y-6">
                    {!simulation ? (
                        <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
                            <span className="material-symbols-rounded text-6xl text-slate-300 mb-4">terminal</span>
                            <h3 className="text-xl font-black text-slate-500 mb-2">Esperando Simulación</h3>
                            <p className="text-sm">Selecciona un PDC y haz clic en "Generar Payload" para ver la radiografía de los prompts.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            
                            {/* Objetivos Estratégicos */}
                            {simulation.objetivos.length > 0 && (
                                <Card className="p-8 border-none shadow-soft bg-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-2 h-full bg-blue-500" />
                                    <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-rounded text-blue-500">target</span>
                                        Prompts: Objetivos Estratégicos
                                    </h3>
                                    <div className="space-y-4">
                                        {simulation.objetivos.map((obj: any, idx: number) => (
                                            <div key={idx} className="bg-slate-900 rounded-xl p-6 text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                                                    <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Payload {idx + 1}</span>
                                                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">DeepSeek / Gemini</Badge>
                                                </div>
                                                {obj.prompt}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Criterios Batch */}
                            {simulation.criterios && (
                                <Card className="p-8 border-none shadow-soft bg-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-2 h-full bg-purple-500" />
                                    <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-rounded text-purple-500">checklist</span>
                                        Prompt: Batch Criterios
                                    </h3>
                                    <div className="bg-slate-900 rounded-xl p-6 text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                                            <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Payload Principal</span>
                                            <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10">JSON Esperado</Badge>
                                        </div>
                                        {simulation.criterios.prompt}
                                    </div>
                                </Card>
                            )}

                            {/* Planificación Semanal */}
                            {simulation.semanal.length > 0 && (
                                <Card className="p-8 border-none shadow-soft bg-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-2 h-full bg-cyan-500" />
                                    <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-rounded text-cyan-500">view_week</span>
                                        Prompts: Semanas (Momentos y Recursos)
                                    </h3>
                                    <div className="space-y-6">
                                        {simulation.semanal.map((sem: any, idx: number) => (
                                            <div key={idx} className="bg-slate-900 rounded-xl p-6 text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner border border-slate-800">
                                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                                                    <span className="text-cyan-500 font-black uppercase tracking-widest text-[10px]">Semana {sem.semana}</span>
                                                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10">JSON Esperado</Badge>
                                                </div>
                                                {sem.prompt}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
