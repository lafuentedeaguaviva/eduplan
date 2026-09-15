'use client';

import React, { useState } from 'react';
import { PdcRevision, PdcRevisionesService } from '@/services/pdc-revisiones.service';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Clock,
    AlertCircle,
    CheckCircle2,
    Eye,
    Edit3,
    ArrowRight,
    Search,
    Filter
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { RevisionFormEditor } from './viewer/RevisionFormEditor';

interface TeacherRevisionCanvasProps {
    revisions: PdcRevision[];
    isLoading: boolean;
    onRefresh: () => void;
}

type TabType = 'listo' | 'enviado' | 'observado' | 'revisado';

export function TeacherRevisionCanvas({ revisions, isLoading, onRefresh }: TeacherRevisionCanvasProps) {
    const [activeTab, setActiveTab] = useState<TabType>('listo');
    const [isSending, setIsSending] = useState<string | null>(null);
    const [editingRevision, setEditingRevision] = useState<any | null>(null);
    const [previewDirector, setPreviewDirector] = useState<{ id: string, nombre: string, revisionId: string } | null>(null);

    const getTabForRevision = (rev: PdcRevision) => {
        const pdcState = (rev.pdc_estado || '').toLowerCase();
        
        if (pdcState === 'borrador' || pdcState === 'finalizado') return 'listo';
        if (pdcState === 'enviado') return 'enviado';
        if (pdcState === 'observado') return 'observado';
        
        return 'revisado'; // Para Verificado, Aprobado, Consolidado
    };

    const filteredRevisions = revisions.filter(rev => getTabForRevision(rev) === activeTab);

    const handlePreviewSend = async (revisionId: string) => {
        const rev = revisions.find(r => r.id === revisionId);
        if (!rev) return;

        setIsSending(revisionId);
        try {
            const dir = await PdcRevisionesService.previewDirector(rev.pdc_origen_id, rev.nivel);
            setPreviewDirector({ id: dir.id, nombre: dir.nombre, revisionId });
        } catch (error: any) {
            toast.error("Error al buscar director", { description: error.message });
        } finally {
            setIsSending(null);
        }
    };

    const confirmSendToDirector = async () => {
        if (!previewDirector) return;
        const currentRevId = previewDirector.revisionId;
        setPreviewDirector(null);
        setIsSending(currentRevId);
        try {
            await PdcRevisionesService.sendToDirector(currentRevId);
            toast.success("¡PDC Enviado!", {
                description: "Tu planificación ha sido enviada al Director para su revisión."
            });
            onRefresh();
        } catch (error: any) {
            toast.error("Error al enviar", {
                description: error.message
            });
        } finally {
            setIsSending(null);
        }
    };

    const tabs = [
        { id: 'listo', label: 'Bandeja de Salida', icon: Send, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { id: 'enviado', label: 'En Revisión', icon: Clock, color: 'text-sky-500', bg: 'bg-sky-50' },
        { id: 'observado', label: 'Acción Requerida', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 'revisado', label: 'PDCs Aprobados', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    if (isLoading) return <CanvasSkeleton />;

    return (
        <div className="space-y-8">
            {/* ─── TAB NAVIGATION (CANVAS STYLE) ─── */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/50 backdrop-blur-md rounded-[2rem] border border-slate-200/50 w-fit">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const count = revisions.filter(r => getTabForRevision(r) === tab.id).length;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as TabType);
                                setEditingRevision(null);
                            }}
                            className={cn(
                                "relative px-6 py-3 rounded-2xl flex items-center gap-3 transition-all duration-500",
                                isActive ? "bg-white shadow-xl shadow-slate-200/50 text-slate-900" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <tab.icon className={cn("size-5", isActive ? tab.color : "text-slate-400")} />
                            <span className="text-sm font-black tracking-tight">{tab.label}</span>
                            {count > 0 && (
                                <span className={cn(
                                    "size-5 rounded-full flex items-center justify-center text-[10px] font-black",
                                    isActive ? tab.bg + " " + tab.color : "bg-slate-200 text-slate-500"
                                )}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ─── CONTENT GRID O EDITOR ─── */}
            <div className="min-h-[400px]">
                {editingRevision ? (
                    <RevisionFormEditor 
                        key={editingRevision.id}
                        revision={editingRevision} 
                        onBack={() => setEditingRevision(null)}
                        onSaveSuccess={() => {
                            setEditingRevision(null);
                            onRefresh();
                        }}
                        onProgressSaved={() => onRefresh()}
                    />
                ) : (
                    <AnimatePresence mode="wait">
                        {filteredRevisions.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                            >
                                <div className="size-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
                                    <Search className="size-12" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tighter">Sin documentos aquí</h3>
                                    <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">
                                        No hay PDCs en estado "{tabs.find(t => t.id === activeTab)?.label}" por el momento.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                            >
                                {filteredRevisions.map((rev) => (
                                    <RevisionCard
                                        key={rev.id}
                                        rev={rev}
                                        onSend={handlePreviewSend}
                                        isSending={isSending === rev.id}
                                        onEdit={() => setEditingRevision(rev)}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Diálogo de Confirmación */}
            <Dialog open={!!previewDirector} onOpenChange={(open) => !open && setPreviewDirector(null)}>
                <DialogContent className="rounded-[2.5rem] border-none shadow-premium p-0 overflow-hidden max-w-[400px]">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white relative">
                        <DialogHeader className="relative z-10">
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Confirmar Envío</DialogTitle>
                            <DialogDescription className="text-indigo-50 font-medium text-sm leading-relaxed mt-2">
                                Has seleccionado enviar tu PDC.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6 bg-white">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="size-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                                <Send className="size-6" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Director Destinatario</p>
                            <p className="text-xl font-black text-slate-900">{previewDirector?.nombre}</p>
                            <p className="text-xs text-slate-500 font-medium mt-2">
                                Una vez enviado, no podrás editarlo hasta que el director te lo devuelva.
                            </p>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-3">
                            <Button variant="ghost" onClick={() => setPreviewDirector(null)} className="w-full sm:w-auto rounded-2xl font-black uppercase text-[10px]">
                                Cancelar
                            </Button>
                            <Button onClick={confirmSendToDirector} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-[10px]">
                                Sí, Enviar
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function RevisionCard({ rev, onSend, isSending, onEdit }: { rev: PdcRevision, onSend: (id: string) => void, isSending: boolean, onEdit: () => void }) {
    const pdcState = (rev.pdc_estado || '').toLowerCase();
    const isReadyToSend = pdcState === 'borrador' || pdcState === 'finalizado';
    const isSent = pdcState === 'enviado';
    const isObserved = pdcState === 'observado';

    const formattedDate = rev.created_at ? format(new Date(rev.created_at), "PPP", { locale: es }) : 'N/A';

    return (
        <div className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-soft hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 relative overflow-hidden">
            {/* Ambient background light */}
            <div className={cn(
                "absolute -top-10 -right-10 size-40 blur-[80px] opacity-10 transition-opacity group-hover:opacity-20",
                isReadyToSend ? "bg-indigo-500" :
                    isSent ? "bg-sky-500" :
                        isObserved ? "bg-amber-500" : "bg-emerald-500"
            )} />

            <div className="relative space-y-6">
                {/* Header: Title & Version */}
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter leading-none uppercase">
                                {rev.materia || 'PDC Sin Título'}
                            </h3>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black uppercase rounded-lg border border-slate-200/50">
                                v{rev.version}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                            {rev.nivel} • {rev.grado}
                        </p>
                    </div>

                    <div className={cn(
                        "px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                        pdcState === 'finalizado' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        pdcState === 'borrador' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                            isSent ? "bg-sky-50 text-sky-600 border-sky-100" :
                                isObserved ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                        {pdcState === 'finalizado' ? 'Finalizado' :
                        pdcState === 'borrador' ? 'Borrador' :
                            isSent ? 'En Revisión' :
                                isObserved ? 'Observado' : 'Aprobado'}
                    </div>
                </div>

                {/* Body: Meta info */}
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div className="flex items-center gap-2">
                        <Clock className="size-4 text-slate-300" />
                        <span>{formattedDate}</span>
                    </div>
                </div>

                {/* Footer: Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex gap-2">
                        <Button 
                            onClick={onEdit}
                            variant="ghost" 
                            size="sm" 
                            className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 text-slate-500 hover:bg-slate-50"
                        >
                            <Eye className="size-4" />
                            Ver Reporte
                        </Button>
                        {isObserved && (
                            <Link href={`/dashboard/pdcs/new?id=${rev.pdc_origen_id}`}>
                                <Button className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20">
                                    <Edit3 className="size-4" />
                                    Corregir
                                </Button>
                            </Link>
                        )}
                    </div>

                    {isReadyToSend && (
                        <Button
                            onClick={() => onSend(rev.id)}
                            isLoading={isSending}
                            className="h-12 px-8 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 group-hover:scale-105 transition-transform"
                        >
                            Enviar al Director
                            <ArrowRight className="size-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function CanvasSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex gap-2 h-14 w-full max-w-2xl bg-slate-100 rounded-[2rem]" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-64 bg-slate-50 rounded-[2.5rem] border border-slate-100" />
                ))}
            </div>
        </div>
    );
}
