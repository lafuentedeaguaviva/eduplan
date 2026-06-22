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
import { PdcRevisionesService, PdcRevision } from '@/services/pdc-revisiones.service';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function PDCsPage() {
    const router = useRouter();
    const [pdcs, setPdcs] = useState<PDC[]>([]);
    const [revisions, setRevisions] = useState<PdcRevision[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRevisionsLoading, setIsRevisionsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Submission Workflow State
    const [selectedPdcForReview, setSelectedPdcForReview] = useState<PDC | null>(null);
    const [snapshotToEdit, setSnapshotToEdit] = useState<any>(null);
    const [isPreparingSnapshot, setIsPreparingSnapshot] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete Confirmation State
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [pdcToDelete, setPdcToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

            const res = await PdcService.getPDCs(userId);
            if (res.success && res.data) {
                setPdcs(res.data);
                setUserId(userId);
                
                // Cargar revisiones también de forma aislada
                try {
                    setIsRevisionsLoading(true);
                    const revs = await PdcRevisionesService.getTeacherSubmissions(userId);
                    setRevisions(revs || []);
                } catch (revErr: any) {
                    console.error('Error loading revisions:', revErr);
                    toast.error("Error en Revisiones", { 
                        description: revErr.message || "No se pudieron cargar las revisiones." 
                    });
                } finally {
                    setIsRevisionsLoading(false);
                }
            } else if (res.error) {
                throw res.error;
            }
        } catch (err: any) {
            console.error('Error loading PDCs:', err);
            const msg = err.message || err.details || 'Hubo un problema al cargar tus planes.';
            setError(msg);
            toast.error("Error de carga", { description: msg });
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

    const handleResume = (id: string, step?: number) => {
        if (step) {
            router.push(`/dashboard/pdcs/new?id=${id}&step=${step}`);
        } else {
            router.push(`/dashboard/pdcs/new?id=${id}`);
        }
    };

    // --- SUBMISSION WORKFLOW LOGIC ---

    const handlePrepareSubmission = (pdc: PDC) => {
        setSelectedPdcForReview(pdc);
        setSnapshotToEdit(null);
    };

    const handleVersionSelect = (mode: 'ia' | 'original') => {
        if (!selectedPdcForReview) return;
        const url = `/dashboard/pdcs/submit/${selectedPdcForReview.id}?mode=${mode}`;
        window.open(url, '_blank');
        setSelectedPdcForReview(null);
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
                    <p className="text-slate-400 font-medium text-sm mb-8 max-w-xs mx-auto leading-relaxed px-10">
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
                    {pdcs.map(pdc => {
                        const revision = revisions.find(r => r.pdc_origen_id === pdc.id);
                        return (
                                <PdcCard
                                    key={pdc.id}
                                    pdc={pdc}
                                    revision={revision}
                                    onDelete={handleDelete}
                                    onResume={handleResume}
                                    onSend={() => router.push('/dashboard/revisions')}
                                />
                        );
                    })}
                </div>
            )}

            {/* ─── MODALES DE FLUJO DE ENVÍO ─── */}
            
            {/* 1. Selector de Versión */}
            {selectedPdcForReview && !snapshotToEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                        <div className="text-center space-y-4 mb-10">
                            <div className="size-20 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-blue-600 mx-auto shadow-sm">
                                <span className="material-symbols-rounded text-5xl">auto_awesome</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">¿Qué versión deseas enviar?</h2>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                Antes de generar el envío, elige la base para tu documento final.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button 
                                onClick={() => handleVersionSelect('ia')}
                                className="group p-8 rounded-[2rem] border-2 border-blue-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left space-y-4 relative overflow-hidden"
                            >
                                <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-rounded text-[80px]">auto_fix_high</span>
                                </div>
                                <div className="size-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                    <span className="material-symbols-rounded">stars</span>
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-xl tracking-tight">Optimizado IA</h3>
                                    <p className="text-slate-500 text-xs font-medium leading-relaxed">Usa las sugerencias pedagógicas y criterios refinados por la IA.</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => handleVersionSelect('original')}
                                className="group p-8 rounded-[2rem] border-2 border-slate-100 hover:border-slate-400 hover:bg-slate-50/50 transition-all text-left space-y-4 relative overflow-hidden"
                            >
                                <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-rounded text-[80px]">history_edu</span>
                                </div>
                                <div className="size-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-800/20">
                                    <span className="material-symbols-rounded">edit_note</span>
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-xl tracking-tight">Original Maestro</h3>
                                    <p className="text-slate-500 text-xs font-medium leading-relaxed">Usa tus datos originales tal como los cargaste en los formularios.</p>
                                </div>
                            </button>
                        </div>

                        <div className="mt-10 flex justify-center">
                            <button 
                                onClick={() => setSelectedPdcForReview(null)}
                                className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                                Cancelar envío
                            </button>
                        </div>
                    </div>
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
                cancelText="Cancelar"
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
