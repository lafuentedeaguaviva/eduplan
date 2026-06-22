import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useRef, useEffect } from 'react';
import { PDC } from '@/types';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { PdcService } from '@/services/pdc.service';
import { exportToWord, exportToPDF } from '@/lib/exportService';
import PDFPreview from '../pdcs/PDFPreview';
import { FullReportData } from '@/types';
import { toast } from 'sonner';

interface PdcCardProps {
    pdc: PDC;
    revision?: any;
    onDelete: (id: string) => void;
    onResume?: (id: string, step?: number) => void;
    onSend?: () => void;
}

export function PdcCard({ pdc, revision, onDelete, onResume, onSend }: PdcCardProps) {
    const rawDate = pdc.updated_at || pdc.fecha_inicio || pdc.created_at || new Date().toISOString();
    const startDate = new Date(rawDate);
    const isValidDate = !isNaN(startDate.getTime());

    const areas = pdc.areas_trabajo || [];
    const firstArea = areas[0];
    const fallbackTitle = `PDC ${pdc.trimestre}° Trimestre - Mes ${pdc.mes}`;

    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(pdc.nombre_pdc || fallbackTitle);
    const [displayName, setDisplayName] = useState(pdc.nombre_pdc || fallbackTitle);
    const [saving, setSaving] = useState(false);
    const [exportingWord, setExportingWord] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [fullData, setFullData] = useState<FullReportData | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) inputRef.current?.focus();
    }, [isEditing]);

    const handleSave = async () => {
        if (!editedName.trim()) return;
        setSaving(true);
        try {
            await PdcService.updatePdcMaster(pdc.id, { nombre_pdc: editedName.trim() });
            setDisplayName(editedName.trim());
            setIsEditing(false);
        } catch (e) {
            console.error('Error updating nombre_pdc:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedName(displayName);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') handleCancel();
    };

    const fetchReportData = async () => {
        if (fullData) return fullData;
        const data = await PdcService.getFullReportData(pdc.id);
        if (data) {
            setFullData(data);
            return data;
        }
        return null;
    };

    const handleExportWord = async () => {
        setExportingWord(true);
        try {
            const data = await fetchReportData();
            if (data) {
                await exportToWord(pdc, data);
            }
        } catch (e) {
            console.error('Error exporting Word:', e);
        } finally {
            setExportingWord(false);
        }
    };

    const handleExportPdf = async () => {
        setExportingPdf(true);
        try {
            const data = await fetchReportData();
            if (data) {
                // Wait a bit for PDFPreview to be rendered with data if it was just fetched
                await new Promise(resolve => setTimeout(resolve, 500));
                
                await toast.promise(
                    exportToPDF(`pdc-preview-${pdc.id}`, `PDC_${pdc.nombre_pdc || 'Reporte'}`, 'l'),
                    {
                        loading: 'Generando PDF... por favor espera',
                        success: 'PDF generado correctamente',
                        error: 'Error al generar el PDF'
                    }
                );
            }
        } catch (e) {
            console.error('Error exporting PDF:', e);
        } finally {
            setExportingPdf(false);
        }
    };

    const hasRevision = !!revision;
    const pdcState = (revision?.pdc_estado || '').toLowerCase();
    
    const displayEstado = revision?.pdc_estado ? 
        (pdcState === 'borrador' ? 'Borrador' :
         pdcState === 'finalizado' ? 'Finalizado' : 
         pdcState === 'enviado' ? 'Enviado' :
         pdcState === 'observado' ? 'Observado' :
         pdcState === 'revisado' ? 'Revisado' :
         pdcState === 'aprobado' ? 'Aprobado' :
         pdcState === 'verificado' ? 'Verificado' : revision.pdc_estado) 
        : pdc.estado;

    const isEnviado = pdcState === 'enviado';
    const isAprobado = pdcState === 'aprobado' || pdcState === 'verificado' || pdcState === 'consolidado';
    const isObservado = pdcState === 'observado';
    const isFinalizado = pdcState === 'finalizado' || isEnviado || isAprobado || isObservado || displayEstado === 'Finalizado';
    
    // El maestro puede editar si no está finalizado A MENOS que esté observado (ahí puede corregirlo)
    const canEdit = !isFinalizado || isObservado;
    const canDelete = !isEnviado && !isAprobado && !isObservado;

    return (
        <Card className="flex flex-col md:flex-row gap-6 items-center hover:shadow-medium">
            {/* Date Badge */}
            <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl shrink-0 ${isValidDate ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                {isValidDate ? (
                    <>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">MES</span>
                        <span className="text-2xl font-black">{pdc.mes || '---'}</span>
                    </>
                ) : (
                    <span className="material-symbols-rounded text-2xl">event_busy</span>
                )}
                <span className="text-[10px] font-black opacity-70 mt-1">{pdc.gestion}</span>
            </div>

            {/* Info */}
            <div className="flex-1 w-full text-center md:text-left">
                {isEnviado && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-sky-100 shadow-sm animate-in fade-in zoom-in duration-500">
                        <span className="material-symbols-rounded text-sm">send</span>
                        Enviado al Director
                    </div>
                )}
                {isObservado && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-amber-100 shadow-sm animate-in fade-in zoom-in duration-500">
                        <span className="material-symbols-rounded text-sm">warning</span>
                        Observado - Requiere Corrección
                    </div>
                )}
                {isAprobado && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-100 shadow-sm animate-in fade-in zoom-in duration-500">
                        <span className="material-symbols-rounded text-sm">check_circle</span>
                        Consolidado / Aprobado
                    </div>
                )}
                <div className="flex flex-wrap gap-2 mb-2 justify-center md:justify-start">
                    <Badge variant="default">
                        {firstArea?.unidad_educativa?.nombre || 'Verificando...'}
                    </Badge>
                    <Badge variant="accent">
                        {firstArea?.area_conocimiento?.nombre || 'Verificando...'}
                    </Badge>
                    <Badge
                        variant={
                            displayEstado === 'Verificado' || displayEstado === 'Finalizado'
                                ? 'success'
                                : displayEstado === 'Pendiente'
                                    ? 'warning'
                                    : 'error'
                        }
                    >
                        {displayEstado}
                    </Badge>
                </div>

                {/* Inline editable title */}
                {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                        <input
                            ref={inputRef}
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 text-lg font-bold text-slate-900 border-b-2 border-blue-500 bg-transparent outline-none px-1 py-0.5 rounded-sm"
                        />
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 disabled:opacity-50"
                            title="Guardar nombre"
                        >
                            <span className="material-symbols-rounded text-xl">{saving ? 'hourglass_empty' : 'check_circle'}</span>
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="text-slate-400 hover:text-slate-600"
                            title="Cancelar"
                        >
                            <span className="material-symbols-rounded text-xl">cancel</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 group/title mt-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                            {displayName}
                        </h3>
                        {canEdit && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="opacity-0 group-hover/title:opacity-100 text-slate-300 hover:text-blue-500 transition-opacity"
                                title="Editar nombre del PDC"
                            >
                                <span className="material-symbols-rounded text-base">edit</span>
                            </button>
                        )}
                    </div>
                )}

                <p className="text-sm text-slate-500 line-clamp-1">
                    {areas.length > 1
                        ? `Afecta a ${areas.length} áreas vinculadas`
                        : `${firstArea?.turno?.nombre || 'Turno no especificado'}`}
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-1">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`size-9 p-0 ${exportingPdf ? 'animate-pulse text-blue-600' : isFinalizado ? 'text-slate-400 hover:text-blue-600' : 'text-slate-300 opacity-50'}`} 
                    title={isFinalizado ? "Exportar PDF" : "Debes finalizar el PDC para exportar"}
                    onClick={() => {
                        if (isFinalizado) {
                            handleExportPdf();
                        } else {
                            toast.warning('Aún no disponible', { description: 'Debes finalizar el PDC (Paso 12) para poder exportarlo a PDF.' });
                        }
                    }}
                    disabled={exportingPdf}
                >
                    <span className="material-symbols-rounded">{exportingPdf ? 'hourglass_top' : 'picture_as_pdf'}</span>
                </Button>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`size-9 p-0 ${exportingWord ? 'animate-pulse text-indigo-600' : isFinalizado ? 'text-slate-400 hover:text-indigo-600' : 'text-slate-300 opacity-50'}`} 
                    title={isFinalizado ? "Exportar Word" : "Debes finalizar el PDC para exportar"}
                    onClick={() => {
                        if (isFinalizado) {
                            handleExportWord();
                        } else {
                            toast.warning('Aún no disponible', { description: 'Debes finalizar el PDC (Paso 12) para poder exportarlo a Word.' });
                        }
                    }}
                    disabled={exportingWord}
                >
                    <span className="material-symbols-rounded">{exportingWord ? 'hourglass_top' : 'description'}</span>
                </Button>

                {revision?.pdc_estado === 'Finalizado' && !isEnviado && !isObservado && !isAprobado && (
                    <Button 
                        variant="primary" 
                        size="sm" 
                        className="h-9 px-4 ml-2 gap-2 shadow-glow-blue"
                        onClick={() => onSend?.()}
                        title="Enviar PDC a revisión del Director"
                    >
                        <span className="material-symbols-rounded text-[18px]">send</span>
                        Enviar
                    </Button>
                )}

                {canEdit && (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="size-9 p-0 text-slate-400 hover:text-indigo-600"
                            title="Editar / Continuar"
                            onClick={() => onResume?.(pdc.id)}
                        >
                            <span className="material-symbols-rounded">edit_square</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="size-9 p-0 text-slate-400 hover:text-amber-500"
                            title="Ir a Optimización IA (Paso 11)"
                            onClick={() => {
                                if (pdc.ia_habilitado === 1 || pdc.escritura_tipo_ia || pdc.evaluacion_tipo_ia || pdc.producto_final) {
                                    onResume?.(pdc.id, 11);
                                } else {
                                    toast.warning('Aún no disponible', { description: 'Debes completar el diseño del PDC (Paso 10) antes de usar la Optimización IA.' });
                                }
                            }}
                        >
                            <span className="material-symbols-rounded">auto_awesome</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="size-9 p-0 text-slate-400 hover:text-emerald-600"
                            title="Ir a Configuración Evaluación IA (Paso 12)"
                            onClick={() => {
                                if (pdc.ia_habilitado === 1 || pdc.escritura_tipo_ia || pdc.evaluacion_tipo_ia || pdc.producto_final) {
                                    onResume?.(pdc.id, 12);
                                } else {
                                    toast.warning('Aún no disponible', { description: 'Debes completar el diseño del PDC (Paso 10) antes de configurar la Evaluación IA.' });
                                }
                            }}
                        >
                            <span className="material-symbols-rounded">fact_check</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="size-9 p-0 text-slate-400 hover:text-indigo-600" title="Duplicar">
                            <span className="material-symbols-rounded">content_copy</span>
                        </Button>
                        {canDelete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="size-9 p-0 text-slate-400 hover:text-danger"
                                onClick={() => onDelete(pdc.id)}
                                title="Eliminar"
                            >
                                <span className="material-symbols-rounded">delete</span>
                            </Button>
                        )}
                    </>
                )}
            </div>

            {/* Hidden Preview for PDF Export */}
            {fullData && (
                <PDFPreview 
                    id={`pdc-preview-${pdc.id}`}
                    pdc={pdc}
                    data={fullData}
                />
            )}
        </Card>
    );
}



