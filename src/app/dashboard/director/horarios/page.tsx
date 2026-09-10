'use client';

import React, { useState, useEffect } from 'react';
import { InstitucionalService } from '@/services/institucional.service';
import { useAuth } from '@/hooks/useAuth';
import { Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function DirectorDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [horarios, setHorarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (user) {
                loadData();
            } else {
                setLoading(false);
            }
        }
    }, [user, authLoading]);

    const loadData = async () => {
        try {
            setLoading(true);
            const { data: ueId, success: ueSuccess } = await InstitucionalService.getMiUnidadEducativa(user!.id);
            if (!ueSuccess || !ueId) {
                toast.error("No se encontró su unidad educativa");
                setLoading(false);
                return;
            }


            const horData = await InstitucionalService.getHorariosGenerales(ueId);

            if (horData.success) setHorarios(horData.data);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };


    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-medium">Cargando panel de dirección...</div>;

    // Procesar horarios unificados
    const todosLosHorarios = horarios.map(h => ({
        profesor: `${h.perfiles?.nombres} ${h.perfiles?.apellidos}`,
        profesor_id: h.profesor_id,
        materia: h.nombre,
        bloques: h.area_trabajo_paralelo?.flatMap((atp: any) => {
            const hor = atp.horario || {};
            const paralelo = atp.paralelo?.nombre || '?';
            return Object.entries(hor).flatMap(([dia, periodos]: [string, any]) => 
                periodos.map((p: any) => ({ dia, inicio: p.inicio, fin: p.fin, paralelo }))
            );
        }) || []
    }));

    return (
        <div className="max-w-6xl mx-auto p-6 animate-in fade-in zoom-in-95 duration-500 pb-24 flex gap-6 relative">
            
            <div className="flex-1 transition-all duration-300">
                <div className="mb-8">
                    <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold mb-6 text-sm bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl shadow-sm w-fit">
                        <ArrowLeft className="size-4" /> Volver al Dashboard
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dirección General</h1>
                    <p className="text-slate-500 mt-2 font-medium">Supervisa el personal, currículums y horarios de tu institución.</p>
                </div>

                <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm">
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Clock className="size-5 text-emerald-500"/> Horarios Unificados</h2>
                    <div className="space-y-6">
                        {todosLosHorarios.map((h, i) => (
                            <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                <h3 className="font-bold text-slate-800 text-lg mb-1">{h.materia}</h3>
                                <p className="text-sm font-medium text-slate-500 mb-4">Docente: {h.profesor}</p>
                                <div className="flex flex-wrap gap-2">
                                    {h.bloques.length > 0 ? (
                                        h.bloques.map((b: any, bi: number) => (
                                            <div key={bi} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold flex items-center gap-2">
                                                <span className="bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded text-xs">P. {b.paralelo}</span>
                                                <span className="capitalize">{b.dia}</span> 
                                                <span className="opacity-50">|</span> 
                                                <span>{b.inicio} - {b.fin}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm font-medium text-slate-400 italic">No se han configurado horas para esta materia.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {todosLosHorarios.length === 0 && (
                            <p className="text-slate-400 font-medium">No hay horarios registrados en el sistema.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
