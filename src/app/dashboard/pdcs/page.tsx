'use client';

import { useEffect, useState, useCallback } from 'react';
import { PdcService } from '@/services/pdc.service';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { PdcCard } from '@/components/ui/PdcCard';
import { Skeleton } from '@/components/ui/Atoms';
import { Feedback } from '@/components/ui/feedback';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PDC } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { AlertDialog } from '@/components/ui/AlertDialog';

export default function PDCsPage() {
    const router = useRouter();
    const [pdcs, setPdcs] = useState<PDC[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Delete Confirmation State
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [pdcToDelete, setPdcToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data: sessionData } = await AuthService.getSession();
            const userId = sessionData.session?.user?.id;

            if (!userId) {
                setError('No se pudo encontrar la sesión del usuario.');
                return;
            }

            const res = await PdcService.getPDCs(userId);
            if (res.success && res.data) {
                setPdcs(res.data);
            } else if (res.error) {
                throw res.error;
            }
        } catch (err: any) {
            console.error('Error loading PDCs:', err);
            setError(err.message || 'Hubo un problema al cargar tus planes. Por favor, intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDelete = (id: string) => {
        setPdcToDelete(id);
        setShowDeleteAlert(true);
    };

    const confirmDelete = async () => {
        if (!pdcToDelete) return;
        setIsDeleting(true);
        try {
            const res = await PdcService.deletePDC(pdcToDelete);
            if (!res.success) throw res.error;
            setPdcs(prev => prev.filter(p => p.id !== pdcToDelete));
            setShowDeleteAlert(false);
        } catch (err: any) {
            console.error('Error deleting PDC:', err);
            alert(err.message || 'No se pudo eliminar el plan. Intenta de nuevo.');
        } finally {
            setIsDeleting(false);
            setPdcToDelete(null);
        }
    };

    const handleResume = (id: string) => {
        router.push(`/dashboard/pdcs/new?id=${id}`);
    };

    if (isLoading) return <PdcSkeletonList />;

    if (error) return (
        <Feedback
            title="Error al cargar"
            description={error}
            icon="error"
            onRetry={loadData}
        />
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* ─── HEADER ─── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Mis Documentos</p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Mis PDC</h1>
                        {!isLoading && (
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                                {pdcs.length} {pdcs.length === 1 ? 'Plan' : 'Planes'}
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 font-medium text-sm mt-1">Consulta y gestiona todos tus planes de desarrollo curricular.</p>
                </div>
                <Link href="/dashboard/pdcs/new" className="shrink-0">
                    <Button className="h-12 px-6 rounded-2xl shadow-glow-blue font-black gap-2 hover:scale-105 transition-all duration-300">
                        <span className="material-symbols-rounded text-xl">add</span>
                        Nuevo PDC
                    </Button>
                </Link>
            </div>

            {/* ─── CONTENT ─── */}
            {pdcs.length === 0 ? (
                <div className="py-24 text-center rounded-[3rem] bg-white border-2 border-dashed border-slate-200 shadow-soft">
                    <div className="size-20 bg-slate-50 rounded-[2rem] shadow-soft flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <span className="material-symbols-rounded text-5xl">note_stack</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-700 mb-2 tracking-tight">Aún no tienes PDCs</h3>
                    <p className="text-slate-400 font-medium text-sm mb-8 max-w-xs mx-auto leading-relaxed">
                        Comienza tu primera planificación y organiza tus clases de forma eficiente.
                    </p>
                    <Link href="/dashboard/pdcs/new">
                        <Button className="px-10 h-12 rounded-2xl font-black gap-2">
                            <span className="material-symbols-rounded">add</span>
                            Crear mi primer PDC
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pdcs.map(pdc => (
                        <PdcCard
                            key={pdc.id}
                            pdc={pdc}
                            onDelete={handleDelete}
                            onResume={handleResume}
                        />
                    ))}
                </div>
            )}

            {/* Alerta de Eliminación */}
            <AlertDialog
                isOpen={showDeleteAlert}
                onClose={() => setShowDeleteAlert(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="¿Eliminar este PDC?"
                description="Esta acción es irreversible y se perderán todos los datos cargados en esta planificación."
                confirmText="Eliminar permanentemente"
            />
        </div>
    );
}

function PdcSkeletonList() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-8 w-48 rounded-xl" />
                    <Skeleton className="h-3 w-72" />
                </div>
                <Skeleton className="h-12 w-36 rounded-2xl" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                ))}
            </div>
        </div>
    );
}
