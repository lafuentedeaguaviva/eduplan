'use client';

import { useEffect, useState, useCallback } from 'react';
import { PdcRevisionesService, PdcRevision } from '@/services/pdc-revisiones.service';
import { AuthService } from '@/services/auth.service';
import { TeacherRevisionCanvas } from '@/components/pdcs/TeacherRevisionCanvas';
import { toast } from 'sonner';

export default function RevisionsPage() {
    const [revisions, setRevisions] = useState<PdcRevision[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await AuthService.getSession();
            const userId = data?.session?.user?.id;
            
            if (!userId) {
                setError('No se pudo encontrar la sesión del usuario.');
                return;
            }

            const revs = await PdcRevisionesService.getTeacherSubmissions(userId);
            setRevisions(revs || []);
        } catch (err: any) {
            console.error('Error loading revisions:', err);
            const msg = err.message || 'Hubo un problema al cargar tus envíos.';
            setError(msg);
            toast.error("Error de carga", { description: msg });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (error) {
        return (
            <div className="p-12 text-center space-y-4">
                <div className="size-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                    <span className="material-symbols-rounded text-4xl">error</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">Error al cargar</h2>
                <p className="text-slate-500 max-w-md mx-auto">{error}</p>
                <button 
                    onClick={loadData}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* ─── HEADER ─── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Central de Seguimiento</p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Gestión de Envíos</h1>
                        {!isLoading && (
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                                {revisions.length} {revisions.length === 1 ? 'Envío' : 'Envíos'}
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 font-medium text-sm mt-1">Control de flujo oficial y seguimiento de tus planificaciones enviadas.</p>
                </div>
            </div>

            {/* ─── CONTENT ─── */}
            <div className="space-y-10">
                <TeacherRevisionCanvas 
                    revisions={revisions} 
                    isLoading={isLoading} 
                    onRefresh={loadData}
                />
            </div>
        </div>
    );
}
